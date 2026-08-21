import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthLayout from '../components/AuthLayout';

const API = (process.env.NEXT_PUBLIC_API_URL || 'https://api.amoramatch.one').replace(/\/+$/, '');

export default function Login() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const googleLogin = () => {
    setError('');
    setGoogleLoading(true);
    window.location.assign(`${API}/auth/google/start`);
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
      eyebrow="WELCOME BACK"
      title={<>Welcome back to <span className="amora-gradient-text">Amora.</span></>}
      subtitle="Sign in to your matches, conversations and live moments."
      footerText="New to Amora?"
      footerHref="/register"
      footerLabel="Create your account"
    >
      <Link href="/" className="amora-auth-back">← Back to AmoraLive</Link>

      {(router.query.error || error) && (
        <div className="amora-error" role="alert">
          {router.query.error === 'google_auth_failed'
            ? 'Google sign-in could not be completed. Please try again.'
            : router.query.error === 'account_suspended'
              ? 'This account is currently suspended.'
              : error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="amora-auth-form">
        <div className="amora-field">
          <label className="amora-label" htmlFor="identifier">Email or username</label>
          <input id="identifier" className="amora-input" autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@example.com or username" required />
        </div>

        <div className="amora-field">
          <label className="amora-label" htmlFor="password">Password</label>
          <div className="amora-password-wrap">
            <input id="password" className="amora-input" autoComplete="current-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required />
            <button type="button" className="amora-password-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button className="amora-btn amora-btn-primary amora-auth-submit" disabled={loading} type="submit">
          {loading ? 'Signing you in…' : 'Sign in'}
        </button>
      </form>

      <div className="amora-divider"><span>OR</span></div>

      <button className="amora-google" type="button" onClick={googleLogin} disabled={googleLoading}>
        <span className="amora-google-icon" aria-hidden="true">
  <svg viewBox="0 0 24 24" role="img">
    <path fill="#4285F4" d="M21.35 12.27c0-.78-.07-1.53-.22-2.25H12v4.26h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.4Z"/>
    <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.37l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.04H3.29v2.53A9.74 9.74 0 0 0 12 21.75Z"/>
    <path fill="#FBBC05" d="M6.53 13.81A5.85 5.85 0 0 1 6.22 12c0-.63.11-1.24.31-1.81V7.66H3.29A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.34l3.24-2.53Z"/>
    <path fill="#EA4335" d="M12 6.15c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.24 14.63 2.25 12 2.25a9.74 9.74 0 0 0-8.71 5.41l3.24 2.53C6.3 7.87 8.46 6.15 12 6.15Z"/>
  </svg>
</span>
        {googleLoading ? 'Connecting to Google…' : 'Continue with Google'}
      </button>

      <p className="amora-auth-small">
        By continuing, you agree to AmoraLive's <Link href="/legal/terms">Terms</Link> and <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>
    </AuthLayout>
  );
}
