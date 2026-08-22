// pages/legal/privacy.jsx

import React, { useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';

const sections = [
  { id: 'overview', number: '01', title: 'Privacy at AmoraLive' },
  { id: 'controller', number: '02', title: 'Who Controls Your Data' },
  { id: 'data', number: '03', title: 'Information We Collect' },
  { id: 'sources', number: '04', title: 'How We Receive Information' },
  { id: 'purposes', number: '05', title: 'How We Use Your Data' },
  { id: 'legal-bases', number: '06', title: 'Legal Bases for Processing' },
  { id: 'profile', number: '07', title: 'Profiles & Social Features' },
  { id: 'live', number: '08', title: 'Livestreaming & Realtime Features' },
  { id: 'messages', number: '09', title: 'Messages & Communications' },
  { id: 'gifts', number: '10', title: 'Coins, Gifts & Payments' },
  { id: 'location', number: '11', title: 'Location Information' },
  { id: 'device', number: '12', title: 'Device & Technical Data' },
  { id: 'cookies', number: '13', title: 'Cookies & Similar Technologies' },
  { id: 'analytics', number: '14', title: 'Analytics & Personalization' },
  { id: 'ai', number: '15', title: 'AI & Automated Systems' },
  { id: 'moderation', number: '16', title: 'Safety & Moderation' },
  { id: 'sharing', number: '17', title: 'When We Share Data' },
  { id: 'transfers', number: '18', title: 'International Transfers' },
  { id: 'retention', number: '19', title: 'Data Retention' },
  { id: 'security', number: '20', title: 'Security' },
  { id: 'rights', number: '21', title: 'Your Privacy Rights' },
  { id: 'consent', number: '22', title: 'Consent & Withdrawal' },
  { id: 'children', number: '23', title: 'Children & Age Protection' },
  { id: 'thirdparty', number: '24', title: 'Third-Party Services' },
  { id: 'deletion', number: '25', title: 'Account Deletion' },
  { id: 'breach', number: '26', title: 'Security Incidents' },
  { id: 'complaints', number: '27', title: 'Complaints & Authorities' },
  { id: 'changes', number: '28', title: 'Changes to This Policy' },
  { id: 'contact', number: '29', title: 'Privacy Contact' }
];

const dataCategories = [
  {
    title: 'Identity & Account',
    text: 'Name, username, display name, account identifiers, age or age-related information and authentication information where applicable.'
  },
  {
    title: 'Profile',
    text: 'Profile photograph, biography, preferences, interests and other information you choose to make available.'
  },
  {
    title: 'Social Activity',
    text: 'Interactions such as follows, likes, comments, livestream participation, gifts and other platform activity.'
  },
  {
    title: 'Communications',
    text: 'Messages, chat content and related communication metadata where necessary to provide the communication service and protect users.'
  },
  {
    title: 'Transactions',
    text: 'Purchase, subscription, virtual-coin and digital-gift information, together with transaction identifiers and payment status.'
  },
  {
    title: 'Technical',
    text: 'IP address, device information, browser or app information, operating-system information, identifiers, logs and security information.'
  },
  {
    title: 'Usage',
    text: 'Information about how you interact with AmoraLive, such as pages, features, sessions and technical events.'
  },
  {
    title: 'Location',
    text: 'Approximate or precise location only where the relevant feature is enabled and the applicable legal requirements are satisfied.'
  }
];

const rights = [
  'Right to be informed about processing of your personal data.',
  'Right to access personal data held about you.',
  'Right to request correction of inaccurate or incomplete information.',
  'Right to request deletion where the legal requirements for erasure are met.',
  'Right to request restriction of processing in applicable circumstances.',
  'Right to object to certain processing, including direct marketing.',
  'Right to data portability where applicable.',
  'Right to withdraw consent where processing is based on consent.',
  'Rights concerning certain automated decision-making and profiling where applicable.',
  'Right to lodge a complaint with a competent data-protection authority.'
];

const purposes = [
  'Create and manage your AmoraLive account.',
  'Provide profiles, livestreams, messaging and social features.',
  'Process purchases, subscriptions, coins and digital gifts.',
  'Authenticate users and protect account security.',
  'Prevent fraud, abuse, spam, bots and malicious activity.',
  'Moderate content and protect users from harmful conduct.',
  'Provide customer support and respond to requests.',
  'Improve reliability, performance and functionality.',
  'Personalize features and recommendations where permitted.',
  'Send transactional notifications and service communications.',
  'Comply with legal and regulatory obligations.',
  'Establish, exercise or defend legal claims.',
  'Protect the rights, property and safety of AmoraLive and its users.'
];

const Section = ({ id, number, title, children }) => (
  <section id={id} className="privacy-section">
    <div className="privacy-number">{number}</div>

    <div className="privacy-content">
      <div className="privacy-label">DATA PROTECTION</div>
      <h2>{title}</h2>
      {children}
    </div>
  </section>
);

const BulletList = ({ items }) => (
  <ul className="privacy-list">
    {items.map((item, index) => (
      <li key={index}>
        <span className="privacy-bullet" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export default function Privacy() {
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
      <div className="privacy-page">

        <div className="privacy-ambient privacy-ambient-one" />
        <div className="privacy-ambient privacy-ambient-two" />

        <div className="privacy-shell">

          {/* HERO */}
          <header className="privacy-hero">

            <div className="privacy-grid" />

            <div className="privacy-hero-content">

              <div className="privacy-badge">
                <span className="privacy-badge-dot" />
                AMORALIVE PRIVACY
              </div>

              <h1>
                Your Data.
                <span> Your Control.</span>
              </h1>

              <p className="privacy-hero-description">
                A transparent explanation of how AmoraLive collects, uses,
                protects and manages personal data across accounts,
                livestreaming, messaging, gifts, payments, safety and
                personalization.
              </p>

              <div className="privacy-meta">

                <div>
                  <span>VERSION</span>
                  <strong>2026.08</strong>
                </div>

                <div>
                  <span>EFFECTIVE</span>
                  <strong>August 2026</strong>
                </div>

                <div>
                  <span>FRAMEWORK</span>
                  <strong>EU • CH • INTERNATIONAL</strong>
                </div>

              </div>

            </div>

            <div className="privacy-shield">

              <div className="shield-ring shield-ring-one" />
              <div className="shield-ring shield-ring-two" />

              <div className="shield">
                <div className="shield-inner">
                  A
                </div>
              </div>

            </div>

          </header>

          {/* PRIVACY STATUS */}
          <div className="privacy-status-grid">

            <div className="privacy-status-card">
              <div className="privacy-status-icon">EU</div>

              <div>
                <strong>GDPR Principles</strong>
                <span>Transparency • Rights • Accountability</span>
              </div>
            </div>

            <div className="privacy-status-card">
              <div className="privacy-status-icon">CH</div>

              <div>
                <strong>Swiss Protection</strong>
                <span>Swiss data-protection requirements</span>
              </div>
            </div>

            <div className="privacy-status-card">
              <div className="privacy-status-icon">🔐</div>

              <div>
                <strong>Security</strong>
                <span>Technical & organisational safeguards</span>
              </div>
            </div>

            <div className="privacy-status-card">
              <div className="privacy-status-icon">◎</div>

              <div>
                <strong>Your Choices</strong>
                <span>Access • Delete • Object • Export</span>
              </div>
            </div>

          </div>

          {/* IMPORTANT NOTICE */}
          <div className="privacy-notice">

            <div className="privacy-notice-icon">
              !
            </div>

            <div>
              <strong>Privacy should be understandable.</strong>

              <p>
                This Privacy Policy explains the categories of information
                AmoraLive may process, why processing may occur, the choices
                available to users, and the circumstances in which information
                may be shared. Where a particular feature is not enabled,
                AmoraLive will not process data for that feature merely because
                it is described in this general policy.
              </p>
            </div>

          </div>

          <div className="privacy-layout">

            {/* SIDEBAR */}
            <aside
              className={`privacy-sidebar ${
                menuOpen ? 'privacy-sidebar-open' : ''
              }`}
            >

              <button
                className="privacy-mobile-button"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span>☰</span>
                Privacy Navigation
              </button>

              <div className="privacy-sidebar-inner">

                <div className="privacy-sidebar-title">
                  <span>DOCUMENT</span>
                  <strong>Privacy Policy</strong>
                </div>

                <div className="privacy-search">

                  <span>⌕</span>

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search privacy..."
                    aria-label="Search Privacy Policy"
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

                <div className="privacy-sidebar-links">

                  <Link href="/legal/terms">
                    Terms of Service
                  </Link>

                  <Link href="/legal/community-guidelines">
                    Community Guidelines
                  </Link>

                  <Link href="/legal/cookies">
                    Cookie Policy
                  </Link>

                </div>

              </div>

            </aside>

            {/* DOCUMENT */}
            <article className="privacy-document">

              <Section
                id="overview"
                number="01"
                title="Privacy at AmoraLive"
              >

                <p>
                  AmoraLive respects your privacy and aims to give you
                  meaningful control over your personal information.
                </p>

                <p>
                  This Privacy Policy describes how AmoraLive may collect,
                  use, disclose, retain and protect personal information when
                  you use our website, application, livestreaming services,
                  messaging features, social features, payment functionality
                  and related services.
                </p>

                <div className="privacy-quote">

                  <span className="privacy-quote-mark">
                    "
                  </span>

                  <p>
                    We believe privacy should be built into the experience,
                    not hidden behind complicated language.
                  </p>

                </div>

              </Section>

              <Section
                id="controller"
                number="02"
                title="Who Controls Your Data"
              >

                <p>
                  The organisation responsible for determining the purposes and
                  means of processing your personal data is:
                </p>

                <div className="privacy-placeholder">

                  <span>CONTROLLER INFORMATION</span>

                  <strong>
                    [INSERT AMORALIVE LEGAL ENTITY]
                  </strong>

                  <p>
                    Registered address:
                    <br />
                    [INSERT REGISTERED ADDRESS]
                  </p>

                  <p>
                    Country:
                    <br />
                    [INSERT COUNTRY]
                  </p>

                  <p>
                    Privacy contact:
                    <br />
                    [INSERT PRIVACY EMAIL]
                  </p>

                </div>

                <p>
                  If AmoraLive appoints a Data Protection Officer or another
                  formal privacy representative where legally required, the
                  relevant contact information will be provided here.
                </p>

              </Section>

              <Section
                id="data"
                number="03"
                title="Information We Collect"
              >

                <p>
                  Depending on how you use AmoraLive, we may process different
                  categories of information.
                </p>

                <div className="privacy-data-grid">

                  {dataCategories.map((item, index) => (
                    <div
                      className="privacy-data-card"
                      key={index}
                    >
                      <div className="privacy-data-number">
                        {String(index + 1).padStart(2, '0')}
                      </div>

                      <strong>{item.title}</strong>

                      <span>{item.text}</span>
                    </div>
                  ))}

                </div>

                <p>
                  Not every category applies to every user. The information
                  processed depends on the features you use, your choices and
                  the legal requirements applicable to your use of AmoraLive.
                </p>

              </Section>

              <Section
                id="sources"
                number="04"
                title="How We Receive Information"
              >

                <p>
                  Information may come from several sources, including:
                </p>

                <BulletList
                  items={[
                    'Information you provide when creating or updating your account.',
                    'Information you provide in your profile.',
                    'Content you upload or publish.',
                    'Messages and interactions you initiate.',
                    'Information generated when you use AmoraLive features.',
                    'Information generated by security and fraud-prevention systems.',
                    'Payment and transaction information received from payment providers.',
                    'Information from authentication providers when you choose third-party login.',
                    'Information from service providers acting on our behalf.',
                    'Information required or permitted by applicable law.'
                  ]}
                />

              </Section>

              <Section
                id="purposes"
                number="05"
                title="How We Use Your Data"
              >

                <p>
                  We may process personal information for the following
                  purposes, subject to the applicable legal basis:
                </p>

                <BulletList items={purposes} />

              </Section>

              <Section
                id="legal-bases"
                number="06"
                title="Legal Bases for Processing"
              >

                <p>
                  Where the GDPR or another law requiring a legal basis applies,
                  AmoraLive will process personal data on an applicable legal
                  basis.
                </p>

                <div className="privacy-basis-grid">

                  <div>
                    <strong>Contract</strong>
                    <span>
                      Processing necessary to provide requested services and
                      operate your account.
                    </span>
                  </div>

                  <div>
                    <strong>Consent</strong>
                    <span>
                      Processing where you have freely given informed consent
                      and consent is the appropriate legal basis.
                    </span>
                  </div>

                  <div>
                    <strong>Legitimate Interests</strong>
                    <span>
                      Processing necessary for legitimate interests, balanced
                      against your rights and freedoms.
                    </span>
                  </div>

                  <div>
                    <strong>Legal Obligation</strong>
                    <span>
                      Processing necessary to comply with applicable legal
                      requirements.
                    </span>
                  </div>

                  <div>
                    <strong>Vital Interests</strong>
                    <span>
                      Processing where necessary to protect vital interests
                      in legally applicable circumstances.
                    </span>
                  </div>

                  <div>
                    <strong>Public Interest</strong>
                    <span>
                      Processing where an applicable legal framework permits
                      or requires it for a public-interest purpose.
                    </span>
                  </div>

                </div>

              </Section>

              <Section
                id="profile"
                number="07"
                title="Profiles & Social Features"
              >

                <p>
                  AmoraLive is a social platform. Information that you choose
                  to place on your public or semi-public profile may be visible
                  to other users according to your settings and the feature
                  involved.
                </p>

                <p>
                  Before publishing personal information about another person,
                  you should have an appropriate legal basis or permission to
                  do so.
                </p>

                <div className="privacy-warning">

                  <strong>
                    Think before you publish.
                  </strong>

                  <p>
                    Information posted publicly may be copied, screenshotted
                    or redistributed by other users. Privacy settings cannot
                    guarantee that other users will not retain information they
                    have legitimately viewed.
                  </p>

                </div>

              </Section>

              <Section
                id="live"
                number="08"
                title="Livestreaming & Realtime Features"
              >

                <p>
                  Livestreaming may involve realtime processing of information
                  such as account identifiers, viewer interactions, chat,
                  reactions, gifts, technical connection information and
                  moderation events.
                </p>

                <p>
                  Depending on the feature, livestream content may be visible
                  to other users and may remain available for a period of time
                  determined by the product configuration.
                </p>

                <p>
                  AmoraLive may process livestream-related information for
                  safety, moderation, fraud prevention, service operation and
                  legal compliance.
                </p>

              </Section>

              <Section
                id="messages"
                number="09"
                title="Messages & Communications"
              >

                <p>
                  AmoraLive may provide private messaging, live chat and other
                  communication features.
                </p>

                <p>
                  Messages are processed to provide the communication service,
                  maintain functionality, prevent abuse and comply with legal
                  obligations where applicable.
                </p>

                <p>
                  AmoraLive does not represent that private messages are
                  equivalent to end-to-end encrypted communications unless the
                  specific feature expressly states that it provides
                  end-to-end encryption.
                </p>

                <div className="privacy-security-card">

                  <div className="privacy-security-icon">
                    🔐
                  </div>

                  <div>
                    <strong>
                      Security is not the same as anonymity.
                    </strong>

                    <p>
                      Technical security measures may protect communications
                      while information may still need to be processed for
                      authentication, abuse prevention, legal compliance or
                      delivery.
                    </p>
                  </div>

                </div>

              </Section>

              <Section
                id="gifts"
                number="10"
                title="Coins, Gifts & Payments"
              >

                <p>
                  If you purchase coins, digital gifts, memberships or other
                  paid features, AmoraLive and its payment providers may
                  process transaction-related information.
                </p>

                <BulletList
                  items={[
                    'Transaction identifiers.',
                    'Purchase amount and currency.',
                    'Product or package purchased.',
                    'Subscription status.',
                    'Payment status.',
                    'Refund or chargeback information.',
                    'Fraud-prevention information.'
                  ]}
                />

                <p>
                  Payment-card details may be processed directly by an
                  authorized payment provider rather than stored by AmoraLive,
                  depending on the payment method and technical integration.
                </p>

                <p>
                  The exact payment information stored by AmoraLive depends on
                  the payment architecture actually used by the platform.
                </p>

              </Section>

              <Section
                id="location"
                number="11"
                title="Location Information"
              >

                <p>
                  Certain AmoraLive features may request location information.
                  Location processing depends on the feature, your device
                  permissions and applicable law.
                </p>

                <div className="privacy-location-grid">

                  <div>
                    <strong>Approximate Location</strong>
                    <span>
                      May be derived from technical information such as IP
                      address where permitted.
                    </span>
                  </div>

                  <div>
                    <strong>Precise Location</strong>
                    <span>
                      Processed only where the relevant feature and
                      permissions permit it.
                    </span>
                  </div>

                </div>

                <p>
                  You can generally control device-level location permissions
                  through your operating-system settings.
                </p>

              </Section>

              <Section
                id="device"
                number="12"
                title="Device & Technical Data"
              >

                <p>
                  When you access AmoraLive, technical information may be
                  generated automatically.
                </p>

                <BulletList
                  items={[
                    'IP address.',
                    'Device type.',
                    'Operating system.',
                    'Browser or application version.',
                    'Device and advertising identifiers where applicable.',
                    'Network information.',
                    'Language and regional settings.',
                    'Crash reports and diagnostic information.',
                    'Security and authentication logs.',
                    'Approximate location derived from technical information where permitted.'
                  ]}
                />

              </Section>

              <Section
                id="cookies"
                number="13"
                title="Cookies & Similar Technologies"
              >

                <p>
                  AmoraLive may use cookies, local storage, SDKs, pixels and
                  similar technologies to operate the service, remember
                  preferences, maintain authentication, measure performance,
                  provide security and, where legally permitted, understand
                  usage.
                </p>

                <div className="privacy-cookie-grid">

                  <div>
                    <strong>Essential</strong>
                    <span>
                      Required for authentication, security and core
                      functionality.
                    </span>
                  </div>

                  <div>
                    <strong>Preferences</strong>
                    <span>
                      Remember choices such as language or interface
                      preferences.
                    </span>
                  </div>

                  <div>
                    <strong>Analytics</strong>
                    <span>
                      Help understand how the service is used where permitted.
                    </span>
                  </div>

                  <div>
                    <strong>Marketing</strong>
                    <span>
                      Only where applicable and subject to required consent or
                      another lawful basis.
                    </span>
                  </div>

                </div>

                <p>
                  Where applicable law requires consent for non-essential
                  cookies or similar technologies, AmoraLive will request that
                  consent through an appropriate mechanism.
                </p>

              </Section>

              <Section
                id="analytics"
                number="14"
                title="Analytics & Personalization"
              >

                <p>
                  AmoraLive may use analytics and personalization systems to
                  understand product performance, improve features, detect
                  technical problems and provide relevant experiences.
                </p>

                <p>
                  Where profiling or personalization is subject to specific
                  legal requirements, AmoraLive will apply the safeguards
                  required by applicable law.
                </p>

              </Section>

              <Section
                id="ai"
                number="15"
                title="AI & Automated Systems"
              >

                <p>
                  AmoraLive may use automated systems or artificial intelligence
                  for functions such as translation, content moderation,
                  recommendations, fraud prevention, security, spam detection,
                  customer support or other product features.
                </p>

                <p>
                  Automated systems may produce incorrect results. Appropriate
                  human review or appeal mechanisms will be provided where
                  required by applicable law.
                </p>

                <div className="privacy-ai-card">

                  <div className="privacy-ai-symbol">
                    AI
                  </div>

                  <div>
                    <strong>
                      Automated does not mean unrestricted.
                    </strong>

                    <p>
                      AmoraLive will use automated technologies subject to
                      applicable privacy, safety and legal requirements.
                    </p>
                  </div>

                </div>

              </Section>

              <Section
                id="moderation"
                number="16"
                title="Safety & Moderation"
              >

                <p>
                  AmoraLive may process information to protect users and the
                  platform from abuse, fraud, harassment, illegal activity,
                  malicious automation and other security threats.
                </p>

                <BulletList
                  items={[
                    'Detect spam and bot activity.',
                    'Detect suspicious account behaviour.',
                    'Protect livestreams and chats.',
                    'Investigate reports.',
                    'Enforce Community Guidelines.',
                    'Protect users from harassment and abuse.',
                    'Prevent fraudulent payments or gift manipulation.',
                    'Comply with legal requirements.'
                  ]}
                />

                <p>
                  Safety processing may involve automated systems as well as
                  human review where appropriate.
                </p>

              </Section>

              <Section
                id="sharing"
                number="17"
                title="When We Share Data"
              >

                <p>
                  AmoraLive does not sell personal data for money.
                </p>

                <p>
                  We may disclose personal information to appropriate
                  recipients when necessary for legitimate operation,
                  contractual performance, legal compliance, safety or other
                  lawful purposes.
                </p>

                <div className="privacy-recipient-grid">

                  <div>
                    <strong>Infrastructure Providers</strong>
                    <span>
                      Hosting, databases, storage, networking and security.
                    </span>
                  </div>

                  <div>
                    <strong>Payment Providers</strong>
                    <span>
                      Processing purchases, subscriptions, refunds and fraud
                      prevention.
                    </span>
                  </div>

                  <div>
                    <strong>Authentication Providers</strong>
                    <span>
                      Login and identity services where you choose them.
                    </span>
                  </div>

                  <div>
                    <strong>Security Providers</strong>
                    <span>
                      Fraud prevention, abuse detection and platform security.
                    </span>
                  </div>

                  <div>
                    <strong>Professional Advisers</strong>
                    <span>
                      Lawyers, auditors and other professional advisers where
                      appropriate.
                    </span>
                  </div>

                  <div>
                    <strong>Authorities</strong>
                    <span>
                      Where disclosure is required or permitted by law.
                    </span>
                  </div>

                </div>

              </Section>

              <Section
                id="transfers"
                number="18"
                title="International Transfers"
              >

                <p>
                  AmoraLive and its service providers may process information
                  in countries other than the country where you live.
                </p>

                <p>
                  Where applicable data-protection law restricts international
                  transfers, appropriate safeguards will be used as required,
                  which may include adequacy decisions, standard contractual
                  clauses or other legally recognized transfer mechanisms.
                </p>

                <p>
                  The actual countries and transfer mechanisms depend on the
                  infrastructure and providers used by AmoraLive.
                </p>

              </Section>

              <Section
                id="retention"
                number="19"
                title="Data Retention"
              >

                <p>
                  We retain personal information only for as long as reasonably
                  necessary for the purposes described in this policy, unless a
                  longer period is required or permitted by law.
                </p>

                <div className="privacy-retention-grid">

                  <div>
                    <strong>Account Data</strong>
                    <span>
                      Generally retained while your account remains active and
                      for an appropriate period afterward where necessary.
                    </span>
                  </div>

                  <div>
                    <strong>Transactions</strong>
                    <span>
                      May be retained for accounting, tax, fraud prevention and
                      legal obligations.
                    </span>
                  </div>

                  <div>
                    <strong>Security Logs</strong>
                    <span>
                      Retained for a period appropriate to security,
                      investigation and abuse-prevention needs.
                    </span>
                  </div>

                  <div>
                    <strong>Deleted Content</strong>
                    <span>
                      Deletion may take time due to backups, legal obligations,
                      security requirements or technical processes.
                    </span>
                  </div>

                </div>

                <p>
                  Specific retention periods should be maintained internally
                  in AmoraLive's data-retention schedule and updated as the
                  platform architecture changes.
                </p>

              </Section>

              <Section
                id="security"
                number="20"
                title="Security"
              >

                <p>
                  AmoraLive uses technical and organisational measures designed
                  to protect personal information against unauthorized access,
                  loss, misuse, alteration or destruction.
                </p>

                <BulletList
                  items={[
                    'Access controls.',
                    'Authentication and authorization mechanisms.',
                    'Encryption where appropriate.',
                    'Security monitoring.',
                    'Infrastructure safeguards.',
                    'Logging and abuse detection.',
                    'Operational security procedures.',
                    'Incident-response processes.'
                  ]}
                />

                <div className="privacy-security-banner">

                  <div className="privacy-lock">
                    🔐
                  </div>

                  <div>
                    <strong>
                      No internet service can guarantee absolute security.
                    </strong>

                    <p>
                      We continuously work to reduce security risks, but users
                      should also protect their passwords, devices and account
                      credentials.
                    </p>
                  </div>

                </div>

              </Section>

              <Section
                id="rights"
                number="21"
                title="Your Privacy Rights"
              >

                <p>
                  Depending on your location and the applicable law, you may
                  have rights over your personal information.
                </p>

                <BulletList items={rights} />

                <p>
                  The availability and scope of individual rights can depend on
                  the legal basis and circumstances of processing. Some rights
                  are not absolute.
                </p>

                <div className="privacy-rights-card">

                  <div className="privacy-right-icon">
                    ✓
                  </div>

                  <div>
                    <strong>
                      Access. Correct. Delete. Object. Export.
                    </strong>

                    <p>
                      Where applicable, you can exercise your rights by
                      contacting AmoraLive through the privacy contact provided
                      in this policy.
                    </p>
                  </div>

                </div>

              </Section>

              <Section
                id="consent"
                number="22"
                title="Consent & Withdrawal"
              >

                <p>
                  Where processing is based on consent, you may withdraw that
                  consent at any time.
                </p>

                <p>
                  Withdrawal does not affect the lawfulness of processing that
                  occurred before consent was withdrawn.
                </p>

                <p>
                  Where processing has another lawful basis, withdrawing
                  consent does not necessarily require that processing to stop.
                </p>

              </Section>

              <Section
                id="children"
                number="23"
                title="Children & Age Protection"
              >

                <p>
                  AmoraLive is intended for adults unless a particular
                  AmoraLive service expressly states otherwise.
                </p>

                <p>
                  We do not knowingly seek to collect personal information
                  from children in violation of applicable law.
                </p>

                <p>
                  If you believe a child has provided personal information to
                  AmoraLive contrary to the applicable age requirements, please
                  contact our privacy team.
                </p>

              </Section>

              <Section
                id="thirdparty"
                number="24"
                title="Third-Party Services"
              >

                <p>
                  AmoraLive may use third-party providers for hosting,
                  authentication, payments, analytics, communications,
                  security and other technical services.
                </p>

                <p>
                  Third-party services may process information under their own
                  privacy policies and contractual obligations.
                </p>

                <p>
                  The exact providers used by AmoraLive should be listed in an
                  internal vendor register and, where appropriate, disclosed in
                  this policy or a supplementary provider list.
                </p>

                <div className="privacy-placeholder">

                  <span>VENDOR REGISTER</span>

                  <strong>
                    [INSERT ACTUAL SERVICE PROVIDERS]
                  </strong>

                  <p>
                    Examples may include infrastructure, authentication,
                    payment, email, analytics, monitoring and security
                    providers — but only list providers actually used by
                    AmoraLive.
                  </p>

                </div>

              </Section>

              <Section
                id="deletion"
                number="25"
                title="Account Deletion"
              >

                <p>
                  Where supported by the product, you may request deletion of
                  your AmoraLive account through account settings or by
                  contacting us.
                </p>

                <p>
                  Deleting an account does not necessarily require immediate
                  deletion of every record. Certain information may need to be
                  retained for legal obligations, fraud prevention, security,
                  dispute resolution, accounting or other lawful purposes.
                </p>

                <div className="privacy-delete-card">

                  <strong>
                    Want to leave AmoraLive?
                  </strong>

                  <span>
                    Your deletion request will be handled according to
                    applicable law and our retention requirements.
                  </span>

                </div>

              </Section>

              <Section
                id="breach"
                number="26"
                title="Security Incidents"
              >

                <p>
                  AmoraLive maintains processes for identifying, investigating
                  and responding to security incidents.
                </p>

                <p>
                  Where applicable law requires notification of a personal-data
                  breach to a supervisory authority or affected individuals,
                  AmoraLive will follow the legally applicable requirements.
                </p>

              </Section>

              <Section
                id="complaints"
                number="27"
                title="Complaints & Authorities"
              >

                <p>
                  If you have a concern about how AmoraLive processes your
                  personal information, please contact us first so that we can
                  investigate the issue.
                </p>

                <p>
                  Where applicable, you may also have the right to lodge a
                  complaint with the competent data-protection supervisory
                  authority in your country or jurisdiction.
                </p>

                <div className="privacy-authority-grid">

                  <div>
                    <strong>European Union / EEA</strong>
                    <span>
                      Your competent national data-protection authority.
                    </span>
                  </div>

                  <div>
                    <strong>Switzerland</strong>
                    <span>
                      The competent Swiss data-protection authority where
                      applicable.
                    </span>
                  </div>

                </div>

              </Section>

              <Section
                id="changes"
                number="28"
                title="Changes to This Policy"
              >

                <p>
                  AmoraLive may update this Privacy Policy when our services,
                  technology, legal obligations or data-processing practices
                  change.
                </p>

                <p>
                  Material changes will be communicated in an appropriate
                  manner where required by applicable law.
                </p>

                <p>
                  The effective date at the top of this policy indicates the
                  current version.
                </p>

              </Section>

              <Section
                id="contact"
                number="29"
                title="Privacy Contact"
              >

                <p>
                  For privacy questions, data-subject requests or concerns,
                  contact AmoraLive using the official privacy contact below.
                </p>

                <div className="privacy-contact-card">

                  <div className="privacy-contact-logo">
                    A
                  </div>

                  <div>

                    <span>
                      AMORALIVE PRIVACY
                    </span>

                    <strong>
                      [INSERT AMORALIVE LEGAL ENTITY]
                    </strong>

                    <p>
                      Privacy email:
                      <br />
                      [INSERT PRIVACY EMAIL]
                    </p>

                    <p>
                      Registered address:
                      <br />
                      [INSERT REGISTERED ADDRESS]
                    </p>

                    <p>
                      Data Protection Officer:
                      <br />
                      [INSERT DPO INFORMATION OR "NOT APPOINTED"]
                    </p>

                  </div>

                </div>

              </Section>

              {/* FINAL */}
              <div className="privacy-final-card">

                <div className="privacy-final-glow" />

                <div className="privacy-final-symbol">
                  A
                </div>

                <div>

                  <div className="privacy-label">
                    AMORALIVE PRIVACY PRINCIPLE
                  </div>

                  <h2>
                    Your Data. Your Rights.
                  </h2>

                  <p>
                    AmoraLive is committed to building a modern social
                    experience while respecting privacy, security,
                    transparency and applicable data-protection law.
                  </p>

                  <p>
                    We believe users should understand what happens to their
                    information and have meaningful choices over their data.
                  </p>

                </div>

              </div>

              {/* FOOTER */}
              <div className="privacy-document-footer">

                <div>
                  <strong>
                    AMORALIVE
                  </strong>

                  <span>
                    Privacy Policy • August 2026
                  </span>
                </div>

                <div className="privacy-footer-links">

                  <Link href="/legal/terms">
                    Terms
                  </Link>

                  <Link href="/legal/community-guidelines">
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

          .privacy-page {
            min-height: 100vh;
            position: relative;
            overflow: hidden;
            background:
              radial-gradient(
                circle at 10% 0%,
                rgba(255, 63, 157, .11),
                transparent 30%
              ),
              radial-gradient(
                circle at 90% 15%,
                rgba(155, 53, 255, .10),
                transparent 30%
              ),
              #07070d;
            color: #dedee5;
          }

          .privacy-shell {
            max-width: 1420px;
            margin: 0 auto;
            padding: 34px 24px 90px;
            position: relative;
            z-index: 2;
          }

          .privacy-ambient {
            position: fixed;
            width: 430px;
            height: 430px;
            border-radius: 50%;
            filter: blur(125px);
            pointer-events: none;
            opacity: .17;
            z-index: 0;
          }

          .privacy-ambient-one {
            background: #ff3f9d;
            top: 5%;
            left: -280px;
          }

          .privacy-ambient-two {
            background: #873dff;
            bottom: 5%;
            right: -280px;
          }

          .privacy-hero {
            min-height: 410px;
            position: relative;
            overflow: hidden;
            border-radius: 32px;
            border: 1px solid rgba(255,255,255,.09);
            background:
              linear-gradient(
                135deg,
                rgba(255,255,255,.065),
                rgba(255,255,255,.018)
              );
            backdrop-filter: blur(22px);
            box-shadow:
              0 35px 100px rgba(0,0,0,.35),
              inset 0 1px 0 rgba(255,255,255,.06);
          }

          .privacy-grid {
            position: absolute;
            inset: 0;
            opacity: .15;
            background-image:
              linear-gradient(
                rgba(255,255,255,.05) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(255,255,255,.05) 1px,
                transparent 1px
              );
            background-size: 42px 42px;
            mask-image: linear-gradient(
              to bottom,
              black,
              transparent
            );
          }

          .privacy-hero-content {
            position: relative;
            z-index: 3;
            max-width: 790px;
            padding: 64px;
          }

          .privacy-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 13px;
            border-radius: 999px;
            border: 1px solid rgba(255,107,157,.35);
            background: rgba(255,63,157,.08);
            color: #ff7eaf;
            font-size: 10px;
            letter-spacing: 2px;
            font-weight: 900;
          }

          .privacy-badge-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #ff5da8;
            box-shadow: 0 0 15px #ff3f9d;
          }

          .privacy-hero h1 {
            margin: 28px 0 20px;
            color: #fff;
            font-size: clamp(44px, 6vw, 76px);
            line-height: .95;
            letter-spacing: -4px;
            font-weight: 950;
          }

          .privacy-hero h1 span {
            background:
              linear-gradient(
                110deg,
                #ff4f9f,
                #ff85b9 45%,
                #a65cff
              );
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }

          .privacy-hero-description {
            max-width: 690px;
            color: #a9a9b5;
            font-size: 16px;
            line-height: 1.75;
            margin: 0;
          }

          .privacy-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 34px;
            margin-top: 32px;
          }

          .privacy-meta div {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .privacy-meta span {
            color: #666673;
            font-size: 9px;
            letter-spacing: 1.8px;
            font-weight: 800;
          }

          .privacy-meta strong {
            color: #eee;
            font-size: 12px;
          }

          .privacy-shield {
            width: 350px;
            height: 350px;
            position: absolute;
            right: 4%;
            top: 50%;
            transform: translateY(-50%);
            display: grid;
            place-items: center;
          }

          .shield-ring {
            position: absolute;
            border-radius: 50%;
            border: 1px solid rgba(255,107,157,.22);
          }

          .shield-ring-one {
            width: 330px;
            height: 330px;
            transform: rotate(25deg);
          }

          .shield-ring-two {
            width: 250px;
            height: 250px;
            transform: rotate(-40deg);
            border-color: rgba(166,92,255,.28);
          }

          .shield {
            width: 170px;
            height: 195px;
            position: relative;
            clip-path: polygon(
              50% 0%,
              91% 17%,
              84% 65%,
              50% 100%,
              16% 65%,
              9% 17%
            );
            display: grid;
            place-items: center;
            background:
              linear-gradient(
                145deg,
                #ff3f9d,
                #9b35ff
              );
            box-shadow:
              0 0 70px rgba(255,63,157,.3);
          }

          .shield-inner {
            width: 128px;
            height: 150px;
            clip-path: polygon(
              50% 0%,
              91% 17%,
              84% 65%,
              50% 100%,
              16% 65%,
              9% 17%
            );
            display: grid;
            place-items: center;
            background: #0b0b12;
            color: #fff;
            font-size: 45px;
            font-weight: 950;
          }

          .privacy-status-grid {
            display: grid;
            grid-template-columns: repeat(4,1fr);
            gap: 12px;
            margin: 18px 0;
          }

          .privacy-status-card {
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

          .privacy-status-icon {
            width: 43px;
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

          .privacy-status-card strong,
          .privacy-status-card span {
            display: block;
          }

          .privacy-status-card strong {
            color: #eee;
            font-size: 12px;
          }

          .privacy-status-card span {
            color: #777783;
            font-size: 10px;
            margin-top: 4px;
          }

          .privacy-notice {
            display: flex;
            gap: 15px;
            align-items: flex-start;
            margin: 18px 0 28px;
            padding: 20px;
            border-radius: 18px;
            border: 1px solid rgba(255,107,157,.16);
            background:
              linear-gradient(
                135deg,
                rgba(255,63,157,.06),
                rgba(155,53,255,.05)
              );
          }

          .privacy-notice-icon {
            width: 34px;
            min-width: 34px;
            height: 34px;
            border-radius: 10px;
            display: grid;
            place-items: center;
            background: rgba(255,63,157,.12);
            color: #ff7db0;
            font-weight: 950;
          }

          .privacy-notice strong {
            color: #ffe8f1;
            font-size: 13px;
          }

          .privacy-notice p {
            margin: 6px 0 0;
            color: #9999a4;
            font-size: 12px;
            line-height: 1.7;
          }

          .privacy-layout {
            display: grid;
            grid-template-columns: 280px minmax(0,1fr);
            gap: 28px;
            align-items: start;
          }

          .privacy-sidebar {
            position: sticky;
            top: 20px;
            z-index: 20;
          }

          .privacy-sidebar-inner {
            padding: 16px;
            border-radius: 22px;
            border: 1px solid rgba(255,255,255,.08);
            background: rgba(10,10,17,.78);
            backdrop-filter: blur(20px);
          }

          .privacy-sidebar-title {
            padding: 8px 8px 15px;
            border-bottom: 1px solid rgba(255,255,255,.06);
          }

          .privacy-sidebar-title span {
            display: block;
            color: #666673;
            font-size: 8px;
            letter-spacing: 2px;
            font-weight: 900;
          }

          .privacy-sidebar-title strong {
            display: block;
            margin-top: 5px;
            color: #eee;
            font-size: 14px;
          }

          .privacy-search {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 13px 0;
            padding: 9px 10px;
            border-radius: 12px;
            background: rgba(255,255,255,.04);
            border: 1px solid rgba(255,255,255,.07);
          }

          .privacy-search span {
            color: #888;
            font-size: 18px;
          }

          .privacy-search input {
            width: 100%;
            border: 0;
            outline: 0;
            background: transparent;
            color: #fff;
            font-size: 11px;
          }

          .privacy-search input::placeholder {
            color: #666673;
          }

          .privacy-sidebar nav {
            display: flex;
            flex-direction: column;
            max-height: 590px;
            overflow-y: auto;
            padding-right: 3px;
          }

          .privacy-sidebar nav button {
            display: flex;
            align-items: center;
            gap: 9px;
            padding: 7px;
            border: 0;
            border-radius: 9px;
            background: transparent;
            color: #777782;
            text-align: left;
            font-size: 10px;
            cursor: pointer;
            transition: .18s ease;
          }

          .privacy-sidebar nav button:hover {
            color: #fff;
            background: rgba(255,63,157,.07);
          }

          .privacy-sidebar nav button span {
            width: 21px;
            color: #4f4f5b;
            font-size: 8px;
            font-weight: 900;
          }

          .privacy-sidebar-links {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 12px;
            padding-top: 13px;
            border-top: 1px solid rgba(255,255,255,.06);
          }

          .privacy-sidebar-links a {
            color: #ff70aa;
            text-decoration: none;
            font-size: 10px;
            font-weight: 700;
          }

          .privacy-mobile-button {
            display: none;
          }

          .privacy-document {
            min-width: 0;
            padding: 25px clamp(20px,4vw,55px);
            border-radius: 25px;
            border: 1px solid rgba(255,255,255,.075);
            background: rgba(10,10,17,.64);
            backdrop-filter: blur(18px);
          }

          .privacy-section {
            display: grid;
            grid-template-columns: 62px minmax(0,1fr);
            gap: 22px;
            padding: 40px 0;
            border-bottom: 1px solid rgba(255,255,255,.06);
            scroll-margin-top: 30px;
          }

          .privacy-section:first-child {
            padding-top: 20px;
          }

          .privacy-number {
            padding-top: 4px;
            color: #ff5da8;
            font-size: 12px;
            font-weight: 950;
            opacity: .75;
          }

          .privacy-label {
            margin-bottom: 7px;
            color: #ff639f;
            font-size: 8px;
            letter-spacing: 2.1px;
            font-weight: 900;
          }

          .privacy-content h2 {
            margin: 0 0 16px;
            color: #fff;
            font-size: clamp(21px,2.5vw,28px);
            line-height: 1.2;
            letter-spacing: -.7px;
          }

          .privacy-content p {
            margin: 0 0 14px;
            color: #a6a6b0;
            font-size: 13px;
            line-height: 1.85;
          }

          .privacy-list {
            display: flex;
            flex-direction: column;
            gap: 9px;
            margin: 16px 0;
            padding: 0;
            list-style: none;
          }

          .privacy-list li {
            display: flex;
            gap: 10px;
            color: #a6a6b0;
            font-size: 12px;
            line-height: 1.7;
          }

          .privacy-bullet {
            width: 5px;
            min-width: 5px;
            height: 5px;
            margin-top: 8px;
            border-radius: 50%;
            background: #ff5da8;
            box-shadow: 0 0 10px rgba(255,93,168,.5);
          }

          .privacy-quote {
            position: relative;
            overflow: hidden;
            margin: 20px 0;
            padding: 18px;
            border-radius: 15px;
            background:
              linear-gradient(
                135deg,
                rgba(255,63,157,.08),
                rgba(155,53,255,.06)
              );
            border: 1px solid rgba(255,107,157,.15);
          }

          .privacy-quote-mark {
            position: absolute;
            top: -15px;
            right: 18px;
            color: rgba(255,107,157,.1);
            font-size: 100px;
            font-weight: 900;
          }

          .privacy-quote p {
            position: relative;
            z-index: 2;
            margin: 0;
            color: #ddd;
            font-size: 13px;
          }

          .privacy-placeholder {
            margin: 20px 0;
            padding: 20px;
            border-radius: 16px;
            border: 1px dashed rgba(255,180,60,.25);
            background: rgba(255,180,60,.035);
          }

          .privacy-placeholder span {
            display: block;
            color: #ff639f;
            font-size: 8px;
            letter-spacing: 1.8px;
            font-weight: 900;
          }

          .privacy-placeholder strong {
            display: block;
            margin-top: 7px;
            color: #eee;
            font-size: 13px;
          }

          .privacy-placeholder p {
            margin: 8px 0 0;
            font-size: 11px;
          }

          .privacy-data-grid {
            display: grid;
            grid-template-columns: repeat(2,1fr);
            gap: 10px;
            margin: 20px 0;
          }

          .privacy-data-card {
            padding: 16px;
            border-radius: 15px;
            border: 1px solid rgba(255,255,255,.07);
            background: rgba(255,255,255,.025);
          }

          .privacy-data-number {
            margin-bottom: 10px;
            color: #ff639f;
            font-size: 8px;
            letter-spacing: 1px;
            font-weight: 900;
          }

          .privacy-data-card strong {
            display: block;
            margin-bottom: 6px;
            color: #eee;
            font-size: 12px;
          }

          .privacy-data-card span {
            display: block;
            color: #777783;
            font-size: 10px;
            line-height: 1.7;
          }

          .privacy-basis-grid,
          .privacy-recipient-grid,
          .privacy-retention-grid,
          .privacy-cookie-grid {
            display: grid;
            grid-template-columns: repeat(2,1fr);
            gap: 9px;
            margin-top: 20px;
          }

          .privacy-basis-grid div,
          .privacy-recipient-grid div,
          .privacy-retention-grid div,
          .privacy-cookie-grid div {
            padding: 15px;
            border-radius: 13px;
            border: 1px solid rgba(255,255,255,.07);
            background: rgba(255,255,255,.025);
          }

          .privacy-basis-grid strong,
          .privacy-recipient-grid strong,
          .privacy-retention-grid strong,
          .privacy-cookie-grid strong {
            display: block;
            margin-bottom: 5px;
            color: #eee;
            font-size: 11px;
          }

          .privacy-basis-grid span,
          .privacy-recipient-grid span,
          .privacy-retention-grid span,
          .privacy-cookie-grid span {
            display: block;
            color: #777783;
            font-size: 10px;
            line-height: 1.65;
          }

          .privacy-warning {
            margin: 20px 0;
            padding: 18px;
            border-radius: 15px;
            border: 1px solid rgba(255,180,60,.16);
            background: rgba(255,180,60,.04);
          }

          .privacy-warning strong {
            color: #ffd27b;
            font-size: 12px;
          }

          .privacy-warning p {
            margin: 7px 0 0;
          }

          .privacy-security-card,
          .privacy-security-banner,
          .privacy-ai-card,
          .privacy-rights-card {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            margin: 20px 0;
            padding: 18px;
            border-radius: 16px;
            background:
              linear-gradient(
                135deg,
                rgba(255,63,157,.07),
                rgba(155,53,255,.06)
              );
            border: 1px solid rgba(255,107,157,.14);
          }

          .privacy-security-icon,
          .privacy-ai-symbol,
          .privacy-right-icon {
            width: 42px;
            min-width: 42px;
            height: 42px;
            display: grid;
            place-items: center;
            border-radius: 12px;
            background: linear-gradient(135deg,#ff3f9d,#9b35ff);
            color: #fff;
            font-weight: 950;
          }

          .privacy-security-card strong,
          .privacy-security-banner strong,
          .privacy-ai-card strong,
          .privacy-rights-card strong {
            display: block;
            color: #eee;
            font-size: 12px;
          }

          .privacy-security-card p,
          .privacy-security-banner p,
          .privacy-ai-card p,
          .privacy-rights-card p {
            margin: 6px 0 0;
            font-size: 11px;
          }

          .privacy-location-grid {
            display: grid;
            grid-template-columns: repeat(2,1fr);
            gap: 10px;
            margin: 20px 0;
          }

          .privacy-location-grid div {
            padding: 16px;
            border-radius: 14px;
            background: rgba(255,255,255,.025);
            border: 1px solid rgba(255,255,255,.07);
          }

          .privacy-location-grid strong {
            display: block;
            color: #eee;
            font-size: 11px;
            margin-bottom: 5px;
          }

          .privacy-location-grid span {
            color: #777783;
            font-size: 10px;
            line-height: 1.6;
          }

          .privacy-delete-card {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-top: 20px;
            padding: 18px;
            border-radius: 15px;
            border: 1px solid rgba(255,63,157,.15);
            background: rgba(255,63,157,.05);
          }

          .privacy-delete-card strong {
            color: #eee;
            font-size: 12px;
          }

          .privacy-delete-card span {
            color: #777783;
            font-size: 10px;
          }

          .privacy-authority-grid {
            display: grid;
            grid-template-columns: repeat(2,1fr);
            gap: 10px;
            margin-top: 20px;
          }

          .privacy-authority-grid div {
            padding: 16px;
            border-radius: 14px;
            border: 1px solid rgba(255,255,255,.07);
            background: rgba(255,255,255,.025);
          }

          .privacy-authority-grid strong {
            display: block;
            color: #eee;
            font-size: 11px;
            margin-bottom: 5px;
          }

          .privacy-authority-grid span {
            color: #777783;
            font-size: 10px;
            line-height: 1.6;
          }

          .privacy-contact-card {
            display: flex;
            align-items: flex-start;
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

          .privacy-contact-logo,
          .privacy-final-symbol {
            width: 52px;
            min-width: 52px;
            height: 52px;
            display: grid;
            place-items: center;
            border-radius: 16px;
            background: linear-gradient(135deg,#ff3f9d,#9b35ff);
            color: #fff;
            font-size: 24px;
            font-weight: 950;
            box-shadow: 0 0 30px rgba(255,63,157,.22);
          }

          .privacy-contact-card span {
            display: block;
            color: #777783;
            font-size: 8px;
            letter-spacing: 1.8px;
            font-weight: 900;
          }

          .privacy-contact-card strong {
            display: block;
            margin-top: 5px;
            color: #eee;
            font-size: 13px;
          }

          .privacy-contact-card p {
            margin: 7px 0 0;
            color: #777783;
            font-size: 10px;
            line-height: 1.7;
          }

          .privacy-final-card {
            display: flex;
            align-items: center;
            gap: 18px;
            position: relative;
            overflow: hidden;
            margin: 40px 0 20px;
            padding: 28px;
            border-radius: 22px;
            background:
              linear-gradient(
                135deg,
                rgba(255,63,157,.12),
                rgba(155,53,255,.10)
              );
            border: 1px solid rgba(255,107,157,.2);
          }

          .privacy-final-glow {
            position: absolute;
            width: 220px;
            height: 220px;
            right: -110px;
            top: -110px;
            border-radius: 50%;
            background: #ff3f9d;
            filter: blur(90px);
            opacity: .15;
          }

          .privacy-final-card h2 {
            margin: 3px 0 8px;
            color: #fff;
            font-size: 26px;
          }

          .privacy-final-card p {
            margin: 4px 0;
            color: #a3a3ae;
            font-size: 12px;
            line-height: 1.7;
          }

          .privacy-document-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            flex-wrap: wrap;
            padding: 24px 0 8px;
          }

          .privacy-document-footer strong,
          .privacy-document-footer span {
            display: block;
          }

          .privacy-document-footer strong {
            color: #eee;
            font-size: 12px;
          }

          .privacy-document-footer span {
            margin-top: 3px;
            color: #62626d;
            font-size: 9px;
          }

          .privacy-footer-links {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
          }

          .privacy-footer-links a {
            color: #ff70aa;
            text-decoration: none;
            font-size: 10px;
            font-weight: 700;
          }

          @media (max-width: 1100px) {

            .privacy-shield {
              right: -80px;
              opacity: .45;
            }

            .privacy-status-grid {
              grid-template-columns: repeat(2,1fr);
            }

          }

          @media (max-width: 850px) {

            .privacy-shell {
              padding: 16px 12px 60px;
            }

            .privacy-hero {
              min-height: 475px;
              border-radius: 24px;
            }

            .privacy-hero-content {
              padding: 42px 25px;
            }

            .privacy-shield {
              width: 230px;
              height: 230px;
              right: -35px;
              top: auto;
              bottom: -70px;
              opacity: .28;
            }

            .shield-ring-one {
              width: 220px;
              height: 220px;
            }

            .shield-ring-two {
              width: 165px;
              height: 165px;
            }

            .shield {
              width: 110px;
              height: 125px;
            }

            .shield-inner {
              width: 82px;
              height: 96px;
              font-size: 30px;
            }

            .privacy-layout {
              grid-template-columns: 1fr;
            }

            .privacy-sidebar {
              position: sticky;
              top: 8px;
              z-index: 50;
            }

            .privacy-mobile-button {
              width: 100%;
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 13px;
              border-radius: 14px;
              border: 1px solid rgba(255,255,255,.09);
              background: rgba(10,10,17,.95);
              color: #fff;
              font-size: 11px;
              font-weight: 800;
              cursor: pointer;
            }

            .privacy-sidebar-inner {
              display: none;
              margin-top: 7px;
            }

            .privacy-sidebar-open
              .privacy-sidebar-inner {
              display: block;
            }

            .privacy-sidebar nav {
              max-height: 300px;
            }

            .privacy-document {
              padding: 12px 18px;
              border-radius: 20px;
            }

          }

          @media (max-width: 600px) {

            .privacy-hero h1 {
              font-size: 48px;
              letter-spacing: -3px;
            }

            .privacy-hero-description {
              font-size: 13px;
            }

            .privacy-meta {
              gap: 18px;
            }

            .privacy-status-grid {
              grid-template-columns: 1fr;
            }

            .privacy-section {
              grid-template-columns: 35px minmax(0,1fr);
              gap: 10px;
              padding: 30px 0;
            }

            .privacy-number {
              font-size: 10px;
            }

            .privacy-data-grid,
            .privacy-basis-grid,
            .privacy-recipient-grid,
            .privacy-retention-grid,
            .privacy-cookie-grid,
            .privacy-location-grid,
            .privacy-authority-grid {
              grid-template-columns: 1fr;
            }

            .privacy-final-card {
              flex-direction: column;
              align-items: flex-start;
            }

            .privacy-contact-card {
              align-items: flex-start;
            }

          }

        `}</style>

      </div>
    </Layout>
  );
}
