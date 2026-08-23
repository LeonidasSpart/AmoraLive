import React, { useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';

const sections = [
  { id: 'acceptance', number: '01', title: 'Acceptance of Terms' },
  { id: 'eligibility', number: '02', title: 'Eligibility & Age' },
  { id: 'account', number: '03', title: 'Account & Security' },
  { id: 'content', number: '04', title: 'User Content' },
  { id: 'conduct', number: '05', title: 'Prohibited Conduct' },
  { id: 'safety', number: '06', title: 'Safety & Harassment' },
  { id: 'live', number: '07', title: 'Live Streaming' },
  { id: 'moderation', number: '08', title: 'Moderation & Appeals' },
  { id: 'expression', number: '09', title: 'Freedom of Expression' },
  { id: 'ip', number: '10', title: 'Intellectual Property' },
  { id: 'gifts', number: '11', title: 'Coins & Digital Gifts' },
  { id: 'payments', number: '12', title: 'Payments & Subscriptions' },
  { id: 'privacy', number: '13', title: 'Privacy & Personal Data' },
  { id: 'gdpr', number: '14', title: 'European GDPR' },
  { id: 'swiss', number: '15', title: 'Swiss Data Protection' },
  { id: 'dsa', number: '16', title: 'European Digital Services Act' },
  { id: 'consumers', number: '17', title: 'Consumer Rights' },
  { id: 'security', number: '18', title: 'Security & Fraud' },
  { id: 'minors', number: '19', title: 'Protection of Minors' },
  { id: 'ai', number: '20', title: 'AI & Automated Systems' },
  { id: 'thirdparty', number: '21', title: 'Third-Party Services' },
  { id: 'availability', number: '22', title: 'Availability & Changes' },
  { id: 'termination', number: '23', title: 'Suspension & Termination' },
  { id: 'liability', number: '24', title: 'Disclaimers & Liability' },
  { id: 'international', number: '25', title: 'International Users' },
  { id: 'disputes', number: '26', title: 'Disputes & Governing Law' },
  { id: 'changes', number: '27', title: 'Changes to Terms' },
  { id: 'contact', number: '28', title: 'Legal Contact' }
];

const prohibited = [
  'Child sexual abuse material or sexual exploitation of minors.',
  'Sexual content involving minors or attempts to sexualize minors.',
  'Human trafficking, exploitation or coercion.',
  'Credible threats of violence or incitement to serious violence.',
  'Terrorist or extremist content where prohibited by applicable law.',
  'Non-consensual intimate imagery.',
  'Sexual harassment, coercion or exploitation.',
  'Targeted harassment, stalking or intimidation.',
  'Fraud, scams, phishing and deceptive financial schemes.',
  'Identity theft and impersonation.',
  'Malware, malicious code or attempts to compromise the platform.',
  'Doxxing or unlawful disclosure of personal information.',
  'Illegal sale or promotion of regulated goods or services.',
  'Copyright, trademark or other intellectual-property infringement.',
  'Spam, bot networks and artificial engagement.',
  'Manipulation of followers, views, likes, rankings or gifts.',
  'Circumvention of account suspensions or safety systems.',
  'Any other conduct prohibited by applicable law.'
];

const accountRules = [
  'Provide accurate registration information.',
  'Do not misrepresent your age or identity.',
  'Do not sell, rent or transfer your account.',
  'Do not impersonate another person or organization.',
  'Do not create fraudulent or abusive accounts.',
  'Protect your authentication credentials.',
  'Immediately report suspected unauthorized access.'
];

const BulletList = ({ items }) => (
  <ul className="terms-list">
    {items.map((item, index) => (
      <li key={index}>
        <span className="bullet-dot" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const Section = ({ id, number, title, children }) => (
  <section id={id} className="legal-section">
    <div className="section-number">{number}</div>

    <div className="section-content">
      <div className="section-label">LEGAL FRAMEWORK</div>
      <h2>{title}</h2>
      {children}
    </div>
  </section>
);

export default function Terms() {
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredSections = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return sections;

    return sections.filter(
      (section) =>
        section.title.toLowerCase().includes(q) ||
        section.number.includes(q)
    );
  }, [search]);

  const scrollTo = (id) => {
    setMenuOpen(false);

    if (typeof document !== 'undefined') {
      document.getElementById(id)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <Layout>
      <div className="terms-page">

        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />

        <div className="legal-shell">

          {/* HERO */}
          <header className="legal-hero">

            <div className="hero-grid" />

            <div className="hero-content">

              <div className="legal-badge">
                <span className="badge-dot" />
                AMORALIVE LEGAL
              </div>

              <h1>
                Terms of
                <span> Service</span>
              </h1>

              <p className="hero-description">
                The legal framework governing AmoraLive, including
                livestreaming, social interaction, messaging, digital gifts,
                subscriptions, platform safety and your rights as a user.
              </p>

              <div className="hero-meta">

                <div>
                  <span>VERSION</span>
                  <strong>2026.08</strong>
                </div>

                <div>
                  <span>EFFECTIVE</span>
                  <strong>August 2026</strong>
                </div>

                <div>
                  <span>SCOPE</span>
                  <strong>International</strong>
                </div>

              </div>

            </div>

            {/* OFFICIAL AMORA LOGO */}
            <div className="hero-orb">

              <div className="orb-ring ring-one" />
              <div className="orb-ring ring-two" />
              <div className="orb-ring ring-three" />

              <div className="orb-core">
                <img
                  src="/brand/amora-logo.png"
                  alt="AmoraLive"
                />
              </div>

            </div>

          </header>

          {/* LEGAL STATUS */}
          <div className="status-grid">

            <div className="status-card">
              <div className="status-icon">EU</div>

              <div>
                <strong>European Framework</strong>
                <span>GDPR • DSA • Consumer Rights</span>
              </div>
            </div>

            <div className="status-card">
              <div className="status-icon">CH</div>

              <div>
                <strong>Swiss Framework</strong>
                <span>FADP • Swiss mandatory law</span>
              </div>
            </div>

            <div className="status-card">
              <div className="status-icon">18+</div>

              <div>
                <strong>Adult Platform</strong>
                <span>Age and safety controls apply</span>
              </div>
            </div>

            <div className="status-card">
              <div className="status-icon">✓</div>

              <div>
                <strong>Consumer Rights</strong>
                <span>Mandatory rights preserved</span>
              </div>
            </div>

          </div>

          {/* NOTICE */}
          <div className="important-notice">

            <div className="notice-icon">!</div>

            <div>
              <strong>Important Legal Notice</strong>

              <p>
                These Terms are designed for the international operation of
                AmoraLive and take particular account of European and Swiss
                digital-service, privacy and consumer-protection principles.
                Nothing in these Terms is intended to remove mandatory rights
                that cannot legally be waived.
              </p>
            </div>

          </div>

          <div className="legal-layout">

            {/* SIDEBAR */}
            <aside
              className={`legal-sidebar ${menuOpen ? 'open' : ''}`}
            >

              <button
                className="mobile-menu-button"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span>☰</span>
                Legal Navigation
              </button>

              <div className="sidebar-inner">

                <div className="sidebar-title">
                  <span>DOCUMENT</span>
                  <strong>Terms of Service</strong>
                </div>

                <div className="search-box">

                  <span>⌕</span>

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search terms..."
                    aria-label="Search Terms of Service"
                  />

                </div>

                <nav>

                  {filteredSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollTo(section.id)}
                    >
                      <span>{section.number}</span>
                      {section.title}
                    </button>
                  ))}

                </nav>

                <div className="sidebar-links">

                  <Link href="/legal/privacy">
                    Privacy Policy
                  </Link>

                  <Link href="/legal/guidelines">
                    Community Guidelines
                  </Link>

                  <Link href="/legal/cookies">
                    Cookie Policy
                  </Link>

                </div>

              </div>

            </aside>

            {/* DOCUMENT */}
            <article className="legal-document">

              <Section
                id="acceptance"
                number="01"
                title="Acceptance of Terms"
              >
                <p>
                  By creating an account, accessing, browsing or using
                  AmoraLive, you agree to these Terms of Service and the
                  policies incorporated into them.
                </p>

                <p>
                  If you do not agree with these Terms, you must not use
                  AmoraLive.
                </p>

                <p>
                  Where applicable law requires affirmative consent,
                  AmoraLive will request that consent through an appropriate
                  interface.
                </p>
              </Section>

              <Section
                id="eligibility"
                number="02"
                title="Eligibility & Age"
              >
                <p>
                  AmoraLive is intended for adults. You must be at least
                  18 years old to create or use an AmoraLive account unless
                  AmoraLive expressly provides a legally compliant service for
                  a younger age group.
                </p>

                <BulletList
                  items={[
                    'You must provide truthful registration information.',
                    'You must not misrepresent your age.',
                    'You must not assist a minor in bypassing AmoraLive age restrictions.',
                    'You must comply with additional age requirements imposed by the law of your country.'
                  ]}
                />
              </Section>

              <Section
                id="account"
                number="03"
                title="Account & Security"
              >
                <p>
                  You are responsible for protecting your account credentials
                  and for activity occurring through your account, except where
                  unauthorized access results from circumstances for which
                  AmoraLive is legally responsible.
                </p>

                <BulletList items={accountRules} />
              </Section>

              <Section
                id="content"
                number="04"
                title="User Content"
              >
                <p>
                  Users may upload, publish, transmit or otherwise make
                  available text, photographs, videos, audio, livestreams,
                  comments, usernames, profile information and other material.
                </p>

                <p>
                  You remain responsible for content you submit and must have
                  all rights, permissions and legal bases necessary to provide
                  that content to AmoraLive.
                </p>

                <div className="quote-card">
                  <span className="quote-mark">"</span>

                  <p>
                    Your content remains yours. AmoraLive receives only the
                    permissions reasonably necessary to operate the service.
                  </p>
                </div>
              </Section>

              <Section
                id="conduct"
                number="05"
                title="Prohibited Conduct"
              >
                <p>
                  AmoraLive does not permit unlawful, abusive, exploitative or
                  seriously harmful use of the platform.
                </p>

                <BulletList items={prohibited} />
              </Section>

              <Section
                id="safety"
                number="06"
                title="Safety & Harassment"
              >
                <p>
                  AmoraLive is designed to provide a safe environment for
                  users. Harassment, threats, bullying, stalking, coercion and
                  abusive conduct are prohibited.
                </p>

                <p>
                  Users should report serious or potentially unlawful conduct
                  through AmoraLive's reporting mechanisms and, where
                  appropriate, contact competent authorities.
                </p>
              </Section>

              <Section
                id="live"
                number="07"
                title="Live Streaming"
              >
                <p>
                  Livestream hosts are responsible for content and conduct
                  occurring during their broadcasts.
                </p>

                <BulletList
                  items={[
                    'Hosts must comply with these Terms and applicable law.',
                    'Hosts must not intentionally facilitate prohibited content.',
                    'Hosts must not use livestreams for fraud or illegal transactions.',
                    'Hosts must respect intellectual-property rights.',
                    'Hosts must not manipulate viewers through deceptive financial claims.',
                    'Hosts may be subject to additional livestream safety rules.'
                  ]}
                />
              </Section>

              <Section
                id="moderation"
                number="08"
                title="Moderation & Appeals"
              >
                <p>
                  AmoraLive may remove, restrict, demote, disable or otherwise
                  limit access to content or accounts where permitted or
                  required by law, these Terms, Community Guidelines, safety
                  requirements or legitimate security needs.
                </p>

                <p>
                  Moderation decisions should be proportionate to the relevant
                  violation and circumstances.
                </p>

                <div className="feature-grid">

                  <div>
                    <strong>Report</strong>
                    <span>
                      Flag potentially illegal or harmful content.
                    </span>
                  </div>

                  <div>
                    <strong>Review</strong>
                    <span>
                      Decisions may be reviewed under applicable rules.
                    </span>
                  </div>

                  <div>
                    <strong>Appeal</strong>
                    <span>
                      Eligible users may challenge moderation decisions.
                    </span>
                  </div>

                </div>
              </Section>

              <Section
                id="expression"
                number="09"
                title="Freedom of Expression"
              >
                <p>
                  AmoraLive respects freedom of expression and other
                  fundamental rights.
                </p>

                <p>
                  Freedom of expression does not create a right to use
                  AmoraLive for unlawful conduct, threats, harassment,
                  exploitation, fraud, privacy violations or other prohibited
                  activities.
                </p>

                <p>
                  Content moderation will be carried out subject to applicable
                  law and the platform's legitimate safety and integrity
                  requirements.
                </p>
              </Section>

              <Section
                id="ip"
                number="10"
                title="Intellectual Property"
              >
                <p>
                  AmoraLive's software, trademarks, logos, designs, interfaces,
                  animations, graphics, databases and other platform materials
                  are protected by intellectual-property laws.
                </p>

                <p>
                  Except where permitted by law or expressly authorized by
                  AmoraLive, you may not copy, modify, distribute, sell,
                  reverse engineer or commercially exploit protected platform
                  materials.
                </p>
              </Section>

              <Section
                id="gifts"
                number="11"
                title="Coins & Digital Gifts"
              >
                <p>
                  AmoraLive may provide virtual coins, digital gifts,
                  animations, badges, memberships or other virtual features.
                </p>

                <div className="warning-card">

                  <strong>
                    Digital items are not investments
                  </strong>

                  <p>
                    Unless expressly stated otherwise, virtual coins and
                    digital gifts are platform functionality. They are not
                    physical property, deposits, securities, investments or
                    legal tender.
                  </p>

                </div>

                <BulletList
                  items={[
                    'Virtual coins have no cash value unless applicable law requires otherwise.',
                    'Virtual items may not be sold or transferred outside AmoraLive unless expressly permitted.',
                    'Users may not exploit technical errors to duplicate virtual currency.',
                    'Fraudulent transactions may be cancelled or reversed where legally permitted.',
                    'Prices and applicable taxes will be disclosed before purchase where required.'
                  ]}
                />
              </Section>

              <Section
                id="payments"
                number="12"
                title="Payments & Subscriptions"
              >
                <p>
                  Paid services may be processed by third-party payment
                  providers, app stores or other payment intermediaries.
                </p>

                <p>
                  Prices, billing intervals, renewal terms, taxes, refunds and
                  cancellation procedures will be presented as required by
                  applicable law.
                </p>

                <p>
                  Mandatory consumer rights concerning digital services,
                  digital content and recurring payments remain unaffected.
                </p>
              </Section>

              <Section
                id="privacy"
                number="13"
                title="Privacy & Personal Data"
              >
                <p>
                  AmoraLive processes personal data according to its Privacy
                  Policy and applicable data-protection laws.
                </p>

                <p>
                  Depending on the user's location and the circumstances of
                  processing, this may include the GDPR, Swiss Federal Act on
                  Data Protection and other applicable privacy laws.
                </p>

                <div className="link-card">

                  <span>DATA PROTECTION</span>

                  <Link href="/legal/privacy">
                    Read the AmoraLive Privacy Policy →
                  </Link>

                </div>
              </Section>

              <Section
                id="gdpr"
                number="14"
                title="European GDPR"
              >
                <p>
                  Where the GDPR applies, AmoraLive will process personal data
                  in accordance with the GDPR and applicable national
                  implementing legislation.
                </p>

                <p>
                  Depending on the circumstances, users may have rights
                  including access, rectification, erasure, restriction,
                  objection, portability and rights relating to certain
                  automated decision-making.
                </p>
              </Section>

              <Section
                id="swiss"
                number="15"
                title="Swiss Data Protection"
              >
                <p>
                  Where Swiss law applies, AmoraLive will comply with the
                  applicable requirements of the Swiss Federal Act on Data
                  Protection and associated regulations.
                </p>

                <p>
                  Swiss data subjects may have rights concerning access,
                  correction, deletion and other aspects of personal-data
                  processing, subject to applicable legal limitations.
                </p>
              </Section>

              <Section
                id="dsa"
                number="16"
                title="European Digital Services Act"
              >
                <p>
                  Where the Digital Services Act applies to AmoraLive, the
                  platform will implement the obligations applicable to its
                  legal category and size.
                </p>

                <div className="dsa-grid">

                  <div>
                    <strong>Notice & Action</strong>
                    <span>
                      Mechanisms for reporting potentially illegal content.
                    </span>
                  </div>

                  <div>
                    <strong>Reasons</strong>
                    <span>
                      Appropriate explanations for certain moderation
                      decisions.
                    </span>
                  </div>

                  <div>
                    <strong>Complaints</strong>
                    <span>
                      Applicable internal complaint and appeal mechanisms.
                    </span>
                  </div>

                  <div>
                    <strong>Transparency</strong>
                    <span>
                      Required platform transparency information.
                    </span>
                  </div>

                </div>

                <p>
                  Additional obligations apply to platforms formally designated
                  as Very Large Online Platforms. Such obligations depend on
                  the relevant legal designation and thresholds.
                </p>
              </Section>

              <Section
                id="consumers"
                number="17"
                title="Consumer Rights"
              >
                <p>
                  Nothing in these Terms removes mandatory consumer protections
                  granted by the law applicable to you.
                </p>

                <p>
                  For consumers in the European Economic Area, mandatory EU
                  consumer-protection rules concerning digital services and
                  digital content may apply depending on the service and
                  transaction.
                </p>

                <p>
                  Where a statutory withdrawal right exists, its application to
                  digital content or digital services may depend on the
                  circumstances and legally required consent and acknowledgement.
                </p>
              </Section>

              <Section
                id="security"
                number="18"
                title="Security & Fraud"
              >
                <p>
                  Users may not manipulate AmoraLive's systems, including
                  followers, likes, views, rankings, gifts, coins or other
                  platform metrics.
                </p>

                <BulletList
                  items={[
                    'No automated follower farms.',
                    'No fake engagement services.',
                    'No fraudulent gift transactions.',
                    'No exploitation of payment or coin vulnerabilities.',
                    'No attempts to bypass security controls.',
                    'No malicious code or unauthorized access attempts.'
                  ]}
                />
              </Section>

              <Section
                id="minors"
                number="19"
                title="Protection of Minors"
              >
                <p>
                  AmoraLive takes the safety of children and young people
                  seriously.
                </p>

                <p>
                  Content or conduct that exploits, sexualizes or endangers
                  minors is strictly prohibited.
                </p>

                <p>
                  Where legally required, AmoraLive will apply additional
                  safeguards relating to minors, including appropriate privacy
                  and safety measures.
                </p>
              </Section>

              <Section
                id="ai"
                number="20"
                title="AI & Automated Systems"
              >
                <p>
                  AmoraLive may use automated systems, artificial intelligence,
                  machine learning or algorithmic tools for security,
                  moderation, recommendations, fraud detection,
                  personalization, translation and other legitimate platform
                  functions.
                </p>

                <p>
                  Where applicable law provides specific rights concerning
                  automated decisions, AmoraLive will provide legally required
                  information and safeguards.
                </p>
              </Section>

              <Section
                id="thirdparty"
                number="21"
                title="Third-Party Services"
              >
                <p>
                  AmoraLive may integrate third-party services including
                  payment providers, authentication providers, cloud
                  infrastructure, analytics services and communication
                  technologies.
                </p>

                <p>
                  Third-party services may have their own terms and privacy
                  policies. AmoraLive is not responsible for independent
                  services operated by third parties except where liability
                  cannot legally be excluded.
                </p>
              </Section>

              <Section
                id="availability"
                number="22"
                title="Availability & Changes"
              >
                <p>
                  AmoraLive may update, modify, suspend or discontinue
                  features. Maintenance, security incidents, infrastructure
                  failures and events outside reasonable control may
                  temporarily affect availability.
                </p>

                <p>
                  Where legally required, users will receive appropriate notice
                  of material changes or discontinuation.
                </p>
              </Section>

              <Section
                id="termination"
                number="23"
                title="Suspension & Termination"
              >
                <p>
                  AmoraLive may suspend or terminate accounts where reasonably
                  necessary to enforce these Terms, protect users, prevent
                  fraud, comply with law or protect the security and integrity
                  of the service.
                </p>

                <p>
                  Where required by applicable law, AmoraLive will provide an
                  appropriate explanation and/or appeal mechanism.
                </p>
              </Section>

              <Section
                id="liability"
                number="24"
                title="Disclaimers & Liability"
              >
                <p>
                  To the maximum extent permitted by applicable law, AmoraLive
                  does not guarantee that the service will always be
                  uninterrupted, error-free, secure or available in every
                  location.
                </p>

                <p>
                  Nothing in these Terms excludes or limits liability that
                  cannot lawfully be excluded or limited.
                </p>

                <div className="legal-protection">

                  <span>LEGAL PROTECTION</span>

                  <strong>
                    Mandatory statutory rights remain unaffected.
                  </strong>

                </div>
              </Section>

              <Section
                id="international"
                number="25"
                title="International Users"
              >
                <p>
                  AmoraLive may be accessible internationally. Users are
                  responsible for complying with laws applicable to them when
                  using the service.
                </p>

                <p>
                  AmoraLive does not represent that every feature is available
                  or lawful in every country.
                </p>
              </Section>

              <Section
                id="disputes"
                number="26"
                title="Disputes & Governing Law"
              >
                <p>
                  AmoraLive encourages users to contact support first so that
                  disputes can be resolved efficiently.
                </p>

                <p>
                  The final governing-law and competent-court provisions should
                  identify the actual contracting entity and jurisdiction.
                  Any such clause remains subject to mandatory consumer and
                  other legal protections that cannot lawfully be waived.
                </p>

                <div className="placeholder-card">

                  <span>REQUIRED BEFORE PUBLICATION</span>

                  <strong>
                    Insert verified legal entity + jurisdiction.
                  </strong>

                </div>
              </Section>

              <Section
                id="changes"
                number="27"
                title="Changes to Terms"
              >
                <p>
                  AmoraLive may update these Terms when reasonably necessary,
                  including to reflect changes in the service, technology,
                  applicable law, security requirements or business operations.
                </p>

                <p>
                  Material changes will be communicated in an appropriate
                  manner where required by law.
                </p>
              </Section>

              <Section
                id="contact"
                number="28"
                title="Legal Contact"
              >
                <p>
                  Legal notices and formal support requests should be sent
                  through the official AmoraLive legal or support channel.
                </p>

                <div className="contact-card">

                  {/* OFFICIAL AMORA LOGO */}
                  <div className="contact-logo">
                    <img
                      src="/brand/amora-logo.png"
                      alt="AmoraLive"
                    />
                  </div>

                  <div>

                    <span>AMORALIVE LEGAL DEPARTMENT</span>

                    <strong>
                      [INSERT LEGAL ENTITY]
                    </strong>

                    <p>
                      Registered address: [INSERT REGISTERED ADDRESS]
                      <br />
                      Country: [INSERT COUNTRY]
                      <br />
                      Legal email: [INSERT LEGAL EMAIL]
                      <br />
                      Support: [INSERT SUPPORT EMAIL]
                    </p>

                  </div>

                </div>
              </Section>

              {/* FINAL */}
              <div className="final-card">

                <div className="final-glow" />

                {/* OFFICIAL AMORA LOGO */}
                <div className="final-symbol">
                  <img
                    src="/brand/amora-logo.png"
                    alt="AmoraLive"
                  />
                </div>

                <div>

                  <div className="section-label">
                    AMORALIVE PRINCIPLE
                  </div>

                  <h2>Your Rights Matter.</h2>

                  <p>
                    AmoraLive is committed to operating a modern social
                    platform that respects safety, privacy, freedom of
                    expression, consumer rights and applicable law.
                  </p>

                  <p>
                    These Terms do not replace rights that users have under
                    mandatory national, European or international law.
                  </p>

                </div>

              </div>

              <div className="document-footer">

                <div>
                  <strong>AMORALIVE</strong>
                  <span>
                    Terms of Service • August 2026
                  </span>
                </div>

                <div className="footer-links">

                  <Link href="/legal/privacy">
                    Privacy
                  </Link>

                  <Link href="/legal/guidelines">
                    Community
                  </Link>

                  <Link href="/legal/cookies">
                    Cookies
                  </Link>

                  <Link href="/">
                    Home
                  </Link>

                </div>

              </div>

            </article>

          </div>

        </div>

        <style jsx global>{`

          html {
            scroll-behavior: smooth;
          }

          .terms-page {
            min-height: 100vh;
            background:
              radial-gradient(
                circle at 10% 0%,
                rgba(255, 63, 157, 0.11),
                transparent 30%
              ),
              radial-gradient(
                circle at 90% 20%,
                rgba(155, 53, 255, 0.10),
                transparent 28%
              ),
              #07070d;
            color: #d9d9df;
            position: relative;
            overflow: hidden;
          }

          .legal-shell {
            max-width: 1420px;
            margin: 0 auto;
            padding: 34px 24px 90px;
            position: relative;
            z-index: 2;
          }

          .ambient {
            position: fixed;
            width: 420px;
            height: 420px;
            border-radius: 50%;
            filter: blur(120px);
            pointer-events: none;
            opacity: .18;
            z-index: 0;
          }

          .ambient-one {
            background: #ff3f9d;
            top: 10%;
            left: -260px;
          }

          .ambient-two {
            background: #873dff;
            bottom: 5%;
            right: -260px;
          }

          .legal-hero {
            min-height: 390px;
            border-radius: 32px;
            border: 1px solid rgba(255,255,255,.09);
            background:
              linear-gradient(
                135deg,
                rgba(255,255,255,.065),
                rgba(255,255,255,.018)
              );
            backdrop-filter: blur(22px);
            position: relative;
            overflow: hidden;
            box-shadow:
              0 35px 100px rgba(0,0,0,.35),
              inset 0 1px 0 rgba(255,255,255,.06);
          }

          .hero-grid {
            position: absolute;
            inset: 0;
            opacity: .16;
            background-image:
              linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
            background-size: 42px 42px;
            mask-image: linear-gradient(to bottom, black, transparent);
          }

          .hero-content {
            position: relative;
            z-index: 2;
            max-width: 760px;
            padding: 62px 64px;
          }

          .legal-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border: 1px solid rgba(255,107,157,.35);
            background: rgba(255,63,157,.08);
            color: #ff7eaf;
            border-radius: 999px;
            padding: 8px 13px;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 2px;
          }

          .badge-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #ff5da8;
            box-shadow: 0 0 15px #ff3f9d;
          }

          .legal-hero h1 {
            font-size: clamp(44px, 6vw, 76px);
            line-height: .95;
            letter-spacing: -4px;
            margin: 28px 0 20px;
            color: #fff;
            font-weight: 950;
          }

          .legal-hero h1 span {
            background: linear-gradient(
              110deg,
              #ff4f9f,
              #ff85b9 45%,
              #a65cff
            );
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }

          .hero-description {
            max-width: 680px;
            color: #a9a9b5;
            font-size: 16px;
            line-height: 1.75;
            margin: 0;
          }

          .hero-meta {
            display: flex;
            gap: 34px;
            margin-top: 32px;
            flex-wrap: wrap;
          }

          .hero-meta div {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .hero-meta span {
            font-size: 9px;
            letter-spacing: 1.8px;
            color: #6d6d78;
            font-weight: 800;
          }

          .hero-meta strong {
            font-size: 13px;
            color: #eee;
          }

          .hero-orb {
            width: 340px;
            height: 340px;
            position: absolute;
            right: 5%;
            top: 50%;
            transform: translateY(-50%);
            display: grid;
            place-items: center;
          }

          .orb-ring {
            position: absolute;
            border-radius: 50%;
            border: 1px solid rgba(255,107,157,.22);
          }

          .ring-one {
            width: 320px;
            height: 320px;
            transform: rotate(24deg);
            border-color: rgba(255,107,157,.18);
          }

          .ring-two {
            width: 250px;
            height: 250px;
            transform: rotate(-40deg);
            border-color: rgba(166,92,255,.25);
          }

          .ring-three {
            width: 180px;
            height: 180px;
            border-color: rgba(255,255,255,.18);
          }

          /* OFFICIAL AMORA LOGO CORE */
          .orb-core {
            width: 100px;
            height: 100px;
            border-radius: 30px;
            transform: rotate(45deg);
            display: grid;
            place-items: center;
            background: linear-gradient(
              135deg,
              #ff3f9d,
              #9b35ff
            );
            box-shadow:
              0 0 50px rgba(255,63,157,.42),
              0 0 100px rgba(155,53,255,.22);
            overflow: hidden;
          }

          .orb-core img {
            width: 62px;
            height: 62px;
            object-fit: contain;
            display: block;
            transform: rotate(-45deg);
            filter: drop-shadow(
              0 0 18px rgba(255,255,255,.18)
            );
          }

          .status-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin: 18px 0;
          }

          .status-card {
            display: flex;
            align-items: center;
            gap: 12px;
            min-height: 76px;
            padding: 13px 15px;
            border-radius: 18px;
            border: 1px solid rgba(255,255,255,.07);
            background: rgba(255,255,255,.025);
            backdrop-filter: blur(15px);
          }

          .status-icon {
            min-width: 43px;
            height: 43px;
            display: grid;
            place-items: center;
            border-radius: 13px;
            background:
              linear-gradient(
                135deg,
                rgba(255,63,157,.18),
                rgba(155,53,255,.18)
              );
            border: 1px solid rgba(255,107,157,.18);
            color: #ff80b3;
            font-size: 11px;
            font-weight: 900;
          }

          .status-card strong,
          .status-card span {
            display: block;
          }

          .status-card strong {
            font-size: 12px;
            color: #eee;
          }

          .status-card span {
            font-size: 10px;
            color: #777783;
            margin-top: 4px;
          }

          .important-notice {
            display: flex;
            gap: 15px;
            align-items: flex-start;
            padding: 20px;
            border-radius: 18px;
            border: 1px solid rgba(255,190,90,.18);
            background: rgba(255,180,60,.045);
            margin: 18px 0 28px;
          }

          .notice-icon {
            min-width: 34px;
            height: 34px;
            border-radius: 10px;
            display: grid;
            place-items: center;
            background: rgba(255,190,90,.12);
            color: #ffd27b;
            font-weight: 900;
          }

          .important-notice strong {
            color: #ffe0a0;
            font-size: 13px;
          }

          .important-notice p {
            margin: 6px 0 0;
            color: #9999a4;
            font-size: 12px;
            line-height: 1.7;
          }

          .legal-layout {
            display: grid;
            grid-template-columns: 280px minmax(0, 1fr);
            gap: 28px;
            align-items: start;
          }

          .legal-sidebar {
            position: sticky;
            top: 20px;
            z-index: 20;
          }

          .sidebar-inner {
            border-radius: 22px;
            border: 1px solid rgba(255,255,255,.08);
            background: rgba(10,10,17,.78);
            backdrop-filter: blur(20px);
            padding: 16px;
          }

          .sidebar-title {
            padding: 8px 8px 15px;
            border-bottom: 1px solid rgba(255,255,255,.06);
          }

          .sidebar-title span {
            display: block;
            font-size: 8px;
            letter-spacing: 2px;
            color: #666673;
            font-weight: 900;
          }

          .sidebar-title strong {
            display: block;
            color: #eee;
            font-size: 14px;
            margin-top: 5px;
          }

          .search-box {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 9px 10px;
            margin: 13px 0;
            background: rgba(255,255,255,.04);
            border: 1px solid rgba(255,255,255,.07);
            border-radius: 12px;
          }

          .search-box span {
            color: #888;
            font-size: 18px;
          }

          .search-box input {
            width: 100%;
            border: 0;
            outline: 0;
            background: transparent;
            color: #fff;
            font-size: 11px;
          }

          .search-box input::placeholder {
            color: #666673;
          }

          .legal-sidebar nav {
            display: flex;
            flex-direction: column;
            max-height: 570px;
            overflow-y: auto;
            padding-right: 3px;
          }

          .legal-sidebar nav button {
            display: flex;
            align-items: center;
            gap: 9px;
            text-align: left;
            background: transparent;
            border: 0;
            color: #777782;
            padding: 7px;
            border-radius: 9px;
            cursor: pointer;
            font-size: 10px;
            transition: .18s ease;
          }

          .legal-sidebar nav button:hover {
            color: #fff;
            background: rgba(255,63,157,.07);
          }

          .legal-sidebar nav button span {
            width: 21px;
            color: #4f4f5b;
            font-size: 8px;
            font-weight: 900;
          }

          .sidebar-links {
            display: flex;
            flex-direction: column;
            gap: 8px;
            border-top: 1px solid rgba(255,255,255,.06);
            margin-top: 12px;
            padding-top: 13px;
          }

          .sidebar-links a {
            color: #ff70aa;
            text-decoration: none;
            font-size: 10px;
            font-weight: 700;
          }

          .mobile-menu-button {
            display: none;
          }

          .legal-document {
            min-width: 0;
            border-radius: 25px;
            border: 1px solid rgba(255,255,255,.075);
            background: rgba(10,10,17,.64);
            backdrop-filter: blur(18px);
            padding: 25px clamp(20px, 4vw, 55px);
          }

          .legal-section {
            display: grid;
            grid-template-columns: 62px minmax(0,1fr);
            gap: 22px;
            padding: 40px 0;
            border-bottom: 1px solid rgba(255,255,255,.06);
            scroll-margin-top: 30px;
          }

          .legal-section:first-child {
            padding-top: 20px;
          }

          .section-number {
            color: #ff5da8;
            font-size: 12px;
            font-weight: 950;
            padding-top: 4px;
            opacity: .75;
          }

          .section-label {
            color: #ff639f;
            font-size: 8px;
            letter-spacing: 2.1px;
            font-weight: 900;
            margin-bottom: 7px;
          }

          .section-content h2 {
            color: #fff;
            font-size: clamp(21px, 2.5vw, 28px);
            line-height: 1.2;
            letter-spacing: -.7px;
            margin: 0 0 16px;
          }

          .section-content p {
            color: #a6a6b0;
            font-size: 13px;
            line-height: 1.85;
            margin: 0 0 14px;
          }

          .terms-list {
            padding: 0;
            margin: 16px 0;
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 9px;
          }

          .terms-list li {
            display: flex;
            gap: 10px;
            color: #a6a6b0;
            font-size: 12px;
            line-height: 1.7;
          }

          .bullet-dot {
            width: 5px;
            height: 5px;
            min-width: 5px;
            margin-top: 8px;
            border-radius: 50%;
            background: #ff5da8;
            box-shadow: 0 0 10px rgba(255,93,168,.5);
          }

          .quote-card,
          .warning-card,
          .link-card,
          .legal-protection,
          .placeholder-card {
            margin: 20px 0;
            padding: 18px;
            border-radius: 15px;
          }

          .quote-card {
            position: relative;
            overflow: hidden;
            background:
              linear-gradient(
                135deg,
                rgba(255,63,157,.08),
                rgba(155,53,255,.06)
              );
            border: 1px solid rgba(255,107,157,.15);
          }

          .quote-mark {
            position: absolute;
            right: 18px;
            top: -15px;
            color: rgba(255,107,157,.1);
            font-size: 100px;
            font-weight: 900;
          }

          .quote-card p {
            color: #ddd;
            position: relative;
            z-index: 2;
            margin: 0;
            font-size: 13px;
          }

          .warning-card {
            background: rgba(255,180,60,.045);
            border: 1px solid rgba(255,180,60,.16);
          }

          .warning-card strong {
            color: #ffd27b;
            font-size: 12px;
          }

          .warning-card p {
            margin: 7px 0 0;
          }

          .feature-grid,
          .dsa-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 9px;
            margin-top: 20px;
          }

          .dsa-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .feature-grid div,
          .dsa-grid div {
            padding: 14px;
            border: 1px solid rgba(255,255,255,.07);
            border-radius: 13px;
            background: rgba(255,255,255,.025);
          }

          .feature-grid strong,
          .dsa-grid strong {
            display: block;
            color: #eee;
            font-size: 11px;
            margin-bottom: 5px;
          }

          .feature-grid span,
          .dsa-grid span {
            display: block;
            color: #777783;
            font-size: 10px;
            line-height: 1.6;
          }

          .link-card {
            background:
              linear-gradient(
                135deg,
                rgba(255,63,157,.09),
                rgba(155,53,255,.08)
              );
            border: 1px solid rgba(255,107,157,.16);
          }

          .link-card span {
            display: block;
            color: #777783;
            font-size: 8px;
            letter-spacing: 2px;
            margin-bottom: 6px;
          }

          .link-card a {
            color: #ff70aa;
            text-decoration: none;
            font-size: 12px;
            font-weight: 800;
          }

          .legal-protection {
            display: flex;
            flex-direction: column;
            gap: 5px;
            background: rgba(255,63,157,.05);
            border: 1px solid rgba(255,63,157,.14);
          }

          .legal-protection span,
          .placeholder-card span {
            color: #ff639f;
            font-size: 8px;
            letter-spacing: 1.8px;
            font-weight: 900;
          }

          .legal-protection strong,
          .placeholder-card strong {
            color: #eee;
            font-size: 12px;
          }

          .placeholder-card {
            background: rgba(255,180,60,.04);
            border: 1px dashed rgba(255,180,60,.25);
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          /* CONTACT CARD */
          .contact-card {
            display: flex;
            gap: 15px;
            padding: 20px;
            border-radius: 18px;
            background:
              linear-gradient(
                135deg,
                rgba(255,63,157,.08),
                rgba(155,53,255,.07)
              );
            border: 1px solid rgba(255,107,157,.16);
          }

          .contact-logo,
          .final-symbol {
            min-width: 52px;
            width: 52px;
            height: 52px;
            border-radius: 16px;
            display: grid;
            place-items: center;
            background:
              linear-gradient(
                135deg,
                #ff3f9d,
                #9b35ff
              );
            box-shadow:
              0 0 30px rgba(255,63,157,.22);
            overflow: hidden;
          }

          .contact-logo img,
          .final-symbol img {
            width: 34px;
            height: 34px;
            object-fit: contain;
            display: block;
          }

          .contact-card span {
            display: block;
            color: #777783;
            font-size: 8px;
            letter-spacing: 1.8px;
            font-weight: 900;
          }

          .contact-card strong {
            display: block;
            color: #eee;
            margin-top: 5px;
            font-size: 13px;
          }

          .contact-card p {
            margin: 7px 0 0;
            color: #777783;
            font-size: 10px;
            line-height: 1.7;
          }

          /* FINAL CARD */
          .final-card {
            margin: 40px 0 20px;
            padding: 28px;
            border-radius: 22px;
            position: relative;
            overflow: hidden;
            display: flex;
            gap: 18px;
            align-items: center;
            background:
              linear-gradient(
                135deg,
                rgba(255,63,157,.12),
                rgba(155,53,255,.10)
              );
            border: 1px solid rgba(255,107,157,.2);
          }

          .final-card h2 {
            color: #fff;
            margin: 3px 0 8px;
            font-size: 26px;
          }

          .final-card p {
            color: #a3a3ae;
            font-size: 12px;
            line-height: 1.7;
            margin: 4px 0;
          }

          .final-glow {
            position: absolute;
            width: 200px;
            height: 200px;
            right: -100px;
            top: -100px;
            border-radius: 50%;
            background: #ff3f9d;
            filter: blur(90px);
            opacity: .15;
          }

          .document-footer {
            padding: 24px 0 8px;
            display: flex;
            justify-content: space-between;
            gap: 20px;
            align-items: center;
            flex-wrap: wrap;
          }

          .document-footer strong,
          .document-footer span {
            display: block;
          }

          .document-footer strong {
            color: #eee;
            font-size: 12px;
          }

          .document-footer span {
            color: #62626d;
            font-size: 9px;
            margin-top: 3px;
          }

          .footer-links {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
          }

          .footer-links a {
            color: #ff70aa;
            text-decoration: none;
            font-size: 10px;
            font-weight: 700;
          }

          @media (max-width: 1100px) {

            .hero-orb {
              right: -80px;
              opacity: .5;
            }

            .status-grid {
              grid-template-columns: repeat(2, 1fr);
            }

          }

          @media (max-width: 850px) {

            .legal-shell {
              padding: 16px 12px 60px;
            }

            .legal-hero {
              min-height: 460px;
              border-radius: 24px;
            }

            .hero-content {
              padding: 42px 25px;
            }

            .hero-orb {
              width: 220px;
              height: 220px;
              top: auto;
              bottom: -75px;
              right: -35px;
              opacity: .28;
            }

            .ring-one {
              width: 210px;
              height: 210px;
            }

            .ring-two {
              width: 165px;
              height: 165px;
            }

            .ring-three {
              width: 120px;
              height: 120px;
            }

            .orb-core {
              width: 68px;
              height: 68px;
              border-radius: 20px;
              font-size: 30px;
            }

            .orb-core img {
              width: 43px;
              height: 43px;
            }

            .legal-layout {
              grid-template-columns: 1fr;
            }

            .legal-sidebar {
              position: sticky;
              top: 8px;
              z-index: 50;
            }

            .mobile-menu-button {
              width: 100%;
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 13px;
              color: #fff;
              background: rgba(10,10,17,.95);
              border: 1px solid rgba(255,255,255,.09);
              border-radius: 14px;
              font-size: 11px;
              font-weight: 800;
              cursor: pointer;
            }

            .sidebar-inner {
              display: none;
              margin-top: 7px;
            }

            .legal-sidebar.open .sidebar-inner {
              display: block;
            }

            .legal-sidebar nav {
              max-height: 300px;
            }

            .legal-document {
              border-radius: 20px;
              padding: 12px 18px;
            }

          }

          @media (max-width: 600px) {

            .legal-hero h1 {
              font-size: 48px;
              letter-spacing: -3px;
            }

            .hero-description {
              font-size: 13px;
            }

            .hero-meta {
              gap: 18px;
            }

            .status-grid {
              grid-template-columns: 1fr;
            }

            .status-card {
              min-height: 65px;
            }

            .legal-section {
              grid-template-columns: 35px minmax(0,1fr);
              gap: 10px;
              padding: 30px 0;
            }

            .section-number {
              font-size: 10px;
            }

            .feature-grid,
            .dsa-grid {
              grid-template-columns: 1fr;
            }

            .final-card {
              align-items: flex-start;
              flex-direction: column;
            }

            .contact-card {
              align-items: flex-start;
            }

          }

        `}</style>

      </div>
    </Layout>
  );
}
