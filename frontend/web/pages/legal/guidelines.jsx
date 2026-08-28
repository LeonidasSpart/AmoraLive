import React, { useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { useTranslation } from '../../lib/i18n';

const AMORA_LOGO = '/brand/amora-logo.png';

const sectionIds = [
  ['welcome', '01'],
  ['principles', '02'],
  ['authenticity', '03'],
  ['respect', '04'],
  ['hate', '05'],
  ['sexual', '06'],
  ['minors', '07'],
  ['exploitation', '08'],
  ['violence', '09'],
  ['selfharm', '10'],
  ['illegal', '11'],
  ['drugs', '12'],
  ['fraud', '13'],
  ['spam', '14'],
  ['privacy', '15'],
  ['doxxing', '16'],
  ['impersonation', '17'],
  ['copyright', '18'],
  ['livestreams', '19'],
  ['battles', '20'],
  ['gifts', '21'],
  ['dating', '22'],
  ['messages', '23'],
  ['ai', '24'],
  ['platform', '25'],
  ['security', '26'],
  ['reporting', '27'],
  ['moderation', '28'],
  ['appeals', '29'],
  ['law', '30'],
  ['changes', '31']
];

const Section = ({ id, number, title, label, children }) => (
  <section id={id} className="guidelines-section">
    <div className="guidelines-number">{number}</div>

    <div className="guidelines-content">
      <div className="guidelines-label">{label}</div>
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

const AmoraLogo = ({
  className = '',
  alt = 'AmoraLive official logo'
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`amora-logo-fallback ${className}`}
        aria-label={alt}
        role="img"
      >
        A
      </div>
    );
  }

  return (
    <img
      src={AMORA_LOGO}
      alt={alt}
      className={`amora-logo ${className}`}
      onError={() => setFailed(true)}
      draggable="false"
    />
  );
};

