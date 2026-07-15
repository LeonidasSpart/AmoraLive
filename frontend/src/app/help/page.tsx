import { StaticPage } from '../../components/StaticPage';
import { LifeBuoy } from 'lucide-react';

const faqs = [
  {
    q: 'How does Amora\u2019s matching actually work?',
    a: 'We score compatibility across shared interests, lifestyle habits, relationship goals, and distance, and show you the highest-scoring profiles first. You can see your compatibility percentage with each person, along with a short explanation of why you were matched.',
  },
  {
    q: 'How do I get verified?',
    a: 'Go to your Profile settings and start photo verification. You\u2019ll be asked to take a live selfie that\u2019s compared against your uploaded photos. Verified profiles get a badge visible to others.',
  },
  {
    q: 'Can I change who can see my profile?',
    a: 'Yes — under Preferences you can control your visibility, age range, distance range, and who can see you. Turning off "discoverable" hides you from new matches while keeping existing conversations open.',
  },
  {
    q: 'How do I cancel a subscription?',
    a: 'Subscriptions purchased through the Apple App Store or Google Play are managed through your device\u2019s subscription settings, not inside Amora directly, per store policy. Subscriptions purchased via PayPal can be cancelled from your Amora account settings.',
  },
  {
    q: 'Someone is bothering me — what do I do?',
    a: 'Open their profile or your conversation with them and use the Report or Block option. Blocking is immediate and mutual. See our Safety page for more on how we handle reports.',
  },
  {
    q: 'I think I was charged incorrectly.',
    a: 'Reach out via the Contact page with your account email and approximate charge date, and we\u2019ll look into it.',
  },
];

export default function HelpPage() {
  return (
    <StaticPage
      eyebrow={<><LifeBuoy className="w-4 h-4" /> Help Center</>}
      title="How can we help?"
      subtitle="Answers to the questions we hear most. Can't find what you need? Reach out on the Contact page."
    >
      <div className="space-y-4 not-prose">
        {faqs.map((faq) => (
          <div key={faq.q} className="glass-card p-6 rounded-2xl">
            <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
            <p className="text-sm text-midnight-400 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}
