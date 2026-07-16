"use client";

import { StaticPage } from '../../components/StaticPage';
import {
  Shield,
  Eye,
  MessageSquareWarning,
  MapPin,
  Ban,
  Phone,
  CheckCircle2,
  Heart,
  AlertTriangle,
  Lock,
  UserCheck,
  Fingerprint,
  Bell,
  ArrowRight,
  Sparkles,
  Users,
  Siren,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

/* ============================================================
   AMORA SAFETY PAGE
   Where protection meets poetry. No em dashes anywhere.
   ============================================================ */

export default function SafetyPage() {
  const tips = [
    {
      icon: Eye,
      title: "Verify Before You Trust",
      body: "Look for the blue verified badge on every profile. It means that person passed photo verification, identity checks, and background screening. When in doubt, request a quick video call inside the app before sharing anything personal.",
      stat: "98% of verified users report feeling safer",
      color: "from-sky-500/10 to-blue-500/10",
      iconBg: "bg-sky-500/10",
      iconColor: "text-sky-400",
    },
    {
      icon: MapPin,
      title: "Meet in the Light",
      body: "Always choose a public place for a first date. Arrange your own transportation. Share your plans (who, where, when) with someone you trust. Trust is earned in daylight, not darkness.",
      stat: "First dates in public spaces are 4x safer",
      color: "from-emerald-500/10 to-teal-500/10",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
    },
    {
      icon: MessageSquareWarning,
      title: "Stay Inside the Walls",
      body: "Scammers often rush you off the app to text or another platform. Amora's messaging includes AI moderation, scam detection, and a complete conversation history that off-platform chats simply cannot offer. Your safety lives here.",
      stat: "Scam attempts drop 73% when users stay in-app",
      color: "from-amber-500/10 to-orange-500/10",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
    },
    {
      icon: Ban,
      title: "Money Is a Red Line",
      body: "No genuine match will ever ask you for money, gift cards, or cryptocurrency. Not for an emergency. Not for a plane ticket. Not for any story, no matter how convincing. Report and block immediately. Your kindness is not a weakness to exploit.",
      stat: "Zero tolerance. Every report is investigated within 24 hours.",
      color: "from-rose-500/10 to-red-500/10",
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-400",
    },
  ];

  const protections = [
    {
      icon: Fingerprint,
      title: "Photo Verification",
      description: "Every verified user submits a live selfie that our AI compares against their uploaded photos. No filters, no catfishing, no exceptions.",
    },
    {
      icon: UserCheck,
      title: "Identity Screening",
      description: "We cross-reference identity documents against global databases to ensure every person is who they claim to be.",
    },
    {
      icon: Lock,
      title: "Background Checks",
      description: "Where legally permitted, we run background screenings to flag serious criminal history before someone enters your discovery feed.",
    },
    {
      icon: Bell,
      title: "Real-Time Moderation",
      description: "Our AI monitors conversations for harassment, scams, and harmful behavior 24/7. Human moderators review flagged content within minutes.",
    },
    {
      icon: Shield,
      title: "Instant Blocking",
      description: "Block anyone, anytime, for any reason. The moment you block someone, all contact stops in both directions and they vanish from your world.",
    },
    {
      icon: Siren,
      title: "Emergency Response",
      description: "If you report a serious safety concern, our team responds within 2 hours. For immediate danger, we always direct you to local emergency services first.",
    },
  ];

  return (
    <StaticPage
      eyebrow={
        <span className="inline-flex items-center gap-2 text-amora-400 text-sm font-medium tracking-wider uppercase">
          <Shield className="w-4 h-4" />
          Trust &amp; Safety
        </span>
      }
      title="Your Safety Is Sacred"
      subtitle="We did not build safety features. We built a fortress around your heart."
    >
      {/* Hero belief statement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amora-900/30 via-midnight-900/50 to-rose-900/20 border border-amora-500/10 p-8 sm:p-12 mb-20"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amora-500/5 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-3xl">
          <Heart className="w-10 h-10 text-amora-400 mb-6 fill-amora-400/20" />
          <p className="text-xl sm:text-2xl font-light text-white/90 leading-relaxed mb-6">
            "The most intimate thing you can do is open your heart to a stranger. We take that responsibility with the gravity it deserves."
          </p>
          <p className="text-midnight-400 text-sm">
            Every decision we make at Amora starts with one question: does this make our users safer? If the answer is not an unqualified yes, we do not ship it.
          </p>
        </div>
      </motion.div>

      {/* Safety Tips */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <Sparkles className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">How to Protect Yourself</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {tips.map((tip, index) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br ${tip.color} p-8 hover:border-white/10 transition-all duration-500`}
            >
              <div className="relative z-10">
                <div className={`w-12 h-12 ${tip.iconBg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <tip.icon className={`w-6 h-6 ${tip.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-white transition-colors">
                  {tip.title}
                </h3>
                <p className="text-midnight-300 leading-relaxed mb-5 text-[15px]">
                  {tip.body}
                </p>
                <div className="inline-flex items-center gap-2 bg-white/5 rounded-full px-4 py-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-emerald-300 font-medium">{tip.stat}</span>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/3 rounded-full blur-3xl group-hover:bg-white/5 transition-colors duration-500" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* What Amora Does */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <Lock className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">What We Do for You</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {protections.map((item, index) => (
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

      {/* Trust Your Gut */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-900/20 via-midnight-900/50 to-amber-900/10 border border-rose-500/10 p-8 sm:p-12 mb-16"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[100px]" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-7 h-7 text-rose-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Trust Your Instincts</h2>
            <p className="text-midnight-200 leading-relaxed mb-4 text-[15px]">
              If a conversation or a person makes you uncomfortable, you do not owe anyone an explanation. Block and report them from their profile or from the conversation directly. Your intuition is one of your most powerful safety tools.
            </p>
            <p className="text-midnight-400 text-sm leading-relaxed">
              If you are ever in immediate danger, contact local emergency services first. Amora is here to support you, but your physical safety is always the priority.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Report CTA */}
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
              <Phone className="w-6 h-6 text-amora-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Need to Report Something?</h3>
              <p className="text-midnight-400 text-sm leading-relaxed max-w-lg">
                Use the report button on any profile or message. Our safety team reviews every report within 24 hours. For urgent concerns, we respond within 2 hours.
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 bg-white text-midnight-950 font-semibold px-6 py-3 rounded-full hover:shadow-lg hover:shadow-white/10 hover:scale-105 transition-all duration-300 flex-shrink-0"
          >
            Contact Safety Team
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
          <Users className="w-4 h-4 text-midnight-500" />
          <span className="text-sm text-midnight-400">
            Trusted by <span className="text-white font-medium">2.5 million</span> people looking for real connection
          </span>
        </div>
      </motion.div>
    </StaticPage>
  );
}
