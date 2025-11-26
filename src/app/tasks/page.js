'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FaTwitter, FaWallet, FaSpinner, FaCheckCircle, FaTelegram, 
  FaExternalLinkAlt, FaRetweet, FaComment, FaThumbsUp, FaCopy, 
  FaInfoCircle, FaGift, FaCoins, FaChartLine, 
  FaTrophy, FaFire, FaShare, FaCheckDouble, FaEye
} from 'react-icons/fa';
import { TbTarget } from 'react-icons/tb';
import { BiCoin, BiData, BiShield } from 'react-icons/bi';
import { HiSparkles } from 'react-icons/hi';

// Storage Configuration
const STORAGE_KEY = 'alfredo-task-center';
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || '0x...';

// Clean Theme
const theme = {
  primary: '#FF8C00',
  secondary: '#FFB347',
  success: '#4CD964',
  error: '#FF453A',
  warning: '#FFCC00',
  info: '#5E5CE6',
  background: '#0D0A07',
  cardBg: '#1A120C',
  border: '#2A1E14',
  text: '#F5F5F5',
  textSecondary: '#A9A9B1'
};

// Smooth animations without bounce
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" }
};

const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: "easeOut" }
};

// Storage Utilities
const getStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const initStorage = () => {
  const defaults = {
    wallet: {
      address: '',
      isConnected: false,
      balance: '0',
      receivedWelcomeBonus: false,
      lastConnected: null
    },
    tasks: {},
    stats: {
      totalEarned: 0,
      tasksCompleted: 0,
      currentStreak: 0,
      lastCompletedDate: null
    },
    achievements: [],
    notifications: []
  };

  const existing = getStorage();
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }
  return existing;
};

