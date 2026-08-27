import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthLayout from '../components/AuthLayout';
import { useTranslation } from '../lib/i18n';

const API = (process.env.NEXT_PUBLIC_API_URL || 'https://api.amoramatch.one').replace(/\/+$/, '');

export default function Login() {
  const router = useRouter();
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);

  const googleLogin = () => {
    setError('');
    setGoogleLoading(true);
    window.location.assign(`${API}/auth/google/start`);
  };

  const appleLogin = () => {
    setError('');
    setAppleLoading(true);
    window.location.assign(`${API}/auth/apple/start`);
  };

  const facebookLogin = () => {
    setError('');
    setFacebookLoading(true);
    window.location.assign(`${API}/auth/facebook/start`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'We could not sign you in. Please check your details.');
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      if (data.user?.id) localStorage.setItem('userId', data.user.id);
      router.replace(data.user?.role === 'admin' || data.user?.role === 'superadmin' ? '/admin' : '/discover');
    } catch (err) {
      setError(err.message || 'Unable to connect to AmoraLive.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow={t('auth.login.eyebrow')}
      title={<>{t('auth.login.title')} <span className="amora-gradient-text">{t('auth.login.titleHighlight')}</span></>}
      subtitle={t('auth.login.subtitle')}
      footerText={t('auth.login.footerText')}
      footerHref="/register"
      footerLabel={t('auth.login.footerLabel')}
    >
      <Link href="/" className="amora-auth-back">{t('auth.login.backLink')}</Link>

      {(router.query.error || error) && (
        <div className="amora-error" role="alert">
          {router.query.error === 'google_auth_failed'
            ? t('auth.login.errorGoogle')
            : router.query.error === 'apple_auth_failed'
              ? t('auth.login.errorApple')
              : router.query.error === 'facebook_auth_failed'
                ? t('auth.login.errorFacebook')
                : router.query.error === 'account_suspended'
                  ? t('auth.login.errorSuspended')
                  : error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="amora-auth-form">
        <div className="amora-field">
          <label className="amora-label" htmlFor="identifier">{t('auth.login.emailLabel')}</label>
          <input id="identifier" className="amora-input" autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={t('auth.login.emailPlaceholder')} required />
        </div>

        <div className="amora-field">
          <label className="amora-label" htmlFor="password">{t('auth.login.passwordLabel')}</label>
          <div className="amora-password-wrap">
            <input id="password" className="amora-input" autoComplete="current-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.login.passwordPlaceholder')} required />
            <button type="button" className="amora-password-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}>
              {showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
            </button>
          </div>
        </div>

        <button className="amora-btn amora-btn-primary amora-auth-submit" disabled={loading} type="submit">
          {loading ? t('auth.login.submitting') : t('auth.login.submit')}
        </button>
      </form>

      <div className="amora-divider"><span>{t('common.or')}</span></div>

      <div className="amora-social-stack">
        <button className="amora-social amora-apple" type="button" onClick={appleLogin} disabled={appleLoading}>
          <span className="amora-social-symbol" aria-hidden="true"></span>
          {appleLoading ? t('auth.login.connectingApple') : t('auth.login.continueApple')}
        </button>
        <button className="amora-social amora-facebook" type="button" onClick={facebookLogin} disabled={facebookLoading}>
          <span className="amora-social-symbol" aria-hidden="true">f</span>
          {facebookLoading ? t('auth.login.connectingFacebook') : t('auth.login.continueFacebook')}
        </button>
      </div>

      <button className="amora-google" type="button" onClick={googleLogin} disabled={googleLoading}>
        <span className="amora-google-icon" aria-hidden="true">
  <svg viewBox="0 0 24 24" role="img">
    <path fill="#4285F4" d="M21.35 12.27c0-.78-.07-1.53-.22-2.25H12v4.26h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.4Z"/>
    <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.37l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.04H3.29v2.53A9.74 9.74 0 0 0 12 21.75Z"/>
    <path fill="#FBBC05" d="M6.53 13.81A5.85 5.85 0 0 1 6.22 12c0-.63.11-1.24.31-1.81V7.66H3.29A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.34l3.24-2.53Z"/>
    <path fill="#EA4335" d="M12 6.15c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.24 14.63 2.25 12 2.25a9.74 9.74 0 0 0-8.71 5.41l3.24 2.53C6.3 7.87 8.46 6.15 12 6.15Z"/>
  </svg>
</span>
        {googleLoading ? t('auth.login.connectingGoogle') : t('auth.login.continueGoogle')}
      </button>

      <p className="amora-auth-small">
        {t('auth.login.byContinuing')} <Link href="/legal/terms">{t('auth.login.termsLink')}</Link> {t('auth.login.andLink')} <Link href="/legal/privacy">{t('auth.login.privacyLink')}</Link>.
      </p>
    </AuthLayout>
  );
}
