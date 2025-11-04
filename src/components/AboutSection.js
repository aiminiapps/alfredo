'use client'
import { motion } from 'framer-motion';
import { 
  FaChartLine, FaUsers, FaGlobe, FaShieldAlt, 
  FaCheckCircle, FaRocket, FaBrain, FaBolt 
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const theme = {
  primary: '#FF8C00',
  secondary: '#FFB347',
  background: '#0D0A07',
  cardBg: '#1A120C',
  border: '#2A1E14',
  success: '#4CD964'
};

export default function AboutSection() {
  const stats = [
    {
      label: 'Total Portfolio Value',
      value: '$5.4B',
      subtitle: 'Analyzed across all users',
      bgColor: theme.cardBg
    },
    {
      label: 'Active Wallets',
      value: '62M+',
      subtitle: 'Growing daily',
      bgColor: theme.cardBg
    },
    {
      label: 'Supported Networks',
      value: '180',
      subtitle: 'Blockchain ecosystems',
      bgColor: theme.cardBg
    },
    {
      label: '24h Trading Volume',
      value: '$2.6B',
      subtitle: 'Real-time tracking',
      bgColor: theme.success,
      highlight: true
    }
  ];

  const trustFeatures = [
    {
      icon: FaShieldAlt,
      title: 'AI for Investors',
      description: 'Advanced investment research and real-time insights powered by machine learning'
    },
    {
      icon: FaBolt,
      title: '24/7 Support',
      description: 'Always-on customer support to guide your crypto journey'
    },
    {
      icon: FaRocket,
      title: 'Pro Trading Tools',
      description: 'Easy-to-use trading interface with professional-grade analytics'
    },
    {
      icon: FaBrain,
      title: 'Web3 Integration',
      description: 'Seamless crypto payments and Web3 wallet connectivity'
    }
  ];

  return (
    <section className="relative py-20 sm:py-32 overflow-hidden" style={{ backgroundColor: theme.background }}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 -left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: `${theme.primary}40` }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/4 -right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: `${theme.secondary}40` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Side - Stats Cards */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${theme.primary}20` }}>
                  <HiSparkles className="text-2xl" style={{ color: theme.primary }} />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white">
                  Trusted by Millions
                </h2>
              </div>
              <p className="text-gray-400 text-lg">
                Join the revolution of intelligent crypto portfolio management
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`rounded-2xl p-6 border transition-all duration-300 ${
                    stat.highlight ? 'shadow-lg' : ''
                  }`}
                  style={{
                    backgroundColor: stat.bgColor,
                    borderColor: stat.highlight ? theme.success : theme.border,
                    borderWidth: stat.highlight ? '2px' : '1px',
                    boxShadow: stat.highlight ? `0 10px 40px ${theme.success}30` : 'none'
                  }}
                >
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className={`text-3xl sm:text-4xl font-bold ${
                      stat.highlight ? 'text-white' : 'text-white'
                    }`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">
                      {stat.subtitle}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Trust Features */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Why Choose Alfredo?
              </h3>
            </motion.div>

            {trustFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ x: 10 }}
                className="flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 group hover:border-opacity-80"
                style={{
                  backgroundColor: `${theme.cardBg}80`,
                  borderColor: theme.border
                }}
              >
                <div 
                  className="flex-shrink-0 p-3 rounded-xl transition-all duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${theme.primary}20` }}
                >
                  <feature.icon className="text-2xl" style={{ color: theme.primary }} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-white font-semibold text-lg">
                      {feature.title}
                    </h4>
                    <FaCheckCircle 
                      className="flex-shrink-0 mt-1" 
                      style={{ color: theme.primary }} 
                    />
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-3 shadow-lg transition-all duration-300"
                style={{ 
                  backgroundColor: theme.primary,
                  boxShadow: `0 10px 30px ${theme.primary}40`
                }}
              >
                <FaRocket className="text-lg" />
                Start Analyzing Now
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.div>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 p-6 sm:p-8 rounded-2xl border"
          style={{
            backgroundColor: `${theme.cardBg}50`,
            borderColor: theme.border,
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: FaUsers, label: 'Active Users', value: '2M+' },
              { icon: FaChartLine, label: 'Portfolios Tracked', value: '8.5M' },
              { icon: FaGlobe, label: 'Countries', value: '180+' },
              { icon: FaBolt, label: 'Uptime', value: '99.9%' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className="text-center"
              >
                <div className="flex justify-center mb-3">
                  <div 
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: `${theme.primary}20` }}
                  >
                    <item.icon className="text-2xl" style={{ color: theme.primary }} />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {item.value}
                </p>
                <p className="text-xs sm:text-sm text-gray-400">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
