import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.amoramatch.one';

export default function Login() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const googleLogin = () => {
    window.location.href = `${API}/auth/google/start`;
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
    <div className="amora-auth-page">
      <Head>
        <title>Sign in — AmoraLive</title>
        <meta name="description" content="Sign in to AmoraLive and return to your conversations, matches and live moments." />
      </Head>

      <div className="amora-auth-shell">
        <section className="amora-auth-brand">
          <Link href="/" className="amora-auth-mark-link" aria-label="Back to AmoraLive home">
            <img className="amora-auth-mark" src="/brand/amora-mark.png" alt="Amora" />
          </Link>
          <img className="amora-auth-wordmark" src="/brand/amora-logo.png" alt="Amora — Meaningful Connections" />
          <h1>Welcome back to <span className="amora-gradient-text">Amora.</span></h1>
          <p>Come back to your conversations, matches and live moments — wherever you are.</p>
        </section>

        <section className="amora-auth-form" aria-labelledby="login-title">
          <Link href="/" className="amora-back-link">← Back to AmoraLive</Link>
          <div className="amora-auth-heading">
            <span className="amora-section-kicker">WELCOME BACK</span>
            <h2 id="login-title">Sign in</h2>
            <p className="lead">Use your email or username to continue.</p>
          </div>

          {router.query.error && <div className="amora-error" role="alert">Google sign-in could not be completed. Please try again.</div>}
          {error && <div className="amora-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="amora-field">
              <label className="amora-label" htmlFor="identifier">Email or username</label>
              <input
                id="identifier"
                className="amora-input"
                autoComplete="username"
                inputMode="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or username"
                required
              />
            </div>

            <div className="amora-field">
              <label className="amora-label" htmlFor="password">Password</label>
              <div className="amora-password-wrap">
                <input
                  id="password"
                  className="amora-input"
                  autoComplete="current-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                />
                <button
                  type="button"
                  className="amora-password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button className="amora-btn amora-btn-primary amora-auth-submit" disabled={loading} type="submit">
              {loading ? 'Signing you in…' : 'Sign in'}
            </button>
          </form>

          <div className="amora-divider" aria-hidden="true">OR</div>
          <button className="amora-google" type="button" onClick={googleLogin}>Continue with Google</button>
          <p className="amora-auth-bottom">New to Amora? <Link href="/register">Create your account</Link></p>
        </section>
      </div>
    </div>
  );
}
