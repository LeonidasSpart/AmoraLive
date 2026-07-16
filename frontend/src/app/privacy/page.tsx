"use client";

import { StaticPage } from '../../components/StaticPage';
import {
  Lock,
  Eye,
  Database,
  MapPin,
  MessageSquare,
  CreditCard,
  Shield,
  Users,
  Server,
  Scale,
  Trash2,
  Bell,
  Heart,
  CheckCircle2,
  ArrowRight,
  Globe,
  FileKey,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

/* ============================================================
   AMORA PRIVACY POLICY
   Transparency wrapped in tenderness. No em dashes anywhere.
   ============================================================ */

export default function PrivacyPage() {
  const dataTypes = [
    {
      icon: Users,
      title: "Who You Are",
      items: ["Name and email address", "Date of birth and gender", "Photos and bio", "Dating preferences and dealbreakers"],
      why: "To create your profile and find people who match what you are looking for.",
      color: "from-rose-500/10 to-pink-500/10",
      iconColor: "text-rose-400",
      iconBg: "bg-rose-500/10",
    },
    {
      icon: Heart,
      title: "What You Do",
      items: ["Who you like, pass, or match with", "Messages you send and receive", "Profile views and interactions"],
      why: "To power our matching algorithm and keep the platform safe for everyone.",
      color: "from-amora-500/10 to-violet-500/10",
      iconColor: "text-amora-400",
      iconBg: "bg-amora-500/10",
    },
    {
      icon: MapPin,
      title: "Where You Are",
      items: ["Approximate location (city-level)", "Distance preferences"],
      why: "To show you nearby matches. Precise location is optional and can be disabled anytime.",
      color: "from-emerald-500/10 to-teal-500/10",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
    {
      icon: CreditCard,
      title: "How You Pay",
      items: ["Subscription tier and billing history"],
      why: "We never see your full card number. Apple, Google, PayPal, or crypto processors handle that directly.",
      color: "from-amber-500/10 to-orange-500/10",
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10",
    },
  ];

  const principles = [
    {
      icon: Eye,
      title: "You Control What Others See",
      description: "Your profile is visible only to people you might match with. You choose what photos to share, what to write in your bio, and which preferences to display. Nothing is public by default.",
    },
    {
      icon: Shield,
      title: "We Do Not Sell Your Data",
      description: "Period. Your personal information is not a product. We do not sell it to advertisers, data brokers, or third parties for marketing purposes. Ever.",
    },
    {
      icon: Server,
      title: "Service Providers Only",
      description: "We work with trusted partners (cloud hosting, payment processors, email delivery) who process data on our behalf under strict contracts. They cannot use your data for their own purposes.",
    },
    {
      icon: Scale,
      title: "Legal Disclosure Only",
      description: "We disclose data to law enforcement only when legally required to do so. We will notify you when legally permitted, unless prohibited by court order.",
    },
    {
      icon: Trash2,
      title: "Delete Anytime, Forever",
      description: "Delete your account and all associated data from Settings with one tap. Production data is purged within 30 days. We retain only what the law requires for safety or fraud prevention.",
    },
    {
      icon: Bell,
      title: "We Tell You When Things Change",
      description: "If we make material changes to this policy, we will notify you via email or in-app notice before they take effect. No silent updates. No surprises.",
    },
  ];

  const rights = [
    { title: "Access", description: "See exactly what data we hold about you." },
    { title: "Correct", description: "Update inaccurate or incomplete information." },
    { title: "Export", description: "Download a copy of your data in a portable format." },
    { title: "Delete", description: "Permanently erase your account and all associated data." },
    { title: "Restrict", description: "Limit how we process your data in certain situations." },
    { title: "Object", description: "Opt out of specific uses like algorithmic profiling." },
  ];

  return (
    <StaticPage
      eyebrow={
        <span className="inline-flex items-center gap-2 text-amora-400 text-sm font-medium tracking-wider uppercase">
          <Lock className="w-4 h-4" />
          Privacy Policy
        </span>
      }
      title="Your Data, Your Trust"
      subtitle="Last updated: July 2026"
    >
      {/* Hero belief statement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amora-900/30 via-midnight-900/50 to-violet-900/20 border border-amora-500/10 p-8 sm:p-12 mb-20"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amora-500/5 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-3xl">
          <FileKey className="w-10 h-10 text-amora-400 mb-6" />
          <p className="text-xl sm:text-2xl font-light text-white/90 leading-relaxed mb-6">
            "The most personal thing you can share is not your photo or your bio. It is your trust. We hold that sacred."
          </p>
          <p className="text-midnight-400 text-sm">
            This policy explains what we collect, why we collect it, and how we protect it. We have written it to be read, understood, and remembered. If something feels unclear, <Link href="/contact" className="text-amora-400 hover:text-amora-300 transition-colors underline underline-offset-2">ask us anything</Link>.
          </p>
        </div>
      </motion.div>

      {/* What We Collect */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <Database className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">What We Collect & Why</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {dataTypes.map((type, index) => (
            <motion.div
              key={type.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br ${type.color} p-8 hover:border-white/10 transition-all duration-500`}
            >
              <div className="relative z-10">
                <div className={`w-12 h-12 ${type.iconBg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <type.icon className={`w-6 h-6 ${type.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold mb-4">{type.title}</h3>
                <ul className="space-y-2 mb-5">
                  {type.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-midnight-300">
                      <CheckCircle2 className="w-4 h-4 text-midnight-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-white/5">
                  <p className="text-sm text-midnight-400 leading-relaxed">
                    <span className="text-amora-400 font-medium">Why: </span>
                    {type.why}
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/3 rounded-full blur-3xl group-hover:bg-white/5 transition-colors duration-500" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* How We Use It */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <Shield className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">How We Use Your Data</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/5 bg-white/[0.02] p-8"
        >
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
            {[
              { title: "Find Your Match", desc: "Our AI analyzes compatibility across personality, interests, values, and lifestyle to surface people who truly resonate with you." },
              { title: "Keep You Safe", desc: "We detect fraud, harassment, and abuse patterns in real time. Moderators review flagged content to protect the community." },
              { title: "Deliver Messages", desc: "Your chats are stored securely so you can pick up conversations where you left off, across any device." },
              { title: "Improve Over Time", desc: "We learn from aggregate patterns (never individual identities) to make matching smarter and the platform safer." },
              { title: "Support You", desc: "When you reach out for help, we access only the data needed to resolve your issue quickly and completely." },
              { title: "Communicate", desc: "We send account updates, security alerts, and occasional product news. You control what lands in your inbox." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amora-500 mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-midnight-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Our Principles */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <Heart className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">Our Privacy Principles</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {principles.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-amora-500/10 flex items-center justify-center mb-4 group-hover:bg-amora-500/20 group-hover:scale-110 transition-all duration-300">
                <item.icon className="w-5 h-5 text-amora-400" />
              </div>
              <h3 className="font-semibold text-white mb-2 group-hover:text-amora-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-midnight-400 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Your Rights */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <Scale className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">Your Rights</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {rights.map((right) => (
            <div
              key={right.title}
              className="group p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-amora-500/20 transition-all duration-300"
            >
              <h4 className="font-semibold text-white mb-1 group-hover:text-amora-300 transition-colors">
                {right.title}
              </h4>
              <p className="text-sm text-midnight-400">{right.description}</p>
            </div>
          ))}
        </motion.div>

        <div className="mt-6 p-6 rounded-xl border border-white/5 bg-amora-500/5">
          <p className="text-midnight-200 text-sm leading-relaxed">
            You can exercise most of these rights directly from your Account Settings. For anything else, <Link href="/contact" className="text-amora-400 hover:text-amora-300 transition-colors underline underline-offset-2">contact us</Link> and we will handle your request within 30 days.
          </p>
        </div>
      </div>

      {/* Data Retention */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 mb-16"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amora-500/10 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-amora-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3">How Long We Keep Your Data</h3>
            <p className="text-midnight-300 leading-relaxed mb-4">
              We retain your account data while your account is active. After you delete your account, data is removed from production systems within 30 days. We retain only what the law requires for legal, safety, or fraud-prevention purposes, such as records related to a safety report.
            </p>
            <p className="text-midnight-400 text-sm leading-relaxed">
              We do not keep your data longer than necessary. When it is time to let go, we let go completely.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Contact CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl bg-gradient-to-r from-amora-900/30 to-violet-900/20 border border-amora-500/10 p-8 sm:p-10"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amora-500/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-amora-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Questions About Your Privacy?</h3>
              <p className="text-midnight-400 text-sm leading-relaxed max-w-lg">
                We are happy to explain anything in this policy in plain language. No legal jargon required.
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 bg-white text-midnight-950 font-semibold px-6 py-3 rounded-full hover:shadow-lg hover:shadow-white/10 hover:scale-105 transition-all duration-300 flex-shrink-0"
          >
            Talk to Us
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>

      {/* Bottom trust seal */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-16 text-center"
      >
        <div className="inline-flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-full px-6 py-3">
          <Globe className="w-4 h-4 text-midnight-500" />
          <span className="text-sm text-midnight-400">
            Compliant with <span className="text-white font-medium">GDPR</span>, <span className="text-white font-medium">CCPA</span>, and global privacy standards
          </span>
        </div>
      </motion.div>
    </StaticPage>
  );
}
