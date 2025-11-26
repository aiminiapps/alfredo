'use client'
import { motion, useScroll, useTransform } from 'motion/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RiTwitterXLine } from "react-icons/ri";
import { LiaTelegram } from "react-icons/lia";

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
  
  const navY = useTransform(scrollY, [0, 100], [0, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Solutions', href: '#features' },
    { label: 'Tokenomics', href: '#tokenomics' }
  ];

  return (
    <motion.nav
      style={{ y: navY }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto"
      >
        {/* Liquid Glass Container */}
        <div 
          className={`relative rounded-2xl transition-all duration-500 ${
            isScrolled ? 'shadow-2xl' : 'shadow-xl'
          }`}
          style={{
            background: `linear-gradient(135deg, 
              rgba(26, 18, 12, 0.7) 0%, 
              rgba(26, 18, 12, 0.5) 50%, 
              rgba(26, 18, 12, 0.7) 100%)`,
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: `1px solid rgba(255, 140, 0, 0.1)`,
            boxShadow: `
              0 8px 32px 0 rgba(0, 0, 0, 0.37),
              inset 0 1px 0 0 rgba(255, 140, 0, 0.1),
              inset 0 -1px 0 0 rgba(0, 0, 0, 0.2)
            `
          }}
        >
          {/* Animated Gradient Border */}
          <motion.div
            animate={{
              background: [
                `linear-gradient(90deg, transparent, ${theme.primary}30, transparent)`,
                `linear-gradient(90deg, transparent, ${theme.secondary}30, transparent)`,
                `linear-gradient(90deg, transparent, ${theme.primary}30, transparent)`
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-2xl opacity-50 pointer-events-none"
            style={{ filter: 'blur(8px)' }}
          />

          {/* Content */}
          <div className="relative px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              
              {/* Logo - Left */}
              <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
                <Image src='/logo.png' alt='logo' width={150} height={75}/>
              </Link>

              {/* Center Navigation Links - Hidden on Mobile */}
              <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
                {navLinks.map((link, index) => (
                  <Link key={index} href={link.href}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-lg font-medium text-base transition-all duration-300 text-gray-300`}
                    >
                      {link.label}
                    </motion.div>
                  </Link>
                ))}
              </div>

              {/* Right Side - Social & CTA */}
              <div className="flex items-center gap-2 flex-shrink-0">
                
                {/* Social Icons - Hidden on Small Screens */}
                <div className="hidden md:flex items-center gap-2">
                  {/* Telegram */}
                  <motion.a
                    href="https://t.me/AI_UR_Alfredo"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-lg transition-all duration-300 group"
                    style={{
                      background: `linear-gradient(135deg, rgba(255, 255, 255, 0.05), transparent)`,
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <LiaTelegram 
                      className="text-lg transition-colors duration-300 group-hover:text-[#0088cc]" 
                      style={{ color: '#9CA3AF' }}
                    />
                  </motion.a>

                  {/* Twitter/X */}
                  <motion.a
                    href="https://x.com/AI_UR_Alfredo"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-lg transition-all duration-300 group"
                    style={{
                      background: `linear-gradient(135deg, rgba(255, 255, 255, 0.05), transparent)`,
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <RiTwitterXLine 
                      className="text-lg transition-colors duration-300 group-hover:text-[#1DA1F2]" 
                      style={{ color: '#9CA3AF' }}
                    />
                  </motion.a>
                </div>

                {/* Earn AFRD Button */}
                <Link href="/tasks">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative cursor-pointer px-5 py-2.5 rounded-lg font-semibold text-sm text-black overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                      boxShadow: `0 4px 20px ${theme.primary}40`
                    }}
                  >
                    {/* Shimmer Effect */}
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                      <span className="inline">Earn AFRD</span>
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Shine Line */}
          <motion.div
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scaleX: [0.7, 1, 0.7]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${theme.primary}60, transparent)`
            }}
          />

          {/* Liquid Glass Reflection */}
          <div 
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: `linear-gradient(135deg, 
                rgba(255, 255, 255, 0.1) 0%, 
                transparent 50%, 
                rgba(255, 255, 255, 0.05) 100%)`,
              mixBlendMode: 'overlay'
            }}
          />
        </div>
      </motion.div>
    </motion.nav>
  );
}
