import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from '../lib/i18n';

export default function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footerText,
  footerHref,
  footerLabel,
}) {
  const { lang, setLang, languages, t } = useTranslation();
  return (
    <>
      <Head>
        <title>{title} — AmoraLive</title>
        <meta name="description" content={`${title} — AmoraLive, meaningful connections.`} />
      </Head>

      <main className="amora-auth-page">
        <div className="amora-auth-card">
          <div className="amora-auth-top">
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <select
                aria-label={t('common.language')}
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                style={{ background: 'transparent', color: 'inherit', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, padding: '4px 6px', fontSize: 12 }}
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} style={{ color: '#000' }}>{l.label}</option>
                ))}
              </select>
            </div>
            <Link href="/" className="amora-auth-logo-link" aria-label="AmoraLive home">
              <img
                src="/brand/amora-header-logo.png"
                alt="Amora"
                className="amora-auth-logo"
                width="96"
                height="96"
              />
            </Link>

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
