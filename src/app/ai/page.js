// app/ai/page.js
'use client'
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, FaWallet, FaChartLine, FaExchangeAlt, 
  FaShieldAlt, FaRobot, FaPaperPlane, FaCheckCircle,
  FaExclamationTriangle, FaCopy, FaExternalLinkAlt,
  FaGasPump, FaFileContract, FaHistory, FaClock,
  FaCoins, FaChartPie, FaFire, FaLightbulb, FaBolt,
  FaTrophy, FaRocket, FaChartBar, FaLayerGroup, FaGem
} from 'react-icons/fa';
import { HiSparkles, HiLightningBolt, HiTrendingUp, HiTrendingDown } from 'react-icons/hi';
import { BiPieChartAlt2 } from 'react-icons/bi';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Area, AreaChart, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap, ScatterChart, Scatter, ComposedChart
} from 'recharts';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatEndRef = useRef(null);
  
  const wallet = searchParams.get('wallet');
  const network = searchParams.get('network');
  
  const [isLoading, setIsLoading] = useState(true);
  const [walletData, setWalletData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('all');

  useEffect(() => {
    if (!wallet || !network) {
      router.push('/');
      return;
    }
    fetchWalletData();
    addWelcomeMessage();
  }, [wallet, network]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchWalletData = async () => {
    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, network })
      });
      
      const result = await response.json();
      if (result.success) {
        setWalletData(result.data);
        fetchRecommendations(result.data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching wallet:', error);
      setIsLoading(false);
    }
  };

  const fetchRecommendations = async (data) => {
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          walletData: data, 
          riskProfile: data.riskAssessment.level 
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setRecommendations(result.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMsg = {
      id: Date.now(),
      role: 'assistant',
      content: `🤖 Hello! I'm Alfredo, your AI crypto portfolio assistant. I've successfully analyzed your ${network} wallet and I'm ready to provide deep insights, answer questions, and give personalized recommendations!`,
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
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are Alfredo, an expert crypto AI assistant with deep blockchain knowledge.

Wallet Analysis:
- Address: ${wallet}
- Network: ${network}
- Portfolio Value: $${walletData.portfolio.totalValueUSD}
- Native Balance: ${walletData.balance.native} ${walletData.balance.symbol}
- Total Tokens: ${walletData.portfolio.totalTokens}
- 24h Change: ${walletData.portfolio.change24h}%
- Total Transactions: ${walletData.statistics.totalTransactions}
- Success Rate: ${walletData.statistics.successRate}%
- Gas Spent: ${walletData.statistics.totalGasSpent} ${walletData.balance.symbol}
- Wallet Age: ${walletData.statistics.walletAge} days
- Risk Score: ${walletData.riskAssessment.score}/100 (${walletData.riskAssessment.level})
- Top Holdings: ${walletData.topTokens.slice(0, 3).map(t => t.name).join(', ')}

Provide expert insights on:
- Portfolio optimization strategies
- Risk management recommendations
- Market timing and trends
- Token-specific analysis
- DeFi opportunities
- Gas optimization tips
- Trading patterns analysis

Be conversational, insightful, and data-driven.`
            },
            ...chatMessages.slice(-8).map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: "user",
              content: currentInput
            }
          ],
          model: "gpt-3.5-turbo",
          temperature: 0.8,
          max_tokens: 600
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseContent = data.choices?.[0]?.message?.content || data.response || 
          `Based on your portfolio worth $${walletData.portfolio.totalValueUSD}, I recommend diversifying your holdings and monitoring the ${walletData.riskAssessment.level.toLowerCase()} risk factors.`;
        
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setChatMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const fallbackMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `I've analyzed your portfolio worth $${walletData.portfolio.totalValueUSD}. Your ${walletData.riskAssessment.level.toLowerCase()} risk profile suggests maintaining balanced exposure. Would you like specific recommendations?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      
      setChatMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatCompactNumber = (value) => {
    if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
    if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
    if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
    return value.toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0A07] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-[#FF8C00] border-t-transparent rounded-full mb-6"
        />
        <motion.p 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[#C9C3BD] text-lg"
        >
          Analyzing wallet on {network}...
        </motion.p>
        <p className="text-[#C9C3BD]/60 text-sm mt-2">Fetching real-time blockchain data</p>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="min-h-screen bg-[#0D0A07] flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-[#FF453A] text-5xl mx-auto mb-4" />
          <p className="text-white text-xl mb-2">Failed to load wallet data</p>
          <p className="text-[#C9C3BD] text-sm mb-6">Please check your API keys</p>
          <button 
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-[#FF8C00]/50 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const COLORS = ['#FF6A00', '#FF8C00', '#FFB347', '#FFA733', '#FF9500', '#FFC966', '#FFD699'];

  // Prepare chart data
  const portfolioDistribution = walletData.topTokens.map((token, idx) => ({
    name: token.name,
    value: parseFloat(token.value),
    percentage: parseFloat(token.percentage),
    fill: COLORS[idx % COLORS.length]
  }));

  const riskMetrics = [
    { metric: 'Diversification', score: walletData.tokens.length > 10 ? 90 : walletData.tokens.length * 9 },
    { metric: 'Activity', score: Math.min((walletData.statistics.totalTransactions / 10), 100) },
    { metric: 'Success Rate', score: parseFloat(walletData.statistics.successRate) },
    { metric: 'Liquidity', score: walletData.balance.valueUSD > 1000 ? 85 : 50 },
    { metric: 'Wallet Age', score: Math.min((walletData.statistics.walletAge / 365) * 100, 100) }
  ];

  return (
    <div className="min-h-screen bg-[#0D0A07]">
      {/* Premium Header */}
      <div className="sticky top-0 z-50 backdrop-blur-2xl bg-[#1A120C]/90 border-b border-[#2A1E14] shadow-2xl">
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/')}
                className="p-3 rounded-xl bg-gradient-to-br from-[#0D0A07] to-[#1A120C] border border-[#2A1E14] text-[#C9C3BD] hover:text-white hover:border-[#FF8C00] transition-all shadow-lg"
              >
                <FaArrowLeft />
              </motion.button>
              
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#FFB347] to-[#FF8C00] bg-clip-text text-transparent flex items-center gap-2">
                  <HiSparkles className="text-[#FF8C00]" />
                  Advanced Portfolio Analytics
                </h1>
                <div className="flex items-center gap-3 text-sm text-[#C9C3BD] mt-1">
                  <span className="font-mono text-xs bg-[#0D0A07] px-3 py-1 rounded-full border border-[#2A1E14]">
                    {wallet?.slice(0, 8)}...{wallet?.slice(-6)}
                  </span>
                  <button 
                    onClick={() => copyToClipboard(wallet)} 
                    className="hover:text-[#FF8C00] transition-colors p-1"
                  >
                    <FaCopy className="text-xs" />
                  </button>
                  <a 
                    href={`https://${network === 'ethereum' ? '' : network + '.'}etherscan.io/address/${wallet}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FF8C00] transition-colors p-1"
                  >
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
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
              <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF8C00]">
                <span className="text-white/80 text-xs uppercase tracking-wide">Portfolio</span>
                <p className="text-white font-bold text-sm">{formatCurrency(walletData.portfolio.totalValueUSD)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content - 3 columns */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* Hero Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, boxShadow: '0 20px 60px rgba(255, 140, 0, 0.3)' }}
                className="relative bg-gradient-to-br from-[#1A120C] via-[#1A120C] to-[#0D0A07] rounded-2xl border border-[#2A1E14] p-6 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF8C00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[#FF8C00]/10 group-hover:bg-[#FF8C00]/20 transition-colors">
                      <FaWallet className="text-[#FF8C00] text-2xl" />
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <HiSparkles className="text-[#FFB347] text-xl" />
                    </motion.div>
                  </div>
                  <p className="text-[#C9C3BD] text-xs uppercase tracking-wider mb-2">Total Value</p>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-[#FFB347] bg-clip-text text-transparent mb-2">
                    {formatCurrency(walletData.portfolio.totalValueUSD)}
                  </h3>
                  <div className="flex items-center gap-2">
                    {parseFloat(walletData.portfolio.change24h) >= 0 ? (
                      <div className="flex items-center gap-1 text-[#4CD964] text-sm font-medium">
                        <HiTrendingUp className="text-base" />
                        +{walletData.portfolio.change24h}%
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[#FF453A] text-sm font-medium">
                        <HiTrendingDown className="text-base" />
                        {walletData.portfolio.change24h}%
                      </div>
                    )}
                    <span className="text-[#C9C3BD] text-xs">24h</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-[#1A120C] to-[#0D0A07] rounded-2xl border border-[#2A1E14] p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-[#4CD964]/10">
                    <FaCoins className="text-[#4CD964] text-2xl" />
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-white">{walletData.portfolio.totalTokens}</span>
                  </div>
                </div>
                <p className="text-[#C9C3BD] text-xs uppercase tracking-wider mb-2">Active Tokens</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#4CD964]">{walletData.portfolio.profitableTokens}</span>
                  <span className="text-[#C9C3BD]">profitable</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-[#1A120C] to-[#0D0A07] rounded-2xl border border-[#2A1E14] p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-[#FFB347]/10">
                    <FaExchangeAlt className="text-[#FFB347] text-2xl" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#4CD964]/10 text-[#4CD964] text-xs font-bold">
                    {walletData.statistics.successRate}%
                  </span>
                </div>
                <p className="text-[#C9C3BD] text-xs uppercase tracking-wider mb-2">Transactions</p>
                <h3 className="text-3xl font-bold text-white mb-1">{walletData.statistics.totalTransactions}</h3>
                <p className="text-[#C9C3BD] text-xs">{walletData.statistics.successfulTransactions} successful</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-[#1A120C] to-[#0D0A07] rounded-2xl border border-[#2A1E14] p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-[#FF8C00]/10">
                    <FaShieldAlt className="text-[#FF8C00] text-2xl" />
                  </div>
                  <div className="relative w-16 h-16">
                    <svg className="transform -rotate-90 w-16 h-16">
                      <circle cx="32" cy="32" r="28" stroke="#2A1E14" strokeWidth="6" fill="none" />
                      <circle
                        cx="32" cy="32" r="28"
                        stroke={walletData.riskAssessment.level === 'Low' ? '#4CD964' : 
                               walletData.riskAssessment.level === 'Medium' ? '#FFB347' : '#FF453A'}
                        strokeWidth="6" fill="none"
                        strokeDasharray={`${(walletData.riskAssessment.score / 100) * 176} 176`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{walletData.riskAssessment.score}</span>
                    </div>
                  </div>
                </div>
                <p className="text-[#C9C3BD] text-xs uppercase tracking-wider mb-2">Risk Score</p>
                <p className={`text-sm font-semibold ${
                  walletData.riskAssessment.level === 'Low' ? 'text-[#4CD964]' :
                  walletData.riskAssessment.level === 'Medium' ? 'text-[#FFB347]' : 'text-[#FF453A]'
                }`}>
                  {walletData.riskAssessment.level} Risk
                </p>
              </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Timeline */}
              {walletData.activityTimeline && walletData.activityTimeline.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#1A120C] rounded-2xl border border-[#2A1E14] p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <FaChartLine className="text-[#FF8C00]" />
                      Activity Timeline
                    </h3>
                    <span className="text-xs text-[#C9C3BD] bg-[#0D0A07] px-3 py-1 rounded-full">Last 30 Days</span>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={walletData.activityTimeline}>
                      <defs>
                        <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.4}/>
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
                          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}
                        labelStyle={{ color: '#FFB347' }}
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

              {/* Portfolio Distribution Pie Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1A120C] rounded-2xl border border-[#2A1E14] p-6"
              >
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <BiPieChartAlt2 className="text-[#FF8C00]" />
                  Portfolio Distribution
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={portfolioDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
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

              {/* Risk Radar Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1A120C] rounded-2xl border border-[#2A1E14] p-6"
              >
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <FaShieldAlt className="text-[#FF8C00]" />
                  Risk Analysis Radar
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={riskMetrics}>
                    <PolarGrid stroke="#2A1E14" />
                    <PolarAngleAxis dataKey="metric" stroke="#C9C3BD" tick={{ fill: '#C9C3BD', fontSize: 11 }} />
                    <PolarRadiusAxis stroke="#C9C3BD" tick={{ fill: '#C9C3BD' }} />
                    <Radar 
                      name="Score" 
                      dataKey="score" 
                      stroke="#FF8C00" 
                      fill="#FF8C00" 
                      fillOpacity={0.3}
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

              {/* Token Performance Bar Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1A120C] rounded-2xl border border-[#2A1E14] p-6"
              >
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <FaChartBar className="text-[#FF8C00]" />
                  Top Holdings Value
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={walletData.topTokens.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A1E14" vertical={false} />
                    <XAxis dataKey="name" stroke="#C9C3BD" tick={{ fill: '#C9C3BD', fontSize: 11 }} />
                    <YAxis stroke="#C9C3BD" tick={{ fill: '#C9C3BD', fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1A120C', 
                        border: '1px solid #2A1E14',
                        borderRadius: '12px'
                      }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Bar dataKey="value" fill="#FF8C00" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* AI Recommendations Section */}
            {recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#1A120C] to-[#0D0A07] rounded-2xl border-2 border-[#FF8C00]/30 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-[#FFB347] bg-clip-text text-transparent flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[#FF8C00]/10">
                      <FaLightbulb className="text-[#FF8C00] text-2xl" />
                    </div>
                    AI-Powered Recommendations
                  </h3>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#4CD964]/10 border border-[#4CD964]/30">
                    <div className="w-2 h-2 rounded-full bg-[#4CD964] animate-pulse" />
                    <span className="text-[#4CD964] text-sm font-medium">Live</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.map((coin, idx) => (
                    <motion.div
                      key={coin.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="bg-[#0D0A07] rounded-xl border border-[#2A1E14] p-4 hover:border-[#FF8C00]/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {coin.image && (
                            <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
                          )}
                          <div>
                            <h4 className="text-white font-bold">{coin.symbol}</h4>
                            <p className="text-[#C9C3BD] text-xs">{coin.name}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          coin.category === 'Blue Chip' ? 'bg-[#4CD964]/10 text-[#4CD964]' :
                          coin.category === 'Trending' ? 'bg-[#FFB347]/10 text-[#FFB347]' :
                          'bg-[#FF453A]/10 text-[#FF453A]'
                        }`}>
                          {coin.category}
                        </span>
                      </div>

                      {coin.currentPrice && (
                        <div className="mb-3">
                          <p className="text-white font-bold text-lg">{formatCurrency(coin.currentPrice)}</p>
                          <div className="flex items-center gap-2 text-sm">
                            {coin.priceChange24h >= 0 ? (
                              <span className="text-[#4CD964] flex items-center gap-1">
                                <HiTrendingUp /> +{coin.priceChange24h.toFixed(2)}%
                              </span>
                            ) : (
                              <span className="text-[#FF453A] flex items-center gap-1">
                                <HiTrendingDown /> {coin.priceChange24h.toFixed(2)}%
                              </span>
                            )}
                            <span className="text-[#C9C3BD] text-xs">24h</span>
                          </div>
                        </div>
                      )}

                      <p className="text-[#C9C3BD] text-sm mb-3 line-clamp-2">{coin.reason}</p>

                      <div className="flex items-center justify-between pt-3 border-t border-[#2A1E14]">
                        <div className="flex items-center gap-2">
                          <FaBolt className="text-[#FF8C00]" />
                          <span className="text-xs text-[#C9C3BD]">Confidence:</span>
                          <span className="text-xs font-bold text-white">{coin.confidence}%</span>
                        </div>
                        {coin.marketCapRank && (
                          <span className="text-xs text-[#C9C3BD]">
                            Rank #{coin.marketCapRank}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Detailed Tabs Section */}
            <div className="bg-[#1A120C] rounded-2xl border border-[#2A1E14] overflow-hidden">
              <div className="flex border-b border-[#2A1E14] overflow-x-auto">
                {['transactions', 'tokens', 'analytics', 'insights'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 min-w-[120px] px-6 py-4 text-sm font-semibold capitalize whitespace-nowrap transition-all ${
                      activeTab === tab
                        ? 'text-white bg-[#0D0A07] border-b-2 border-[#FF8C00]'
                        : 'text-[#C9C3BD] hover:text-white hover:bg-[#0D0A07]/30'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6 max-h-[600px] overflow-y-auto">
                {activeTab === 'transactions' && (
                  <div className="space-y-3">
                    {walletData.transactions.length > 0 ? (
                      walletData.transactions.map((tx, idx) => (
                        <motion.div
                          key={tx.hash}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="p-4 rounded-xl bg-[#0D0A07] border border-[#2A1E14] hover:border-[#FF8C00]/50 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={`p-2 rounded-lg ${
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
                                    {tx.hash.slice(0, 20)}...{tx.hash.slice(-12)}
                                  </p>
                                  <button 
                                    onClick={() => copyToClipboard(tx.hash)}
                                    className="text-[#C9C3BD] hover:text-[#FF8C00] transition-colors"
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
                                  <span className="px-2 py-1 rounded-full bg-[#2A1E14]">
                                    Block #{tx.blockHeight}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-bold text-sm">
                                {tx.value} {walletData.balance.symbol}
                              </p>
                              {tx.valueUSD > 0 && (
                                <p className="text-[#C9C3BD] text-xs">{formatCurrency(tx.valueUSD)}</p>
                              )}
                              <p className="text-[#C9C3BD] text-xs mt-1">
                                Gas: {parseFloat(tx.gasSpent).toFixed(4)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-16">
                        <FaHistory className="text-[#C9C3BD] text-5xl mx-auto mb-4 opacity-30" />
                        <p className="text-[#C9C3BD]">No transactions found</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'tokens' && (
                  <div className="space-y-3">
                    {walletData.tokens.length > 0 ? (
                      walletData.tokens.map((token, idx) => (
                        <motion.div
                          key={token.contractAddress}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          whileHover={{ scale: 1.01 }}
                          className="p-4 rounded-xl bg-[#0D0A07] border border-[#2A1E14] hover:border-[#FF8C00]/50 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {token.logo ? (
                                <img src={token.logo} alt={token.symbol} className="w-12 h-12 rounded-full" />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FFB347] flex items-center justify-center text-white font-bold">
                                  {token.symbol.slice(0, 2)}
                                </div>
                              )}
                              <div>
                                <h4 className="text-white font-semibold">{token.name}</h4>
                                <p className="text-[#C9C3BD] text-sm">{token.symbol}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-bold">{parseFloat(token.balance).toFixed(4)}</p>
                              <p className="text-[#FFB347] text-sm font-medium">{formatCurrency(token.valueUSD)}</p>
                              {token.percentChange24h !== 0 && (
                                <p className={`text-xs mt-1 ${
                                  token.percentChange24h >= 0 ? 'text-[#4CD964]' : 'text-[#FF453A]'
                                }`}>
                                  {token.percentChange24h >= 0 ? '+' : ''}{token.percentChange24h.toFixed(2)}% 24h
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-16">
                        <BiPieChartAlt2 className="text-[#C9C3BD] text-5xl mx-auto mb-4 opacity-30" />
                        <p className="text-[#C9C3BD]">No tokens found</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <FaClock className="text-[#FF8C00]" />
                          Wallet Timeline
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[#C9C3BD] text-xs mb-2">First Activity</p>
                            <p className="text-white font-medium">
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
                            <p className="text-[#C9C3BD] text-xs mb-2">Last Activity</p>
                            <p className="text-white font-medium">
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
                            <p className="text-[#C9C3BD] text-xs mb-2">Wallet Age</p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-white font-bold text-3xl">{walletData.statistics.walletAge}</p>
                              <p className="text-[#FFB347] text-sm">days</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <FaGasPump className="text-[#FF8C00]" />
                          Gas Analytics
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[#C9C3BD] text-xs mb-2">Total Gas Spent</p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-white font-bold text-2xl">
                                {parseFloat(walletData.statistics.totalGasSpent).toFixed(4)}
                              </p>
                              <p className="text-[#FFB347] text-sm">{walletData.balance.symbol}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[#C9C3BD] text-xs mb-2">Avg Gas per TX</p>
                            <p className="text-white font-medium">
                              {(parseFloat(walletData.statistics.totalGasSpent) / walletData.statistics.totalTransactions).toFixed(6)} {walletData.balance.symbol}
                            </p>
                          </div>
                          <div className="pt-4 border-t border-[#2A1E14]">
                            <div className="flex items-center justify-between">
                              <span className="text-[#C9C3BD] text-sm">Success Rate</span>
                              <span className="text-[#4CD964] font-bold">{walletData.statistics.successRate}%</span>
                            </div>
                            <div className="w-full bg-[#1A120C] rounded-full h-2 mt-2">
                              <div 
                                className="bg-gradient-to-r from-[#4CD964] to-[#4CD964]/50 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${walletData.statistics.successRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'insights' && (
                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-gradient-to-br from-[#FF8C00]/10 to-transparent border border-[#FF8C00]/30">
                      <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <FaLightbulb className="text-[#FF8C00]" />
                        AI-Generated Insights
                      </h4>
                      <div className="space-y-4">
                        {walletData.riskAssessment.factors.map((factor, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-[#FFB347]/10 mt-1">
                              <HiSparkles className="text-[#FFB347]" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium mb-1">Analysis Point {idx + 1}</p>
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
                            <FaTrophy className="text-[#4CD964] text-xl" />
                          </div>
                          <div>
                            <p className="text-[#C9C3BD] text-xs">Portfolio Rank</p>
                            <p className="text-white font-bold text-lg">
                              {walletData.portfolio.totalValueUSD > 100000 ? 'Whale' :
                               walletData.portfolio.totalValueUSD > 10000 ? 'Power User' :
                               walletData.portfolio.totalValueUSD > 1000 ? 'Active Trader' : 'Beginner'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 rounded-xl bg-[#FFB347]/10">
                            <FaRocket className="text-[#FFB347] text-xl" />
                          </div>
                          <div>
                            <p className="text-[#C9C3BD] text-xs">Activity Level</p>
                            <p className="text-white font-bold text-lg">
                              {walletData.statistics.totalTransactions > 1000 ? 'Very Active' :
                               walletData.statistics.totalTransactions > 100 ? 'Active' :
                               walletData.statistics.totalTransactions > 10 ? 'Moderate' : 'Low'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  >
                    <FaRobot className="text-white text-2xl" />
                  </motion.div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Alfredo AI</h3>
                    <p className="text-white/90 text-xs flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#4CD964] animate-pulse" />
                      Portfolio Assistant
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
                        <motion.div 
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} 
                          transition={{ duration: 1, repeat: Infinity }} 
                          className="w-2 h-2 bg-[#FF8C00] rounded-full" 
                        />
                        <motion.div 
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} 
                          transition={{ duration: 1, repeat: Infinity, delay: 0.3 }} 
                          className="w-2 h-2 bg-[#FF8C00] rounded-full" 
                        />
                        <motion.div 
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} 
                          transition={{ duration: 1, repeat: Infinity, delay: 0.6 }} 
                          className="w-2 h-2 bg-[#FF8C00] rounded-full" 
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-[#2A1E14] bg-[#1A120C]">
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
