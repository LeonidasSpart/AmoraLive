"use client";

import { StaticPage } from '../../components/StaticPage';
import {
  Briefcase,
  Mail,
  Heart,
  Sparkles,
  Rocket,
  Users,
  Code2,
  ShieldCheck,
  Smartphone,
  Palette,
  ArrowRight,
  Zap,
  Globe,
  Target,
  Star,
  Coffee,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

/* ============================================================
   AMORA CAREERS PAGE
   Where builders find their home. No em dashes anywhere.
   ============================================================ */

export default function CareersPage() {
  const roles = [
    {
      icon: Code2,
      title: "Product Engineering",
      description: "Full-stack engineers who care about performance, accessibility, and building features that genuinely help people connect.",
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
      gradient: "from-sky-500/10 to-blue-500/10",
    },
    {
      icon: ShieldCheck,
      title: "Trust & Safety",
      description: "Engineers and analysts who build the systems that keep our community safe: moderation tools, fraud detection, and verification pipelines.",
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      gradient: "from-rose-500/10 to-red-500/10",
    },
    {
      icon: Smartphone,
      title: "Mobile Development",
      description: "iOS and Android engineers who obsess over smooth animations, battery efficiency, and the feeling of a native app that just works.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      gradient: "from-emerald-500/10 to-teal-500/10",
    },
    {
      icon: Palette,
      title: "Product Design",
      description: "Designers who understand that dating apps are emotional products. Every pixel, every transition, every micro-interaction matters.",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      gradient: "from-amber-500/10 to-orange-500/10",
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Users First, Always",
      description: "Every decision starts with: does this help someone find real connection? If not, we do not build it.",
    },
    {
      icon: Target,
      title: "Ship with Intention",
      description: "We move fast, but never recklessly. Quality over quantity. One great feature beats ten mediocre ones.",
    },
    {
      icon: Users,
      title: "Small Team, Big Impact",
      description: "Every person here shapes the product and culture. There are no passengers. Only builders.",
    },
    {
      icon: Globe,
      title: "Remote by Default",
      description: "Work from where you thrive. We are async-first and trust you to manage your time and energy.",
    },
    {
      icon: Sparkles,
      title: "Learn in Public",
      description: "We share our wins, our failures, and our learnings. Transparency is not a policy here. It is a habit.",
    },
    {
      icon: Coffee,
      title: "Sustainable Pace",
      description: "Building for the long haul means protecting your energy. No heroics. No burnout culture. Just consistent, meaningful work.",
    },
  ];

  return (
    <StaticPage
      eyebrow={
        <span className="inline-flex items-center gap-2 text-amora-400 text-sm font-medium tracking-wider uppercase">
          <Briefcase className="w-4 h-4" />
          Careers
        </span>
      }
      title="Build Something That Matters"
      subtitle="We are not hiring hundreds of people. We are looking for a few who care deeply about connection, craft, and doing right by the people we serve."
    >
      {/* Hero belief */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amora-900/30 via-midnight-900/50 to-violet-900/20 border border-amora-500/10 p-8 sm:p-12 mb-20"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amora-500/5 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-3xl">
          <Rocket className="w-10 h-10 text-amora-400 mb-6" />
          <p className="text-xl sm:text-2xl font-light text-white/90 leading-relaxed mb-6">
            "Amora is still small enough that every person here shapes what it becomes. If you join now, you are not filling a seat. You are building the foundation."
          </p>
          <div className="flex flex-wrap items-center gap-6 text-sm text-midnight-400">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amora-400" />
              <span>Small, tight-knit team</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Remote-first, async-friendly</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Meaningful equity for early team</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* The Opportunity */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <Zap className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">What We Are Building</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 sm:p-10"
        >
          <p className="text-midnight-200 leading-relaxed text-[15px] mb-8">
            We are not a big company with a formal hiring pipeline yet. Right now Amora is built and run by a small, hands-on team, which means every early hire will shape the product and culture in a way that is not possible once a company is 200 people deep. You will own features end to end. You will talk to users directly. You will see the impact of your work in real time.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {roles.map((role, index) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`group relative overflow-hidden rounded-2xl border ${role.border} bg-gradient-to-br ${role.gradient} p-6 transition-all duration-500 hover:border-white/20`}
              >
                <div className="relative z-10">
                  <div className={`w-10 h-10 ${role.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <role.icon className={`w-5 h-5 ${role.color}`} />
                  </div>
                  <h3 className="font-semibold text-white mb-2 group-hover:text-amora-300 transition-colors">
                    {role.title}
                  </h3>
                  <p className="text-sm text-midnight-400 leading-relaxed">
                    {role.description}
                  </p>
                </div>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/3 rounded-full blur-3xl group-hover:bg-white/5 transition-colors duration-500" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Values */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <Heart className="w-5 h-5 text-amora-400" />
          <h2 className="text-2xl sm:text-3xl font-bold">How We Work</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-amora-500/10 flex items-center justify-center mb-4 group-hover:bg-amora-500/20 group-hover:scale-110 transition-all duration-300">
                <value.icon className="w-5 h-5 text-amora-400" />
              </div>
              <h3 className="font-semibold text-white mb-2 group-hover:text-amora-300 transition-colors">
                {value.title}
              </h3>
              <p className="text-sm text-midnight-400 leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

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
              <Mail className="w-6 h-6 text-amora-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Interested Early?</h3>
              <p className="text-midnight-400 text-sm leading-relaxed max-w-lg">
                There is no formal application process yet, but if you are excited about what we are building and want to be first in line when roles open up, tell us what you would want to work on. We read every message.
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
        className="text-center"
      >
        <div className="inline-flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-full px-6 py-3">
          <Sparkles className="w-4 h-4 text-midnight-500" />
          <span className="text-sm text-midnight-400">
            Great things are built by small teams who care
          </span>
        </div>
      </motion.div>
    </StaticPage>
  );
}
