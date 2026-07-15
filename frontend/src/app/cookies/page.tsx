import { StaticPage } from '../../components/StaticPage';
import { Cookie } from 'lucide-react';

const categories = [
  {
    name: 'Essential',
    required: true,
    body: 'Required for login sessions, security, and core site functionality. These can\u2019t be disabled without breaking the app.',
  },
  {
    name: 'Preferences',
    required: false,
    body: 'Remember settings like theme and language so you don\u2019t have to reconfigure them every visit.',
  },
  {
    name: 'Analytics',
    required: false,
    body: 'Help us understand aggregate usage patterns (e.g. which features are used most) so we can improve the product. Not used to individually target ads.',
  },
];

export default function CookiesPage() {
  return (
    <StaticPage
      eyebrow={<><Cookie className="w-4 h-4" /> Cookie Policy</>}
      title="Cookies &amp; similar technologies"
      subtitle="Last updated: July 2026"
    >
      <p>
        Amora uses cookies and similar local storage technologies to keep you logged in, remember
        your preferences, and understand how the product is used in aggregate. We do not use cookies
        to sell your data to third-party advertisers.
      </p>

      <div className="space-y-4 not-prose mt-8">
        {categories.map((c) => (
          <div key={c.name} className="glass-card p-6 rounded-2xl flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-white mb-1">{c.name}</h3>
              <p className="text-sm text-midnight-400 leading-relaxed">{c.body}</p>
            </div>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${
                c.required ? 'bg-midnight-800 text-midnight-300' : 'bg-amora-500/10 text-amora-400'
              }`}
            >
              {c.required ? 'Always on' : 'Optional'}
            </span>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-white pt-8">Managing cookies</h2>
      <p>
        Most browsers let you block or delete cookies through their settings. Blocking essential
        cookies will prevent you from staying logged in to Amora. Optional cookie categories can be
        adjusted from your account privacy settings.
      </p>
    </StaticPage>
  );
}
