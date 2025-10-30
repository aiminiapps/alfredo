'use client'
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, FaWallet, FaChartLine, FaExchangeAlt, 
  FaShieldAlt, FaRobot, FaPaperPlane, FaCheckCircle,
  FaExclamationTriangle, FaCopy, FaExternalLinkAlt,
  FaGasPump, FaFileContract, FaHistory, FaClock
} from 'react-icons/fa';
import { HiSparkles, HiLightningBolt, HiTrendingUp, HiTrendingDown } from 'react-icons/hi';
import { BiPieChartAlt2 } from 'react-icons/bi';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatEndRef = useRef(null);
  
  const wallet = searchParams.get('wallet');
  const network = searchParams.get('network');
  
  const [isLoading, setIsLoading] = useState(true);
  const [walletData, setWalletData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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
      } else {
        console.error('Failed to fetch wallet data:', result.error);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching wallet:', error);
      setIsLoading(false);
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMsg = {
      id: Date.now(),
      role: 'assistant',
      content: `Hello! I'm Alfredo, your AI crypto portfolio assistant. I've successfully connected to your ${network} wallet and analyzed your on-chain activity. Ask me anything about your portfolio, transactions, or get personalized recommendations!`,
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
              content: `You are Alfredo, an expert crypto portfolio AI assistant analyzing real blockchain data.

Wallet Analysis:
- Address: ${wallet}
- Network: ${network}
- Native Balance: ${walletData.balance.native} ${walletData.balance.symbol}
- Total Transactions: ${walletData.statistics.totalTransactions}
- Success Rate: ${walletData.statistics.successRate}%
- Gas Spent: ${walletData.statistics.totalGasSpent} ${walletData.balance.symbol}
- Unique Contracts: ${walletData.statistics.uniqueContracts}
- Risk Score: ${walletData.riskAssessment.score}/100 (${walletData.riskAssessment.level})
- Active Tokens: ${walletData.tokens.length}

Provide detailed, data-driven insights on:
- Transaction patterns and behavior
- Gas optimization strategies
- Risk assessment and security
- Token holdings analysis
- Smart contract interactions
- Portfolio recommendations

Be professional, accurate, and helpful. Use the real data provided.`
            },
            ...chatMessages.slice(-6).map(msg => ({
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
          max_tokens: 500
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseContent = data.choices?.[0]?.message?.content || data.response || 
          `Based on your wallet analysis, I can see you have ${walletData.statistics.totalTransactions} transactions with a ${walletData.statistics.successRate}% success rate. Your risk score is ${walletData.riskAssessment.score}/100, indicating ${walletData.riskAssessment.level.toLowerCase()} risk.`;
        
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
        content: `I'm analyzing your wallet data. You have ${walletData.statistics.totalTransactions} total transactions with ${walletData.statistics.successfulTransactions} successful ones. Your current risk level is ${walletData.riskAssessment.level}. Would you like specific insights?`,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0A07] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#FF8C00] border-t-transparent rounded-full mb-4"
        />
        <p className="text-[#C9C3BD] text-sm">Analyzing wallet on {network}...</p>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="min-h-screen bg-[#0D0A07] flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-[#FF453A] text-4xl mx-auto mb-4" />
          <p className="text-white text-xl mb-2">Failed to load wallet data</p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] rounded-xl text-white font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const COLORS = ['#FF6A00', '#FF8C00', '#FFB347', '#FFA733', '#FF9500'];

  return (
    <div className="min-h-screen bg-[#0D0A07]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#1A120C]/95 backdrop-blur-xl border-b border-[#2A1E14]">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/')}
                className="p-2 rounded-xl bg-[#0D0A07] border border-[#2A1E14] text-[#C9C3BD] hover:text-white hover:border-[#FF8C00] transition-all"
              >
                <FaArrowLeft />
              </motion.button>
              
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <HiSparkles className="text-[#FF8C00]" />
                  Portfolio Analysis
                </h1>
                <div className="flex items-center gap-2 text-sm text-[#C9C3BD]">
                  <span className="font-mono text-xs">{wallet?.slice(0, 8)}...{wallet?.slice(-6)}</span>
                  <button onClick={() => copyToClipboard(wallet)} className="hover:text-[#FF8C00] transition-colors">
                    <FaCopy className="text-xs" />
                  </button>
                  <a 
                    href={`https://${network === 'ethereum' ? '' : network + '.'}etherscan.io/address/${wallet}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FF8C00] transition-colors"
                  >
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                <span className="text-[#C9C3BD] text-xs">Network:</span>
                <span className="text-white font-semibold ml-2 capitalize text-sm">{network}</span>
              </div>
              <div className={`px-4 py-2 rounded-xl border ${
                walletData.riskAssessment.level === 'Low' ? 'bg-[#4CD964]/10 border-[#4CD964]/30 text-[#4CD964]' :
                walletData.riskAssessment.level === 'Medium' ? 'bg-[#FFB347]/10 border-[#FFB347]/30 text-[#FFB347]' :
                'bg-[#FF453A]/10 border-[#FF453A]/30 text-[#FF453A]'
              }`}>
                <span className="text-xs font-semibold">Risk: {walletData.riskAssessment.level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#1A120C] to-[#0D0A07] rounded-2xl border border-[#2A1E14] p-6 hover:border-[#FF8C00]/50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-xl bg-[#FF8C00]/10">
                    <FaWallet className="text-[#FF8C00] text-xl" />
                  </div>
                  <HiSparkles className="text-[#FFB347]" />
                </div>
                <p className="text-[#C9C3BD] text-xs mb-1 uppercase tracking-wide">Balance</p>
                <h3 className="text-2xl font-bold text-white">{walletData.balance.native}</h3>
                <p className="text-[#FFB347] text-sm mt-1">{walletData.balance.symbol}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-[#1A120C] to-[#0D0A07] rounded-2xl border border-[#2A1E14] p-6 hover:border-[#FF8C00]/50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-xl bg-[#4CD964]/10">
                    <FaCheckCircle className="text-[#4CD964] text-xl" />
                  </div>
                  <span className="text-xs font-semibold text-[#4CD964] px-2 py-1 rounded-full bg-[#4CD964]/10">
                    {walletData.statistics.successRate}%
                  </span>
                </div>
                <p className="text-[#C9C3BD] text-xs mb-1 uppercase tracking-wide">Success Rate</p>
                <h3 className="text-2xl font-bold text-white">{walletData.statistics.successfulTransactions}</h3>
                <p className="text-[#C9C3BD] text-sm mt-1">of {walletData.statistics.totalTransactions} txs</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-[#1A120C] to-[#0D0A07] rounded-2xl border border-[#2A1E14] p-6 hover:border-[#FF8C00]/50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-xl bg-[#FFB347]/10">
                    <FaGasPump className="text-[#FFB347] text-xl" />
                  </div>
                </div>
                <p className="text-[#C9C3BD] text-xs mb-1 uppercase tracking-wide">Gas Spent</p>
                <h3 className="text-2xl font-bold text-white">{parseFloat(walletData.statistics.totalGasSpent).toFixed(4)}</h3>
                <p className="text-[#FFB347] text-sm mt-1">{walletData.balance.symbol}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-[#1A120C] to-[#0D0A07] rounded-2xl border border-[#2A1E14] p-6 hover:border-[#FF8C00]/50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-xl bg-[#FF8C00]/10">
                    <FaFileContract className="text-[#FF8C00] text-xl" />
                  </div>
                </div>
                <p className="text-[#C9C3BD] text-xs mb-1 uppercase tracking-wide">Contracts</p>
                <h3 className="text-2xl font-bold text-white">{walletData.statistics.uniqueContracts}</h3>
                <p className="text-[#C9C3BD] text-sm mt-1">Unique</p>
              </motion.div>
            </div>

            {/* Activity Chart */}
            {walletData.activityTimeline && walletData.activityTimeline.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#1A120C] rounded-2xl border border-[#2A1E14] p-6"
              >
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <FaChartLine className="text-[#FF8C00]" />
                  Activity Timeline (Last 30 Days)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={walletData.activityTimeline}>
                    <defs>
                      <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FF8C00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A1E14" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#C9C3BD" 
                      tick={{ fill: '#C9C3BD', fontSize: 12 }}
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke="#C9C3BD" tick={{ fill: '#C9C3BD', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1A120C', 
                        border: '1px solid #2A1E14',
                        borderRadius: '12px',
                        color: '#FFFFFF'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="transactions" 
                      stroke="#FF8C00" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorTx)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Tabs */}
            <div className="bg-[#1A120C] rounded-2xl border border-[#2A1E14] overflow-hidden">
              <div className="flex border-b border-[#2A1E14] overflow-x-auto">
                {['transactions', 'tokens', 'analytics'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-semibold capitalize whitespace-nowrap transition-all ${
                      activeTab === tab
                        ? 'text-white bg-[#0D0A07] border-b-2 border-[#FF8C00]'
                        : 'text-[#C9C3BD] hover:text-white hover:bg-[#0D0A07]/50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'transactions' && (
                  <div className="space-y-3">
                    {walletData.transactions.length > 0 ? (
                      walletData.transactions.map((tx, idx) => (
                        <motion.div
                          key={tx.hash}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
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
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-white font-medium text-sm truncate">{tx.hash.slice(0, 16)}...{tx.hash.slice(-8)}</p>
                                  <button 
                                    onClick={() => copyToClipboard(tx.hash)}
                                    className="text-[#C9C3BD] hover:text-[#FF8C00] transition-colors"
                                  >
                                    <FaCopy className="text-xs" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-[#C9C3BD]">
                                  <span className="flex items-center gap-1">
                                    <FaClock />
                                    {formatDate(tx.timestamp)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FaGasPump />
                                    {tx.gasPrice} Gwei
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">{tx.value} {walletData.balance.symbol}</p>
                              <p className="text-[#C9C3BD] text-xs mt-1">Gas: {(tx.gasUsed / 1000).toFixed(1)}k</p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <FaHistory className="text-[#C9C3BD] text-4xl mx-auto mb-4 opacity-50" />
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
                          transition={{ delay: idx * 0.05 }}
                          className="p-4 rounded-xl bg-[#0D0A07] border border-[#2A1E14] hover:border-[#FF8C00]/50 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FFB347] flex items-center justify-center text-white font-bold text-sm">
                                {token.symbol.slice(0, 2)}
                              </div>
                              <div>
                                <h4 className="text-white font-semibold">{token.name}</h4>
                                <p className="text-[#C9C3BD] text-sm">{token.symbol}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">{parseFloat(token.balance).toFixed(4)}</p>
                              <p className="text-[#C9C3BD] text-xs">{token.symbol}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <BiPieChartAlt2 className="text-[#C9C3BD] text-4xl mx-auto mb-4 opacity-50" />
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
                          <FaShieldAlt className="text-[#FF8C00]" />
                          Risk Assessment
                        </h4>
                        <div className="flex items-center justify-center mb-4">
                          <div className="relative w-32 h-32">
                            <svg className="transform -rotate-90 w-32 h-32">
                              <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="#2A1E14"
                                strokeWidth="8"
                                fill="none"
                              />
                              <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke={
                                  walletData.riskAssessment.level === 'Low' ? '#4CD964' :
                                  walletData.riskAssessment.level === 'Medium' ? '#FFB347' : '#FF453A'
                                }
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${(walletData.riskAssessment.score / 100) * 351.86} 351.86`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <p className="text-3xl font-bold text-white">{walletData.riskAssessment.score}</p>
                                <p className="text-xs text-[#C9C3BD]">/ 100</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-center text-sm text-[#C9C3BD]">
                          Risk Level: <span className={`font-semibold ${
                            walletData.riskAssessment.level === 'Low' ? 'text-[#4CD964]' :
                            walletData.riskAssessment.level === 'Medium' ? 'text-[#FFB347]' : 'text-[#FF453A]'
                          }`}>{walletData.riskAssessment.level}</span>
                        </p>
                        {walletData.riskAssessment.factors.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {walletData.riskAssessment.factors.map((factor, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-[#C9C3BD]">
                                <FaExclamationTriangle className="text-[#FFB347] mt-0.5 flex-shrink-0" />
                                <span>{factor}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="p-6 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <FaHistory className="text-[#FF8C00]" />
                          Wallet Age
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[#C9C3BD] text-xs mb-1">First Transaction</p>
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
                            <p className="text-[#C9C3BD] text-xs mb-1">Last Transaction</p>
                            <p className="text-white font-medium">
                              {walletData.statistics.lastTransaction ? 
                                new Date(walletData.statistics.lastTransaction).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) : 'N/A'
                              }
                            </p>
                          </div>
                          <div className="pt-4 border-t border-[#2A1E14]">
                            <p className="text-[#C9C3BD] text-xs mb-1">Total Activity</p>
                            <p className="text-white font-medium text-2xl">{walletData.statistics.totalTransactions}</p>
                            <p className="text-[#FFB347] text-xs mt-1">Transactions</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Chat Sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky top-24 bg-[#1A120C] rounded-2xl border border-[#2A1E14] overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
              <div className="bg-gradient-to-r from-[#FF6A00] via-[#FF8C00] to-[#FFB347] p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <FaRobot className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Alfredo AI</h3>
                    <p className="text-white/80 text-xs">Portfolio Assistant</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] text-white'
                        : 'bg-[#0D0A07] border border-[#2A1E14] text-white'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs opacity-60 mt-2">{msg.timestamp}</p>
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#0D0A07] border border-[#2A1E14] rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                          transition={{ duration: 0.8, repeat: Infinity }} 
                          className="w-2 h-2 bg-[#FF8C00] rounded-full" 
                        />
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                          transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }} 
                          className="w-2 h-2 bg-[#FF8C00] rounded-full" 
                        />
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                          transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }} 
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
                    placeholder="Ask about your wallet..."
                    className="flex-1 px-4 py-3 rounded-xl bg-[#0D0A07] border border-[#2A1E14] text-white placeholder-[#C9C3BD]/50 focus:border-[#FF8C00] focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/20 text-sm transition-all"
                    disabled={isTyping}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendChatMessage}
                    disabled={isTyping || !userInput.trim()}
                    className="p-3 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
          className="w-16 h-16 border-4 border-[#FF8C00] border-t-transparent rounded-full"
        />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
