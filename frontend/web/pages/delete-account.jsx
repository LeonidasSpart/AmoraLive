import React, { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '../components/AuthLayout';

const API = (process.env.NEXT_PUBLIC_API_URL || 'https://api.amoramatch.one').replace(/\/+$/, '');

export default function DeleteAccount() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setStatus('');
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/request-account-deletion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to process your request.');
      setStatus(data.message || 'If an Amora account exists for that email, a confirmation link has been sent.');
    } catch (e) {
      setError(e.message || 'Unable to process your request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="ACCOUNT PRIVACY"
      title="Delete your Amora account."
      subtitle="Enter the email address associated with your account. We will send a secure confirmation link."
      footerText="Keep your account?"
      footerHref="/login"
      footerLabel="Sign in"
    >
      {error && <div className="amora-error" role="alert">{error}</div>}
      {status && <div className="amora-success-box"><h2>Check your inbox.</h2><p>{status}</p></div>}

      {!status && (
        <form onSubmit={submit} className="amora-auth-form" style={{ padding: 0, background: 'transparent' }}>
          <div className="amora-field">
            <label className="amora-label" htmlFor="delete-email">Email address</label>
            <input id="delete-email" className="amora-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <button className="amora-btn amora-btn-primary amora-auth-submit" type="submit" disabled={loading}>
            {loading ? 'Sending secure link…' : 'Request account deletion'}
          </button>
        </form>
      )}

      <p className="amora-auth-small">
        Deleting your account disables access and removes or anonymizes personal account information. Some records may be retained where required for security, fraud prevention, financial records, or legal obligations. See our <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>
    </AuthLayout>
  );
}
