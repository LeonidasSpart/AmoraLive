import { StaticPage } from '../../components/StaticPage';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <StaticPage
      eyebrow={<><FileText className="w-4 h-4" /> Terms of Service</>}
      title="Terms of Service"
      subtitle="Last updated: July 2026"
    >
      <p className="text-sm text-midnight-500 italic">
        As with the Privacy Policy, this is a genuine, substantive draft — but terms governing a
        real consumer product, payments, and liability should be reviewed by a lawyer familiar with
        your jurisdiction before you rely on them.
      </p>

      <h2 className="text-2xl font-bold text-white pt-4">1. Eligibility</h2>
      <p>
        You must be at least 18 years old to use Amora. By creating an account, you confirm that you
        meet this requirement and that the information you provide is accurate.
      </p>

      <h2 className="text-2xl font-bold text-white pt-4">2. Your account</h2>
      <p>
        You're responsible for keeping your login credentials secure and for activity that occurs
        under your account. One person may hold only one account. Impersonation, fake profiles, and
        bot accounts are prohibited.
      </p>

      <h2 className="text-2xl font-bold text-white pt-4">3. Acceptable use</h2>
      <p>
        You agree not to harass other users, post unlawful or sexually explicit content involving
        minors (which will be reported to relevant authorities), solicit money or commercial
        activity, or attempt to circumvent safety and moderation systems. Violations may result in
        suspension or permanent termination of your account, with or without notice.
      </p>

      <h2 className="text-2xl font-bold text-white pt-4">4. Subscriptions &amp; payments</h2>
      <p>
        Paid tiers (Plus, Premium) renew automatically until cancelled. Subscriptions purchased
        through the Apple App Store or Google Play are billed and managed by Apple/Google under
        their respective terms. Subscriptions purchased directly through PayPal or crypto payment
        can be managed within your Amora account settings. Fees are generally non-refundable except
        where required by law.
      </p>

      <h2 className="text-2xl font-bold text-white pt-4">5. Content you post</h2>
      <p>
        You retain ownership of the photos, bio, and messages you post, but grant Amora a license to
        display and process that content as needed to operate the service (e.g. showing your profile
        to potential matches, running verification checks).
      </p>

      <h2 className="text-2xl font-bold text-white pt-4">6. No guarantee of outcomes</h2>
      <p>
        Amora helps facilitate introductions; we don't guarantee compatibility, safety of any
        individual you meet, or any particular relationship outcome. You're responsible for your own
        judgment and safety when interacting with, and meeting, other users — see our{' '}
        <a href="/safety" className="text-amora-400 hover:underline">Safety page</a> for guidance.
      </p>

      <h2 className="text-2xl font-bold text-white pt-4">7. Termination</h2>
      <p>
        You may delete your account at any time. We may suspend or terminate accounts that violate
        these terms, pose a safety risk, or as required by law.
      </p>

      <h2 className="text-2xl font-bold text-white pt-4">8. Limitation of liability</h2>
      <p>
        Amora is provided "as is." To the maximum extent permitted by law, we are not liable for
        indirect, incidental, or consequential damages arising from your use of the service.
      </p>

      <h2 className="text-2xl font-bold text-white pt-4">9. Changes to these terms</h2>
      <p>
        We may update these terms from time to time. Continued use of Amora after changes take
        effect constitutes acceptance of the updated terms.
      </p>
    </StaticPage>
  );
}
