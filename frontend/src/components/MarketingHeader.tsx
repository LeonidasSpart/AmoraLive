'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Menu, X } from 'lucide-react';
import Link from 'next/link';

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-midnight-950/90 backdrop-blur-xl border-b border-midnight-800' : 'bg-midnight-950/60 backdrop-blur-xl'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amora-gradient rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Amora</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm text-midnight-300 hover:text-white transition-colors">Features</Link>
            <Link href="/#testimonials" className="text-sm text-midnight-300 hover:text-white transition-colors">Stories</Link>
            <Link href="/#premium" className="text-sm text-midnight-300 hover:text-white transition-colors">Premium</Link>
            <Link href="/auth/login" className="text-sm text-midnight-300 hover:text-white transition-colors">Sign In</Link>
            <Link href="/auth/register" className="amora-button text-sm py-2 px-5">
              Get Started
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-midnight-900 border-b border-midnight-800"
          >
            <div className="px-4 py-4 space-y-3">
              <Link href="/#features" className="block text-midnight-300 py-2">Features</Link>
              <Link href="/#testimonials" className="block text-midnight-300 py-2">Stories</Link>
              <Link href="/#premium" className="block text-midnight-300 py-2">Premium</Link>
              <Link href="/auth/login" className="block text-midnight-300 py-2">Sign In</Link>
              <Link href="/auth/register" className="block amora-button text-center py-3">Get Started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
