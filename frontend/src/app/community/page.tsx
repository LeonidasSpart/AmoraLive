import { StaticPage } from '../../components/StaticPage';
import { Users, Heart, ShieldCheck, MessageCircle } from 'lucide-react';

const guidelines = [
  {
    icon: Heart,
    title: 'Be genuinely yourself',
    body: 'Use recent, real photos and write a profile that actually represents you. Misrepresentation erodes the trust the whole platform depends on.',
  },
  {
    icon: MessageCircle,
    title: 'Communicate with respect',
    body: 'Disagreement and rejection are part of dating. Harassment, hate speech, and unsolicited explicit content are not tolerated and result in an immediate ban.',
  },
  {
    icon: ShieldCheck,
    title: 'No commercial activity',
    body: 'Amora is for dating, not marketing. Promoting other services, soliciting payments, or running bots results in account removal.',
  },
  {
    icon: Users,
    title: 'One person, one account',
    body: 'Accounts must represent a single real person of legal age. Shared, fake, or duplicate accounts will be removed.',
  },
];

export default function CommunityPage() {
  return (
    <StaticPage
      eyebrow={<><Users className="w-4 h-4" /> Community Guidelines</>}
      title="The kind of community we're building"
      subtitle="Amora only works if the people on it can trust each other. These guidelines exist to protect that."
    >
      <div className="grid sm:grid-cols-2 gap-6 not-prose mb-10">
        {guidelines.map((g) => (
          <div key={g.title} className="glass-card p-6 rounded-2xl">
            <div className="w-10 h-10 bg-amora-500/10 rounded-xl flex items-center justify-center mb-4">
              <g.icon className="w-5 h-5 text-amora-400" />
            </div>
            <h3 className="font-semibold mb-2">{g.title}</h3>
            <p className="text-sm text-midnight-400 leading-relaxed">{g.body}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-white pt-4">Enforcement</h2>
      <p>
        Violations are reviewed case by case. Minor issues may result in a warning; serious or
        repeated violations — including harassment, scams, and fake profiles — result in permanent
        suspension. Decisions can be appealed via the Contact page.
      </p>
    </StaticPage>
  );
}
