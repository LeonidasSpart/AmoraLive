import React, { useEffect } from 'react';
import Link from 'next/link';

const features = [
  ['💗','Meaningful matching','Discover people who fit your vibe and build genuine connections.'],
  ['🎥','Video Match','Meet face-to-face with a fast, respectful first impression experience.'],
  ['🔴','Live & social','Join live rooms, chat in real time and share moments together.'],
  ['💬','Private conversations','Keep your conversations close with realtime messaging and notifications.'],
  ['🎁','Gifts & rewards','Send expressive paid gifts and make every live interaction more memorable.'],
  ['🛡️','Safety first','Reporting, blocking and account protections are built into the experience.'],
];

export default function Home() {
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('accessToken')) window.location.replace('/discover');
  }, []);

  return (
    <div className="amora-page">
      <header className="amora-nav">
        <div className="amora-container amora-nav-inner">
          <Link href="/" aria-label="AmoraLive home"><img className="amora-logo" src="/brand/amora-logo.png" alt="Amora — Meaningful Connections" /></Link>
          <nav className="amora-nav-links" aria-label="Main navigation">
            <a href="#features">Features</a><a href="#about">Why Amora</a><a href="#safety">Safety</a>
          </nav>
          <div className="amora-actions"><Link className="amora-btn amora-btn-secondary" href="/login">Log in</Link><Link className="amora-btn amora-btn-primary" href="/register">Create account</Link></div>
        </div>
      </header>

      <main>
        <section className="amora-container amora-hero">
          <div>
            <span className="amora-eyebrow"><span className="amora-eyebrow-dot"/> Live dating, made meaningful</span>
            <h1>Meet people.<br/><span className="amora-gradient-text">Feel the connection.</span></h1>
            <p>AmoraLive brings matching, video, live rooms, private chat and real-time moments together in one beautifully connected experience.</p>
            <div className="amora-hero-actions"><Link className="amora-btn amora-btn-primary" href="/register">Start your Amora journey →</Link><Link className="amora-btn amora-btn-secondary" href="/login">I already have an account</Link></div>
            <div className="amora-trust"><span>✓ 18+ community</span><span>✓ Web, iPad & mobile</span><span>✓ Built for real connections</span></div>
          </div>
          <div className="amora-showcase">
            <div className="amora-logo-card">
              <img src="/brand/amora-brand-dark.png" alt="Amora brand" />
              <div className="amora-chip-row"><div className="amora-chip"><strong>Live</strong><span>Real-time rooms</span></div><div className="amora-chip"><strong>Match</strong><span>Meet naturally</span></div><div className="amora-chip"><strong>Chat</strong><span>Stay connected</span></div></div>
            </div>
          </div>
        </section>

        <section id="features" className="amora-section">
          <div className="amora-container"><h2>Everything you need to <span className="amora-gradient-text">connect.</span></h2><p className="amora-section-intro">One brand, one ecosystem, one place for discovery, conversation and live experiences.</p>
            <div className="amora-grid">{features.map(([icon,title,text]) => <article className="amora-feature" key={title}><div className="amora-feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p></article>)}</div>
          </div>
        </section>

        <section id="about" className="amora-section"><div className="amora-container"><div className="amora-cta"><span className="amora-eyebrow">AMORA · MEANINGFUL CONNECTIONS</span><h2>Less noise. <span className="amora-gradient-text">More connection.</span></h2><p>Designed for desktop, tablets, iPad and every modern mobile screen — with a responsive experience that feels native everywhere.</p><div className="amora-hero-actions" style={{justifyContent:'center'}}><Link className="amora-btn amora-btn-primary" href="/register">Join AmoraLive</Link></div></div></div></section>
      </main>

      <footer id="safety" className="amora-footer"><div className="amora-container amora-footer-inner"><span>© {new Date().getFullYear()} AmoraLive. All rights reserved.</span><div className="amora-footer-links"><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link><Link href="/legal/guidelines">Community Guidelines</Link><Link href="/legal/cookies">Cookies</Link></div></div></footer>
    </div>
  );
}
