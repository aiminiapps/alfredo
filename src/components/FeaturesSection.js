'use client'
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { HiSparkles } from 'react-icons/hi';
import { 
  FaWallet, FaChartLine, FaBrain
} from 'react-icons/fa';

const theme = {
  primary: '#FF8C00',
  secondary: '#FFB347',
  background: '#0D0A07',
  cardBg: '#1A120C',
  border: '#2A1E14'
};

export default function FeaturesSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const features = [
    {
      icon: FaWallet,
      title: 'Universal Wallet Analysis',
      description: 'Connect any wallet address and instantly analyze your complete crypto portfolio across all networks.',
      illustration: '/illustrations/wallet.png', 
      color: '#FF8C00',
      gradient: 'from-orange-500 to-amber-600'
    },
    {
      icon: FaChartLine,
      title: 'Market Intelligence',
      description: 'Track live market trends, price movements, and portfolio performance with advanced analytics.',
      illustration: '/illustrations/chart.png',
      color: '#4CD964',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: FaBrain,
      title: 'AI Chat',
      description: 'To get personalized investment strategies powered by machine learning and predictive analytics.',
      illustration: '/illustrations/ai.png',
      color: '#5E5CE6',
      gradient: 'from-purple-500 to-indigo-600'
    }
  ];

  return (
    <section 
      id='features'
      ref={containerRef}
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
        
        {/* Section Header */}
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
            <HiSparkles className="text-lg" style={{ color: theme.primary }} />
            <span className="text-sm font-medium" style={{ color: theme.primary }}>
              Why Choose Alfredo?
            </span>
          </motion.div>

          <h2 className="text-2xl heading md:text-6xl lg:text-5xl text-white mb-6 leading-tight">
            Everything You Need for
            <br />
            <span 
              className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent"
            >
              Smart Investing
            </span>
          </h2>

          <p className="text-base sm:text-lg text-gray-400 max-w-3xl text-balance mx-auto leading-relaxed">
            Powerful tools and intelligent features designed to help you make better investment decisions.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.7, 
                delay: index * 0.2,
                ease: [0.16, 1, 0.3, 1]
              }}
              whileHover={{ y: -12, scale: 1.02 }}
              className="group relative"
            >
              {/* Glow Effect */}
              <div 
                className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700"
                style={{ 
                  background: `linear-gradient(135deg, ${feature.color}50, transparent)`
                }}
              />
              
              {/* Card */}
              <div 
                className="relative h-full rounded-3xl border overflow-hidden transition-all duration-500"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border
                }}
              >
                {/* Gradient Background Overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color}, transparent)`
                  }}
                />

                {/* Content */}
                <div className="relative p-4">
                  {/* Illustration/Image Area */}
                  <div className="relative h-48 rounded-2xl border overflow-hidden mb-6"
                    style={{
                      backgroundColor: `${theme.background}80`,
                      borderColor: `${feature.color}30`
                    }}
                  >
                    {/* Gradient Background */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${feature.color}20, transparent 70%)`
                      }}
                    />
                    {/* image here */}
                    <img src={feature.illustration} alt='features image'/>
                  </div>
                  <h3 className="text-xl font-semibold heading text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-amber-400 group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed mb-2">
                    {feature.description}
                  </p>

                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 sm:flex items-center justify-center hidden text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-sm">Secure & Encrypted</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-600" />
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-sm">Lightning Fast</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-600" />
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-sm">Always Improving</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
 