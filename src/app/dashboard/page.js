'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaWallet, FaSpinner, FaCheckCircle, FaTimes, FaCopy,
  FaTwitter, FaTelegram, FaRetweet, FaComment, FaThumbsUp, FaShare,
  FaCoins, FaTrophy, FaFire, FaChartLine, FaNewspaper,
  FaExternalLinkAlt, FaBolt, FaStar
} from 'react-icons/fa';
import CryptoRecommendations from '@/components/CryptoRecommendations';
import NewsTerminal from '@/components/NewsTerminal';

// Storage Configuration
const STORAGE_KEY = 'somnus-app-data';

// Minimal Theme
const theme = {
  bg: 'bg-black',
  card: 'bg-white/5',
  border: 'border-white/10',
  text: 'text-white',
  textSecondary: 'text-gray-400',
  accent: 'bg-white',
  accentHover: 'hover:bg-white/90'
};

// Smooth animations
const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
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
      tasksCompleted: 0
    },
    premium: {
      cryptoMarket: {
        isUnlocked: false,
        plan: null,
        expiresAt: null,
        trialUsed: false
      },
      cryptoNews: {
        isUnlocked: false,
        plan: null,
        expiresAt: null,
        trialUsed: false
      }
    }
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

// Wallet Hook
const useWallet = () => {
  const [wallet, setWallet] = useState({
    address: null,
    provider: null,
    signer: null,
    isConnecting: false,
    isConnected: false,
    balance: '0',
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
      alert('Please install MetaMask to continue');
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const ethersModule = await import('ethers');
      const ethers = ethersModule.default || ethersModule;

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Switch to BSC
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x38' }]
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x38',
              chainName: 'BNB Smart Chain',
              nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
              rpcUrls: ['https://bsc-dataseed1.binance.org/'],
              blockExplorerUrls: ['https://bscscan.com/']
            }]
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
      }

      setWallet({
        address: accounts[0],
        provider,
        signer,
        isConnecting: false,
        isConnected: true,
        balance,
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
      const message = `Welcome to Somnus!\nAddress: ${address}\nNonce: ${nonce}\nExpiry: ${expiry}`;

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
            tasksCompleted: 0
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

            const accounts = await window.ethereum.request({
              method: 'eth_accounts'
            });

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
    return () => { isMounted = false; };
  }, []);

  return {
    ...wallet,
    connectWallet,
    disconnect,
    welcomeBonusStatus
  };
};

