// pages/legal/guidelines.jsx

import React, { useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';

const AMORA_LOGO = '/images/amora-logo.png';

const sections = [
  { id: 'welcome', number: '01', title: 'Our Community' },
  { id: 'principles', number: '02', title: 'Our Core Principles' },
  { id: 'authenticity', number: '03', title: 'Authenticity & Identity' },
  { id: 'respect', number: '04', title: 'Respect & Harassment' },
  { id: 'hate', number: '05', title: 'Hate & Discrimination' },
  { id: 'sexual', number: '06', title: 'Sexual & Adult Content' },
  { id: 'minors', number: '07', title: 'Children & Minors' },
  { id: 'exploitation', number: '08', title: 'Exploitation & Trafficking' },
  { id: 'violence', number: '09', title: 'Violence & Threats' },
  { id: 'selfharm', number: '10', title: 'Self-Harm & Dangerous Acts' },
  { id: 'illegal', number: '11', title: 'Illegal Activities' },
  { id: 'drugs', number: '12', title: 'Drugs & Controlled Substances' },
  { id: 'fraud', number: '13', title: 'Fraud, Scams & Deception' },
  { id: 'spam', number: '14', title: 'Spam & Manipulation' },
  { id: 'privacy', number: '15', title: 'Privacy & Personal Data' },
  { id: 'doxxing', number: '16', title: 'Doxxing & Exposure' },
  { id: 'impersonation', number: '17', title: 'Impersonation' },
  { id: 'copyright', number: '18', title: 'Copyright & Intellectual Property' },
  { id: 'livestreams', number: '19', title: 'Livestream Rules' },
  { id: 'battles', number: '20', title: 'Battles & Competitions' },
  { id: 'gifts', number: '21', title: 'Gifts & Virtual Items' },
  { id: 'dating', number: '22', title: 'Dating & Romantic Interactions' },
  { id: 'messages', number: '23', title: 'Messages & Private Communication' },
  { id: 'ai', number: '24', title: 'AI, Deepfakes & Synthetic Media' },
  { id: 'platform', number: '25', title: 'Platform Manipulation' },
  { id: 'security', number: '26', title: 'Cybersecurity & Abuse' },
  { id: 'reporting', number: '27', title: 'Reporting Violations' },
  { id: 'moderation', number: '28', title: 'Moderation & Enforcement' },
  { id: 'appeals', number: '29', title: 'Appeals' },
  { id: 'law', number: '30', title: 'Legal Compliance' },
  { id: 'changes', number: '31', title: 'Updates' }
];

const prohibited = [
  'Harassment, bullying, stalking, intimidation or targeted abuse.',
  'Credible threats of violence or encouragement of violence.',
  'Hate speech targeting protected characteristics.',
  'Pornography, explicit sexual acts or sexually explicit livestreams.',
  'Sexual exploitation or sexualization of minors.',
  'Child sexual abuse material or attempts to obtain it.',
  'Human trafficking or sexual trafficking.',
  'Non-consensual intimate imagery.',
  'Sextortion, blackmail or threats to expose intimate material.',
  'Fraud, phishing, impersonation and financial scams.',
  'Illegal drug sales or distribution.',
  'Weapons trafficking or instructions intended to facilitate serious criminal activity.',
  'Doxxing or malicious disclosure of private information.',
  'Malware, credential theft or attempts to compromise accounts.',
  'Artificial manipulation intended to deceive or seriously harm others.',
  'Spam, fake engagement and coordinated platform manipulation.',
  'Copyright infringement and unauthorized distribution of protected content.',
  'Any other content or activity prohibited by applicable law.'
];

const Section = ({ id, number, title, children }) => (
  <section id={id} className="guidelines-section">
    <div className="guidelines-number">{number}</div>

    <div className="guidelines-content">
      <div className="guidelines-label">AMORALIVE COMMUNITY</div>
      <h2>{title}</h2>
      {children}
    </div>
  </section>
);

const BulletList = ({ items }) => (
  <ul className="guidelines-list">
    {items.map((item, index) => (
      <li key={index}>
        <span className="guidelines-bullet" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const RuleCard = ({ number, title, children }) => (
  <div className="rule-card">
    <div className="rule-card-number">{number}</div>
    <strong>{title}</strong>
    <span>{children}</span>
  </div>
);

export default function Guidelines() {
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return sections;

    return sections.filter(
      (section) =>
        section.title.toLowerCase().includes(query) ||
        section.number.includes(query)
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
      <div className="guidelines-page">

        <div className="guidelines-orb orb-one" />
        <div className="guidelines-orb orb-two" />

        <div className="guidelines-shell">

          {/* =========================================================
              HERO
          ========================================================= */}

          <header className="guidelines-hero">

            <div className="hero-grid" />

            <div className="hero-content">

              <div className="hero-badge">
                <span />
                AMORALIVE COMMUNITY SAFETY
              </div>

              <h1>
                Community
                <br />
                <em>Guidelines.</em>
              </h1>

              <p>
                AmoraLive is built for connection, creativity, livestreaming,
                entertainment and genuine human interaction. These guidelines
                define the standards that keep our community safe, respectful,
                authentic and enjoyable.
              </p>

              <div className="hero-meta">

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
                  <strong>ALL AMORALIVE SERVICES</strong>
                </div>

              </div>

            </div>

            {/* OFFICIAL AMORA LOGO */}

            <div className="hero-symbol">

              <div className="symbol-ring ring-one" />
              <div className="symbol-ring ring-two" />

              <div className="symbol-core">
                <img
                  src={AMORA_LOGO}
                  alt="AmoraLive official logo"
                  className="hero-amora-logo"
                />
              </div>

            </div>

          </header>

          {/* =========================================================
              PRINCIPLE CARDS
          ========================================================= */}

          <div className="principle-grid">

            <div className="principle-card">
              <div className="principle-icon">♥</div>
              <strong>Respect</strong>
              <span>Treat people with dignity.</span>
            </div>

            <div className="principle-card">
              <div className="principle-icon">✦</div>
              <strong>Authenticity</strong>
              <span>Be genuine and transparent.</span>
            </div>

            <div className="principle-card">
              <div className="principle-icon">◈</div>
              <strong>Safety</strong>
              <span>Protect yourself and others.</span>
            </div>

            <div className="principle-card">
              <div className="principle-icon">⌁</div>
              <strong>Responsibility</strong>
              <span>Own what you publish.</span>
            </div>

          </div>

          {/* =========================================================
              SAFETY NOTICE
          ========================================================= */}

          <div className="safety-banner">

            <div className="safety-icon">!</div>

            <div>
              <strong>
                AmoraLive has zero tolerance for exploitation.
              </strong>

              <p>
                Sexual exploitation of minors, child sexual abuse material,
                trafficking, credible threats of serious violence and other
                severe illegal activity may result in immediate removal,
                permanent account termination and referral to appropriate
                authorities where required or permitted by law.
              </p>
            </div>

          </div>

          <div className="guidelines-layout">

            {/* =======================================================
                SIDEBAR
            ======================================================= */}

            <aside
              className={`guidelines-sidebar ${
                menuOpen ? 'sidebar-open' : ''
              }`}
            >

              <button
                className="mobile-menu-button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-label="Toggle community navigation"
              >
                <span>☰</span>
                Community Navigation
              </button>

              <div className="sidebar-inner">

                <div className="sidebar-heading">
                  <span>DOCUMENT</span>
                  <strong>Community Guidelines</strong>
                </div>

                <div className="guidelines-search">

                  <span>⌕</span>

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search guidelines..."
                    aria-label="Search Community Guidelines"
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

                  <Link href="/legal/terms">
                    Terms of Service
                  </Link>

                  <Link href="/legal/privacy">
                    Privacy Policy
                  </Link>

                  <Link href="/legal/cookies">
                    Cookie Policy
                  </Link>

                </div>

              </div>

            </aside>

            {/* =======================================================
                DOCUMENT
            ======================================================= */}

            <article className="guidelines-document">

              <Section
                id="welcome"
                number="01"
                title="Our Community"
              >

                <p>
                  AmoraLive is a social and livestreaming platform designed to
                  help people connect, communicate, entertain, create and share
                  experiences.
                </p>

                <p>
                  Every person using AmoraLive contributes to the environment
                  that everyone else experiences. These guidelines therefore
                  apply to accounts, profiles, livestreams, chats, comments,
                  messages, gifts, battles, media, links and other
                  interactions.
                </p>

                <div className="quote-card">
                  <span>"</span>

                  <p>
                    Freedom to express yourself comes with responsibility for
                    the impact your behaviour has on other people.
                  </p>
                </div>

              </Section>

              <Section
                id="principles"
                number="02"
                title="Our Core Principles"
              >

                <div className="rule-grid">

                  <RuleCard number="01" title="Respect">
                    Do not harass, threaten, humiliate or deliberately harm
                    other people.
                  </RuleCard>

                  <RuleCard number="02" title="Authenticity">
                    Do not manipulate people through deceptive identities,
                    impersonation or fraudulent claims.
                  </RuleCard>

                  <RuleCard number="03" title="Safety">
                    Do not use AmoraLive to facilitate violence, exploitation,
                    illegal activity or dangerous conduct.
                  </RuleCard>

                  <RuleCard number="04" title="Consent">
                    Respect personal, sexual, financial and communication
                    boundaries.
                  </RuleCard>

                  <RuleCard number="05" title="Privacy">
                    Do not expose private information belonging to another
                    person without authorization.
                  </RuleCard>

                  <RuleCard number="06" title="Lawfulness">
                    Do not use AmoraLive to facilitate conduct that violates
                    applicable law.
                  </RuleCard>

                </div>

              </Section>

              <Section
                id="authenticity"
                number="03"
                title="Authenticity & Identity"
              >

                <p>
                  Users should represent themselves honestly and avoid
                  misleading others about who they are.
                </p>

                <BulletList
                  items={[
                    'Do not impersonate another person.',
                    'Do not impersonate AmoraLive staff, moderators or officials.',
                    'Do not create deceptive accounts intended to defraud people.',
                    'Do not use fake identities to conduct scams or manipulation.',
                    'Do not falsely claim professional, governmental or organisational authority.',
                    'Do not use another person’s photograph or identity in a misleading way.'
                  ]}
                />

                <p>
                  Fan, parody or fictional accounts may be permitted where
                  they are clearly presented and do not deceive users.
                </p>

              </Section>

              <Section
                id="respect"
                number="04"
                title="Respect & Harassment"
              >

                <p>
                  AmoraLive does not permit targeted harassment or abusive
                  behaviour designed to intimidate, humiliate or silence
                  another person.
                </p>

                <BulletList
                  items={[
                    'Repeated unwanted contact after someone has asked you to stop.',
                    'Threats or intimidation.',
                    'Targeted insults intended to harass.',
                    'Stalking or monitoring someone in a threatening manner.',
                    'Encouraging others to attack or harass a person.',
                    'Sharing humiliating material to deliberately harm someone.',
                    'Sexual harassment.',
                    'Blackmail or coercion.'
                  ]}
                />

              </Section>

              <Section
                id="hate"
                number="05"
                title="Hate & Discrimination"
              >

                <p>
                  AmoraLive does not permit hateful attacks or dehumanizing
                  content directed at people because of protected or sensitive
                  characteristics.
                </p>

                <p>
                  This includes attacks targeting characteristics such as
                  race, ethnicity, nationality, religion, disability, sex,
                  sexual orientation or other characteristics protected by
                  applicable law.
                </p>

                <p>
                  Discussion, criticism or disagreement about ideas, beliefs,
                  governments or institutions is not automatically hate speech.
                  Context matters.
                </p>

              </Section>

              <Section
                id="sexual"
                number="06"
                title="Sexual & Adult Content"
              >

                <p>
                  AmoraLive is designed to provide a safe social and
                  livestreaming environment. Pornography and sexually explicit
                  content are prohibited.
                </p>

                <BulletList
                  items={[
                    'Pornographic videos or images.',
                    'Explicit sexual acts.',
                    'Explicit sexual livestreams.',
                    'Sexual solicitation.',
                    'Sexual services or prostitution offers.',
                    'Sexual exploitation.',
                    'Non-consensual intimate imagery.',
                    'Sexual blackmail or sextortion.',
                    'Sexualized content involving minors.'
                  ]}
                />

                <div className="critical-card">

                  <strong>
                    ZERO TOLERANCE
                  </strong>

                  <span>
                    Any sexual content involving minors is strictly prohibited
                    and may be reported to appropriate authorities as required
                    by applicable law.
                  </span>

                </div>

              </Section>

              <Section
                id="minors"
                number="07"
                title="Children & Minors"
              >

                <p>
                  AmoraLive takes the protection of children and minors
                  extremely seriously.
                </p>

                <p>
                  Users must not sexualize, exploit, groom, solicit or
                  otherwise endanger minors.
                </p>

                <BulletList
                  items={[
                    'No sexual conversations with minors.',
                    'No sexual solicitation of minors.',
                    'No grooming.',
                    'No attempts to obtain sexual images from minors.',
                    'No sexualized depictions of minors.',
                    'No child sexual abuse material.',
                    'No trafficking or exploitation of minors.',
                    'No encouragement of dangerous contact between adults and minors.'
                  ]}
                />

                <p>
                  Severe violations may result in immediate permanent
                  termination and reporting to competent authorities where
                  legally required or appropriate.
                </p>

              </Section>

              <Section
                id="exploitation"
                number="08"
                title="Exploitation & Trafficking"
              >

                <p>
                  AmoraLive prohibits content or behaviour that facilitates
                  human trafficking, sexual exploitation, forced labour,
                  coercion or exploitation of vulnerable people.
                </p>

                <BulletList
                  items={[
                    'Human trafficking offers or recruitment.',
                    'Sex trafficking.',
                    'Forced labour.',
                    'Commercial sexual exploitation.',
                    'Coercive recruitment.',
                    'Exploitation of vulnerable people.',
                    'Offers involving forced or controlled sexual activity.'
                  ]}
                />

              </Section>

              <Section
                id="violence"
                number="09"
                title="Violence & Threats"
              >

                <p>
                  Threats of serious violence are prohibited.
                </p>

                <BulletList
                  items={[
                    'Credible threats to kill or seriously injure another person.',
                    'Instructions intended to facilitate serious violence.',
                    'Celebration or encouragement of real-world violent attacks.',
                    'Threats against protected or vulnerable groups.',
                    'Coordinating violent criminal activity.',
                    'Threatening livestream participants or creators.'
                  ]}
                />

                <p>
                  Legitimate discussion of news, history, politics or fictional
                  violence is not automatically prohibited.
                </p>

              </Section>

              <Section
                id="selfharm"
                number="10"
                title="Self-Harm & Dangerous Acts"
              >

                <p>
                  AmoraLive does not permit content that encourages or
                  facilitates suicide, self-harm or dangerous challenges.
                </p>

                <p>
                  Educational, supportive and recovery-oriented discussion may
                  be allowed when it does not encourage harmful behaviour.
                </p>

              </Section>

              <Section
                id="illegal"
                number="11"
                title="Illegal Activities"
              >

                <p>
                  AmoraLive must not be used to facilitate serious criminal
                  activity or transactions that violate applicable law.
                </p>

                <BulletList items={prohibited.slice(10, 13)} />

                <p>
                  Where applicable law requires AmoraLive to respond to lawful
                  requests from authorities, we may do so.
                </p>

              </Section>

              <Section
                id="drugs"
                number="12"
                title="Drugs & Controlled Substances"
              >

                <p>
                  AmoraLive prohibits the sale, distribution or facilitation of
                  illegal controlled substances.
                </p>

                <BulletList
                  items={[
                    'Drug sales or distribution.',
                    'Requests to purchase illegal controlled substances.',
                    'Drug trafficking.',
                    'Instructions intended to facilitate illegal drug production.',
                    'Promotion of criminal drug transactions.'
                  ]}
                />

              </Section>

              <Section
                id="fraud"
                number="13"
                title="Fraud, Scams & Deception"
              >

                <p>
                  Users must not use AmoraLive to deceive people for financial,
                  personal or other unlawful gain.
                </p>

                <BulletList
                  items={[
                    'Investment scams.',
                    'Romance scams.',
                    'Phishing.',
                    'Fake giveaways.',
                    'Fake prizes.',
                    'Fake charity campaigns.',
                    'Payment fraud.',
                    'Account takeover scams.',
                    'Identity theft.',
                    'Fraudulent gift or coin schemes.',
                    'False claims intended to obtain money or property.'
                  ]}
                />

              </Section>

              <Section
                id="spam"
                number="14"
                title="Spam & Manipulation"
              >

                <p>
                  AmoraLive should reflect genuine human interaction rather
                  than artificial manipulation.
                </p>

                <BulletList
                  items={[
                    'Bot-generated spam.',
                    'Fake followers.',
                    'Artificial likes or engagement.',
                    'Coordinated manipulation of rankings.',
                    'Mass unsolicited messages.',
                    'Repeated promotional abuse.',
                    'Automated account creation.',
                    'Manipulation of battles or gift rankings.',
                    'Attempts to artificially inflate popularity.'
                  ]}
                />

              </Section>

              <Section
                id="privacy"
                number="15"
                title="Privacy & Personal Data"
              >

                <p>
                  Respect other people's privacy.
                </p>

                <BulletList
                  items={[
                    'Do not publish private contact information without authorization.',
                    'Do not expose private conversations maliciously.',
                    'Do not share private photographs without permission.',
                    'Do not collect personal information for harassment.',
                    'Do not attempt to obtain passwords or authentication credentials.',
                    'Do not misuse personal data obtained through AmoraLive.'
                  ]}
                />

                <p>
                  Privacy rights and data processing are also governed by the
                  AmoraLive Privacy Policy.
                </p>

              </Section>

              <Section
                id="doxxing"
                number="16"
                title="Doxxing & Exposure"
              >

                <p>
                  Doxxing means maliciously exposing private or sensitive
                  information about another person.
                </p>

                <p>
                  Prohibited examples may include publishing someone's private
                  address, telephone number, private email, financial
                  information or other sensitive personal information with the
                  intention of causing harm.
                </p>

              </Section>

              <Section
                id="impersonation"
                number="17"
                title="Impersonation"
              >

                <p>
                  Do not pretend to be another person, creator, celebrity,
                  employee, moderator, company or government representative in
                  a way that deceives users.
                </p>

                <p>
                  Accounts may be required to clearly distinguish themselves
                  from official AmoraLive accounts.
                </p>

              </Section>

              <Section
                id="copyright"
                number="18"
                title="Copyright & Intellectual Property"
              >

                <p>
                  Users must respect copyright, trademark and other intellectual
                  property rights.
                </p>

                <BulletList
                  items={[
                    'Do not upload content you do not have permission to use.',
                    'Do not deliberately distribute pirated material.',
                    'Do not impersonate brands or rights holders.',
                    'Do not use protected content to mislead users about affiliation.',
                    'Respect valid copyright complaints and legal processes.'
                  ]}
                />

                <p>
                  AmoraLive may remove content or restrict accounts when
                  appropriate under applicable law and platform policy.
                </p>

              </Section>

              <Section
                id="livestreams"
                number="19"
                title="Livestream Rules"
              >

                <p>
                  Livestream creators are responsible for the content they
                  broadcast and for reasonable efforts to maintain a safe
                  environment.
                </p>

                <div className="rule-grid">

                  <RuleCard number="01" title="Keep It Legal">
                    Do not use livestreams to facilitate illegal activity.
                  </RuleCard>

                  <RuleCard number="02" title="Protect Others">
                    Do not expose private information or deliberately target
                    viewers.
                  </RuleCard>

                  <RuleCard number="03" title="No Explicit Content">
                    Pornographic and explicit sexual livestreams are
                    prohibited.
                  </RuleCard>

                  <RuleCard number="04" title="Moderate Your Room">
                    Creators should use available moderation and reporting
                    tools.
                  </RuleCard>

                </div>

              </Section>

              <Section
                id="battles"
                number="20"
                title="Battles & Competitions"
              >

                <p>
                  AmoraLive battles are intended to be competitive,
                  entertaining and fair.
                </p>

                <BulletList
                  items={[
                    'Do not use bots to manipulate battle results.',
                    'Do not purchase or generate fraudulent engagement.',
                    'Do not threaten opponents.',
                    'Do not encourage harassment of another creator.',
                    'Do not exploit technical vulnerabilities to alter results.',
                    'Do not use fraudulent payment activity to manipulate rankings.',
                    'Respect the rules of each individual battle feature.'
                  ]}
                />

              </Section>

              <Section
                id="gifts"
                number="21"
                title="Gifts & Virtual Items"
              >

                <p>
                  AmoraLive may provide virtual gifts, coins, rewards and other
                  digital features.
                </p>

                <p>
                  Users must not exploit bugs, payment vulnerabilities,
                  fraudulent transactions or automated systems to manipulate
                  virtual items.
                </p>

                <BulletList
                  items={[
                    'No fraudulent coin purchases.',
                    'No chargeback abuse.',
                    'No manipulation of gift rankings.',
                    'No automated gift farming.',
                    'No fake gift transactions.',
                    'No attempts to exploit pricing or technical bugs.',
                    'No deceptive promises involving gifts or virtual items.'
                  ]}
                />

              </Section>

              <Section
                id="dating"
                number="22"
                title="Dating & Romantic Interactions"
              >

                <p>
                  AmoraLive may enable people to meet, communicate and develop
                  relationships.
                </p>

                <p>
                  Users should communicate honestly and respect consent and
                  boundaries.
                </p>

                <BulletList
                  items={[
                    'Do not pressure someone into romantic or sexual interaction.',
                    'Do not manipulate people for money.',
                    'Do not use dating features for fraud.',
                    'Do not stalk users who have rejected contact.',
                    'Do not impersonate another person.',
                    'Do not sexually exploit another person.',
                    'Do not use the platform to arrange trafficking or exploitation.'
                  ]}
                />

              </Section>

              <Section
                id="messages"
                number="23"
                title="Messages & Private Communication"
              >

                <p>
                  Private communication still needs to comply with AmoraLive
                  rules.
                </p>

                <p>
                  Users should not assume that private messaging makes
                  otherwise prohibited conduct acceptable.
                </p>

                <BulletList
                  items={[
                    'No harassment.',
                    'No threats.',
                    'No scams.',
                    'No sexual exploitation.',
                    'No grooming.',
                    'No malicious spam.',
                    'No credential theft.',
                    'No distribution of illegal content.'
                  ]}
                />

              </Section>

              <Section
                id="ai"
                number="24"
                title="AI, Deepfakes & Synthetic Media"
              >

                <p>
                  Artificial intelligence and synthetic media can be creative
                  tools, but they must not be used to deceive, exploit or harm
                  people.
                </p>

                <BulletList
                  items={[
                    'Do not create deceptive impersonation of another person.',
                    'Do not create non-consensual sexual deepfakes.',
                    'Do not sexualize minors using synthetic media.',
                    'Do not use AI to facilitate fraud.',
                    'Do not create malicious fake evidence intended to cause serious harm.',
                    'Do not use automation to evade AmoraLive safety systems.'
                  ]}
                />

                <p>
                  Where synthetic media is used in a context where disclosure
                  is necessary to avoid meaningful deception, users should make
                  that context clear.
                </p>

              </Section>

              <Section
                id="platform"
                number="25"
                title="Platform Manipulation"
              >

                <p>
                  Attempts to manipulate AmoraLive's systems, rankings,
                  recommendations, gifts, battles or moderation processes are
                  prohibited.
                </p>

                <BulletList
                  items={[
                    'Fake accounts.',
                    'Bot networks.',
                    'Automated engagement.',
                    'Fraudulent reporting campaigns.',
                    'Manipulation of recommendation systems.',
                    'Circumventing account restrictions.',
                    'Creating replacement accounts to evade enforcement.',
                    'Exploiting platform vulnerabilities.'
                  ]}
                />

              </Section>

              <Section
                id="security"
                number="26"
                title="Cybersecurity & Abuse"
              >

                <p>
                  AmoraLive must not be used to attack the platform or its
                  users.
                </p>

                <BulletList
                  items={[
                    'Credential theft.',
                    'Account takeover.',
                    'Malware distribution.',
                    'Phishing infrastructure.',
                    'Unauthorized access.',
                    'Denial-of-service attacks.',
                    'Exploitation of security vulnerabilities for malicious purposes.',
                    'Distribution of stolen credentials or session tokens.'
                  ]}
                />

                <p>
                  Responsible security researchers should report vulnerabilities
                  through the appropriate AmoraLive security contact rather than
                  exploiting them against users.
                </p>

              </Section>

              <Section
                id="reporting"
                number="27"
                title="Reporting Violations"
              >

                <p>
                  If you encounter content or behaviour that violates these
                  guidelines, use the reporting tools provided by AmoraLive
                  whenever possible.
                </p>

                <div className="report-card">

                  <div className="report-icon">
                    !
                  </div>

                  <div>
                    <strong>
                      Report — Don't Retaliate
                    </strong>

                    <span>
                      Do not attempt to punish another user yourself. Report
                      the behaviour and allow AmoraLive's safety systems and
                      moderation team to review it.
                    </span>
                  </div>

                </div>

                <p>
                  False or malicious reporting campaigns may themselves violate
                  these guidelines.
                </p>

              </Section>

              <Section
                id="moderation"
                number="28"
                title="Moderation & Enforcement"
              >

                <p>
                  AmoraLive may use automated systems, human moderators or a
                  combination of both to identify and review potential
                  violations.
                </p>

                <p>
                  Depending on the seriousness and circumstances of a
                  violation, enforcement may include:
                </p>

                <div className="enforcement-grid">

                  <RuleCard number="01" title="Warning">
                    Educational or corrective notice.
                  </RuleCard>

                  <RuleCard number="02" title="Content Removal">
                    Removal or restriction of violating content.
                  </RuleCard>

                  <RuleCard number="03" title="Feature Restriction">
                    Temporary loss of specific platform functionality.
                  </RuleCard>

                  <RuleCard number="04" title="Suspension">
                    Temporary account restriction.
                  </RuleCard>

                  <RuleCard number="05" title="Permanent Ban">
                    Permanent account termination for serious or repeated
                    violations.
                  </RuleCard>

                  <RuleCard number="06" title="Legal Referral">
                    Referral to appropriate authorities where required or
                    appropriate under applicable law.
                  </RuleCard>

                </div>

                <p>
                  AmoraLive may take immediate action where necessary to protect
                  users, preserve evidence, prevent ongoing harm or comply with
                  legal obligations.
                </p>

              </Section>

              <Section
                id="appeals"
                number="29"
                title="Appeals"
              >

                <p>
                  Where an appeal mechanism is available, users may request a
                  review of an enforcement decision according to the applicable
                  process.
                </p>

                <p>
                  Appeals should contain relevant information explaining why
                  the user believes the decision was incorrect.
                </p>

                <p>
                  AmoraLive may maintain restrictions while an appeal is
                  reviewed when necessary to protect users or prevent continued
                  abuse.
                </p>

              </Section>

              <Section
                id="law"
                number="30"
                title="Legal Compliance"
              >

                <p>
                  These guidelines operate alongside AmoraLive's Terms of
                  Service, Privacy Policy and other applicable policies.
                </p>

                <p>
                  AmoraLive may comply with valid legal obligations, lawful
                  orders and requests from competent authorities as required by
                  applicable law.
                </p>

                <p>
                  Nothing in these guidelines is intended to remove rights or
                  protections that users have under mandatory applicable law.
                </p>

                <div className="law-card">

                  <strong>
                    EUROPEAN & SWISS USERS
                  </strong>

                  <span>
                    Where mandatory consumer, digital-services, privacy or
                    other protections apply, AmoraLive will seek to operate its
                    services consistently with those requirements.
                  </span>

                </div>

              </Section>

              <Section
                id="changes"
                number="31"
                title="Updates"
              >

                <p>
                  AmoraLive may update these Community Guidelines as the
                  platform evolves, new safety risks emerge, or legal and
                  regulatory requirements change.
                </p>

                <p>
                  The effective date displayed at the beginning of this page
                  identifies the current version.
                </p>

                <p>
                  Continued use of AmoraLive after applicable changes take
                  effect is subject to the updated policies, to the extent
                  permitted by law.
                </p>

              </Section>

              {/* =======================================================
                  FINAL AMORA BRAND CARD
              ======================================================= */}

              <div className="final-card">

                <div className="final-logo-wrapper">

                  <img
                    src={AMORA_LOGO}
                    alt="AmoraLive official logo"
                    className="final-amora-logo"
                  />

                </div>

                <div>

                  <div className="guidelines-label">
                    AMORALIVE COMMUNITY PROMISE
                  </div>

                  <h2>
                    Make AmoraLive Better.
                  </h2>

                  <p>
                    Be authentic. Be respectful. Protect yourself and others.
                    Report abuse. Create something worth being part of.
                  </p>

                </div>

              </div>

              {/* =======================================================
                  FOOTER
              ======================================================= */}

              <div className="document-footer">

                <div>
                  <strong>AMORALIVE</strong>
                  <span>
                    Community Guidelines • V1.0.1 • August 2026
                  </span>
                </div>

                <div className="footer-links">

                  <Link href="/legal/terms">
                    Terms
                  </Link>

                  <Link href="/legal/privacy">
                    Privacy
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

          .guidelines-page {
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

          .guidelines-shell {
            max-width: 1420px;
            margin: 0 auto;
            padding: 34px 24px 90px;
            position: relative;
            z-index: 2;
          }

          .guidelines-orb {
            position: fixed;
            width: 430px;
            height: 430px;
            border-radius: 50%;
            filter: blur(130px);
            opacity: .14;
            pointer-events: none;
          }

          .orb-one {
            background: #ff3f9d;
            left: -280px;
            top: 5%;
          }

          .orb-two {
            background: #963fff;
            right: -280px;
            bottom: 10%;
          }

          .guidelines-hero {
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

          .hero-grid {
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

          .hero-content {
            position: relative;
            z-index: 3;
            max-width: 800px;
            padding: 68px;
          }

          .hero-badge {
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

          .hero-badge span {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #ff5da8;
            box-shadow: 0 0 15px #ff3f9d;
          }

          .hero-content h1 {
            margin: 28px 0 20px;
            color: #fff;
            font-size: clamp(50px, 6vw, 82px);
            line-height: .91;
            letter-spacing: -5px;
            font-weight: 950;
          }

          .hero-content h1 em {
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

          .hero-content > p {
            max-width: 690px;
            margin: 0;
            color: #a9a9b5;
            font-size: 16px;
            line-height: 1.8;
          }

          .hero-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 34px;
            margin-top: 34px;
          }

          .hero-meta div {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .hero-meta span {
            color: #666673;
            font-size: 9px;
            letter-spacing: 1.8px;
            font-weight: 900;
          }

          .hero-meta strong {
            color: #eee;
            font-size: 11px;
          }

          .hero-symbol {
            position: absolute;
            right: 3%;
            top: 50%;
            width: 360px;
            height: 360px;
            transform: translateY(-50%);
            display: grid;
            place-items: center;
          }

          .symbol-ring {
            position: absolute;
            border-radius: 50%;
            border: 1px solid rgba(255,107,157,.22);
          }

          .ring-one {
            width: 340px;
            height: 340px;
            transform: rotate(20deg);
          }

          .ring-two {
            width: 250px;
            height: 250px;
            transform: rotate(-35deg);
            border-color: rgba(157,80,255,.25);
          }

          .symbol-core {
            width: 170px;
            height: 170px;
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
            overflow: hidden;
          }

          /* OFFICIAL AMORA LOGO */

          .hero-amora-logo {
            width: 130px;
            height: 130px;
            object-fit: contain;
            display: block;
            filter:
              drop-shadow(0 0 20px rgba(255,255,255,.18))
              drop-shadow(0 0 30px rgba(255,63,157,.22));
          }

          .principle-grid {
            display: grid;
            grid-template-columns: repeat(4,1fr);
            gap: 12px;
            margin: 18px 0;
          }

          .principle-card {
            display: flex;
            align-items: center;
            gap: 12px;
            min-height: 78px;
            padding: 14px;
            border-radius: 18px;
            border: 1px solid rgba(255,255,255,.07);
            background: rgba(255,255,255,.025);
            backdrop-filter: blur(16px);
          }

          .principle-icon {
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
            font-size: 16px;
          }

          .principle-card strong,
          .principle-card span {
            display: block;
          }

          .principle-card strong {
            color: #eee;
            font-size: 12px;
          }

          .principle-card span {
            margin-top: 4px;
            color: #777783;
            font-size: 10px;
          }

          .safety-banner {
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

          .safety-icon {
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

          .safety-banner strong {
            color: #ffe7f0;
            font-size: 13px;
          }

          .safety-banner p {
            margin: 6px 0 0;
            color: #9999a4;
            font-size: 11px;
            line-height: 1.7;
          }

          .guidelines-layout {
            display: grid;
            grid-template-columns: 280px minmax(0,1fr);
            gap: 28px;
            align-items: start;
          }

          .guidelines-sidebar {
            position: sticky;
            top: 20px;
            z-index: 20;
          }

          .sidebar-inner {
            padding: 16px;
            border-radius: 22px;
            border: 1px solid rgba(255,255,255,.08);
            background: rgba(10,10,17,.78);
            backdrop-filter: blur(20px);
          }

          .sidebar-heading {
            padding: 8px 8px 15px;
            border-bottom: 1px solid rgba(255,255,255,.06);
          }

          .sidebar-heading span {
            display: block;
            color: #666673;
            font-size: 8px;
            letter-spacing: 2px;
            font-weight: 900;
          }

          .sidebar-heading strong {
            display: block;
            margin-top: 5px;
            color: #eee;
            font-size: 14px;
          }

          .guidelines-search {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 13px 0;
            padding: 9px 10px;
            border-radius: 12px;
            background: rgba(255,255,255,.04);
            border: 1px solid rgba(255,255,255,.07);
          }

          .guidelines-search span {
            color: #888;
            font-size: 18px;
          }

          .guidelines-search input {
            width: 100%;
            border: 0;
            outline: 0;
            background: transparent;
            color: #fff;
            font-size: 11px;
          }

          .guidelines-search input::placeholder {
            color: #666673;
          }

          .guidelines-sidebar nav {
            display: flex;
            flex-direction: column;
            max-height: 600px;
            overflow-y: auto;
          }

          .guidelines-sidebar nav button {
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

          .guidelines-sidebar nav button:hover {
            color: #fff;
            background: rgba(255,63,157,.07);
          }

          .guidelines-sidebar nav button span {
            width: 21px;
            color: #4f4f5b;
            font-size: 8px;
            font-weight: 900;
          }

          .sidebar-links {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 12px;
            padding-top: 13px;
            border-top: 1px solid rgba(255,255,255,.06);
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

          .guidelines-document {
            min-width: 0;
            padding: 25px clamp(20px,4vw,55px);
            border-radius: 25px;
            border: 1px solid rgba(255,255,255,.075);
            background: rgba(10,10,17,.64);
            backdrop-filter: blur(18px);
          }

          .guidelines-section {
            display: grid;
            grid-template-columns: 62px minmax(0,1fr);
            gap: 22px;
            padding: 40px 0;
            border-bottom: 1px solid rgba(255,255,255,.06);
            scroll-margin-top: 30px;
          }

          .guidelines-section:first-child {
            padding-top: 20px;
          }

          .guidelines-number {
            padding-top: 4px;
            color: #ff5da8;
            font-size: 12px;
            font-weight: 950;
          }

          .guidelines-label {
            margin-bottom: 7px;
            color: #ff639f;
            font-size: 8px;
            letter-spacing: 2.1px;
            font-weight: 900;
          }

          .guidelines-content h2 {
            margin: 0 0 16px;
            color: #fff;
            font-size: clamp(21px,2.5vw,28px);
            line-height: 1.2;
            letter-spacing: -.7px;
          }

          .guidelines-content p {
            margin: 0 0 14px;
            color: #a6a6b0;
            font-size: 13px;
            line-height: 1.85;
          }

          .guidelines-list {
            display: flex;
            flex-direction: column;
            gap: 9px;
            margin: 16px 0;
            padding: 0;
            list-style: none;
          }

          .guidelines-list li {
            display: flex;
            gap: 10px;
            color: #a6a6b0;
            font-size: 12px;
            line-height: 1.7;
          }

          .guidelines-bullet {
            width: 5px;
            min-width: 5px;
            height: 5px;
            margin-top: 8px;
            border-radius: 50%;
            background: #ff5da8;
            box-shadow: 0 0 10px rgba(255,93,168,.5);
          }

          .quote-card {
            position: relative;
            overflow: hidden;
            margin: 20px 0;
            padding: 20px;
            border-radius: 16px;
            background:
              linear-gradient(
                135deg,
                rgba(255,63,157,.08),
                rgba(155,53,255,.06)
              );
            border: 1px solid rgba(255,107,157,.15);
          }

          .quote-card > span {
            position: absolute;
            right: 18px;
            top: -20px;
            color: rgba(255,107,157,.1);
            font-size: 110px;
            font-weight: 950;
          }

          .quote-card p {
            position: relative;
            z-index: 2;
            margin: 0;
            color: #ddd;
          }

          .rule-grid,
          .enforcement-grid {
            display: grid;
            grid-template-columns: repeat(2,1fr);
            gap: 10px;
            margin-top: 20px;
          }

          .rule-card {
            padding: 17px;
            border-radius: 15px;
            border: 1px solid rgba(255,255,255,.07);
            background: rgba(255,255,255,.025);
          }

          .rule-card-number {
            margin-bottom: 10px;
            color: #ff639f;
            font-size: 8px;
            letter-spacing: 1.5px;
            font-weight: 900;
          }

          .rule-card strong {
            display: block;
            color: #eee;
            font-size: 12px;
            margin-bottom: 6px;
          }

          .rule-card span {
            display: block;
            color: #777783;
            font-size: 10px;
            line-height: 1.7;
          }

          .critical-card,
          .law-card {
            margin-top: 20px;
            padding: 18px;
            border-radius: 15px;
            border: 1px solid rgba(255,75,115,.2);
            background: rgba(255,63,157,.045);
          }

          .critical-card strong,
          .law-card strong {
            display: block;
            color: #ff77a9;
            font-size: 9px;
            letter-spacing: 1.8px;
          }

          .critical-card span,
          .law-card span {
            display: block;
            margin-top: 7px;
            color: #9999a4;
            font-size: 11px;
            line-height: 1.7;
          }

          .report-card {
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

          .report-icon {
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

          .report-card strong {
            display: block;
            color: #eee;
            font-size: 12px;
          }

          .report-card span {
            display: block;
            margin-top: 6px;
            color: #888894;
            font-size: 10px;
            line-height: 1.7;
          }

          /* =========================================================
             FINAL AMORA LOGO CARD
          ========================================================= */

          .final-card {
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

          .final-logo-wrapper {
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

          .final-amora-logo {
            width: 56px;
            height: 56px;
            object-fit: contain;
            display: block;
            filter:
              drop-shadow(0 0 12px rgba(255,255,255,.16))
              drop-shadow(0 0 20px rgba(255,63,157,.20));
          }

          .final-card h2 {
            margin: 3px 0 8px;
            color: #fff;
            font-size: 26px;
          }

          .final-card p {
            margin: 0;
            color: #a3a3ae;
            font-size: 12px;
            line-height: 1.7;
          }

          .document-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            flex-wrap: wrap;
            padding: 24px 0 8px;
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
            margin-top: 3px;
            color: #62626d;
            font-size: 9px;
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

            .hero-symbol {
              right: -70px;
              opacity: .42;
            }

            .principle-grid {
              grid-template-columns: repeat(2,1fr);
            }

          }

          @media (max-width: 850px) {

            .guidelines-shell {
              padding: 16px 12px 60px;
            }

            .guidelines-hero {
              min-height: 500px;
              border-radius: 24px;
            }

            .hero-content {
              padding: 42px 25px;
            }

            .hero-symbol {
              width: 230px;
              height: 230px;
              right: -40px;
              bottom: -60px;
              top: auto;
              transform: none;
              opacity: .25;
            }

            .ring-one {
              width: 220px;
              height: 220px;
            }

            .ring-two {
              width: 165px;
              height: 165px;
            }

            .symbol-core {
              width: 110px;
              height: 110px;
            }

            .hero-amora-logo {
              width: 82px;
              height: 82px;
            }

            .guidelines-layout {
              grid-template-columns: 1fr;
            }

            .guidelines-sidebar {
              position: sticky;
              top: 8px;
            }

            .mobile-menu-button {
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

            .sidebar-inner {
              display: none;
              margin-top: 7px;
            }

            .sidebar-open .sidebar-inner {
              display: block;
            }

            .guidelines-sidebar nav {
              max-height: 300px;
            }

            .guidelines-document {
              padding: 12px 18px;
              border-radius: 20px;
            }

          }

          @media (max-width: 600px) {

            .hero-content h1 {
              font-size: 50px;
              letter-spacing: -3px;
            }

            .hero-content > p {
              font-size: 13px;
            }

            .hero-meta {
              gap: 20px;
            }

            .principle-grid {
              grid-template-columns: 1fr;
            }

            .guidelines-section {
              grid-template-columns: 35px minmax(0,1fr);
              gap: 10px;
              padding: 30px 0;
            }

            .guidelines-number {
              font-size: 10px;
            }

            .rule-grid,
            .enforcement-grid {
              grid-template-columns: 1fr;
            }

            .final-card {
              flex-direction: column;
              align-items: flex-start;
            }

          }

        `}</style>

      </div>
    </Layout>
  );
}
