// components/RoadmapSection.jsx - Premium Roadmap Component
'use client'
import { motion } from 'framer-motion';
import { FaCheckCircle, FaCircle, FaClock } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const theme = {
  primary: '#FF8C00',
  secondary: '#FFB347',
  background: '#0D0A07',
  cardBg: '#1A120C',
  border: '#2A1E14'
};

export default function RoadmapSection() {
  const phases = [
    {
      phase: 'Phase 1',
      timeframe: 'Q1–Q2 2025',
      status: 'completed',
      milestones: [
        'AI prototype',
        'Smart contract deploy',
        'Private beta'
      ]
    },
    {
      phase: 'Phase 2',
      timeframe: 'Q3–Q4 2025',
      status: 'in-progress',
      milestones: [
        'Public beta',
        'AFRD IDO',
        'Listings',
        'Governance beta'
      ]
    },
    {
      phase: 'Phase 3',
      timeframe: 'Q1–Q2 2026',
      status: 'upcoming',
      milestones: [
        'AI v2.0',
        'Staking',
        'Mobile app',
        'API integration'
      ]
    },
    {
      phase: 'Phase 4',
      timeframe: 'Q3–Q4 2026',
      status: 'upcoming',
      milestones: [
        'DAO launch',
        'AI chat advisor',
        'Buyback system'
      ]
    },
    {
      phase: 'Phase 5',
      timeframe: '2027+',
      status: 'future',
      milestones: [
        'Predictive AI',
        'Multi-chain analytics',
        'Global expansion'
      ]
    }
  ];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return FaCheckCircle;
      case 'in-progress': return FaClock;
      default: return FaCircle;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#4CD964';
      case 'in-progress': return '#FF8C00';
      default: return '#666';
    }
  };

  return (
    <section 
      className="relative py-24 sm:py-32 lg:py-40 overflow-hidden" 
      style={{ backgroundColor: theme.background }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/10 via-transparent to-transparent" />
        
        {/* Large "100x" Background Text */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
          <h1 className="text-[20rem] sm:text-[30rem] lg:text-[40rem] font-black tracking-tighter">
            100x
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
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
              OUR JOURNEY
            </span>
          </motion.div>

          <h2 className="heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Roadmap
          </h2>

          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
            From Prototype to AI Governance — Alfredo evolves with you, becoming smarter every cycle.
          </p>
        </motion.div>

        {/* Timeline - Vertical on Mobile, Horizontal Scroll on Desktop */}
        <div className="relative">
          {/* Desktop: Horizontal Scroll */}
          <div className="hidden lg:block overflow-x-auto pb-8 scrollbar-hide">
            <div className="flex gap-8 min-w-max px-4">
              {phases.map((phase, index) => {
                const StatusIcon = getStatusIcon(phase.status);
                const statusColor = getStatusColor(phase.status);
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className="relative group"
                    style={{ minWidth: '320px', maxWidth: '320px' }}
                  >
                    {/* Connecting Line */}
                    {index < phases.length - 1 && (
                      <div 
                        className="absolute top-12 left-full w-8 h-0.5 bg-gradient-to-r from-gray-700 to-transparent"
                      />
                    )}

                    {/* Phase Card */}
                    <div 
                      className="rounded-2xl border p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: `${theme.cardBg}95`,
                        borderColor: phase.status === 'in-progress' ? theme.primary : theme.border
                      }}
                    >
                      {/* Phase Number & Status */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-white">
                          {phase.phase}
                        </h3>
                        <StatusIcon 
                          className="text-2xl" 
                          style={{ color: statusColor }} 
                        />
                      </div>

                      {/* Timeframe */}
                      <div 
                        className="inline-flex px-3 py-1 rounded-full text-sm font-semibold mb-6"
                        style={{
                          backgroundColor: `${statusColor}15`,
                          color: statusColor
                        }}
                      >
                        {phase.timeframe}
                      </div>

                      {/* Milestones */}
                      <div className="space-y-3">
                        {phase.milestones.map((milestone, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 + idx * 0.05 }}
                            className="flex items-start gap-3"
                          >
                            <div 
                              className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                              style={{ backgroundColor: statusColor }}
                            />
                            <p className="text-gray-400 text-sm leading-relaxed">
                              {milestone}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Mobile: Vertical Stack */}
          <div className="lg:hidden space-y-8">
            {phases.map((phase, index) => {
              const StatusIcon = getStatusIcon(phase.status);
              const statusColor = getStatusColor(phase.status);
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="relative"
                >
                  {/* Connecting Line */}
                  {index < phases.length - 1 && (
                    <div 
                      className="absolute left-8 top-20 w-0.5 h-16 bg-gradient-to-b from-gray-700 to-transparent"
                    />
                  )}

                  {/* Phase Card */}
                  <div 
                    className="rounded-2xl border p-6 backdrop-blur-sm"
                    style={{
                      backgroundColor: `${theme.cardBg}95`,
                      borderColor: phase.status === 'in-progress' ? theme.primary : theme.border
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div 
                        className="p-3 rounded-xl flex-shrink-0"
                        style={{ backgroundColor: `${statusColor}15` }}
                      >
                        <StatusIcon 
                          className="text-2xl" 
                          style={{ color: statusColor }} 
                        />
                      </div>

                      <div className="flex-1">
                        {/* Phase & Timeframe */}
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {phase.phase}
                        </h3>
                        <div 
                          className="inline-flex px-3 py-1 rounded-full text-sm font-semibold mb-4"
                          style={{
                            backgroundColor: `${statusColor}15`,
                            color: statusColor
                          }}
                        >
                          {phase.timeframe}
                        </div>

                        {/* Milestones */}
                        <div className="space-y-2 mt-4">
                          {phase.milestones.map((milestone, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <div 
                                className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                                style={{ backgroundColor: statusColor }}
                              />
                              <p className="text-gray-400 text-sm">
                                {milestone}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