// Main Component
export default function SomnusAI() {
  const wallet = useWallet();
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState({});
  const [processingTask, setProcessingTask] = useState(null);
  const [notification, setNotification] = useState(null);

  // Task Definitions
  const taskDefinitions = useMemo(() => ({
    followX: {
      id: 'followX',
      title: 'Follow on X',
      description: 'Follow @Somnus on X',
      reward: 100,
      icon: FaTwitter,
      action: 'https://x.com/somnusai'
    },
    likeX: {
      id: 'likeX',
      title: 'Like Post',
      description: 'Like our latest post',
      reward: 50,
      icon: FaThumbsUp,
      action: 'https://x.com/somnusai'
    },
    commentX: {
      id: 'commentX',
      title: 'Comment',
      description: 'Share your thoughts',
      reward: 75,
      icon: FaComment,
      action: 'https://x.com/somnusai'
    },
    retweetX: {
      id: 'retweetX',
      title: 'Retweet',
      description: 'Spread the word',
      reward: 60,
      icon: FaRetweet,
      action: 'https://x.com/somnusai'
    },
    joinTelegram: {
      id: 'joinTelegram',
      title: 'Join Telegram',
      description: 'Join our community',
      reward: 80,
      icon: FaTelegram,
      action: 'https://t.me/somnusai'
    },
    shareX: {
      id: 'shareX',
      title: 'Share',
      description: 'Share with friends',
      reward: 90,
      icon: FaShare,
      action: 'https://twitter.com/intent/tweet?text=Check%20out%20Somnus'
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
        message: 'Connect wallet to earn tokens'
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
      const message = `Complete task: ${taskId}\nAddress: ${wallet.address}\nReward: ${task.reward}\nNonce: ${nonce}\nExpiry: ${expiry}`;

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
            tasksCompleted: saved.stats.tasksCompleted + 1
          }
        });

        setNotification({
          type: 'success',
          message: `+${task.reward} SOMNUS earned!`,
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

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    setNotification({ type: 'success', message: 'Address copied!' });
    setTimeout(() => setNotification(null), 2000);
  };

  if (!wallet.isInitialized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <FaSpinner className="text-4xl text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            {...fadeIn}
            className="fixed top-4 right-4 z-50 max-w-sm"
          >
            <div className={`p-4 rounded-lg border backdrop-blur-sm ${
              notification.type === 'success'
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-start gap-3">
                {notification.type === 'success' ? (
                  <FaCheckCircle className="text-green-400 mt-0.5" />
                ) : (
                  <FaTimes className="text-red-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm text-white">{notification.message}</p>
                  {notification.txHash && (
                    <a
                      href={`https://bscscan.com/tx/${notification.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mt-1"
                    >
                      View TX <FaExternalLinkAlt className="text-[10px]" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Bonus Modal */}
      <AnimatePresence>
        {wallet.welcomeBonusStatus.sending && (
          <motion.div
            {...fadeIn}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 max-w-md w-full text-center">
              <FaSpinner className="text-5xl text-white animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-light text-white mb-2">
                Sending Welcome Bonus
              </h3>
              <p className="text-gray-400 text-sm">
                10 SOMNUS tokens incoming...
              </p>
            </div>
          </motion.div>
        )}

        {wallet.welcomeBonusStatus.sent && !wallet.welcomeBonusStatus.sending && (
          <motion.div
            {...fadeIn}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setWallet(prev => ({
                ...prev,
                welcomeBonusStatus: { sending: false, sent: false, txHash: null }
              }));
            }}
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 max-w-md w-full text-center">
              <FaCheckCircle className="text-5xl text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-light text-white mb-2">
                Welcome Bonus Received!
              </h3>
              <p className="text-gray-400 mb-4">
                +10 SOMNUS tokens added to your wallet
              </p>
              {wallet.welcomeBonusStatus.txHash && (
                <a
                  href={`https://bscscan.com/tx/${wallet.welcomeBonusStatus.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white flex items-center justify-center gap-2"
                >
                  View Transaction <FaExternalLinkAlt />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-lg">💤</span>
              </div>
              <span className="text-lg font-light">Somnus</span>
            </div>

            {/* Wallet */}
            {!wallet.isConnected ? (
              <button
                onClick={wallet.connectWallet}
                disabled={wallet.isConnecting}
                className="px-4 py-2 bg-white text-black rounded-lg font-medium text-sm hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {wallet.isConnecting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <FaWallet />
                    Connect Wallet
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                  <FaCoins className="text-yellow-400" />
                  <span className="text-sm font-mono">{stats.earned}</span>
                </div>
                <button
                  onClick={copyAddress}
                  className="px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-sm font-mono transition-colors flex items-center gap-2"
                >
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  <FaCopy className="text-xs" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!wallet.isConnected ? (
          // Connect Wallet View
          <motion.div {...fadeIn} className="max-w-2xl mx-auto text-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaWallet className="text-4xl text-white/50" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-light mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-gray-400 mb-8">
              Connect your wallet to start earning SOMNUS tokens and unlock premium features
            </p>
            <button
              onClick={wallet.connectWallet}
              disabled={wallet.isConnecting}
              className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
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
              <p className="text-red-400 text-sm mt-4">{wallet.error}</p>
            )}
          </motion.div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex items-center gap-1 mb-8 bg-white/5 border border-white/10 rounded-lg p-1 max-w-md">
              {[
                { id: 'tasks', label: 'Tasks', icon: FaTrophy },
                { id: 'crypto', label: 'Market', icon: FaChartLine },
                { id: 'news', label: 'News', icon: FaNewspaper }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-white text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="text-sm" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'tasks' && (
                <motion.div key="tasks" {...fadeIn}>
                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: 'Earned', value: stats.earned, icon: FaCoins, suffix: 'SOMNUS' },
                      { label: 'Completed', value: stats.completed, icon: FaCheckCircle, suffix: `/ ${stats.total}` },
                      { label: 'Progress', value: Math.round(stats.progress), icon: FaFire, suffix: '%' },
                      { label: 'Rank', value: stats.completed >= stats.total ? '🏆' : '⭐', icon: FaTrophy }
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <stat.icon className="text-gray-400" />
                          <span className="text-xs text-gray-400">{stat.label}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-light text-white">{stat.value}</span>
                          {stat.suffix && (
                            <span className="text-xs text-gray-500">{stat.suffix}</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Tasks Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.values(taskDefinitions).map((task, i) => {
                      const isCompleted = tasks[task.id]?.completed;
                      const isProcessing = processingTask === task.id;

                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`group relative bg-white/5 border rounded-lg p-6 transition-all ${
                            isCompleted
                              ? 'border-green-500/30 bg-green-500/5'
                              : 'border-white/10 hover:border-white/20 hover:bg-white/10'
                          }`}
                        >
                          {/* Icon */}
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all ${
                            isCompleted
                              ? 'bg-green-500/20'
                              : 'bg-white/10 group-hover:bg-white/20'
                          }`}>
                            {isCompleted ? (
                              <FaCheckCircle className="text-green-400 text-xl" />
                            ) : (
                              <task.icon className="text-white/70 text-xl" />
                            )}
                          </div>

                          {/* Content */}
                          <h3 className="text-white font-medium mb-1">{task.title}</h3>
                          <p className="text-gray-400 text-sm mb-4">{task.description}</p>

                          {/* Reward */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-yellow-400">
                              <FaCoins className="text-sm" />
                              <span className="text-sm font-medium">+{task.reward}</span>
                            </div>

                            <button
                              onClick={() => completeTask(task.id)}
                              disabled={isCompleted || isProcessing}
                              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                isCompleted
                                  ? 'bg-green-500/20 text-green-400 cursor-default'
                                  : isProcessing
                                  ? 'bg-white/10 text-white cursor-wait'
                                  : 'bg-white text-black hover:bg-white/90'
                              }`}
                            >
                              {isProcessing ? (
                                <FaSpinner className="animate-spin" />
                              ) : isCompleted ? (
                                'Completed'
                              ) : (
                                'Start'
                              )}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* All Completed */}
                  {stats.completed >= stats.total && (
                    <motion.div
                      {...fadeIn}
                      className="mt-8 bg-green-500/10 border border-green-500/30 rounded-lg p-8 text-center"
                    >
                      <FaTrophy className="text-5xl text-yellow-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-light text-white mb-2">
                        All Tasks Completed!
                      </h3>
                      <p className="text-gray-400">
                        You've earned {stats.earned} SOMNUS tokens
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeTab === 'crypto' && (
                <motion.div key="crypto" {...fadeIn}>
                  <CryptoRecommendations />
                </motion.div>
              )}

              {activeTab === 'news' && (
                <motion.div key="news" {...fadeIn}>
                  <NewsTerminal />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>
    </div>
  );
}
