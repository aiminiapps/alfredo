'use client'
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import {  FaNetworkWired, FaShieldAlt, 
  FaBolt, FaEye, FaCheckCircle
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

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

  const imageY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const imageRotate = useTransform(scrollYProgress, [0, 1], [5, -5]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const features = [
    {
      icon: FaNetworkWired,
      title: 'Universal Network Support',
      description: 'Track portfolios across Ethereum, BSC, Polygon, Arbitrum, Optimism, and all major blockchains.'
    },
    {
      icon: FaShieldAlt,
      title: 'Advanced Risk Analysis',
      description: 'Multi-dimensional risk assessment with personalized recommendations for portfolio optimization.'
    },
    {
      icon: FaBolt,
      title: 'Real-Time Insights',
      description: 'Lightning-fast blockchain data processing with instant notifications on portfolio changes.'
    },
    {
      icon: FaEye,
      title: 'Portfolio Intelligence',
      description: 'Understand investment behavior and optimize strategy with AI-generated predictive analytics.'
    }
  ];

  return (
    <section 
      ref={containerRef}
      className="relative py-16 sm:py-32 lg:py-40 overflow-hidden" 
      style={{ backgroundColor: theme.background }}
    >
      {/* Premium Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/10 via-transparent to-transparent" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,140,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,140,0,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
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
            <HiSparkles className="text-lg" style={{ color: theme.primary }} />
            <span className="text-sm font-medium" style={{ color: theme.primary }}>
              About Alfredo
            </span>
          </motion.div>

          <h2 className="text-2xl heading md:text-6xl lg:text-5xl text-white mb-6 leading-tight">
            Intelligence Meets
            <br />
            <span 
              className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent"
            >
              Simplicity
            </span>
          </h2>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Side - Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Floating Card Effect */}
            <motion.div
              style={{ y: imageY, rotate: imageRotate }}
              className="relative"
            >
              {/* Main Visual Container */}
              <div className="relative rounded-3xl overflow-hidden border-2 backdrop-blur-xl"
                style={{ 
                  backgroundColor: `${theme.cardBg}80`,
                  borderColor: theme.border,
                  boxShadow: `0 30px 100px ${theme.primary}30`
                }}
              >
                {/* Glow Effect */}
                <div 
                  className="absolute inset-0 opacity-50"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${theme.primary}20, transparent 70%)`
                  }}
                />

                {/* Content */}
                <div className="relative p-8 sm:p-12">
                  {/* Dashboard Preview Mockup */}
                  <div className="relative z-10 space-y-6">
                    {/* Mock Chart */}
                    <div className="h-48 rounded-2xl border flex items-end gap-2 p-6"
                      style={{ 
                        backgroundColor: theme.background,
                        borderColor: theme.border
                      }}
                    >
                      {[60, 80, 65, 90, 75, 95, 85].map((height, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${height}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1, duration: 0.6 }}
                          className="flex-1 rounded-lg"
                          style={{
                            background: `linear-gradient(to top, ${theme.primary}, ${theme.secondary})`
                          }}
                        />
                      ))}
                    </div>

                    {/* Mock Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Portfolio Value', value: '$45.2K', color: theme.primary },
                        { label: 'Total Tokens', value: '12', color: theme.secondary }
                      ].map((stat, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                          className="p-4 rounded-xl border"
                          style={{ 
                            backgroundColor: theme.background,
                            borderColor: theme.border
                          }}
                        >
                          <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                          <p className="text-2xl font-bold" style={{ color: stat.color }}>
                            {stat.value}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1, type: "spring", stiffness: 200 }}
                className="absolute -bottom-6 -right-6 px-6 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.primary,
                  boxShadow: `0 20px 60px ${theme.primary}40`
                }}
              >
                <div className="flex items-center gap-2">
                  <FaCheckCircle style={{ color: theme.primary }} />
                  <span className="text-sm font-bold text-white">AI-Powered</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="space-y-8"
          >
            {/* Main Description */}
            <div className="space-y-6">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-base sm:text-lg text-gray-300/80 leading-relaxed"
              >
                Alfredo is an <span style={{ color: theme.primary }}>AI-powered crypto portfolio intelligence platform</span> that helps you understand your wallet behavior, analyze performance, and make smarter investment decisions.
              </motion.p>

              {/* <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-gray-400 leading-relaxed"
              >
                Built with cutting-edge machine learning algorithms, Alfredo analyzes your transactions across all major blockchain networks, providing real-time insights, risk assessments, and personalized recommendations.
              </motion.p> */}
            </div>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0}}
                  whileInView={{ opacity: 1}}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: 0.5 + index * 0.1,
                    duration: 0.6
                  }}
                  whileHover={{ x: 10 }}
                  className="flex items-start border-1 border-[#2A1E14] gap-4 p-4 rounded-xl transition-all duration-300 group"
                  style={{
                    backgroundColor: `${theme.cardBg}40`
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="flex-shrink-0 p-3 rounded-lg"
                    style={{ 
                      backgroundColor: `${theme.primary}15`
                    }}
                  >
                    <feature.icon 
                      className="text-xl" 
                      style={{ color: theme.primary }} 
                    />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-amber-400 group-hover:bg-clip-text transition-all duration-300">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
