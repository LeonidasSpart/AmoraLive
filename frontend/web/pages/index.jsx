import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from '../lib/i18n';

export default function Home() {
  const { t, lang, setLang, languages } = useTranslation();
  const features = [
    ['💗', t('landing.feature1Title'), t('landing.feature1Text')],
    ['🎥', t('landing.feature2Title'), t('landing.feature2Text')],
    ['🔴', t('landing.feature3Title'), t('landing.feature3Text')],
    ['💬', t('landing.feature4Title'), t('landing.feature4Text')],
    ['🎁', t('landing.feature5Title'), t('landing.feature5Text')],
    ['🛡️', t('landing.feature6Title'), t('landing.feature6Text')],
  ];
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('accessToken')) {
      window.location.replace('/discover');
    }
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="amora-page">
      <Head>
        <title>AmoraLive — Meet people. Feel the connection.</title>
        <meta name="description" content="AmoraLive brings matching, video, live rooms and private chat together for meaningful connections." />
      </Head>

      <header className="amora-nav">
        <div className="amora-container amora-nav-inner">
          <Link className="amora-brand-link" href="/" aria-label="AmoraLive home" onClick={closeMenu}>
            <img className="amora-header-logo" src="/brand/amora-header-logo.png" alt="Amora" />
          </Link>

          <nav className={`amora-nav-links${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
            <a href="#features" onClick={closeMenu}>{t('landing.navFeatures')}</a>
            <a href="#about" onClick={closeMenu}>{t('landing.navWhyAmora')}</a>
            <a href="#safety" onClick={closeMenu}>{t('landing.navSafety')}</a>
            <div className="amora-mobile-actions">
              <Link className="amora-btn amora-btn-secondary" href="/login" onClick={closeMenu}>{t('landing.logIn')}</Link>
              <Link className="amora-btn amora-btn-primary" href="/register" onClick={closeMenu}>{t('landing.createAccount')}</Link>
            </div>
          </nav>

          <div className="amora-actions amora-desktop-actions">
            <select
              aria-label={t('common.language')}
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{ background: 'transparent', color: 'inherit', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, padding: '4px 6px', fontSize: 12, marginRight: 8 }}
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} style={{ color: '#000' }}>{l.label}</option>
              ))}
            </select>
            <Link className="amora-btn amora-btn-secondary" href="/login">{t('landing.logIn')}</Link>
            <Link className="amora-btn amora-btn-primary" href="/register">{t('landing.createAccount')}</Link>
          </div>

          <button
            className={`amora-menu-toggle${menuOpen ? ' is-open' : ''}`}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="amora-mobile-navigation"
            aria-label={menuOpen ? t('landing.closeNav') : t('landing.openNav')}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      <main>
        <section className="amora-container amora-hero">
          <div className="amora-hero-copy">
            <span className="amora-eyebrow"><span className="amora-eyebrow-dot" /> {t('landing.eyebrowHero')}</span>
            <h1>{t('landing.heroTitleLine1')}<br /><span className="amora-gradient-text">{t('landing.heroTitleLine2')}</span></h1>
            <p>{t('landing.heroSubtitle')}</p>
            <div className="amora-hero-actions">
              <Link className="amora-btn amora-btn-primary amora-btn-large" href="/register">{t('landing.startJourney')} <span aria-hidden="true">→</span></Link>
              <Link className="amora-btn amora-btn-secondary amora-btn-large" href="/login">{t('landing.alreadyHaveAccount')}</Link>
            </div>
            <div className="amora-trust" aria-label="Amora highlights">
              <span>{t('landing.trust18')}</span>
              <span>{t('landing.trustDevices')}</span>
              <span>{t('landing.trustReal')}</span>
            </div>
          </div>

          <div className="amora-showcase" aria-label="Amora product preview">
            <div className="amora-logo-card">
              <div className="amora-logo-card-glow" aria-hidden="true" />
              <div className="amora-preview-brand">
                <img src="/brand/amora-brand-dark.png" alt="Amora — Meaningful Connections" />
              </div>
              <div className="amora-chip-row">
                <div className="amora-chip"><strong>{t('landing.liveChipTitle')}</strong><span>{t('landing.liveChipSub')}</span></div>
                <div className="amora-chip"><strong>{t('landing.matchChipTitle')}</strong><span>{t('landing.matchChipSub')}</span></div>
                <div className="amora-chip"><strong>{t('landing.chatChipTitle')}</strong><span>{t('landing.chatChipSub')}</span></div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="amora-section">
          <div className="amora-container">
            <div className="amora-section-heading">
              <span className="amora-section-kicker">{t('landing.sectionKicker')}</span>
              <h2>{t('landing.sectionTitle')} <span className="amora-gradient-text">{t('landing.sectionTitleGradient')}</span></h2>
              <p className="amora-section-intro">{t('landing.sectionIntro')}</p>
            </div>
            <div className="amora-grid">
              {features.map(([icon, title, text]) => (
                <article className="amora-feature" key={title}>
                  <div className="amora-feature-icon" aria-hidden="true">{icon}</div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="amora-section amora-section-soft">
          <div className="amora-container">
            <div className="amora-cta">
              <span className="amora-eyebrow">{t('landing.ctaEyebrow')}</span>
              <h2>{t('landing.ctaTitle')} <span className="amora-gradient-text">{t('landing.ctaTitleGradient')}</span></h2>
              <p>{t('landing.ctaText')}</p>
              <div className="amora-hero-actions amora-hero-actions-centered">
                <Link className="amora-btn amora-btn-primary amora-btn-large" href="/register">{t('landing.joinAmora')}</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="safety" className="amora-footer">
        <div className="amora-container amora-footer-inner">
          <div className="amora-footer-brand">
            <img src="/brand/amora-mark.png" alt="" aria-hidden="true" />
            <span>© {new Date().getFullYear()} AmoraLive</span>
          </div>
          <div className="amora-footer-links">
            <Link href="/legal/terms">{t('landing.footerTerms')}</Link>
            <Link href="/legal/privacy">{t('landing.footerPrivacy')}</Link>
            <Link href="/legal/guidelines">{t('landing.footerGuidelines')}</Link>
            <Link href="/legal/cookies">{t('landing.footerCookies')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
