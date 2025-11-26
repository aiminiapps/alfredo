'use client'
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { FaCircle } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const theme = {
  primary: '#FF8C00',
  secondary: '#FFB347',
  background: '#0D0A07',
  cardBg: '#1A120C',
  border: '#2A1E14'
};

export default function RoadmapSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const phases = [
    {
      phase: 'Phase 1',
      timeframe: 'Q1–Q2 2025',
      milestones: [
        { title: 'AI Prototype', description: 'Core AI engine development' },
        { title: 'Smart Contract Deploy', description: 'Launch on BSC' },
        { title: 'Private Beta', description: 'Limited user testing' }
      ]
    },
    {
      phase: 'Phase 2',
      timeframe: 'Q3–Q4 2025',
      milestones: [
        { title: 'Public Beta', description: 'Open access to all users' },
        { title: 'AFRD IDO', description: 'Token launch event' },
        { title: 'Exchange Listings', description: 'DEX and CEX integration' },
        { title: 'Governance Beta', description: 'DAO voting system' }
      ]
    },
    {
      phase: 'Phase 3',
      timeframe: 'Q1–Q2 2026',
      milestones: [
        { title: 'AI v2.0', description: 'Enhanced prediction models' },
        { title: 'Staking Launch', description: 'Earn rewards with AFRD' },
        { title: 'Mobile App', description: 'iOS and Android release' },
        { title: 'API Integration', description: 'Developer tools' }
      ]
    },
    {
      phase: 'Phase 4',
      timeframe: 'Q3–Q4 2026',
      milestones: [
        { title: 'DAO Launch', description: 'Full decentralized governance' },
        { title: 'AI Chat Advisor', description: 'Real-time portfolio assistance' },
        { title: 'Buyback System', description: 'Token value mechanism' }
      ]
    },
    {
      phase: 'Phase 5',
      timeframe: '2027+',
      milestones: [
        { title: 'Predictive AI', description: 'Advanced market predictions' },
        { title: 'Multi-Chain Analytics', description: 'Cross-chain support' },
        { title: 'Global Expansion', description: 'Worldwide partnerships' }
      ]
    }
  ];

  return (
    <section 
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
      {/* Large "100x" Background - Animated on Scroll */}
      <motion.div 
        style={{ opacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
      >
        <motion.h1 
          className="text-[15rem] sm:text-[20rem] lg:text-[30rem] xl:text-[40rem] font-black tracking-tighter select-none"
          style={{
            background: `linear-gradient(180deg, ${theme.primary}15, transparent)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            // opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.02, 0.05, 0.02]),
            // scale: useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8])
          }}
        >
          100x
        </motion.h1>
      </motion.div>

      {/* Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/10 via-transparent to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
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
              OUR JOURNEY
            </span>
          </motion.div>

          <h2 className="text-2xl heading md:text-6xl lg:text-5xl text-white mb-6 leading-tight">
            Roadmap
          </h2>

          <p className="text-base sm:text-lg text-gray-400 max-w-3xl text-balance mx-auto leading-relaxed">
            From Prototype to AI Governance Alfredo evolves with you, becoming smarter every cycle.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Center Line */}
          <div 
            className="absolute left-8 sm:left-12 md:left-1/2 top-0 bottom-0 w-px md:-ml-px"
            style={{
              background: `linear-gradient(to bottom, transparent, ${theme.primary}40, transparent)`
            }}
          />

          {/* Phase Cards */}
          <div className="space-y-16 sm:space-y-20">
            {phases.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="relative"
              >
                {/* Timeline Dot */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                  className="absolute left-6 sm:left-12 md:left-1/2 w-4 h-4 md:-ml-2 rounded-full border-4 z-10"
                  style={{
                    backgroundColor: theme.background,
                    borderColor: theme.primary,
                    boxShadow: `0 0 0 4px ${theme.primary}20`
                  }}
                />

                {/* Content Container - Alternating Layout on Desktop */}
                <div className={`md:grid md:grid-cols-2 md:gap-12 ${
                  index % 2 === 0 ? '' : 'md:grid-flow-dense'
                }`}>
                  {/* Phase Label - Left on Even, Right on Odd */}
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                    className={`mb-6 md:mb-0 md:text-${index % 2 === 0 ? 'right' : 'left'} ${
                      index % 2 === 0 ? '' : 'md:col-start-2'
                    } pl-20 sm:pl-24 md:pl-0 md:pr-${index % 2 === 0 ? '8' : '0'}`}
                  >
                    <h3 className="text-2xl heading sm:text-3xl font-bold text-white mb-2">
                      {phase.phase}
                    </h3>
                    <div 
                      className="inline-flex px-4 py-1.5 rounded-full text-sm font-bold"
                      style={{
                        backgroundColor: `${theme.primary}15`,
                        color: theme.primary
                      }}
                    >
                      {phase.timeframe}
                    </div>
                  </motion.div>

                  {/* Milestones Card - Right on Even, Left on Odd */}
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    className={`${
                      index % 2 === 0 ? '' : 'md:col-start-1 md:row-start-1'
                    } pl-20 sm:pl-24 md:pl-${index % 2 === 0 ? '8' : '0'}`}
                  >
                    <div 
                      className="rounded-2xl border p-6 sm:p-8 backdrop-blur-sm hover:scale-[1.02] transition-all duration-300"
                      style={{
                        backgroundColor: `${theme.cardBg}95`,
                        borderColor: theme.border
                      }}
                    >
                      <div className="space-y-4">
                        {phase.milestones.map((milestone, mIdx) => (
                          <motion.div
                            key={mIdx}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 + 0.6 + mIdx * 0.05 }}
                            className="flex items-start gap-3"
                          >
                            <FaCircle 
                              className="text-xs mt-1.5 flex-shrink-0" 
                              style={{ color: theme.primary }} 
                            />
                            <div>
                              <h4 className="text-white font-semibold mb-1">
                                {milestone.title}
                              </h4>
                              <p className="text-gray-400 text-sm">
                                {milestone.description}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 text-center"
        >
          <p className="text-xl sm:text-2xl font-semibold text-gray-400 italic">
            "Alfredo evolves with you becoming{' '}
            <span 
              className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent"
            >
              smarter every cycle
            </span>
            ."
          </p>
        </motion.div>
      </div>
    </section>
  );
}
