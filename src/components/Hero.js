'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { FaEthereum, FaChevronDown } from 'react-icons/fa';
import { SiSolana, SiBinance, SiPolygon } from 'react-icons/si';
import { TbHexagonLetterA, TbHexagonLetterB } from 'react-icons/tb';
import { HiSparkles } from 'react-icons/hi';
import Silk from './ui/Silk';

export default function Hero() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState({
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: FaEthereum,
    color: '#627EEA'
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const networks = [
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: FaEthereum, color: '#627EEA' },
    { id: 'bsc', name: 'BNB Smart Chain', symbol: 'BSC', icon: SiBinance, color: '#F3BA2F' },
    { id: 'solana', name: 'Solana', symbol: 'SOL', icon: SiSolana, color: '#14F195' },
    { id: 'polygon', name: 'Polygon', symbol: 'MATIC', icon: SiPolygon, color: '#8247E5' },
    { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB', icon: TbHexagonLetterA, color: '#28A0F0' },
    { id: 'base', name: 'Base', symbol: 'BASE', icon: TbHexagonLetterB, color: '#0052FF' }
  ];

  const handleAnalyze = () => {
    if (!walletAddress.trim()) {
      alert('Please enter a wallet address');
      return;
    }
    setIsLoading(true);
    router.push(`/ai?wallet=${encodeURIComponent(walletAddress)}&network=${selectedNetwork.id}`);
  };

  const handleNetworkSelect = (network) => {
    setSelectedNetwork(network);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-[#0D0A07] overflow-hidden">
      {/* Animated Background Glow */}
      <div className="absolute inset-0 overflow-hidden opacity-70">
      <Silk
        speed={5}
        scale={1}
        color="#FF6A00"
        noiseIntensity={1.5}
        rotation={0}
    />
      </div>
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4 md:px-6 pt-10">
        {/* Hero Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A120C] border border-[#2A1E14] mb-6"
          >
            <HiSparkles className="text-[#FFB347] text-xl animate-pulse" />
            <span className="text-sm font-semibold lowercase first-letter:uppercase text-gray-300">AI POWERED INTELLIGENCE</span>
          </motion.div>

          <h1 className="text-2xl heading md:text-6xl lg:text-7xl text-white mb-6 leading-tight">
          The Way to{' '}
            <span className="bg-gradient-to-r from-[#FF6A00] via-[#FF8C00] to-[#FFB347] bg-clip-text text-transparent">
            Understand
            </span> 
            <br />
            <span className="text-white">Your Crypto Portfolio!</span>
          </h1>

          <p className="text-base text-balance md:text-xl text-gray-200 max-w-2xl mx-auto">
          Alfredo analyzes your wallet and reveals your investment DNA powered by AI.
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full max-w-3xl"
        >
            
          <div className="relative bg-[#1A120C]/80 backdrop-blur-xl rounded-3xl border border-[#2A1E14] p-3 shadow-2xl shadow-[#FF8C00]/20">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Wallet Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="Put your wallet address here..."
                  className="w-full px-6 py-4 bg-[#0D0A07] border-2 border-[#2A1E14] rounded-2xl text-white placeholder-[#C9C3BD]/50 focus:border-[#FF8C00] focus:outline-none focus:ring-4 focus:ring-[#FF8C00]/20 transition-all text-base"
                />
              </div>

              {/* Network Dropdown */}
              <div className="relative md:w-48">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-4 bg-[#0D0A07] border-2 border-[#2A1E14] rounded-2xl flex items-center justify-between gap-3 hover:border-[#FF8C00] focus:border-[#FF8C00] focus:outline-none focus:ring-4 focus:ring-[#FF8C00]/20 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <selectedNetwork.icon style={{ color: selectedNetwork.color }} className="text-xl" />
                    <span className="text-white font-medium text-sm">{selectedNetwork.symbol}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaChevronDown className="text-[#FF8C00]" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute top-full mt-2 w-full bg-[#1A120C] border-2 border-[#2A1E14] rounded-2xl overflow-hidden shadow-2xl z-40"
                    >
                      {networks.map((network) => (
                        <motion.button
                          key={network.id}
                          whileHover={{ backgroundColor: 'rgba(255, 140, 0, 0.1)' }}
                          onClick={() => handleNetworkSelect(network)}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left border-b border-[#2A1E14] last:border-b-0 transition-colors"
                        >
                          <network.icon style={{ color: network.color }} className="text-xl" />
                          <div className="flex-1">
                            <div className="text-white font-medium text-sm">{network.name}</div>
                            <div className="text-[#C9C3BD] text-xs">{network.symbol}</div>
                          </div>
                          {selectedNetwork.id === network.id && (
                            <div className="w-2 h-2 rounded-full bg-[#FF8C00] shadow-lg shadow-[#FF8C00]/50" />
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Generate Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAnalyze}
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r cursor-pointer from-[#FF6A00] via-[#FF8C00] to-[#FFB347] rounded-2xl text-[#0D0A07] font-bold text-base shadow-lg shadow-[#FF8C00]/50 hover:shadow-[#FF8C00]/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-[#0D0A07] border-t-transparent rounded-full"
                    />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <HiSparkles className="text-xl" />
                    Generate
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Feature Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="hidden flex-wrap items-center justify-center gap-3 mt-8"
          >
            {[
              { text: 'AI Analysis' },
              { text: 'Multi-Chain' },
              { text: 'Real-Time' },
              { text: 'Risk Score' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -2 }}
                className="px-4 py-2 rounded-full bg-[#1A120C]/50 border border-[#2A1E14] backdrop-blur-sm flex items-center gap-2 cursor-default"
              >
                <span className="text-gray-300 text-sm font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
