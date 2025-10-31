'use client'
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import {
  FaArrowLeft, FaWallet, FaChartLine, FaExchangeAlt, FaShieldAlt, FaRobot, FaPaperPlane,
  FaCheckCircle, FaExclamationTriangle, FaCopy, FaExternalLinkAlt, FaGasPump, FaFileContract,
  FaHistory, FaClock, FaCoins, FaChartPie, FaFire, FaLightbulb, FaBolt, FaTrophy, FaRocket,
  FaChartBar, FaLayerGroup, FaGem, FaDownload, FaShare, FaStar, FaGlobe, FaBrain, FaEye,
  FaExpand, FaCompress, FaFilter, FaSort, FaSearch, FaInfoCircle, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import { HiSparkles, HiLightningBolt, HiTrendingUp, HiTrendingDown, HiRefresh } from 'react-icons/hi';
import { BiPieChartAlt2, BiTargetLock, BiTrendingUp } from 'react-icons/bi';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ComposedChart, Scatter, ScatterChart, ZAxis, Treemap
} from 'recharts';
import { Tab } from '@headlessui/react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatEndRef = useRef(null);
  
  const wallet = searchParams.get('wallet');
  const network = searchParams.get('network');
  
  const [isLoading, setIsLoading] = useState(true);
  const [walletData, setWalletData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [filterMode, setFilterMode] = useState('all');
  const [sortMode, setSortMode] = useState('value');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!wallet || !network) {
      toast.error('Missing wallet address or network');
      router.push('/');
      return;
    }
    fetchAllData();
    addWelcomeMessage();
  }, [wallet, network]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      
      const walletResponse = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, network })
      });
      
      if (!walletResponse.ok) {
        throw new Error('Failed to fetch wallet data');
      }

      const walletResult = await walletResponse.json();
      
      if (!walletResult.success) {
        throw new Error(walletResult.error || 'Unknown error');
      }

      setWalletData(walletResult.data);
      toast.success('Wallet data loaded successfully');

      await Promise.all([
        fetchRecommendations(walletResult.data),
        fetchAIInsights(walletResult.data)
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to load wallet data');
      setIsLoading(false);
    }
  };

  const fetchAIInsights = async (data) => {
    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletData: data })
      });
      
      const result = await response.json();
      if (result.success) {
        setAiInsights(result.insights);
      }
    } catch (error) {
      console.error('AI Insights Error:', error);
    }
  };

  const fetchRecommendations = async (data) => {
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletData: data, riskProfile: data.riskAssessment.level })
      });
      
      const result = await response.json();
      if (result.success) {
        setRecommendations(result.recommendations);
      }
    } catch (error) {
      console.error('Recommendations Error:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.loading('Refreshing data...');
    await fetchAllData();
    setIsRefreshing(false);
    toast.dismiss();
    toast.success('Data refreshed');
  };

  const addWelcomeMessage = () => {
    const welcomeMsg = {
      id: Date.now(),
      role: 'assistant',
      content: `🚀 Welcome! I'm Alfredo AI, your advanced crypto portfolio assistant powered by real-time blockchain data and AI intelligence. I've successfully analyzed your ${network} wallet.

I can help you with:
• Portfolio optimization strategies
• Risk assessment and management
• Token analysis and recommendations
• Market trends and predictions
• Gas optimization tips
• DeFi opportunities

What would you like to know about your portfolio?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages([welcomeMsg]);
  };

  const sendChatMessage = async () => {
    if (!userInput.trim() || isTyping || !walletData) return;
    
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
      const contextData = `
Portfolio Overview:
- Total Value: $${walletData.portfolio.totalValueUSD}
- Native Balance: ${walletData.balance.native} ${walletData.balance.symbol} ($${walletData.balance.valueUSD})
- Total Tokens: ${walletData.portfolio.totalTokens}
- 24h Change: ${walletData.portfolio.change24h}%
- Profitable Tokens: ${walletData.portfolio.profitableTokens}/${walletData.portfolio.totalTokens}

Transaction Stats:
- Total: ${walletData.statistics.totalTransactions}
- Success Rate: ${walletData.statistics.successRate}%
- Failed: ${walletData.statistics.failedTransactions}
- Gas Spent: ${walletData.statistics.totalGasSpent} ${walletData.balance.symbol}

Wallet Info:
- Age: ${walletData.statistics.walletAge} days
- Network: ${network}
- Risk Level: ${walletData.riskAssessment.level} (${walletData.riskAssessment.score}/100)

Top Holdings:
${walletData.topTokens.slice(0, 5).map((t, i) => `${i + 1}. ${t.name}: $${parseFloat(t.value).toFixed(2)} (${t.percentage}%)`).join('\n')}

${aiInsights ? `
AI Insights:
- Portfolio Score: ${aiInsights.portfolioScore}/100
- Trading Behavior: ${aiInsights.tradingBehavior.type}
- Diversification: ${aiInsights.diversificationScore.level} (${aiInsights.diversificationScore.score}/100)
- Activity Pattern: ${aiInsights.activityPattern.pattern}
` : ''}`;

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are Alfredo AI, an elite crypto portfolio analyst with deep expertise in blockchain, DeFi, trading strategies, and market analysis.

${contextData}

Your capabilities:
- Advanced portfolio analysis and optimization
- Risk assessment and management strategies
- Token-specific insights and predictions
- Market timing and trend analysis
- Gas optimization recommendations
- DeFi opportunity identification
- Tax optimization strategies
- Security best practices

Guidelines:
- Be conversational yet professional
- Provide data-driven insights
- Give actionable recommendations
- Explain complex concepts clearly
- Use emojis sparingly for emphasis
- Reference specific numbers from the data
- Acknowledge limitations when uncertain

Current context: User has ${walletData.statistics.totalTransactions} transactions, ${walletData.portfolio.totalTokens} tokens worth $${walletData.portfolio.totalValueUSD}`
            },
            ...chatMessages.slice(-10).map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: "user",
              content: currentInput
            }
          ],
          model: "gpt-3.5-turbo",
          temperature: 0.7,
          max_tokens: 800
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseContent = data.choices?.[0]?.message?.content || data.response || 
          `Based on your portfolio analysis, here are some insights: Your portfolio is worth $${walletData.portfolio.totalValueUSD} with ${walletData.portfolio.totalTokens} tokens. Your ${walletData.riskAssessment.level.toLowerCase()} risk profile suggests a ${aiInsights?.tradingBehavior.type || 'balanced'} approach.`;
        
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setChatMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Chat API failed');
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const fallbackMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `I've analyzed your portfolio data. You have $${walletData.portfolio.totalValueUSD} across ${walletData.portfolio.totalTokens} tokens with a ${walletData.riskAssessment.level.toLowerCase()} risk level. ${aiInsights ? `Your trading behavior shows you're a ${aiInsights.tradingBehavior.type}. ` : ''}Would you like specific recommendations?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(walletData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alfredo-wallet-${wallet.slice(0, 8)}-${Date.now()}.json`;
    link.click();
    toast.success('Data exported successfully');
  };

  const getFilteredTokens = () => {
    if (!walletData) return [];
    
    let filtered = [...walletData.tokens];
    
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterMode === 'profitable') {
      filtered = filtered.filter(t => t.percentChange24h > 0);
    } else if (filterMode === 'losing') {
      filtered = filtered.filter(t => t.percentChange24h < 0);
    }

    if (sortMode === 'value') {
      filtered.sort((a, b) => b.valueUSD - a.valueUSD);
    } else if (sortMode === 'change') {
      filtered.sort((a, b) => b.percentChange24h - a.percentChange24h);
    } else if (sortMode === 'balance') {
      filtered.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
    }

    return filtered;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0A07] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#FF8C00]/20 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#FFB347]/20 blur-3xl"
          />
        </div>
        
        <motion.div className="relative z-10 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 border-4 border-[#FF8C00] border-t-transparent rounded-full mx-auto mb-8"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-white text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <HiSparkles className="text-[#FF8C00]" />
              Analyzing Your Wallet
            </p>
            <p className="text-[#C9C3BD] text-sm">Fetching real-time data from {network} blockchain...</p>
          </motion.div>
          
          <div className="mt-8 space-y-2">
            {['Scanning transactions', 'Analyzing tokens', 'Calculating metrics', 'Generating AI insights'].map((text, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.3 }}
                className="text-[#C9C3BD] text-sm flex items-center justify-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-[#FF8C00] animate-pulse" />
                {text}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="min-h-screen bg-[#0D0A07] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md bg-[#1A120C] rounded-2xl border border-[#2A1E14] p-8"
        >
          <div className="w-20 h-20 rounded-full bg-[#FF453A]/10 flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="text-[#FF453A] text-4xl" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-3">Failed to Load Wallet Data</h2>
          <p className="text-[#C9C3BD] mb-6">Please check your API configuration and try again</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-[#0D0A07] border border-[#2A1E14] rounded-xl text-white font-medium hover:border-[#FF8C00] transition-all"
            >
              Go Back
            </button>
            <button 
              onClick={fetchAllData}
              className="px-6 py-3 bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-[#FF8C00]/50 transition-all"
            >
              Retry
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const COLORS = ['#FF6A00', '#FF8C00', '#FFB347', '#FFA733', '#FF9500', '#FFC966', '#FFD699'];

  const portfolioDistribution = walletData.topTokens.map((token, idx) => ({
    name: token.name,
    value: parseFloat(token.value),
    percentage: parseFloat(token.percentage),
    fill: COLORS[idx % COLORS.length]
  }));

  const riskMetrics = [
    { metric: 'Diversification', score: Math.min((walletData.tokens.length / 10) * 100, 100) },
    { metric: 'Activity', score: Math.min((walletData.statistics.totalTransactions / 100) * 100, 100) },
    { metric: 'Success Rate', score: parseFloat(walletData.statistics.successRate) },
    { metric: 'Liquidity', score: parseFloat(walletData.balance.valueUSD) > 1000 ? 85 : 50 },
    { metric: 'Wallet Age', score: Math.min((walletData.statistics.walletAge / 365) * 100, 100) }
  ];

  return (
    <div className="min-h-screen bg-[#0D0A07]">
      <Toaster position="top-right" theme="dark" />
      
      {/* Premium Animated Header */}
      <div className="sticky top-0 z-50 backdrop-blur-2xl bg-[#1A120C]/95 border-b border-[#2A1E14] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF8C00]/5 to-transparent pointer-events-none" />
        <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-4 relative">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/')}
                className="p-3 rounded-xl bg-gradient-to-br from-[#0D0A07] to-[#1A120C] border border-[#2A1E14] text-[#C9C3BD] hover:text-white hover:border-[#FF8C00] transition-all shadow-lg group"
              >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              </motion.button>
              
              <div>
                <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white via-[#FFB347] to-[#FF8C00] bg-clip-text text-transparent flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <HiSparkles className="text-[#FF8C00]" />
                  </motion.div>
                  Advanced Portfolio Intelligence
                </h1>
                <div className="flex items-center gap-3 text-sm text-[#C9C3BD] mt-1">
                  <div className="flex items-center gap-2 bg-[#0D0A07] px-3 py-1 rounded-full border border-[#2A1E14]">
                    <span className="font-mono text-xs">
                      {wallet?.slice(0, 6)}...{wallet?.slice(-4)}
                    </span>
                    <button 
                      onClick={() => copyToClipboard(wallet)} 
                      className="hover:text-[#FF8C00] transition-colors"
                    >
                      <FaCopy className="text-xs" />
                    </button>
                  </div>
                  <a 
                    href={`https://${network === 'ethereum' ? '' : network + '.'}etherscan.io/address/${wallet}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-[#0D0A07] hover:text-[#FF8C00] transition-all"
                  >
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-3 rounded-xl bg-[#0D0A07] border border-[#2A1E14] text-[#C9C3BD] hover:text-white hover:border-[#FF8C00] transition-all disabled:opacity-50"
              >
                <motion.div
                  animate={isRefreshing ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
                >
                  <HiRefresh />
                </motion.div>
              </motion.button>

              <div className="px-4 py-2 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                <span className="text-[#C9C3BD] text-xs uppercase tracking-wide">Network</span>
                <p className="text-white font-bold capitalize text-sm">{network}</p>
              </div>

              <div className={`px-4 py-2 rounded-xl border ${
                walletData.riskAssessment.level === 'Low' ? 'bg-[#4CD964]/10 border-[#4CD964]/30' :
                walletData.riskAssessment.level === 'Medium' ? 'bg-[#FFB347]/10 border-[#FFB347]/30' :
                'bg-[#FF453A]/10 border-[#FF453A]/30'
              }`}>
                <span className="text-xs uppercase tracking-wide opacity-80">Risk</span>
                <p className={`font-bold text-sm ${
                  walletData.riskAssessment.level === 'Low' ? 'text-[#4CD964]' :
                  walletData.riskAssessment.level === 'Medium' ? 'text-[#FFB347]' : 'text-[#FF453A]'
                }`}>
                  {walletData.riskAssessment.level}
                </p>
              </div>

              <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] shadow-lg shadow-[#FF8C00]/30">
                <span className="text-white/80 text-xs uppercase tracking-wide">Total Value</span>
                <p className="text-white font-bold text-sm">{formatCurrency(walletData.portfolio.totalValueUSD)}</p>
              </div>

              <button
                onClick={exportData}
                className="p-3 rounded-xl bg-[#0D0A07] border border-[#2A1E14] text-[#C9C3BD] hover:text-white hover:border-[#FF8C00] transition-all"
              >
                <FaDownload />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* Main Dashboard - 3 columns */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* Hero Stats with Advanced Animations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: FaWallet,
                  label: 'Total Value',
                  value: formatCurrency(walletData.portfolio.totalValueUSD),
                  change: walletData.portfolio.change24h,
                  color: '#FF8C00',
                  gradient: 'from-[#FF6A00] to-[#FF8C00]'
                },
                {
                  icon: FaCoins,
                  label: 'Active Tokens',
                  value: walletData.portfolio.totalTokens,
                  subtitle: `${walletData.portfolio.profitableTokens} profitable`,
                  color: '#4CD964',
                  gradient: 'from-[#4CD964] to-[#34C759]'
                },
                {
                  icon: FaExchangeAlt,
                  label: 'Transactions',
                  value: walletData.statistics.totalTransactions,
                  subtitle: `${walletData.statistics.successRate}% success`,
                  color: '#FFB347',
                  gradient: 'from-[#FFB347] to-[#FFA733]'
                },
                {
                  icon: FaShieldAlt,
                  label: 'Risk Score',
                  value: walletData.riskAssessment.score,
                  subtitle: walletData.riskAssessment.level,
                  color: walletData.riskAssessment.level === 'Low' ? '#4CD964' : 
                         walletData.riskAssessment.level === 'Medium' ? '#FFB347' : '#FF453A',
                  gradient: walletData.riskAssessment.level === 'Low' ? 'from-[#4CD964] to-[#34C759]' :
                           walletData.riskAssessment.level === 'Medium' ? 'from-[#FFB347] to-[#FFA733]' : 'from-[#FF453A] to-[#FF3B30]'
                }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative bg-gradient-to-br from-[#1A120C] via-[#1A120C] to-[#0D0A07] rounded-2xl border border-[#2A1E14] p-6 overflow-hidden group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF8C00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-[#FF8C00]/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className="text-2xl text-white" />
                      </div>
                      {stat.change !== undefined && (
                        <div className={`flex items-center gap-1 text-sm font-semibold ${
                          parseFloat(stat.change) >= 0 ? 'text-[#4CD964]' : 'text-[#FF453A]'
                        }`}>
                          {parseFloat(stat.change) >= 0 ? <HiTrendingUp /> : <HiTrendingDown />}
                          {Math.abs(parseFloat(stat.change)).toFixed(2)}%
                        </div>
                      )}
                    </div>
                    <p className="text-[#C9C3BD] text-xs uppercase tracking-wider mb-2">{stat.label}</p>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-[#FFB347] bg-clip-text text-transparent mb-1">
                      {stat.value}
                    </h3>
                    {stat.subtitle && (
                      <p className="text-[#C9C3BD] text-xs">{stat.subtitle}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* AI Insights Section */}
            {aiInsights && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#1A120C] to-[#0D0A07] rounded-2xl border-2 border-[#FF8C00]/30 p-6 shadow-2xl shadow-[#FF8C00]/10"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-[#FFB347] bg-clip-text text-transparent flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[#FF8C00]/10">
                      <FaBrain className="text-[#FF8C00] text-2xl" />
                    </div>
                    AI-Powered Intelligence
                  </h2>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#4CD964]/10 border border-[#4CD964]/30">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-[#4CD964]"
                    />
                    <span className="text-[#4CD964] text-sm font-medium">Live Analysis</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                    <p className="text-[#C9C3BD] text-xs mb-2">Portfolio Score</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-white">{aiInsights.portfolioScore}</p>
                      <p className="text-[#C9C3BD] text-sm">/100</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                    <p className="text-[#C9C3BD] text-xs mb-2">Trading Type</p>
                    <p className="text-white font-bold text-sm">{aiInsights.tradingBehavior.type}</p>
                    <p className="text-[#C9C3BD] text-xs mt-1">{aiInsights.tradingBehavior.description}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                    <p className="text-[#C9C3BD] text-xs mb-2">Diversification</p>
                    <p className="text-white font-bold text-lg">{aiInsights.diversificationScore.level}</p>
                    <p className="text-[#FFB347] text-xs mt-1">{aiInsights.diversificationScore.score}/100</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                    <p className="text-[#C9C3BD] text-xs mb-2">Activity Pattern</p>
                    <p className="text-white font-bold text-sm">{aiInsights.activityPattern.pattern}</p>
                    <p className="text-[#C9C3BD] text-xs mt-1">{aiInsights.activityPattern.last7Days} txs (7d)</p>
                  </div>
                </div>

                {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                      <FaLightbulb className="text-[#FFB347]" />
                      Smart Recommendations
                    </h3>
                    <div className="space-y-3">
                      {aiInsights.recommendations.map((rec, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-4 rounded-xl bg-[#0D0A07] border border-[#2A1E14] hover:border-[#FF8C00]/50 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              rec.priority === 'High' ? 'bg-[#FF453A]/10' :
                              rec.priority === 'Medium' ? 'bg-[#FFB347]/10' : 'bg-[#4CD964]/10'
                            }`}>
                              <FaInfoCircle className={
                                rec.priority === 'High' ? 'text-[#FF453A]' :
                                rec.priority === 'Medium' ? 'text-[#FFB347]' : 'text-[#4CD964]'
                              } />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-white font-semibold">{rec.type}</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  rec.priority === 'High' ? 'bg-[#FF453A]/10 text-[#FF453A]' :
                                  rec.priority === 'Medium' ? 'bg-[#FFB347]/10 text-[#FFB347]' :
                                  'bg-[#4CD964]/10 text-[#4CD964]'
                                }`}>
                                  {rec.priority} Priority
                                </span>
                              </div>
                              <p className="text-[#C9C3BD] text-sm mb-2">{rec.message}</p>
                              <p className="text-[#FFB347] text-xs font-medium">💡 Action: {rec.action}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Advanced Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Timeline */}
              {walletData.activityTimeline && walletData.activityTimeline.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#1A120C] rounded-2xl border border-[#2A1E14] p-6 hover:border-[#FF8C00]/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <FaChartLine className="text-[#FF8C00]" />
                      Activity Timeline
                    </h3>
                    <span className="text-xs text-[#C9C3BD] bg-[#0D0A07] px-3 py-1 rounded-full border border-[#2A1E14]">
                      Last 30 Days
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={walletData.activityTimeline}>
                      <defs>
                        <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#FF8C00" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A1E14" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#C9C3BD" 
                        tick={{ fill: '#C9C3BD', fontSize: 11 }}
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#C9C3BD" tick={{ fill: '#C9C3BD', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1A120C', 
                          border: '1px solid #2A1E14',
                          borderRadius: '12px',
                          color: '#FFFFFF',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
                        }}
                        labelStyle={{ color: '#FFB347', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="transactions" 
                        stroke="#FF8C00" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorActivity)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {/* Portfolio Distribution Donut */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1A120C] rounded-2xl border border-[#2A1E14] p-6 hover:border-[#FF8C00]/30 transition-all"
              >
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <BiPieChartAlt2 className="text-[#FF8C00]" />
                  Portfolio Distribution
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={portfolioDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      dataKey="value"
                    >
                      {portfolioDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1A120C', 
                        border: '1px solid #2A1E14',
                        borderRadius: '12px'
                      }}
                      formatter={(value) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Risk Radar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1A120C] rounded-2xl border border-[#2A1E14] p-6 hover:border-[#FF8C00]/30 transition-all"
              >
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <FaShieldAlt className="text-[#FF8C00]" />
                  Risk Analysis Radar
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={riskMetrics}>
                    <PolarGrid stroke="#2A1E14" />
                    <PolarAngleAxis dataKey="metric" stroke="#C9C3BD" tick={{ fill: '#C9C3BD', fontSize: 11 }} />
                    <PolarRadiusAxis stroke="#C9C3BD" tick={{ fill: '#C9C3BD' }} domain={[0, 100]} />
                    <Radar 
                      name="Score" 
                      dataKey="score" 
                      stroke="#FF8C00" 
                      fill="#FF8C00" 
                      fillOpacity={0.4}
                      strokeWidth={2}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1A120C', 
                        border: '1px solid #2A1E14',
                        borderRadius: '12px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Top Holdings Bar Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1A120C] rounded-2xl border border-[#2A1E14] p-6 hover:border-[#FF8C00]/30 transition-all"
              >
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <FaChartBar className="text-[#FF8C00]" />
                  Top Holdings Value
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={walletData.topTokens.slice(0, 6)}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF8C00" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#FF6A00" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A1E14" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#C9C3BD" 
                      tick={{ fill: '#C9C3BD', fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#C9C3BD" tick={{ fill: '#C9C3BD', fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1A120C', 
                        border: '1px solid #2A1E14',
                        borderRadius: '12px'
                      }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Market Recommendations */}
            {recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#1A120C] to-[#0D0A07] rounded-2xl border-2 border-[#FF8C00]/30 p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-[#FFB347] bg-clip-text text-transparent flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[#FF8C00]/10">
                      <FaRocket className="text-[#FF8C00] text-2xl" />
                    </div>
                    Market Opportunities
                  </h3>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#4CD964]/10 border border-[#4CD964]/30">
                    <FaFire className="text-[#4CD964] animate-pulse" />
                    <span className="text-[#4CD964] text-sm font-medium">Trending</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.map((coin, idx) => (
                    <motion.div
                      key={coin.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="bg-[#0D0A07] rounded-xl border border-[#2A1E14] p-5 hover:border-[#FF8C00]/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {coin.image && (
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#2A1E14] group-hover:border-[#FF8C00]/50 transition-all">
                              <img src={coin.image} alt={coin.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <h4 className="text-white font-bold text-lg">{coin.symbol}</h4>
                            <p className="text-[#C9C3BD] text-xs">{coin.name}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          coin.category === 'Blue Chip' ? 'bg-[#4CD964]/10 text-[#4CD964] border border-[#4CD964]/30' :
                          coin.category === 'Trending' ? 'bg-[#FFB347]/10 text-[#FFB347] border border-[#FFB347]/30' :
                          'bg-[#FF8C00]/10 text-[#FF8C00] border border-[#FF8C00]/30'
                        }`}>
                          {coin.category}
                        </span>
                      </div>

                      {coin.currentPrice && (
                        <div className="mb-4">
                          <p className="text-white font-bold text-2xl">{formatCurrency(coin.currentPrice)}</p>
                          <div className="flex items-center gap-3 mt-2">
                            {coin.priceChange24h >= 0 ? (
                              <span className="text-[#4CD964] flex items-center gap-1 text-sm font-semibold">
                                <HiTrendingUp /> +{coin.priceChange24h.toFixed(2)}%
                              </span>
                            ) : (
                              <span className="text-[#FF453A] flex items-center gap-1 text-sm font-semibold">
                                <HiTrendingDown /> {coin.priceChange24h.toFixed(2)}%
                              </span>
                            )}
                            <span className="text-[#C9C3BD] text-xs">24h</span>
                          </div>
                        </div>
                      )}

                      <p className="text-[#C9C3BD] text-sm mb-4 line-clamp-2 leading-relaxed">{coin.reason}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-[#2A1E14]">
                        <div className="flex items-center gap-2">
                          <FaBolt className="text-[#FF8C00]" />
                          <span className="text-xs text-[#C9C3BD]">Confidence:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-white">{coin.confidence}%</span>
                            <div className="w-16 bg-[#1A120C] rounded-full h-1.5">
                              <div 
                                className="bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] h-1.5 rounded-full transition-all"
                                style={{ width: `${coin.confidence}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        {coin.marketCapRank && (
                          <span className="text-xs text-[#FFB347] font-medium">
                            #{coin.marketCapRank}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Advanced Tabs */}
            <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
              <div className="bg-[#1A120C] rounded-2xl border border-[#2A1E14] overflow-hidden">
                <Tab.List className="flex border-b border-[#2A1E14] overflow-x-auto">
                  {['Transactions', 'Tokens', 'Analytics', 'Insights'].map((tab, idx) => (
                    <Tab key={idx} className="outline-none">
                      {({ selected }) => (
                        <div className={`flex-1 min-w-[120px] px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          selected
                            ? 'text-white bg-[#0D0A07] border-b-2 border-[#FF8C00]'
                            : 'text-[#C9C3BD] hover:text-white hover:bg-[#0D0A07]/30'
                        }`}>
                          {tab}
                        </div>
                      )}
                    </Tab>
                  ))}
                </Tab.List>

                <Tab.Panels>
                  {/* Transactions Panel */}
                  <Tab.Panel className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9C3BD]" />
                        <input
                          type="text"
                          placeholder="Search transactions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0D0A07] border border-[#2A1E14] text-white placeholder-[#C9C3BD]/50 focus:border-[#FF8C00] focus:outline-none text-sm"
                        />
                      </div>
                      <select 
                        value={filterMode}
                        onChange={(e) => setFilterMode(e.target.value)}
                        className="px-4 py-3 rounded-xl bg-[#0D0A07] border border-[#2A1E14] text-white focus:border-[#FF8C00] focus:outline-none text-sm"
                      >
                        <option value="all">All</option>
                        <option value="successful">Successful</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                      {walletData.transactions
                        .filter(tx => {
                          if (filterMode === 'successful') return !tx.isError;
                          if (filterMode === 'failed') return tx.isError;
                          return true;
                        })
                        .filter(tx => {
                          if (!searchQuery) return true;
                          return tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 tx.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 tx.to.toLowerCase().includes(searchQuery.toLowerCase());
                        })
                        .slice(0, 30)
                        .map((tx, idx) => (
                        <motion.div
                          key={tx.hash}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="p-4 rounded-xl bg-[#0D0A07] border border-[#2A1E14] hover:border-[#FF8C00]/50 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={`p-2.5 rounded-lg ${
                                tx.isError ? 'bg-[#FF453A]/10' : 'bg-[#4CD964]/10'
                              }`}>
                                {tx.isError ? 
                                  <FaExclamationTriangle className="text-[#FF453A]" /> : 
                                  <FaCheckCircle className="text-[#4CD964]" />
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="text-white font-medium text-sm font-mono truncate">
                                    {tx.hash.slice(0, 24)}...{tx.hash.slice(-16)}
                                  </p>
                                  <button 
                                    onClick={() => copyToClipboard(tx.hash)}
                                    className="text-[#C9C3BD] hover:text-[#FF8C00] transition-colors flex-shrink-0"
                                  >
                                    <FaCopy className="text-xs" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-[#C9C3BD] flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <FaClock />
                                    {formatDate(tx.timestamp)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FaGasPump />
                                    {tx.gasPrice} Gwei
                                  </span>
                                  <span className="px-2 py-1 rounded-full bg-[#2A1E14] font-medium">
                                    #{tx.blockHeight}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-white font-bold text-sm">
                                {tx.value} {walletData.balance.symbol}
                              </p>
                              {tx.valueUSD > 0 && (
                                <p className="text-[#FFB347] text-xs font-medium">{formatCurrency(tx.valueUSD)}</p>
                              )}
                              <p className="text-[#C9C3BD] text-xs mt-1">
                                Gas: {parseFloat(tx.gasSpent).toFixed(6)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Tab.Panel>

                  {/* Tokens Panel */}
                  <Tab.Panel className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9C3BD]" />
                        <input
                          type="text"
                          placeholder="Search tokens..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0D0A07] border border-[#2A1E14] text-white placeholder-[#C9C3BD]/50 focus:border-[#FF8C00] focus:outline-none text-sm"
                        />
                      </div>
                      <select 
                        value={filterMode}
                        onChange={(e) => setFilterMode(e.target.value)}
                        className="px-4 py-3 rounded-xl bg-[#0D0A07] border border-[#2A1E14] text-white focus:border-[#FF8C00] focus:outline-none text-sm"
                      >
                        <option value="all">All Tokens</option>
                        <option value="profitable">Profitable</option>
                        <option value="losing">Losing</option>
                      </select>
                      <select 
                        value={sortMode}
                        onChange={(e) => setSortMode(e.target.value)}
                        className="px-4 py-3 rounded-xl bg-[#0D0A07] border border-[#2A1E14] text-white focus:border-[#FF8C00] focus:outline-none text-sm"
                      >
                        <option value="value">Sort by Value</option>
                        <option value="change">Sort by Change</option>
                        <option value="balance">Sort by Balance</option>
                      </select>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                      {getFilteredTokens().map((token, idx) => (
                        <motion.div
                          key={token.contractAddress}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          whileHover={{ scale: 1.01 }}
                          className="p-5 rounded-xl bg-[#0D0A07] border border-[#2A1E14] hover:border-[#FF8C00]/50 transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {token.logo ? (
                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#2A1E14] group-hover:border-[#FF8C00]/50 transition-all">
                                  <img src={token.logo} alt={token.symbol} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FFB347] flex items-center justify-center text-white font-bold text-lg border-2 border-[#2A1E14] group-hover:border-[#FF8C00]/50 transition-all">
                                  {token.symbol.slice(0, 2)}
                                </div>
                              )}
                              <div>
                                <h4 className="text-white font-bold text-lg">{token.name}</h4>
                                <p className="text-[#C9C3BD] text-sm">{token.symbol}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-bold text-lg">{parseFloat(token.balance).toFixed(4)}</p>
                              <p className="text-[#FFB347] text-sm font-semibold">{formatCurrency(token.valueUSD)}</p>
                              {token.percentChange24h !== 0 && (
                                <div className={`flex items-center justify-end gap-1 text-sm font-semibold mt-1 ${
                                  token.percentChange24h >= 0 ? 'text-[#4CD964]' : 'text-[#FF453A]'
                                }`}>
                                  {token.percentChange24h >= 0 ? <HiTrendingUp /> : <HiTrendingDown />}
                                  {token.percentChange24h >= 0 ? '+' : ''}{token.percentChange24h.toFixed(2)}%
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Tab.Panel>

                  {/* Analytics Panel */}
                  <Tab.Panel className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                        <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                          <FaClock className="text-[#FF8C00]" />
                          Wallet Timeline
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[#C9C3BD] text-xs mb-2 uppercase tracking-wide">First Activity</p>
                            <p className="text-white font-semibold">
                              {walletData.statistics.firstTransaction ? 
                                new Date(walletData.statistics.firstTransaction).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) : 'N/A'
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-[#C9C3BD] text-xs mb-2 uppercase tracking-wide">Last Activity</p>
                            <p className="text-white font-semibold">
                              {walletData.statistics.lastTransaction ? 
                                new Date(walletData.statistics.lastTransaction).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'N/A'
                              }
                            </p>
                          </div>
                          <div className="pt-4 border-t border-[#2A1E14]">
                            <p className="text-[#C9C3BD] text-xs mb-2 uppercase tracking-wide">Wallet Age</p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-white font-bold text-4xl">{walletData.statistics.walletAge}</p>
                              <p className="text-[#FFB347] text-lg font-medium">days</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                        <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                          <FaGasPump className="text-[#FF8C00]" />
                          Gas Analytics
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[#C9C3BD] text-xs mb-2 uppercase tracking-wide">Total Gas Spent</p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-white font-bold text-3xl">
                                {parseFloat(walletData.statistics.totalGasSpent).toFixed(4)}
                              </p>
                              <p className="text-[#FFB347] text-lg font-medium">{walletData.balance.symbol}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[#C9C3BD] text-xs mb-2 uppercase tracking-wide">Avg Gas per Transaction</p>
                            <p className="text-white font-semibold text-lg">
                              {(parseFloat(walletData.statistics.totalGasSpent) / walletData.statistics.totalTransactions).toFixed(8)} {walletData.balance.symbol}
                            </p>
                          </div>
                          <div className="pt-4 border-t border-[#2A1E14]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[#C9C3BD] text-sm">Success Rate</span>
                              <span className="text-[#4CD964] font-bold text-lg">{walletData.statistics.successRate}%</span>
                            </div>
                            <div className="w-full bg-[#1A120C] rounded-full h-3 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${walletData.statistics.successRate}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="bg-gradient-to-r from-[#4CD964] to-[#34C759] h-3 rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Tab.Panel>

                  {/* Insights Panel */}
                  <Tab.Panel className="p-6">
                    <div className="space-y-6">
                      {aiInsights && aiInsights.predictions && (
                        <div className="p-6 rounded-xl bg-gradient-to-br from-[#FF8C00]/10 to-transparent border border-[#FF8C00]/30">
                          <h4 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                            <FaEye className="text-[#FF8C00]" />
                            AI Predictions & Forecasts
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                              <p className="text-[#C9C3BD] text-xs mb-2 uppercase tracking-wide">Portfolio Growth</p>
                              <p className="text-white font-bold text-2xl mb-1">{aiInsights.predictions.portfolioGrowth.trend}</p>
                              <p className="text-[#FFB347] text-sm">30d projection: {aiInsights.predictions.portfolioGrowth.projection30d.toFixed(2)}%</p>
                              <div className="mt-2 flex items-center gap-2">
                                <div className="w-full bg-[#1A120C] rounded-full h-2">
                                  <div 
                                    className="bg-[#FF8C00] h-2 rounded-full"
                                    style={{ width: `${aiInsights.predictions.portfolioGrowth.confidence}%` }}
                                  />
                                </div>
                                <span className="text-xs text-[#C9C3BD]">{aiInsights.predictions.portfolioGrowth.confidence}%</span>
                              </div>
                            </div>

                            <div className="p-4 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                              <p className="text-[#C9C3BD] text-xs mb-2 uppercase tracking-wide">Activity Forecast</p>
                              <p className="text-white font-bold text-2xl mb-1">{aiInsights.predictions.activityForecast.expected}</p>
                              <p className="text-[#C9C3BD] text-sm">Expected activity level</p>
                              <div className="mt-2 flex items-center gap-2">
                                <div className="w-full bg-[#1A120C] rounded-full h-2">
                                  <div 
                                    className="bg-[#4CD964] h-2 rounded-full"
                                    style={{ width: `${aiInsights.predictions.activityForecast.confidence}%` }}
                                  />
                                </div>
                                <span className="text-xs text-[#C9C3BD]">{aiInsights.predictions.activityForecast.confidence}%</span>
                              </div>
                            </div>

                            <div className="p-4 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                              <p className="text-[#C9C3BD] text-xs mb-2 uppercase tracking-wide">Risk Outlook</p>
                              <p className="text-white font-bold text-2xl mb-1">{aiInsights.predictions.riskForecast.level}</p>
                              <p className="text-[#C9C3BD] text-sm">Risk trajectory</p>
                              <div className="mt-2 flex items-center gap-2">
                                <div className="w-full bg-[#1A120C] rounded-full h-2">
                                  <div 
                                    className="bg-[#FFB347] h-2 rounded-full"
                                    style={{ width: `${aiInsights.predictions.riskForecast.confidence}%` }}
                                  />
                                </div>
                                <span className="text-xs text-[#C9C3BD]">{aiInsights.predictions.riskForecast.confidence}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="p-6 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                        <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                          <FaGem className="text-[#FF8C00]" />
                          Risk Factors Analysis
                        </h4>
                        <div className="space-y-3">
                          {walletData.riskAssessment.factors.map((factor, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#1A120C] border border-[#2A1E14]">
                              <div className="p-2 rounded-lg bg-[#FFB347]/10 mt-1">
                                <HiSparkles className="text-[#FFB347]" />
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-medium mb-1">Risk Factor #{idx + 1}</p>
                                <p className="text-[#C9C3BD] text-sm">{factor}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-[#4CD964]/10">
                              <FaTrophy className="text-[#4CD964] text-2xl" />
                            </div>
                            <div>
                              <p className="text-[#C9C3BD] text-xs uppercase tracking-wide">Wallet Rank</p>
                              <p className="text-white font-bold text-xl">
                                {parseFloat(walletData.portfolio.totalValueUSD) > 100000 ? 'Whale 🐋' :
                                 parseFloat(walletData.portfolio.totalValueUSD) > 10000 ? 'Power User ⚡' :
                                 parseFloat(walletData.portfolio.totalValueUSD) > 1000 ? 'Active Trader 📈' : 'Explorer 🔍'}
                              </p>
                            </div>
                          </div>
                          <p className="text-[#C9C3BD] text-sm">
                            Based on your portfolio size and activity level
                          </p>
                        </div>

                        <div className="p-6 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-[#FFB347]/10">
                              <FaRocket className="text-[#FFB347] text-2xl" />
                            </div>
                            <div>
                              <p className="text-[#C9C3BD] text-xs uppercase tracking-wide">Activity Level</p>
                              <p className="text-white font-bold text-xl">
                                {walletData.statistics.totalTransactions > 1000 ? 'Very Active 🔥' :
                                 walletData.statistics.totalTransactions > 100 ? 'Active ✅' :
                                 walletData.statistics.totalTransactions > 10 ? 'Moderate 📊' : 'Low 🌱'}
                              </p>
                            </div>
                          </div>
                          <p className="text-[#C9C3BD] text-sm">
                            Transaction frequency and engagement score
                          </p>
                        </div>
                      </div>
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </div>
            </Tab.Group>
          </div>

          {/* AI Chat Sidebar - 1 column */}
          <div className="xl:col-span-1">
            <div className="sticky top-24 bg-[#1A120C] rounded-2xl border-2 border-[#FF8C00]/30 overflow-hidden flex flex-col h-[calc(100vh-8rem)] shadow-2xl shadow-[#FF8C00]/20">
              <div className="bg-gradient-to-r from-[#FF6A00] via-[#FF8C00] to-[#FFB347] p-5">
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={{ 
                      rotate: [0, 10, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                  >
                    <FaRobot className="text-white text-2xl" />
                  </motion.div>
                  <div>
                    <h3 className="text-white font-bold text-xl">Alfredo AI</h3>
                    <p className="text-white/90 text-xs flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-[#4CD964]"
                      />
                      Advanced Portfolio Assistant
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#0D0A07]">
                {chatMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] text-white shadow-lg'
                        : 'bg-[#1A120C] border border-[#2A1E14] text-white'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs opacity-60 mt-2">{msg.timestamp}</p>
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#1A120C] border border-[#2A1E14] rounded-2xl px-5 py-4">
                      <div className="flex gap-2">
                        {[0, 0.3, 0.6].map((delay, idx) => (
                          <motion.div
                            key={idx}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} 
                            transition={{ duration: 1, repeat: Infinity, delay }} 
                            className="w-2.5 h-2.5 bg-[#FF8C00] rounded-full" 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t-2 border-[#2A1E14] bg-[#1A120C]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Ask Alfredo anything..."
                    className="flex-1 px-4 py-3 rounded-xl bg-[#0D0A07] border-2 border-[#2A1E14] text-white placeholder-[#C9C3BD]/50 focus:border-[#FF8C00] focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/20 text-sm transition-all"
                    disabled={isTyping}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendChatMessage}
                    disabled={isTyping || !userInput.trim()}
                    className="p-3 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-[#FF8C00]/50"
                  >
                    <FaPaperPlane />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D0A07] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-[#FF8C00] border-t-transparent rounded-full"
        />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
