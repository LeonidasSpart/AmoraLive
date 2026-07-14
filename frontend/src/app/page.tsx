'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Shield, MessageCircle, Star, ChevronRight, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Matching',
      description: 'Our advanced algorithm analyzes personality, interests, and lifestyle compatibility to find your perfect match.',
    },
    {
      icon: Shield,
      title: 'Verified Profiles',
      description: 'Every profile is verified through photo, identity, and background checks for your safety.',
    },
    {
      icon: MessageCircle,
      title: 'Real-Time Chat',
      description: 'Connect instantly with voice messages, photos, and smart conversation starters.',
    },
    {
      icon: Star,
      title: 'Premium Experience',
      description: 'Enjoy an ad-free, luxury dating experience with exclusive features and priority support.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah & Michael',
      text: 'We matched on Amora and knew instantly. The compatibility score was 94%! We're getting married next spring.',
      location: 'New York, NY',
    },
    {
      name: 'James & Emily',
      text: 'The AI matching is incredible. Amora understood what I was looking for better than I did. Best decision ever.',
      location: 'London, UK',
    },
    {
      name: 'David & Anna',
      text: 'After years on other apps, Amora was a breath of fresh air. Quality over quantity, every single time.',
      location: 'Sydney, Australia',
    },
  ];

  return (
    <div className="min-h-screen bg-midnight-950 text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-midnight-950/90 backdrop-blur-xl border-b border-midnight-800' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amora-gradient rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Amora</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-midnight-300 hover:text-white transition-colors">Features</Link>
              <Link href="#testimonials" className="text-sm text-midnight-300 hover:text-white transition-colors">Stories</Link>
              <Link href="#premium" className="text-sm text-midnight-300 hover:text-white transition-colors">Premium</Link>
              <Link href="/auth/login" className="text-sm text-midnight-300 hover:text-white transition-colors">Sign In</Link>
              <Link href="/auth/register" className="amora-button text-sm py-2 px-5">
                Get Started
              </Link>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
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
                <Link href="#features" className="block text-midnight-300 py-2">Features</Link>
                <Link href="#testimonials" className="block text-midnight-300 py-2">Stories</Link>
                <Link href="#premium" className="block text-midnight-300 py-2">Premium</Link>
                <Link href="/auth/login" className="block text-midnight-300 py-2">Sign In</Link>
                <Link href="/auth/register" className="block amora-button text-center py-3">Get Started</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amora-900/20 via-midnight-950 to-midnight-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amora-500/10 via-transparent to-transparent" />

        {/* Floating hearts animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ y: '100vh', x: `${10 + i * 15}%`, opacity: 0 }}
              animate={{
                y: '-20vh',
                opacity: [0, 0.3, 0.3, 0],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                delay: i * 1.5,
                ease: 'linear',
              }}
            >
              <Heart className="w-6 h-6 text-amora-500/20 fill-amora-500/20" />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-amora-500/10 border border-amora-500/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-amora-400" />
              <span className="text-sm text-amora-300">AI-Powered Dating Reimagined</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Find Your{' '}
              <span className="bg-clip-text text-transparent bg-amora-gradient">
                Perfect Match
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-midnight-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Amora uses advanced AI to understand who you truly are and connect you with people who complement your soul. No more endless swiping — just meaningful connections.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register" className="amora-button text-lg px-8 py-4 w-full sm:w-auto">
                Start Your Journey
                <ChevronRight className="inline-block w-5 h-5 ml-2" />
              </Link>
              <Link href="#features" className="amora-button-outline text-lg px-8 py-4 w-full sm:w-auto">
                Learn More
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-midnight-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span>2.5M+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span>500K+ Matches Made</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span>4.9★ Rating</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose <span className="gradient-text">Amora</span>?
            </h2>
            <p className="text-midnight-400 max-w-xl mx-auto">
              Built with intention, designed for connection. Every feature serves one purpose: helping you find love.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="premium-card p-6 rounded-2xl group hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="w-12 h-12 bg-amora-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amora-500/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-amora-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-midnight-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-midnight-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Love Stories That <span className="gradient-text">Started Here</span>
            </h2>
            <p className="text-midnight-400 max-w-xl mx-auto">
              Real connections, real love, real results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 rounded-2xl"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gold-400 fill-gold-400" />
                  ))}
                </div>
                <p className="text-midnight-200 mb-4 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-midnight-500">{testimonial.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Section */}
      <section id="premium" className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Unlock <span className="gold-gradient-text">Premium</span>
            </h2>
            <p className="text-midnight-400 max-w-xl mx-auto">
              Elevate your dating experience with exclusive features and priority matching.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: '$0', features: ['Basic matching', '5 likes per day', 'Text chat', 'Profile creation'] },
              { name: 'Plus', price: '$9.99/mo', features: ['Unlimited likes', 'See who liked you', 'Advanced filters', 'Read receipts', 'Priority support'], popular: true },
              { name: 'Premium', price: '$19.99/mo', features: ['All Plus features', 'AI compatibility insights', 'Video chat', 'Profile boost', 'Incognito mode', 'Travel mode'] },
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-6 rounded-2xl ${
                  plan.popular
                    ? 'bg-gradient-to-b from-amora-500/20 to-amora-900/20 border-2 border-amora-500/50'
                    : 'glass-card border border-midnight-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amora-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-6">{plan.price}</div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-midnight-300">
                      <Heart className="w-4 h-4 text-amora-400 fill-amora-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className={`block text-center py-3 rounded-full font-semibold transition-all ${
                    plan.popular
                      ? 'amora-button'
                      : 'amora-button-outline'
                  }`}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-amora-gradient opacity-5" />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Your Love Story <span className="gradient-text">Starts Now</span>
            </h2>
            <p className="text-midnight-300 mb-8 max-w-lg mx-auto">
              Join millions who have found meaningful connections on Amora. Your perfect match is waiting.
            </p>
            <Link href="/auth/register" className="amora-button text-lg px-8 py-4 inline-flex items-center gap-2">
              <Heart className="w-5 h-5 fill-white" />
              Join Amora Today
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-midnight-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-midnight-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#premium" className="hover:text-white transition-colors">Premium</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Safety</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-midnight-400">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Press</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-midnight-400">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-midnight-400">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-midnight-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-amora-500 fill-amora-500" />
              <span className="font-semibold">Amora</span>
            </div>
            <p className="text-sm text-midnight-500">
              &copy; 2026 Amora. All rights reserved. Made with love.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
