'use client'
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { FaExternalLinkAlt, FaEnvelope, FaFileAlt } from 'react-icons/fa';
import { RiTwitterXLine } from "react-icons/ri";
import { LiaTelegram } from "react-icons/lia";

const theme = {
  primary: '#FF8C00',
  secondary: '#FFB347',
  background: '#0D0A07',
  cardBg: '#1A120C',
  border: '#2A1E14'
};

export default function Footer() {
  const footerLinks = {
    product: [
      { label: 'Portfolio Analysis', href: '/' },
      { label: 'Task Center', href: '/tasks' }
    ],
    resources: [
      { label: 'Whitepaper', href: 'https://alfredoai.gitbook.io/alfredoai-docs/', icon: FaFileAlt },
      { label: 'BSC Scan', href: 'https://bscscan.com/token/0x5defe90ace2cc2eb1a3a356dfdc56589bdb7ebcc', icon: FaExternalLinkAlt }

    ],
    community: [
      { label: 'X', href: 'https://x.com/AI_UR_Alfredo', icon: RiTwitterXLine },
      { label: 'Telegram', href: 'https://t.me/AI_UR_Alfredo', icon: LiaTelegram }
    ]
  };

  return (
    <footer 
      className="relative overflow-hidden border-t"
      style={{ 
        backgroundColor: theme.background,
        borderColor: theme.border
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Footer Content */}
        <div className="py-16 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
            
            {/* Brand Column */}
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {/* Logo */}
                <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
                  <Image src="/logo.png" alt='logo' width={200} height={100}/>
                </Link>

                {/* Description */}
                <p className="text-gray-400 mb-2 leading-relaxed">
                  AI-powered crypto portfolio intelligence.
                </p>

                {/* Email */}
                <a 
                  href="mailto:official@alfredo.world"
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 group"
                >
                  <FaEnvelope className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm">official@alfredo.world</span>
                </a>
              </motion.div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
              
              {/* Product */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h3 className="text-white font-bold mb-4">Product</h3>
                <ul className="space-y-3">
                  {footerLinks.product.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors duration-300 text-sm inline-flex items-center gap-2 group"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Resources */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-white font-bold mb-4">Resources</h3>
                <ul className="space-y-3">
                  {footerLinks.resources.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.href}
                        target={link.icon === FaExternalLinkAlt ? "_blank" : undefined}
                        rel={link.icon === FaExternalLinkAlt ? "noopener noreferrer" : undefined}
                        className="text-gray-400 hover:text-white transition-colors duration-300 text-sm inline-flex items-center gap-2 group"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                          {link.label}
                        </span>
                        {link.icon && <link.icon className="text-xs opacity-50" />}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Community */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="text-white font-bold mb-4">Community</h3>
                <ul className="space-y-3">
                  {footerLinks.community.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors duration-300 text-sm inline-flex items-center gap-2 group"
                      >
                        <link.icon />
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                          {link.label}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t py-8"
          style={{ borderColor: theme.border }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Copyright */}
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Alfredo. All rights reserved.
            </p>
            {/* Built with love */}
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>Built with</span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-red-500"
              >
                ❤️
              </motion.span>
              <span>by Alfredo Team</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
