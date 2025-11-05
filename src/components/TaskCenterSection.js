'use client'
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { 
  FaTwitter, FaCoins, FaWallet, FaGift, FaHeart, 
  FaRetweet, FaComment, FaBolt, FaArrowRight
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import Link from 'next/link';

const theme = {
  primary: '#FF8C00',
  secondary: '#FFB347',
  background: '#0D0A07',
  cardBg: '#1A120C',
  border: '#2A1E14'
};

export default function TaskCenterSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.95, 1, 1, 0.95]);

  const tasks = [
    {
      icon: FaTwitter,
      title: 'Follow on X',
      description: 'Follow @Alfredo_AI and stay updated with latest features',
      reward: '100 AFRD',
      gradient: 'from-blue-500 to-cyan-500',
      illustration: '🐦'
    },
    {
      icon: FaHeart,
      title: 'Like Posts',
      description: 'Show love to our content and earn rewards instantly',
      reward: '50 AFRD',
      gradient: 'from-pink-500 to-rose-500',
      illustration: '❤️'
    },
    {
      icon: FaRetweet,
      title: 'Share & Retweet',
      description: 'Help us spread the word about smart crypto analytics',
      reward: '75 AFRD',
      gradient: 'from-green-500 to-emerald-500',
      illustration: '🔄'
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-orange-900/10 via-transparent to-transparent" />
        <motion.div
          style={{ opacity }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-1/4 w-[800px] h-[800px] rounded-full blur-[160px] bg-amber-500/20"
        />
        
        {/* Floating Coins Animation */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
            className="absolute opacity-10"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`
            }}
          >
            <FaCoins className="text-4xl sm:text-6xl" style={{ color: theme.primary }} />
          </motion.div>
        ))}
      </div>

      <motion.div 
        style={{ scale, opacity }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        
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
            <FaGift className="text-lg" style={{ color: theme.primary }} />
            <span className="text-sm font-medium" style={{ color: theme.primary }}>
              Earn Real AFRD Tokens
            </span>
          </motion.div>

          <h2 className="heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Complete Simple Tasks.
            <br />
            <span 
              className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent"
            >
              Get Instant Rewards.
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Connect your MetaMask wallet, complete social tasks, and receive AFRD tokens directly to your wallet—instantly and securely.
          </p>
        </motion.div>

        {/* Task Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {tasks.map((task, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.7, 
                delay: index * 0.15,
                ease: [0.16, 1, 0.3, 1]
              }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              {/* Card Glow */}
              <div 
                className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.primary}40, transparent)`
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
                {/* Illustration */}
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    delay: index * 0.3
                  }}
                  className="text-6xl mb-6 text-center"
                >
                  {task.illustration}
                </motion.div>

                {/* Icon Badge */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex p-4 rounded-xl"
                    style={{ 
                      backgroundColor: `${theme.primary}15`,
                      boxShadow: `0 0 30px ${theme.primary}20`
                    }}
                  >
                    <task.icon 
                      className="text-3xl" 
                      style={{ color: theme.primary }} 
                    />
                  </motion.div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-3 text-center">
                  {task.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed text-sm text-center mb-6">
                  {task.description}
                </p>

                {/* Reward Badge */}
                <div className="flex justify-center">
                  <div 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
                    style={{
                      backgroundColor: `${theme.primary}10`,
                      borderColor: `${theme.primary}30`
                    }}
                  >
                    <FaCoins className="text-lg" style={{ color: theme.primary }} />
                    <span className="font-bold text-white">{task.reward}</span>
                  </div>
                </div>

                {/* Hover Indicator */}
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.5, duration: 0.6 }}
                  className="h-1 rounded-full mt-6"
                  style={{ 
                    background: `linear-gradient(90deg, ${theme.primary}, transparent)`
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Benefits Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative p-6 sm:p-8 rounded-3xl border overflow-hidden mb-12"
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

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: FaBolt, label: 'Instant Transfer', desc: 'Tokens sent to wallet immediately' },
              { icon: FaWallet, label: 'MetaMask Ready', desc: 'Works with any Web3 wallet' },
              { icon: HiSparkles, label: 'Real Tokens', desc: 'AFRD on Binance Smart Chain' }
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex p-4 rounded-2xl mb-4 transition-all duration-300 hover:scale-110"
                  style={{ backgroundColor: `${theme.primary}15` }}
                >
                  <benefit.icon 
                    className="text-3xl transition-all duration-300 hover:rotate-12" 
                    style={{ color: theme.primary }} 
                  />
                </div>
                <p className="text-lg font-bold text-white mb-1">
                  {benefit.label}
                </p>
                <p className="text-sm text-gray-500">
                  {benefit.desc}
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
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-center"
        >
          <Link href="/tasks">
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                boxShadow: `0 25px 80px ${theme.primary}60` 
              }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center gap-4 px-10 sm:px-12 py-5 sm:py-6 rounded-2xl font-bold text-white text-lg sm:text-xl shadow-2xl transition-all duration-300 relative overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                boxShadow: `0 15px 60px ${theme.primary}40`
              }}
            >
              {/* Shimmer Effect */}
              <motion.div
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
              
              <FaWallet className="text-2xl relative z-10" />
              <span className="relative z-10">Connect Wallet & Start Earning</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="relative z-10"
              >
                <FaArrowRight className="text-xl" />
              </motion.div>
            </motion.button>
          </Link>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9 }}
            className="mt-6 text-sm text-gray-500"
          >
            No minimum required • Instant withdrawals • 100% secure
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  );
}
