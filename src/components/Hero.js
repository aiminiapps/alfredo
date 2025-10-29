'use client'
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaWallet, FaChartLine, FaRobot } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';
import { IoIosArrowForward } from 'react-icons/io';
import LaserFlow from './ui/LaserFlow';

export default function Hero() {
  const revealImgRef = useRef(null);
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [isLoading, setIsLoading] = useState(false);

  const networks = [
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'bsc', name: 'BSC', symbol: 'BSC' },
    { id: 'solana', name: 'Solana', symbol: 'SOL' },
    { id: 'polygon', name: 'Polygon', symbol: 'MATIC' },
    { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB' },
    { id: 'base', name: 'Base', symbol: 'BASE' }
  ];

  const handleAnalyze = () => {
    if (!walletAddress.trim()) {
      alert('Please enter a wallet address');
      return;
    }
    
    setIsLoading(true);
    router.push(`/ai?wallet=${encodeURIComponent(walletAddress)}&network=${selectedNetwork}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div 
      className='h-screen'
      style={{ 
        position: 'relative', 
        overflow: 'hidden',
        backgroundColor: '#0D0A07'
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const el = revealImgRef.current;
        if (el) {
          el.style.setProperty('--mx', `${x}px`);
          el.style.setProperty('--my', `${y + rect.height * 0.5}px`);
        }
      }}
      onMouseLeave={() => {
        const el = revealImgRef.current;
        if (el) {
          el.style.setProperty('--mx', '-9999px');
          el.style.setProperty('--my', '-9999px');
        }
      }}
    >
      <LaserFlow
        horizontalBeamOffset={0.1}
        verticalBeamOffset={0.0}
        color="#FF8C00"
      />
      
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '86%',
        height: '60%',
        backgroundColor: '#060010',
        borderRadius: '20px',
        border: '2px solid #FF8C00',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '2rem',
        zIndex: 6,
        padding: '2rem',
        overflowY: 'auto'
      }}>
        {/* Your content here */}
        <div style={{ width: '100%', maxWidth: '600px' }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '2rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <FaRobot style={{ fontSize: '3rem', color: '#FF79C6' }} />
              <HiSparkles style={{ fontSize: '2rem', color: '#FFB347' }} />
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#FFFFFF' }}>
              Alfredo
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#C9C3BD', marginBottom: '0.5rem' }}>
              AI-Powered Crypto Portfolio Intelligence
            </p>
            <p style={{ fontSize: '0.9rem', color: '#C9C3BD', opacity: 0.7 }}>
              Enter your wallet address and network to analyze
            </p>
          </motion.div>

          {/* Wallet Address Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{ marginBottom: '1.5rem' }}
          >
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem', color: '#FFFFFF' }}>
              <FaWallet style={{ display: 'inline', marginRight: '0.5rem', color: '#FF79C6' }} />
              Wallet Address
            </label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="0x... or wallet address"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid #2A1E14',
                backgroundColor: '#0D0A07',
                color: '#FFFFFF',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#FF79C6'}
              onBlur={(e) => e.target.style.borderColor = '#2A1E14'}
            />
          </motion.div>

          {/* Network Selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{ marginBottom: '2rem' }}
          >
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem', color: '#FFFFFF' }}>
              <FaChartLine style={{ display: 'inline', marginRight: '0.5rem', color: '#FF79C6' }} />
              Select Network
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {networks.map((network) => (
                <motion.button
                  key={network.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedNetwork(network.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: selectedNetwork === network.id ? '2px solid #FF79C6' : '1px solid #2A1E14',
                    backgroundColor: selectedNetwork === network.id ? 'rgba(255, 121, 198, 0.1)' : '#0D0A07',
                    color: selectedNetwork === network.id ? '#FF79C6' : '#C9C3BD',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  {network.name}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Analyze Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: '#FF79C6',
              color: '#060010',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 20px rgba(255, 121, 198, 0.3)',
              transition: 'all 0.3s',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Analyzing...' : 'Analyze Portfolio'}
            {!isLoading && <IoIosArrowForward />}
          </motion.button>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}
          >
            {['AI Analysis', 'P&L Tracking', 'Risk Score', 'Recommendations'].map((feature, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  border: '1px solid #2A1E14',
                  backgroundColor: 'rgba(255, 121, 198, 0.1)',
                  color: '#FFB347',
                  fontSize: '0.75rem'
                }}
              >
                {feature}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <img
        ref={revealImgRef}
        src="/path/to/image.jpg"
        alt="Reveal effect"
        style={{
          position: 'absolute',
          width: '100%',
          top: '-50%',
          zIndex: 5,
          mixBlendMode: 'lighten',
          opacity: 0.3,
          pointerEvents: 'none',
          '--mx': '-9999px',
          '--my': '-9999px',
          WebkitMaskImage: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px)',
          maskImage: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px)',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat'
        }}
      />
    </div>
  );
}
