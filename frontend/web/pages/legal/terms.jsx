import React, { useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { useTranslation } from '../../lib/i18n';

const sectionIds = [
  ['acceptance', '01'], ['eligibility', '02'], ['account', '03'], ['content', '04'], ['conduct', '05'],
  ['safety', '06'], ['live', '07'], ['moderation', '08'], ['expression', '09'], ['ip', '10'],
  ['gifts', '11'], ['payments', '12'], ['privacy', '13'], ['gdpr', '14'], ['swiss', '15'],
  ['dsa', '16'], ['consumers', '17'], ['security', '18'], ['minors', '19'], ['ai', '20'],
  ['thirdparty', '21'], ['availability', '22'], ['termination', '23'], ['liability', '24'],
  ['international', '25'], ['disputes', '26'], ['changes', '27'], ['contact', '28']
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
  const { t, lang } = useTranslation();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const sections = sectionIds.map(([id, number]) => ({ id, number, title: t(`legalTerms.sectionTitles.${id}`) }));

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
                {t('legalTerms.badge')}
              </div>

              <h1>
                {t('legalTerms.heroTitle1')}
                <span> {t('legalTerms.heroTitle2')}</span>
              </h1>

              <p className="hero-description">
                {t('legalTerms.heroDesc')}
              </p>

              <div className="hero-meta">

                <div>
                  <span>{t('legalTerms.metaVersion')}</span>
                  <strong>{t('legalTerms.metaVersionVal')}</strong>
                </div>

                <div>
                  <span>{t('legalTerms.metaEffective')}</span>
                  <strong>{t('legalTerms.metaEffectiveVal')}</strong>
                </div>

                <div>
                  <span>{t('legalTerms.metaScope')}</span>
                  <strong>{t('legalTerms.metaScopeVal')}</strong>
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
                <strong>{t('legalTerms.statusEuTitle')}</strong>
                <span>{t('legalTerms.statusEuSub')}</span>
              </div>
            </div>

            <div className="status-card">
              <div className="status-icon">CH</div>

              <div>
                <strong>{t('legalTerms.statusChTitle')}</strong>
                <span>{t('legalTerms.statusChSub')}</span>
              </div>
            </div>

            <div className="status-card">
              <div className="status-icon">18+</div>

              <div>
                <strong>{t('legalTerms.statusAdultTitle')}</strong>
                <span>{t('legalTerms.statusAdultSub')}</span>
              </div>
            </div>

            <div className="status-card">
              <div className="status-icon">✓</div>

              <div>
                <strong>{t('legalTerms.statusConsumerTitle')}</strong>
                <span>{t('legalTerms.statusConsumerSub')}</span>
              </div>
            </div>

          </div>

          {/* NOTICE */}
          <div className="important-notice">

            <div className="notice-icon">!</div>

            <div>
              <strong>{t('legalTerms.noticeTitle')}</strong>

              <p>
                {t('legalTerms.noticeBody')}
              </p>
            </div>

          </div>

          {lang !== 'en' && (
            <div className="important-notice">

              <div className="notice-icon">EN</div>

              <div>
                <strong>{t('legalTerms.translationNoticeTitle')}</strong>

                <p>
                  {t('legalTerms.translationNoticeBody')}
                </p>
              </div>

            </div>
          )}

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
                {t('legalTerms.navLabel')}
              </button>

              <div className="sidebar-inner">

                <div className="sidebar-title">
                  <span>{t('legalTerms.sidebarDocLabel')}</span>
                  <strong>{t('legalTerms.sidebarDocTitle')}</strong>
                </div>

                <div className="search-box">

                  <span>⌕</span>

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('legalTerms.searchPlaceholder')}
                    aria-label={t('legalTerms.searchAriaLabel')}
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
                    {t('legalTerms.linkPrivacy')}
                  </Link>

                  <Link href="/legal/guidelines">
                    {t('legalTerms.linkGuidelines')}
                  </Link>

                  <Link href="/legal/cookies">
                    {t('legalTerms.linkCookies')}
                  </Link>

                </div>

              </div>

            </aside>

            {/* DOCUMENT */}
            <article className="legal-document">

              <Section
                id="acceptance"
                number="01"
                title={t('legalTerms.sectionTitles.acceptance')}
              >
                <p>{t('legalTerms.acceptanceP1')}</p>
                <p>{t('legalTerms.acceptanceP2')}</p>
                <p>{t('legalTerms.acceptanceP3')}</p>
              </Section>

              <Section
                id="eligibility"
                number="02"
                title={t('legalTerms.sectionTitles.eligibility')}
              >
                <p>{t('legalTerms.eligibilityP1')}</p>

                <BulletList items={t('legalTerms.eligibilityBullets')} />
              </Section>

              <Section
                id="account"
                number="03"
                title={t('legalTerms.sectionTitles.account')}
              >
                <p>{t('legalTerms.accountP1')}</p>

                <BulletList items={t('legalTerms.accountBullets')} />
              </Section>

              <Section
                id="content"
                number="04"
                title={t('legalTerms.sectionTitles.content')}
              >
                <p>{t('legalTerms.contentP1')}</p>
                <p>{t('legalTerms.contentP2')}</p>

                <div className="quote-card">
                  <span className="quote-mark">"</span>

                  <p>{t('legalTerms.contentQuote')}</p>
                </div>
              </Section>

              <Section
                id="conduct"
                number="05"
                title={t('legalTerms.sectionTitles.conduct')}
              >
                <p>{t('legalTerms.conductP1')}</p>

                <BulletList items={t('legalTerms.conductBullets')} />
              </Section>

              <Section
                id="safety"
                number="06"
                title={t('legalTerms.sectionTitles.safety')}
              >
                <p>{t('legalTerms.safetyP1')}</p>
                <p>{t('legalTerms.safetyP2')}</p>
              </Section>

              <Section
                id="live"
                number="07"
                title={t('legalTerms.sectionTitles.live')}
              >
                <p>{t('legalTerms.liveP1')}</p>

                <BulletList
                  items={t('legalTerms.liveBullets')}
                />
              </Section>

              <Section
                id="moderation"
                number="08"
                title={t('legalTerms.sectionTitles.moderation')}
              >
                <p>{t('legalTerms.moderationP1')}</p>
                <p>{t('legalTerms.moderationP2')}</p>

                <div className="feature-grid">

                  <div>
                    <strong>{t('legalTerms.moderationFeatureReport')}</strong>
                    <span>{t('legalTerms.moderationFeatureReportText')}</span>
                  </div>

                  <div>
                    <strong>{t('legalTerms.moderationFeatureReview')}</strong>
                    <span>{t('legalTerms.moderationFeatureReviewText')}</span>
                  </div>

                  <div>
                    <strong>{t('legalTerms.moderationFeatureAppeal')}</strong>
                    <span>{t('legalTerms.moderationFeatureAppealText')}</span>
                  </div>

                </div>
              </Section>

              <Section
                id="expression"
                number="09"
                title={t('legalTerms.sectionTitles.expression')}
              >
                <p>{t('legalTerms.expressionP1')}</p>
                <p>{t('legalTerms.expressionP2')}</p>
                <p>{t('legalTerms.expressionP3')}</p>
              </Section>

              <Section
                id="ip"
                number="10"
                title={t('legalTerms.sectionTitles.ip')}
              >
                <p>{t('legalTerms.ipP1')}</p>
                <p>{t('legalTerms.ipP2')}</p>
              </Section>

              <Section
                id="gifts"
                number="11"
                title={t('legalTerms.sectionTitles.gifts')}
              >
                <p>{t('legalTerms.giftsP1')}</p>

                <div className="warning-card">

                  <strong>
                    {t('legalTerms.giftsWarningTitle')}
                  </strong>

                  <p>{t('legalTerms.giftsWarningBody')}</p>

                </div>

                <BulletList
                  items={t('legalTerms.giftsBullets')}
                />
              </Section>

              <Section
                id="payments"
                number="12"
                title={t('legalTerms.sectionTitles.payments')}
              >
                <p>{t('legalTerms.paymentsP1')}</p>
                <p>{t('legalTerms.paymentsP2')}</p>
                <p>{t('legalTerms.paymentsP3')}</p>
              </Section>

              <Section
                id="privacy"
                number="13"
                title={t('legalTerms.sectionTitles.privacy')}
              >
                <p>{t('legalTerms.privacySectP1')}</p>
                <p>{t('legalTerms.privacySectP2')}</p>

                <div className="link-card">

                  <span>{t('legalTerms.privacyLinkLabel')}</span>

                  <Link href="/legal/privacy">
                    {t('legalTerms.privacyLinkText')}
                  </Link>

                </div>
              </Section>

              <Section
                id="gdpr"
                number="14"
                title={t('legalTerms.sectionTitles.gdpr')}
              >
                <p>{t('legalTerms.gdprP1')}</p>
                <p>{t('legalTerms.gdprP2')}</p>
              </Section>

              <Section
                id="swiss"
                number="15"
                title={t('legalTerms.sectionTitles.swiss')}
              >
                <p>{t('legalTerms.swissP1')}</p>
                <p>{t('legalTerms.swissP2')}</p>
              </Section>

              <Section
                id="dsa"
                number="16"
                title={t('legalTerms.sectionTitles.dsa')}
              >
                <p>{t('legalTerms.dsaP1')}</p>

                <div className="dsa-grid">

                  <div>
                    <strong>{t('legalTerms.dsaGridNoticeTitle')}</strong>
                    <span>{t('legalTerms.dsaGridNoticeText')}</span>
                  </div>

                  <div>
                    <strong>{t('legalTerms.dsaGridReasonsTitle')}</strong>
                    <span>{t('legalTerms.dsaGridReasonsText')}</span>
                  </div>

                  <div>
                    <strong>{t('legalTerms.dsaGridComplaintsTitle')}</strong>
                    <span>{t('legalTerms.dsaGridComplaintsText')}</span>
                  </div>

                  <div>
                    <strong>{t('legalTerms.dsaGridTransparencyTitle')}</strong>
                    <span>{t('legalTerms.dsaGridTransparencyText')}</span>
                  </div>

                </div>

                <p>{t('legalTerms.dsaP2')}</p>
              </Section>

              <Section
                id="consumers"
                number="17"
                title={t('legalTerms.sectionTitles.consumers')}
              >
                <p>{t('legalTerms.consumersP1')}</p>
                <p>{t('legalTerms.consumersP2')}</p>
                <p>{t('legalTerms.consumersP3')}</p>
              </Section>

              <Section
                id="security"
                number="18"
                title={t('legalTerms.sectionTitles.security')}
              >
                <p>{t('legalTerms.securityP1')}</p>

                <BulletList
                  items={t('legalTerms.securityBullets')}
                />
              </Section>

              <Section
                id="minors"
                number="19"
                title={t('legalTerms.sectionTitles.minors')}
              >
                <p>{t('legalTerms.minorsP1')}</p>
                <p>{t('legalTerms.minorsP2')}</p>
                <p>{t('legalTerms.minorsP3')}</p>
              </Section>

              <Section
                id="ai"
                number="20"
                title={t('legalTerms.sectionTitles.ai')}
              >
                <p>{t('legalTerms.aiP1')}</p>
                <p>{t('legalTerms.aiP2')}</p>
              </Section>

              <Section
                id="thirdparty"
                number="21"
                title={t('legalTerms.sectionTitles.thirdparty')}
              >
                <p>{t('legalTerms.thirdpartyP1')}</p>
                <p>{t('legalTerms.thirdpartyP2')}</p>
              </Section>

              <Section
                id="availability"
                number="22"
                title={t('legalTerms.sectionTitles.availability')}
              >
                <p>{t('legalTerms.availabilityP1')}</p>
                <p>{t('legalTerms.availabilityP2')}</p>
              </Section>

              <Section
                id="termination"
                number="23"
                title={t('legalTerms.sectionTitles.termination')}
              >
                <p>{t('legalTerms.terminationP1')}</p>
                <p>{t('legalTerms.terminationP2')}</p>
              </Section>

              <Section
                id="liability"
                number="24"
                title={t('legalTerms.sectionTitles.liability')}
              >
                <p>{t('legalTerms.liabilityP1')}</p>
                <p>{t('legalTerms.liabilityP2')}</p>

                <div className="legal-protection">

                  <span>{t('legalTerms.liabilityLabel')}</span>

                  <strong>
                    {t('legalTerms.liabilityBadge')}
                  </strong>

                </div>
              </Section>

              <Section
                id="international"
                number="25"
                title={t('legalTerms.sectionTitles.international')}
              >
                <p>{t('legalTerms.internationalP1')}</p>
                <p>{t('legalTerms.internationalP2')}</p>
              </Section>

              <Section
                id="disputes"
                number="26"
                title={t('legalTerms.sectionTitles.disputes')}
              >
                <p>{t('legalTerms.disputesP1')}</p>
                <p>{t('legalTerms.disputesP2')}</p>

                <div className="placeholder-card">

                  <span>{t('legalTerms.disputesPlaceholderLabel')}</span>

                  <strong>
                    {t('legalTerms.disputesPlaceholderText')}
                  </strong>

                </div>
              </Section>

              <Section
                id="changes"
                number="27"
                title={t('legalTerms.sectionTitles.changes')}
              >
                <p>{t('legalTerms.changesP1')}</p>
                <p>{t('legalTerms.changesP2')}</p>
              </Section>

              <Section
                id="contact"
                number="28"
                title={t('legalTerms.sectionTitles.contact')}
              >
                <p>{t('legalTerms.contactP1')}</p>

                <div className="contact-card">

                  {/* OFFICIAL AMORA LOGO */}
                  <div className="contact-logo">
                    <img
                      src="/brand/amora-logo.png"
                      alt="AmoraLive"
                    />
                  </div>

                  <div>

                    <span>{t('legalTerms.contactLabel')}</span>

                    <strong>
                      {t('legalTerms.contactEntityPlaceholder')}
                    </strong>

                    <p>
                      {t('legalTerms.contactAddressLabel')} {t('legalTerms.contactAddressPlaceholder')}
                      <br />
                      {t('legalTerms.contactCountryLabel')} {t('legalTerms.contactCountryPlaceholder')}
                      <br />
                      {t('legalTerms.contactEmailLabel')} {t('legalTerms.contactEmailPlaceholder')}
                      <br />
                      {t('legalTerms.contactSupportLabel')} {t('legalTerms.contactSupportPlaceholder')}
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
                    {t('legalTerms.finalLabel')}
                  </div>

                  <h2>{t('legalTerms.finalTitle')}</h2>

                  <p>{t('legalTerms.finalP1')}</p>

                  <p>{t('legalTerms.finalP2')}</p>

                </div>

              </div>

              <div className="document-footer">

                <div>
                  <strong>{t('legalTerms.footerBrand')}</strong>
                  <span>
                    {t('legalTerms.footerTagline')}
                  </span>
                </div>

                <div className="footer-links">

                  <Link href="/legal/privacy">
                    {t('legalTerms.footerLinkPrivacy')}
                  </Link>

                  <Link href="/legal/guidelines">
                    {t('legalTerms.footerLinkCommunity')}
                  </Link>

                  <Link href="/legal/cookies">
                    {t('legalTerms.footerLinkCookies')}
                  </Link>

                  <Link href="/">
                    {t('legalTerms.footerLinkHome')}
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
