import { StaticPage } from '../../components/StaticPage';
import { Mail, ShieldAlert, HelpCircle, Briefcase } from 'lucide-react';

const channels = [
  {
    icon: HelpCircle,
    title: 'General support',
    body: 'Account issues, billing questions, or anything covered in the Help Center.',
    email: 'support@amora.app',
  },
  {
    icon: ShieldAlert,
    title: 'Trust & safety',
    body: 'Report a serious safety concern or an urgent issue with another user.',
    email: 'safety@amora.app',
  },
  {
    icon: Briefcase,
    title: 'Press & partnerships',
    body: 'Media inquiries, careers interest, or business partnerships.',
    email: 'hello@amora.app',
  },
];

export default function ContactPage() {
  return (
    <StaticPage
      eyebrow={<><Mail className="w-4 h-4" /> Contact</>}
      title="Get in touch"
      subtitle="We're a small team, so please give us a little time to get back to you — but every message is read."
    >
      <div className="space-y-4 not-prose">
        {channels.map((c) => (
          
            key={c.title}
            href={`mailto:${c.email}`}
            className="glass-card p-6 rounded-2xl flex items-start gap-4 hover:border-amora-500/40 border border-transparent transition-colors"
          >
            <div className="w-10 h-10 bg-amora-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <c.icon className="w-5 h-5 text-amora-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{c.title}</h3>
              <p className="text-sm text-midnight-400 mb-1">{c.body}</p>
              <p className="text-sm text-amora-400">{c.email}</p>
            </div>
          </a>
        ))}
      </div>
    </StaticPage>
  );
}
