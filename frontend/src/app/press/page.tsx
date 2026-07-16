"use client";

import { StaticPage } from '../../components/StaticPage';
import {
  Newspaper,
  Download,
  Mail,
  Heart,
  Sparkles,
  TrendingUp,
  Users,
  Star,
  ArrowRight,
  ExternalLink,
  FileText,
  Image,
  Video,
  Radio,
  Calendar,
  Quote,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

/* ============================================================
   AMORA PRESS PAGE
   Where the story gets told. No em dashes anywhere.
   ============================================================ */

export default function PressPage() {
  const stats = [
    { value: "2.5M+", label: "Active Users", icon: Users },
    { value: "500K+", label: "Matches Made", icon: Heart },
    { value: "4.9★", label: "App Store Rating", icon: Star },
    { value: "89%", label: "Second Date Rate", icon: TrendingUp },
  ];

  const coverage = [
    {
      outlet: "TechCrunch",
      title: "Amora Wants to Kill the Swipe with AI-Powered Compatibility",
      date: "June 2026",
      type: "Feature",
      icon: FileText,
    },
    {
      outlet: "The Verge",
      title: "Inside Amora's Soul-Level Matching Algorithm",
      date: "May 2026",
      type: "Deep Dive",
      icon: Radio,
    },
    {
      outlet: "Wired",
      title: "Why Gen Z Is Ditching Swipe Apps for Intentional Dating",
      date: "April 2026",
      type: "Trend Report",
      icon: TrendingUp,
    },
    {
      outlet: "Forbes",
      title: "Amora Raises Series A to Scale AI Matchmaking Globally",
      date: "March 2026",
      type: "Funding News",
      icon: Star,
    },
  ];

  const assets = [
    {
      icon: Image,
      title: "Logo Pack",
      description: "PNG, SVG, and vector formats in full color, monochrome, and reversed variants.",
      size: "12 MB",
    },
    {
      icon: FileText,
      title: "Brand Guidelines",
      description: "Typography, color palette, voice & tone, and usage rules for partners and press.",
      size: "PDF, 4 MB",
    },
    {
      icon: Video,
      title: "Product Screenshots",
      description: "High-resolution app screenshots and feature walkthroughs for editorial use.",
      size: "24 MB",
    },
    {
      icon: Sparkles,
      title: "Founder Photos",
      description: "Professional headshots and team photos for profiles and interviews.",
      size: "8 MB",
    },
  ];

  return (
    <StaticPage
      eyebrow={
        <span className="inline-flex items-center gap-2 text-amora-400 text-sm font-medium tracking-wider uppercase">
          <Newspaper className="w-4 h-4" />
          Press &amp; Media
        </span>
      }
      title="The Story We Are Building"
      subtitle="Facts, figures, and everything you need to write about Amora with confidence."
    >
      {/* Hero quote */}
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
            "We are not building a dating app. We are building the last dating app you will ever need."
          </p>
          <p className="text-midnight-400 text-sm">
            Amora was founded on a simple belief: technology should bring people closer, not keep them scrolling. Every feature, every algorithm, every decision serves that one purpose.
          </p>
        </div>
      </motion.div>

      {/* Quick Facts */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <Sparkles className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">At a Glance</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      {/* About Amora */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <Heart className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">About Amora</h2>
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
              <h3 className="text-lg font-semibold text-white mb-3">What We Do</h3>
              <p className="text-midnight-300 leading-relaxed text-[15px]">
                Amora is an AI-assisted dating platform that replaces endless swiping with compatibility-driven matching. We analyze personality, interests, lifestyle, and values to surface people who genuinely complement each other. Every match has a reason to exist.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Why It Matters</h3>
              <p className="text-midnight-300 leading-relaxed text-[15px]">
                Most dating apps optimize for engagement time. We optimize for outcomes. Our success metric is simple: did two people who would not have otherwise met find each other, and did it lead somewhere real? That is the only number we chase.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">How We Are Different</h3>
              <p className="text-midnight-300 leading-relaxed text-[15px]">
                Identity verification is mandatory, not optional. AI moderation runs 24/7. We cap daily matches to encourage quality over quantity. And we are building in public, sharing our journey, our metrics, and our mistakes along the way.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Where We Are Going</h3>
              <p className="text-midnight-300 leading-relaxed text-[15px]">
                We are a young, independently-run platform with global ambitions. Our roadmap includes video dating, compatibility coaching, and community events. But the destination is always the same: meaningful connection in a world that desperately needs it.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Press Coverage */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <Radio className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">Recent Coverage</h2>
        </div>

        <div className="space-y-4">
          {coverage.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="group flex items-start gap-5 p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-amora-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amora-500/20 group-hover:scale-110 transition-all duration-300">
                <item.icon className="w-5 h-5 text-amora-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-semibold text-white">{item.outlet}</span>
                  <span className="text-xs text-midnight-500 px-2 py-0.5 rounded-full bg-white/5">{item.type}</span>
                </div>
                <h3 className="text-midnight-200 group-hover:text-white transition-colors mb-1 truncate">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-midnight-500">
                  <Calendar className="w-3 h-3" />
                  {item.date}
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-midnight-600 group-hover:text-amora-400 transition-colors flex-shrink-0 mt-1" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Brand Assets */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <Download className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">Brand Assets</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {assets.map((asset, index) => (
            <motion.div
              key={asset.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amora-500/10 flex items-center justify-center group-hover:bg-amora-500/20 group-hover:scale-110 transition-all duration-300">
                  <asset.icon className="w-5 h-5 text-amora-400" />
                </div>
                <span className="text-xs text-midnight-500 bg-white/5 px-2 py-1 rounded-full">{asset.size}</span>
              </div>
              <h3 className="font-semibold text-white mb-2 group-hover:text-amora-300 transition-colors">
                {asset.title}
              </h3>
              <p className="text-sm text-midnight-400 leading-relaxed mb-4">
                {asset.description}
              </p>
              <div className="inline-flex items-center gap-2 text-sm text-amora-400 group-hover:text-amora-300 transition-colors">
                <span className="font-medium">Request Access</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-6 p-6 rounded-xl border border-white/5 bg-white/[0.02]"
        >
          <p className="text-sm text-midnight-400 leading-relaxed">
            <span className="text-white font-medium">Usage guidelines: </span>
            The Amora name, logo, and brand assets are protected by trademark and copyright law. Please do not modify, distort, or use our assets in ways that imply endorsement without permission. For custom requests or partnership inquiries, <Link href="/contact" className="text-amora-400 hover:text-amora-300 transition-colors underline underline-offset-2">contact our team</Link>.
          </p>
        </motion.div>
      </div>

      {/* Media Inquiries CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl bg-gradient-to-r from-amora-900/30 to-rose-900/20 border border-amora-500/10 p-8 sm:p-10"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amora-500/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-amora-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Media Inquiries</h3>
              <p className="text-midnight-400 text-sm leading-relaxed max-w-lg">
                For interviews, data requests, partnership proposals, or anything else press-related, we would love to hear from you. We are a small team, so please allow 24 to 48 hours for a response.
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 bg-white text-midnight-950 font-semibold px-6 py-3 rounded-full hover:shadow-lg hover:shadow-white/10 hover:scale-105 transition-all duration-300 flex-shrink-0"
          >
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
        className="mt-16 text-center"
      >
        <div className="inline-flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-full px-6 py-3">
          <Heart className="w-4 h-4 text-midnight-500" />
          <span className="text-sm text-midnight-400">
            Thank you for helping us tell this story
          </span>
        </div>
      </motion.div>
    </StaticPage>
  );
}
