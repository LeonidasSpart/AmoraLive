import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'amoralive_cookie_consent_v1';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  const [preferences, setPreferences] = useState({
    preferences: false,
    analytics: false,
    advertising: false
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY);

      if (!saved) {
        setVisible(true);
        return;
      }

      const parsed = JSON.parse(saved);

      if (parsed && parsed.version === 1) {
        setPreferences({
          preferences: !!parsed.preferences,
          analytics: !!parsed.analytics,
          advertising: !!parsed.advertising
        });
      } else {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const saveConsent = (values) => {
    const consent = {
      version: 1,
      necessary: true,
      preferences: !!values.preferences,
      analytics: !!values.analytics,
      advertising: !!values.advertising,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));

    setPreferences({
      preferences: consent.preferences,
      analytics: consent.analytics,
      advertising: consent.advertising
    });

    setVisible(false);
    setShowPreferences(false);

    window.dispatchEvent(
      new CustomEvent('amoralive-cookie-consent', {
        detail: consent
      })
    );
  };

  const acceptAll = () => {
    saveConsent({
      preferences: true,
      analytics: true,
      advertising: true
    });
  };

  const rejectOptional = () => {
    saveConsent({
      preferences: false,
      analytics: false,
      advertising: false
    });
  };

  const savePreferences = () => {
    saveConsent(preferences);
  };

  if (!visible) return null;

  return (
    <>
      <div className="amora-cookie-overlay" />

      <section
        className="amora-cookie-banner"
        role="dialog"
        aria-modal="false"
        aria-label="Cookie preferences"
      >
        <div className="amora-cookie-inner">

          <div className="amora-cookie-brand">
            <div className="amora-cookie-logo">
              <img
                src="/brand/amora-logo.png"
                alt="AmoraLive"
              />
            </div>

            <div>
              <div className="amora-cookie-label">
                AMORALIVE PRIVACY
              </div>

              <h2>Cookies & your choices</h2>
            </div>
          </div>

          {!showPreferences ? (
            <>
              <p className="amora-cookie-text">
                AmoraLive uses necessary cookies to keep the service secure
                and working. With your permission, we may also use optional
                technologies for preferences, analytics and advertising.
              </p>

              <p className="amora-cookie-text small">
                You can change your choices at any time. Read our{' '}
                <Link href="/legal/cookies">
                  Cookie Policy
                </Link>.
              </p>

              <div className="amora-cookie-actions">
                <button
                  type="button"
                  className="amora-cookie-btn secondary"
                  onClick={rejectOptional}
                >
                  Reject Optional
                </button>

                <button
                  type="button"
                  className="amora-cookie-btn outline"
                  onClick={() => setShowPreferences(true)}
                >
                  Manage Preferences
                </button>

                <button
                  type="button"
                  className="amora-cookie-btn primary"
                  onClick={acceptAll}
                >
                  Accept All
                </button>
              </div>
            </>
          ) : (
            <div className="amora-cookie-preferences">

              <p className="amora-cookie-text">
                Choose which optional technologies you allow. Necessary
                technologies remain active because they are required for
                authentication, security and core functionality.
              </p>

              <div className="amora-cookie-options">

                <PreferenceRow
                  title="Strictly Necessary"
                  description="Security, authentication, sessions and core functionality."
                  locked
                  checked
                />

                <PreferenceRow
                  title="Preferences"
                  description="Remember language, interface and other choices."
                  checked={preferences.preferences}
                  onChange={(value) =>
                    setPreferences((prev) => ({
                      ...prev,
                      preferences: value
                    }))
                  }
                />

                <PreferenceRow
                  title="Analytics"
                  description="Help us understand performance and feature usage."
                  checked={preferences.analytics}
                  onChange={(value) =>
                    setPreferences((prev) => ({
                      ...prev,
                      analytics: value
                    }))
                  }
                />

                <PreferenceRow
                  title="Advertising & Personalisation"
                  description="Advertising measurement and personalisation where applicable."
                  checked={preferences.advertising}
                  onChange={(value) =>
                    setPreferences((prev) => ({
                      ...prev,
                      advertising: value
                    }))
                  }
                />

              </div>

              <div className="amora-cookie-actions">

                <button
                  type="button"
                  className="amora-cookie-btn secondary"
                  onClick={rejectOptional}
                >
                  Reject Optional
                </button>

                <button
                  type="button"
                  className="amora-cookie-btn primary"
                  onClick={savePreferences}
                >
                  Save Preferences
                </button>

              </div>
            </div>
          )}

        </div>
      </section>

      <style jsx global>{`

        .amora-cookie-overlay {
          position: fixed;
          inset: 0;
          z-index: 9998;
          pointer-events: none;
          background: rgba(0, 0, 0, .18);
        }

        .amora-cookie-banner {
          position: fixed;
          left: 20px;
          right: 20px;
          bottom: 20px;
          z-index: 9999;
          max-width: 1050px;
          margin: 0 auto;
          border: 1px solid rgba(255, 255, 255, .11);
          border-radius: 24px;
          background:
            linear-gradient(
              135deg,
              rgba(24, 18, 30, .98),
              rgba(13, 13, 22, .98)
            );
          box-shadow:
            0 25px 80px rgba(0, 0, 0, .55),
            0 0 45px rgba(255, 63, 157, .08),
            inset 0 1px 0 rgba(255, 255, 255, .06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          color: #fff;
        }

        .amora-cookie-inner {
          padding: 24px;
        }

        .amora-cookie-brand {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 15px;
        }

        .amora-cookie-logo {
          width: 48px;
          height: 48px;
          min-width: 48px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background:
            linear-gradient(
              135deg,
              rgba(255, 63, 157, .20),
              rgba(155, 53, 255, .20)
            );
          border: 1px solid rgba(255, 107, 157, .22);
        }

        .amora-cookie-logo img {
          width: 38px;
          height: 38px;
          object-fit: contain;
          display: block;
        }

        .amora-cookie-label {
          color: #ff70aa;
          font-size: 8px;
          letter-spacing: 2px;
          font-weight: 900;
        }

        .amora-cookie-brand h2 {
          margin: 3px 0 0;
          color: #fff;
          font-size: 20px;
          line-height: 1.2;
          letter-spacing: -.4px;
        }

        .amora-cookie-text {
          margin: 0;
          max-width: 900px;
          color: #aaaab6;
          font-size: 12px;
          line-height: 1.7;
        }

        .amora-cookie-text.small {
          margin-top: 7px;
          color: #777783;
          font-size: 10px;
        }

        .amora-cookie-text a {
          color: #ff70aa;
          text-decoration: none;
          font-weight: 700;
        }

        .amora-cookie-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 18px;
        }

        .amora-cookie-btn {
          min-height: 40px;
          padding: 0 17px;
          border-radius: 10px;
          border: 1px solid transparent;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          transition:
            transform .15s ease,
            opacity .15s ease,
            border-color .15s ease;
        }

        .amora-cookie-btn:hover {
          transform: translateY(-1px);
        }

        .amora-cookie-btn.primary {
          color: #fff;
          background:
            linear-gradient(
              135deg,
              #ff3f9d,
              #9b35ff
            );
          box-shadow:
            0 8px 25px rgba(255, 63, 157, .20);
        }

        .amora-cookie-btn.outline {
          color: #eee;
          background: rgba(255, 255, 255, .035);
          border-color: rgba(255, 255, 255, .12);
        }

        .amora-cookie-btn.secondary {
          color: #aaaab6;
          background: transparent;
          border-color: rgba(255, 255, 255, .08);
        }

        .amora-cookie-preferences {
          margin-top: 4px;
        }

        .amora-cookie-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 9px;
          margin-top: 17px;
        }

        .amora-cookie-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 13px;
          border-radius: 13px;
          border: 1px solid rgba(255, 255, 255, .07);
          background: rgba(255, 255, 255, .025);
        }

        .amora-cookie-option-info strong {
          display: block;
          color: #eee;
          font-size: 11px;
        }

        .amora-cookie-option-info span {
          display: block;
          margin-top: 4px;
          color: #777783;
          font-size: 9px;
          line-height: 1.5;
        }

        .amora-cookie-switch {
          position: relative;
          width: 40px;
          height: 23px;
          min-width: 40px;
          border: 0;
          border-radius: 999px;
          padding: 0;
          cursor: pointer;
          background: #292933;
          transition: .2s ease;
        }

        .amora-cookie-switch.active {
          background:
            linear-gradient(
              135deg,
              #ff3f9d,
              #9b35ff
            );
        }

        .amora-cookie-switch.locked {
          cursor: not-allowed;
          opacity: .65;
        }

        .amora-cookie-switch-dot {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: #fff;
          transition: .2s ease;
        }

        .amora-cookie-switch.active .amora-cookie-switch-dot {
          transform: translateX(17px);
        }

        @media (max-width: 700px) {

          .amora-cookie-banner {
            left: 10px;
            right: 10px;
            bottom: 10px;
            border-radius: 20px;
          }

          .amora-cookie-inner {
            padding: 18px;
          }

          .amora-cookie-actions {
            display: grid;
            grid-template-columns: 1fr;
          }

          .amora-cookie-btn {
            width: 100%;
          }

          .amora-cookie-options {
            grid-template-columns: 1fr;
          }

        }

      `}</style>
    </>
  );
}

function PreferenceRow({
  title,
  description,
  checked,
  onChange,
  locked = false
}) {
  return (
    <div className="amora-cookie-option">

      <div className="amora-cookie-option-info">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <button
        type="button"
        className={`amora-cookie-switch ${
          checked ? 'active' : ''
        } ${locked ? 'locked' : ''}`}
        onClick={() => {
          if (!locked && onChange) {
            onChange(!checked);
          }
        }}
        aria-label={`${title}: ${checked ? 'enabled' : 'disabled'}`}
        aria-pressed={checked}
        disabled={locked}
      >
        <span className="amora-cookie-switch-dot" />
      </button>

    </div>
  );
}
