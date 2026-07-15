import { StaticPage } from '../../components/StaticPage';
import { Briefcase, Mail } from 'lucide-react';

export default function CareersPage() {
  return (
    <StaticPage
      eyebrow={<><Briefcase className="w-4 h-4" /> Careers</>}
      title="Build the future of meaningful connection"
      subtitle="Amora is a small, early-stage team right now — which means there's no open positions board yet, but that's changing as we grow."
    >
      <p>
        We're not a big company with a formal hiring pipeline yet. Right now Amora is built and run
        by a small, hands-on team, which means every early hire will shape the product and culture in
        a way that isn't possible once a company is 200 people deep.
      </p>

      <h2 className="text-2xl font-bold text-white pt-4">What we'll be looking for</h2>
      <p>
        As we grow, we'll be looking for people across product engineering, trust &amp; safety,
        mobile development, and design — people who care as much about doing right by users as they
        do about shipping fast.
      </p>

      <h2 className="text-2xl font-bold text-white pt-4">Interested early?</h2>
      <p>
        There's no formal application process yet, but if you're excited about what we're building
        and want to be first in line when roles open up, reach out via the{' '}
        <a href="/contact" className="text-amora-400 hover:underline inline-flex items-center gap-1">
          Contact page <Mail className="w-3.5 h-3.5" />
        </a>{' '}
        and tell us what you'd want to work on.
      </p>
    </StaticPage>
  );
}
