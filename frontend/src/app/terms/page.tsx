import { StaticPage } from '../../components/StaticPage';
import { FileText, Shield, AlertTriangle, CreditCard, Image, HeartCrack, Ban, Scale, RefreshCw, CheckCircle2, Lock, Globe, Gavel } from 'lucide-react';
import Link from 'next/link';

/* ============================================================
   AMORA TERMS OF SERVICE
   Legal clarity wrapped in warmth. No em dashes anywhere.
   ============================================================ */

export default function TermsPage() {
  const sections = [
    {
      number: "01",
      icon: Shield,
      title: "Who Can Join",
      content: `You must be at least 18 years old to use Amora. By creating an account, you confirm that you meet this requirement and that every piece of information you provide is truthful and accurate. We built this community on authenticity, and that starts with you.`,
      highlight: "18+ only. One account per person.",
    },
    {
      number: "02",
      icon: Lock,
      title: "Your Account",
      content: `You are responsible for keeping your login credentials secure and for all activity that occurs under your account. One person may hold only one account. Impersonation, fake profiles, and bot accounts are strictly prohibited and will result in immediate termination.`,
      highlight: "Keep your credentials safe. Be you, and only you.",
    },
    {
      number: "03",
      icon: AlertTriangle,
      title: "Playing Fair",
      content: `You agree not to harass other users, post unlawful or sexually explicit content involving minors (which will be reported to relevant authorities without exception), solicit money or commercial activity, or attempt to circumvent our safety and moderation systems. We take violations seriously. Accounts that breach these rules may be suspended or permanently terminated, with or without notice.`,
      highlight: "Respect is non-negotiable. Safety is everyone's job.",
    },
    {
      number: "04",
      icon: CreditCard,
      title: "Subscriptions & Payments",
      content: `Paid tiers (Plus, Premium) renew automatically until you cancel. Subscriptions purchased through the Apple App Store or Google Play are billed and managed by Apple or Google under their respective terms. Subscriptions purchased directly through PayPal or crypto can be managed within your Amora account settings. Fees are generally non-refundable except where required by law.`,
      highlight: "Cancel anytime. No hidden fees. No surprises.",
    },
    {
      number: "05",
      icon: Image,
      title: "What You Share",
      content: `You retain full ownership of the photos, bio, and messages you post. By sharing them on Amora, you grant us a limited license to display and process that content as needed to operate the service: showing your profile to potential matches, running verification checks, and keeping the platform safe. You can delete your content and account at any time.`,
      highlight: "Your content is yours. We just borrow it to make magic happen.",
    },
    {
      number: "06",
      icon: HeartCrack,
      title: "We Cannot Promise Love",
      content: `Amora helps facilitate introductions. We do not guarantee compatibility, the safety of any individual you meet, or any particular relationship outcome. You are responsible for your own judgment and safety when interacting with and meeting other users. Please review our `,
      link: { href: "/safety", text: "Safety page" },
      contentAfter: ` for practical guidance on staying safe while dating.`,
      highlight: "We open doors. You choose which ones to walk through.",
    },
    {
      number: "07",
      icon: Ban,
      title: "Ending the Journey",
      content: `You may delete your account at any time from your settings, no questions asked. We may also suspend or terminate accounts that violate these terms, pose a safety risk to our community, or as required by law. If we take action against your account, we will do our best to explain why.`,
      highlight: "Leave whenever you want. We will be here if you come back.",
    },
    {
      number: "08",
      icon: Scale,
      title: "Our Responsibility to You",
      content: `Amora is provided "as is." To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the service. We do everything in our power to build a safe, reliable platform, but no technology is perfect.`,
      highlight: "We are human. So is our code. We try our best every day.",
    },
    {
      number: "09",
      icon: RefreshCw,
      title: "Evolving Together",
      content: `We may update these terms from time to time as our service grows and laws change. If we make material changes, we will notify you via email or an in-app notice before they take effect. Continued use of Amora after changes take effect constitutes acceptance of the updated terms.`,
      highlight: "We will always tell you what changed and why.",
    },
  ];

  return (
    <StaticPage
      eyebrow={
        <span className="inline-flex items-center gap-2 text-amora-400 text-sm font-medium tracking-wider uppercase">
          <FileText className="w-4 h-4" />
          Terms of Service
        </span>
      }
      title="The Rules of the Heart"
      subtitle="Last updated: July 2026"
    >
      {/* Intro */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 mb-16">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amora-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Globe className="w-5 h-5 text-amora-400" />
          </div>
          <div>
            <p className="text-midnight-200 leading-relaxed mb-3">
              These terms are not just legal boilerplate. They are the foundation of trust between us and every person who opens their heart on Amora. We have written them to be read, understood, and respected. If anything feels unclear, <Link href="/contact" className="text-amora-400 hover:text-amora-300 transition-colors underline underline-offset-2">reach out</Link>. We are happy to talk it through.
            </p>
            <p className="text-midnight-500 text-sm">
              By using Amora, you agree to these terms. If you do not agree, please do not use the service.
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-12">
        {sections.map((section, index) => (
          <motion.section
            key={section.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            className="group"
          >
            <div className="flex items-start gap-6">
              {/* Number & Icon */}
              <div className="flex flex-col items-center gap-3 flex-shrink-0 w-16">
                <span className="text-3xl font-bold text-midnight-700 group-hover:text-amora-500/30 transition-colors duration-500">
                  {section.number}
                </span>
                <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-amora-500/10 flex items-center justify-center transition-colors duration-300">
                  <section.icon className="w-5 h-5 text-midnight-500 group-hover:text-amora-400 transition-colors duration-300" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 group-hover:text-amora-300 transition-colors duration-300">
                  {section.title}
                </h2>
                <p className="text-midnight-300 leading-relaxed mb-4">
                  {section.content}
                  {section.link && (
                    <>
                      <Link
                        href={section.link.href}
                        className="text-amora-400 hover:text-amora-300 transition-colors underline underline-offset-2"
                      >
                        {section.link.text}
                      </Link>
                      {section.contentAfter}
                    </>
                  )}
                </p>
                <div className="inline-flex items-center gap-2 bg-amora-500/5 border border-amora-500/10 rounded-full px-4 py-2">
                  <CheckCircle2 className="w-4 h-4 text-amora-400 flex-shrink-0" />
                  <span className="text-sm text-amora-300 font-medium">{section.highlight}</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            {index < sections.length - 1 && (
              <div className="ml-16 mt-12 border-b border-white/5" />
            )}
          </motion.section>
        ))}
      </div>

      {/* Closing */}
      <div className="mt-20 bg-gradient-to-r from-amora-900/20 to-rose-900/10 border border-amora-500/10 rounded-2xl p-8 text-center">
        <Gavel className="w-8 h-8 text-amora-400 mx-auto mb-4" />
        <p className="text-midnight-200 leading-relaxed max-w-2xl mx-auto">
          These terms exist to protect you, us, and the beautiful community we are building together. If you ever feel something here is unfair or unclear, we want to hear from you. <Link href="/contact" className="text-amora-400 hover:text-amora-300 transition-colors underline underline-offset-2">Talk to us</Link>.
        </p>
      </div>
    </StaticPage>
  );
}
