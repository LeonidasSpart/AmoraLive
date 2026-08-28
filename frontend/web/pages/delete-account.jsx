import React, { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '../components/AuthLayout';
import { useTranslation } from '../lib/i18n';

const API = (process.env.NEXT_PUBLIC_API_URL || 'https://api.amoramatch.one').replace(/\/+$/, '');

export default function DeleteAccount() {
  const { t } = useTranslation();
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
      if (!res.ok) throw new Error(data.error || t('deleteAccount.errorGeneric'));
      setStatus(data.message || t('deleteAccount.defaultStatusMessage'));
    } catch (e) {
      setError(e.message || t('deleteAccount.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow={t('deleteAccount.eyebrow')}
      title={t('deleteAccount.title')}
      subtitle={t('deleteAccount.subtitle')}
      footerText={t('deleteAccount.footerText')}
      footerHref="/login"
      footerLabel={t('deleteAccount.footerLabel')}
    >
      {error && <div className="amora-error" role="alert">{error}</div>}
      {status && <div className="amora-success-box"><h2>{t('deleteAccount.checkInbox')}</h2><p>{status}</p></div>}

      {!status && (
        <form onSubmit={submit} className="amora-auth-form" style={{ padding: 0, background: 'transparent' }}>
          <div className="amora-field">
            <label className="amora-label" htmlFor="delete-email">{t('deleteAccount.emailLabel')}</label>
            <input id="delete-email" className="amora-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('deleteAccount.emailPlaceholder')} required />
          </div>
          <button className="amora-btn amora-btn-primary amora-auth-submit" type="submit" disabled={loading}>
            {loading ? t('deleteAccount.sending') : t('deleteAccount.submit')}
          </button>
        </form>
      )}

      <p className="amora-auth-small">
        {t('deleteAccount.disclaimer')} <Link href="/legal/privacy">{t('deleteAccount.privacyPolicyLink')}</Link>.
      </p>
    </AuthLayout>
  );
}