const updateStorage = (updates) => {
  const current = getStorage() || initStorage();
  const newData = { ...current, ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  return newData;
};

// Wallet Hook (same logic as before)
const useWallet = () => {
  const [wallet, setWallet] = useState({
    address: null,
    provider: null,
    signer: null,
    isConnecting: false,
    isConnected: false,
    balance: '0',
    tokenBalance: '0',
    error: null,
    isInitialized: false
  });

  const [welcomeBonusStatus, setWelcomeBonusStatus] = useState({
    sending: false,
    sent: false,
    txHash: null
  });

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = `https://metamask.app.link/dapp/${window.location.host}`;
        return;
      }
      alert('🔥 Please install MetaMask extension to start earning AFRD tokens!');
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const ethersModule = await import('ethers');
      const ethers = ethersModule.default || ethersModule;

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x38' }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x38',
              chainName: 'BNB Smart Chain',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18
              },
              rpcUrls: ['https://bsc-dataseed1.binance.org/'],
              blockExplorerUrls: ['https://bscscan.com/'],
            }],
          });
        }
      }

      let provider, signer, balance = '0';
      if (ethers.BrowserProvider) {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        try {
          const rawBalance = await provider.getBalance(accounts[0]);
          balance = ethers.formatEther(rawBalance);
        } catch (err) {
          console.warn('Balance fetch failed:', err);
        }
      } else if (ethers.providers) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        try {
          const rawBalance = await provider.getBalance(accounts[0]);
          balance = ethers.utils.formatEther(rawBalance);
        } catch (err) {
          console.warn('Balance fetch failed:', err);
        }
      } else {
        throw new Error('Ethers library not properly loaded');
      }

      setWallet({
        address: accounts[0],
        provider,
        signer,
        isConnecting: false,
        isConnected: true,
        balance,
        tokenBalance: '0',
        error: null,
        isInitialized: true
      });

      const savedData = getStorage();
      const receivedBonus = savedData?.wallet?.receivedWelcomeBonus || false;

      updateStorage({
        wallet: {
          address: accounts[0],
          isConnected: true,
          balance,
          receivedWelcomeBonus: receivedBonus,
          lastConnected: Date.now()
        }
      });

      if (!receivedBonus) {
        await sendWelcomeBonus(accounts[0], signer);
      }

    } catch (error) {
      console.error('Connection failed:', error);
      setWallet(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message,
        isInitialized: true
      }));
    }
  }, []);

  const sendWelcomeBonus = async (address, signer) => {
    setWelcomeBonusStatus({ sending: true, sent: false, txHash: null });

    try {
      const nonce = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const message = `Welcome to Alfredo!\nAddress: ${address}\nNonce: ${nonce}\nExpiry: ${expiry}`;

      const signature = await signer.signMessage(message);

      const response = await fetch('/api/reward', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          message,
          signature,
          nonce,
          expiry,
          reward: 10,
          isWelcomeBonus: true
        })
      });

      const data = await response.json();

      if (data.success) {
        setWelcomeBonusStatus({
          sending: false,
          sent: true,
          txHash: data.txHash
        });

        updateStorage({
          wallet: {
            ...getStorage().wallet,
            receivedWelcomeBonus: true
          },
          stats: {
            totalEarned: 10,
            tasksCompleted: 0,
            currentStreak: 0,
            lastCompletedDate: null
          }
        });
      }
    } catch (error) {
      console.error('Welcome bonus error:', error);
      setWelcomeBonusStatus({ sending: false, sent: false, txHash: null });
    }
  };

  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      provider: null,
      signer: null,
      isConnecting: false,
      isConnected: false,
      balance: '0',
      tokenBalance: '0',
      error: null,
      isInitialized: true
    });

    const current = getStorage();
    updateStorage({
      wallet: {
        ...current.wallet,
        isConnected: false,
        address: ''
      }
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const reconnect = async () => {
      try {
        const saved = getStorage();
        if (saved?.wallet?.isConnected && saved.wallet.address && window.ethereum) {
          const isRecent = saved.wallet.lastConnected && 
            (Date.now() - saved.wallet.lastConnected) < 24 * 60 * 60 * 1000;

          if (isRecent) {
            const ethersModule = await import('ethers');
            const ethers = ethersModule.default || ethersModule;

            const accounts = await window.ethereum.request({ method: 'eth_accounts' });

            if (accounts.length > 0 && 
                accounts[0].toLowerCase() === saved.wallet.address.toLowerCase()) {
              
              let provider, signer, balance = saved.wallet.balance;
              
              if (ethers.BrowserProvider) {
                provider = new ethers.BrowserProvider(window.ethereum);
                signer = await provider.getSigner();
                try {
                  const rawBalance = await provider.getBalance(accounts[0]);
                  balance = ethers.formatEther(rawBalance);
                } catch (err) {
                  console.warn('Balance update failed');
                }
              } else if (ethers.providers) {
                provider = new ethers.providers.Web3Provider(window.ethereum);
                signer = provider.getSigner();
                try {
                  const rawBalance = await provider.getBalance(accounts[0]);
                  balance = ethers.utils.formatEther(rawBalance);
                } catch (err) {
                  console.warn('Balance update failed');
                }
              }

              if (isMounted) {
                setWallet({
                  address: accounts[0],
                  provider,
                  signer,
                  isConnecting: false,
                  isConnected: true,
                  balance,
                  tokenBalance: '0',
                  error: null,
                  isInitialized: true
                });
              }
              return;
            }
          }
        }

        if (isMounted) {
          setWallet(prev => ({ ...prev, isInitialized: true }));
        }
      } catch (error) {
        if (isMounted) {
          setWallet(prev => ({ ...prev, isInitialized: true }));
        }
      }
    };

    reconnect();

    return () => {
      isMounted = false;
    };
  }, []);

  return { ...wallet, connectWallet, disconnect, welcomeBonusStatus };
};

