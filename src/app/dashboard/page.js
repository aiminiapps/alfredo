'use client';
import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { 
  FaWallet, FaChartLine, FaRobot, FaPaperPlane, FaCopy, FaChartPie, 
  FaFire, FaLightbulb, FaBolt, FaTrophy, FaRocket, FaChartBar, 
  FaLayerGroup, FaDownload, FaShare, FaStar, FaGlobe, FaBrain, 
  FaCheckCircle, FaExclamationTriangle, FaHistory, FaCoins, 
  FaShieldAlt, FaArrowUp, FaArrowDown, FaHome, FaTimes, FaExpand, 
  FaMagic, FaChevronRight, FaBullseye, FaUser, FaExchangeAlt, 
  FaFilter, FaCompass, FaClock, FaSort, FaTwitter, FaSpinner,
  FaTelegram, FaExternalLinkAlt, FaRetweet, FaComment, FaThumbsUp,
  FaInfoCircle, FaGift, FaCheckDouble, FaEye
} from 'react-icons/fa';
import { TbTarget } from 'react-icons/tb';
import { BiCoin, BiData, BiShield } from 'react-icons/bi';
import { HiSparkles } from 'react-icons/hi';
import { 
  PieChart, Pie, Cell, BarChart, Bar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// Theme
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

// Storage Configuration
const STORAGE_KEY = 'alfredo-task-center';
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || '0x...';

// Animations
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
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
      alert('🔥 Please install MetaMask extension!');
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

// Main Dashboard Component
function AlfredoDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const wallet = useWallet();
  
  const walletAddress = searchParams.get('wallet');
  const network = searchParams.get('network') || 'ethereum';

  // AI Dashboard State
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Task Center State
  const [tasks, setTasks] = useState({});
  const [processingTask, setProcessingTask] = useState(null);
  const [showTokenInfo, setShowTokenInfo] = useState(false);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' or 'tasks'

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (walletAddress && !isScanning && !scanComplete) {
      scanWallet();
    }
  }, [walletAddress]);

  // Task Definitions
  const taskDefinitions = useMemo(() => ({
    followX: {
      id: 'followX',
      title: 'Follow on X',
      description: 'Follow @AI_UR_Alfredo for insights',
      reward: 100,
      icon: FaTwitter,
      action: 'https://x.com/AI_UR_Alfredo',
      type: 'social',
      difficulty: 'easy'
    },
    likeX: {
      id: 'likeX',
      title: 'Like Post',
      description: 'Like our latest post',
      reward: 50,
      icon: FaThumbsUp,
      action: 'https://x.com/AI_UR_Alfredo',
      type: 'social',
      difficulty: 'easy'
    },
    commentX: {
      id: 'commentX',
      title: 'Comment',
      description: 'Share your experience',
      reward: 75,
      icon: FaComment,
      action: 'https://x.com/AI_UR_Alfredo',
      type: 'social',
      difficulty: 'medium'
    },
    retweetX: {
      id: 'retweetX',
      title: 'Retweet',
      description: 'Help us spread the word',
      reward: 60,
      icon: FaRetweet,
      action: 'https://x.com/AI_UR_Alfredo',
      type: 'social',
      difficulty: 'easy'
    },
    joinTelegram: {
      id: 'joinTelegram',
      title: 'Join Telegram',
      description: 'Join our community',
      reward: 80,
      icon: FaTelegram,
      action: 'https://t.me/AI_UR_Alfredo',
      type: 'social',
      difficulty: 'easy'
    },
    shareX: {
      id: 'shareX',
      title: 'Share',
      description: 'Share with your network',
      reward: 90,
      icon: FaShare,
      action: 'https://twitter.com/intent/tweet?text=Check%20out%20Alfredo',
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

  const taskStats = useMemo(() => {
    const saved = getStorage();
    const completed = Object.values(tasks).filter(t => t.completed).length;
    const total = Object.keys(taskDefinitions).length;
    const earned = saved?.stats?.totalEarned || 0;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, earned, progress };
  }, [tasks, taskDefinitions]);

  // Scan Wallet Function
  const scanWallet = async () => {
    setIsScanning(true);
    setScanComplete(false);

    try {
      toast.loading('Scanning wallet...', { id: 'scan' });
      
      const scanResponse = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: walletAddress, chains: [network] })
      });

      if (!scanResponse.ok) throw new Error('Scan failed');
      
      const scanData = await scanResponse.json();
      if (!scanData.success) throw new Error(scanData.error);
      
      setWalletData(scanData);
      toast.success('Wallet scanned!', { id: 'scan' });

      toast.loading('Generating AI insights...', { id: 'ai' });
      
      const insightsResponse = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          analytics: scanData.analytics, 
          wallet: walletAddress 
        })
      });

      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        setAiInsights(insightsData);
        toast.success('AI analysis complete!', { id: 'ai' });
      }

      setScanComplete(true);
    } catch (error) {
      console.error('Scan error:', error);
      toast.error(error.message || 'Failed to scan wallet', { id: 'scan' });
      setTimeout(() => router.push('/'), 2000);
    } finally {
      setIsScanning(false);
    }
  };

  // Complete Task Function
  const completeTask = useCallback(async (taskId) => {
    if (!wallet.isConnected || !wallet.signer) {
      toast.error('Please connect your wallet first!');
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

        toast.success(`+${task.reward} AFRD earned!`);
      } else {
        throw new Error(data.error || 'Transaction failed');
      }
    } catch (error) {
      toast.error(`Failed: ${error.message}`);
    } finally {
      setProcessingTask(null);
    }
  }, [wallet, tasks, taskDefinitions]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // Loading State
  if (!wallet.isInitialized || (walletAddress && isScanning)) {
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
          <p className="text-white text-lg font-medium">
            {walletAddress ? 'Analyzing Portfolio...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background, color: theme.text }}>
      <Toaster position="top-right" theme="dark" />

      {/* Welcome Bonus Modal */}
      <AnimatePresence>
        {wallet.welcomeBonusStatus.sending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-8 max-w-sm w-full text-center"
              style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-4"
              >
                <HiSparkles size={56} style={{ color: theme.primary }} />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Processing Bonus</h3>
              <p style={{ color: theme.textSecondary }}>Sending 10 AFRD...</p>
            </motion.div>
          </motion.div>
        )}

        {wallet.welcomeBonusStatus.sent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-8 max-w-sm w-full text-center"
              style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
            >
              <FaGift size={56} style={{ color: theme.success }} className="mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Welcome!</h3>
              <p className="text-xl font-bold mb-4" style={{ color: theme.success }}>+10 AFRD received!</p>
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

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-md"
        style={{
          backgroundColor: `${theme.cardBg}F0`,
          borderBottom: `1px solid ${theme.border}`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo & View Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${theme.primary}20` }}
                >
                  <HiSparkles size={24} style={{ color: theme.primary }} />
                </div>
                <span className="font-bold text-white hidden sm:inline">Alfredo</span>
              </button>

              {walletAddress && scanComplete && (
                <div className="flex items-center gap-2 rounded-lg p-1" style={{ backgroundColor: theme.cardBg }}>
                  <button
                    onClick={() => setActiveView('dashboard')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeView === 'dashboard' ? 'text-white' : 'text-gray-400'
                    }`}
                    style={activeView === 'dashboard' ? { backgroundColor: theme.primary } : {}}
                  >
                    <FaChartLine className="inline mr-2" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveView('tasks')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeView === 'tasks' ? 'text-white' : 'text-gray-400'
                    }`}
                    style={activeView === 'tasks' ? { backgroundColor: theme.primary } : {}}
                  >
                    <FaCoins className="inline mr-2" />
                    Tasks ({taskStats.completed}/{taskStats.total})
                  </button>
                </div>
              )}
            </div>

            {/* Right: Wallet Info */}
            <div className="flex items-center gap-3">
              {wallet.isConnected ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg"
                    style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
                  >
                    <FaWallet size={14} style={{ color: theme.primary }} />
                    <span className="text-sm text-white font-mono">
                      {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(wallet.address)}
                      className="ml-2"
                    >
                      <FaCopy size={12} style={{ color: theme.textSecondary }} />
                    </button>
                  </div>
                  <button
                    onClick={wallet.disconnect}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={wallet.connectWallet}
                  disabled={wallet.isConnecting}
                  className="px-6 py-2 rounded-lg font-semibold text-white flex items-center gap-2 disabled:opacity-50"
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
                      Connect
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!walletAddress || !scanComplete ? (
          // Task Center View (when no wallet scanned)
          <div className="space-y-8">
            {/* Task Stats */}
            {wallet.isConnected && (
              <motion.div {...fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: FaCheckCircle, label: 'Completed', value: `${taskStats.completed}/${taskStats.total}`, color: theme.success },
                  { icon: FaCoins, label: 'Earned', value: taskStats.earned, suffix: 'AFRD', color: theme.primary },
                  { icon: FaChartLine, label: 'Progress', value: `${Math.round(taskStats.progress)}%`, color: theme.info },
                  { icon: FaFire, label: 'Streak', value: getStorage()?.stats?.currentStreak || 0, color: theme.error }
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
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
            )}

            {/* Tasks List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Available Tasks</h2>
              {Object.values(taskDefinitions).map((task, index) => {
                const isCompleted = tasks[task.id]?.completed;
                const isProcessing = processingTask === task.id;

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
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
                            disabled={isProcessing || !wallet.isConnected}
                            className="px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50 transition-opacity"
                            style={{ backgroundColor: theme.primary }}
                          >
                            {isProcessing ? <FaSpinner className="animate-spin" /> : 'Complete'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          // Dashboard View (when wallet is scanned)
          <div>
            {activeView === 'dashboard' ? (
              <div>
                {/* Dashboard content - Portfolio analytics, charts, etc. */}
                <p className="text-white">Dashboard view for wallet: {walletAddress}</p>
                {/* Add your existing dashboard UI here */}
              </div>
            ) : (
              // Tasks View within Dashboard
              <div className="space-y-8">
                {/* Task Stats */}
                <motion.div {...fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: FaCheckCircle, label: 'Completed', value: `${taskStats.completed}/${taskStats.total}`, color: theme.success },
                    { icon: FaCoins, label: 'Earned', value: taskStats.earned, suffix: 'AFRD', color: theme.primary },
                    { icon: FaChartLine, label: 'Progress', value: `${Math.round(taskStats.progress)}%`, color: theme.info },
                    { icon: FaFire, label: 'Streak', value: getStorage()?.stats?.currentStreak || 0, color: theme.error }
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
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
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">Earn More AFRD</h2>
                  {Object.values(taskDefinitions).map((task, index) => {
                    const isCompleted = tasks[task.id]?.completed;
                    const isProcessing = processingTask === task.id;

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
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
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-2xl font-bold" style={{ color: theme.success }}>+{task.reward}</p>
                              <p className="text-xs" style={{ color: theme.textSecondary }}>AFRD</p>
                            </div>

                            {isCompleted ? (
                              <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                                style={{ backgroundColor: `${theme.success}20`, color: theme.success }}
                              >
                                <FaCheckDouble />
                                Done
                              </div>
                            ) : (
                              <button
                                onClick={() => completeTask(task.id)}
                                disabled={isProcessing}
                                className="px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50"
                                style={{ backgroundColor: theme.primary }}
                              >
                                {isProcessing ? <FaSpinner className="animate-spin" /> : 'Earn'}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <div className="text-center">
          <HiSparkles size={48} style={{ color: theme.primary }} className="animate-spin mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    }>
      <AlfredoDashboard />
    </Suspense>
  );
}
