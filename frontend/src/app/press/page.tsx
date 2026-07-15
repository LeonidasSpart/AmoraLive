import { StaticPage } from '../../components/StaticPage';
import { Newspaper, Download, Mail } from 'lucide-react';

export default function PressPage() {
  return (
    <StaticPage
      eyebrow={<><Newspaper className="w-4 h-4" /> Press</>}
      title="Press &amp; media"
      subtitle="Writing about Amora, or considering it? Here's what you need."
    >
      <h2 className="text-2xl font-bold text-white pt-4">About Amora</h2>
      <p>
        Amora is an AI-assisted dating platform focused on compatibility-driven matching rather than
        endless swiping. It combines interest, lifestyle, and values-based scoring with real-time
        messaging and identity verification to help people build genuine connections.
      </p>

      <h2 className="text-2xl font-bold text-white pt-4">Brand assets</h2>
      <div className="glass-card p-6 rounded-2xl not-prose flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Download className="w-5 h-5 text-amora-400" />
          <span className="text-sm text-midnight-300">Logo pack &amp; brand guidelines — available on request</span>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white pt-4">Media inquiries</h2>
      <p>
        For interviews, data requests, or anything else press-related, reach out via the{' '}
        <a href="/contact" className="text-amora-400 hover:underline inline-flex items-center gap-1">
          Contact page <Mail className="w-3.5 h-3.5" />
        </a>{' '}
        and we'll get back to you as quickly as we can — we're a small team, so please bear with us
        on response times.
      </p>
    </StaticPage>
  );
}
