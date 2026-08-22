// pages/legal/cookies.jsx

import React, { useState } from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';

const AMORA_LOGO = '/images/amora-logo.png';

const cookieCategories = [
  {
    icon: '◆',
    title: 'Strictly Necessary',
    badge: 'ALWAYS ACTIVE',
    color: 'pink',
    description:
      'These technologies are necessary for AmoraLive to operate securely and provide core functionality requested by users.',
    examples: [
      'Authentication and login sessions',
      'Account and session security',
      'Fraud and abuse prevention',
      'Load balancing and service availability',
      'Security tokens and request protection',
      'Cookie-consent preferences',
      'Basic functionality required to deliver the service'
    ],
    consent: 'These technologies may operate without consent where legally permitted because they are necessary for the service requested by the user.'
  },
  {
    icon: '✦',
    title: 'Preferences',
    badge: 'OPTIONAL',
    color: 'purple',
    description:
      'These technologies remember choices you make so AmoraLive can provide a more personalized experience.',
    examples: [
      'Language preferences',
      'Interface preferences',
      'Display settings',
      'Selected region or settings',
      'Previously selected cookie preferences',
      'Other functionality preferences'
    ],
    consent:
      'Where required by applicable law, these technologies are activated only after you provide the appropriate consent.'
  },
  {
    icon: '◌',
    title: 'Analytics',
    badge: 'OPTIONAL',
    color: 'blue',
    description:
      'Analytics technologies help us understand how users interact with AmoraLive so we can improve performance, reliability and usability.',
    examples: [
      'Page and feature usage',
      'Performance measurements',
      'Error and diagnostic information',
      'Traffic patterns',
      'Feature engagement',
      'Aggregated usage statistics'
    ],
    consent:
      'Where analytics involves non-essential cookies or similar technologies, AmoraLive will request consent where required by applicable law.'
  },
  {
    icon: '◇',
    title: 'Advertising & Personalisation',
    badge: 'OPTIONAL',
    color: 'gold',
    description:
      'If AmoraLive introduces advertising or personalisation technologies that use cookies or similar tracking technologies, they may be used to measure advertising performance or personalise advertising.',
    examples: [
      'Advertising measurement',
      'Campaign attribution',
      'Frequency management',
      'Advertising personalisation',
      'Cross-site or cross-service measurement where applicable'
    ],
    consent:
      'These technologies will not be activated where consent is legally required unless the required consent has been obtained.'
  }
];

const commonQuestions = [
  {
    question: 'Can I refuse optional cookies?',
    answer:
      'Yes. Where consent is required, you can refuse optional cookies and similar technologies. Refusing optional technologies should not prevent access to core AmoraLive functionality unless a particular feature genuinely depends on the technology.'
  },
  {
    question: 'Can I change my decision later?',
    answer:
      'Yes. Where AmoraLive provides a cookie-preference mechanism, you can revisit your choices and withdraw or modify consent. Withdrawal should be as easy as giving consent where consent is required.'
  },
  {
    question: 'Does deleting cookies log me out?',
    answer:
      'It may. If authentication or security information is stored using cookies or similar technologies, deleting those technologies may require you to sign in again or reset certain preferences.'
  },
  {
    question: 'Does AmoraLive use cookies to sell my personal data?',
    answer:
      'AmoraLive does not intend to sell personal data through cookies. Any processing involving third-party technologies remains subject to applicable privacy, data-protection and consumer-protection requirements.'
  },
  {
    question: 'Are cookies the only tracking technology?',
    answer:
      'No. Websites and applications may also use technologies such as pixels, SDKs, local storage, device identifiers, tags or similar technologies. This policy uses “cookies and similar technologies” where appropriate.'
  }
];

function Section({ number, eyebrow, title, children }) {
  return (
    <section className="cookie-section">
      <div className="cookie-section-number">{number}</div>

      <div className="cookie-section-content">
        <div className="cookie-eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        {children}
      </div>
    </section>
  );
}

function CookieCategoryCard({ category }) {
  return (
    <div className={`cookie-category-card ${category.color}`}>
      <div className="cookie-category-top">
        <div className="cookie-category-icon">
          {category.icon}
        </div>

        <div>
          <div className="cookie-category-badge">
            {category.badge}
          </div>

          <h3>{category.title}</h3>
        </div>
      </div>

      <p>{category.description}</p>

      <div className="cookie-example-title">
        TYPICAL PURPOSES
      </div>

      <ul>
        {category.examples.map((item, index) => (
          <li key={index}>
            <span />
            {item}
          </li>
        ))}
      </ul>

      <div className="cookie-consent-note">
        <strong>Consent</strong>
        <span>{category.consent}</span>
      </div>
    </div>
  );
}

