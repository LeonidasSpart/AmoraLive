import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AuthLayout from '../../components/AuthLayout';

const API = (process.env.NEXT_PUBLIC_API_URL || 'https://api.amoramatch.one').replace(/\/+$/, '');

export default function SocialComplete() {
  const router = useRouter();
  const [provider, setProvider] = useState('social');
  const [completionToken, setCompletionToken] = useState('');
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const providerName = provider === 'facebook' ? 'Facebook' : provider === 'apple' ? 'Apple' : 'Google';

  useEffect(() => {
    if (!router.isReady) return;
    const code = router.query.code;
    if (router.query.provider) setProvider(String(router.query.provider));
    if (!code) {
      setError('This sign-in session is missing or invalid.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API}/auth/social/exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ code: String(code) })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Unable to continue social sign-in.');

        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
          if (data.user?.id) localStorage.setItem('userId', data.user.id);
          router.replace(data.user?.role === 'admin' || data.user?.role === 'superadmin' ? '/admin' : '/discover');
          return;
        }

        if (!data.completionToken) throw new Error('Unable to continue social registration.');
        setCompletionToken(String(data.completionToken));
      } catch (e) {
        setError(e.message || `Unable to continue ${providerName} registration.`);
      } finally {
        setLoading(false);
      }
    })();
  }, [router.isReady, router.query.code, router.query.provider]);

  const complete = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`${API}/auth/social/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          completionToken,
          username: username.trim(),
          dateOfBirth
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to finish registration.');
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      if (data.user?.id) localStorage.setItem('userId', data.user.id);
      router.replace(data.user?.role === 'admin' || data.user?.role === 'superadmin' ? '/admin' : '/discover');
    } catch (e) {
      setError(e.message || `Unable to finish ${providerName} registration.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthLayout
      eyebrow={`${providerName.toUpperCase()} SIGN IN`}
      title={loading ? `Connecting with ${providerName}.` : 'Finish your Amora account.'}
      subtitle={loading ? 'Please wait while we securely finish your sign-in.' : 'One last step: choose your username and confirm that you are 18+.'}
    >
      {loading ? (
        <div className="amora-loading-state">
          <span className="amora-spinner" aria-hidden="true" />
          <p>Securely connecting…</p>
        </div>
      ) : (
        <>
          {error && <div className="amora-error" role="alert">{error}</div>}
          <form onSubmit={complete} className="amora-auth-form" style={{ padding: 0, background: 'transparent' }}>
            <div className="amora-field">
              <label className="amora-label" htmlFor="social-username">Username</label>
              <input id="social-username" className="amora-input" value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} maxLength={20} pattern="[A-Za-z0-9_.-]{3,20}" placeholder="Choose a username" required />
            </div>
            <div className="amora-field">
              <label className="amora-label" htmlFor="social-dob">Date of birth</label>
              <input id="social-dob" className="amora-input amora-date-input" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
              <div className="amora-field-hint">AmoraLive is an 18+ community.</div>
            </div>
            <button className="amora-btn amora-btn-primary amora-auth-submit" type="submit" disabled={saving}>
              {saving ? 'Creating your account…' : 'Continue to Amora'}
            </button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
