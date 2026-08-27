import React, { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '../components/AuthLayout';
import { useTranslation } from '../lib/i18n';

const API = (process.env.NEXT_PUBLIC_API_URL || 'https://api.amoramatch.one').replace(/\/+$/, '');

export default function Register() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);

  const startGoogle = () => {
    setError('');
    setGoogleLoading(true);
    window.location.assign(`${API}/auth/google/start`);
  };

  const startApple = () => {
    setError('');
    setAppleLoading(true);
    window.location.assign(`${API}/auth/apple/start`);
  };

  const startFacebook = () => {
    setError('');
    setFacebookLoading(true);
    window.location.assign(`${API}/auth/facebook/start`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: email.trim(), username: username.trim(), password, dateOfBirth }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Registration failed. Please check your details.');
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Unable to create your Amora account.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        eyebrow="YOU'RE IN"
        title={t('auth.register.successTitle')}
        subtitle={t('auth.register.successSubtitle')}
        footerText={t('auth.register.footerText')}
        footerHref="/login"
        footerLabel={t('auth.register.footerLabel')}
      >
        <div className="amora-success-box">
          <div className="amora-success-icon">✓</div>
          <h2>{t('auth.register.successHeading')}</h2>
          <p>{t('auth.register.successBody')}</p>
          <Link href="/login" className="amora-btn amora-btn-primary amora-auth-submit">{t('auth.register.goToLogin')}</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow={t('auth.register.eyebrow')}
      title={t('auth.register.title')}
      subtitle={t('auth.register.subtitle')}
      footerText={t('auth.register.footerText')}
      footerHref="/login"
      footerLabel={t('auth.register.footerLabel')}
    >
      <Link href="/" className="amora-auth-back">{t('auth.register.backLink')}</Link>

      {error && <div className="amora-error" role="alert">{error}</div>}

      <div className="amora-social-stack">
        <button className="amora-social amora-apple" type="button" onClick={startApple} disabled={appleLoading}>
          <span className="amora-social-symbol" aria-hidden="true"></span>
          {appleLoading ? t('auth.register.connectingApple') : t('auth.register.continueApple')}
        </button>
        <button className="amora-social amora-facebook" type="button" onClick={startFacebook} disabled={facebookLoading}>
          <span className="amora-social-symbol" aria-hidden="true">f</span>
          {facebookLoading ? t('auth.register.connectingFacebook') : t('auth.register.continueFacebook')}
        </button>
      </div>

      <button className="amora-google" type="button" onClick={startGoogle} disabled={googleLoading}>
        <span className="amora-google-icon" aria-hidden="true">
  <svg viewBox="0 0 24 24" role="img">
    <path fill="#4285F4" d="M21.35 12.27c0-.78-.07-1.53-.22-2.25H12v4.26h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.4Z"/>
    <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.37l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.04H3.29v2.53A9.74 9.74 0 0 0 12 21.75Z"/>
    <path fill="#FBBC05" d="M6.53 13.81A5.85 5.85 0 0 1 6.22 12c0-.63.11-1.24.31-1.81V7.66H3.29A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.34l3.24-2.53Z"/>
    <path fill="#EA4335" d="M12 6.15c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.24 14.63 2.25 12 2.25a9.74 9.74 0 0 0-8.71 5.41l3.24 2.53C6.3 7.87 8.46 6.15 12 6.15Z"/>
  </svg>
</span>
        {googleLoading ? t('auth.register.connectingGoogle') : t('auth.register.continueGoogle')}
      </button>
      <div className="amora-divider"><span>{t('common.or')}</span></div>

      <form onSubmit={handleSubmit} className="amora-auth-form">
        <div className="amora-field">
          <label className="amora-label" htmlFor="email">{t('auth.register.emailLabel')}</label>
          <input id="email" className="amora-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.register.emailPlaceholder')} required />
        </div>

        <div className="amora-field">
          <label className="amora-label" htmlFor="username">{t('auth.register.usernameLabel')}</label>
          <input id="username" className="amora-input" type="text" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('auth.register.usernamePlaceholder')} minLength={3} maxLength={20} pattern="[A-Za-z0-9_.-]{3,20}" required />
          <div className="amora-field-hint">{t('auth.register.usernameHint')}</div>
        </div>

        <div className="amora-field">
          <label className="amora-label" htmlFor="register-password">{t('auth.register.passwordLabel')}</label>
          <div className="amora-password-wrap">
            <input id="register-password" className="amora-input" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.register.passwordPlaceholder')} minLength={8} required />
            <button type="button" className="amora-password-toggle" onClick={() => setShowPassword((v) => !v)}>{showPassword ? t('auth.register.hidePassword') : t('auth.register.showPassword')}</button>
          </div>
        </div>

        <div className="amora-field">
          <label className="amora-label" htmlFor="dob">{t('auth.register.dobLabel')}</label>
          <input id="dob" className="amora-input amora-date-input" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
          <div className="amora-field-hint">{t('auth.register.dobHint')}</div>
        </div>

        <button className="amora-btn amora-btn-primary amora-auth-submit" type="submit" disabled={loading}>
          {loading ? t('auth.register.submitting') : t('auth.register.submit')}
        </button>
      </form>

      <p className="amora-auth-small">
        {t('auth.register.byCreating')} <Link href="/legal/terms">{t('auth.register.termsLink')}</Link> {t('auth.register.andLink')} <Link href="/legal/privacy">{t('auth.register.privacyLink')}</Link>.
      </p>
    </AuthLayout>
  );
}