export default function Cookies() {
  const [openQuestion, setOpenQuestion] = useState(null);

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <Layout>

      <div className="cookies-page">

        <div className="cookies-orb cookies-orb-one" />
        <div className="cookies-orb cookies-orb-two" />

        <div className="cookies-shell">

          {/* =========================================================
              HERO
          ========================================================= */}

          <header className="cookies-hero">

            <div className="cookies-grid" />

            <div className="cookies-hero-content">

              <div className="cookies-badge">
                <span />
                AMORALIVE PRIVACY & CONTROL
              </div>

              <h1>
                Cookie
                <br />
                <em>Policy.</em>
              </h1>

              <p>
                This Cookie Policy explains how AmoraLive uses cookies and
                similar technologies to operate, secure, improve and
                personalise our services, and how you can control optional
                technologies where applicable.
              </p>

              <div className="cookies-meta">

                <div>
                  <span>VERSION</span>
                  <strong>V1.0.1</strong>
                </div>

                <div>
                  <span>UPDATED</span>
                  <strong>August 2026</strong>
                </div>

                <div>
                  <span>APPLIES TO</span>
                  <strong>AMORALIVE SERVICES</strong>
                </div>

              </div>

            </div>

            <div className="cookies-hero-logo">

              <div className="cookies-logo-ring ring-a" />
              <div className="cookies-logo-ring ring-b" />

              <div className="cookies-logo-core">

                <img
                  src={AMORA_LOGO}
                  alt="AmoraLive official logo"
                />

              </div>

            </div>

          </header>

          {/* =========================================================
              QUICK SUMMARY
          ========================================================= */}

          <div className="cookies-summary-grid">

            <div className="cookies-summary-card">
              <div className="summary-icon">✓</div>
              <strong>Necessary</strong>
              <span>
                Core security and functionality.
              </span>
            </div>

            <div className="cookies-summary-card">
              <div className="summary-icon">⚙</div>
              <strong>Choice</strong>
              <span>
                Control optional technologies.
              </span>
            </div>

            <div className="cookies-summary-card">
              <div className="summary-icon">◌</div>
              <strong>Transparency</strong>
              <span>
                Know what technologies do.
              </span>
            </div>

            <div className="cookies-summary-card">
              <div className="summary-icon">⌁</div>
              <strong>Control</strong>
              <span>
                Change preferences where available.
              </span>
            </div>

          </div>

          {/* =========================================================
              LEGAL NOTICE
          ========================================================= */}

          <div className="cookies-notice">

            <div className="cookies-notice-icon">
              !
            </div>

            <div>
              <strong>
                Your choices matter.
              </strong>

              <p>
                AmoraLive distinguishes between technologies that are necessary
                to provide a service and optional technologies used for
                purposes such as preferences, analytics or advertising. Where
                applicable law requires consent, optional technologies should
                only be activated after the appropriate choice has been made.
              </p>
            </div>

          </div>

          {/* =========================================================
              DOCUMENT
          ========================================================= */}

          <article className="cookies-document">

            <Section
              number="01"
              eyebrow="OVERVIEW"
              title="What Are Cookies?"
            >

              <p>
                Cookies are small data files that websites and online services
                may store on a user's device. They can help a service remember
                information, maintain a session, provide security and
                understand how a website or application is being used.
              </p>

              <p>
                Cookies may be temporary or persistent. A session cookie may
                normally disappear when a browser session ends, while a
                persistent cookie can remain until it expires or is deleted.
              </p>

              <p>
                AmoraLive may also use technologies that perform functions
                similar to cookies, including pixels, local storage,
                identifiers, tags, SDKs and other tracking or storage
                mechanisms.
              </p>

              <div className="info-card">

                <div className="info-card-icon">
                  ◈
                </div>

                <div>
                  <strong>
                    Cookies are not automatically “good” or “bad”.
                  </strong>

                  <span>
                    What matters is why they are used, what information they
                    process, who can access the information and whether the
                    technology is necessary or requires user choice under
                    applicable law.
                  </span>
                </div>

              </div>

            </Section>

            <Section
              number="02"
              eyebrow="WHY WE USE THEM"
              title="How AmoraLive Uses Cookies"
            >

              <p>
                Depending on the services and features you use, AmoraLive may
                use cookies and similar technologies for the following
                purposes:
              </p>

              <div className="purpose-grid">

                <div className="purpose-card">
                  <strong>Authentication</strong>
                  <span>
                    Maintain your login session and help recognise your
                    authenticated session.
                  </span>
                </div>

                <div className="purpose-card">
                  <strong>Security</strong>
                  <span>
                    Help detect abuse, suspicious activity, fraudulent
                    behaviour and unauthorised access.
                  </span>
                </div>

                <div className="purpose-card">
                  <strong>Preferences</strong>
                  <span>
                    Remember choices such as language, interface settings and
                    other preferences.
                  </span>
                </div>

                <div className="purpose-card">
                  <strong>Performance</strong>
                  <span>
                    Help us understand errors, reliability and technical
                    performance.
                  </span>
                </div>

                <div className="purpose-card">
                  <strong>Analytics</strong>
                  <span>
                    Understand how features are used so AmoraLive can improve
                    the service.
                  </span>
                </div>

                <div className="purpose-card">
                  <strong>Advertising</strong>
                  <span>
                    If advertising technologies are used, measure campaigns and
                    potentially personalise advertising where legally
                    permitted.
                  </span>
                </div>

              </div>

            </Section>

            <Section
              number="03"
              eyebrow="CATEGORIES"
              title="Types of Cookies & Similar Technologies"
            >

              <p>
                The exact technologies used by AmoraLive may change as the
                platform evolves. The categories below describe the purposes
                for which technologies may be used.
              </p>

              <div className="category-grid">

                {cookieCategories.map((category) => (
                  <CookieCategoryCard
                    key={category.title}
                    category={category}
                  />
                ))}

              </div>

            </Section>

            <Section
              number="04"
              eyebrow="NECESSARY TECHNOLOGIES"
              title="Strictly Necessary Cookies"
            >

              <p>
                Some cookies and similar technologies are necessary for the
                operation of AmoraLive. They can support functions such as
                authentication, security, session management, fraud prevention,
                load balancing and remembering a user's cookie choices.
              </p>

              <p>
                Depending on the applicable legal framework and the specific
                technology, consent may not be required for a technology that
                is genuinely necessary to provide a service explicitly
                requested by the user.
              </p>

              <div className="legal-highlight">

                <strong>
                  IMPORTANT
                </strong>

                <span>
                  AmoraLive does not treat every cookie as “necessary”. A
                  technology should only be considered necessary where its use
                  is genuinely required for the relevant service or function.
                </span>

              </div>

            </Section>

            <Section
              number="05"
              eyebrow="OPTIONAL TECHNOLOGIES"
              title="Analytics, Preferences & Advertising"
            >

              <p>
                Optional technologies may provide additional functionality or
                help AmoraLive understand and improve its services.
              </p>

              <p>
                Where applicable law requires consent before a particular
                cookie or similar technology is stored or accessed, AmoraLive
                will request the required consent before activating that
                technology.
              </p>

              <p>
                Refusing optional technologies should not prevent access to
                core AmoraLive services unless a particular feature genuinely
                requires the relevant technology.
              </p>

            </Section>

            <Section
              number="06"
              eyebrow="YOUR CHOICES"
              title="Cookie Consent & Your Control"
            >

              <p>
                Where consent is required, AmoraLive aims to provide users with
                meaningful choices about optional cookies and similar
                technologies.
              </p>

              <div className="choice-grid">

                <div className="choice-card">
                  <div className="choice-number">01</div>
                  <strong>Accept</strong>
                  <span>
                    Allow the optional categories presented in the consent
                    interface.
                  </span>
                </div>

                <div className="choice-card">
                  <div className="choice-number">02</div>
                  <strong>Reject</strong>
                  <span>
                    Refuse optional technologies where the consent interface
                    provides that choice.
                  </span>
                </div>

                <div className="choice-card">
                  <div className="choice-number">03</div>
                  <strong>Customise</strong>
                  <span>
                    Select individual optional categories when granular
                    controls are available.
                  </span>
                </div>

                <div className="choice-card">
                  <div className="choice-number">04</div>
                  <strong>Withdraw</strong>
                  <span>
                    Revisit your preferences and withdraw consent where the
                    relevant consent mechanism is available.
                  </span>
                </div>

              </div>

              <p>
                Consent should not be inferred merely from continued browsing
                where applicable law requires an affirmative consent action.
                AmoraLive will not describe browsing alone as consent where
                doing so would conflict with applicable requirements.
              </p>

            </Section>

            <Section
              number="07"
              eyebrow="BROWSER CONTROLS"
              title="Managing Cookies in Your Browser"
            >

              <p>
                Most modern browsers allow users to block, delete or manage
                cookies. Browser controls vary between providers and versions.
              </p>

              <ul className="large-list">

                <li>
                  <span />
                  Delete existing cookies from your device.
                </li>

                <li>
                  <span />
                  Block some or all cookies.
                </li>

                <li>
                  <span />
                  Receive warnings when cookies are being stored.
                </li>

                <li>
                  <span />
                  Configure site-specific cookie permissions.
                </li>

              </ul>

              <div className="warning-card">

                <strong>
                  PLEASE NOTE
                </strong>

                <span>
                  Blocking necessary cookies may affect authentication,
                  security, account access or other core functionality.
                </span>

              </div>

            </Section>

            <Section
              number="08"
              eyebrow="THIRD PARTIES"
              title="Third-Party Technologies"
            >

              <p>
                Some AmoraLive features may depend on services provided by
                third parties. Those providers may use cookies or similar
                technologies when their services are integrated into AmoraLive.
              </p>

              <p>
                Examples may include authentication providers, analytics
                providers, security services, content delivery services,
                payment-related services or advertising partners, depending on
                which features AmoraLive operates at a particular time.
              </p>

              <p>
                Third-party providers may process information under their own
                privacy policies and contractual arrangements. AmoraLive does
                not control every technology or practice used by independent
                third parties.
              </p>

              <div className="third-party-note">

                <strong>
                  THIRD-PARTY TRANSPARENCY
                </strong>

                <span>
                  The final cookie inventory displayed to users should identify
                  relevant third-party technologies actually deployed on the
                  AmoraLive service, their purposes, providers and applicable
                  retention periods.
                </span>

              </div>

            </Section>

            <Section
              number="09"
              eyebrow="DATA PROTECTION"
              title="Cookies & Personal Data"
            >

              <p>
                A cookie identifier or information associated with a cookie can
                constitute personal data when it can be linked, directly or
                indirectly, to an identifiable person.
              </p>

              <p>
                Where cookies or similar technologies involve personal data,
                AmoraLive processes that information in accordance with its
                Privacy Policy and applicable data-protection law.
              </p>

              <p>
                Depending on the circumstances, applicable legal frameworks may
                include European data-protection requirements such as the GDPR,
                national ePrivacy rules, and Swiss data-protection requirements
                where they apply.
              </p>

              <div className="law-grid">

                <div className="law-box">
                  <span>EU / EEA</span>
                  <strong>
                    GDPR + applicable ePrivacy rules
                  </strong>
                </div>

                <div className="law-box">
                  <span>SWITZERLAND</span>
                  <strong>
                    FADP + applicable Swiss requirements
                  </strong>
                </div>

                <div className="law-box">
                  <span>OTHER JURISDICTIONS</span>
                  <strong>
                    Applicable local privacy and electronic-communications
                    requirements
                  </strong>
                </div>

              </div>

            </Section>

            <Section
              number="10"
              eyebrow="RETENTION"
              title="How Long Cookies Remain"
            >

              <p>
                Cookies may be session-based or persistent. The period for
                which a particular technology remains active depends on its
                purpose and technical configuration.
              </p>

              <p>
                AmoraLive may use short-lived technologies for a single session
                and longer-lived technologies for preferences, security,
                consent records or other legitimate purposes.
              </p>

              <div className="retention-table">

                <div className="retention-row retention-header">
                  <span>TYPE</span>
                  <span>GENERAL PURPOSE</span>
                  <span>LIFETIME</span>
                </div>

                <div className="retention-row">
                  <strong>Session</strong>
                  <span>Authentication / functionality</span>
                  <span>Session-dependent</span>
                </div>

                <div className="retention-row">
                  <strong>Preference</strong>
                  <span>User settings</span>
                  <span>Configuration-dependent</span>
                </div>

                <div className="retention-row">
                  <strong>Analytics</strong>
                  <span>Service measurement</span>
                  <span>Provider-dependent</span>
                </div>

                <div className="retention-row">
                  <strong>Consent</strong>
                  <span>Remembering choices</span>
                  <span>Configuration-dependent</span>
                </div>

              </div>

              <p className="small-note">
                The table above describes categories rather than a definitive
                technical inventory. The actual cookie inventory should be
                maintained based on the technologies currently deployed by
                AmoraLive.
              </p>

            </Section>

            <Section
              number="11"
              eyebrow="PRIVACY RIGHTS"
              title="Your Data Protection Rights"
            >

              <p>
                Depending on your location and applicable law, you may have
                rights concerning personal data processed through cookies or
                similar technologies.
              </p>

              <ul className="large-list">

                <li>
                  <span />
                  Access information about personal data processing.
                </li>

                <li>
                  <span />
                  Request correction of inaccurate personal data.
                </li>

                <li>
                  <span />
                  Request deletion where legally applicable.
                </li>

                <li>
                  <span />
                  Request restriction of processing in certain circumstances.
                </li>

                <li>
                  <span />
                  Object to certain processing activities.
                </li>

                <li>
                  <span />
                  Request data portability where applicable.
                </li>

                <li>
                  <span />
                  Withdraw consent where processing relies on consent.
                </li>

              </ul>

              <p>
                Additional information about your privacy rights, legal bases
                and how to exercise them is available in the AmoraLive Privacy
                Policy.
              </p>

              <div className="policy-links">

                <Link href="/legal/privacy">
                  Read Privacy Policy →
                </Link>

                <Link href="/legal/terms">
                  Read Terms of Service →
                </Link>

              </div>

            </Section>

            <Section
              number="12"
              eyebrow="SECURITY"
              title="Security & Fraud Prevention"
            >

              <p>
                AmoraLive may use cookies and similar technologies as part of
                security controls designed to protect accounts, sessions and
                the platform from abuse.
              </p>

              <p>
                These technologies may help identify suspicious activity,
                protect authentication sessions, prevent automated abuse and
                support the integrity of the AmoraLive service.
              </p>

              <p>
                No security system can guarantee absolute security. Users
                should protect their account credentials and report suspicious
                activity through the available AmoraLive reporting or support
                mechanisms.
              </p>

            </Section>

            <Section
              number="13"
              eyebrow="SPECIAL CASES"
              title="Cookies on Livestreaming, Dating & Social Features"
            >

              <p>
                AmoraLive contains social, dating, communication,
                livestreaming, entertainment and virtual-item functionality.
                Different parts of the service may use different technologies.
              </p>

              <div className="feature-grid">

                <div>
                  <strong>Livestreaming</strong>
                  <span>
                    Security, session management, performance and feature
                    functionality.
                  </span>
                </div>

                <div>
                  <strong>Dating</strong>
                  <span>
                    Authentication, preferences, safety and service
                    functionality.
                  </span>
                </div>

                <div>
                  <strong>Chat</strong>
                  <span>
                    Session, security and communication functionality.
                  </span>
                </div>

                <div>
                  <strong>Gifts</strong>
                  <span>
                    Security, fraud prevention and transaction-related
                    functionality.
                  </span>
                </div>

                <div>
                  <strong>Battles</strong>
                  <span>
                    Session integrity, anti-abuse and feature functionality.
                  </span>
                </div>

                <div>
                  <strong>Account</strong>
                  <span>
                    Authentication, preferences and security.
                  </span>
                </div>

              </div>

            </Section>

            <Section
              number="14"
              eyebrow="CHILDREN & SAFETY"
              title="Children & Cookies"
            >

              <p>
                AmoraLive is intended for users who satisfy the minimum age
                requirements stated in our Terms of Service. We do not
                knowingly design optional tracking technologies to target
                children in violation of applicable law.
              </p>

              <p>
                If you believe a child has provided information to AmoraLive in
                circumstances where this should not have occurred, please
                contact us through the appropriate privacy or safety channel.
              </p>

            </Section>

            <Section
              number="15"
              eyebrow="LEGAL FRAMEWORK"
              title="European & Swiss Compliance"
            >

              <p>
                AmoraLive aims to operate its cookie and similar-technology
                practices consistently with applicable legal requirements.
              </p>

              <p>
                For users in the European Union and European Economic Area,
                requirements may arise from the GDPR together with applicable
                rules governing access to or storage of information on user
                devices, including national implementations of the ePrivacy
                framework.
              </p>

              <p>
                For users in Switzerland, AmoraLive also considers applicable
                requirements under Swiss data-protection law and the guidance
                of the Federal Data Protection and Information Commissioner
                concerning cookies and similar technologies.
              </p>

              <p>
                Mandatory rights and protections under applicable law prevail
                over any conflicting statement in this policy.
              </p>

              <div className="europe-card">

                <div className="europe-card-symbol">
                  EU
                </div>

                <div>
                  <strong>
                    EUROPEAN & SWISS USERS
                  </strong>

                  <span>
                    AmoraLive seeks to provide transparent information and
                    meaningful choices concerning optional cookies and similar
                    technologies wherever applicable law requires them.
                  </span>
                </div>

              </div>

            </Section>

            <Section
              number="16"
              eyebrow="UPDATES"
              title="Changes to This Cookie Policy"
            >

              <p>
                AmoraLive may update this Cookie Policy when our technology,
                services, business practices or legal requirements change.
              </p>

              <p>
                When material changes are made, we may provide additional
                notice or request updated consent where required by applicable
                law.
              </p>

              <p>
                The version and date displayed at the beginning of this policy
                identify the current version.
              </p>

            </Section>

            {/* =========================================================
                FAQ
            ========================================================= */}

            <section className="cookie-faq">

              <div className="cookie-eyebrow">
                FREQUENT QUESTIONS
              </div>

              <h2>
                Cookie Questions.
              </h2>

              <div className="faq-list">

                {commonQuestions.map((item, index) => (
                  <div
                    className={`faq-item ${
                      openQuestion === index ? 'faq-open' : ''
                    }`}
                    key={index}
                  >

                    <button
                      type="button"
                      onClick={() => toggleQuestion(index)}
                      aria-expanded={openQuestion === index}
                    >

                      <span>
                        {item.question}
                      </span>

                      <b>
                        {openQuestion === index ? '−' : '+'}
                      </b>

                    </button>

                    {openQuestion === index && (
                      <div className="faq-answer">
                        {item.answer}
                      </div>
                    )}

                  </div>
                ))}

              </div>

            </section>

            {/* =========================================================
                FINAL BRAND CARD
            ========================================================= */}

            <div className="cookie-final-card">

              <div className="cookie-final-logo">

                <img
                  src={AMORA_LOGO}
                  alt="AmoraLive official logo"
                />

              </div>

              <div>

                <div className="cookie-eyebrow">
                  AMORALIVE PRIVACY PROMISE
                </div>

                <h2>
                  Your Data. Your Choice.
                </h2>

                <p>
                  We believe privacy should be understandable, transparent
                  and controllable. AmoraLive will continue improving the way
                  we explain and manage cookies and similar technologies.
                </p>

              </div>

            </div>

            {/* =========================================================
                FOOTER
            ========================================================= */}

            <footer className="cookie-footer">

              <div>

                <strong>
                  AMORALIVE
                </strong>

                <span>
                  Cookie Policy • V1.0.1 • August 2026
                </span>

              </div>

              <div className="cookie-footer-links">

                <Link href="/legal/terms">
                  Terms
                </Link>

                <Link href="/legal/privacy">
                  Privacy
                </Link>

                <Link href="/legal/guidelines">
                  Guidelines
                </Link>

                <Link href="/">
                  Home
                </Link>

              </div>

            </footer>

          </article>

        </div>

        <style jsx global>{`

          html {
            scroll-behavior: smooth;
          }

          .cookies-page {
            min-height: 100vh;
            position: relative;
            overflow: hidden;
            background:
              radial-gradient(
                circle at 10% 0%,
                rgba(255, 63, 157, .12),
                transparent 32%
              ),
              radial-gradient(
                circle at 90% 15%,
                rgba(151, 61, 255, .10),
                transparent 32%
              ),
              #07070d;
            color: #dedee5;
          }

          .cookies-shell {
            max-width: 1420px;
            margin: 0 auto;
            padding: 34px 24px 90px;
            position: relative;
            z-index: 2;
          }

          .cookies-orb {
            position: fixed;
            width: 430px;
            height: 430px;
            border-radius: 50%;
            filter: blur(130px);
            opacity: .14;
            pointer-events: none;
          }

          .cookies-orb-one {
            background: #ff3f9d;
            left: -280px;
            top: 5%;
          }

          .cookies-orb-two {
            background: #963fff;
            right: -280px;
            bottom: 10%;
          }

          /* =========================================================
             HERO
          ========================================================= */

          .cookies-hero {
            min-height: 450px;
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

          .cookies-grid {
            position: absolute;
            inset: 0;
            opacity: .14;
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

          .cookies-hero-content {
            position: relative;
            z-index: 3;
            max-width: 820px;
            padding: 68px;
          }

          .cookies-badge {
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

          .cookies-badge span {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #ff5da8;
            box-shadow: 0 0 15px #ff3f9d;
          }

          .cookies-hero h1 {
            margin: 28px 0 20px;
            color: #fff;
            font-size: clamp(50px, 6vw, 82px);
            line-height: .91;
            letter-spacing: -5px;
            font-weight: 950;
          }

          .cookies-hero h1 em {
            font-style: normal;
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

          .cookies-hero-content > p {
            max-width: 700px;
            margin: 0;
            color: #a9a9b5;
            font-size: 16px;
            line-height: 1.8;
          }

          .cookies-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 34px;
            margin-top: 34px;
          }

          .cookies-meta div {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .cookies-meta span {
            color: #666673;
            font-size: 9px;
            letter-spacing: 1.8px;
            font-weight: 900;
          }

          .cookies-meta strong {
            color: #eee;
            font-size: 11px;
          }

          .cookies-hero-logo {
            position: absolute;
            right: 4%;
            top: 50%;
            width: 360px;
            height: 360px;
            transform: translateY(-50%);
            display: grid;
            place-items: center;
          }

          .cookies-logo-ring {
            position: absolute;
            border-radius: 50%;
            border: 1px solid rgba(255,107,157,.22);
          }

          .ring-a {
            width: 340px;
            height: 340px;
          }

          .ring-b {
            width: 250px;
            height: 250px;
            border-color: rgba(157,80,255,.25);
          }

          .cookies-logo-core {
            width: 175px;
            height: 175px;
            display: grid;
            place-items: center;
            border-radius: 50%;
            background:
              linear-gradient(
                135deg,
                #ff3f9d,
                #9b35ff
              );
            box-shadow:
              0 0 80px rgba(255,63,157,.28);
          }

          .cookies-logo-core img {
            width: 135px;
            height: 135px;
            object-fit: contain;
            display: block;
            filter:
              drop-shadow(0 0 18px rgba(255,255,255,.18))
              drop-shadow(0 0 28px rgba(255,63,157,.24));
          }

          /* =========================================================
             SUMMARY
          ========================================================= */

          .cookies-summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin: 18px 0;
          }

          .cookies-summary-card {
            min-height: 80px;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px;
            border-radius: 18px;
            border: 1px solid rgba(255,255,255,.07);
            background: rgba(255,255,255,.025);
            backdrop-filter: blur(16px);
          }

          .summary-icon {
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
            border: 1px solid rgba(255,107,157,.17);
            color: #ff80b3;
            font-size: 15px;
          }

          .cookies-summary-card strong,
          .cookies-summary-card span {
            display: block;
          }

          .cookies-summary-card strong {
            color: #eee;
            font-size: 12px;
          }

          .cookies-summary-card span {
            margin-top: 4px;
            color: #777783;
            font-size: 10px;
            line-height: 1.5;
          }

          /* =========================================================
             NOTICE
          ========================================================= */

          .cookies-notice {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            margin: 18px 0 28px;
            padding: 20px;
            border-radius: 18px;
            border: 1px solid rgba(255,85,125,.22);
            background:
              linear-gradient(
                135deg,
                rgba(255,63,157,.07),
                rgba(255,80,80,.035)
              );
          }

          .cookies-notice-icon {
            width: 36px;
            min-width: 36px;
            height: 36px;
            display: grid;
            place-items: center;
            border-radius: 11px;
            background: rgba(255,63,157,.14);
            color: #ff79a9;
            font-weight: 950;
          }

          .cookies-notice strong {
            color: #ffe7f0;
            font-size: 13px;
          }

          .cookies-notice p {
            margin: 6px 0 0;
            color: #9999a4;
            font-size: 11px;
            line-height: 1.7;
          }

          /* =========================================================
             DOCUMENT
          ========================================================= */

          .cookies-document {
            min-width: 0;
            padding: 25px clamp(20px,4vw,65px);
            border-radius: 25px;
            border: 1px solid rgba(255,255,255,.075);
            background: rgba(10,10,17,.64);
            backdrop-filter: blur(18px);
          }

          .cookie-section {
            display: grid;
            grid-template-columns: 62px minmax(0,1fr);
            gap: 22px;
            padding: 42px 0;
            border-bottom: 1px solid rgba(255,255,255,.06);
            scroll-margin-top: 30px;
          }

          .cookie-section:first-child {
            padding-top: 25px;
          }

          .cookie-section-number {
            padding-top: 4px;
            color: #ff5da8;
            font-size: 12px;
            font-weight: 950;
          }

          .cookie-eyebrow {
            margin-bottom: 7px;
            color: #ff639f;
            font-size: 8px;
            letter-spacing: 2.1px;
            font-weight: 900;
          }

          .cookie-section-content h2,
          .cookie-faq h2 {
            margin: 0 0 16px;
            color: #fff;
            font-size: clamp(21px,2.5vw,30px);
            line-height: 1.2;
            letter-spacing: -.7px;
          }

          .cookie-section-content p {
            margin: 0 0 15px;
            color: #a6a6b0;
            font-size: 13px;
            line-height: 1.85;
          }

          /* =========================================================
             INFO CARD
          ========================================================= */

          .info-card {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            margin-top: 22px;
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

          .info-card-icon {
            width: 42px;
            min-width: 42px;
            height: 42px;
            display: grid;
            place-items: center;
            border-radius: 12px;
            background:
              linear-gradient(
                135deg,
                #ff3f9d,
                #9b35ff
              );
            color: #fff;
          }

          .info-card strong,
          .info-card span {
            display: block;
          }

          .info-card strong {
            color: #eee;
            font-size: 12px;
          }

          .info-card span {
            margin-top: 6px;
            color: #888894;
            font-size: 10px;
            line-height: 1.7;
          }

          /* =========================================================
             PURPOSES
          ========================================================= */

          .purpose-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 20px;
          }

          .purpose-card {
            padding: 18px;
            border-radius: 15px;
            border: 1px solid rgba(255,255,255,.07);
            background: rgba(255,255,255,.025);
          }

          .purpose-card strong {
            display: block;
            color: #eee;
            font-size: 12px;
            margin-bottom: 7px;
          }

          .purpose-card span {
            display: block;
            color: #777783;
            font-size: 10px;
            line-height: 1.7;
          }

          /* =========================================================
             CATEGORY CARDS
          ========================================================= */

          .category-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-top: 22px;
          }

          .cookie-category-card {
            padding: 20px;
            border-radius: 18px;
            border: 1px solid rgba(255,255,255,.075);
            background: rgba(255,255,255,.025);
          }

          .cookie-category-card.pink {
            border-color: rgba(255,63,157,.17);
          }

          .cookie-category-card.purple {
            border-color: rgba(155,53,255,.17);
          }

          .cookie-category-card.blue {
            border-color: rgba(80,150,255,.15);
          }

          .cookie-category-card.gold {
            border-color: rgba(255,193,75,.15);
          }

          .cookie-category-top {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .cookie-category-icon {
            width: 45px;
            min-width: 45px;
            height: 45px;
            display: grid;
            place-items: center;
            border-radius: 13px;
            background:
              linear-gradient(
                135deg,
                rgba(255,63,157,.16),
                rgba(155,53,255,.16)
              );
            color: #ff80b3;
            font-size: 15px;
          }

          .cookie-category-badge {
            display: inline-block;
            margin-bottom: 3px;
            color: #777783;
            font-size: 7px;
            letter-spacing: 1.5px;
            font-weight: 900;
          }

          .cookie-category-card h3 {
            margin: 0;
            color: #fff;
            font-size: 15px;
          }

          .cookie-category-card > p {
            margin-top: 16px;
            font-size: 11px;
          }

          .cookie-example-title {
            margin-top: 18px;
            margin-bottom: 9px;
            color: #666673;
            font-size: 8px;
            letter-spacing: 1.7px;
            font-weight: 900;
          }

          .cookie-category-card ul {
            display: flex;
            flex-direction: column;
            gap: 7px;
            margin: 0;
            padding: 0;
            list-style: none;
          }

          .cookie-category-card li {
            display: flex;
            gap: 8px;
            color: #8d8d98;
            font-size: 10px;
            line-height: 1.6;
          }

          .cookie-category-card li span {
            width: 4px;
            min-width: 4px;
            height: 4px;
            margin-top: 6px;
            border-radius: 50%;
            background: #ff5da8;
          }

          .cookie-consent-note {
            margin-top: 17px;
            padding-top: 13px;
            border-top: 1px solid rgba(255,255,255,.06);
          }

          .cookie-consent-note strong,
          .cookie-consent-note span {
            display: block;
          }

          .cookie-consent-note strong {
            color: #ff77a9;
            font-size: 8px;
            letter-spacing: 1.4px;
            text-transform: uppercase;
          }

          .cookie-consent-note span {
            margin-top: 5px;
            color: #777783;
            font-size: 9px;
            line-height: 1.6;
          }

          /* =========================================================
             HIGHLIGHTS
          ========================================================= */

          .legal-highlight,
          .warning-card,
          .third-party-note {
            margin-top: 20px;
            padding: 18px;
            border-radius: 15px;
            border: 1px solid rgba(255,75,115,.2);
            background: rgba(255,63,157,.045);
          }

          .legal-highlight strong,
          .warning-card strong,
          .third-party-note strong {
            display: block;
            color: #ff77a9;
            font-size: 9px;
            letter-spacing: 1.8px;
          }

          .legal-highlight span,
          .warning-card span,
          .third-party-note span {
            display: block;
            margin-top: 7px;
            color: #9999a4;
            font-size: 11px;
            line-height: 1.7;
          }

          /* =========================================================
             CHOICES
          ========================================================= */

          .choice-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin: 22px 0;
          }

          .choice-card {
            padding: 17px;
            border-radius: 15px;
            border: 1px solid rgba(255,255,255,.07);
            background: rgba(255,255,255,.025);
          }

          .choice-number {
            margin-bottom: 10px;
            color: #ff639f;
            font-size: 8px;
            letter-spacing: 1.5px;
            font-weight: 900;
          }

          .choice-card strong {
            display: block;
            color: #eee;
            font-size: 12px;
            margin-bottom: 6px;
          }

          .choice-card span {
            display: block;
            color: #777783;
            font-size: 10px;
            line-height: 1.7;
          }

          /* =========================================================
             LIST
          ========================================================= */

          .large-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin: 18px 0;
            padding: 0;
            list-style: none;
          }

          .large-list li {
            display: flex;
            gap: 10px;
            color: #a6a6b0;
            font-size: 12px;
            line-height: 1.7;
          }

          .large-list li span {
            width: 5px;
            min-width: 5px;
            height: 5px;
            margin-top: 8px;
            border-radius: 50%;
            background: #ff5da8;
            box-shadow: 0 0 10px rgba(255,93,168,.5);
          }

          /* =========================================================
             LAW
          ========================================================= */

          .law-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 22px;
          }

          .law-box {
            padding: 17px;
            border-radius: 15px;
            border: 1px solid rgba(255,255,255,.07);
            background: rgba(255,255,255,.025);
          }

          .law-box span,
          .law-box strong {
            display: block;
          }

          .law-box span {
            color: #666673;
            font-size: 8px;
            letter-spacing: 1.4px;
            font-weight: 900;
          }

          .law-box strong {
            margin-top: 8px;
            color: #ddd;
            font-size: 11px;
            line-height: 1.6;
          }

          /* =========================================================
             RETENTION
          ========================================================= */

          .retention-table {
            margin-top: 22px;
            overflow: hidden;
            border-radius: 15px;
            border: 1px solid rgba(255,255,255,.07);
          }

          .retention-row {
            display: grid;
            grid-template-columns: 1fr 2fr 1.2fr;
            gap: 15px;
            padding: 13px 15px;
            border-bottom: 1px solid rgba(255,255,255,.06);
          }

          .retention-row:last-child {
            border-bottom: 0;
          }

          .retention-row span,
          .retention-row strong {
            color: #92929d;
            font-size: 10px;
          }

          .retention-row strong {
            color: #eee;
          }

          .retention-header {
            background: rgba(255,63,157,.05);
          }

          .retention-header span {
            color: #ff70aa;
            font-size: 8px;
            letter-spacing: 1.3px;
            font-weight: 900;
          }

          .small-note {
            margin-top: 13px !important;
            color: #666673 !important;
            font-size: 10px !important;
          }

          /* =========================================================
             POLICY LINKS
          ========================================================= */

          .policy-links {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            margin-top: 18px;
          }

          .policy-links a {
            color: #ff70aa;
            text-decoration: none;
            font-size: 10px;
            font-weight: 800;
          }

          /* =========================================================
             FEATURES
          ========================================================= */

          .feature-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 20px;
          }

          .feature-grid > div {
            padding: 16px;
            border-radius: 14px;
            border: 1px solid rgba(255,255,255,.07);
            background: rgba(255,255,255,.025);
          }

          .feature-grid strong,
          .feature-grid span {
            display: block;
          }

          .feature-grid strong {
            color: #eee;
            font-size: 11px;
            margin-bottom: 6px;
          }

          .feature-grid span {
            color: #777783;
            font-size: 9px;
            line-height: 1.7;
          }

          /* =========================================================
             EUROPE CARD
          ========================================================= */

          .europe-card {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            margin-top: 22px;
            padding: 20px;
            border-radius: 17px;
            background:
              linear-gradient(
                135deg,
                rgba(255,63,157,.08),
                rgba(155,53,255,.07)
              );
            border: 1px solid rgba(255,107,157,.16);
          }

          .europe-card-symbol {
            width: 48px;
            min-width: 48px;
            height: 48px;
            display: grid;
            place-items: center;
            border-radius: 14px;
            background:
              linear-gradient(
                135deg,
                #ff3f9d,
                #9b35ff
              );
            color: #fff;
            font-size: 10px;
            font-weight: 950;
          }

          .europe-card strong,
          .europe-card span {
            display: block;
          }

          .europe-card strong {
            color: #eee;
            font-size: 11px;
          }

          .europe-card span {
            margin-top: 6px;
            color: #888894;
            font-size: 10px;
            line-height: 1.7;
          }

          /* =========================================================
             FAQ
          ========================================================= */

          .cookie-faq {
            padding: 45px 0 10px;
          }

          .faq-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .faq-item {
            overflow: hidden;
            border-radius: 14px;
            border: 1px solid rgba(255,255,255,.07);
            background: rgba(255,255,255,.025);
          }

          .faq-item button {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            padding: 17px;
            border: 0;
            background: transparent;
            color: #eee;
            text-align: left;
            cursor: pointer;
            font-size: 12px;
            font-weight: 700;
          }

          .faq-item button b {
            width: 25px;
            min-width: 25px;
            height: 25px;
            display: grid;
            place-items: center;
            border-radius: 8px;
            background: rgba(255,63,157,.10);
            color: #ff70aa;
            font-size: 16px;
          }

          .faq-answer {
            padding: 0 17px 18px;
            color: #8d8d98;
            font-size: 11px;
            line-height: 1.8;
          }

          .faq-open {
            border-color: rgba(255,107,157,.16);
          }

          /* =========================================================
             FINAL
          ========================================================= */

          .cookie-final-card {
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

          .cookie-final-logo {
            width: 70px;
            min-width: 70px;
            height: 70px;
            display: grid;
            place-items: center;
            border-radius: 20px;
            background:
              linear-gradient(
                135deg,
                rgba(255,63,157,.20),
                rgba(155,53,255,.18)
              );
            border: 1px solid rgba(255,107,157,.22);
            box-shadow:
              0 0 35px rgba(255,63,157,.16);
          }

          .cookie-final-logo img {
            width: 55px;
            height: 55px;
            object-fit: contain;
            display: block;
            filter:
              drop-shadow(0 0 12px rgba(255,255,255,.16))
              drop-shadow(0 0 20px rgba(255,63,157,.20));
          }

          .cookie-final-card h2 {
            margin: 3px 0 8px;
            color: #fff;
            font-size: 26px;
          }

          .cookie-final-card p {
            margin: 0;
            color: #a3a3ae;
            font-size: 12px;
            line-height: 1.7;
          }

          /* =========================================================
             FOOTER
          ========================================================= */

          .cookie-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            flex-wrap: wrap;
            padding: 24px 0 8px;
          }

          .cookie-footer strong,
          .cookie-footer span {
            display: block;
          }

          .cookie-footer strong {
            color: #eee;
            font-size: 12px;
          }

          .cookie-footer span {
            margin-top: 3px;
            color: #62626d;
            font-size: 9px;
          }

          .cookie-footer-links {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
          }

          .cookie-footer-links a {
            color: #ff70aa;
            text-decoration: none;
            font-size: 10px;
            font-weight: 700;
          }

          /* =========================================================
             RESPONSIVE
          ========================================================= */

          @media (max-width: 1100px) {

            .cookies-hero-logo {
              right: -70px;
              opacity: .42;
            }

            .cookies-summary-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .choice-grid {
              grid-template-columns: repeat(2, 1fr);
            }

          }

          @media (max-width: 850px) {

            .cookies-shell {
              padding: 16px 12px 60px;
            }

            .cookies-hero {
              min-height: 510px;
              border-radius: 24px;
            }

            .cookies-hero-content {
              padding: 42px 25px;
            }

            .cookies-hero-logo {
              width: 230px;
              height: 230px;
              right: -40px;
              bottom: -60px;
              top: auto;
              transform: none;
              opacity: .25;
            }

            .ring-a {
              width: 220px;
              height: 220px;
            }

            .ring-b {
              width: 165px;
              height: 165px;
            }

            .cookies-logo-core {
              width: 110px;
              height: 110px;
            }

            .cookies-logo-core img {
              width: 82px;
              height: 82px;
            }

            .purpose-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .category-grid {
              grid-template-columns: 1fr;
            }

            .law-grid {
              grid-template-columns: 1fr;
            }

            .feature-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .cookies-document {
              padding: 12px 18px;
              border-radius: 20px;
            }

          }

          @media (max-width: 600px) {

            .cookies-hero h1 {
              font-size: 50px;
              letter-spacing: -3px;
            }

            .cookies-hero-content > p {
              font-size: 13px;
            }

            .cookies-summary-grid {
              grid-template-columns: 1fr;
            }

            .purpose-grid {
              grid-template-columns: 1fr;
            }

            .choice-grid {
              grid-template-columns: 1fr;
            }

            .feature-grid {
              grid-template-columns: 1fr;
            }

            .cookie-section {
              grid-template-columns: 35px minmax(0,1fr);
              gap: 10px;
              padding: 30px 0;
            }

            .cookie-section-number {
              font-size: 10px;
            }

            .retention-row {
              grid-template-columns: 1fr;
              gap: 5px;
            }

            .retention-header {
              display: none;
            }

            .cookie-final-card {
              flex-direction: column;
              align-items: flex-start;
            }

          }

        `}</style>

      </div>

    </Layout>
  );
}
