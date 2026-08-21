import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const features = [
  ['💗', 'Meaningful matching', 'Discover people who fit your vibe and build genuine connections.'],
  ['🎥', 'Video Match', 'Meet face-to-face with a fast, respectful first impression experience.'],
  ['🔴', 'Live & social', 'Join live rooms, chat in real time and share moments together.'],
  ['💬', 'Private conversations', 'Keep your conversations close with realtime messaging and notifications.'],
  ['🎁', 'Gifts & rewards', 'Send expressive paid gifts and make every live interaction more memorable.'],
  ['🛡️', 'Safety first', 'Reporting, blocking and account protections are built into the experience.'],
];

export default function Home() {
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
            <a href="#features" onClick={closeMenu}>Features</a>
            <a href="#about" onClick={closeMenu}>Why Amora</a>
            <a href="#safety" onClick={closeMenu}>Safety</a>
            <div className="amora-mobile-actions">
              <Link className="amora-btn amora-btn-secondary" href="/login" onClick={closeMenu}>Log in</Link>
              <Link className="amora-btn amora-btn-primary" href="/register" onClick={closeMenu}>Create account</Link>
            </div>
          </nav>

          <div className="amora-actions amora-desktop-actions">
            <Link className="amora-btn amora-btn-secondary" href="/login">Log in</Link>
            <Link className="amora-btn amora-btn-primary" href="/register">Create account</Link>
          </div>

          <button
            className={`amora-menu-toggle${menuOpen ? ' is-open' : ''}`}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="amora-mobile-navigation"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      <main>
        <section className="amora-container amora-hero">
          <div className="amora-hero-copy">
            <span className="amora-eyebrow"><span className="amora-eyebrow-dot" /> Live dating, made meaningful</span>
            <h1>Meet people.<br /><span className="amora-gradient-text">Feel the connection.</span></h1>
            <p>AmoraLive brings matching, video, live rooms, private chat and real-time moments together in one beautifully connected experience.</p>
            <div className="amora-hero-actions">
              <Link className="amora-btn amora-btn-primary amora-btn-large" href="/register">Start your Amora journey <span aria-hidden="true">→</span></Link>
              <Link className="amora-btn amora-btn-secondary amora-btn-large" href="/login">I already have an account</Link>
            </div>
            <div className="amora-trust" aria-label="Amora highlights">
              <span>✓ 18+ community</span>
              <span>✓ Web, iPad & mobile</span>
              <span>✓ Built for real connections</span>
            </div>
          </div>

          <div className="amora-showcase" aria-label="Amora product preview">
            <div className="amora-logo-card">
              <div className="amora-logo-card-glow" aria-hidden="true" />
              <div className="amora-preview-brand">
                <img src="/brand/amora-brand-dark.png" alt="Amora — Meaningful Connections" />
              </div>
              <div className="amora-chip-row">
                <div className="amora-chip"><strong>Live</strong><span>Real-time rooms</span></div>
                <div className="amora-chip"><strong>Match</strong><span>Meet naturally</span></div>
                <div className="amora-chip"><strong>Chat</strong><span>Stay connected</span></div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="amora-section">
          <div className="amora-container">
            <div className="amora-section-heading">
              <span className="amora-section-kicker">THE AMORA EXPERIENCE</span>
              <h2>Everything you need to <span className="amora-gradient-text">connect.</span></h2>
              <p className="amora-section-intro">One brand, one ecosystem, one place for discovery, conversation and live experiences.</p>
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
              <span className="amora-eyebrow">AMORA · MEANINGFUL CONNECTIONS</span>
              <h2>Less noise. <span className="amora-gradient-text">More connection.</span></h2>
              <p>Designed for desktop, tablets, iPad and every modern mobile screen — with a responsive experience that feels natural everywhere.</p>
              <div className="amora-hero-actions amora-hero-actions-centered">
                <Link className="amora-btn amora-btn-primary amora-btn-large" href="/register">Join AmoraLive</Link>
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
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/guidelines">Community Guidelines</Link>
            <Link href="/legal/cookies">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
