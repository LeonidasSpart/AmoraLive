"use client";

import { StaticPage } from '../../components/StaticPage';
import {
  Mail,
  ShieldAlert,
  HelpCircle,
  Briefcase,
  Heart,
  MessageSquare,
  Send,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

/* ============================================================
   AMORA CONTACT PAGE
   Where conversations begin. No em dashes anywhere.
   ============================================================ */

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const channels = [
    {
      icon: HelpCircle,
      title: "General Support",
      description: "Account issues, billing questions, feature requests, or anything covered in the Help Center.",
      email: "support@amora.app",
      response: "Within 24 hours",
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
      gradient: "from-sky-500/10 to-blue-500/10",
    },
    {
      icon: ShieldAlert,
      title: "Trust & Safety",
      description: "Report a serious safety concern, harassment, or an urgent issue with another user. This goes straight to our safety team.",
      email: "safety@amora.app",
      response: "Within 2 hours",
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      gradient: "from-rose-500/10 to-red-500/10",
    },
    {
      icon: Briefcase,
      title: "Press & Partnerships",
      description: "Media inquiries, interview requests, careers interest, or business partnerships and collaborations.",
      email: "hello@amora.app",
      response: "Within 48 hours",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      gradient: "from-amber-500/10 to-orange-500/10",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <StaticPage
      eyebrow={
        <span className="inline-flex items-center gap-2 text-amora-400 text-sm font-medium tracking-wider uppercase">
          <Mail className="w-4 h-4" />
          Contact
        </span>
      }
      title="Let's Talk"
      subtitle="Whether you need help, want to report something, or just have a great idea, we are here. Every message is read by a real human."
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
          <Heart className="w-10 h-10 text-amora-400 mb-6" />
          <p className="text-xl sm:text-2xl font-light text-white/90 leading-relaxed mb-6">
            "We are a small team with big hearts. When you reach out, you are not talking to a bot or a ticket system. You are talking to us."
          </p>
          <div className="flex flex-wrap items-center gap-6 text-sm text-midnight-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amora-400" />
              <span>Average response: under 4 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Every message is read</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Safety issues prioritized</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact Channels */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <MessageSquare className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">How to Reach Us</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {channels.map((channel, index) => (
            <motion.div
              key={channel.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`group relative overflow-hidden rounded-2xl border ${channel.border} bg-gradient-to-br ${channel.gradient} p-8 hover:border-white/20 transition-all duration-500`}
            >
              <div className="relative z-10">
                <div className={`w-12 h-12 ${channel.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <channel.icon className={`w-6 h-6 ${channel.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{channel.title}</h3>
                <p className="text-midnight-300 leading-relaxed text-[15px] mb-5">
                  {channel.description}
                </p>
                <a
                  href={`mailto:${channel.email}`}
                  className={`inline-flex items-center gap-2 text-sm font-semibold ${channel.color} hover:opacity-80 transition-opacity group/link`}
                >
                  <Mail className="w-4 h-4" />
                  {channel.email}
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </a>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-midnight-500">
                    <Clock className="w-3 h-3" />
                    <span>Response time: {channel.response}</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/3 rounded-full blur-3xl group-hover:bg-white/5 transition-colors duration-500" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <Send className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">Send a Message</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 sm:p-10"
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Message Sent</h3>
              <p className="text-midnight-400 max-w-md mx-auto">
                Thank you for reaching out. We have received your message and will get back to you as soon as we can. In the meantime, you might find answers in our <Link href="/help" className="text-amora-400 hover:text-amora-300 transition-colors underline underline-offset-2">Help Center</Link>.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-midnight-500 focus:outline-none focus:border-amora-500/50 focus:bg-white/[0.05] transition-all duration-300"
                    placeholder="Sarah"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-midnight-500 focus:outline-none focus:border-amora-500/50 focus:bg-white/[0.05] transition-all duration-300"
                    placeholder="sarah@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-midnight-300 mb-2">
                  What is this about?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {["General Support", "Trust & Safety", "Billing", "Press", "Partnerships", "Other"].map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                          formData.category === cat
                            ? "bg-amora-500/20 text-amora-300 border border-amora-500/30"
                            : "bg-white/[0.03] text-midnight-400 border border-white/5 hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-midnight-300 mb-2">
                  Your Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-midnight-500 focus:outline-none focus:border-amora-500/50 focus:bg-white/[0.05] transition-all duration-300 resize-none"
                  placeholder="Tell us what is on your mind..."
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-midnight-500">
                  We typically respond within 24 hours. Safety concerns are prioritized.
                </p>
                <button
                  type="submit"
                  className="group inline-flex items-center gap-2 bg-white text-midnight-950 font-semibold px-8 py-3 rounded-full hover:shadow-lg hover:shadow-white/10 hover:scale-105 transition-all duration-300"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl font-bold">Before You Write</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              icon: HelpCircle,
              title: "Help Center",
              desc: "Find instant answers to common questions about matching, billing, and account settings.",
              href: "/help",
            },
            {
              icon: ShieldAlert,
              title: "Safety Center",
              desc: "Learn how to stay safe, report concerns, and understand our verification process.",
              href: "/safety",
            },
            {
              icon: Briefcase,
              title: "Press Kit",
              desc: "Download brand assets, read our story, and find media contact information.",
              href: "/press",
            },
          ].map((link, index) => (
            <motion.div
              key={link.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Link
                href={link.href}
                className="group block p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 h-full"
              >
                <div className="w-10 h-10 rounded-xl bg-amora-500/10 flex items-center justify-center mb-4 group-hover:bg-amora-500/20 group-hover:scale-110 transition-all duration-300">
                  <link.icon className="w-5 h-5 text-amora-400" />
                </div>
                <h3 className="font-semibold text-white mb-2 group-hover:text-amora-300 transition-colors">
                  {link.title}
                </h3>
                <p className="text-sm text-midnight-400 leading-relaxed mb-4">{link.desc}</p>
                <span className="inline-flex items-center gap-1 text-sm text-amora-400 group-hover:text-amora-300 transition-colors">
                  Visit
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
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
          <MapPin className="w-4 h-4 text-midnight-500" />
          <span className="text-sm text-midnight-400">
            Amora is built with love, everywhere
          </span>
        </div>
      </motion.div>
    </StaticPage>
  );
}
