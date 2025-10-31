'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import ReactMarkdown from 'react-markdown';
import {
  FaWallet, FaChartLine, FaRobot, FaPaperPlane, FaCopy,
  FaExternalLinkAlt, FaChartPie, FaFire, FaLightbulb,
  FaBolt, FaTrophy, FaRocket, FaChartBar, FaLayerGroup,
  FaGem, FaDownload, FaShare, FaStar, FaGlobe, FaBrain,
  FaSpinner, FaCheckCircle, FaExclamationTriangle, FaHistory,
  FaCoins, FaShieldAlt, FaArrowUp, FaArrowDown, FaHome,
  FaTimes, FaExpand
} from 'react-icons/fa';
import { HiSparkles, HiLightningBolt, HiTrendingUp, HiTrendingDown } from 'react-icons/hi';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';

function AIDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const wallet = searchParams.get('wallet');
  const network = searchParams.get('network') || 'ethereum';

  // Redirect if no wallet
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

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Scan wallet on mount
  useEffect(() => {
    if (wallet && !isScanning && !scanComplete) {
      scanWallet();
    }
  }, [wallet]);

  const scanWallet = async () => {
    setIsScanning(true);
    setScanComplete(false);

    try {
      toast.loading('Scanning multi-chain wallet...', { id: 'scan' });

      const scanResponse = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, chains: [network] })
      });

      if (!scanResponse.ok) throw new Error('Scan failed');

      const scanData = await scanResponse.json();
      if (!scanData.success) throw new Error(scanData.error);

      setWalletData(scanData);
      toast.success(`Wallet scanned successfully!`, { id: 'scan' });

      // Fetch AI insights
      toast.loading('Generating AI insights...', { id: 'ai' });

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
        toast.success('AI analysis complete!', { id: 'ai' });
      } else {
        console.error('AI insights failed');
        toast.error('AI insights unavailable', { id: 'ai' });
      }

      setScanComplete(true);
    } catch (error) {
      console.error('Scan error:', error);
      toast.error(error.message || 'Failed to scan wallet', { id: 'scan' });
      router.push('/');
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
    toast.success('Copied!');
  };

  const COLORS = ['#FF7A00', '#FFA64D', '#FF8C1F', '#FFB366', '#FF9933', '#FFC080', '#FFAA4D', '#FFD4A6'];

  if (!wallet) return null;

  if (isScanning && !scanComplete) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-6"
          >
            🦊
          </motion.div>
          <h2 className="text-2xl font-bold text-[#F5F5F7] mb-4">Analyzing Your Wallet...</h2>
          <p className="text-[#A9A9B1]">Scanning multiple chains and generating insights</p>
          <div className="mt-6 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-[#FF7A00] rounded-full"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (!scanComplete || !walletData) return null;

  const analytics = walletData.analytics;

  // Chart data
  const chainDistributionData = analytics.chainDistribution.map(chain => ({
    name: chain.chain,
    value: chain.value,
    percentage: parseFloat(chain.percentage)
  }));

  const topHoldingsData = analytics.topHoldings.slice(0, 8).map(token => ({
    name: token.symbol,
    value: token.valueUSD
  }));

  const pnlData = Object.values(analytics.pnlData).slice(0, 10).map(token => ({
    name: token.symbol,
    pnl: token.totalPnL,
    profit: token.totalPnL >= 0 ? token.totalPnL : 0,
    loss: token.totalPnL < 0 ? Math.abs(token.totalPnL) : 0
  }));

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      <Toaster position="top-right" theme="dark" />

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-[#1A1A1C]/80 backdrop-blur-xl border-b border-[#FF7A00]/10"
      >
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 rounded-lg bg-[#0B0B0C] hover:bg-[#FF7A00]/20 border border-[#FF7A00]/20 hover:border-[#FF7A00] transition-all"
              >
                <FaHome className="text-[#FF7A00]" />
              </button>

              <div className="flex items-center gap-3">
                <span className="text-2xl">🦊</span>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-[#FF7A00] to-[#FFA64D] bg-clip-text text-transparent">
                    Alfredo AI
                  </h1>
                  <p className="text-xs text-[#A9A9B1]">Portfolio Intelligence</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-[#0B0B0C] px-3 py-2 rounded-lg border border-[#FF7A00]/20">
                <FaWallet className="text-[#FF7A00] text-sm" />
                <span className="text-[#F5F5F7] text-sm font-mono">
                  {wallet.slice(0, 6)}...{wallet.slice(-4)}
                </span>
                <button
                  onClick={() => copyToClipboard(wallet)}
                  className="p-1 hover:bg-[#FF7A00]/20 rounded transition-colors"
                >
                  <FaCopy className="text-[#A9A9B1] text-xs" />
                </button>
              </div>

              <button
                onClick={() => setShowChat(!showChat)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF7A00] to-[#FFA64D] text-[#0B0B0C] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#FF7A00]/50 transition-all"
              >
                <FaRobot />
                <span className="hidden sm:inline">AI Chat</span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            {
              icon: FaWallet,
              label: 'Total Value',
              value: `$${analytics.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              change: analytics.totalPnL,
              isPrimary: true
            },
            {
              icon: FaGlobe,
              label: 'Active Chains',
              value: analytics.activeChains,
              subtext: `${analytics.totalTokens} tokens`,
              isPrimary: false
            },
            {
              icon: FaChartPie,
              label: 'Diversification',
              value: `${analytics.diversificationScore}/100`,
              progress: analytics.diversificationScore,
              isPrimary: false
            },
            {
              icon: FaShieldAlt,
              label: 'Risk Score',
              value: `${analytics.riskScore}/100`,
              badge: analytics.riskScore > 70 ? 'Low Risk' : analytics.riskScore > 40 ? 'Moderate' : 'High Risk',
              badgeColor: analytics.riskScore > 70 ? 'green' : analytics.riskScore > 40 ? 'yellow' : 'red',
              isPrimary: false
            }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`${
                stat.isPrimary
                  ? 'bg-gradient-to-br from-[#FF7A00]/20 to-[#FFA64D]/10 border-[#FF7A00]/30'
                  : 'bg-[#1A1A1C] border-[#FF7A00]/10'
              } border rounded-2xl p-6 hover:border-[#FF7A00]/40 transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="text-[#FF7A00] text-2xl" />
                <span className="text-[#A9A9B1] text-sm font-medium">{stat.label}</span>
              </div>

              <div className="text-3xl font-bold text-[#F5F5F7] mb-2">{stat.value}</div>

              {stat.change !== undefined && (
                <div className={`flex items-center gap-1 text-sm font-semibold ${stat.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                  ${Math.abs(stat.change).toFixed(2)} PnL
                </div>
              )}

              {stat.subtext && <div className="text-[#A9A9B1] text-sm">{stat.subtext}</div>}

              {stat.progress !== undefined && (
                <div className="w-full bg-[#0B0B0C] rounded-full h-2 mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-[#FF7A00] to-[#FFA64D] h-2 rounded-full"
                  />
                </div>
              )}

              {stat.badge && (
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                    stat.badgeColor === 'green'
                      ? 'bg-green-500/10 text-green-500'
                      : stat.badgeColor === 'yellow'
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {stat.badge}
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 border-b border-[#FF7A00]/10 min-w-max">
            {['overview', 'holdings', 'chains', 'pnl', 'insights'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold capitalize transition-all relative ${
                  activeTab === tab
                    ? 'text-[#FF7A00]'
                    : 'text-[#A9A9B1] hover:text-[#F5F5F7]'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF7A00] to-[#FFA64D]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chain Distribution Chart */}
                <div className="bg-[#1A1A1C] border border-[#FF7A00]/10 rounded-2xl p-6 hover:border-[#FF7A00]/30 transition-all">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-[#F5F5F7] mb-6">
                    <FaLayerGroup className="text-[#FF7A00]" />
                    Chain Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chainDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chainDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1A1A1C',
                          border: '1px solid #FF7A00',
                          borderRadius: '8px',
                          color: '#F5F5F7'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="mt-6 space-y-3">
                    {analytics.chainDistribution.map((chain, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          />
                          <span className="text-[#F5F5F7] text-sm">{chain.chain}</span>
                        </div>
                        <span className="text-[#FF7A00] font-semibold text-sm">
                          ${chain.value.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Holdings Chart */}
                <div className="bg-[#1A1A1C] border border-[#FF7A00]/10 rounded-2xl p-6 hover:border-[#FF7A00]/30 transition-all">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-[#F5F5F7] mb-6">
                    <FaTrophy className="text-[#FF7A00]" />
                    Top Holdings
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topHoldingsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#FF7A00" opacity={0.1} />
                      <XAxis
                        dataKey="name"
                        stroke="#A9A9B1"
                        tick={{ fill: '#A9A9B1', fontSize: 12 }}
                      />
                      <YAxis
                        stroke="#A9A9B1"
                        tick={{ fill: '#A9A9B1', fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1A1A1C',
                          border: '1px solid #FF7A00',
                          borderRadius: '8px',
                          color: '#F5F5F7'
                        }}
                        formatter={(value) => [`$${value.toFixed(2)}`, 'Value']}
                      />
                      <Bar dataKey="value" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF7A00" stopOpacity={1} />
                          <stop offset="100%" stopColor="#FFA64D" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* PnL Summary */}
                <div className="bg-[#1A1A1C] border border-[#FF7A00]/10 rounded-2xl p-6 hover:border-[#FF7A00]/30 transition-all">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-[#F5F5F7] mb-6">
                    <FaChartLine className="text-[#FF7A00]" />
                    Profit & Loss
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Total PnL', value: analytics.totalPnL, isTotal: true },
                      { label: 'Realized', value: analytics.totalRealizedPnL },
                      { label: 'Unrealized', value: analytics.totalUnrealizedPnL },
                      { label: 'Win Rate', value: `${analytics.winRate}%`, isPercent: true }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-[#0B0B0C] rounded-xl p-4">
                        <div className="text-[#A9A9B1] text-xs mb-2">{item.label}</div>
                        <div
                          className={`text-xl font-bold ${
                            item.isPercent
                              ? 'text-[#F5F5F7]'
                              : item.value >= 0
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {item.isPercent ? item.value : `${item.value >= 0 ? '+' : ''}$${item.value.toFixed(2)}`}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={pnlData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#FF7A00" opacity={0.1} />
                        <XAxis
                          dataKey="name"
                          stroke="#A9A9B1"
                          tick={{ fill: '#A9A9B1', fontSize: 10 }}
                        />
                        <YAxis stroke="#A9A9B1" tick={{ fill: '#A9A9B1', fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1A1A1C',
                            border: '1px solid #FF7A00',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="profit" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="loss" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Trading Profile */}
                <div className="bg-[#1A1A1C] border border-[#FF7A00]/10 rounded-2xl p-6 hover:border-[#FF7A00]/30 transition-all">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-[#F5F5F7] mb-6">
                    <FaBolt className="text-[#FF7A00]" />
                    Trading Profile
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Type', value: analytics.tradingType },
                      { label: 'Wallet Age', value: `${analytics.walletAge}d` },
                      { label: 'Total Tx', value: analytics.totalTransactions },
                      { label: 'Avg Tx/Day', value: analytics.avgTransactionsPerDay }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-[#0B0B0C] rounded-xl p-4">
                        <div className="text-[#A9A9B1] text-xs mb-2">{item.label}</div>
                        <div className="text-lg font-bold text-[#F5F5F7]">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'holdings' && (
              <div className="bg-[#1A1A1C] border border-[#FF7A00]/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0B0B0C] border-b border-[#FF7A00]/10">
                      <tr>
                        <th className="text-left px-6 py-4 text-[#A9A9B1] text-sm font-semibold">#</th>
                        <th className="text-left px-6 py-4 text-[#A9A9B1] text-sm font-semibold">Token</th>
                        <th className="text-right px-6 py-4 text-[#A9A9B1] text-sm font-semibold">Balance</th>
                        <th className="text-right px-6 py-4 text-[#A9A9B1] text-sm font-semibold">Value</th>
                        <th className="text-right px-6 py-4 text-[#A9A9B1] text-sm font-semibold">24h</th>
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
                          className="border-b border-[#FF7A00]/5 hover:bg-[#FF7A00]/5 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="w-8 h-8 rounded-lg bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00] font-bold text-sm">
                              {idx + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {token.logo && (
                                <img
                                  src={token.logo}
                                  alt={token.symbol}
                                  className="w-10 h-10 rounded-full bg-[#0B0B0C]"
                                />
                              )}
                              <div>
                                <div className="font-semibold text-[#F5F5F7]">{token.name}</div>
                                <div className="text-sm text-[#A9A9B1]">{token.symbol}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="font-semibold text-[#F5F5F7]">
                              {parseFloat(token.balance).toFixed(4)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="font-bold text-[#FF7A00]">
                              ${token.valueUSD.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold ${
                                token.percentChange24h >= 0
                                  ? 'bg-green-500/10 text-green-500'
                                  : 'bg-red-500/10 text-red-500'
                              }`}
                            >
                              {token.percentChange24h >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                              {Math.abs(token.percentChange24h).toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-3 py-1 bg-[#0B0B0C] rounded-lg text-sm text-[#A9A9B1]">
                              {token.chainName}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'chains' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {walletData.chainResults
                  .filter((c) => c.hasAssets)
                  .map((chain, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-[#1A1A1C] border border-[#FF7A00]/10 rounded-2xl p-6 hover:border-[#FF7A00]/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{chain.icon}</span>
                          <div>
                            <h3 className="font-bold text-[#F5F5F7]">{chain.chainName}</h3>
                            <p className="text-sm text-[#A9A9B1]">{chain.symbol}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-[#FF7A00]">
                            ${chain.totalValue.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-[#0B0B0C] rounded-lg p-3">
                          <div className="text-xs text-[#A9A9B1] mb-1">Tokens</div>
                          <div className="text-lg font-bold text-[#F5F5F7]">{chain.tokenCount}</div>
                        </div>
                        <div className="bg-[#0B0B0C] rounded-lg p-3">
                          <div className="text-xs text-[#A9A9B1] mb-1">Transactions</div>
                          <div className="text-lg font-bold text-[#F5F5F7]">{chain.txCount}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {chain.tokens.slice(0, 5).map((token, tidx) => (
                          <div
                            key={tidx}
                            className="flex items-center justify-between bg-[#0B0B0C] rounded-lg px-3 py-2"
                          >
                            <span className="text-sm text-[#F5F5F7] font-medium">{token.symbol}</span>
                            <span className="text-sm text-[#FF7A00] font-semibold">
                              ${token.valueUSD.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}

            {activeTab === 'pnl' && (
              <div className="bg-[#1A1A1C] border border-[#FF7A00]/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0B0B0C] border-b border-[#FF7A00]/10">
                      <tr>
                        <th className="text-left px-6 py-4 text-[#A9A9B1] text-sm font-semibold">Token</th>
                        <th className="text-right px-6 py-4 text-[#A9A9B1] text-sm font-semibold">Entry</th>
                        <th className="text-right px-6 py-4 text-[#A9A9B1] text-sm font-semibold">Current</th>
                        <th className="text-right px-6 py-4 text-[#A9A9B1] text-sm font-semibold">PnL</th>
                        <th className="text-right px-6 py-4 text-[#A9A9B1] text-sm font-semibold">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(analytics.pnlData).map((token, idx) => (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="border-b border-[#FF7A00]/5 hover:bg-[#FF7A00]/5 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-[#F5F5F7]">{token.symbol}</div>
                              <div className="text-sm text-[#A9A9B1]">{token.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-[#F5F5F7]">
                            ${token.entryPrice.toFixed(4)}
                          </td>
                          <td className="px-6 py-4 text-right text-[#F5F5F7]">
                            ${token.currentPrice.toFixed(4)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={`font-bold ${
                                token.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}
                            >
                              {token.totalPnL >= 0 ? '+' : ''}${token.totalPnL.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold ${
                                token.profitPercent >= 0
                                  ? 'bg-green-500/10 text-green-500'
                                  : 'bg-red-500/10 text-red-500'
                              }`}
                            >
                              {token.profitPercent >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                              {Math.abs(token.profitPercent).toFixed(1)}%
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'insights' && aiInsights && (
              <div className="space-y-6">
                {/* Scores */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: FaTrophy, label: 'Portfolio', value: aiInsights.scores.portfolio, color: 'from-yellow-500 to-orange-500' },
                    { icon: FaShieldAlt, label: 'Risk', value: aiInsights.scores.risk, color: 'from-blue-500 to-cyan-500' },
                    { icon: FaRocket, label: 'Performance', value: aiInsights.scores.performance, color: 'from-purple-500 to-pink-500' },
                    { icon: FaChartPie, label: 'Diversification', value: aiInsights.scores.diversification, color: 'from-green-500 to-emerald-500' }
                  ].map((score, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-[#1A1A1C] border border-[#FF7A00]/10 rounded-2xl p-6 hover:border-[#FF7A00]/30 transition-all"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${score.color} flex items-center justify-center mb-4`}>
                        <score.icon className="text-white text-xl" />
                      </div>
                      <div className="text-[#A9A9B1] text-sm mb-2">{score.label}</div>
                      <div className="text-3xl font-bold text-[#F5F5F7]">{score.value}/100</div>
                    </motion.div>
                  ))}
                </div>

                {/* Insights */}
                <div className="bg-[#1A1A1C] border border-[#FF7A00]/10 rounded-2xl p-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-[#F5F5F7] mb-6">
                    <FaLightbulb className="text-[#FF7A00]" />
                    AI Insights
                  </h3>
                  <div className="space-y-4">
                    {aiInsights.insights.map((insight, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`flex gap-4 p-4 rounded-xl border-l-4 ${
                          insight.type === 'positive'
                            ? 'bg-green-500/5 border-green-500'
                            : insight.type === 'warning'
                            ? 'bg-yellow-500/5 border-yellow-500'
                            : 'bg-blue-500/5 border-blue-500'
                        }`}
                      >
                        <span className="text-2xl">{insight.icon}</span>
                        <div>
                          <h4 className="font-semibold text-[#F5F5F7] mb-1">{insight.title}</h4>
                          <p className="text-[#A9A9B1] text-sm">{insight.message}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-[#1A1A1C] border border-[#FF7A00]/10 rounded-2xl p-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-[#F5F5F7] mb-6">
                    <FaBrain className="text-[#FF7A00]" />
                    Recommendations
                  </h3>
                  <div className="space-y-6">
                    {aiInsights.recommendations.map((rec, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-[#0B0B0C] border border-[#FF7A00]/10 rounded-xl p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{rec.icon}</span>
                            <div>
                              <h4 className="font-bold text-[#F5F5F7] text-lg">{rec.title}</h4>
                              <span
                                className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold mt-1 ${
                                  rec.priority === 'High'
                                    ? 'bg-red-500/10 text-red-500'
                                    : rec.priority === 'Medium'
                                    ? 'bg-yellow-500/10 text-yellow-500'
                                    : 'bg-blue-500/10 text-blue-500'
                                }`}
                              >
                                {rec.priority} Priority
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[#A9A9B1] mb-4">{rec.description}</p>
                        <div>
                          <div className="text-[#FF7A00] font-semibold text-sm mb-2">Action Steps:</div>
                          <ul className="space-y-2">
                            {rec.actions.map((action, aidx) => (
                              <li key={aidx} className="flex items-start gap-2 text-[#A9A9B1] text-sm">
                                <span className="text-[#FF7A00] mt-1">→</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* AI Chat Sidebar */}
      <AnimatePresence>
        {showChat && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChat(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[400px] lg:w-[500px] bg-[#1A1A1C] border-l border-[#FF7A00]/20 z-50 flex flex-col shadow-2xl"
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#FF7A00]/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FFA64D] flex items-center justify-center">
                    <FaRobot className="text-[#0B0B0C] text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#F5F5F7]">Alfredo AI</h3>
                    <p className="text-xs text-[#A9A9B1]">Your Portfolio Analyst</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-2 hover:bg-[#FF7A00]/20 rounded-lg transition-colors"
                >
                  <FaTimes className="text-[#A9A9B1] hover:text-[#FF7A00]" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-6xl mb-4"
                    >
                      🦊
                    </motion.div>
                    <h4 className="text-lg font-bold text-[#F5F5F7] mb-2">Ask Me Anything!</h4>
                    <p className="text-[#A9A9B1] text-sm mb-6">
                      I can analyze your portfolio, explain risks, and suggest strategies.
                    </p>
                    <div className="space-y-2">
                      {[
                        'What are my biggest risks?',
                        'Should I rebalance my portfolio?',
                        'Which tokens look promising?'
                      ].map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => setUserInput(q)}
                          className="w-full text-left px-4 py-3 bg-[#0B0B0C] hover:bg-[#FF7A00]/10 border border-[#FF7A00]/20 hover:border-[#FF7A00] rounded-xl text-sm text-[#A9A9B1] hover:text-[#FF7A00] transition-all"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {chatMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-[#FF7A00] to-[#FFA64D] text-[#0B0B0C]'
                          : 'bg-[#0B0B0C] text-[#F5F5F7] border border-[#FF7A00]/20'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                              li: ({ children }) => <li className="mb-1">{children}</li>,
                              strong: ({ children }) => <strong className="text-[#FF7A00]">{children}</strong>,
                              code: ({ children }) => (
                                <code className="bg-[#1A1A1C] px-1 py-0.5 rounded text-[#FF7A00]">{children}</code>
                              )
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="text-sm">{message.content}</div>
                      )}
                      <div
                        className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-[#0B0B0C]/60' : 'text-[#A9A9B1]'
                        }`}
                      >
                        {message.timestamp}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-[#0B0B0C] border border-[#FF7A00]/20 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-[#FF7A00] rounded-full"
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-[#FF7A00]/10">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Ask about your portfolio..."
                    disabled={isTyping}
                    className="flex-1 bg-[#0B0B0C] border border-[#FF7A00]/20 rounded-xl px-4 py-3 text-[#F5F5F7] placeholder-[#A9A9B1] outline-none focus:border-[#FF7A00] transition-colors"
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={!userInput.trim() || isTyping}
                    className="px-6 py-3 bg-gradient-to-r from-[#FF7A00] to-[#FFA64D] text-[#0B0B0C] rounded-xl font-semibold hover:shadow-lg hover:shadow-[#FF7A00]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FaPaperPlane />
                  </button>
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
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🦊</div>
          <div className="text-[#F5F5F7]">Loading...</div>
        </div>
      </div>
    }>
      <AIDashboard />
    </Suspense>
  );
}
