import React, { useEffect, useState } from 'react';

const CONSENT_KEY = 'amora_cookie_consent';
const CONSENT_VERSION = 'V1.0.1';

const DEFAULT_CONSENT = {
  version: CONSENT_VERSION,
  necessary: true,
  preferences: false,
  analytics: false,
  advertising: false,
  timestamp: null
};

function getStoredConsent() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(CONSENT_KEY);

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (!parsed || parsed.version !== CONSENT_VERSION) {
      return null;
    }

    return {
      ...DEFAULT_CONSENT,
      ...parsed,
      necessary: true
    };
  } catch (error) {
    console.warn(
      'AmoraLive cookie consent could not be read:',
      error
    );
    return null;
  }
}

function saveConsent(consent) {
  if (typeof window === 'undefined') return;

  const finalConsent = {
    ...DEFAULT_CONSENT,
    ...consent,
    necessary: true,
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString()
  };

  try {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify(finalConsent)
    );

    window.dispatchEvent(
      new CustomEvent('amora-cookie-consent', {
        detail: finalConsent
      })
    );
  } catch (error) {
    console.warn(
      'AmoraLive cookie consent could not be saved:',
      error
    );
  }
}

export function getAmoraConsent() {
  return getStoredConsent() || DEFAULT_CONSENT;
}

export function hasAmoraConsent(category) {
  const consent = getAmoraConsent();

  if (category === 'necessary') {
    return true;
  }

  return consent[category] === true;
}

export function openAmoraCookieSettings() {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent('open-amora-cookie-settings')
  );
}

