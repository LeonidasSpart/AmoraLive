import { StaticPage } from '../../components/StaticPage';
import { Shield, Eye, MessageSquareWarning, MapPin, Ban, Phone } from 'lucide-react';

const tips = [
  {
    icon: Eye,
    title: 'Verify before you meet',
    body: 'Look for the verified badge on a profile before getting invested. Video chat within the app before exchanging personal contact details or agreeing to meet.',
  },
  {
    icon: MapPin,
    title: 'Meet in public, tell a friend',
    body: 'Always choose a public place for a first date, arrange your own transportation, and share your plans (who, where, when) with someone you trust.',
  },
  {
    icon: MessageSquareWarning,
    title: 'Keep conversations in the app',
    body: "Scammers often push to move to text or another platform quickly. Amora's messaging includes moderation tools that off-platform chats don't.",
  },
  {
    icon: Ban,
    title: "Never send money to someone you haven't met",
    body: 'No legitimate match will ask you for money, gift cards, or crypto — regardless of the story. Report and block immediately if this happens.',
  },
];

export default function SafetyPage() {
  return (
    <StaticPage
      eyebrow={<><Shield className="w-4 h-4" /> Trust &amp; Safety</>}
      title="Your safety comes first"
      subtitle="Amora is built with verification, moderation, and reporting tools baked into the core product — not bolted on afterward. Here's how we protect you, and how you can protect yourself."
    >
      <div className="grid sm:grid-cols-2 gap-6 not-prose mb-12">
        {tips.map((tip) => (
          <div key={tip.title} className="glass-card p-6 rounded-2xl">
            <div className="w-10 h-10 bg-amora-500/10 rounded-xl flex items-center justify-center mb-4">
              <tip.icon className="w-5 h-5 text-amora-400" />
            </div>
            <h3 className="font-semibold mb-2">{tip.title}</h3>
            <p className="text-sm text-midnight-400 leading-relaxed">{tip.body}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-white pt-4">What Amora does on our end</h2>
      <p>
        Every profile can complete photo verification, which compares a live selfie against uploaded
        photos before a verified badge is granted. Reported accounts are reviewed by our moderation
        team, and repeated or severe violations result in permanent bans. Blocking a user immediately
        prevents further contact in both directions and removes you from each other's discovery feed.
      </p>

      <h2 className="text-2xl font-bold text-white pt-4">If something feels wrong</h2>
      <p>
        Trust your instincts. If a conversation or a person makes you uncomfortable, you don't owe
        anyone an explanation — block and report them from their profile or from the conversation
        directly. If you're ever in immediate danger, contact local emergency services first.
      </p>

      <div className="glass-card p-6 rounded-2xl not-prose flex items-start gap-4 mt-8">
        <Phone className="w-5 h-5 text-amora-400 mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-semibold mb-1">Need to report something urgently?</h3>
          <p className="text-sm text-midnight-400">
            Use the report button on any profile or message, or reach our safety team directly via the{' '}
            <a href="/contact" className="text-amora-400 hover:underline">Contact page</a>.
          </p>
        </div>
      </div>
    </StaticPage>
  );
}
