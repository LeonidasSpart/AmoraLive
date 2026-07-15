import { MarketingHeader } from './MarketingHeader';
import { MarketingFooter } from './MarketingFooter';

export function StaticPage({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-midnight-950 text-white">
      <MarketingHeader />
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 bg-amora-500/10 border border-amora-500/20 rounded-full px-4 py-2 mb-6 text-sm text-amora-300">
              {eyebrow}
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{title}</h1>
          {subtitle && <p className="text-lg text-midnight-300 mb-12 leading-relaxed">{subtitle}</p>}
          <div className="prose-content space-y-6 text-midnight-300 leading-relaxed">{children}</div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