// Main Component
export default function AlfredoTaskCenter() {
  const wallet = useWallet();
  const [tasks, setTasks] = useState({});
  const [processingTask, setProcessingTask] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showTokenInfo, setShowTokenInfo] = useState(false);

  const taskDefinitions = useMemo(() => ({
    followX: {
      id: 'followX',
      title: 'Follow on X',
      description: 'Follow @AI_UR_Alfredo on X for portfolio insights',
      reward: 100,
      icon: FaTwitter,
      action: 'https://x.com/AI_UR_Alfredo',
      type: 'social',
      difficulty: 'easy'
    },
    likeX: {
      id: 'likeX',
      title: 'Like Post on X',
      description: 'Like our latest post about crypto portfolio analysis',
      reward: 50,
      icon: FaThumbsUp,
      action: 'https://x.com/AI_UR_Alfredo',
      type: 'social',
      difficulty: 'easy'
    },
    commentX: {
      id: 'commentX',
      title: 'Comment on X',
      description: 'Share your portfolio analysis experience',
      reward: 75,
      icon: FaComment,
      action: 'https://x.com/AI_UR_Alfredo',
      type: 'social',
      difficulty: 'medium'
    },
    retweetX: {
      id: 'retweetX',
      title: 'Retweet',
      description: 'Help us spread the word about smart portfolio management',
      reward: 60,
      icon: FaRetweet,
      action: 'https://x.com/AI_UR_Alfredo/status/1991318393442734394?s=20',
      type: 'social',
      difficulty: 'easy'
    },
    joinTelegram: {
      id: 'joinTelegram',
      title: 'Join Telegram',
      description: 'Join our portfolio analysis community on Telegram',
      reward: 80,
      icon: FaTelegram,
      action: 'https://t.me/AI_UR_Alfredo',
      type: 'social',
      difficulty: 'easy'
    },
    shareX: {
      id: 'shareX',
      title: 'Share with Friends',
      description: 'Share Alfredo with your network',
      reward: 90,
      icon: FaShare,
      action: 'https://twitter.com/intent/tweet?text=Check%20out%20Alfredo%20-%20AI-powered%20crypto%20portfolio%20analysis!',
      type: 'social',
      difficulty: 'medium'
    }
  }), []);

  useEffect(() => {
    const saved = getStorage();
    if (saved?.tasks) {
      setTasks(saved.tasks);
    }
  }, []);

  const stats = useMemo(() => {
    const saved = getStorage();
    const completed = Object.values(tasks).filter(t => t.completed).length;
    const total = Object.keys(taskDefinitions).length;
    const earned = saved?.stats?.totalEarned || 0;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, earned, progress };
  }, [tasks, taskDefinitions]);

  const completeTask = useCallback(async (taskId) => {
    if (!wallet.isConnected || !wallet.signer) {
      setNotification({
        type: 'error',
        message: 'Please connect your wallet first to earn AFRD!'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const task = taskDefinitions[taskId];
    if (!task || tasks[taskId]?.completed) return;

    if (task.action) {
      window.open(task.action, '_blank', 'noopener,noreferrer');
    }

    setProcessingTask(taskId);

    try {
      const nonce = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const message = `Complete task: ${taskId}\nAddress: ${wallet.address}\nReward: ${task.reward} AFRD\nNonce: ${nonce}\nExpiry: ${expiry}`;

      const signature = await wallet.signer.signMessage(message);

      const response = await fetch('/api/reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          address: wallet.address,
          message,
          signature,
          nonce,
          expiry,
          reward: task.reward
        })
      });

      const data = await response.json();

      if (data.success) {
        const newTasks = {
          ...tasks,
          [taskId]: {
            completed: true,
            reward: task.reward,
            txHash: data.txHash,
            timestamp: Date.now()
          }
        };

        setTasks(newTasks);

        const saved = getStorage();
        updateStorage({
          tasks: newTasks,
          stats: {
            totalEarned: saved.stats.totalEarned + task.reward,
            tasksCompleted: saved.stats.tasksCompleted + 1,
            currentStreak: saved.stats.currentStreak + 1,
            lastCompletedDate: Date.now()
          }
        });

        setNotification({
          type: 'success',
          message: `+${task.reward} AFRD earned!`,
          txHash: data.txHash
        });

        setTimeout(() => setNotification(null), 5000);
      } else {
        throw new Error(data.error || 'Transaction failed');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Failed: ${error.message}`
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setProcessingTask(null);
    }
  }, [wallet, tasks, taskDefinitions]);

  const addTokenToMetaMask = useCallback(async () => {
    if (!window.ethereum) {
      setNotification({
        type: 'error',
        message: 'MetaMask not detected. Please install MetaMask extension.'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: TOKEN_CONTRACT,
            symbol: 'AFRD',
            decimals: 18,
            image: 'https://your-domain.com/alfredo-logo.png'
          }
        }
      });

      if (wasAdded) {
        setNotification({
          type: 'success',
          message: 'AFRD token added to MetaMask successfully!'
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Failed to add token:', error);
      setNotification({
        type: 'error',
        message: 'Failed to add token. Please try again.'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setNotification({
      type: 'success',
      message: 'Copied to clipboard!'
    });
    setTimeout(() => setNotification(null), 2000);
  };

  if (!wallet.isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <HiSparkles size={48} style={{ color: theme.primary }} />
          </motion.div>
          <p className="text-white text-lg font-medium">Loading Task Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background, color: theme.text }}>
      {/* Clean Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4"
          >
            <div
              className="rounded-2xl p-4 backdrop-blur-md flex items-start gap-3"
              style={{
                backgroundColor: notification.type === 'success' ? `${theme.success}20` : `${theme.error}20`,
                border: `1px solid ${notification.type === 'success' ? theme.success : theme.error}`,
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
              }}
            >
              {notification.type === 'success' ? (
                <FaCheckCircle size={20} style={{ color: theme.success }} />
              ) : (
                <FaInfoCircle size={20} style={{ color: theme.error }} />
              )}
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{notification.message}</p>
                {notification.txHash && (
                  <a
                    href={`https://bscscan.com/tx/${notification.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs flex items-center gap-1 mt-1 hover:underline"
                    style={{ color: theme.primary }}
                  >
                    View on BscScan <FaExternalLinkAlt size={10} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Bonus Modals */}
      <AnimatePresence>
        {wallet.welcomeBonusStatus.sending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl p-8 max-w-sm w-full text-center"
              style={{ 
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-4"
              >
                <HiSparkles size={56} style={{ color: theme.primary }} />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Processing Welcome Bonus</h3>
              <p style={{ color: theme.textSecondary }}>Sending 10 AFRD to your wallet...</p>
            </motion.div>
          </motion.div>
        )}

        {wallet.welcomeBonusStatus.sent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl p-8 max-w-sm w-full text-center"
              style={{ 
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`
              }}
            >
              <FaGift size={56} style={{ color: theme.success }} className="mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Welcome to Alfredo!</h3>
              <p className="text-xl font-bold mb-4" style={{ color: theme.success }}>+10 AFRD received!</p>
              {wallet.welcomeBonusStatus.txHash && (
                <a
                  href={`https://bscscan.com/tx/${wallet.welcomeBonusStatus.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm flex items-center justify-center gap-2 mb-4 hover:underline"
                  style={{ color: theme.primary }}
                >
                  <FaEye /> View Transaction <FaExternalLinkAlt size={12} />
                </a>
              )}
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 rounded-xl font-semibold text-white"
                style={{ backgroundColor: theme.primary }}
              >
                Start Earning More
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Clean Header */}
        <motion.div {...fadeIn} className="text-center mb-12">
          <h1 className="text-3xl heading sm:text-5xl font-bold text-white mb-3">Task Center</h1>
          <p style={{ color: theme.textSecondary }} className="text-lg text-balance">
            Complete tasks and earn AFRD tokens on BSC
          </p>
        </motion.div>

        {/* Wallet Connection */}
        {!wallet.isConnected ? (
          <motion.div 
            {...fadeIn}
            className="rounded-2xl p-8 text-center mb-12"
            style={{ 
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`
            }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
              style={{ backgroundColor: `${theme.primary}20` }}
            >
              <FaWallet size={40} style={{ color: theme.primary }} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 heading">Connect Your Wallet</h2>
            <p style={{ color: theme.textSecondary }} className="mb-6 text-balance max-w-md mx-auto">
              Connect MetaMask to start earning. New users receive 10 tokens instantly!
            </p>
            <button
              onClick={wallet.connectWallet}
              disabled={wallet.isConnecting}
              className="px-8 py-4 rounded-xl font-semibold text-white inline-flex items-center gap-3 disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: theme.primary }}
            >
              {wallet.isConnecting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <FaWallet />
                  Connect MetaMask
                </>
              )}
            </button>
            {wallet.error && (
              <p className="mt-4 text-sm" style={{ color: theme.error }}>
                {wallet.error}
              </p>
            )}
          </motion.div>
        ) : (
          <>
            {/* Wallet Info Grid */}
            <motion.div {...slideIn} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { icon: FaWallet, label: 'Address', value: `${wallet.address?.slice(0, 6)}...${wallet.address?.slice(-4)}`, action: () => copyToClipboard(wallet.address) },
                { icon: BiCoin, label: 'BNB', value: parseFloat(wallet.balance).toFixed(4) },
                { icon: BiShield, label: 'Network', value: 'BSC' },
                { icon: FaWallet, label: 'Status', value: 'Connected', action: wallet.disconnect }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon size={16} style={{ color: theme.primary }} />
                    <span className="text-xs" style={{ color: theme.textSecondary }}>{item.label}</span>
                  </div>
                  <p className="text-white font-semibold text-sm mb-2">{item.value}</p>
                  {item.action && (
                    <button
                      onClick={item.action}
                      className="text-xs hover:underline"
                      style={{ color: theme.primary }}
                    >
                      {item.label === 'Address' ? 'Copy' : 'Disconnect'}
                    </button>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Stats Grid */}
            <motion.div {...fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {[
                { icon: FaCheckCircle, label: 'Completed', value: `${stats.completed}/${stats.total}`, color: theme.success },
                { icon: FaCoins, label: 'Earned', value: stats.earned, suffix: 'AFRD', color: theme.primary },
                { icon: FaChartLine, label: 'Progress', value: `${Math.round(stats.progress)}%`, color: theme.info },
                { icon: FaFire, label: 'Streak', value: getStorage()?.stats?.currentStreak || 0, color: theme.error }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  className="rounded-xl p-5 text-center"
                  style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <stat.icon size={24} style={{ color: stat.color }} />
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                    {stat.suffix && <span className="text-sm ml-1" style={{ color: theme.textSecondary }}>{stat.suffix}</span>}
                  </p>
                  <p className="text-xs" style={{ color: theme.textSecondary }}>{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Tasks List */}
            <div className="space-y-4 mb-12">
              <h2 className="text-2xl font-bold text-white heading mb-6">Available Tasks</h2>
              {Object.values(taskDefinitions).map((task, index) => {
                const isCompleted = tasks[task.id]?.completed;
                const isProcessing = processingTask === task.id;

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    className={`rounded-xl p-6 ${isCompleted ? 'opacity-60' : ''}`}
                    style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0"
                          style={{ backgroundColor: `${theme.primary}20` }}
                        >
                          <task.icon size={24} style={{ color: theme.primary }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1">{task.title}</h3>
                          <p className="text-sm mb-3" style={{ color: theme.textSecondary }}>{task.description}</p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="px-2 py-1 rounded"
                              style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
                            >
                              {task.type}
                            </span>
                            <span className="px-2 py-1 rounded"
                              style={{ backgroundColor: `${theme.info}15`, color: theme.info }}
                            >
                              {task.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-4">
                        <div className="text-center sm:text-right">
                          <p className="text-2xl font-bold" style={{ color: theme.success }}>+{task.reward}</p>
                          <p className="text-xs" style={{ color: theme.textSecondary }}>AFRD</p>
                        </div>

                        {isCompleted ? (
                          <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                            style={{ backgroundColor: `${theme.success}20`, color: theme.success }}
                          >
                            <FaCheckDouble />
                            Completed
                          </div>
                        ) : (
                          <button
                            onClick={() => completeTask(task.id)}
                            disabled={isProcessing}
                            className="px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50 transition-opacity"
                            style={{ backgroundColor: theme.primary }}
                          >
                            {isProcessing ? <FaSpinner className="animate-spin" /> : 'Complete'}
                          </button>
                        )}
                      </div>
                    </div>

                    {tasks[task.id]?.txHash && (
                      <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
                        <a
                          href={`https://bscscan.com/tx/${tasks[task.id].txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs flex items-center gap-2 hover:underline"
                          style={{ color: theme.primary }}
                        >
                          <FaEye size={12} />
                          View Transaction
                          <FaExternalLinkAlt size={10} />
                        </a>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Completion */}
            {stats.completed === stats.total && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-8 text-center mb-12"
                style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
              >
                <FaTrophy size={64} style={{ color: theme.primary }} className="mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">All Tasks Completed!</h2>
                <p style={{ color: theme.textSecondary }} className="mb-6">You've completed all available tasks!</p>
                <div className="inline-block rounded-xl p-6"
                  style={{ backgroundColor: `${theme.primary}20` }}
                >
                  <p className="text-sm" style={{ color: theme.textSecondary }}>Total Earned</p>
                  <p className="text-4xl font-bold" style={{ color: theme.primary }}>{stats.earned} AFRD</p>
                </div>
              </motion.div>
            )}

            {/* Add Token */}
            <motion.div
              {...fadeIn}
              transition={{ delay: 0.3 }}
              className="rounded-xl p-6"
              style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${theme.primary}20` }}
                    >
                      <BiCoin size={24} style={{ color: theme.primary }} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Add AFRD to MetaMask</h3>
                  </div>
                  <p style={{ color: theme.textSecondary }} className="mb-4">
                    Import the AFRD token to track your balance
                  </p>
                  <div className="rounded-lg p-4 mb-4"
                    style={{ backgroundColor: `${theme.primary}10`, border: `1px solid ${theme.primary}30` }}
                  >
                    <p className="text-xs mb-1" style={{ color: theme.textSecondary }}>Contract</p>
                    <div className="flex items-center gap-2">
                      <code className="text-white text-xs font-mono flex-1 truncate">
                        {TOKEN_CONTRACT?.slice(0, 10)}...{TOKEN_CONTRACT?.slice(-8)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(TOKEN_CONTRACT)}
                        style={{ color: theme.primary }}
                      >
                        <FaCopy size={14} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={addTokenToMetaMask}
                    className="px-6 py-3 rounded-lg font-semibold text-white flex items-center gap-2"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <FaWallet />
                    Add to MetaMask
                  </button>
                </div>

                <button
                  onClick={() => setShowTokenInfo(!showTokenInfo)}
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
                >
                  <FaInfoCircle size={20} />
                </button>
              </div>

              <AnimatePresence>
                {showTokenInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6"
                    style={{ borderTop: `1px solid ${theme.border}` }}
                  >
                    <h4 className="font-semibold text-white mb-4">How to import:</h4>
                    <div className="space-y-3">
                      {[
                        { step: 1, title: 'Open MetaMask', desc: "Ensure you're on BNB Smart Chain" },
                        { step: 2, title: 'Click "Import tokens"', desc: 'At bottom of assets list' },
                        { step: 3, title: 'Paste address', desc: 'Use contract address above' },
                        { step: 4, title: 'Confirm', desc: 'Your balance will appear!' }
                      ].map((item) => (
                        <div key={item.step} className="flex gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm"
                            style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
                          >
                            {item.step}
                          </div>
                          <div>
                            <h5 className="font-medium text-white text-sm">{item.title}</h5>
                            <p className="text-xs" style={{ color: theme.textSecondary }}>{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
