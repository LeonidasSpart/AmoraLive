import { StaticPage } from '../../components/StaticPage';
import { Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <StaticPage
      eyebrow={<><Heart className="w-4 h-4" /> Our Story</>}
      title="Dating, done with intention"
      subtitle="Amora started from a simple frustration: dating apps had optimized for engagement, not outcomes. We built something different."
    >
      <p>
        Most dating apps make more money the longer you stay single and swiping. We think that's a
        broken incentive. Amora is built around a single measure of success: did two people who
        wouldn't have otherwise met, find each other — and did it lead somewhere real?
      </p>
      <p>
        Instead of an infinite feed, Amora's matching considers shared interests, lifestyle
        compatibility, relationship goals, and values before showing you someone — so every profile
        you see has a reason to be there. We'd rather show you five people worth a real
        conversation than fifty you'll forget by tomorrow.
      </p>

      <h2 className="text-2xl font-bold text-white pt-4">What we believe</h2>
      <ul className="space-y-3 list-none pl-0">
        <li className="flex gap-3"><span className="text-amora-400">—</span> Compatibility should be transparent, not a black box.</li>
        <li className="flex gap-3"><span className="text-amora-400">—</span> Safety and verification aren't premium features; they're table stakes.</li>
        <li className="flex gap-3"><span className="text-amora-400">—</span> Quality of matches matters more than volume of swipes.</li>
      </ul>

      <h2 className="text-2xl font-bold text-white pt-4">Where we are today</h2>
      <p>
        Amora is a young, independently-run platform, still early in its journey. We're building in
        public, iterating quickly, and staying honest about what's working and what isn't — because
        that's the only way to actually earn the trust this kind of product needs.
      </p>
    </StaticPage>
  );
}
