// components/AboutSection.jsx - Alfredo Premium Features Section
'use client'
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { 
  FaBrain, FaNetworkWired, FaChartLine, FaRocket, FaShieldAlt, 
  FaBolt, FaEye, FaCode, FaGem, FaCube
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { BiTargetLock } from 'react-icons/bi';

const theme = {
  primary: '#FF8C00',
  secondary: '#FFB347',
  background: '#0D0A07',
  cardBg: '#1A120C',
  border: '#2A1E14'
};

export default function AboutSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.95, 1, 1, 0.95]);

  const keyFeatures = [
    {
      icon: FaBrain,
      title: 'AI-Powered Intelligence',
      description: 'Advanced machine learning algorithms analyze your wallet behavior, transaction patterns, and market trends to provide actionable insights and predictions.',
      color: '#FF8C00',
      gradient: 'from-orange-500 to-amber-600'
    },
    {
      icon: FaNetworkWired,
      title: 'Universal Network Support',
      description: 'Seamlessly track portfolios across Ethereum, BSC, Polygon, Arbitrum, Optimism, and all major blockchain networks from a single unified dashboard.',
      color: '#4CD964',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: FaChartLine,
      title: 'Intuitive Dashboard',
      description: 'Experience a beautifully designed, user-friendly interface with real-time data visualization, interactive charts, and comprehensive analytics at your fingertips.',
      color: '#FFB347',
      gradient: 'from-amber-500 to-yellow-600'
    },
    {
      icon: FaShieldAlt,
      title: 'Advanced Risk Analysis',
      description: 'Multi-dimensional risk assessment algorithms evaluate your portfolio health, diversification score, and provide personalized recommendations.',
      color: '#FF453A',
      gradient: 'from-red-500 to-rose-600'
    },
    {
      icon: FaBolt,
      title: 'Real-Time Insights',
      description: 'Get instant notifications on portfolio changes, market opportunities, and critical wallet activities with our lightning-fast blockchain data processing.',
      color: '#5E5CE6',
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      icon: FaEye,
      title: 'Portfolio Intelligence',
      description: 'Understand your investment behavior, identify patterns, and optimize your strategy with AI-generated reports and predictive analytics.',
      color: '#32ADE6',
      gradient: 'from-cyan-500 to-blue-600'
    }
  ];

  const stats = [
    {
      icon: FaCube,
      value: 'Unlimited',
      label: 'Wallet Analysis',
      description: 'Track any wallet address across all supported networks'
    },
    {
      icon: FaCode,
      value: 'Real-Time',
      label: 'Blockchain Data',
      description: 'Live transaction tracking and portfolio updates'
    },
    {
      icon: FaGem,
      value: 'AI-Driven',
      label: 'Smart Insights',
      description: 'Machine learning powered recommendations'
    }
  ];

  return (
    <section 
      ref={containerRef}
      className="relative py-24 sm:py-32 lg:py-40 overflow-hidden" 
      style={{ backgroundColor: theme.background }}
    >
      {/* Premium Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/10 via-transparent to-transparent" />
        <motion.div
          style={{ opacity }}
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] bg-orange-500/10"
        />
        <motion.div
          style={{ opacity }}
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] bg-amber-500/10"
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,140,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,140,0,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <motion.div 
        style={{ opacity, scale }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 sm:mb-20 lg:mb-24"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border"
            style={{ 
              backgroundColor: `${theme.primary}10`,
              borderColor: `${theme.primary}30`
            }}
          >
            <HiSparkles className="text-lg" style={{ color: theme.primary }} />
            <span className="text-sm font-medium" style={{ color: theme.primary }}>
              Powered by Advanced AI
            </span>
          </motion.div>

          <h2 className="heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Why Alfredo Stands
            <br />
            <span 
              className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent"
            >
              Above the Rest
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Experience the future of crypto portfolio management with cutting-edge AI technology,
            comprehensive network support, and an interface designed for both beginners and professionals.
          </p>
        </motion.div>

        {/* Premium Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16 sm:mb-20">
          {keyFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.7, 
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1]
              }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              {/* Glow Effect */}
              <div 
                className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"
                style={{ 
                  background: `linear-gradient(135deg, ${feature.color}40, transparent)`
                }}
              />
              
              {/* Card */}
              <div 
                className="relative h-full p-8 rounded-2xl border transition-all duration-500"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border
                }}
              >
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex p-4 rounded-xl mb-6"
                  style={{ 
                    backgroundColor: `${feature.color}15`,
                    boxShadow: `0 0 30px ${feature.color}20`
                  }}
                >
                  <feature.icon 
                    className="text-3xl" 
                    style={{ color: feature.color }} 
                  />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-amber-400 group-hover:bg-clip-text transition-all duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed text-sm">
                  {feature.description}
                </p>

                {/* Hover Indicator */}
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '60px' }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.6 }}
                  className="h-1 rounded-full mt-6"
                  style={{ 
                    background: `linear-gradient(90deg, ${feature.color}, transparent)`
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative p-8 sm:p-10 rounded-3xl border overflow-hidden"
          style={{
            backgroundColor: `${theme.cardBg}80`,
            borderColor: theme.border,
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,#FF8C00_1px,transparent_1px),linear-gradient(-45deg,#FF8C00_1px,transparent_1px)] bg-[size:20px_20px]" />
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="text-center group"
              >
                <div className="inline-flex p-4 rounded-2xl mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${theme.primary}15` }}
                >
                  <stat.icon 
                    className="text-3xl transition-all duration-300 group-hover:rotate-12" 
                    style={{ color: theme.primary }} 
                  />
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-lg font-semibold mb-1" style={{ color: theme.primary }}>
                  {stat.label}
                </p>
                <p className="text-sm text-gray-500">
                  {stat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 sm:mt-20 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: `0 20px 60px ${theme.primary}50` }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-white text-lg shadow-2xl transition-all duration-300"
            style={{ 
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              boxShadow: `0 10px 40px ${theme.primary}40`
            }}
          >
            <BiTargetLock className="text-2xl" />
            Analyze Your Portfolio Now
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <FaRocket className="text-xl" />
            </motion.div>
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}
