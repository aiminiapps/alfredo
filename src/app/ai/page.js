'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { toast, Toaster } from 'sonner';
import ReactMarkdown from 'react-markdown';
import {
  FaWallet, FaChartLine, FaRobot, FaPaperPlane, FaCopy, FaChartPie, FaFire, FaLightbulb,
  FaBolt, FaTrophy, FaRocket, FaChartBar, FaLayerGroup,
  FaDownload, FaShare, FaStar, FaGlobe, FaBrain,
  FaCheckCircle, FaExclamationTriangle, FaHistory,
  FaCoins, FaShieldAlt, FaArrowUp, FaArrowDown, FaHome,
  FaTimes, FaExpand, FaMagic, FaChevronRight,
   FaBullseye, FaUser, FaExchangeAlt, FaFilter, FaCompass, FaClock, FaSort
} from 'react-icons/fa';
import { RiListCheck3 } from "react-icons/ri";
import {
  PieChart, Pie, Cell, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import AlfredoTaskCenter from '@/components/Tasks';

function AIDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const wallet = searchParams.get('wallet');
  const network = searchParams.get('network') || 'ethereum';

  useEffect(() => {
    if (!wallet) {
      router.push('/');
    }
  }, [wallet, router]);

  // State
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hoveredChart, setHoveredChart] = useState(null);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (wallet && !isScanning && !scanComplete) {
      scanWallet();
    }
  }, [wallet]);

  const scanWallet = async () => {
    setIsScanning(true);
    setScanComplete(false);

    try {
      toast.loading('🦊 Scanning multi-chain wallet...', { id: 'scan' });

      const scanResponse = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, chains: [network] })
      });

      if (!scanResponse.ok) throw new Error('Scan failed');

      const scanData = await scanResponse.json();
      if (!scanData.success) throw new Error(scanData.error);

      setWalletData(scanData);
      toast.success('✅ Wallet scanned successfully!', { id: 'scan' });

      // Fetch AI insights
      toast.loading('🧠 Generating AI insights...', { id: 'ai' });

      const insightsResponse = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analytics: scanData.analytics,
          wallet: wallet
        })
      });

      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        setAiInsights(insightsData);
        toast.success('🎯 AI analysis complete!', { id: 'ai' });
      } else {
        toast.error('⚠️ AI insights unavailable', { id: 'ai' });
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

  const sendChatMessage = async () => {
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
            ...chatMessages.slice(-6).map(msg => ({
              role: msg.role,
              content: msg.content
            })),
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
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('📋 Copied to clipboard!');
  };

  const exportPortfolio = () => {
    toast.success('📄 Exporting portfolio report...');
    // Implementation for PDF export
  };

  const sharePortfolio = () => {
    const shareUrl = window.location.href;
    copyToClipboard(shareUrl);
    toast.success('🔗 Share link copied!');
  };

  // Enhanced color schemes
  const CHART_COLORS = {
    primary: ['#FF7A00', '#FFA64D', '#FF8C1F', '#FFB366', '#FF9933', '#FFC080', '#FFAA4D', '#FFD4A6'],
    gradient: ['#FF7A00', '#FFA64D', '#FFB366', '#FFC080'],
    performance: {
      positive: '#10b981',
      negative: '#ef4444',
      neutral: '#A9A9B1'
    },
    risk: {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444'
    }
  };

  // Custom tooltip for enhanced charts
  const CustomTooltip = ({ active, payload, label, type = 'default' }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1A1A1C] border-2 border-[#FF7A00] rounded-xl p-4 shadow-2xl backdrop-blur-xl"
      >
        <p className="text-[#F5F5F7] font-bold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="text-[#A9A9B1] text-sm">{entry.name}:</span>
            <span
              className="font-bold text-[#FF7A00]"
              style={{ color: entry.color }}
            >
              {typeof entry.value === 'number'
                ? entry.value.toFixed(2)
                : entry.value}
            </span>  
          </div>
        ))}
      </motion.div>
    );
  };

  if (!wallet) return null;

  // Loading state
  if (isScanning && !scanComplete) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(255,122,0,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(255,166,77,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(255,122,0,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(255,122,0,0.1) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <h2 className="text-3xl font-bold text-[#F5F5F7] mb-4">
            Analyzing Your Portfolio
          </h2>
          <p className="text-[#A9A9B1] mb-8">
            Scanning {network.charAt(0).toUpperCase() + network.slice(1)} and generating AI insights...
          </p>

          {/* Animated progress bars */}
          <div className="space-y-4 max-w-md mx-auto">
            {['Scanning blockchain', 'Analyzing tokens', 'Calculating metrics', 'Generating AI insights'].map(
              (text, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.3 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A9A9B1]">{text}</span>
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-[#FF7A00]"
                    >
                      ●
                    </motion.span>
                  </div>
                  <div className="h-2 bg-[#1A1A1C] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FFA64D]"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2, delay: idx * 0.5 }}
                    />
                  </div>
                </motion.div>
              )
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (!scanComplete || !walletData) return null;

  const analytics = walletData.analytics;

  // Enhanced chart data
  const chainDistributionData = analytics.chainDistribution.map((chain, idx) => ({
    name: chain.chain,
    value: chain.value,
    percentage: parseFloat(chain.percentage),
    color: CHART_COLORS.primary[idx % CHART_COLORS.primary.length]
  }));

  const topHoldingsData = analytics.topHoldings.slice(0, 10).map((token, idx) => ({
    name: token.symbol,
    value: token.valueUSD,
    change: token.percentChange24h,
    color: token.percentChange24h >= 0 ? CHART_COLORS.performance.positive : CHART_COLORS.performance.negative
  }));

  const pnlData = Object.values(analytics.pnlData).slice(0, 12).map(token => ({
    name: token.symbol,
    totalPnL: token.totalPnL,
    realized: token.realizedPnL,
    unrealized: token.unrealizedPnL,
    profit: token.totalPnL >= 0 ? token.totalPnL : 0,
    loss: token.totalPnL < 0 ? Math.abs(token.totalPnL) : 0
  }));

  // Radar chart data for portfolio health
  const radarData = aiInsights ? [
    { metric: 'Portfolio', value: aiInsights.scores?.portfolio || 0, fullMark: 100 },
    { metric: 'Risk', value: aiInsights.scores?.risk || 0, fullMark: 100 },
    { metric: 'Performance', value: aiInsights.scores?.performance || 0, fullMark: 100 },
    { metric: 'Diversification', value: aiInsights.scores?.diversification || 0, fullMark: 100 },
    { metric: 'Activity', value: aiInsights.scores?.activity || 0, fullMark: 100 }
  ] : [];

  return (
    <div className="min-h-screen bg-[#0B0B0C] relative">
      <Toaster position="top-right" theme="dark" />

      {/* Animated background gradient */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 0% 0%, rgba(255,122,0,0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 100% 0%, rgba(255,166,77,0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 100% 100%, rgba(255,122,0,0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 0% 100%, rgba(255,166,77,0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 0% 0%, rgba(255,122,0,0.15) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="w-full h-full"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-[#1A1A1C]/95 backdrop-blur-2xl border-b border-[#FF7A00]/20 shadow-xl"
      >
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/')}
                className="p-3 rounded-xl bg-gradient-to-br from-[#1A1A1C] to-[#0B0B0C] hover:from-[#FF7A00]/20 hover:to-[#FFA64D]/10 border border-[#FF7A00]/30 hover:border-[#FF7A00] transition-all shadow-lg hover:shadow-[#FF7A00]/50"
              >
                <FaHome className="text-[#FF7A00]" />
              </motion.button>

              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-[#FF7A00] via-[#FFA64D] to-[#FF7A00] bg-clip-text text-transparent">
                    Alfredo AI
                  </h1>
                  <p className="text-xs text-[#A9A9B1]">Portfolio Intelligence Platform</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="hidden md:flex items-center gap-2 bg-[#0B0B0C] px-4 py-2 rounded-xl border border-[#FF7A00]/20 group hover:border-[#FF7A00] transition-all">
                <FaWallet className="text-[#FF7A00] group-hover:scale-110 transition-transform" />
                <span className="text-[#F5F5F7] text-sm font-mono">
                  {wallet.slice(0, 6)}...{wallet.slice(-4)}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => copyToClipboard(wallet)}
                  className="p-1 hover:bg-[#FF7A00]/20 rounded transition-colors"
                >
                  <FaCopy className="text-[#A9A9B1] hover:text-[#FF7A00] text-xs" />
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sharePortfolio}
                className="p-3 rounded-xl bg-[#0B0B0C] hover:bg-[#FF7A00]/20 border border-[#FF7A00]/20 hover:border-[#FF7A00] transition-all"
              >
                <FaShare className="text-[#A9A9B1] hover:text-[#FF7A00]" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportPortfolio}
                className="p-3 rounded-xl bg-[#0B0B0C] hover:bg-[#FF7A00]/20 border border-[#FF7A00]/20 hover:border-[#FF7A00] transition-all"
              >
                <FaDownload className="text-[#A9A9B1] hover:text-[#FF7A00]" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowChat(!showChat)}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#FF7A00] to-[#FFA64D] text-[#0B0B0C] rounded-xl font-semibold hover:shadow-2xl hover:shadow-[#FF7A00]/60 transition-all relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#FFA64D] to-[#FF7A00] opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <FaRobot className="relative z-10" />
                <span className="hidden sm:inline relative z-10">AI Chat</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            {
              icon: FaWallet,
              label: 'Total Value',
              value: `$${analytics.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              change: analytics.totalPnL,
              changePercent: analytics.totalValue > 0 ? ((analytics.totalPnL / analytics.totalValue) * 100).toFixed(2) : 0,
              isPrimary: true,
              gradient: 'from-orange-500/20 to-amber-500/10'
            },
            {
              icon: FaGlobe,
              label: 'Active Chains',
              value: analytics.activeChains,
              subtext: `${analytics.totalTokens} tokens`,
              badge: analytics.activeChains >= 4 ? 'Excellent' : analytics.activeChains >= 2 ? 'Good' : 'Limited',
              badgeColor: analytics.activeChains >= 4 ? 'green' : analytics.activeChains >= 2 ? 'blue' : 'gray',
              gradient: 'from-blue-500/20 to-cyan-500/10'
            },
            {
              icon: FaChartPie,
              label: 'Diversification',
              value: `${analytics.diversificationScore}/100`,
              progress: analytics.diversificationScore,
              badge: analytics.diversificationScore > 70 ? 'Strong' : analytics.diversificationScore > 50 ? 'Moderate' : 'Weak',
              badgeColor: analytics.diversificationScore > 70 ? 'green' : analytics.diversificationScore > 50 ? 'yellow' : 'red',
              gradient: 'from-purple-500/20 to-pink-500/10'
            },
            {
              icon: FaShieldAlt,
              label: 'Risk Score',
              value: `${analytics.riskScore}/100`,
              badge: analytics.riskScore > 70 ? 'Low Risk' : analytics.riskScore > 40 ? 'Moderate' : 'High Risk',
              badgeColor: analytics.riskScore > 70 ? 'green' : analytics.riskScore > 40 ? 'yellow' : 'red',
              progress: analytics.riskScore,
              gradient: 'from-green-500/20 to-emerald-500/10'
            }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative overflow-hidden ${
                stat.isPrimary
                  ? 'bg-gradient-to-br from-[#FF7A00]/30 via-[#FFA64D]/20 to-[#FF7A00]/10'
                  : `bg-gradient-to-br ${stat.gradient}`
              } border ${
                stat.isPrimary ? 'border-[#FF7A00]/50' : 'border-[#FF7A00]/20'
              } rounded-2xl p-6 hover:border-[#FF7A00] transition-all duration-300 backdrop-blur-xl group cursor-pointer`}
            >
              {/* Animated background effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/0 to-[#FFA64D]/0 group-hover:from-[#FF7A00]/10 group-hover:to-[#FFA64D]/5 transition-all duration-500"
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    className="p-3 rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FFA64D] shadow-lg"
                  >
                    <stat.icon className="text-[#0B0B0C] text-xl" />
                  </motion.div>
                  <span className="text-[#A9A9B1] text-sm font-medium">{stat.label}</span>
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + idx * 0.1, type: 'spring' }}
                  className="text-4xl font-bold text-[#F5F5F7] mb-3"
                >
                  {stat.value}
                </motion.div>

                {stat.change !== undefined && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <div
                      className={`flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-lg ${
                        stat.change >= 0
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {stat.change >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                      ${Math.abs(stat.change).toFixed(2)}
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        stat.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      ({stat.changePercent >= 0 ? '+' : ''}{stat.changePercent}%)
                    </span>
                  </div>
                )}

                {stat.subtext && (
                  <div className="text-[#A9A9B1] text-sm mt-2">{stat.subtext}</div>
                )}

                {stat.progress !== undefined && (
                  <div className="mt-3">
                    <div className="w-full bg-[#0B0B0C] rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                        className="bg-gradient-to-r from-[#FF7A00] to-[#FFA64D] h-2 rounded-full relative"
                      >
                        <motion.div
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        />
                      </motion.div>
                    </div>
                  </div>
                )}

                {stat.badge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 + idx * 0.1, type: 'spring' }}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mt-3 ${
                      stat.badgeColor === 'green'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : stat.badgeColor === 'yellow'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : stat.badgeColor === 'red'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : stat.badgeColor === 'blue'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}
                  >
                    <FaCheckCircle />
                    {stat.badge}
                  </motion.span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Health Score Banner */}
        {aiInsights && aiInsights.portfolioHealth && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-[#1A1A1C] via-[#1A1A1C]/95 to-[#1A1A1C] border border-[#FF7A00]/30 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-[#FF7A00] transition-all"
          >
            <motion.div
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-[#FF7A00]/5 via-[#FFA64D]/10 to-[#FF7A00]/5 bg-[length:200%_100%] opacity-0 group-hover:opacity-100 transition-opacity"
            />

            <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-[#F5F5F7] mb-2 flex items-center gap-2">
                    AI Portfolio Health Score
                  </h3>
                  <p className="text-[#A9A9B1] mb-3">
                    Overall Status:{' '}
                    <span className={`font-bold ${
                      aiInsights.portfolioHealth.status === 'Excellent'
                        ? 'text-green-400'
                        : aiInsights.portfolioHealth.status === 'Good'
                        ? 'text-blue-400'
                        : aiInsights.portfolioHealth.status === 'Fair'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}>
                      {aiInsights.portfolioHealth.status}
                    </span>
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {Object.entries(aiInsights.portfolioHealth.components).map(([key, comp], idx) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-2 bg-[#0B0B0C] px-3 py-2 rounded-lg border border-[#FF7A00]/20"
                      >
                        <div className="w-2 h-2 rounded-full bg-[#FF7A00]" />
                        <span className="text-xs text-[#A9A9B1]">{key}</span>
                        <span className="text-xs font-bold text-[#FF7A00]">{comp.score}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('insights')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF7A00] to-[#FFA64D] text-[#0B0B0C] rounded-xl font-semibold hover:shadow-lg hover:shadow-[#FF7A00]/50 transition-all"
              >
                View Full Analysis
                <FaChevronRight />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Enhanced Tabs */}
        <div className="mb-8 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 border-b-2 border-[#FF7A00]/10 min-w-max pb-2">
            {[
              { id: 'overview', icon: FaChartBar, label: 'Overview' },
              { id: 'holdings', icon: FaCoins, label: 'Holdings' },
              { id: 'chains', icon: FaLayerGroup, label: 'Chains' },
              { id: 'pnl', icon: FaTrophy, label: 'P&L' },
              { id: 'insights', icon: FaBrain, label: 'AI Insights', badge: 'New' },
              { id: 'tasks', icon: RiListCheck3, label: 'Tasks', badge: 'New' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#FF7A00] to-[#FFA64D] text-[#0B0B0C] shadow-lg shadow-[#FF7A00]/50'
                    : 'text-[#A9A9B1] hover:text-[#F5F5F7] hover:bg-[#1A1A1C]'
                }`}
              >
                <tab.icon />
                {tab.label}
                {tab.badge && (
                  <span className="absolute -top-[1px] -right-1.5 scale-90 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-lg">
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#FF7A00] to-[#FFA64D] rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tab Content with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chain Distribution with Enhanced Pie Chart */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onMouseEnter={() => setHoveredChart('chain')}
                  onMouseLeave={() => setHoveredChart(null)}
                  className="bg-[#1A1A1C] border border-[#FF7A00]/20 rounded-2xl p-6 hover:border-[#FF7A00] transition-all backdrop-blur-xl relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/0 to-[#FFA64D]/0 group-hover:from-[#FF7A00]/5 group-hover:to-[#FFA64D]/5 transition-all duration-500"
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="flex items-center gap-2 text-xl font-bold text-[#F5F5F7]">
                        <motion.div
                          animate={hoveredChart === 'chain' ? { scale: 1.1 } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          <FaLayerGroup className="text-[#FF7A00]" />
                        </motion.div>
                        Chain Distribution
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        className="p-2 rounded-lg bg-[#0B0B0C] hover:bg-[#FF7A00]/20 transition-all"
                      >
                        <FaExpand className="text-[#A9A9B1]" />
                      </motion.button>
                    </div>

                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <defs>
                          {chainDistributionData.map((entry, index) => (
                            <linearGradient
                              key={`gradient-${index}`}
                              id={`colorGradient-${index}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor={CHART_COLORS.primary[index % CHART_COLORS.primary.length]}
                                stopOpacity={1}
                              />
                              <stop
                                offset="100%"
                                stopColor={CHART_COLORS.primary[index % CHART_COLORS.primary.length]}
                                stopOpacity={0.7}
                              />
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={chainDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name} ${percentage}%`}
                          outerRadius={110}
                          innerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={800}
                        >
                          {chainDistributionData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`url(#colorGradient-${index})`}
                              stroke="#0B0B0C"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="mt-6 space-y-3">
                      {analytics.chainDistribution.map((chain, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ x: 5 }}
                          className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-xl hover:bg-[#FF7A00]/10 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 360 }}
                              className="w-4 h-4 rounded-full shadow-lg"
                              style={{
                                backgroundColor: CHART_COLORS.primary[idx % CHART_COLORS.primary.length]
                              }}
                            />
                            <span className="text-[#F5F5F7] font-medium group-hover:text-[#FF7A00] transition-colors">
                              {chain.chain}
                            </span>
                            <span className="text-xs text-[#A9A9B1] bg-[#1A1A1C] px-2 py-1 rounded">
                              {chain.tokenCount} tokens
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-[#FF7A00] font-bold">${chain.value.toFixed(2)}</div>
                            <div className="text-xs text-[#A9A9B1]">{chain.percentage}%</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Top Holdings with Enhanced Bar Chart */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onMouseEnter={() => setHoveredChart('holdings')}
                  onMouseLeave={() => setHoveredChart(null)}
                  className="bg-[#1A1A1C] border border-[#FF7A00]/20 rounded-2xl p-6 hover:border-[#FF7A00] transition-all backdrop-blur-xl relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/0 to-[#FFA64D]/0 group-hover:from-[#FF7A00]/5 group-hover:to-[#FFA64D]/5 transition-all duration-500"
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="flex items-center gap-2 text-xl font-bold text-[#F5F5F7]">
                        <motion.div
                          animate={hoveredChart === 'holdings' ? { scale: 1.1 } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          <FaTrophy className="text-[#FF7A00]" />
                        </motion.div>
                        Top Holdings
                      </h3>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="p-2 rounded-lg bg-[#0B0B0C] hover:bg-[#FF7A00]/20 transition-all"
                        >
                          <FaFire className="text-[#FF7A00]" />
                        </motion.button>
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={topHoldingsData}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FF7A00" stopOpacity={1} />
                            <stop offset="100%" stopColor="#FFA64D" stopOpacity={0.8} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#FF7A00" opacity={0.1} />
                        <XAxis
                          dataKey="name"
                          stroke="#A9A9B1"
                          tick={{ fill: '#A9A9B1', fontSize: 12 }}
                        />
                        <YAxis
                          stroke="#A9A9B1"
                          tick={{ fill: '#A9A9B1', fontSize: 12 }}
                          tickFormatter={(value) => `$${value.toFixed(0)}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="value"
                          fill="url(#barGradient)"
                          radius={[8, 8, 0, 0]}
                          animationDuration={800}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* PnL Chart with Composed Chart */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onMouseEnter={() => setHoveredChart('pnl')}
                  onMouseLeave={() => setHoveredChart(null)}
                  className="bg-[#1A1A1C] border border-[#FF7A00]/20 rounded-2xl p-6 hover:border-[#FF7A00] transition-all backdrop-blur-xl relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/0 to-[#FFA64D]/0 group-hover:from-[#FF7A00]/5 group-hover:to-[#FFA64D]/5 transition-all duration-500"
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="flex items-center gap-2 text-xl font-bold text-[#F5F5F7]">
                        <motion.div
                          animate={hoveredChart === 'pnl' ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          <FaChartLine className="text-[#FF7A00]" />
                        </motion.div>
                        Profit & Loss
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {[
                        {
                          label: 'Total PnL',
                          value: analytics.totalPnL,
                          icon: analytics.totalPnL >= 0 ? FaArrowUp : FaArrowDown,
                          color: analytics.totalPnL >= 0 ? 'green' : 'red'
                        },
                        {
                          label: 'Realized',
                          value: analytics.totalRealizedPnL,
                          icon: analytics.totalRealizedPnL >= 0 ? FaArrowUp : FaArrowDown,
                          color: analytics.totalRealizedPnL >= 0 ? 'green' : 'red'
                        },
                        {
                          label: 'Unrealized',
                          value: analytics.totalUnrealizedPnL,
                          icon: analytics.totalUnrealizedPnL >= 0 ? FaArrowUp : FaArrowDown,
                          color: analytics.totalUnrealizedPnL >= 0 ? 'green' : 'red'
                        },
                        {
                          label: 'Win Rate',
                          value: `${analytics.winRate}%`,
                          icon: FaBullseye,
                          color: 'blue',
                          isPercent: true
                        }
                      ].map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          className="bg-[#0B0B0C] rounded-xl p-4 border border-[#FF7A00]/10 hover:border-[#FF7A00]/30 transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[#A9A9B1] text-xs">{item.label}</span>
                            <item.icon
                              className={`${
                                item.color === 'green'
                                  ? 'text-green-400'
                                  : item.color === 'red'
                                  ? 'text-red-400'
                                  : 'text-blue-400'
                              }`}
                            />
                          </div>
                          <div
                            className={`text-xl font-bold ${
                              item.isPercent
                                ? 'text-[#F5F5F7]'
                                : item.value >= 0
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}
                          >
                            {item.isPercent
                              ? item.value
                              : `${item.value >= 0 ? '+' : ''}$${item.value.toFixed(2)}`}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={pnlData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#FF7A00" opacity={0.1} />
                        <XAxis
                          dataKey="name"
                          stroke="#A9A9B1"
                          tick={{ fill: '#A9A9B1', fontSize: 10 }}
                        />
                        <YAxis stroke="#A9A9B1" tick={{ fill: '#A9A9B1', fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="profit" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="loss" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Portfolio Health Radar Chart */}
                {aiInsights && radarData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onMouseEnter={() => setHoveredChart('radar')}
                    onMouseLeave={() => setHoveredChart(null)}
                    className="bg-[#1A1A1C] border border-[#FF7A00]/20 rounded-2xl p-6 hover:border-[#FF7A00] transition-all backdrop-blur-xl relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/0 to-[#FFA64D]/0 group-hover:from-[#FF7A00]/5 group-hover:to-[#FFA64D]/5 transition-all duration-500"
                    />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="flex items-center gap-2 text-xl font-bold text-[#F5F5F7]">
                          <motion.div
                            animate={hoveredChart === 'radar' ? { rotate: 360 } : {}}
                            transition={{ duration: 0.8 }}
                          >
                            <FaCompass className="text-[#FF7A00]" />
                          </motion.div>
                          Portfolio Radar
                        </h3>
                        <span className="text-xs bg-[#FF7A00]/20 text-[#FF7A00] px-3 py-1 rounded-full font-bold">
                          AI Powered
                        </span>
                      </div>

                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#FF7A00" opacity={0.2} />
                          <PolarAngleAxis dataKey="metric" stroke="#A9A9B1" tick={{ fill: '#A9A9B1' }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#A9A9B1" />
                          <Radar
                            name="Score"
                            dataKey="value"
                            stroke="#FF7A00"
                            fill="#FF7A00"
                            fillOpacity={0.6}
                            animationDuration={1000}
                          />
                          <Tooltip content={<CustomTooltip />} />
                        </RadarChart>
                      </ResponsiveContainer>

                      <div className="grid grid-cols-5 gap-2 mt-4">
                        {radarData.map((item, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="text-center"
                          >
                            <div className="text-2xl font-bold text-[#FF7A00]">{item.value}</div>
                            <div className="text-xs text-[#A9A9B1]">{item.metric}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Trading Profile */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#1A1A1C] border border-[#FF7A00]/20 rounded-2xl p-6 hover:border-[#FF7A00] transition-all backdrop-blur-xl lg:col-span-2"
                >
                  <h3 className="flex items-center gap-2 text-xl font-bold text-[#F5F5F7] mb-6">
                    <FaBolt className="text-[#FF7A00]" />
                    Trading Profile
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Type', value: analytics.tradingType, icon: FaUser, color: 'orange' },
                      {
                        label: 'Wallet Age',
                        value: `${analytics.walletAge}d`,
                        icon: FaHistory,
                        color: 'blue'
                      },
                      {
                        label: 'Total Tx',
                        value: analytics.totalTransactions,
                        icon: FaExchangeAlt,
                        color: 'purple'
                      },
                      {
                        label: 'Avg Tx/Day',
                        value: analytics.avgTransactionsPerDay,
                        icon: FaChartBar,
                        color: 'green'
                      }
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-[#0B0B0C] rounded-xl p-4 border border-[#FF7A00]/10 hover:border-[#FF7A00]/30 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[#A9A9B1] text-xs">{item.label}</span>
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className={`p-2 rounded-lg bg-gradient-to-br ${
                              item.color === 'orange'
                                ? 'from-orange-500/20 to-amber-500/20'
                                : item.color === 'blue'
                                ? 'from-blue-500/20 to-cyan-500/20'
                                : item.color === 'purple'
                                ? 'from-purple-500/20 to-pink-500/20'
                                : 'from-green-500/20 to-emerald-500/20'
                            }`}
                          >
                            <item.icon className="text-[#FF7A00]" />
                          </motion.div>
                        </div>
                        <div className="text-2xl font-bold text-[#F5F5F7] group-hover:text-[#FF7A00] transition-colors">
                          {item.value}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

                       {/* HOLDINGS TAB */}
                       {activeTab === 'holdings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#1A1A1C] border border-[#FF7A00]/20 rounded-2xl overflow-hidden backdrop-blur-xl"
              >
                <div className="p-6 border-b border-[#FF7A00]/10">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-[#F5F5F7]">
                      <FaCoins className="text-[#FF7A00]" />
                      Token Holdings
                      <span className="text-sm font-normal text-[#A9A9B1]">
                        ({analytics.topHoldings.length} tokens)
                      </span>
                    </h3>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-[#0B0B0C] hover:bg-[#FF7A00]/20 border border-[#FF7A00]/20 hover:border-[#FF7A00] rounded-lg text-sm text-[#A9A9B1] hover:text-[#FF7A00] transition-all flex items-center gap-2"
                      >
                        <FaFilter />
                        Filter
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-[#0B0B0C] hover:bg-[#FF7A00]/20 border border-[#FF7A00]/20 hover:border-[#FF7A00] rounded-lg text-sm text-[#A9A9B1] hover:text-[#FF7A00] transition-all flex items-center gap-2"
                      >
                        <FaSort />
                        Sort
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0B0B0C] border-b border-[#FF7A00]/10">
                      <tr>
                        <th className="text-left px-6 py-4 text-[#A9A9B1] text-sm font-semibold">Rank</th>
                        <th className="text-left px-6 py-4 text-[#A9A9B1] text-sm font-semibold">Token</th>
                        <th className="text-right px-6 py-4 text-[#A9A9B1] text-sm font-semibold">Balance</th>
                        <th className="text-right px-6 py-4 text-[#A9A9B1] text-sm font-semibold">Value (USD)</th>
                        <th className="text-right px-6 py-4 text-[#A9A9B1] text-sm font-semibold">Price</th>
                        {/* <th className="text-right px-6 py-4 text-[#A9A9B1] text-sm font-semibold">24h Change</th> */}
                        <th className="text-left px-6 py-4 text-[#A9A9B1] text-sm font-semibold">Chain</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topHoldings.map((token, idx) => (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ backgroundColor: 'rgba(255, 122, 0, 0.05)' }}
                          className="border-b border-[#FF7A00]/5 cursor-pointer group"
                        >
                          <td className="px-6 py-4">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 360 }}
                              transition={{ duration: 0.3 }}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                                idx === 0
                                  ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white'
                                  : idx === 1
                                  ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
                                  : idx === 2
                                  ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white'
                                  : 'bg-[#FF7A00]/10 text-[#FF7A00]'
                              }`}
                            >
                              {idx + 1}
                            </motion.div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {token.logo ? (
                                <motion.img
                                  whileHover={{ scale: 1.2, rotate: 360 }}
                                  transition={{ duration: 0.3 }}
                                  src={token.logo}
                                  alt={token.symbol}
                                  className="w-12 h-12 rounded-full bg-[#0B0B0C] border-2 border-[#FF7A00]/20 group-hover:border-[#FF7A00]"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#FFA64D] flex items-center justify-center font-bold text-white">
                                  {token.symbol.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-[#F5F5F7] group-hover:text-[#FF7A00] transition-colors">
                                  {token.name}
                                </div>
                                <div className="text-sm text-[#A9A9B1] font-mono">{token.symbol}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="font-semibold text-[#F5F5F7]">
                              {parseFloat(token.balance).toFixed(4)}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="font-bold text-[#FF7A00] text-lg">
                              ${token.valueUSD.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="text-sm text-[#A9A9B1]">
                              ${token.priceUSD.toFixed(4)}
                            </div>
                          </td>

                          {/* <td className="px-6 py-4 text-right">
                            <motion.span
                              whileHover={{ scale: 1.1 }}
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-bold ${
                                token.percentChange24h >= 0
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {token.percentChange24h >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                              {Math.abs(token.percentChange24h).toFixed(2)}%
                            </motion.span>
                          </td> */}

                          <td className="px-6 py-4">
                            <span className="inline-block px-3 py-1 bg-[#0B0B0C] border border-[#FF7A00]/20 rounded-lg text-sm text-[#A9A9B1]">
                              {token.chainName}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* CHAINS TAB */}
            {activeTab === 'chains' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {walletData.chainResults
                  .filter((c) => c.hasAssets)
                  .map((chain, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9}}
                      animate={{ opacity: 1, scale: 1}}
                      transition={{ delay: idx * 0.1, type: 'spring' }}
                      whileHover={{ scale: 1.02, y: -8 }}
                      className="bg-gradient-to-br from-[#1A1A1C] to-[#0B0B0C] border border-[#FF7A00]/20 rounded-2xl p-6 hover:border-[#FF7A00] transition-all backdrop-blur-xl relative overflow-hidden group cursor-pointer"
                    >
                      {/* Animated background */}  
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/0 to-[#FFA64D]/0 group-hover:from-[#FF7A00]/10 group-hover:to-[#FFA64D]/5 transition-all duration-500"
                      />

                      <div className="relative z-10">
                        {/* Chain Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div>
                              <h3 className="font-bold text-[#F5F5F7] text-xl group-hover:text-[#FF7A00] transition-colors">
                                {chain.chainName}
                              </h3>
                              <p className="text-sm text-[#A9A9B1] font-mono">{chain.symbol}</p>
                            </div>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="p-3 rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FFA64D]"
                          >
                            <FaGlobe className="text-[#0B0B0C] text-xl" />
                          </motion.div>
                        </div>

                        {/* Total Value */}
                        <div className="mb-6 p-4 bg-[#0B0B0C] rounded-xl border border-[#FF7A00]/20">
                          <div className="text-xs text-[#A9A9B1] mb-2">Total Value</div>
                          <div className="text-3xl font-bold text-[#FF7A00]">
                            ${chain.totalValue.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-[#0B0B0C] rounded-xl p-4 border border-[#FF7A00]/10 hover:border-[#FF7A00]/30 transition-all"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <FaCoins className="text-[#FF7A00]" />
                              <div className="text-xs text-[#A9A9B1]">Tokens</div>
                            </div>
                            <div className="text-2xl font-bold text-[#F5F5F7]">{chain.tokenCount}</div>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-[#0B0B0C] rounded-xl p-4 border border-[#FF7A00]/10 hover:border-[#FF7A00]/30 transition-all"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <FaHistory className="text-[#FF7A00]" />
                              <div className="text-xs text-[#A9A9B1]">Transactions</div>
                            </div>
                            <div className="text-2xl font-bold text-[#F5F5F7]">{chain.txCount}</div>
                          </motion.div>
                        </div>

                        {/* Top Tokens */}
                        <div className="space-y-2">
                          <div className="text-xs text-[#A9A9B1] font-semibold mb-3">Top Tokens</div>
                          {chain.tokens.slice(0, 5).map((token, tidx) => (
                            <motion.div
                              key={tidx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: tidx * 0.1 }}
                              whileHover={{ x: 5, backgroundColor: 'rgba(255, 122, 0, 0.1)' }}
                              className="flex items-center justify-between bg-[#0B0B0C] rounded-lg px-3 py-2 border border-[#FF7A00]/10 hover:border-[#FF7A00]/30 transition-all"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#FF7A00]" />
                                <span className="text-sm text-[#F5F5F7] font-medium">{token.symbol}</span>
                              </div>
                              <span className="text-sm text-[#FF7A00] font-bold">
                                ${token.valueUSD.toFixed(2)}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}

            {/* PNL TAB */}
            {activeTab === 'pnl' && (
              <div className="space-y-6">
                {/* PnL Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      label: 'Total P&L',
                      value: analytics.totalPnL,
                      icon: analytics.totalPnL >= 0 ? FaTrophy : FaExclamationTriangle,
                      gradient: analytics.totalPnL >= 0 ? 'from-green-500/20 to-emerald-500/10' : 'from-red-500/20 to-rose-500/10'
                    },
                    {
                      label: 'Realized P&L',
                      value: analytics.totalRealizedPnL,
                      icon: FaCheckCircle,
                      gradient: 'from-blue-500/20 to-cyan-500/10'
                    },
                    {
                      label: 'Unrealized P&L',
                      value: analytics.totalUnrealizedPnL,
                      icon: FaClock,
                      gradient: 'from-purple-500/20 to-pink-500/10'
                    }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className={`bg-gradient-to-br ${item.gradient} border border-[#FF7A00]/20 rounded-2xl p-6 hover:border-[#FF7A00] transition-all`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FFA64D]">
                          <item.icon className="text-[#0B0B0C] text-xl" />
                        </div>
                        <span className="text-sm text-[#A9A9B1]">{item.label}</span>
                      </div>
                      <div
                        className={`text-4xl font-bold ${
                          item.value >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {item.value >= 0 ? '+' : ''}${item.value.toFixed(2)}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* PnL Table */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-[#1A1A1C] border border-[#FF7A00]/20 rounded-2xl overflow-hidden backdrop-blur-xl"
                >
                  <div className="p-6 border-b border-[#FF7A00]/10">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-[#F5F5F7]">
                      <FaChartLine className="text-[#FF7A00]" />
                      Token Performance
                      <span className="text-sm font-normal text-[#A9A9B1]">
                        (Profit & Loss Analysis)
                      </span>
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#0B0B0C] border-b border-[#FF7A00]/10">
                        <tr>
                          <th className="text-left px-6 py-4 text-[#A9A9B1] text-sm font-semibold">Token</th>
                          <th className="text-right px-6 py-4 text-[#A9A9B1] text-sm font-semibold">Entry Price</th>
                          <th className="text-right px-6 py-4 text-[#A9A9B1] text-sm font-semibold">Current Price</th>
                          {/* <th className="text-right px-6 py-4 text-[#A9A9B1] text-sm font-semibold">Realized P&L</th> */}
                          <th className="text-right px-6 py-4 text-[#A9A9B1] text-sm font-semibold">Unrealized P&L</th>
                          <th className="text-right px-6 py-4 text-[#A9A9B1] text-sm font-semibold">Total P&L</th>
                          {/* <th className="text-right px-6 py-4 text-[#A9A9B1] text-sm font-semibold">% Change</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.values(analytics.pnlData).map((token, idx) => (
                          <motion.tr
                            key={idx}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ backgroundColor: 'rgba(255, 122, 0, 0.05)' }}
                            className="border-b border-[#FF7A00]/5 group"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-semibold text-[#F5F5F7] group-hover:text-[#FF7A00] transition-colors">
                                  {token.symbol}
                                </div>
                                <div className="text-sm text-[#A9A9B1]">{token.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-[#F5F5F7]">
                              ${token.entryPrice.toFixed(4)}
                            </td>
                            <td className="px-6 py-4 text-right text-[#F5F5F7]">
                              ${token.currentPrice.toFixed(4)}
                            </td>
                            {/* <td className="px-6 py-4 text-right">
                              <span
                                className={`font-bold ${
                                  token.realizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}
                              >
                                {token.realizedPnL >= 0 ? '+' : ''}${token.realizedPnL.toFixed(2)}
                              </span>
                            </td> */}
                            <td className="px-6 py-4 text-right">
                              <span
                                className={`font-bold ${
                                  token.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}
                              >
                                {token.unrealizedPnL >= 0 ? '+' : ''}${token.unrealizedPnL.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span
                                className={`text-lg font-bold ${
                                  token.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}
                              >
                                {token.totalPnL >= 0 ? '+' : ''}${token.totalPnL.toFixed(2)}
                              </span>
                            </td>
                            {/* <td className="px-6 py-4 text-right">
                              <motion.span
                                whileHover={{ scale: 1.1 }}
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-bold ${
                                  token.profitPercent >= 0
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}
                              >
                                {token.profitPercent >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                                {Math.abs(token.profitPercent).toFixed(1)}%
                              </motion.span>
                            </td> */}
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </div>
            )}

            {/* AI INSIGHTS TAB */}
            {activeTab === 'insights' && aiInsights && (
              <div className="space-y-6">
                {/* AI Scores */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { label: 'Portfolio', value: aiInsights.scores?.portfolio, icon: FaTrophy, color: 'from-yellow-500 to-orange-500' },
                    { label: 'Risk', value: aiInsights.scores?.risk, icon: FaShieldAlt, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Performance', value: aiInsights.scores?.performance, icon: FaRocket, color: 'from-purple-500 to-pink-500' },
                    { label: 'Diversification', value: aiInsights.scores?.diversification, icon: FaChartPie, color: 'from-green-500 to-emerald-500' },
                    { label: 'Activity', value: aiInsights.scores?.activity, icon: FaBolt, color: 'from-orange-500 to-red-500' },
                    { label: 'Overall', value: aiInsights.scores?.overall, icon: FaStar, color: 'from-pink-500 to-rose-500' }
                  ].map((score, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1, type: 'spring' }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="bg-[#1A1A1C] border border-[#FF7A00]/20 rounded-2xl p-6 hover:border-[#FF7A00] transition-all text-center"
                    >
                      {/* <motion.div
                        className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${score.color} flex items-center justify-center shadow-lg`}
                      >
                        <score.icon className="text-white text-2xl" />
                      </motion.div> */}
                      <div className="text-[#A9A9B1] text-xs mb-2">{score.label}</div>
                      <div className="text-4xl font-bold text-[#F5F5F7]">{score.value}</div>
                      <div className="text-xs text-[#A9A9B1] mt-1">/100</div>
                    </motion.div>
                  ))}
                </div>

                {/* AI Insights */}
                {aiInsights.insights && aiInsights.insights.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-[#1A1A1C] border border-[#FF7A00]/20 rounded-2xl p-6 backdrop-blur-xl"
                  >
                    <h3 className="flex items-center gap-2 text-xl font-bold text-[#F5F5F7] mb-6">
                      <FaLightbulb className="text-[#FF7A00]" />
                      AI Insights
                      <span className="text-xs bg-[#FF7A00]/20 text-[#FF7A00] px-2 py-1 rounded-full">
                        {aiInsights.insights.length} insights
                      </span>
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {aiInsights.insights.map((insight, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setSelectedInsight(selectedInsight === idx ? null : idx)}
                          className={`flex gap-4 p-5 rounded-xl border-l-4 cursor-pointer transition-all ${
                            insight.type === 'positive'
                              ? 'bg-green-500/5 border-green-500 hover:bg-green-500/10'
                              : insight.type === 'warning'
                              ? 'bg-yellow-500/5 border-yellow-500 hover:bg-yellow-500/10'
                              : 'bg-blue-500/5 border-blue-500 hover:bg-blue-500/10'
                          }`}
                        >
                          <span className="text-3xl">{insight.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-bold text-[#F5F5F7]">{insight.title}</h4>
                              <span className="text-xs bg-[#0B0B0C] px-2 py-1 rounded text-[#FF7A00]">
                                {insight.confidence}% confidence
                              </span>
                            </div>
                            <p className="text-[#A9A9B1] text-sm leading-relaxed">{insight.message}</p>
                            {selectedInsight === idx && insight.category && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-3 pt-3 border-t border-[#FF7A00]/10"
                              >
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-[#A9A9B1]">Category:</span>
                                  <span className="px-2 py-1 bg-[#0B0B0C] rounded text-[#FF7A00]">
                                    {insight.category}
                                  </span>
                                  <span className="text-[#A9A9B1]">Impact:</span>
                                  <span className={`px-2 py-1 rounded ${
                                    insight.impact === 'high' || insight.impact === 'critical'
                                      ? 'bg-red-500/20 text-red-400'
                                      : insight.impact === 'medium'
                                      ? 'bg-yellow-500/20 text-yellow-400'
                                      : 'bg-blue-500/20 text-blue-400'
                                  }`}>
                                    {insight.impact}
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Recommendations */}
                {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-[#1A1A1C] border border-[#FF7A00]/20 rounded-2xl p-6 backdrop-blur-xl"
                  >
                    <h3 className="flex items-center gap-2 text-xl font-bold text-[#F5F5F7] mb-6">
                      <FaBrain className="text-[#FF7A00]" />
                      Smart Recommendations
                    </h3>

                    <div className="space-y-6">
                      {aiInsights.recommendations.map((rec, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-[#0B0B0C] border border-[#FF7A00]/10 rounded-xl p-6 hover:border-[#FF7A00]/30 transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-4xl">{rec.icon}</span>
                              <div>
                                <h4 className="font-bold text-[#F5F5F7] text-lg">{rec.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`text-xs px-3 py-1 rounded-full font-bold ${
                                      rec.priority === 'High'
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        : rec.priority === 'Medium'
                                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    }`}
                                  >
                                    {rec.priority} Priority
                                  </span>
                                  {rec.timeframe && (
                                    <span className="text-xs text-[#A9A9B1]">
                                      ⏱ {rec.timeframe}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <p className="text-[#A9A9B1] mb-4 leading-relaxed">{rec.description}</p>

                          {rec.actions && rec.actions.length > 0 && (
                            <div>
                              <div className="text-[#FF7A00] font-semibold text-sm mb-3 flex items-center gap-2">
                                <FaCheckCircle />
                                Action Steps:
                              </div>
                              <ul className="space-y-2">
                                {rec.actions.map((action, aidx) => (
                                  <motion.li
                                    key={aidx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: aidx * 0.1 }}
                                    className="flex items-start gap-3 text-[#A9A9B1] text-sm p-3 bg-[#1A1A1C] rounded-lg hover:bg-[#FF7A00]/5 transition-colors"
                                  >
                                    <FaChevronRight className="text-[#FF7A00] mt-1 flex-shrink-0" />
                                    <span>{action}</span>
                                  </motion.li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {rec.metrics && (
                            <div className="mt-4 pt-4 border-t border-[#FF7A00]/10">
                              <div className="text-xs text-[#A9A9B1] mb-2">Expected Outcomes:</div>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(rec.metrics).map(([key, value], midx) => (
                                  <span
                                    key={midx}
                                    className="px-3 py-1 bg-[#1A1A1C] rounded-lg text-xs text-[#FF7A00]"
                                  >
                                    {key.replace(/([A-Z])/g, ' $1').trim()}: {value}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Predictions */}
                {aiInsights.predictions && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-br from-[#1A1A1C] to-[#0B0B0C] border border-[#FF7A00]/20 rounded-2xl p-6 backdrop-blur-xl"
                  >
                    <h3 className="flex items-center gap-2 text-xl font-bold text-[#F5F5F7] mb-6">
                      <FaMagic className="text-[#FF7A00]" />
                      AI Predictions
                      <span className="text-xs bg-[#FF7A00]/20 text-[#FF7A00] px-2 py-1 rounded-full">
                        Powered by ML
                      </span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {aiInsights.predictions.shortTerm && (
                        <div className="bg-[#0B0B0C] rounded-xl p-5 border border-[#FF7A00]/10">
                          <div className="flex items-center gap-2 mb-4">
                            <FaBolt className="text-[#FF7A00]" />
                            <h4 className="font-bold text-[#F5F5F7]">Short Term (7 days)</h4>
                          </div>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#A9A9B1]">Outlook:</span>
                              <span className="text-[#FF7A00] font-bold capitalize">
                                {aiInsights.predictions.shortTerm.outlook}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#A9A9B1]">Confidence:</span>
                              <span className="text-[#F5F5F7]">{aiInsights.predictions.shortTerm.confidence}%</span>
                            </div>
                            {aiInsights.predictions.shortTerm.projectedRange && (
                              <div className="pt-3 border-t border-[#FF7A00]/10">
                                <div className="text-xs text-[#A9A9B1] mb-2">Projected Range:</div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-green-400">Optimistic:</span>
                                    <span className="text-[#F5F5F7]">
                                      ${aiInsights.predictions.shortTerm.projectedRange.optimistic.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-yellow-400">Realistic:</span>
                                    <span className="text-[#F5F5F7]">
                                      ${aiInsights.predictions.shortTerm.projectedRange.realistic.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-red-400">Pessimistic:</span>
                                    <span className="text-[#F5F5F7]">
                                      ${aiInsights.predictions.shortTerm.projectedRange.pessimistic.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {aiInsights.predictions.mediumTerm && (
                        <div className="bg-[#0B0B0C] rounded-xl p-5 border border-[#FF7A00]/10">
                          <div className="flex items-center gap-2 mb-4">
                            <FaCompass className="text-[#FF7A00]" />
                            <h4 className="font-bold text-[#F5F5F7]">Medium Term (30 days)</h4>
                          </div>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#A9A9B1]">Outlook:</span>
                              <span className="text-[#FF7A00] font-bold capitalize">
                                {aiInsights.predictions.mediumTerm.outlook}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#A9A9B1]">Confidence:</span>
                              <span className="text-[#F5F5F7]">{aiInsights.predictions.mediumTerm.confidence}%</span>
                            </div>
                            {aiInsights.predictions.mediumTerm.projectedRange && (
                              <div className="pt-3 border-t border-[#FF7A00]/10">
                                <div className="text-xs text-[#A9A9B1] mb-2">Projected Range:</div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-green-400">Optimistic:</span>
                                    <span className="text-[#F5F5F7]">
                                      ${aiInsights.predictions.mediumTerm.projectedRange.optimistic.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-yellow-400">Realistic:</span>
                                    <span className="text-[#F5F5F7]">
                                      ${aiInsights.predictions.mediumTerm.projectedRange.realistic.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-red-400">Pessimistic:</span>
                                    <span className="text-[#F5F5F7]">
                                      ${aiInsights.predictions.mediumTerm.projectedRange.pessimistic.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
            {activeTab === 'tasks' && aiInsights && (
              <div>
                <AlfredoTaskCenter/>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* AI Chat Sidebar - Enhanced */}
      <AnimatePresence>
        {showChat && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChat(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[450px] lg:w-[550px] bg-gradient-to-br from-[#1A1A1C] to-[#0B0B0C] border-l-2 border-[#FF7A00]/30 z-50 flex flex-col shadow-2xl"
            >
              {/* Enhanced Chat Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#FF7A00]/20 bg-gradient-to-r from-[#1A1A1C] to-[#1A1A1C]/95">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-bold text-[#F5F5F7] flex items-center gap-2">
                      Alfredo AI
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 bg-green-400 rounded-full"
                      />
                    </h3>
                    <p className="text-xs text-[#A9A9B1]">Your Portfolio Analyst</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowChat(false)}
                  className="p-2 hover:bg-[#FF7A00]/20 rounded-lg transition-all"
                >
                  <FaTimes className="text-[#A9A9B1] hover:text-[#FF7A00]" />
                </motion.button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-[#0B0B0C]/50">
                {chatMessages.length === 0 && (
                  <div className="text-center py-12">
                    <h4 className="text-xl font-bold text-[#F5F5F7] mb-3">
                      Ask Me Anything!
                    </h4>
                    <p className="text-[#A9A9B1] text-sm mb-8 max-w-sm mx-auto">
                      I can analyze your portfolio, explain risks, identify opportunities, and suggest strategies.
                    </p>
                    <div className="space-y-3">
                      {[
                        '🎯 What are my biggest risks?',
                        '📊 Should I rebalance my portfolio?',
                        '💎 Which tokens look promising?',
                        '🔮 Whats my growth potential?'
                      ].map((q, idx) => (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setUserInput(q.substring(2))}
                          className="w-full text-left px-5 py-4 bg-gradient-to-r from-[#1A1A1C] to-[#0B0B0C] hover:from-[#FF7A00]/20 hover:to-[#FFA64D]/10 border border-[#FF7A00]/20 hover:border-[#FF7A00] rounded-xl text-sm text-[#A9A9B1] hover:text-[#FF7A00] transition-all group"
                        >
                          <span className="group-hover:translate-x-2 inline-block transition-transform">
                            {q}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {chatMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-[#FF7A00] to-[#FFA64D] text-[#0B0B0C] shadow-lg shadow-[#FF7A00]/30'
                          : 'bg-gradient-to-br from-[#1A1A1C] to-[#0B0B0C] text-[#F5F5F7] border border-[#FF7A00]/20'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => (
                                <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
                              ),
                              li: ({ children }) => <li className="mb-1">{children}</li>,
                              strong: ({ children }) => (
                                <strong className="text-[#FF7A00] font-bold">{children}</strong>
                              ),
                              code: ({ children }) => (
                                <code className="bg-[#0B0B0C] px-2 py-1 rounded text-[#FF7A00] font-mono text-xs">
                                  {children}
                                </code>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-lg font-bold text-[#FF7A00] mb-2 mt-3">
                                  {children}
                                </h3>
                              )
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="text-sm font-medium">{message.content}</div>
                      )}
                      <div
                        className={`text-xs mt-2 flex items-center gap-2 ${
                          message.role === 'user' ? 'text-[#0B0B0C]/70' : 'text-[#A9A9B1]'
                        }`}
                      >
                        <FaClock className="text-[10px]" />
                        {message.timestamp}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gradient-to-br from-[#1A1A1C] to-[#0B0B0C] border border-[#FF7A00]/20 rounded-2xl px-5 py-4 shadow-lg">
                      <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2.5 h-2.5 bg-[#FF7A00] rounded-full"
                            animate={{ y: [0, -10, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Enhanced Chat Input */}
              <div className="p-6 border-t border-[#FF7A00]/20 bg-gradient-to-t from-[#0B0B0C] to-transparent">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Ask about your portfolio..."
                    disabled={isTyping}
                    className="flex-1 bg-[#1A1A1C] border-2 border-[#FF7A00]/20 focus:border-[#FF7A00] rounded-xl px-5 py-4 text-[#F5F5F7] placeholder-[#A9A9B1] outline-none transition-all disabled:opacity-50"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendChatMessage}
                    disabled={!userInput.trim() || isTyping}
                    className="px-6 py-4 bg-gradient-to-r from-[#FF7A00] to-[#FFA64D] text-[#0B0B0C] rounded-xl font-bold hover:shadow-2xl hover:shadow-[#FF7A00]/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
                  >
                    <motion.div
                      animate={isTyping ? { rotate: 0 } : {}}
                      transition={{ duration: 1, repeat: isTyping ? Infinity : 0, ease: 'linear' }}
                    >
                      <FaPaperPlane />
                    </motion.div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AIPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
          <div className="text-center">
            <div className="text-[#F5F5F7] text-xl font-bold">Loading Alfredo AI...</div>
          </div>
        </div>
      }
    >
      <AIDashboard />
    </Suspense>
  );
}
