// components/Navbar.jsx - Premium Floating Navbar
'use client'
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaTelegram, FaTwitter, FaCoins } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const theme = {
  primary: '#FF8C00',
  secondary: '#FFB347',
  background: '#0D0A07',
  cardBg: '#1A120C',
  border: '#2A1E14'
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  const navOpacity = useTransform(scrollY, [0, 100], [0.95, 1]);
  const navBlur = useTransform(scrollY, [0, 100], [10, 20]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Spacer to prevent content jump */}
      <div className="h-20" />

      {/* Floating Navbar */}
      <motion.nav
        style={{ 
          opacity: navOpacity,
        }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl"
      >
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`relative rounded-2xl border transition-all duration-500 ${
            isScrolled ? 'shadow-2xl' : 'shadow-xl'
          }`}
          style={{
            backgroundColor: `${theme.cardBg}${isScrolled ? 'F5' : 'E8'}`,
            borderColor: `${theme.border}`,
            backdropFilter: `blur(${isScrolled ? '20px' : '15px'})`
          }}
        >
          {/* Glow Effect */}
          <div 
            className="absolute -inset-[1px] rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, ${theme.primary}20, transparent, ${theme.primary}20)`,
              filter: 'blur(8px)'
            }}
          />

          {/* Content */}
          <div className="relative px-6 py-4">
            <div className="flex items-center justify-between gap-8">
              
              {/* Logo - Left Side */}
              <Link href="/" className="flex items-center gap-3 group">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="relative p-2 rounded-xl"
                  style={{ backgroundColor: `${theme.primary}15` }}
                >
                  {/* Sparkle Effect */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-xl"
                    style={{ 
                      backgroundColor: theme.primary,
                      filter: 'blur(8px)',
                      opacity: 0.3
                    }}
                  />
                  <HiSparkles className="text-xl relative z-10" style={{ color: theme.primary }} />
                </motion.div>
                
                <span className="heading text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-amber-400 group-hover:bg-clip-text transition-all duration-300 hidden sm:inline">
                  Alfredo
                </span>
              </Link>

              {/* Right Side - Social Links & CTA */}
              <div className="flex items-center gap-3">
                
                {/* Social Icons */}
                <div className="hidden md:flex items-center gap-2">
                  {/* Telegram */}
                  <motion.a
                    href="https://t.me/alfredo_community"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-xl border transition-all duration-300 group"
                    style={{
                      backgroundColor: `${theme.cardBg}80`,
                      borderColor: theme.border
                    }}
                  >
                    <FaTelegram 
                      className="text-lg transition-colors duration-300 group-hover:text-[#0088cc]" 
                      style={{ color: '#6B7280' }}
                    />
                  </motion.a>

                  {/* Twitter/X */}
                  <motion.a
                    href="https://twitter.com/Alfredo_AI"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-xl border transition-all duration-300 group"
                    style={{
                      backgroundColor: `${theme.cardBg}80`,
                      borderColor: theme.border
                    }}
                  >
                    <FaTwitter 
                      className="text-lg transition-colors duration-300 group-hover:text-[#1DA1F2]" 
                      style={{ color: '#6B7280' }}
                    />
                  </motion.a>
                </div>

                {/* Divider */}
                <div 
                  className="hidden md:block w-px h-8"
                  style={{ backgroundColor: theme.border }}
                />

                {/* Earn AFRD Button */}
                <Link href="/tasks">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: `0 10px 40px ${theme.primary}50` }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative px-6 py-3 rounded-xl font-bold text-white text-sm overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                      boxShadow: `0 4px 20px ${theme.primary}40`
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
                        repeatDelay: 1,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                    
                    {/* Content */}
                    <span className="relative z-10 flex items-center gap-2">
                      <FaCoins className="text-base" />
                      <span className="hidden sm:inline">Earn AFRD</span>
                      <span className="sm:hidden">Earn</span>
                    </span>

                    {/* Glow on Hover */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle at center, ${theme.primary}40, transparent 70%)`
                      }}
                    />
                  </motion.button>
                </Link>

                {/* Mobile Menu Button (Optional) */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="md:hidden p-3 rounded-xl border"
                  style={{
                    backgroundColor: `${theme.cardBg}80`,
                    borderColor: theme.border
                  }}
                >
                  <div className="space-y-1.5">
                    <motion.div 
                      className="w-5 h-0.5 rounded-full"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <motion.div 
                      className="w-5 h-0.5 rounded-full"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <motion.div 
                      className="w-3 h-0.5 rounded-full"
                      style={{ backgroundColor: theme.primary }}
                    />
                  </div>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Bottom Glow Line */}
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scaleX: [0.8, 1, 0.8]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)`
            }}
          />
        </motion.div>

        {/* Floating Particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{ 
              backgroundColor: theme.primary,
              left: `${30 + i * 20}%`,
              top: '50%'
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.nav>
    </>
  );
}
