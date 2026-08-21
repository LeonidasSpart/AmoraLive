import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthLayout from '../components/AuthLayout';

const API = (process.env.NEXT_PUBLIC_API_URL || 'https://api.amoramatch.one').replace(/\/+$/, '');

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleToken, setGoogleToken] = useState('');

  const googleMode = Boolean(googleToken);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.google) setGoogleToken(String(router.query.google));
  }, [router.isReady, router.query.google]);

  const startGoogle = () => {
    setError('');
    setGoogleLoading(true);
    window.location.assign(`${API}/auth/google/start`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = googleMode ? `${API}/auth/google/complete` : `${API}/auth/register`;
      const body = googleMode
        ? { completionToken: googleToken, username: username.trim(), dateOfBirth }
        : { email: email.trim(), username: username.trim(), password, dateOfBirth };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Registration failed. Please check your details.');

      if (googleMode) {
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        if (data.user?.id) localStorage.setItem('userId', data.user.id);
        window.location.assign('/discover');
        return;
      }
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
        title="Check your inbox."
        subtitle="Your Amora account is ready. Verify your email address to continue."
        footerText="Already verified?"
        footerHref="/login"
        footerLabel="Sign in"
      >
        <div className="amora-success-box">
          <div className="amora-success-icon">✓</div>
          <h2>Registration successful</h2>
          <p>We sent a verification link to your email. Open it, then come back and sign in.</p>
          <Link href="/login" className="amora-btn amora-btn-primary amora-auth-submit">Go to Login</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow={googleMode ? 'GOOGLE SIGN UP' : 'JOIN AMORA'}
      title={googleMode ? 'Finish your Amora account.' : 'Create your Amora account.'}
      subtitle={googleMode ? 'One last step: choose your username and confirm your age.' : 'Meet people, build connections and share meaningful moments.'}
      footerText="Already have an account?"
      footerHref="/login"
      footerLabel="Sign in"
    >
      <Link href="/" className="amora-auth-back">← Back to AmoraLive</Link>

      {error && <div className="amora-error" role="alert">{error}</div>}

      {!googleMode && (
        <>
          <button className="amora-google" type="button" onClick={startGoogle} disabled={googleLoading}>
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
          <div className="amora-divider"><span>OR</span></div>
        </>
      )}

      <form onSubmit={handleSubmit} className="amora-auth-form">
        {!googleMode && (
          <div className="amora-field">
            <label className="amora-label" htmlFor="email">Email address</label>
            <input id="email" className="amora-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
        )}

        <div className="amora-field">
          <label className="amora-label" htmlFor="username">Username</label>
          <input id="username" className="amora-input" type="text" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" minLength={3} maxLength={20} pattern="[A-Za-z0-9_.-]{3,20}" required />
          <div className="amora-field-hint">3–20 characters: letters, numbers, dots, dashes or underscores.</div>
        </div>

        {!googleMode && (
          <div className="amora-field">
            <label className="amora-label" htmlFor="register-password">Password</label>
            <div className="amora-password-wrap">
              <input id="register-password" className="amora-input" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required />
              <button type="button" className="amora-password-toggle" onClick={() => setShowPassword((v) => !v)}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
          </div>
        )}

        <div className="amora-field">
          <label className="amora-label" htmlFor="dob">Date of birth</label>
          <input id="dob" className="amora-input amora-date-input" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
          <div className="amora-field-hint">AmoraLive is an 18+ community.</div>
        </div>

        <button className="amora-btn amora-btn-primary amora-auth-submit" type="submit" disabled={loading}>
          {loading ? (googleMode ? 'Creating your account…' : 'Creating account…') : (googleMode ? 'Finish registration' : 'Create account')}
        </button>
      </form>

      <p className="amora-auth-small">
        By creating an account, you agree to our <Link href="/legal/terms">Terms</Link> and <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>
    </AuthLayout>
  );
}
