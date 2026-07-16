"use client";

import { StaticPage } from '../../components/StaticPage';
import {
  Users,
  Heart,
  ShieldCheck,
  MessageCircle,
  Sparkles,
  Star,
  Ban,
  Gavel,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HandHeart,
  Eye,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

/* ============================================================
   AMORA COMMUNITY GUIDELINES
   The rules of the heart. No em dashes anywhere.
   ============================================================ */

export default function CommunityPage() {
  const values = [
    {
      icon: Heart,
      title: "Be Genuinely Yourself",
      body: "Use recent, real photos and write a profile that actually represents who you are. Misrepresentation erodes the trust the whole community depends on. The best connections start with honesty.",
      color: "from-rose-500/10 to-pink-500/10",
      iconColor: "text-rose-400",
      iconBg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
    {
      icon: MessageCircle,
      title: "Communicate with Respect",
      body: "Disagreement and rejection are part of dating. Harassment, hate speech, threats, and unsolicited explicit content are never tolerated. Treat others the way you would want to be treated on your worst day.",
      color: "from-sky-500/10 to-blue-500/10",
      iconColor: "text-sky-400",
      iconBg: "bg-sky-500/10",
      border: "border-sky-500/20",
    },
    {
      icon: ShieldCheck,
      title: "No Commercial Activity",
      body: "Amora is for dating, not marketing. Promoting other services, soliciting payments, running bots, or using the platform for any commercial purpose results in immediate account removal. Keep it human.",
      color: "from-amber-500/10 to-orange-500/10",
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      icon: Users,
      title: "One Person, One Account",
      body: "Accounts must represent a single real person of legal age. Shared accounts, fake profiles, duplicate accounts, and impersonation will be removed without warning. Your identity is your own.",
      color: "from-emerald-500/10 to-teal-500/10",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
  ];

  const enforcementSteps = [
    {
      icon: Eye,
      title: "Detection",
      description: "Our AI monitors conversations and profiles 24/7. Users can also report behavior directly from any profile or message.",
    },
    {
      icon: Gavel,
      title: "Review",
      description: "Human moderators review every report within 24 hours. Context matters. We look at patterns, not just isolated incidents.",
    },
    {
      icon: Ban,
      title: "Action",
      description: "Minor issues may result in a warning. Serious or repeated violations, including harassment and scams, result in permanent suspension.",
    },
    {
      icon: RefreshCw,
      title: "Appeal",
      description: "We are not perfect. If you believe a decision was made in error, you can appeal via the Contact page. We review every appeal personally.",
    },
  ];

  return (
    <StaticPage
      eyebrow={
        <span className="inline-flex items-center gap-2 text-amora-400 text-sm font-medium tracking-wider uppercase">
          <Users className="w-4 h-4" />
          Community Guidelines
        </span>
      }
      title="The Kindness Code"
      subtitle="Amora only works if the people on it can trust each other. These guidelines exist to protect that trust, not to police it."
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
          <HandHeart className="w-10 h-10 text-amora-400 mb-6" />
          <p className="text-xl sm:text-2xl font-light text-white/90 leading-relaxed mb-6">
            "Every community is defined by what it tolerates. We choose to tolerate nothing less than genuine respect, real identity, and honest intention."
          </p>
          <p className="text-midnight-400 text-sm">
            These are not rules for rules' sake. They are the foundation of a space where vulnerability is safe and connection is real.
          </p>
        </div>
      </motion.div>

      {/* Core Values */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <Star className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">Our Shared Values</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`group relative overflow-hidden rounded-2xl border ${value.border} bg-gradient-to-br ${value.color} p-8 transition-all duration-500 hover:border-white/20`}
            >
              <div className="relative z-10">
                <div className={`w-12 h-12 ${value.iconBg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className={`w-6 h-6 ${value.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-midnight-300 leading-relaxed text-[15px]">
                  {value.body}
                </p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/3 rounded-full blur-3xl group-hover:bg-white/5 transition-colors duration-500" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Enforcement */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <Gavel className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">How We Enforce</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 sm:p-10"
        >
          <p className="text-midnight-300 leading-relaxed mb-10 max-w-2xl">
            Violations are reviewed case by case. We believe in proportionate responses and second chances for honest mistakes. But we have zero tolerance for behavior that harms others.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {enforcementSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative"
              >
                <div className="w-10 h-10 rounded-xl bg-amora-500/10 flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-amora-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-midnight-800 border border-white/10 flex items-center justify-center text-xs font-bold text-midnight-500">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-midnight-400 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Zero Tolerance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl bg-gradient-to-br from-rose-900/20 via-midnight-900/50 to-midnight-900/50 border border-rose-500/10 p-8 sm:p-12 mb-20"
      >
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Zero Tolerance Offenses</h3>
            <p className="text-midnight-300 leading-relaxed mb-6 text-[15px]">
              The following behaviors result in immediate, permanent suspension with no warning. There is no appeal for these violations.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Harassment, threats, or hate speech",
                "Sharing explicit content involving minors",
                "Soliciting money, gifts, or cryptocurrency",
                "Impersonation or fake identity",
                "Bot accounts or automated behavior",
                "Doxxing or sharing private information",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <Ban className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-midnight-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Reporting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl bg-gradient-to-r from-amora-900/30 to-violet-900/20 border border-amora-500/10 p-8 sm:p-10 mb-16"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amora-500/10 flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-amora-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">See Something Wrong?</h3>
              <p className="text-midnight-400 text-sm leading-relaxed max-w-lg">
                Report any profile or message directly from the app. Our team reviews every report within 24 hours. Your voice keeps this community safe.
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 bg-white text-midnight-950 font-semibold px-6 py-3 rounded-full hover:shadow-lg hover:shadow-white/10 hover:scale-105 transition-all duration-300 flex-shrink-0"
          >
            Report a Concern
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
            Together, we are building the safest place to open your heart
          </span>
        </div>
      </motion.div>
    </StaticPage>
  );
}
