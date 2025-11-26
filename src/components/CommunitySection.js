'use client'
import { motion } from 'motion/react';
import { useRef } from 'react';
import { FaUsers, FaVoteYea } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { BiCodeAlt } from 'react-icons/bi';
import { RiTwitterXLine } from "react-icons/ri";
import { LiaTelegram } from "react-icons/lia";

const theme = {
  primary: '#FF8C00',
  secondary: '#FFB347',
  background: '#0D0A07',
  cardBg: '#1A120C',
  border: '#2A1E14'
};

export default function CommunitySection() {
  const containerRef = useRef(null);

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

      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        
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
            <FaUsers className="text-lg" style={{ color: theme.primary }} />
            <span className="text-sm font-medium" style={{ color: theme.primary }}>
              COMMUNITY GOVERNANCE
            </span>
          </motion.div>

          <h2 className="text-2xl heading md:text-6xl lg:text-5xl text-white mb-6 leading-tight">
            <span className="text-white">Driven by Data.</span>
            <br />
            <span 
              className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent"
            >
              Governed by You.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-balance text-gray-400 max-w-3xl mx-auto leading-relaxed">
            AFRD holders are not just users they're decision-makers. Through Alfredo DAO, the community shapes product upgrades, AI model improvements, and partnership directions.
          </p>
        </motion.div>

        {/* CTA Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div 
            className="rounded-3xl border p-8 sm:p-12 backdrop-blur-xl"
            style={{
              backgroundColor: `${theme.cardBg}80`,
              borderColor: `${theme.primary}20`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              {/* Telegram */}
              <motion.a
                href="https://t.me/AI_UR_Alfredo"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, boxShadow: `0 20px 60px ${theme.primary}50` }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 w-full sm:w-auto justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  boxShadow: `0 10px 40px ${theme.primary}40`
                }}
              >
                <LiaTelegram className="text-xl" />
                Join Telegram Community
              </motion.a>

              {/* Twitter */}
              <motion.a
                href="https://x.com/AI_UR_Alfredo"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: `${theme.cardBg}`,
                  borderColor: theme.primary
                }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-white border transition-all duration-300 w-full sm:w-auto justify-center"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: `${theme.primary}40`
                }}
              >
                <RiTwitterXLine className="text-xl" />
                Follow on X (Twitter)
              </motion.a>
            </div>

            {/* DAO Coming Soon Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex justify-center"
            >
              <div 
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full border"
                style={{
                  backgroundColor: `${theme.primary}10`,
                  borderColor: `${theme.primary}30`
                }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <HiSparkles className="text-lg" style={{ color: theme.primary }} />
                </motion.div>
                <span className="text-sm font-bold text-white">
                  DAO Coming Soon
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Bar - now hidden */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 hidden grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {[
            { label: 'Community Members', value: '10K+', icon: FaUsers },
            { label: 'Governance Votes', value: 'Coming Soon', icon: FaVoteYea },
            { label: 'Active Proposals', value: 'Soon', icon: BiCodeAlt }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="text-center p-6 rounded-2xl border backdrop-blur-sm"
              style={{
                backgroundColor: `${theme.cardBg}60`,
                borderColor: theme.border
              }}
            >
              <div className="inline-flex p-3 rounded-xl mb-3"
                style={{ backgroundColor: `${theme.primary}15` }}
              >
                <stat.icon 
                  className="text-2xl" 
                  style={{ color: theme.primary }} 
                />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