export function clearAmoraOptionalCookies() {
  if (typeof window === 'undefined') return;

  /*
   * IMPORTANT:
   *
   * Add the real optional cookie names used by AmoraLive here.
   *
   * Example:
   *
   * const optionalCookies = [
   *   '_ga',
   *   '_ga_xxxxx',
   *   '_gid'
   * ];
   *
   * Do NOT blindly delete cookies belonging to third-party services
   * unless you know their names/domain/path.
   */

  const optionalCookies = [];

  optionalCookies.forEach((name) => {
    document.cookie =
      `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
}

function CookieToggle({
  label,
  description,
  checked,
  disabled,
  onChange
}) {
  return (
    <div className="amora-cookie-toggle-row">

      <div className="amora-cookie-toggle-text">

        <strong>{label}</strong>

        <span>{description}</span>

      </div>

      <button
        type="button"
        className={`amora-cookie-switch ${
          checked ? 'active' : ''
        } ${disabled ? 'disabled' : ''}`}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            onChange(!checked);
          }
        }}
        aria-pressed={checked}
        aria-label={`${label}: ${
          checked ? 'enabled' : 'disabled'
        }`}
      >
        <span />
      </button>

    </div>
  );
}

export default function CookieConsent() {

  const [mounted, setMounted] = useState(false);
  const [consent, setConsent] = useState(DEFAULT_CONSENT);
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {

    setMounted(true);

    const stored = getStoredConsent();

    if (stored) {
      setConsent(stored);
      setVisible(false);
    } else {
      setVisible(true);
    }

    const handleSettings = () => {
      const current =
        getStoredConsent() || DEFAULT_CONSENT;

      setConsent(current);
      setSettingsOpen(true);
      setVisible(true);
    };

    window.addEventListener(
      'open-amora-cookie-settings',
      handleSettings
    );

    return () => {
      window.removeEventListener(
        'open-amora-cookie-settings',
        handleSettings
      );
    };

  }, []);

  if (!mounted) {
    return null;
  }

  if (!visible) {
    return (
      <button
        type="button"
        className="amora-cookie-floating-button"
        onClick={() => {
          setConsent(
            getStoredConsent() || DEFAULT_CONSENT
          );
          setSettingsOpen(true);
          setVisible(true);
        }}
        aria-label="Open cookie settings"
      >
        ⚙
        <span>Cookie Settings</span>
      </button>
    );
  }

  const acceptAll = () => {

    const next = {
      version: CONSENT_VERSION,
      necessary: true,
      preferences: true,
      analytics: true,
      advertising: true
    };

    saveConsent(next);

    setConsent(next);
    setSettingsOpen(false);
    setVisible(false);
  };

  const rejectOptional = () => {

    const next = {
      version: CONSENT_VERSION,
      necessary: true,
      preferences: false,
      analytics: false,
      advertising: false
    };

    saveConsent(next);

    clearAmoraOptionalCookies();

    setConsent(next);
    setSettingsOpen(false);
    setVisible(false);
  };

  const savePreferences = () => {

    const next = {
      ...consent,
      necessary: true
    };

    saveConsent(next);

    if (!next.analytics && !next.advertising) {
      clearAmoraOptionalCookies();
    }

    setConsent(next);
    setSettingsOpen(false);
    setVisible(false);
  };

  return (
    <div className="amora-cookie-layer">

      <div
        className="amora-cookie-backdrop"
        onClick={() => {
          if (settingsOpen) {
            setSettingsOpen(false);
          }
        }}
      />

      <div
        className={`amora-cookie-panel ${
          settingsOpen ? 'settings-mode' : ''
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="amora-cookie-title"
      >

        {!settingsOpen ? (

          <>

            <div className="amora-cookie-brand">

              <div className="amora-cookie-logo">

                {/* OFFICIAL AMORA LOGO */}
                <img
                  src="/brand/amora-logo.png"
                  alt="AmoraLive"
                />

              </div>

              <div>

                <strong>AmoraLive</strong>

                <span>
                  Privacy & Cookie Control
                </span>

              </div>

            </div>

            <div className="amora-cookie-content">

              <div className="amora-cookie-eyebrow">
                YOUR PRIVACY
              </div>

              <h2 id="amora-cookie-title">
                Your privacy.
                <br />
                <em>Your choice.</em>
              </h2>

              <p>
                AmoraLive uses necessary cookies and similar
                technologies to operate and secure the platform.
                With your permission, we may also use optional
                technologies for preferences, analytics and
                advertising.
              </p>

              <p className="amora-cookie-small">
                You can accept all optional technologies, reject
                them, or customise your choices. You can change
                your decision later from Cookie Settings.
              </p>

            </div>

            <div className="amora-cookie-actions">

              <button
                type="button"
                className="amora-cookie-button secondary"
                onClick={rejectOptional}
              >
                Reject Optional
              </button>

              <button
                type="button"
                className="amora-cookie-button outline"
                onClick={() => setSettingsOpen(true)}
              >
                Customize
              </button>

              <button
                type="button"
                className="amora-cookie-button primary"
                onClick={acceptAll}
              >
                Accept All
              </button>

            </div>

            <div className="amora-cookie-links">

              <Link href="/legal/cookies">
                Cookie Policy
              </Link>

              <Link href="/legal/privacy">
                Privacy Policy
              </Link>

              <Link href="/legal/terms">
                Terms
              </Link>

            </div>

          </>

        ) : (

          <>

            <div className="amora-cookie-settings-header">

              <button
                type="button"
                className="amora-cookie-back"
                onClick={() => {
                  if (getStoredConsent()) {
                    setVisible(false);
                  } else {
                    setSettingsOpen(false);
                  }
                }}
              >
                ←
              </button>

              <div>

                <div className="amora-cookie-eyebrow">
                  AMORALIVE
                </div>

                <h2>
                  Cookie Settings
                </h2>

              </div>

            </div>

            <p className="amora-cookie-settings-intro">
              Choose which optional categories you allow.
              Necessary technologies cannot be disabled because
              they are required for core functionality, security
              and your requested service.
            </p>

            <div className="amora-cookie-settings-list">

              <CookieToggle
                label="Strictly Necessary"
                description="Authentication, security, fraud prevention, sessions and essential functionality."
                checked={true}
                disabled={true}
                onChange={() => {}}
              />

              <CookieToggle
                label="Preferences"
                description="Remember your language, interface and other choices."
                checked={consent.preferences}
                onChange={(value) =>
                  setConsent({
                    ...consent,
                    preferences: value
                  })
                }
              />

              <CookieToggle
                label="Analytics"
                description="Help AmoraLive understand performance and feature usage."
                checked={consent.analytics}
                onChange={(value) =>
                  setConsent({
                    ...consent,
                    analytics: value
                  })
                }
              />

              <CookieToggle
                label="Advertising"
                description="Advertising measurement and personalisation where applicable."
                checked={consent.advertising}
                onChange={(value) =>
                  setConsent({
                    ...consent,
                    advertising: value
                  })
                }
              />

            </div>

            <div className="amora-cookie-settings-actions">

              <button
                type="button"
                className="amora-cookie-button secondary"
                onClick={rejectOptional}
              >
                Reject Optional
              </button>

              <button
                type="button"
                className="amora-cookie-button primary"
                onClick={savePreferences}
              >
                Save Choices
              </button>

            </div>

            <p className="amora-cookie-version">
              Consent version {CONSENT_VERSION}
            </p>

          </>

        )}

      </div>

      <style jsx global>{`

        .amora-cookie-layer {
          position: fixed;
          inset: 0;
          z-index: 999999;
          font-family: inherit;
        }

        .amora-cookie-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(4, 3, 10, .72);
          backdrop-filter: blur(7px);
        }

        .amora-cookie-panel {
          position: absolute;
          left: 50%;
          bottom: 24px;
          width: min(680px, calc(100% - 28px));
          transform: translateX(-50%);
          padding: 26px;
          border-radius: 25px;
          border: 1px solid rgba(255, 107, 157, .20);
          background:
            linear-gradient(
              145deg,
              rgba(32, 14, 34, .98),
              rgba(11, 9, 18, .98)
            );
          box-shadow:
            0 30px 100px rgba(0,0,0,.60),
            0 0 70px rgba(255,63,157,.10),
            inset 0 1px 0 rgba(255,255,255,.07);
          backdrop-filter: blur(30px);
          color: #fff;
        }

        .amora-cookie-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .amora-cookie-logo {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background:
            linear-gradient(
              135deg,
              rgba(255,63,157,.18),
              rgba(155,53,255,.18)
            );
          border: 1px solid rgba(255,107,157,.20);
          overflow: hidden;
        }

        .amora-cookie-logo img {
          width: 38px;
          height: 38px;
          object-fit: contain;
          display: block;
        }

        .amora-cookie-brand strong,
        .amora-cookie-brand span {
          display: block;
        }

        .amora-cookie-brand strong {
          font-size: 13px;
          color: #fff;
        }

        .amora-cookie-brand span {
          margin-top: 3px;
          color: #777783;
          font-size: 9px;
        }

        .amora-cookie-eyebrow {
          margin-bottom: 7px;
          color: #ff639f;
          font-size: 8px;
          letter-spacing: 2px;
          font-weight: 900;
        }

        .amora-cookie-content h2 {
          margin: 0 0 14px;
          color: #fff;
          font-size: 34px;
          line-height: .98;
          letter-spacing: -1.5px;
        }

        .amora-cookie-content h2 em {
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

        .amora-cookie-content p {
          margin: 0 0 10px;
          color: #aaaab5;
          font-size: 12px;
          line-height: 1.75;
        }

        .amora-cookie-content .amora-cookie-small {
          color: #777783;
          font-size: 10px;
        }

        .amora-cookie-actions {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 9px;
          margin-top: 21px;
        }

        .amora-cookie-button {
          min-height: 44px;
          padding: 10px 13px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 850;
          cursor: pointer;
          transition: .18s ease;
        }

        .amora-cookie-button:hover {
          transform: translateY(-1px);
        }

        .amora-cookie-button.primary {
          border: 0;
          color: #fff;
          background:
            linear-gradient(
              135deg,
              #ff3f9d,
              #9b35ff
            );
          box-shadow:
            0 10px 30px rgba(255,63,157,.20);
        }

        .amora-cookie-button.outline {
          border: 1px solid rgba(255,107,157,.25);
          background: rgba(255,63,157,.06);
          color: #ff82b4;
        }

        .amora-cookie-button.secondary {
          border: 1px solid rgba(255,255,255,.09);
          background: rgba(255,255,255,.035);
          color: #aaaab5;
        }

        .amora-cookie-links {
          display: flex;
          gap: 15px;
          margin-top: 17px;
        }

        .amora-cookie-links a {
          color: #666673;
          font-size: 9px;
          text-decoration: none;
        }

        .amora-cookie-links a:hover {
          color: #ff70aa;
        }

        .amora-cookie-settings-header {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 16px;
        }

        .amora-cookie-back {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.035);
          color: #fff;
          cursor: pointer;
          font-size: 17px;
        }

        .amora-cookie-settings-header h2 {
          margin: 0;
          color: #fff;
          font-size: 23px;
        }

        .amora-cookie-settings-intro {
          margin: 0 0 18px;
          color: #888894;
          font-size: 11px;
          line-height: 1.7;
        }

        .amora-cookie-settings-list {
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,.07);
        }

        .amora-cookie-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 15px;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }

        .amora-cookie-toggle-row:last-child {
          border-bottom: 0;
        }

        .amora-cookie-toggle-text {
          min-width: 0;
        }

        .amora-cookie-toggle-text strong,
        .amora-cookie-toggle-text span {
          display: block;
        }

        .amora-cookie-toggle-text strong {
          color: #eee;
          font-size: 11px;
        }

        .amora-cookie-toggle-text span {
          margin-top: 4px;
          color: #777783;
          font-size: 9px;
          line-height: 1.55;
        }

        .amora-cookie-switch {
          position: relative;
          width: 45px;
          min-width: 45px;
          height: 25px;
          padding: 0;
          border: 0;
          border-radius: 999px;
          background: #292832;
          cursor: pointer;
          transition: .18s ease;
        }

        .amora-cookie-switch span {
          position: absolute;
          left: 4px;
          top: 4px;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: #888894;
          transition: .18s ease;
        }

        .amora-cookie-switch.active {
          background:
            linear-gradient(
              135deg,
              #ff3f9d,
              #9b35ff
            );
        }

        .amora-cookie-switch.active span {
          left: 24px;
          background: #fff;
        }

        .amora-cookie-switch.disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .amora-cookie-settings-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
          margin-top: 18px;
        }

        .amora-cookie-version {
          margin: 14px 0 0;
          color: #555560;
          font-size: 8px;
          text-align: center;
        }

        .amora-cookie-floating-button {
          position: fixed;
          left: 18px;
          bottom: 18px;
          z-index: 999998;
          display: flex;
          align-items: center;
          gap: 7px;
          min-height: 38px;
          padding: 8px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255,107,157,.18);
          background: rgba(12,10,18,.92);
          color: #ff70aa;
          box-shadow: 0 10px 30px rgba(0,0,0,.35);
          backdrop-filter: blur(15px);
          cursor: pointer;
          font-size: 13px;
        }

        .amora-cookie-floating-button span {
          font-size: 9px;
          font-weight: 800;
        }

        @media (max-width: 600px) {

          .amora-cookie-panel {
            bottom: 10px;
            width: calc(100% - 20px);
            padding: 20px;
            border-radius: 21px;
          }

          .amora-cookie-content h2 {
            font-size: 29px;
          }

          .amora-cookie-actions {
            grid-template-columns: 1fr;
          }

          .amora-cookie-button {
            min-height: 43px;
          }

          .amora-cookie-floating-button {
            left: 10px;
            bottom: 10px;
          }

        }

      `}</style>

    </div>
  );
}
