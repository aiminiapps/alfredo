'use client'
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, FaWallet, FaChartLine, FaExchangeAlt, 
  FaShieldAlt, FaRobot, FaPaperPlane, FaCheckCircle,
  FaExclamationTriangle, FaCopy, FaExternalLinkAlt
} from 'react-icons/fa';
import { HiSparkles, HiLightningBolt, HiTrendingUp, HiTrendingDown } from 'react-icons/hi';
import { BiPieChartAlt2 } from 'react-icons/bi';

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
    if (wallet && network) {
      fetchWalletData();
      addWelcomeMessage();
    }
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
      content: `Hello! I'm Alfredo, your AI crypto portfolio assistant. I've analyzed your wallet and I'm here to help you understand your portfolio, answer questions, and provide personalized recommendations. What would you like to know?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages([welcomeMsg]);
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
            {
              role: "system",
              content: `You are Alfredo, an expert crypto portfolio AI assistant. Help users understand their portfolio with these details:
              
              Wallet: ${wallet}
              Network: ${network}
              Total Balance: ${walletData?.balance?.usd || 'N/A'}
              Portfolio Health: ${walletData?.performance?.portfolioHealth || 'N/A'}/100
              Risk Score: ${walletData?.riskScore?.score || 'N/A'}/100
              P&L: ${walletData?.performance?.totalProfitLoss || 'N/A'}
              
              Provide insights on:
              - Portfolio performance and trends
              - Risk management strategies
              - Diversification recommendations
              - Market opportunities
              - Token analysis
              
              Be helpful, accurate, and professional. Use data-driven insights.`
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
          max_tokens: 400
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseContent = data.choices?.[0]?.message?.content || data.response || 
          `Based on your portfolio analysis, I recommend diversifying your holdings and monitoring market trends closely.`;
        
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setChatMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const fallbackMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `I'm here to help! Based on your portfolio, consider reviewing your asset allocation and keeping an eye on market volatility.`,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0A07] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#FF8C00] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0A07]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#1A120C]/90 backdrop-blur-xl border-b border-[#2A1E14]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
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
                <h1 className="text-xl font-bold text-white">Portfolio Analysis</h1>
                <div className="flex items-center gap-2 text-sm text-[#C9C3BD]">
                  <span className="font-mono">{wallet?.slice(0, 6)}...{wallet?.slice(-4)}</span>
                  <button onClick={() => copyToClipboard(wallet)} className="hover:text-[#FF8C00]">
                    <FaCopy className="text-xs" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-full bg-[#0D0A07] border border-[#2A1E14] text-sm">
                <span className="text-[#C9C3BD]">Network:</span>
                <span className="text-white font-medium ml-2 capitalize">{network}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#1A120C] to-[#0D0A07] rounded-2xl border border-[#2A1E14] p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <FaWallet className="text-[#FF8C00] text-2xl" />
                  <HiSparkles className="text-[#FFB347]" />
                </div>
                <p className="text-[#C9C3BD] text-sm mb-1">Total Balance</p>
                <h3 className="text-2xl font-bold text-white">${walletData?.balance?.usd}</h3>
                <p className="text-[#4CD964] text-sm mt-1 flex items-center gap-1">
                  <HiTrendingUp /> {walletData?.performance?.profitLossPercentage}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-[#1A120C] to-[#0D0A07] rounded-2xl border border-[#2A1E14] p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <BiPieChartAlt2 className="text-[#FF8C00] text-2xl" />
                  <div className="text-3xl font-bold text-white">{walletData?.performance?.portfolioHealth}</div>
                </div>
                <p className="text-[#C9C3BD] text-sm mb-1">Portfolio Health</p>
                <div className="w-full bg-[#0D0A07] rounded-full h-2 mt-3">
                  <div 
                    className="bg-gradient-to-r from-[#FF6A00] to-[#FFB347] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${walletData?.performance?.portfolioHealth}%` }}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-[#1A120C] to-[#0D0A07] rounded-2xl border border-[#2A1E14] p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <FaShieldAlt className="text-[#FF8C00] text-2xl" />
                  <span className="px-2 py-1 rounded-full bg-[#FF8C00]/20 text-[#FFB347] text-xs font-medium">
                    {walletData?.riskScore?.level}
                  </span>
                </div>
                <p className="text-[#C9C3BD] text-sm mb-1">Risk Score</p>
                <h3 className="text-2xl font-bold text-white">{walletData?.riskScore?.score}/100</h3>
              </motion.div>
            </div>

            {/* Tabs */}
            <div className="bg-[#1A120C] rounded-2xl border border-[#2A1E14] overflow-hidden">
              <div className="flex border-b border-[#2A1E14]">
                {['overview', 'tokens', 'transactions'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 text-sm font-medium capitalize transition-all ${
                      activeTab === tab
                        ? 'text-white bg-[#0D0A07] border-b-2 border-[#FF8C00]'
                        : 'text-[#C9C3BD] hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <FaChartLine className="text-[#FF8C00]" />
                        Performance
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                          <p className="text-[#C9C3BD] text-sm mb-1">Total P&L</p>
                          <p className="text-[#4CD964] text-xl font-bold">{walletData?.performance?.totalProfitLoss}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                          <p className="text-[#C9C3BD] text-sm mb-1">Best Performer</p>
                          <p className="text-white text-xl font-bold">{walletData?.performance?.bestPerformer}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <FaShieldAlt className="text-[#FF8C00]" />
                        Risk Factors
                      </h3>
                      <div className="space-y-3">
                        {walletData?.riskScore?.factors.map((factor, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-[#0D0A07] border border-[#2A1E14]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white text-sm font-medium">{factor.name}</span>
                              <span className={`text-sm font-medium ${
                                factor.status === 'good' ? 'text-[#4CD964]' :
                                factor.status === 'medium' ? 'text-[#FFB347]' : 'text-[#FF453A]'
                              }`}>
                                {factor.score}%
                              </span>
                            </div>
                            <div className="w-full bg-[#1A120C] rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  factor.status === 'good' ? 'bg-[#4CD964]' :
                                  factor.status === 'medium' ? 'bg-[#FFB347]' : 'bg-[#FF453A]'
                                }`}
                                style={{ width: `${factor.score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'tokens' && (
                  <div className="space-y-3">
                    {walletData?.tokens.map((token, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 rounded-xl bg-[#0D0A07] border border-[#2A1E14] hover:border-[#FF8C00] transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FFB347] flex items-center justify-center text-white font-bold">
                              {token.symbol[0]}
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{token.name}</h4>
                              <p className="text-[#C9C3BD] text-sm">{token.amount} {token.symbol}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold">${token.value}</p>
                            <p className={`text-sm flex items-center gap-1 justify-end ${
                              token.isPositive ? 'text-[#4CD964]' : 'text-[#FF453A]'
                            }`}>
                              {token.isPositive ? <HiTrendingUp /> : <HiTrendingDown />}
                              {token.change}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeTab === 'transactions' && (
                  <div className="space-y-3">
                    {walletData?.transactions.map((tx, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 rounded-xl bg-[#0D0A07] border border-[#2A1E14] hover:border-[#FF8C00] transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              tx.type === 'Received' ? 'bg-[#4CD964]/20 text-[#4CD964]' :
                              tx.type === 'Sent' ? 'bg-[#FF453A]/20 text-[#FF453A]' :
                              'bg-[#FFB347]/20 text-[#FFB347]'
                            }`}>
                              <FaExchangeAlt />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{tx.type}</h4>
                              <p className="text-[#C9C3BD] text-sm">{tx.token}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">{tx.value}</p>
                            <p className="text-[#C9C3BD] text-xs">{tx.time}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Chat Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-[#1A120C] rounded-2xl border border-[#2A1E14] overflow-hidden h-[calc(100vh-8rem)]">
              <div className="bg-gradient-to-r from-[#FF6A00] to-[#FFB347] p-4">
                <div className="flex items-center gap-2 text-[#0D0A07]">
                  <FaRobot className="text-2xl" />
                  <div>
                    <h3 className="font-bold">AI Assistant</h3>
                    <p className="text-xs opacity-80">Ask me anything</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col h-[calc(100%-80px)]">
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
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p className="text-xs opacity-60 mt-1">{msg.timestamp}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-[#0D0A07] border border-[#2A1E14] rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }} className="w-2 h-2 bg-[#FF8C00] rounded-full" />
                          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 bg-[#FF8C00] rounded-full" />
                          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 bg-[#FF8C00] rounded-full" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t border-[#2A1E14]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Ask about your portfolio..."
                      className="flex-1 px-4 py-3 rounded-xl bg-[#0D0A07] border border-[#2A1E14] text-white placeholder-[#C9C3BD] focus:border-[#FF8C00] focus:outline-none text-sm"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendChatMessage}
                      disabled={isTyping}
                      className="p-3 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] text-white disabled:opacity-50"
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
