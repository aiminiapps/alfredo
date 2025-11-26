'use client';
import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
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

// Theme Configuration
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

// Chart Colors
const CHART_COLORS = {
  primary: [theme.primary, theme.secondary, '#FFAA4D', '#FFC080', '#FF9933', '#FFD4A6'],
  performance: {
    positive: theme.success,
    negative: theme.error,
    neutral: '#A9A9B1'
  }
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
      toast.error('Please install MetaMask!');
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
      toast.error(error.message);
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

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        backgroundColor: theme.cardBg,
        border: `2px solid ${theme.primary}`,
        borderRadius: '12px',
        padding: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
      }}
    >
      <p style={{ color: theme.text, fontWeight: 'bold', marginBottom: '8px' }}>{label}</p>
      {payload.map((entry, index) => (
        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
          <span style={{ color: theme.textSecondary, fontSize: '12px' }}>{entry.name}</span>
          <span style={{ fontWeight: 'bold', color: entry.color, fontSize: '12px' }}>
            {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
          </span>
        </div>
      ))}
    </motion.div>
  );
};

// Main Component
function AlfredoDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const wallet = useWallet();
  
  const walletParam = searchParams.get('wallet');
  const network = searchParams.get('network') || 'ethereum';

  // ALL STATE AT TOP
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [tasks, setTasks] = useState({});
  const [processingTask, setProcessingTask] = useState(null);
  const [showTokenInfo, setShowTokenInfo] = useState(false);

  const chatEndRef = useRef(null);

  // Effects
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    const saved = getStorage();
    if (saved?.tasks) {
      setTasks(saved.tasks);
    }
  }, []);

  useEffect(() => {
    if (walletParam && !isScanning && !scanComplete) {
      scanWallet();
    }
  }, [walletParam]);

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

  const taskStats = useMemo(() => {
    const saved = getStorage();
    const completed = Object.values(tasks).filter(t => t.completed).length;
    const total = Object.keys(taskDefinitions).length;
    const earned = saved?.stats?.totalEarned || 0;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, earned, progress };
  }, [tasks, taskDefinitions]);

  const chartData = useMemo(() => {
    if (!walletData || !scanComplete) return null;

    const analytics = walletData.analytics;

    return {
      chainDistribution: analytics.chainDistribution.map((chain, idx) => ({
        name: chain.chain,
        value: chain.value,
        percentage: parseFloat(chain.percentage),
        color: CHART_COLORS.primary[idx % CHART_COLORS.primary.length]
      })),
      topHoldings: analytics.topHoldings.slice(0, 10).map((token) => ({
        name: token.symbol,
        value: token.valueUSD,
        change: token.percentChange24h,
        color: token.percentChange24h > 0 ? CHART_COLORS.performance.positive : CHART_COLORS.performance.negative
      })),
      pnlData: Object.values(analytics.pnlData).slice(0, 12).map(token => ({
        name: token.symbol,
        totalPnL: token.totalPnL,
        realized: token.realizedPnL,
        unrealized: token.unrealizedPnL,
        profit: token.totalPnL > 0 ? token.totalPnL : 0,
        loss: token.totalPnL < 0 ? Math.abs(token.totalPnL) : 0
      })),
      radarData: aiInsights ? [
        { metric: 'Portfolio', value: aiInsights.scores?.portfolio || 0, fullMark: 100 },
        { metric: 'Risk', value: aiInsights.scores?.risk || 0, fullMark: 100 },
        { metric: 'Performance', value: aiInsights.scores?.performance || 0, fullMark: 100 },
        { metric: 'Diversification', value: aiInsights.scores?.diversification || 0, fullMark: 100 },
        { metric: 'Activity', value: aiInsights.scores?.activity || 0, fullMark: 100 }
      ] : []
    };
  }, [walletData, aiInsights, scanComplete]);

  const scanWallet = useCallback(async () => {
    setIsScanning(true);
    setScanComplete(false);

    try {
      toast.loading('Scanning wallet...', { id: 'scan' });
      
      const scanResponse = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: walletParam, chains: [network] })
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
          wallet: walletParam 
        })
      });

      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        setAiInsights(insightsData);
        toast.success('AI analysis complete!', { id: 'ai' });
      } else {
        toast.error('AI insights unavailable', { id: 'ai' });
      }

      setScanComplete(true);
    } catch (error) {
      console.error('Scan error:', error);
      toast.error(error.message || 'Failed to scan wallet');
      setTimeout(() => router.push('/'), 2000);
    } finally {
      setIsScanning(false);
    }
  }, [walletParam, network, router]);

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

  const sendChatMessage = useCallback(async () => {
    if (!userInput.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = userInput;
    setUserInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...chatMessages.slice(-6).map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: currentInput }
          ],
          walletData: walletData
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseContent = data.reply || 'Error processing request.';
        
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Chat failed');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const fallbackMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [userInput, isTyping, chatMessages, walletData]);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  }, []);

  const sharePortfolio = useCallback(() => {
    copyToClipboard(window.location.href);
    toast.success('Share link copied!');
  }, [copyToClipboard]);

  const exportPortfolio = useCallback(() => {
    toast.success('Exporting...');
  }, []);

  // Loading State
  if (!wallet.isInitialized || (walletParam && isScanning)) {
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
            {walletParam ? 'Analyzing Portfolio...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

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
            <div className="rounded-2xl p-8 max-w-sm w-full text-center" style={{ backgroundColor: theme.cardBg }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="inline-block mb-4">
                <HiSparkles size={56} style={{ color: theme.primary }} />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Processing Bonus</h3>
              <p style={{ color: theme.textSecondary }}>Sending 10 AFRD...</p>
            </div>
          </motion.div>
        )}

        {wallet.welcomeBonusStatus.sent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          >
            <div className="rounded-2xl p-8 max-w-sm w-full text-center" style={{ backgroundColor: theme.cardBg }}>
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
            </div>
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
          <div className="flex items-center justify-between gap-4">
            <button onClick={() => router.push('/')} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${theme.primary}20` }}
              >
                <HiSparkles size={24} style={{ color: theme.primary }} />
              </div>
              <span className="font-bold text-white hidden sm:inline">Alfredo AI</span>
            </button>

            <div className="flex items-center gap-3">
              {wallet.isConnected ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
                  >
                    <FaWallet size={14} style={{ color: theme.primary }} />
                    <span className="text-white font-mono text-xs">
                      {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                    </span>
                    <button onClick={() => copyToClipboard(wallet.address)} className="ml-1">
                      <FaCopy size={10} style={{ color: theme.textSecondary }} />
                    </button>
                  </div>

                  {walletParam && scanComplete && (
                    <>
                      <button onClick={sharePortfolio} className="p-2 rounded-lg" title="Share">
                        <FaShare size={16} style={{ color: theme.textSecondary }} />
                      </button>
                      <button onClick={exportPortfolio} className="p-2 rounded-lg" title="Export">
                        <FaDownload size={16} style={{ color: theme.textSecondary }} />
                      </button>
                      <button
                        onClick={() => setShowChat(!showChat)}
                        className="px-3 py-2 rounded-lg font-semibold text-white text-sm flex items-center gap-2"
                        style={{ backgroundColor: theme.primary }}
                      >
                        <FaRobot size={16} />
                        <span className="hidden sm:inline">AI Chat</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={wallet.disconnect}
                    className="px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-red-400"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={wallet.connectWallet}
                  disabled={wallet.isConnecting}
                  className="px-6 py-2 rounded-lg font-semibold text-white text-sm flex items-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: theme.primary }}
                >
                  {wallet.isConnecting ? (
                    <>
                      <FaSpinner className="animate-spin" size={14} />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <FaWallet size={14} />
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
        {scanComplete && walletData ? (
          // AI DASHBOARD WITH PORTFOLIO ANALYTICS
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: FaWallet,
                  label: 'Total Value',
                  value: '$' + walletData.analytics.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                  change: walletData.analytics.totalPnL
                },
                {
                  icon: FaGlobe,
                  label: 'Active Chains',
                  value: walletData.analytics.activeChains,
                  subtext: `${walletData.analytics.totalTokens} tokens`
                },
                {
                  icon: FaChartPie,
                  label: 'Diversification',
                  value: (walletData.analytics.diversificationScore * 100).toFixed(0),
                  progress: walletData.analytics.diversificationScore * 100
                },
                {
                  icon: FaShieldAlt,
                  label: 'Risk Score',
                  value: (walletData.analytics.riskScore * 100).toFixed(0),
                  progress: walletData.analytics.riskScore * 100
                }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl p-5"
                  style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${theme.primary}20` }}
                    >
                      <stat.icon size={20} style={{ color: theme.primary }} />
                    </div>
                    <span className="text-xs" style={{ color: theme.textSecondary }}>{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-2">{stat.value}</p>
                  {stat.change !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <span style={{ color: stat.change > 0 ? theme.success : theme.error }}>
                        {stat.change > 0 ? <FaArrowUp className="inline" /> : <FaArrowDown className="inline" />}
                        {' '}${Math.abs(stat.change).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {stat.subtext && <p className="text-xs mt-2" style={{ color: theme.textSecondary }}>{stat.subtext}</p>}
                  {stat.progress !== undefined && (
                    <div className="mt-3">
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${theme.primary}20` }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.progress}%` }}
                          transition={{ duration: 1 }}
                          className="h-full"
                          style={{ backgroundColor: theme.primary }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: FaChartLine },
                { id: 'holdings', label: 'Holdings', icon: FaLayerGroup },
                { id: 'insights', label: 'AI Insights', icon: FaBrain },
                { id: 'tasks', label: `Earn AFRD (${taskStats.completed}/${taskStats.total})`, icon: FaCoins }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-400'
                  }`}
                  style={activeTab === tab.id ? { backgroundColor: theme.primary } : { backgroundColor: theme.cardBg }}
                >
                  <tab.icon className="inline mr-2" size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && chartData && (
                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-xl p-6" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}>
                      <h3 className="text-lg font-bold text-white mb-4">Chain Distribution</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chartData.chainDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={(entry) => `${entry.name} ${entry.percentage}%`}
                          >
                            {chartData.chainDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="rounded-xl p-6" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}>
                      <h3 className="text-lg font-bold text-white mb-4">Top Holdings</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.topHoldings}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                          <XAxis dataKey="name" stroke={theme.textSecondary} />
                          <YAxis stroke={theme.textSecondary} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" fill={theme.primary} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'holdings' && (
                <motion.div key="holdings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl p-6" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}>
                  <h3 className="text-lg font-bold text-white mb-4">Token Holdings</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs" style={{ color: theme.textSecondary }}>
                          <th className="pb-3">Token</th>
                          <th className="pb-3">Balance</th>
                          <th className="pb-3">Value</th>
                          <th className="pb-3">Chain</th>
                        </tr>
                      </thead>
                      <tbody>
                        {walletData.analytics.topHoldings.slice(0, 20).map((token, idx) => (
                          <tr key={idx} className="border-t" style={{ borderColor: theme.border }}>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                  style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
                                >
                                  {token.symbol.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-white font-medium text-sm">{token.symbol}</p>
                                  <p className="text-xs" style={{ color: theme.textSecondary }}>{token.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-white">{parseFloat(token.balance).toFixed(4)}</td>
                            <td className="py-3 text-white">${token.valueUSD.toLocaleString()}</td>
                            <td className="py-3" style={{ color: theme.textSecondary }}>{token.chainName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'insights' && aiInsights && (
                <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {aiInsights.insights?.map((insight, idx) => (
                    <div key={idx} className="rounded-xl p-6" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}>
                      <div className="flex items-start gap-3">
                        <FaLightbulb size={20} style={{ color: theme.primary }} />
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-2">{insight.title}</h4>
                          <p className="text-sm" style={{ color: theme.textSecondary }}>{insight.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'tasks' && (
                <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {/* Task Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">Complete Tasks & Earn AFRD</h3>
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
                                <h4 className="text-lg font-bold text-white mb-1">{task.title}</h4>
                                <p className="text-sm mb-3" style={{ color: theme.textSecondary }}>{task.description}</p>
                                <div className="flex items-center gap-3 text-xs">
                                  <span className="px-2 py-1 rounded" style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}>
                                    {task.type}
                                  </span>
                                  <span className="px-2 py-1 rounded" style={{ backgroundColor: `${theme.info}15`, color: theme.info }}>
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
                                  className="px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50"
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

                  {/* Completion Message */}
                  {taskStats.completed === taskStats.total && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl p-8 text-center"
                      style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
                    >
                      <FaTrophy size={56} style={{ color: theme.primary }} className="mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-2">All Tasks Completed!</h3>
                      <p style={{ color: theme.textSecondary }} className="mb-6">
                        You've earned a total of {taskStats.earned} AFRD tokens!
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          // NO WALLET SCANNED - SHOW TASK CENTER ONLY
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                style={{ backgroundColor: `${theme.primary}20` }}
              >
                <FaCoins size={32} style={{ color: theme.primary }} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Earn AFRD Tokens</h1>
              <p style={{ color: theme.textSecondary }} className="text-lg">
                Complete tasks and get rewarded on BSC
              </p>
            </div>

            {wallet.isConnected && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
              </div>
            )}

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
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl"
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
                            disabled={isProcessing || !wallet.isConnected}
                            className="px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50"
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
        )}
      </main>

      {/* AI Chat Sidebar */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[450px] z-50 flex flex-col"
            style={{ backgroundColor: theme.cardBg, borderLeft: `1px solid ${theme.border}` }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.border }}>
              <div className="flex items-center gap-3">
                <FaRobot size={24} style={{ color: theme.primary }} />
                <div>
                  <h3 className="font-bold text-white">Alfredo AI</h3>
                  <p className="text-xs" style={{ color: theme.textSecondary }}>Portfolio Analyst</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)}>
                <FaTimes style={{ color: theme.textSecondary }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-white font-medium mb-2">Ask Me Anything!</p>
                  <p className="text-sm" style={{ color: theme.textSecondary }}>
                    I can analyze your portfolio and answer questions.
                  </p>
                </div>
              )}

              {chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[80%] rounded-xl p-3"
                    style={{
                      backgroundColor: message.role === 'user' ? theme.primary : theme.cardBg,
                      border: message.role === 'assistant' ? `1px solid ${theme.border}` : 'none'
                    }}
                  >
                    <div className="text-sm text-white">
                      {message.role === 'assistant' ? <ReactMarkdown>{message.content}</ReactMarkdown> : message.content}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-xl p-3" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}>
                    <div className="flex gap-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: theme.primary }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t" style={{ borderColor: theme.border }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Ask about your portfolio..."
                  disabled={isTyping}
                  className="flex-1 px-4 py-3 rounded-xl text-white text-sm outline-none"
                  style={{ backgroundColor: theme.background, border: `1px solid ${theme.border}` }}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!userInput.trim() || isTyping}
                  className="px-4 py-3 rounded-xl text-white disabled:opacity-50"
                  style={{ backgroundColor: theme.primary }}
                >
                  <FaPaperPlane size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <HiSparkles size={48} style={{ color: theme.primary }} className="animate-spin" />
      </div>
    }>
      <AlfredoDashboard />
    </Suspense>
  );
}
