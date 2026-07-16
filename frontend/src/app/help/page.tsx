"use client";

import { StaticPage } from '../../components/StaticPage';
import {
  LifeBuoy,
  Sparkles,
  Shield,
  Settings,
  CreditCard,
  AlertTriangle,
  MessageSquare,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Heart,
  Zap,
  UserCheck,
  Eye,
  Ban,
  HelpCircle,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

/* ============================================================
   AMORA HELP CENTER
   Where questions find their answers. No em dashes anywhere.
   ============================================================ */

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { icon: Sparkles, label: "Matching", color: "text-rose-400", bg: "bg-rose-500/10" },
    { icon: Shield, label: "Safety", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { icon: Settings, label: "Account", color: "text-sky-400", bg: "bg-sky-500/10" },
    { icon: CreditCard, label: "Billing", color: "text-amber-400", bg: "bg-amber-500/10" },
    { icon: Ban, label: "Reporting", color: "text-rose-400", bg: "bg-rose-500/10" },
    { icon: HelpCircle, label: "General", color: "text-violet-400", bg: "bg-violet-500/10" },
  ];

  const faqs = [
    {
      icon: Sparkles,
      category: "Matching",
      q: "How does Amora's matching actually work?",
      a: "We score compatibility across shared interests, lifestyle habits, relationship goals, and distance, then show you the highest-scoring profiles first. You can see your compatibility percentage with each person, along with a short explanation of why you were matched. Our AI learns from your preferences over time, so the more you use Amora, the better your matches become.",
    },
    {
      icon: UserCheck,
      category: "Safety",
      q: "How do I get verified?",
      a: "Go to your Profile settings and start photo verification. You will be asked to take a live selfie that is compared against your uploaded photos using facial recognition. Once approved, a blue verified badge appears on your profile. Verified users get up to 3x more matches because trust is magnetic.",
    },
    {
      icon: Eye,
      category: "Account",
      q: "Can I change who can see my profile?",
      a: "Yes. Under Preferences you can control your visibility, age range, distance range, and who can see you. Turning off discoverable hides you from new matches while keeping existing conversations open. You can also use Incognito mode (Premium) to browse without appearing in others' feeds.",
    },
    {
      icon: CreditCard,
      category: "Billing",
      q: "How do I cancel a subscription?",
      a: "Subscriptions purchased through the Apple App Store or Google Play are managed through your device's subscription settings, not inside Amora directly, per store policy. Subscriptions purchased via PayPal or crypto can be cancelled from your Amora account settings under Billing. You keep all paid features until the end of your billing period.",
    },
    {
      icon: AlertTriangle,
      category: "Reporting",
      q: "Someone is bothering me. What do I do?",
      a: "Open their profile or your conversation with them and tap Report or Block. Blocking is immediate and mutual: they cannot contact you and you disappear from each other's discovery feeds. Our moderation team reviews every report within 24 hours. For urgent safety concerns, see our Safety page or contact local authorities.",
    },
    {
      icon: HelpCircle,
      category: "General",
      q: "I think I was charged incorrectly.",
      a: "We are sorry for the confusion. Reach out via the Contact page with your account email and approximate charge date, and we will investigate immediately. If we made a mistake, we will refund you within 5 business days. No hoops to jump through.",
    },
  ];

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <StaticPage
      eyebrow={
        <span className="inline-flex items-center gap-2 text-amora-400 text-sm font-medium tracking-wider uppercase">
          <LifeBuoy className="w-4 h-4" />
          Help Center
        </span>
      }
      title="We Have Answers"
      subtitle="Everything you need to know about finding love on Amora. If you cannot find it here, we are just one message away."
    >
      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mb-12"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight-500" />
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-midnight-500 focus:outline-none focus:border-amora-500/50 focus:bg-white/[0.05] transition-all duration-300"
          />
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-wrap gap-3 mb-16"
      >
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() =>
              setSearchQuery(cat.label === searchQuery ? "" : cat.label)
            }
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              searchQuery === cat.label
                ? "bg-amora-500/20 text-amora-300 border border-amora-500/30"
                : "bg-white/[0.03] text-midnight-400 border border-white/5 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <cat.icon className={`w-4 h-4 ${cat.color}`} />
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* FAQs */}
      <div className="space-y-3 mb-16">
        <AnimatePresence>
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <button
                onClick={() => toggleFaq(index)}
                className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${
                  openIndex === index
                    ? "bg-white/[0.04] border-white/10"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.03] hover:border-white/10"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                      openIndex === index ? "bg-amora-500/20" : "bg-white/5"
                    }`}
                  >
                    <faq.icon
                      className={`w-5 h-5 transition-colors duration-300 ${
                        openIndex === index ? "text-amora-400" : "text-midnight-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h3
                        className={`font-semibold transition-colors duration-300 ${
                          openIndex === index ? "text-white" : "text-midnight-200 group-hover:text-white"
                        }`}
                      >
                        {faq.q}
                      </h3>
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          openIndex === index
                            ? "bg-amora-500/20 text-amora-400"
                            : "bg-white/5 text-midnight-500"
                        }`}
                      >
                        {openIndex === index ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                    <AnimatePresence>
                      {openIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="text-midnight-400 leading-relaxed pt-4 text-[15px]">
                            {faq.a}
                          </p>
                          <div className="pt-3">
                            <span className="inline-flex items-center gap-1.5 text-xs text-midnight-500 bg-white/5 px-3 py-1 rounded-full">
                              <Zap className="w-3 h-3" />
                              {faq.category}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredFaqs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Search className="w-12 h-12 text-midnight-700 mx-auto mb-4" />
            <p className="text-midnight-400 text-lg mb-2">No results found</p>
            <p className="text-midnight-500 text-sm">
              Try a different search term or browse by category above.
            </p>
          </motion.div>
        )}
      </div>

      {/* Still Need Help */}
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
              <MessageSquare className="w-6 h-6 text-amora-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Still Need Help?</h3>
              <p className="text-midnight-400 text-sm leading-relaxed max-w-lg">
                Our support team is here for you. Average response time is under 4 hours during business days.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 bg-white text-midnight-950 font-semibold px-6 py-3 rounded-full hover:shadow-lg hover:shadow-white/10 hover:scale-105 transition-all duration-300"
            >
              <Mail className="w-4 h-4" />
              Contact Us
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/safety"
              className="inline-flex items-center gap-2 border border-white/10 text-midnight-300 font-medium px-6 py-3 rounded-full hover:bg-white/5 hover:text-white transition-all duration-300"
            >
              <Shield className="w-4 h-4" />
              Safety Center
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <Zap className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl font-bold">Quick Tips</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              icon: Heart,
              title: "Complete Your Profile",
              desc: "Profiles with 6+ photos and a detailed bio get 5x more matches.",
            },
            {
              icon: UserCheck,
              title: "Get Verified",
              desc: "Verified badges increase trust and match rates by up to 300%.",
            },
            {
              icon: Sparkles,
              title: "Use Smart Icebreakers",
              desc: "Let our AI suggest personalized opening lines based on shared interests.",
            },
          ].map((tip, index) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-amora-500/10 flex items-center justify-center mb-4 group-hover:bg-amora-500/20 group-hover:scale-110 transition-all duration-300">
                <tip.icon className="w-5 h-5 text-amora-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{tip.title}</h3>
              <p className="text-sm text-midnight-400 leading-relaxed">{tip.desc}</p>
            </motion.div>
          ))}
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
            We are here to help you find love, not frustration
          </span>
        </div>
      </motion.div>
    </StaticPage>
  );
}
