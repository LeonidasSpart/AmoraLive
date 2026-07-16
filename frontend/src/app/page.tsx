"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import {
  Heart,
  Sparkles,
  Shield,
  MessageCircle,
  Star,
  ChevronRight,
  Menu,
  X,
  Zap,
  Lock,
  Infinity as InfinityIcon,
  Video,
  Eye,
  Plane,
  ArrowRight,
  Play,
  Quote,
  CheckCircle2,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ============================================================
   AMORA LANDING PAGE
   Crafted to make hearts skip a beat.
   ============================================================ */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const heroYspring = useSpring(heroY, springConfig);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  /* Rotating testimonials */
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  /* ============================================================
     DATA
     ============================================================ */

  const features = [
    {
      icon: Sparkles,
      title: "Soul-Level Matching",
      description:
        "Our AI dives deeper than surface traits. It understands your values, humor, and emotional rhythm to find someone who truly resonates with you.",
      color: "from-rose-500/20 to-pink-500/20",
      iconColor: "text-rose-400",
      glow: "shadow-rose-500/20",
    },
    {
      icon: Shield,
      title: "Fortress-Level Safety",
      description:
        "Every single profile passes photo verification, identity checks, and background screening. Your heart deserves a safe place to open up.",
      color: "from-violet-500/20 to-purple-500/20",
      iconColor: "text-violet-400",
      glow: "shadow-violet-500/20",
    },
    {
      icon: MessageCircle,
      title: "Conversations That Flow",
      description:
        "Smart icebreakers tailored to your match. Voice notes, photos, and real-time chemistry. No more awkward silences or forced small talk.",
      color: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
      glow: "shadow-amber-500/20",
    },
    {
      icon: Zap,
      title: "Ad-Free Intimacy",
      description:
        "A space designed for connection, not distraction. No ads. No interruptions. Just you, them, and the spark between you.",
      color: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400",
      glow: "shadow-emerald-500/20",
    },
  ];

  const testimonials = [
    {
      names: "Sarah & Michael",
      text: "We matched on Amora and something just clicked. The compatibility insights were spot on. We are getting married next spring in the same vineyard where we had our first date.",
      location: "New York, NY",
      compatibility: 94,
      avatar: "SM",
      color: "from-rose-400 to-pink-500",
    },
    {
      names: "James & Emily",
      text: "The AI matching is uncanny. Amora understood what I was looking for before I could even articulate it myself. Six months in and it still feels like the first week.",
      location: "London, UK",
      compatibility: 91,
      avatar: "JE",
      color: "from-violet-400 to-purple-500",
    },
    {
      names: "David & Anna",
      text: "After years of swiping through endless faces, Amora was a revelation. Quality over quantity is not just a tagline here. It is the entire experience.",
      location: "Sydney, Australia",
      compatibility: 97,
      avatar: "DA",
      color: "from-amber-400 to-orange-500",
    },
  ];

  const stats = [
    { value: "2.5M+", label: "Active Souls", icon: Users },
    { value: "500K+", label: "Matches Made", icon: Heart },
    { value: "4.9", label: "Star Rating", icon: Star },
    { value: "89%", label: "Second Dates", icon: TrendingUp },
  ];

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Dip your toes in the water",
      features: [
        { text: "Basic AI matching", icon: Sparkles },
        { text: "5 curated likes per day", icon: Heart },
        { text: "Text chat", icon: MessageCircle },
        { text: "Profile creation", icon: Users },
      ],
      cta: "Start Free",
      popular: false,
      gradient: "from-midnight-800 to-midnight-900",
      border: "border-midnight-700",
    },
    {
      name: "Plus",
      price: "$9.99",
      period: "per month",
      description: "For those ready to dive deeper",
      features: [
        { text: "Unlimited likes", icon: InfinityIcon },
        { text: "See who liked you", icon: Eye },
        { text: "Advanced filters", icon: Zap },
        { text: "Read receipts", icon: CheckCircle2 },
        { text: "Priority support", icon: Star },
      ],
      cta: "Go Plus",
      popular: true,
      gradient: "from-amora-900/40 to-amora-950/40",
      border: "border-amora-500/50",
    },
    {
      name: "Premium",
      price: "$19.99",
      period: "per month",
      description: "The full Amora experience",
      features: [
        { text: "Everything in Plus", icon: CheckCircle2 },
        { text: "AI compatibility deep-dive", icon: Sparkles },
        { text: "Video chat", icon: Video },
        { text: "Profile boost", icon: TrendingUp },
        { text: "Incognito mode", icon: Eye },
        { text: "Travel mode", icon: Plane },
      ],
      cta: "Go Premium",
      popular: false,
      gradient: "from-gold-900/20 to-amber-950/20",
      border: "border-gold-500/30",
    },
  ];

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-midnight-950 text-white overflow-x-hidden selection:bg-amora-500/30 selection:text-white"
    >
      {/* Inject keyframes for animate-gradient */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>

      {/* Ambient cursor glow */}
      <div
        className="fixed pointer-events-none z-50 w-[600px] h-[600px] rounded-full opacity-[0.03] bg-amora-400 blur-[120px] transition-transform duration-700 ease-out"
        style={{
          left: mousePos.x - 300,
          top: mousePos.y - 300,
        }}
      />

      {/* ==========================================================
          NAVIGATION
          ========================================================== */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-midnight-950/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/20"
            : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="Amora"
                  className="h-10 w-auto relative z-10"
                  priority
                />
                <div className="absolute inset-0 bg-amora-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {[
                { label: "How It Works", href: "#features" },
                { label: "Love Stories", href: "#testimonials" },
                { label: "Pricing", href: "#premium" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative px-4 py-2 text-sm text-midnight-300 hover:text-white transition-colors duration-300 group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-amora-400 group-hover:w-1/2 transition-all duration-300" />
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-sm text-midnight-300 hover:text-white transition-colors duration-300 px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="group relative overflow-hidden rounded-full bg-white text-midnight-950 text-sm font-semibold px-6 py-2.5 transition-all duration-300 hover:shadow-lg hover:shadow-white/10 hover:scale-105"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-amora-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>

            <button
              className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-midnight-950/95 backdrop-blur-2xl border-b border-white/5"
            >
              <div className="px-4 py-6 space-y-1">
                {[
                  { label: "How It Works", href: "#features" },
                  { label: "Love Stories", href: "#testimonials" },
                  { label: "Pricing", href: "#premium" },
                  { label: "Sign In", href: "/auth/login" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block text-midnight-300 hover:text-white py-3 px-4 rounded-lg hover:bg-white/5 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/auth/register"
                  className="block text-center bg-white text-midnight-950 font-semibold py-3 rounded-full mt-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ==========================================================
          HERO SECTION
          ========================================================== */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background layers */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amora-900/30 via-midnight-950 to-midnight-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-rose-900/10 via-transparent to-transparent" />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amora-500/5 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{
                y: "110vh",
                x: `${5 + i * 8}%`,
                opacity: 0,
                scale: 0.5,
              }}
              animate={{
                y: "-20vh",
                opacity: [0, 0.4, 0.4, 0],
                scale: [0.5, 1, 1, 0.5],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                delay: i * 1.2,
                ease: "linear",
              }}
            >
              <Heart
                className="text-amora-400/20 fill-amora-400/20"
                style={{ width: 12 + (i % 4) * 4, height: 12 + (i % 4) * 4 }}
                aria-hidden="true"
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="relative z-10 max-w-5xl mx-auto px-4 text-center"
          style={{ y: heroYspring, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 mb-10 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amora-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amora-500" />
              </span>
              <span className="text-sm text-amora-300 font-medium tracking-wide">
                AI Powered Dating, Reimagined
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
              <span className="block">Find Someone</span>
              <span className="block mt-2">
                Who{" "}
                <span className="relative inline-block">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-amora-400 via-rose-400 to-amora-400 animate-gradient bg-[length:200%_auto]">
                    Gets You
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 200 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 8C50 2 150 2 198 8"
                      stroke="url(#underline)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="underline" x1="0" y1="0" x2="200" y2="0">
                        <stop stopColor="#f472b6" />
                        <stop offset="1" stopColor="#a78bfa" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </span>
            </h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg sm:text-xl lg:text-2xl text-midnight-300 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Amora uses advanced AI to understand who you truly are and connect you with people who complement your soul. No more endless swiping. Just meaningful connections.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Link
                href="/auth/register"
                className="group relative overflow-hidden rounded-full bg-white text-midnight-950 text-lg font-semibold px-10 py-4 transition-all duration-300 hover:shadow-2xl hover:shadow-white/20 hover:scale-105 w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-amora-300 to-rose-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              <Link
                href="#features"
                className="group flex items-center gap-2 text-midnight-300 hover:text-white transition-colors duration-300 text-lg px-8 py-4 w-full sm:w-auto justify-center"
              >
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 group-hover:bg-white/5 transition-all">
                  <Play className="w-4 h-4 ml-0.5" />
                </div>
                See How It Works
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <stat.icon className="w-4 h-4 text-amora-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-midnight-500">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-white/60"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ==========================================================
          HOW IT WORKS / FEATURES
          ========================================================== */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="inline-block text-amora-400 text-sm font-semibold tracking-widest uppercase mb-4">
              Why Amora
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Built for{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amora-400 to-rose-400">
                Real Connection
              </span>
            </h2>
            <p className="text-midnight-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Every feature serves one purpose: helping you find someone who sees the world the way you do.
            </p>
          </motion.div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className={`group relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br ${feature.color} p-8 lg:p-10 hover:border-white/10 transition-all duration-500 hover:shadow-2xl ${feature.glow}`}
              >
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-midnight-300 leading-relaxed text-base">
                    {feature.description}
                  </p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================================
          TESTIMONIALS
          ========================================================== */}
      <section id="testimonials" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-midnight-900/30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amora-500/5 rounded-full blur-[150px]" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-amora-400 text-sm font-semibold tracking-widest uppercase mb-4">
              Love Stories
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Real Connections,{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-amora-400">
                Real Love
              </span>
            </h2>
          </motion.div>

          {/* Featured testimonial carousel */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <Quote className="w-12 h-12 text-amora-500/30 mx-auto mb-8" aria-hidden="true" />
                <p className="text-2xl sm:text-3xl lg:text-4xl font-light leading-relaxed text-white/90 mb-10 max-w-4xl mx-auto">
                  "{testimonials[activeTestimonial].text}"
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonials[activeTestimonial].color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                  >
                    {testimonials[activeTestimonial].avatar}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-lg">
                      {testimonials[activeTestimonial].names}
                    </div>
                    <div className="text-midnight-400 text-sm">
                      {testimonials[activeTestimonial].location}
                    </div>
                  </div>
                  <div className="ml-4 px-3 py-1 rounded-full bg-amora-500/10 border border-amora-500/20 text-amora-400 text-sm font-medium">
                    {testimonials[activeTestimonial].compatibility}% Match
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-12">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === activeTestimonial
                      ? "w-8 h-2 bg-amora-400"
                      : "w-2 h-2 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                  aria-current={i === activeTestimonial ? "step" : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          PRICING
          ========================================================== */}
      <section id="premium" className="py-32 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="inline-block text-amora-400 text-sm font-semibold tracking-widest uppercase mb-4">
              Pricing
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Invest in{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amora-400 to-rose-400">
                Your Love Life
              </span>
            </h2>
            <p className="text-midnight-400 max-w-xl mx-auto text-lg">
              Choose the path that feels right. Upgrade or downgrade anytime.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className={`relative rounded-3xl border ${plan.border} bg-gradient-to-b ${plan.gradient} p-8 ${
                  plan.popular ? "md:-mt-4 md:mb-4" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-amora-500 to-rose-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-amora-500/25">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-midnight-400 text-sm">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-midnight-400 text-sm ml-1">/{plan.period}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <f.icon className="w-3 h-3 text-amora-400" />
                      </div>
                      <span className="text-midnight-200">{f.text}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className={`block text-center py-3.5 rounded-full font-semibold transition-all duration-300 ${
                    plan.popular
                      ? "bg-white text-midnight-950 hover:shadow-lg hover:shadow-white/20 hover:scale-[1.02]"
                      : "border border-white/20 hover:bg-white/5 hover:border-white/30"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-midnight-500 text-sm mt-10">
            All plans include our core safety features. Cancel anytime. No hidden fees.
          </p>
        </div>
      </section>

      {/* ==========================================================
          FINAL CTA
          ========================================================== */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-amora-900/20 via-midnight-950 to-midnight-950" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amora-500/10 rounded-full blur-[200px]" />
        </div>

        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-amora-500 to-rose-500 flex items-center justify-center shadow-2xl shadow-amora-500/30"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Heart className="w-10 h-10 text-white fill-white" />
            </motion.div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Your Person Is{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amora-400 to-rose-400">
                Already Here
              </span>
            </h2>
            <p className="text-midnight-300 text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
              Millions have found their someone on Amora. The only question left is: will you be next?
            </p>

            <Link
              href="/auth/register"
              className="group inline-flex items-center gap-3 bg-white text-midnight-950 text-lg font-semibold px-10 py-5 rounded-full transition-all duration-300 hover:shadow-2xl hover:shadow-white/20 hover:scale-105"
            >
              <Heart className="w-5 h-5 fill-midnight-950" />
              Join Amora Today
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <p className="text-midnight-500 text-sm mt-6">
              Free to start. No credit card required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ==========================================================
          FOOTER
          ========================================================== */}
      <footer className="border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            <div className="col-span-2">
              <Image
                src="/logo.png"
                alt="Amora"
                className="h-8 w-auto mb-4"
              />
              <p className="text-midnight-400 text-sm leading-relaxed max-w-xs">
                AI-powered dating that puts connection first. Because your heart deserves better than endless swiping.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white">Product</h4>
              <ul className="space-y-3 text-sm text-midnight-400">
                <li><Link href="#features" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="#premium" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/safety" className="hover:text-white transition-colors">Safety</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white">Company</h4>
              <ul className="space-y-3 text-sm text-midnight-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/press" className="hover:text-white transition-colors">Press</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white">Support</h4>
              <ul className="space-y-3 text-sm text-midnight-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-midnight-500">
              &copy; 2026 Amora. All rights reserved. Crafted with intention.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-midnight-500 hover:text-midnight-300 transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm text-midnight-500 hover:text-midnight-300 transition-colors">Terms</Link>
              <Link href="/cookies" className="text-sm text-midnight-500 hover:text-midnight-300 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}use client";
