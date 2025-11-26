'use client'
import { motion } from 'motion/react';
import { FaExternalLinkAlt, FaFileAlt, FaCoins, FaLock, FaFire, FaShieldAlt } from 'react-icons/fa';
import { BiNetworkChart } from 'react-icons/bi';

const theme = {
  primary: '#FF8C00',
  secondary: '#FFB347',
  background: '#0D0A07',
  cardBg: '#1A120C',
  border: '#2A1E14'
};

export default function TokenomicsSection() {
  const allocationData = [
    { 
      category: 'Ecosystem & Rewards', 
      allocation: '25%', 
      vesting: '36 months',
      color: '#FF8C00',
      description: 'Community rewards and ecosystem growth'
    },
    { 
      category: 'Development & Research', 
      allocation: '20%', 
      vesting: '48 months',
      color: '#4CD964',
      description: 'AI development and platform innovation'
    },
    { 
      category: 'Private / Partners', 
      allocation: '15%', 
      vesting: '24 months',
      color: '#5E5CE6',
      description: 'Strategic partnerships and early investors'
    },
    { 
      category: 'Public Sale', 
      allocation: '10%', 
      vesting: '12 months',
      color: '#FFB347',
      description: 'Public distribution and listing'
    },
    { 
      category: 'Team & Advisors', 
      allocation: '15%', 
      vesting: '36 months',
      color: '#32ADE6',
      description: 'Core team and advisory board'
    },
    { 
      category: 'Liquidity & Exchange', 
      allocation: '10%', 
      vesting: '—',
      color: '#FF453A',
      description: 'DEX and CEX liquidity pools'
    },
    { 
      category: 'Reserve', 
      allocation: '5%', 
      vesting: '—',
      color: '#A855F7',
      description: 'Emergency reserve and future use'
    }
  ];

  const quickFacts = [
    {
      icon: BiNetworkChart,
      label: 'Chain',
      value: 'Binance Smart Chain',
      subValue: 'BEP-20',
      color: '#FFB347'
    },
    {
      icon: FaCoins,
      label: 'Total Supply',
      value: '10,000,000,000',
      subValue: 'AFRD',
      color: '#FF8C00'
    },
    {
      icon: FaShieldAlt,
      label: 'Audit',
      value: 'Security Partners',
      subValue: 'Scheduled',
      color: '#4CD964'
    },
    {
      icon: FaFire,
      label: 'Deflation',
      value: 'Burn Mechanism',
      subValue: 'Report-based',
      color: '#FF453A'
    }
  ];

  return (
    <section 
      id='tokenomics'
      className="relative py-14 sm:py-32 lg:py-40 overflow-hidden" 
      style={{ backgroundColor: theme.background }}
    >
      {/* Premium Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/5 via-transparent to-transparent" />
        {/* Dot Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,140,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,140,0,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 sm:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border backdrop-blur-sm"
            style={{ 
              backgroundColor: `${theme.primary}10`,
              borderColor: `${theme.primary}30`
            }}
          >
            <FaCoins className="text-lg" style={{ color: theme.primary }} />
            <span className="text-sm font-medium" style={{ color: theme.primary }}>
              AFRD TOKEN
            </span>
          </motion.div>

          <h2 className="text-2xl heading md:text-6xl lg:text-5xl text-white mb-6 leading-tight">
            The Utility Engine
            <br />
            <span 
              className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent"
            >
              Behind Alfredo
            </span>
          </h2>

          <p className="text-base sm:text-lg text-balance text-gray-400 max-w-3xl mx-auto leading-relaxed">
            The AFRD token fuels the Alfredo ecosystem enabling AI reports, governance, rewards, and sustainable growth.
          </p>
        </motion.div>

        {/* Quick Facts Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          {quickFacts.map((fact, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative rounded-2xl border p-6 backdrop-blur-sm"
              style={{
                backgroundColor: `${theme.cardBg}95`,
                borderColor: theme.border
              }}
            >
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{fact.label}</p>
              <p className="text-xl font-bold text-white mb-1">{fact.value}</p>
              <p className="text-sm font-medium" style={{ color: fact.color }}>{fact.subValue}</p>

              {/* Hover Effect */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${fact.color}10, transparent 70%)`
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Allocation Table */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="rounded-3xl border overflow-hidden backdrop-blur-xl mb-6"
          style={{
            backgroundColor: `${theme.cardBg}95`,
            borderColor: theme.border,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Table Header */}
          <div 
            className="px-6 sm:px-8 py-4 border-b"
            style={{ 
              backgroundColor: `${theme.primary}10`,
              borderColor: theme.border
            }}
          >
            <div className="grid grid-cols-12 gap-4 text-sm font-bold text-white uppercase tracking-wider">
              <div className="col-span-6 sm:col-span-5">Category</div>
              <div className="col-span-3 sm:col-span-2 text-center">Allocation</div>
              <div className="col-span-3 sm:col-span-2 text-center">Vesting</div>
              <div className="hidden sm:block sm:col-span-3" />
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y" style={{ borderColor: theme.border }}>
            {allocationData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="group px-6 sm:px-8 py-5 hover:bg-opacity-50 transition-all duration-300"
                style={{
                  backgroundColor: 'transparent'
                }}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Category */}
                  <div className="col-span-6 sm:col-span-5">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-1 h-12 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <h4 className="text-white font-semibold text-sm sm:text-base mb-1">
                          {item.category}
                        </h4>
                        <p className="text-gray-500 text-xs hidden sm:block">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Allocation */}
                  <div className="col-span-3 sm:col-span-2 text-center">
                    <div 
                      className="inline-flex px-3 py-1.5 rounded-full font-bold text-sm"
                      style={{
                        backgroundColor: `${item.color}15`,
                        color: item.color
                      }}
                    >
                      {item.allocation}
                    </div>
                  </div>

                  {/* Vesting */}
                  <div className="col-span-3 sm:col-span-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {item.vesting !== '—' && (
                        <FaLock className="text-gray-500 text-xs" />
                      )}
                      <span className="text-gray-400 text-sm font-medium">
                        {item.vesting}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar (Desktop) */}
                  <div className="hidden sm:block sm:col-span-3">
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${item.color}15` }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: item.allocation }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.08 + 0.3, duration: 1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.a
            href="https://bscscan.com/token/0x5defe90ace2cc2eb1a3a356dfdc56589bdb7ebcc"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, boxShadow: `0 20px 60px ${theme.primary}50` }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              boxShadow: `0 10px 40px ${theme.primary}40`
            }}
          >
            <FaExternalLinkAlt />
            View Token on BscScan
          </motion.a>

          <motion.a
            href="https://alfredoai.gitbook.io/alfredoai-docs/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ 
              scale: 1.05,
              backgroundColor: `${theme.cardBg}`,
              borderColor: theme.primary
            }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-white border transition-all duration-300"
            style={{
              backgroundColor: 'transparent',
              borderColor: `${theme.primary}40`
            }}
          >
            <FaFileAlt />
            Read Full Tokenomics
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
