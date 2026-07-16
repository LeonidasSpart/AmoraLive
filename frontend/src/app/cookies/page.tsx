"use client";

import { StaticPage } from '../../components/StaticPage';
import {
  Cookie,
  Shield,
  Settings,
  BarChart3,
  Lock,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Eye,
  Globe,
  ArrowRight,
  Heart,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

/* ============================================================
   AMORA COOKIE POLICY
   Transparency in every byte. No em dashes anywhere.
   ============================================================ */

export default function CookiesPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    Essential: true,
    Preferences: true,
    Analytics: true,
  });

  const categories = [
    {
      name: "Essential",
      required: true,
      icon: Lock,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      body: "Required for login sessions, security tokens, and core site functionality. These keep your account safe and ensure the app works as intended. They cannot be disabled without breaking the experience.",
      examples: ["Session tokens", "CSRF protection", "Authentication state"],
    },
    {
      name: "Preferences",
      required: false,
      icon: Settings,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
      body: "Remember your choices so you do not have to reconfigure them every visit. From theme settings to language preferences, these cookies make Amora feel like home.",
      examples: ["Dark mode preference", "Language selection", "Notification settings"],
    },
    {
      name: "Analytics",
      required: false,
      icon: BarChart3,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      body: "Help us understand aggregate usage patterns, like which features people love and where we can improve. These are strictly anonymous. We do not use them to target ads or build individual profiles.",
      examples: ["Feature usage counts", "Page load performance", "Error tracking"],
    },
  ];

  const toggleCategory = (name: string) => {
    if (name === "Essential") return;
    setToggles((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <StaticPage
      eyebrow={
        <span className="inline-flex items-center gap-2 text-amora-400 text-sm font-medium tracking-wider uppercase">
          <Cookie className="w-4 h-4" />
          Cookie Policy
        </span>
      }
      title="The Small Things That Matter"
      subtitle="We use cookies to keep you safe, remember your preferences, and make Amora better. Here is exactly what we use and why."
    >
      {/* Hero belief */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amora-900/30 via-midnight-900/50 to-amber-900/20 border border-amora-500/10 p-8 sm:p-12 mb-20"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amora-500/5 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-3xl">
          <Shield className="w-10 h-10 text-amora-400 mb-6" />
          <p className="text-xl sm:text-2xl font-light text-white/90 leading-relaxed mb-6">
            "We do not use cookies to track you across the internet. We use them to make your experience on Amora smoother, safer, and more personal."
          </p>
          <p className="text-midnight-400 text-sm">
            Every cookie serves a purpose. None of them exist to sell your data to advertisers or data brokers. That is a promise.
          </p>
        </div>
      </motion.div>

      {/* Cookie Categories */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <Cookie className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">What We Use</h2>
        </div>

        <div className="space-y-5">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`group relative overflow-hidden rounded-2xl border ${cat.border} bg-gradient-to-br ${cat.bg} p-8 transition-all duration-500`}
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-6 mb-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${cat.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <cat.icon className={`w-6 h-6 ${cat.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold">{cat.name}</h3>
                        {cat.required ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                            <Lock className="w-3 h-3" />
                            Always On
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/5 text-midnight-400 px-3 py-1 rounded-full border border-white/10">
                            <Eye className="w-3 h-3" />
                            Optional
                          </span>
                        )}
                      </div>
                      <p className="text-midnight-300 leading-relaxed text-[15px] max-w-2xl">
                        {cat.body}
                      </p>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleCategory(cat.name)}
                    disabled={cat.required}
                    className={`flex-shrink-0 transition-all duration-300 ${
                      cat.required ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"
                    }`}
                  >
                    {toggles[cat.name] ? (
                      <ToggleRight className={`w-10 h-10 ${cat.required ? "text-emerald-400" : "text-amora-400"}`} />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-midnight-600" />
                    )}
                  </button>
                </div>

                {/* Examples */}
                <div className="flex flex-wrap gap-2 ml-16">
                  {cat.examples.map((ex) => (
                    <span
                      key={ex}
                      className="text-xs text-midnight-400 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/3 rounded-full blur-3xl group-hover:bg-white/5 transition-colors duration-500" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* How to Manage */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <Settings className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">Managing Your Cookies</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid sm:grid-cols-2 gap-6"
        >
          <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.03] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amora-500/10 flex items-center justify-center mb-5">
              <Globe className="w-5 h-5 text-amora-400" />
            </div>
            <h3 className="font-semibold text-white mb-3">Browser Settings</h3>
            <p className="text-midnight-400 text-sm leading-relaxed mb-4">
              Most browsers let you block or delete cookies through their privacy settings. Keep in mind that blocking essential cookies will prevent you from staying logged in to Amora.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Chrome", "Safari", "Firefox", "Edge"].map((browser) => (
                <span key={browser} className="text-xs text-midnight-500 bg-white/5 px-3 py-1.5 rounded-full">
                  {browser}
                </span>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.03] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amora-500/10 flex items-center justify-center mb-5">
              <Settings className="w-5 h-5 text-amora-400" />
            </div>
            <h3 className="font-semibold text-white mb-3">In-App Controls</h3>
            <p className="text-midnight-400 text-sm leading-relaxed mb-4">
              Optional cookie categories can be adjusted directly from your account privacy settings. Changes take effect immediately without requiring a logout.
            </p>
            <Link
              href="/settings/privacy"
              className="inline-flex items-center gap-2 text-sm text-amora-400 hover:text-amora-300 transition-colors group"
            >
              Open Privacy Settings
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* What We Do Not Do */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl bg-gradient-to-br from-rose-900/20 via-midnight-900/50 to-midnight-900/50 border border-rose-500/10 p-8 sm:p-12 mb-16"
      >
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
            <Info className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">What We Will Never Do</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Sell cookie data to advertisers or data brokers",
                "Track you across non-Amora websites",
                "Build individual advertising profiles from your behavior",
                "Share cookie data with third parties for marketing",
                "Use cookies to manipulate your emotions or decisions",
                "Store sensitive personal data in browser cookies",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-midnight-300">{item}</span>
                </div>
              ))}
            </div>
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
              <Heart className="w-6 h-6 text-amora-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Questions About Cookies?</h3>
              <p className="text-midnight-400 text-sm leading-relaxed max-w-lg">
                Privacy is not just a policy for us. It is a practice. If anything here feels unclear, we want to hear from you.
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 bg-white text-midnight-950 font-semibold px-6 py-3 rounded-full hover:shadow-lg hover:shadow-white/10 hover:scale-105 transition-all duration-300 flex-shrink-0"
          >
            Reach Out
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
          <Cookie className="w-4 h-4 text-midnight-500" />
          <span className="text-sm text-midnight-400">
            Last updated: July 2026. We will notify you of any material changes.
          </span>
        </div>
      </motion.div>
    </StaticPage>
  );
}
