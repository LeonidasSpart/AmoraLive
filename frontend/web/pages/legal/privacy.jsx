// pages/legal/privacy.jsx

import React, { useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { useTranslation } from '../../lib/i18n';

const sectionIds = [
  ['overview', '01'], ['controller', '02'], ['data', '03'], ['sources', '04'], ['purposes', '05'],
  ['legal-bases', '06'], ['profile', '07'], ['live', '08'], ['messages', '09'], ['gifts', '10'],
  ['location', '11'], ['device', '12'], ['cookies', '13'], ['analytics', '14'], ['ai', '15'],
  ['moderation', '16'], ['sharing', '17'], ['transfers', '18'], ['retention', '19'], ['security', '20'],
  ['rights', '21'], ['consent', '22'], ['children', '23'], ['thirdparty', '24'], ['deletion', '25'],
  ['breach', '26'], ['complaints', '27'], ['changes', '28'], ['contact', '29']
];

const Section = ({ id, number, title, label, children }) => (
  <section id={id} className="privacy-section">
    <div className="privacy-number">{number}</div>

    <div className="privacy-content">
      <div className="privacy-label">{label}</div>
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
  const { t, lang } = useTranslation();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const sections = sectionIds.map(([id, number]) => ({ id, number, title: t(`legalPrivacy.sectionTitles.${id}`) }));

  const filteredSections = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return sections;

    return sections.filter(
      (section) =>
        section.title.toLowerCase().includes(q) ||
        section.number.includes(q)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, lang]);

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
                {t('legalPrivacy.badge')}
              </div>

              <h1>
                {t('legalPrivacy.heroTitle1')}
                <span> {t('legalPrivacy.heroTitle2')}</span>
              </h1>

              <p className="privacy-hero-description">
                {t('legalPrivacy.heroDesc')}
              </p>

              <div className="privacy-meta">

                <div>
                  <span>{t('legalPrivacy.metaVersion')}</span>
                  <strong>{t('legalPrivacy.metaVersionVal')}</strong>
                </div>

                <div>
                  <span>{t('legalPrivacy.metaEffective')}</span>
                  <strong>{t('legalPrivacy.metaEffectiveVal')}</strong>
                </div>

                <div>
                  <span>{t('legalPrivacy.metaFramework')}</span>
                  <strong>{t('legalPrivacy.metaFrameworkVal')}</strong>
                </div>

              </div>

            </div>

            {/* OFFICIAL AMORALIVE LOGO */}
            <div className="privacy-shield">

              <div className="shield-ring shield-ring-one" />
              <div className="shield-ring shield-ring-two" />

              <div className="shield">
                <div className="shield-inner">
                  <img
                    src="/brand/amora-logo.png"
                    alt="AmoraLive"
                  />
                </div>
              </div>

            </div>

          </header>

          {/* PRIVACY STATUS */}
          <div className="privacy-status-grid">

            <div className="privacy-status-card">
              <div className="privacy-status-icon">EU</div>

              <div>
                <strong>{t('legalPrivacy.statusGdprTitle')}</strong>
                <span>{t('legalPrivacy.statusGdprSub')}</span>
              </div>
            </div>

            <div className="privacy-status-card">
              <div className="privacy-status-icon">CH</div>

              <div>
                <strong>{t('legalPrivacy.statusSwissTitle')}</strong>
                <span>{t('legalPrivacy.statusSwissSub')}</span>
              </div>
            </div>

            <div className="privacy-status-card">
              <div className="privacy-status-icon">🔐</div>

              <div>
                <strong>{t('legalPrivacy.statusSecurityTitle')}</strong>
                <span>{t('legalPrivacy.statusSecuritySub')}</span>
              </div>
            </div>

            <div className="privacy-status-card">
              <div className="privacy-status-icon">◎</div>

              <div>
                <strong>{t('legalPrivacy.statusChoicesTitle')}</strong>
                <span>{t('legalPrivacy.statusChoicesSub')}</span>
              </div>
            </div>

          </div>

          {/* IMPORTANT NOTICE */}
          <div className="privacy-notice">

            <div className="privacy-notice-icon">
              !
            </div>

            <div>
              <strong>{t('legalPrivacy.noticeTitle')}</strong>

              <p>
                {t('legalPrivacy.noticeBody')}
              </p>
            </div>

          </div>

          {lang !== 'en' && (
            <div className="privacy-notice">

              <div className="privacy-notice-icon">EN</div>

              <div>
                <strong>{t('legalPrivacy.translationNoticeTitle')}</strong>

                <p>
                  {t('legalPrivacy.translationNoticeBody')}
                </p>
              </div>

            </div>
          )}

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
                {t('legalPrivacy.navLabel')}
              </button>

              <div className="privacy-sidebar-inner">

                <div className="privacy-sidebar-title">
                  <span>{t('legalPrivacy.sidebarDocLabel')}</span>
                  <strong>{t('legalPrivacy.sidebarDocTitle')}</strong>
                </div>

                <div className="privacy-search">

                  <span>⌕</span>

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('legalPrivacy.searchPlaceholder')}
                    aria-label={t('legalPrivacy.searchAriaLabel')}
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
                    {t('legalPrivacy.linkTerms')}
                  </Link>

                  <Link href="/legal/guidelines">
                    {t('legalPrivacy.linkGuidelines')}
                  </Link>

                  <Link href="/legal/cookies">
                    {t('legalPrivacy.linkCookies')}
                  </Link>

                </div>

              </div>

            </aside>

            {/* DOCUMENT */}
            <article className="privacy-document">

              <Section
                id="overview"
                number="01"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.overview')}
              >

                <p>{t('legalPrivacy.overviewP1')}</p>
                <p>{t('legalPrivacy.overviewP2')}</p>

                <div className="privacy-quote">

                  <span className="privacy-quote-mark">
                    "
                  </span>

                  <p>{t('legalPrivacy.overviewQuote')}</p>

                </div>

              </Section>

              <Section
                id="controller"
                number="02"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.controller')}
              >

                <p>{t('legalPrivacy.controllerP1')}</p>

                <div className="privacy-placeholder">

                  <span>{t('legalPrivacy.controllerLabel')}</span>

                  <strong>
                    {t('legalPrivacy.controllerEntityPlaceholder')}
                  </strong>

                  <p>
                    {t('legalPrivacy.controllerAddressLabel')}
                    <br />
                    {t('legalPrivacy.controllerAddressPlaceholder')}
                  </p>

                  <p>
                    {t('legalPrivacy.controllerCountryLabel')}
                    <br />
                    {t('legalPrivacy.controllerCountryPlaceholder')}
                  </p>

                  <p>
                    {t('legalPrivacy.controllerContactLabel')}
                    <br />
                    {t('legalPrivacy.controllerContactPlaceholder')}
                  </p>

                </div>

                <p>{t('legalPrivacy.controllerP2')}</p>

              </Section>

              <Section
                id="data"
                number="03"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.data')}
              >

                <p>{t('legalPrivacy.dataP1')}</p>

                <div className="privacy-data-grid">

                  {t('legalPrivacy.dataCategories').map((item, index) => (
                    <div
                      className="privacy-data-card"
                      key={index}
                    >
                      <div className="privacy-data-number">
                        {String(index + 1).padStart(2, '0')}
                      </div>

                      <strong>{item[0]}</strong>

                      <span>{item[1]}</span>
                    </div>
                  ))}

                </div>

                <p>{t('legalPrivacy.dataP2')}</p>

              </Section>

              <Section
                id="sources"
                number="04"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.sources')}
              >

                <p>{t('legalPrivacy.sourcesP1')}</p>

                <BulletList
                  items={t('legalPrivacy.sourcesBullets')}
                />

              </Section>

              <Section
                id="purposes"
                number="05"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.purposes')}
              >

                <p>{t('legalPrivacy.purposesP1')}</p>

                <BulletList items={t('legalPrivacy.purposesBullets')} />

              </Section>

              <Section
                id="legal-bases"
                number="06"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.legal-bases')}
              >

                <p>{t('legalPrivacy.legalBasesP1')}</p>

                <div className="privacy-basis-grid">

                  {t('legalPrivacy.legalBasesGrid').map((item, index) => (
                    <div key={index}>
                      <strong>{item[0]}</strong>
                      <span>{item[1]}</span>
                    </div>
                  ))}

                </div>

              </Section>

              <Section
                id="profile"
                number="07"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.profile')}
              >

                <p>{t('legalPrivacy.profileP1')}</p>
                <p>{t('legalPrivacy.profileP2')}</p>

                <div className="privacy-warning">

                  <strong>
                    {t('legalPrivacy.profileWarningTitle')}
                  </strong>

                  <p>{t('legalPrivacy.profileWarningBody')}</p>

                </div>

              </Section>

              <Section
                id="live"
                number="08"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.live')}
              >

                <p>{t('legalPrivacy.liveP1')}</p>
                <p>{t('legalPrivacy.liveP2')}</p>
                <p>{t('legalPrivacy.liveP3')}</p>

              </Section>

              <Section
                id="messages"
                number="09"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.messages')}
              >

                <p>{t('legalPrivacy.messagesP1')}</p>
                <p>{t('legalPrivacy.messagesP2')}</p>
                <p>{t('legalPrivacy.messagesP3')}</p>

                <div className="privacy-security-card">

                  <div className="privacy-security-icon">
                    🔐
                  </div>

                  <div>
                    <strong>
                      {t('legalPrivacy.messagesSecurityTitle')}
                    </strong>

                    <p>{t('legalPrivacy.messagesSecurityBody')}</p>
                  </div>

                </div>

              </Section>

              <Section
                id="gifts"
                number="10"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.gifts')}
              >

                <p>{t('legalPrivacy.giftsP1')}</p>

                <BulletList
                  items={t('legalPrivacy.giftsBullets')}
                />

                <p>{t('legalPrivacy.giftsP2')}</p>
                <p>{t('legalPrivacy.giftsP3')}</p>

              </Section>

              <Section
                id="location"
                number="11"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.location')}
              >

                <p>{t('legalPrivacy.locationP1')}</p>

                <div className="privacy-location-grid">

                  {t('legalPrivacy.locationGrid').map((item, index) => (
                    <div key={index}>
                      <strong>{item[0]}</strong>
                      <span>{item[1]}</span>
                    </div>
                  ))}

                </div>

                <p>{t('legalPrivacy.locationP2')}</p>

              </Section>

              <Section
                id="device"
                number="12"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.device')}
              >

                <p>{t('legalPrivacy.deviceP1')}</p>

                <BulletList
                  items={t('legalPrivacy.deviceBullets')}
                />

              </Section>

              <Section
                id="cookies"
                number="13"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.cookies')}
              >

                <p>{t('legalPrivacy.cookiesP1')}</p>

                <div className="privacy-cookie-grid">

                  {t('legalPrivacy.cookiesGrid').map((item, index) => (
                    <div key={index}>
                      <strong>{item[0]}</strong>
                      <span>{item[1]}</span>
                    </div>
                  ))}

                </div>

                <p>{t('legalPrivacy.cookiesP2')}</p>

              </Section>

              <Section
                id="analytics"
                number="14"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.analytics')}
              >

                <p>{t('legalPrivacy.analyticsP1')}</p>
                <p>{t('legalPrivacy.analyticsP2')}</p>

              </Section>

              <Section
                id="ai"
                number="15"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.ai')}
              >

                <p>{t('legalPrivacy.aiP1')}</p>
                <p>{t('legalPrivacy.aiP2')}</p>

                <div className="privacy-ai-card">

                  <div className="privacy-ai-symbol">
                    AI
                  </div>

                  <div>
                    <strong>
                      {t('legalPrivacy.aiCardTitle')}
                    </strong>

                    <p>{t('legalPrivacy.aiCardBody')}</p>
                  </div>

                </div>

              </Section>

              <Section
                id="moderation"
                number="16"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.moderation')}
              >

                <p>{t('legalPrivacy.moderationP1')}</p>

                <BulletList
                  items={t('legalPrivacy.moderationBullets')}
                />

                <p>{t('legalPrivacy.moderationP2')}</p>

              </Section>

              <Section
                id="sharing"
                number="17"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.sharing')}
              >

                <p>{t('legalPrivacy.sharingP1')}</p>
                <p>{t('legalPrivacy.sharingP2')}</p>

                <div className="privacy-recipient-grid">

                  {t('legalPrivacy.sharingGrid').map((item, index) => (
                    <div key={index}>
                      <strong>{item[0]}</strong>
                      <span>{item[1]}</span>
                    </div>
                  ))}

                </div>

              </Section>

              <Section
                id="transfers"
                number="18"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.transfers')}
              >

                <p>{t('legalPrivacy.transfersP1')}</p>
                <p>{t('legalPrivacy.transfersP2')}</p>
                <p>{t('legalPrivacy.transfersP3')}</p>

              </Section>

              <Section
                id="retention"
                number="19"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.retention')}
              >

                <p>{t('legalPrivacy.retentionP1')}</p>

                <div className="privacy-retention-grid">

                  {t('legalPrivacy.retentionGrid').map((item, index) => (
                    <div key={index}>
                      <strong>{item[0]}</strong>
                      <span>{item[1]}</span>
                    </div>
                  ))}

                </div>

                <p>{t('legalPrivacy.retentionP2')}</p>

              </Section>

              <Section
                id="security"
                number="20"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.security')}
              >

                <p>{t('legalPrivacy.securityP1')}</p>

                <BulletList
                  items={t('legalPrivacy.securityBullets')}
                />

                <div className="privacy-security-banner">

                  <div className="privacy-lock">
                    🔐
                  </div>

                  <div>
                    <strong>
                      {t('legalPrivacy.securityBannerTitle')}
                    </strong>

                    <p>{t('legalPrivacy.securityBannerBody')}</p>
                  </div>

                </div>

              </Section>

              <Section
                id="rights"
                number="21"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.rights')}
              >

                <p>{t('legalPrivacy.rightsP1')}</p>

                <BulletList items={t('legalPrivacy.rightsBullets')} />

                <p>{t('legalPrivacy.rightsP2')}</p>

                <div className="privacy-rights-card">

                  <div className="privacy-right-icon">
                    ✓
                  </div>

                  <div>
                    <strong>
                      {t('legalPrivacy.rightsCardTitle')}
                    </strong>

                    <p>{t('legalPrivacy.rightsCardBody')}</p>
                  </div>

                </div>

              </Section>

              <Section
                id="consent"
                number="22"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.consent')}
              >

                <p>{t('legalPrivacy.consentP1')}</p>
                <p>{t('legalPrivacy.consentP2')}</p>
                <p>{t('legalPrivacy.consentP3')}</p>

              </Section>

              <Section
                id="children"
                number="23"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.children')}
              >

                <p>{t('legalPrivacy.childrenP1')}</p>
                <p>{t('legalPrivacy.childrenP2')}</p>
                <p>{t('legalPrivacy.childrenP3')}</p>

              </Section>

              <Section
                id="thirdparty"
                number="24"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.thirdparty')}
              >

                <p>{t('legalPrivacy.thirdpartyP1')}</p>
                <p>{t('legalPrivacy.thirdpartyP2')}</p>
                <p>{t('legalPrivacy.thirdpartyP3')}</p>

                <div className="privacy-placeholder">

                  <span>{t('legalPrivacy.thirdpartyLabel')}</span>

                  <strong>
                    {t('legalPrivacy.thirdpartyPlaceholder')}
                  </strong>

                  <p>{t('legalPrivacy.thirdpartyBody')}</p>

                </div>

              </Section>

              <Section
                id="deletion"
                number="25"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.deletion')}
              >

                <p>{t('legalPrivacy.deletionP1')}</p>
                <p>{t('legalPrivacy.deletionP2')}</p>

                <div className="privacy-delete-card">

                  <strong>
                    {t('legalPrivacy.deletionCardTitle')}
                  </strong>

                  <span>{t('legalPrivacy.deletionCardBody')}</span>

                </div>

              </Section>

              <Section
                id="breach"
                number="26"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.breach')}
              >

                <p>{t('legalPrivacy.breachP1')}</p>
                <p>{t('legalPrivacy.breachP2')}</p>

              </Section>

              <Section
                id="complaints"
                number="27"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.complaints')}
              >

                <p>{t('legalPrivacy.complaintsP1')}</p>
                <p>{t('legalPrivacy.complaintsP2')}</p>

                <div className="privacy-authority-grid">

                  {t('legalPrivacy.complaintsGrid').map((item, index) => (
                    <div key={index}>
                      <strong>{item[0]}</strong>
                      <span>{item[1]}</span>
                    </div>
                  ))}

                </div>

              </Section>

              <Section
                id="changes"
                number="28"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.changes')}
              >

                <p>{t('legalPrivacy.changesP1')}</p>
                <p>{t('legalPrivacy.changesP2')}</p>
                <p>{t('legalPrivacy.changesP3')}</p>

              </Section>

              <Section
                id="contact"
                number="29"
                label={t('legalPrivacy.sectionLabel')}
                title={t('legalPrivacy.sectionTitles.contact')}
              >

                <p>{t('legalPrivacy.contactP1')}</p>

                <div className="privacy-contact-card">

                  {/* OFFICIAL AMORALIVE LOGO */}
                  <div className="privacy-contact-logo">
                    <img
                      src="/brand/amora-logo.png"
                      alt="AmoraLive"
                    />
                  </div>

                  <div>

                    <span>
                      {t('legalPrivacy.contactLabel')}
                    </span>

                    <strong>
                      {t('legalPrivacy.contactEntityPlaceholder')}
                    </strong>

                    <p>
                      {t('legalPrivacy.contactEmailLabel')}
                      <br />
                      {t('legalPrivacy.contactEmailPlaceholder')}
                    </p>

                    <p>
                      {t('legalPrivacy.contactAddressLabel')}
                      <br />
                      {t('legalPrivacy.contactAddressPlaceholder')}
                    </p>

                    <p>
                      {t('legalPrivacy.contactDpoLabel')}
                      <br />
                      {t('legalPrivacy.contactDpoPlaceholder')}
                    </p>

                  </div>

                </div>

              </Section>

              {/* FINAL */}
              <div className="privacy-final-card">

                <div className="privacy-final-glow" />

                {/* OFFICIAL AMORALIVE LOGO */}
                <div className="privacy-final-symbol">
                  <img
                    src="/brand/amora-logo.png"
                    alt="AmoraLive"
                  />
                </div>

                <div>

                  <div className="privacy-label">
                    {t('legalPrivacy.finalLabel')}
                  </div>

                  <h2>
                    {t('legalPrivacy.finalTitle')}
                  </h2>

                  <p>{t('legalPrivacy.finalP1')}</p>

                  <p>{t('legalPrivacy.finalP2')}</p>

                </div>

              </div>

              {/* FOOTER */}
              <div className="privacy-document-footer">

                <div>
                  <strong>
                    {t('legalPrivacy.footerBrand')}
                  </strong>

                  <span>
                    {t('legalPrivacy.footerTagline')}
                  </span>
                </div>

                <div className="privacy-footer-links">

                  <Link href="/legal/terms">
                    {t('legalPrivacy.footerLinkTerms')}
                  </Link>

                  <Link href="/legal/guidelines">
                    {t('legalPrivacy.footerLinkCommunity')}
                  </Link>

                  <Link href="/legal/cookies">
                    {t('legalPrivacy.footerLinkCookies')}
                  </Link>

                  <Link href="/">
                    {t('legalPrivacy.footerLinkHome')}
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
            overflow: hidden;
          }

          .shield-inner img {
            width: 72px;
            height: 72px;
            object-fit: contain;
            display: block;
            filter: drop-shadow(
              0 0 18px rgba(255,255,255,.18)
            );
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

          /* OFFICIAL AMORALIVE LOGO CONTAINER */
          .privacy-contact-logo,
          .privacy-final-symbol {
            width: 52px;
            min-width: 52px;
            height: 52px;
            display: grid;
            place-items: center;
            border-radius: 16px;
            background: linear-gradient(135deg,#ff3f9d,#9b35ff);
            box-shadow: 0 0 30px rgba(255,63,157,.22);
            overflow: hidden;
          }

          .privacy-contact-logo img,
          .privacy-final-symbol img {
            width: 34px;
            height: 34px;
            object-fit: contain;
            display: block;
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
            }

            .shield-inner img {
              width: 48px;
              height: 48px;
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
