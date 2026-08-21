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
            <span className="amora-google-icon">G</span>
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
