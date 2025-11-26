'use client'
import { motion } from 'motion/react';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

const theme = {
  primary: '#FF8C00',
  secondary: '#FFB347',
  background: '#0D0A07',
  cardBg: '#1A120C'
};

export default function TaskCenterSection() {
  return (
    <section 
      className="relative py-14 sm:py-32 overflow-hidden" 
      style={{ backgroundColor: theme.background }}
    >
      {/* Premium Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/5 via-transparent to-transparent" />
        {/* Dot Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,140,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,140,0,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Content Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] overflow-hidden border relative"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: `${theme.primary}20`,
            boxShadow: `0 20px 60px rgba(0, 0, 0, 0.5)`
          }}
        >
          {/* Subtle Gradient Background */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: `radial-gradient(circle at 30% 50%, ${theme.primary}15, transparent 60%)`
            }}
          />

          <div className="relative px-8 sm:px-12 lg:px-20 py-16 sm:py-20 text-center">
            
            {/* Main Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-2xl heading md:text-6xl lg:text-5xl text-white mb-6 leading-tight"
            >
              <span className="text-white">READY TO </span>
              <span 
                className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent"
              >
                EARN REWARDS
              </span>
              <br />
              <span className="text-white">THIS MONTH?</span>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-base sm:text-lg text-gray-400 text-balance max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              Complete simple social tasks and earn real AFRD tokens instantly.
              Connect your wallet, engage with our community, and get rewarded on-chain.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {/* Primary CTA */}
              <Link href="/tasks">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: `0 20px 60px ${theme.primary}50` }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white text-base transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                    boxShadow: `0 10px 40px ${theme.primary}40`
                  }}
                >
                  START EARNING NOW
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <FaArrowRight />
                  </motion.span>
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-10 sm:text-base text-xs flex items-center justify-center gap-2 sm:gap-4 text-gray-500"
            >
              <div className="flex items-center gap-2">
                <div className="size-1 sm:size-2 rounded-full bg-green-500" />
                <span>Instant Payouts</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-gray-700" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>100% Secure</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-gray-700" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>No Minimum</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
