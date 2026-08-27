import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AuthLayout from '../../components/AuthLayout';

const API = (process.env.NEXT_PUBLIC_API_URL || 'https://api.amoramatch.one').replace(/\/+$/, '');

export default function ConfirmDeleteAccount() {
  const router = useRouter();
  const [status, setStatus] = useState('idle'); // idle | working | done | error
  const [message, setMessage] = useState('');

  const confirmDeletion = async () => {
    setStatus('working');
    setMessage('');
    try {
      const res = await fetch(`${API}/auth/delete-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ token: String(router.query.token || '') })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'This account deletion link is invalid or expired.');
      setMessage(data.message || 'Your Amora account has been deleted.');
      setStatus('done');
    } catch (e) {
      setMessage(e.message || 'This account deletion link is invalid or expired.');
      setStatus('error');
    }
  };

  return (
    <AuthLayout
      eyebrow="ACCOUNT PRIVACY"
      title="Confirm account deletion."
      subtitle="This permanently deletes your Amora account and cannot be undone."
    >
      {status === 'idle' && router.isReady && (
        <>
          {!router.query.token ? (
            <div className="amora-error" role="alert">This confirmation link is missing or invalid.</div>
          ) : (
            <button
              className="amora-btn amora-btn-primary amora-auth-submit"
              type="button"
              onClick={confirmDeletion}
            >
              Permanently delete my account
            </button>
          )}
        </>
      )}
      {status === 'working' && <p>Deleting your account…</p>}
      {status === 'done' && <p>{message}</p>}
      {status === 'error' && <div className="amora-error" role="alert">{message}</div>}
    </AuthLayout>
  );
}
