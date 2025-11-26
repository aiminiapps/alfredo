'use client'
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { HiSparkles } from 'react-icons/hi';
import { FaBrain } from 'react-icons/fa';

const theme = {
  primary: '#FF8C00',
  secondary: '#FFB347',
  background: '#0D0A07',
  cardBg: '#1A120C',
  border: '#2A1E14'
};

export default function DashboardShowcase() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.95, 1, 1, 0.95]);

  return (
    <section 
      ref={containerRef}
      className="relative py-16 sm:py-32 lg:py-40 overflow-hidden" 
      style={{ backgroundColor: theme.background }}
    >
      {/* Premium Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/10 via-transparent to-transparent" />
        {/* <motion.div
          style={{ opacity }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.03, 0.08, 0.03]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[180px] bg-gradient-to-r from-orange-500 to-amber-500"
        /> */}
        
        {/* Animated Dots Pattern */}
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
            <FaBrain className="text-lg" style={{ color: theme.primary }} />
            <span className="text-sm font-medium" style={{ color: theme.primary }}>
              Powerful Analytics Dashboard
            </span>
          </motion.div>

          <h2 className="text-2xl heading md:text-6xl lg:text-5xl text-white mb-6 leading-tight">
            Experience Portfolio Intelligence
            <br />
            <span 
              className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent"
            >
              In Real-Time
            </span>
          </h2>

          <p className="text-base sm:text-lg text-gray-400 max-w-3xl text-balance mx-auto leading-relaxed">
            Comprehensive analytics, AI-powered insights, and beautiful visualizations all in one powerful interface designed for serious crypto investors.
          </p>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          style={{ y: imageY, scale, opacity }}
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="relative"
        >
          {/* Glow Container */}
          <div className="absolute -inset-4 rounded-3xl opacity-50 blur-3xl"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${theme.primary}40, transparent 70%)`
            }}
          />

          {/* Main Dashboard Image Container */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 backdrop-blur-xl shadow-2xl"
            style={{ 
              backgroundColor: `${theme.cardBg}95`,
              borderColor: theme.border,
              boxShadow: `0 40px 120px ${theme.primary}20`
            }}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b"
              style={{ 
                backgroundColor: `${theme.background}80`,
                borderColor: theme.border
              }}
            >
              <div className="flex items-center gap-2">
                <div className="flex gap-2">
                  {['#FF5F57', '#FFBD2E', '#28CA42'].map((color, i) => (
                    <div 
                      key={i}
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400 ml-4 hidden sm:inline">
                  Alfredo AI Dashboard
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg text-xs font-medium border hidden sm:flex items-center gap-2"
                  style={{ 
                    backgroundColor: `${theme.primary}10`,
                    borderColor: `${theme.primary}30`,
                    color: theme.primary
                  }}
                >
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.primary }} />
                  Live
                </div>
              </div>
            </div>

            {/* Dashboard Content - This would be your actual dashboard screenshot */}
            <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
              {/* You can replace this with an actual dashboard screenshot */}
              {/* For now, creating a mockup */}
              
              {/* Background Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,140,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,140,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
              
              {/* Mock Dashboard Elements */}
              <div className="absolute inset-0 p-4 sm:p-8 flex flex-col gap-4">
                
                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-2 sm:gap-4">
                  {[
                    { label: 'Portfolio Value', value: '$45.2K', change: '+12.5%' },
                    { label: 'Total Tokens', value: '12', change: '+2' },
                    { label: '24h Change', value: '+$3.2K', change: '+7.8%' },
                    { label: 'Risk Score', value: '75', change: 'Medium' }
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="p-3 sm:p-4 rounded-xl border backdrop-blur-sm"
                      style={{ 
                        backgroundColor: `${theme.cardBg}80`,
                        borderColor: theme.border
                      }}
                    >
                      <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-lg sm:text-2xl font-bold text-white mb-1">{stat.value}</p>
                      <p className="text-xs font-semibold" style={{ color: theme.primary }}>
                        {stat.change}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Chart Area */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                  className="flex-1 rounded-xl border backdrop-blur-sm overflow-hidden"
                  style={{ 
                    backgroundColor: `${theme.cardBg}60`,
                    borderColor: theme.border
                  }}
                >
                  {/* Mock Chart */}
                  <div className="h-full flex items-end gap-1 p-4 sm:p-6">
                    {Array.from({ length: 30 }).map((_, i) => {
                      const height = Math.random() * 100;
                      return (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${height}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.9 + i * 0.02 }}
                          className="flex-1 rounded-t-sm min-w-[2px]"
                          style={{
                            background: `linear-gradient(to top, ${theme.primary}, ${theme.secondary})`,
                            opacity: 0.8
                          }}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Floating AI Badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2, type: "spring" }}
                className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 px-4 py-2 rounded-xl border backdrop-blur-xl shadow-2xl"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.primary,
                  boxShadow: `0 20px 60px ${theme.primary}40`
                }}
              >
                <div className="flex items-center gap-2">
                  <HiSparkles className="text-lg" style={{ color: theme.primary }} />
                  <span className="text-xs sm:text-sm font-bold text-white">AI Analysis Active</span>
                </div>
              </motion.div>
            </div>

            {/* Bottom Gradient Overlay */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
              style={{
                background: `linear-gradient(to top, ${theme.cardBg}, transparent)`
              }}
            />
          </div>

          {/* Feature Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.3 }}
            className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-8 sm:mt-12"
          >
            {[
              { text: 'Real-Time Analytics' },
              { text: 'AI-Powered Insights' },
              { text: 'Lightning Fast' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl border backdrop-blur-sm"
                style={{
                  backgroundColor: `${theme.cardBg}80`,
                  borderColor: theme.border
                }}
              >
                <span className="text-xs sm:text-sm font-medium text-white">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
