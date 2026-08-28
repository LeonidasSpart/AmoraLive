// pages/legal/cookies.jsx

import React, { useState } from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { useTranslation } from '../../lib/i18n';

const AMORA_LOGO = '/brand/amora-logo.png';

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

function CookieCategoryCard({ category, typicalPurposesLabel, consentLabel }) {
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
        {typicalPurposesLabel}
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
        <strong>{consentLabel}</strong>
        <span>{category.consent}</span>
      </div>
    </div>
  );
}

export default function Cookies() {
  const { t, lang } = useTranslation();
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
                {t('legalCookies.badge')}
              </div>

              <h1>
                {t('legalCookies.heroTitle1')}
                <br />
                <em>{t('legalCookies.heroTitle2')}</em>
              </h1>

              <p>
                {t('legalCookies.heroDesc')}
              </p>

              <div className="cookies-meta">

                <div>
                  <span>{t('legalCookies.metaVersion')}</span>
                  <strong>{t('legalCookies.metaVersionVal')}</strong>
                </div>

                <div>
                  <span>{t('legalCookies.metaUpdated')}</span>
                  <strong>{t('legalCookies.metaUpdatedVal')}</strong>
                </div>

                <div>
                  <span>{t('legalCookies.metaApplies')}</span>
                  <strong>{t('legalCookies.metaAppliesVal')}</strong>
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

            {[
              { icon: '✓' },
              { icon: '⚙' },
              { icon: '◌' },
              { icon: '⌁' }
            ].map((item, index) => {
              const [title, desc] = t('legalCookies.summaryGrid')[index];
              return (
                <div className="cookies-summary-card" key={index}>
                  <div className="summary-icon">{item.icon}</div>
                  <strong>{title}</strong>
                  <span>
                    {desc}
                  </span>
                </div>
              );
            })}

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
                {t('legalCookies.noticeTitle')}
              </strong>

              <p>
                {t('legalCookies.noticeBody')}
              </p>
            </div>

          </div>

          {lang !== 'en' && (
            <div className="cookies-notice">

              <div className="cookies-notice-icon">
                !
              </div>

              <div>
                <strong>
                  {t('legalCookies.translationNoticeTitle')}
                </strong>

                <p>
                  {t('legalCookies.translationNoticeBody')}
                </p>
              </div>

            </div>
          )}

          {/* =========================================================
              DOCUMENT
          ========================================================= */}

          <article className="cookies-document">

            <Section
              number="01"
              eyebrow={t('legalCookies.s01Eyebrow')}
              title={t('legalCookies.s01Title')}
            >

              <p>
                {t('legalCookies.s01P1')}
              </p>

              <p>
                {t('legalCookies.s01P2')}
              </p>

              <p>
                {t('legalCookies.s01P3')}
              </p>

              <div className="info-card">

                <div className="info-card-icon">
                  ◈
                </div>

                <div>
                  <strong>
                    {t('legalCookies.s01InfoTitle')}
                  </strong>

                  <span>
                    {t('legalCookies.s01InfoBody')}
                  </span>
                </div>

              </div>

            </Section>

            <Section
              number="02"
              eyebrow={t('legalCookies.s02Eyebrow')}
              title={t('legalCookies.s02Title')}
            >

              <p>
                {t('legalCookies.s02P1')}
              </p>

              <div className="purpose-grid">

                {t('legalCookies.purposeGrid').map((item, index) => (
                  <div className="purpose-card" key={index}>
                    <strong>{item[0]}</strong>
                    <span>
                      {item[1]}
                    </span>
                  </div>
                ))}

              </div>

            </Section>

            <Section
              number="03"
              eyebrow={t('legalCookies.s03Eyebrow')}
              title={t('legalCookies.s03Title')}
            >

              <p>
                {t('legalCookies.s03P1')}
              </p>

              <div className="category-grid">

                {t('legalCookies.categoryCards').map((category) => (
                  <CookieCategoryCard
                    key={category.title}
                    category={category}
                    typicalPurposesLabel={t('legalCookies.typicalPurposesLabel')}
                    consentLabel={t('legalCookies.consentLabel')}
                  />
                ))}

              </div>

            </Section>

            <Section
              number="04"
              eyebrow={t('legalCookies.s04Eyebrow')}
              title={t('legalCookies.s04Title')}
            >

              <p>
                {t('legalCookies.s04P1')}
              </p>

              <p>
                {t('legalCookies.s04P2')}
              </p>

              <div className="legal-highlight">

                <strong>
                  {t('legalCookies.s04ImportantTitle')}
                </strong>

                <span>
                  {t('legalCookies.s04ImportantBody')}
                </span>

              </div>

            </Section>

            <Section
              number="05"
              eyebrow={t('legalCookies.s05Eyebrow')}
              title={t('legalCookies.s05Title')}
            >

              <p>
                {t('legalCookies.s05P1')}
              </p>

              <p>
                {t('legalCookies.s05P2')}
              </p>

              <p>
                {t('legalCookies.s05P3')}
              </p>

            </Section>

            <Section
              number="06"
              eyebrow={t('legalCookies.s06Eyebrow')}
              title={t('legalCookies.s06Title')}
            >

              <p>
                {t('legalCookies.s06P1')}
              </p>

              <div className="choice-grid">

                {t('legalCookies.choiceGrid').map((item, index) => (
                  <div className="choice-card" key={index}>
                    <div className="choice-number">{String(index + 1).padStart(2, '0')}</div>
                    <strong>{item[0]}</strong>
                    <span>
                      {item[1]}
                    </span>
                  </div>
                ))}

              </div>

              <p>
                {t('legalCookies.s06P2')}
              </p>

            </Section>

            <Section
              number="07"
              eyebrow={t('legalCookies.s07Eyebrow')}
              title={t('legalCookies.s07Title')}
            >

              <p>
                {t('legalCookies.s07P1')}
              </p>

              <ul className="large-list">

                {t('legalCookies.browserBullets').map((item, index) => (
                  <li key={index}>
                    <span />
                    {item}
                  </li>
                ))}

              </ul>

              <div className="warning-card">

                <strong>
                  {t('legalCookies.s07WarningTitle')}
                </strong>

                <span>
                  {t('legalCookies.s07WarningBody')}
                </span>

              </div>

            </Section>

            <Section
              number="08"
              eyebrow={t('legalCookies.s08Eyebrow')}
              title={t('legalCookies.s08Title')}
            >

              <p>
                {t('legalCookies.s08P1')}
              </p>

              <p>
                {t('legalCookies.s08P2')}
              </p>

              <p>
                {t('legalCookies.s08P3')}
              </p>

              <div className="third-party-note">

                <strong>
                  {t('legalCookies.s08NoteTitle')}
                </strong>

                <span>
                  {t('legalCookies.s08NoteBody')}
                </span>

              </div>

            </Section>

            <Section
              number="09"
              eyebrow={t('legalCookies.s09Eyebrow')}
              title={t('legalCookies.s09Title')}
            >

              <p>
                {t('legalCookies.s09P1')}
              </p>

              <p>
                {t('legalCookies.s09P2')}
              </p>

              <p>
                {t('legalCookies.s09P3')}
              </p>

              <div className="law-grid">

                {t('legalCookies.lawGrid').map((item, index) => (
                  <div className="law-box" key={index}>
                    <span>{item[0]}</span>
                    <strong>
                      {item[1]}
                    </strong>
                  </div>
                ))}

              </div>

            </Section>

            <Section
              number="10"
              eyebrow={t('legalCookies.s10Eyebrow')}
              title={t('legalCookies.s10Title')}
            >

              <p>
                {t('legalCookies.s10P1')}
              </p>

              <p>
                {t('legalCookies.s10P2')}
              </p>

              <div className="retention-table">

                <div className="retention-row retention-header">
                  <span>{t('legalCookies.retentionHeader')[0]}</span>
                  <span>{t('legalCookies.retentionHeader')[1]}</span>
                  <span>{t('legalCookies.retentionHeader')[2]}</span>
                </div>

                {t('legalCookies.retentionRows').map((row, index) => (
                  <div className="retention-row" key={index}>
                    <strong>{row[0]}</strong>
                    <span>{row[1]}</span>
                    <span>{row[2]}</span>
                  </div>
                ))}

              </div>

              <p className="small-note">
                {t('legalCookies.s10Note')}
              </p>

            </Section>

            <Section
              number="11"
              eyebrow={t('legalCookies.s11Eyebrow')}
              title={t('legalCookies.s11Title')}
            >

              <p>
                {t('legalCookies.s11P1')}
              </p>

              <ul className="large-list">

                {t('legalCookies.rightsBullets').map((item, index) => (
                  <li key={index}>
                    <span />
                    {item}
                  </li>
                ))}

              </ul>

              <p>
                {t('legalCookies.s11P2')}
              </p>

              <div className="policy-links">

                <Link href="/legal/privacy">
                  {t('legalCookies.readPrivacyPolicy')}
                </Link>

                <Link href="/legal/terms">
                  {t('legalCookies.readTermsOfService')}
                </Link>

              </div>

            </Section>

            <Section
              number="12"
              eyebrow={t('legalCookies.s12Eyebrow')}
              title={t('legalCookies.s12Title')}
            >

              <p>
                {t('legalCookies.s12P1')}
              </p>

              <p>
                {t('legalCookies.s12P2')}
              </p>

              <p>
                {t('legalCookies.s12P3')}
              </p>

            </Section>

            <Section
              number="13"
              eyebrow={t('legalCookies.s13Eyebrow')}
              title={t('legalCookies.s13Title')}
            >

              <p>
                {t('legalCookies.s13P1')}
              </p>

              <div className="feature-grid">

                {t('legalCookies.featureGrid').map((item, index) => (
                  <div key={index}>
                    <strong>{item[0]}</strong>
                    <span>
                      {item[1]}
                    </span>
                  </div>
                ))}

              </div>

            </Section>

            <Section
              number="14"
              eyebrow={t('legalCookies.s14Eyebrow')}
              title={t('legalCookies.s14Title')}
            >

              <p>
                {t('legalCookies.s14P1')}
              </p>

              <p>
                {t('legalCookies.s14P2')}
              </p>

            </Section>

            <Section
              number="15"
              eyebrow={t('legalCookies.s15Eyebrow')}
              title={t('legalCookies.s15Title')}
            >

              <p>
                {t('legalCookies.s15P1')}
              </p>

              <p>
                {t('legalCookies.s15P2')}
              </p>

              <p>
                {t('legalCookies.s15P3')}
              </p>

              <p>
                {t('legalCookies.s15P4')}
              </p>

              <div className="europe-card">

                <div className="europe-card-symbol">
                  EU
                </div>

                <div>
                  <strong>
                    {t('legalCookies.europeCardTitle')}
                  </strong>

                  <span>
                    {t('legalCookies.europeCardBody')}
                  </span>
                </div>

              </div>

            </Section>

            <Section
              number="16"
              eyebrow={t('legalCookies.s16Eyebrow')}
              title={t('legalCookies.s16Title')}
            >

              <p>
                {t('legalCookies.s16P1')}
              </p>

              <p>
                {t('legalCookies.s16P2')}
              </p>

              <p>
                {t('legalCookies.s16P3')}
              </p>

            </Section>

            {/* =========================================================
                FAQ
            ========================================================= */}

            <section className="cookie-faq">

              <div className="cookie-eyebrow">
                {t('legalCookies.faqEyebrow')}
              </div>

              <h2>
                {t('legalCookies.faqTitle')}
              </h2>

              <div className="faq-list">

                {t('legalCookies.faqItems').map((item, index) => (
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
                  {t('legalCookies.finalLabel')}
                </div>

                <h2>
                  {t('legalCookies.finalTitle')}
                </h2>

                <p>
                  {t('legalCookies.finalBody')}
                </p>

              </div>

            </div>

            {/* =========================================================
                FOOTER
            ========================================================= */}

            <footer className="cookie-footer">

              <div>

                <strong>
                  {t('legalCookies.footerBrand')}
                </strong>

                <span>
                  {t('legalCookies.footerTagline')}
                </span>

              </div>

              <div className="cookie-footer-links">

                <Link href="/legal/terms">
                  {t('legalCookies.footerLinkTerms')}
                </Link>

                <Link href="/legal/privacy">
                  {t('legalCookies.footerLinkPrivacy')}
                </Link>

                <Link href="/legal/guidelines">
                  {t('legalCookies.footerLinkGuidelines')}
                </Link>

                <Link href="/">
                  {t('legalCookies.footerLinkHome')}
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
