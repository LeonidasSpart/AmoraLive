import { StaticPage } from '../../components/StaticPage';
import { Lock } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <StaticPage
      eyebrow={<><Lock className="w-4 h-4" /> Privacy Policy</>}
      title="Privacy Policy"
      subtitle="Last updated: July 2026"
    >
      <p className="text-sm text-midnight-500 italic">
        This policy explains what we collect and why. It's written to be genuinely read, not just
        agreed to — though as with any dating platform handling personal and sensitive data, we'd
        recommend having this reviewed by qualified counsel before relying on it for launch in any
        specific jurisdiction (GDPR, CCPA, and similar frameworks impose specific requirements this
        draft covers at a general level).
      </p>

      <h2 className="text-2xl font-bold text-white pt-4">1. What we collect</h2>
      <p>
        <strong className="text-white">Account &amp; profile data:</strong> name, email, date of
        birth, gender, photos, bio, and preferences you provide when creating your profile.
      </p>
      <p>
        <strong className="text-white">Usage data:</strong> who you like, pass, match, and message —
        used to power matching and to keep the platform safe.
      </p>
      <p>
        <strong className="text-white">Location:</strong> approximate location, used to show nearby
        matches and calculate distance. You can disable precise location at any time; some matching
        quality may be affected.
      </p>
      <p>
        <strong className="text-white">Messages:</strong> content you send through Amora's chat is
        stored to deliver it and to allow moderation review in response to reports.
      </p>
      <p>
        <strong className="text-white">Payment data:</strong> we never see or store your full card
        number. Payments are processed by Apple, Google, PayPal, or on-chain crypto transactions
        directly, and we only retain the transaction record needed for support and refunds.
      </p>

      <h2 className="text-2xl font-bold text-white pt-4">2. How we use it</h2>
      <p>
        To operate core functionality (matching, messaging, verification), to keep the platform safe
        (fraud and abuse detection, responding to reports), to improve matching quality over time,
        and to communicate with you about your account. We do not sell your personal data to
        advertisers or data brokers.
      </p>

      <h2 className="text-2xl font-bold text-white pt-4">3. Who we share it with</h2>
      <p>
        Other users see the profile information you choose to make visible. Service providers
        (payment processors, cloud hosting, email delivery) process data on our behalf under
        contract. We disclose data to law enforcement only when legally required to do so.
      </p>

      <h2 className="text-2xl font-bold text-white pt-4">4. Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access, correct, export, or delete
        your personal data. You can delete your account and associated data from Settings at any
        time, or contact us to request this directly.
      </p>

      <h2 className="text-2xl font-bold text-white pt-4">5. Data retention</h2>
      <p>
        We retain account data while your account is active. After deletion, data is removed from
        production systems within 30 days, except where retention is required for legal, safety, or
        fraud-prevention purposes (e.g. records related to a safety report).
      </p>

      <h2 className="text-2xl font-bold text-white pt-4">6. Changes to this policy</h2>
      <p>
        We'll notify you of material changes to this policy via email or an in-app notice before
        they take effect.
      </p>

      <p className="pt-4">
        Questions about this policy? Reach out via the <a href="/contact" className="text-amora-400 hover:underline">Contact page</a>.
      </p>
    </StaticPage>
  );
}