export default function Guidelines() {
  const { t, lang } = useTranslation();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const sections = useMemo(
    () =>
      sectionIds.map(([id, number]) => ({
        id,
        number,
        title: t(`legalGuidelines.sectionTitles.${id}`)
      })),
    [t]
  );

  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return sections;
    }

    return sections.filter(
      (section) =>
        section.title.toLowerCase().includes(query) ||
        section.number.includes(query)
    );
  }, [search]);

  const scrollTo = (id) => {
    setMenuOpen(false);

    if (typeof document !== 'undefined') {
      const element = document.getElementById(id);

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
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
                {t('legalGuidelines.badge')}
              </div>

              <h1>
                {t('legalGuidelines.heroTitle1')}
                <br />
                <em>{t('legalGuidelines.heroTitle2')}</em>
              </h1>

              <p>
                {t('legalGuidelines.heroDesc')}
              </p>

              <div className="hero-meta">

                <div>
                  <span>{t('legalGuidelines.metaVersion')}</span>
                  <strong>{t('legalGuidelines.metaVersionVal')}</strong>
                </div>

                <div>
                  <span>{t('legalGuidelines.metaUpdated')}</span>
                  <strong>{t('legalGuidelines.metaUpdatedVal')}</strong>
                </div>

                <div>
                  <span>{t('legalGuidelines.metaApplies')}</span>
                  <strong>{t('legalGuidelines.metaAppliesVal')}</strong>
                </div>

              </div>

            </div>

            <div className="hero-symbol">

              <div className="symbol-ring ring-one" />
              <div className="symbol-ring ring-two" />

              <div className="symbol-core">

                <div className="logo-light">

                  <AmoraLogo
                    className="amora-logo"
                    alt="AmoraLive official logo"
                  />

                </div>

              </div>

            </div>

          </header>

          {/* =========================================================
              PRINCIPLE CARDS
          ========================================================= */}

          <div className="principle-grid">

            {[
              { icon: '♥' },
              { icon: '✦' },
              { icon: '◈' },
              { icon: '⌁' }
            ].map((item, index) => {
              const [title, desc] = t('legalGuidelines.principleGrid')[index];
              return (
                <div className="principle-card" key={index}>
                  <div className="principle-icon">{item.icon}</div>
                  <strong>{title}</strong>
                  <span>{desc}</span>
                </div>
              );
            })}

          </div>

          {/* =========================================================
              SAFETY NOTICE
          ========================================================= */}

          <div className="safety-banner">

            <div className="safety-icon">!</div>

            <div>
              <strong>
                {t('legalGuidelines.safetyBannerTitle')}
              </strong>

              <p>
                {t('legalGuidelines.safetyBannerBody')}
              </p>
            </div>

          </div>

          {lang !== 'en' && (
            <div className="safety-banner">

              <div className="safety-icon">!</div>

              <div>
                <strong>
                  {t('legalGuidelines.translationNoticeTitle')}
                </strong>

                <p>
                  {t('legalGuidelines.translationNoticeBody')}
                </p>
              </div>

            </div>
          )}

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
                type="button"
                className="mobile-menu-button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-label={t('legalGuidelines.navAriaLabel')}
              >
                <span>☰</span>
                {t('legalGuidelines.navLabel')}
              </button>

              <div className="sidebar-inner">

                <div className="sidebar-heading">
                  <span>{t('legalGuidelines.sidebarDocLabel')}</span>
                  <strong>{t('legalGuidelines.sidebarDocTitle')}</strong>
                </div>

                <div className="guidelines-search">

                  <span>⌕</span>

                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('legalGuidelines.searchPlaceholder')}
                    aria-label={t('legalGuidelines.searchAriaLabel')}
                  />

                </div>

                <nav>

                  {filteredSections.map((section) => (
                    <button
                      type="button"
                      key={section.id}
                      onClick={() => scrollTo(section.id)}
                    >
                      <span>{section.number}</span>
                      {section.title}
                    </button>
                  ))}

                </nav>

                <div className="sidebar-links">

                  <a href="/legal/terms">
                    {t('legalGuidelines.linkTerms')}
                  </a>

                  <a href="/legal/privacy">
                    {t('legalGuidelines.linkPrivacy')}
                  </a>

                  <a href="/legal/cookies">
                    {t('legalGuidelines.linkCookies')}
                  </a>

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
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.welcome')}
              >

                <p>
                  {t('legalGuidelines.welcomeP1')}
                </p>

                <p>
                  {t('legalGuidelines.welcomeP2')}
                </p>

                <div className="quote-card">
                  <span>"</span>

                  <p>
                    {t('legalGuidelines.welcomeQuote')}
                  </p>
                </div>

              </Section>

              <Section
                id="principles"
                number="02"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.principles')}
              >

                <div className="rule-grid">

                  {t('legalGuidelines.principlesGrid').map((item, index) => (
                    <RuleCard number={String(index + 1).padStart(2, '0')} title={item[0]} key={index}>
                      {item[1]}
                    </RuleCard>
                  ))}

                </div>

              </Section>

              <Section
                id="authenticity"
                number="03"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.authenticity')}
              >

                <p>
                  {t('legalGuidelines.authenticityP1')}
                </p>

                <BulletList items={t('legalGuidelines.authenticityBullets')} />

                <p>
                  {t('legalGuidelines.authenticityP2')}
                </p>

              </Section>

              <Section
                id="respect"
                number="04"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.respect')}
              >

                <p>
                  {t('legalGuidelines.respectP1')}
                </p>

                <BulletList items={t('legalGuidelines.respectBullets')} />

              </Section>

              <Section
                id="hate"
                number="05"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.hate')}
              >

                <p>
                  {t('legalGuidelines.hateP1')}
                </p>

                <p>
                  {t('legalGuidelines.hateP2')}
                </p>

                <p>
                  {t('legalGuidelines.hateP3')}
                </p>

              </Section>

              <Section
                id="sexual"
                number="06"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.sexual')}
              >

                <p>
                  {t('legalGuidelines.sexualP1')}
                </p>

                <BulletList items={t('legalGuidelines.sexualBullets')} />

                <div className="critical-card">

                  <strong>{t('legalGuidelines.sexualCriticalTitle')}</strong>

                  <span>
                    {t('legalGuidelines.sexualCriticalBody')}
                  </span>

                </div>

              </Section>

              <Section
                id="minors"
                number="07"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.minors')}
              >

                <p>
                  {t('legalGuidelines.minorsP1')}
                </p>

                <p>
                  {t('legalGuidelines.minorsP2')}
                </p>

                <BulletList items={t('legalGuidelines.minorsBullets')} />

                <p>
                  {t('legalGuidelines.minorsP3')}
                </p>

              </Section>

              <Section
                id="exploitation"
                number="08"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.exploitation')}
              >

                <p>
                  {t('legalGuidelines.exploitationP1')}
                </p>

                <BulletList items={t('legalGuidelines.exploitationBullets')} />

              </Section>

              <Section
                id="violence"
                number="09"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.violence')}
              >

                <p>
                  {t('legalGuidelines.violenceP1')}
                </p>

                <BulletList items={t('legalGuidelines.violenceBullets')} />

                <p>
                  {t('legalGuidelines.violenceP2')}
                </p>

              </Section>

              <Section
                id="selfharm"
                number="10"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.selfharm')}
              >

                <p>
                  {t('legalGuidelines.selfharmP1')}
                </p>

                <p>
                  {t('legalGuidelines.selfharmP2')}
                </p>

              </Section>

              <Section
                id="illegal"
                number="11"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.illegal')}
              >

                <p>
                  {t('legalGuidelines.illegalP1')}
                </p>

                <BulletList items={t('legalGuidelines.illegalBullets')} />

                <p>
                  {t('legalGuidelines.illegalP2')}
                </p>

              </Section>

              <Section
                id="drugs"
                number="12"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.drugs')}
              >

                <p>
                  {t('legalGuidelines.drugsP1')}
                </p>

                <BulletList items={t('legalGuidelines.drugsBullets')} />

              </Section>

              <Section
                id="fraud"
                number="13"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.fraud')}
              >

                <p>
                  {t('legalGuidelines.fraudP1')}
                </p>

                <BulletList items={t('legalGuidelines.fraudBullets')} />

              </Section>

              <Section
                id="spam"
                number="14"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.spam')}
              >

                <p>
                  {t('legalGuidelines.spamP1')}
                </p>

                <BulletList items={t('legalGuidelines.spamBullets')} />

              </Section>

              <Section
                id="privacy"
                number="15"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.privacy')}
              >

                <p>
                  {t('legalGuidelines.privacyP1')}
                </p>

                <BulletList items={t('legalGuidelines.privacyBullets')} />

                <p>
                  {t('legalGuidelines.privacyP2')}
                </p>

              </Section>

              <Section
                id="doxxing"
                number="16"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.doxxing')}
              >

                <p>
                  {t('legalGuidelines.doxxingP1')}
                </p>

                <p>
                  {t('legalGuidelines.doxxingP2')}
                </p>

              </Section>

              <Section
                id="impersonation"
                number="17"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.impersonation')}
              >

                <p>
                  {t('legalGuidelines.impersonationP1')}
                </p>

                <p>
                  {t('legalGuidelines.impersonationP2')}
                </p>

              </Section>

              <Section
                id="copyright"
                number="18"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.copyright')}
              >

                <p>
                  {t('legalGuidelines.copyrightP1')}
                </p>

                <BulletList items={t('legalGuidelines.copyrightBullets')} />

                <p>
                  {t('legalGuidelines.copyrightP2')}
                </p>

              </Section>

              <Section
                id="livestreams"
                number="19"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.livestreams')}
              >

                <p>
                  {t('legalGuidelines.livestreamsP1')}
                </p>

                <div className="rule-grid">

                  {t('legalGuidelines.livestreamsGrid').map((item, index) => (
                    <RuleCard number={String(index + 1).padStart(2, '0')} title={item[0]} key={index}>
                      {item[1]}
                    </RuleCard>
                  ))}

                </div>

              </Section>

              <Section
                id="battles"
                number="20"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.battles')}
              >

                <p>
                  {t('legalGuidelines.battlesP1')}
                </p>

                <BulletList items={t('legalGuidelines.battlesBullets')} />

              </Section>

              <Section
                id="gifts"
                number="21"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.gifts')}
              >

                <p>
                  {t('legalGuidelines.giftsP1')}
                </p>

                <p>
                  {t('legalGuidelines.giftsP2')}
                </p>

                <BulletList items={t('legalGuidelines.giftsBullets')} />

              </Section>

              <Section
                id="dating"
                number="22"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.dating')}
              >

                <p>
                  {t('legalGuidelines.datingP1')}
                </p>

                <p>
                  {t('legalGuidelines.datingP2')}
                </p>

                <BulletList items={t('legalGuidelines.datingBullets')} />

              </Section>

              <Section
                id="messages"
                number="23"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.messages')}
              >

                <p>
                  {t('legalGuidelines.messagesP1')}
                </p>

                <p>
                  {t('legalGuidelines.messagesP2')}
                </p>

                <BulletList items={t('legalGuidelines.messagesBullets')} />

              </Section>

              <Section
                id="ai"
                number="24"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.ai')}
              >

                <p>
                  {t('legalGuidelines.aiP1')}
                </p>

                <BulletList items={t('legalGuidelines.aiBullets')} />

                <p>
                  {t('legalGuidelines.aiP2')}
                </p>

              </Section>

              <Section
                id="platform"
                number="25"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.platform')}
              >

                <p>
                  {t('legalGuidelines.platformP1')}
                </p>

                <BulletList items={t('legalGuidelines.platformBullets')} />

              </Section>

              <Section
                id="security"
                number="26"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.security')}
              >

                <p>
                  {t('legalGuidelines.securityP1')}
                </p>

                <BulletList items={t('legalGuidelines.securityBullets')} />

                <p>
                  {t('legalGuidelines.securityP2')}
                </p>

              </Section>

              <Section
                id="reporting"
                number="27"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.reporting')}
              >

                <p>
                  {t('legalGuidelines.reportingP1')}
                </p>

                <div className="report-card">

                  <div className="report-icon">
                    !
                  </div>

                  <div>
                    <strong>
                      {t('legalGuidelines.reportCardTitle')}
                    </strong>

                    <span>
                      {t('legalGuidelines.reportCardBody')}
                    </span>
                  </div>

                </div>

                <p>
                  {t('legalGuidelines.reportingP2')}
                </p>

              </Section>

              <Section
                id="moderation"
                number="28"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.moderation')}
              >

                <p>
                  {t('legalGuidelines.moderationP1')}
                </p>

                <p>
                  {t('legalGuidelines.moderationP2')}
                </p>

                <div className="enforcement-grid">

                  {t('legalGuidelines.enforcementGrid').map((item, index) => (
                    <RuleCard number={String(index + 1).padStart(2, '0')} title={item[0]} key={index}>
                      {item[1]}
                    </RuleCard>
                  ))}

                </div>

                <p>
                  {t('legalGuidelines.moderationP3')}
                </p>

              </Section>

              <Section
                id="appeals"
                number="29"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.appeals')}
              >

                <p>
                  {t('legalGuidelines.appealsP1')}
                </p>

                <p>
                  {t('legalGuidelines.appealsP2')}
                </p>

                <p>
                  {t('legalGuidelines.appealsP3')}
                </p>

              </Section>

              <Section
                id="law"
                number="30"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.law')}
              >

                <p>
                  {t('legalGuidelines.lawP1')}
                </p>

                <p>
                  {t('legalGuidelines.lawP2')}
                </p>

                <p>
                  {t('legalGuidelines.lawP3')}
                </p>

                <div className="law-card">

                  <strong>
                    {t('legalGuidelines.lawCardTitle')}
                  </strong>

                  <span>
                    {t('legalGuidelines.lawCardBody')}
                  </span>

                </div>

              </Section>

              <Section
                id="changes"
                number="31"
                label={t('legalGuidelines.sectionLabel')}
                title={t('legalGuidelines.sectionTitles.changes')}
              >

                <p>
                  {t('legalGuidelines.changesP1')}
                </p>

                <p>
                  {t('legalGuidelines.changesP2')}
                </p>

                <p>
                  {t('legalGuidelines.changesP3')}
                </p>

              </Section>

              {/* =======================================================
                  FINAL AMORA BRAND CARD
              ======================================================= */}

              <div className="final-card">

                <div className="final-logo-wrapper">

                  <div className="final-logo-light">

                    <AmoraLogo
                      className="final-amora-logo"
                      alt="AmoraLive official logo"
                    />

                  </div>

                </div>

                <div>

                  <div className="guidelines-label">
                    {t('legalGuidelines.finalLabel')}
                  </div>

                  <h2>
                    {t('legalGuidelines.finalTitle')}
                  </h2>

                  <p>
                    {t('legalGuidelines.finalBody')}
                  </p>

                </div>

              </div>

              {/* =======================================================
                  FOOTER
              ======================================================= */}

              <div className="document-footer">

                <div>
                  <strong>{t('legalGuidelines.footerBrand')}</strong>

                  <span>
                    {t('legalGuidelines.footerTagline')}
                  </span>
                </div>

                <div className="footer-links">

                  <a href="/legal/terms">
                    {t('legalGuidelines.footerLinkTerms')}
                  </a>

                  <a href="/legal/privacy">
                    {t('legalGuidelines.footerLinkPrivacy')}
                  </a>

                  <a href="/legal/cookies">
                    {t('legalGuidelines.footerLinkCookies')}
                  </a>

                  <a href="/">
                    {t('legalGuidelines.footerLinkHome')}
                  </a>

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
            z-index: 2;
          }

          .symbol-ring {
            position: absolute;
            border-radius: 50%;
            border: 1px solid rgba(255,107,157,.22);
            pointer-events: none;
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
            width: 180px;
            height: 180px;
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
            position: relative;
            z-index: 5;
          }

          .logo-light {
            width: 142px;
            height: 142px;
            display: grid;
            place-items: center;
            border-radius: 50%;
            background: rgba(8,8,15,.92);
            border: 1px solid rgba(255,255,255,.10);
            box-shadow:
              inset 0 0 30px rgba(255,255,255,.025),
              0 0 25px rgba(0,0,0,.35);
            overflow: hidden;
          }

          .amora-logo {
            display: block;
            object-fit: contain;
            object-position: center;
            max-width: 100%;
            max-height: 100%;
            user-select: none;
          }

          .hero-amora-logo {
            width: 108px;
            height: 108px;
            object-fit: contain;
            object-position: center;
            display: block;
            filter:
              drop-shadow(0 0 14px rgba(255,255,255,.16))
              drop-shadow(0 0 22px rgba(255,63,157,.20));
          }

          .amora-logo-fallback {
            width: 100%;
            height: 100%;
            display: grid;
            place-items: center;
            color: #fff;
            font-size: 45px;
            font-weight: 950;
            background:
              linear-gradient(
                135deg,
                #ff3f9d,
                #9b35ff
              );
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

          .sidebar-links a:hover {
            color: #ff9ac5;
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
            width: 78px;
            min-width: 78px;
            height: 78px;
            display: grid;
            place-items: center;
            border-radius: 22px;
            background:
              linear-gradient(
                135deg,
                rgba(255,63,157,.22),
                rgba(155,53,255,.20)
              );
            border: 1px solid rgba(255,107,157,.24);
            box-shadow:
              0 0 35px rgba(255,63,157,.16);
            overflow: hidden;
          }

          .final-logo-light {
            width: 64px;
            height: 64px;
            display: grid;
            place-items: center;
            border-radius: 18px;
            background: rgba(8,8,15,.94);
            border: 1px solid rgba(255,255,255,.10);
            overflow: hidden;
          }

          .final-amora-logo {
            width: 51px;
            height: 51px;
            object-fit: contain;
            object-position: center;
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

          .footer-links a:hover {
            color: #ff9ac5;
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
              opacity: .30;
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
              width: 118px;
              height: 118px;
            }

            .logo-light {
              width: 92px;
              height: 92px;
            }

            .hero-amora-logo {
              width: 70px;
              height: 70px;
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

            .final-logo-wrapper {
              width: 72px;
              min-width: 72px;
              height: 72px;
            }

          }

        `}</style>

      </div>
    </Layout>
  );
}
