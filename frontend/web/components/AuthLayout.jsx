import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footerText,
  footerHref,
  footerLabel,
}) {
  return (
    <>
      <Head>
        <title>{title} — AmoraLive</title>
        <meta name="description" content={`${title} — AmoraLive, meaningful connections.`} />
      </Head>
      <main className="amora-auth-page">
        <div className="amora-auth-card">
          <div className="amora-auth-top">
            <Link href="/" className="amora-auth-logo-link" aria-label="AmoraLive home">
              <img src="/brand/amora-header-logo.png" alt="Amora" className="amora-auth-logo" />
            </Link>
            <div className="amora-auth-brand-name">AMORA</div>
            <div className="amora-auth-tagline">MEANINGFUL CONNECTIONS</div>
            {eyebrow && <div className="amora-auth-eyebrow">{eyebrow}</div>}
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>

          <section className="amora-auth-body">
            {children}
          </section>

          {footerText && (
            <div className="amora-auth-footer">
              <span>{footerText}</span>{' '}
              <Link href={footerHref}>{footerLabel}</Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
