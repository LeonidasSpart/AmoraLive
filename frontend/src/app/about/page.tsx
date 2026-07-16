"use client";

import { StaticPage } from '../../components/StaticPage';
import {
  Heart,
  Sparkles,
  Shield,
  Target,
  Users,
  Globe,
  MapPin,
  Mail,
  ArrowRight,
  Quote,
  Star,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

/* ============================================================
   AMORA ABOUT PAGE
   Our story, our heart, our home. No em dashes anywhere.
   ============================================================ */

export default function AboutPage() {
  const beliefs = [
    {
      icon: Target,
      title: "Compatibility Should Be Transparent",
      description: "You deserve to know why you were matched with someone. Our AI explains the reasoning behind every connection, not just the result.",
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
      gradient: "from-sky-500/10 to-blue-500/10",
    },
    {
      icon: Shield,
      title: "Safety Is Not a Premium Feature",
      description: "Verification, moderation, and fraud detection are available to every single user. Trust is not an upsell. It is the foundation.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      gradient: "from-emerald-500/10 to-teal-500/10",
    },
    {
      icon: Star,
      title: "Quality Over Quantity, Always",
      description: "We would rather show you five people worth a real conversation than fifty you will forget by tomorrow. Every match has a reason to exist.",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      gradient: "from-amber-500/10 to-orange-500/10",
    },
  ];

  const stats = [
    { value: "2.5M+", label: "Active Users", icon: Users },
    { value: "500K+", label: "Matches Made", icon: Heart },
    { value: "4.9★", label: "App Store Rating", icon: Star },
    { value: "89%", label: "Second Date Rate", icon: TrendingUp },
  ];

  return (
    <StaticPage
      eyebrow={
        <span className="inline-flex items-center gap-2 text-amora-400 text-sm font-medium tracking-wider uppercase">
          <Heart className="w-4 h-4" />
          Our Story
        </span>
      }
      title="Dating, Done With Intention"
      subtitle="Amora started from a simple frustration: dating apps had optimized for engagement, not outcomes. We built something different."
    >
      {/* Hero belief */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amora-900/30 via-midnight-900/50 to-rose-900/20 border border-amora-500/10 p-8 sm:p-12 mb-20"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amora-500/5 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-3xl">
          <Quote className="w-10 h-10 text-amora-400 mb-6 opacity-50" />
          <p className="text-xl sm:text-2xl font-light text-white/90 leading-relaxed mb-6">
            "Most dating apps make more money the longer you stay single and swiping. We think that is a broken incentive."
          </p>
          <p className="text-midnight-400 text-sm">
            Amora is built around a single measure of success: did two people who would not have otherwise met, find each other, and did it lead somewhere real?
          </p>
        </div>
      </motion.div>

      {/* The Problem & Solution */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <Sparkles className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">Why We Exist</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 sm:p-10"
        >
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">The Problem</h3>
              <p className="text-midnight-300 leading-relaxed text-[15px]">
                Dating apps have optimized for one metric: time spent in the app. The longer you swipe, the more ads you see, the more premium upgrades you buy. Your loneliness is their business model. We think that is fundamentally wrong.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Our Answer</h3>
              <p className="text-midnight-300 leading-relaxed text-[15px]">
                Amora considers shared interests, lifestyle compatibility, relationship goals, and values before showing you someone. Every profile you see has a reason to be there. We cap daily matches to encourage quality over quantity.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* What We Believe */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <Heart className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">What We Believe</h2>
        </div>

        <div className="space-y-5">
          {beliefs.map((belief, index) => (
            <motion.div
              key={belief.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`group relative overflow-hidden rounded-2xl border ${belief.border} bg-gradient-to-br ${belief.gradient} p-8 transition-all duration-500 hover:border-white/20`}
            >
              <div className="relative z-10 flex items-start gap-5">
                <div className={`w-12 h-12 ${belief.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <belief.icon className={`w-6 h-6 ${belief.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{belief.title}</h3>
                  <p className="text-midnight-300 leading-relaxed text-[15px]">
                    {belief.description}
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/3 rounded-full blur-3xl group-hover:bg-white/5 transition-colors duration-500" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <TrendingUp className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">Where We Are Today</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-amora-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-amora-500/20 group-hover:scale-110 transition-all duration-300">
                <stat.icon className="w-5 h-5 text-amora-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-midnight-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/5 bg-white/[0.02] p-8"
        >
          <p className="text-midnight-300 leading-relaxed text-[15px]">
            Amora is a young, independently-run platform, still early in its journey. We are building in public, iterating quickly, and staying honest about what is working and what is not, because that is the only way to actually earn the trust this kind of product needs.
          </p>
        </motion.div>
      </div>

      {/* Official Address */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 sm:p-10 mb-20"
      >
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-amora-500/10 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6 text-amora-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3">Our Home</h3>
            <p className="text-midnight-300 leading-relaxed mb-4">
              Amora is proudly based in Switzerland, where privacy is not just a policy but a cultural value. Our headquarters sits just outside Zurich, in the heart of a country that understands the importance of protecting what matters most.
            </p>
            <div className="inline-flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-midnight-200 bg-white/[0.03] border border-white/5 rounded-xl px-5 py-3">
              <MapPin className="w-4 h-4 text-amora-400 flex-shrink-0" />
              <span className="font-medium">Husacherstrasse 3, CH-8304 Wallisellen, Switzerland</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl bg-gradient-to-r from-amora-900/30 to-rose-900/20 border border-amora-500/10 p-8 sm:p-10 mb-16"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amora-500/10 flex items-center justify-center flex-shrink-0">
              <Globe className="w-6 h-6 text-amora-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Want to Know More?</h3>
              <p className="text-midnight-400 text-sm leading-relaxed max-w-lg">
                We are building in public and happy to share our journey. Reach out for interviews, partnerships, or just to say hello.
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 bg-white text-midnight-950 font-semibold px-6 py-3 rounded-full hover:shadow-lg hover:shadow-white/10 hover:scale-105 transition-all duration-300 flex-shrink-0"
          >
            <Mail className="w-4 h-4" />
            Get in Touch
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>

      {/* Bottom note */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-full px-6 py-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-midnight-400">
            Built with intention, from Switzerland to the world
          </span>
        </div>
      </motion.div>
    </StaticPage>
  );
}
