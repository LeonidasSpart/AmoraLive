// pages/membership.jsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import ProfileFrame from '../components/ProfileFrame';

const TIER_COLORS = {
  free: '#666',
  premium: '#3fa9ff',
  vip: '#ff5da8',
  svip: '#ffd700'
};

export default function Membership() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyTier, setBusyTier] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    if (!localStorage.getItem('accessToken')) {
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [plansRes, statusRes] = await Promise.all([
        apiFetch('/membership/plans', {}, { skipAuth: true }),
        apiFetch('/membership/me')
      ]);
      if (plansRes.ok) setPlans(await plansRes.json());
      if (statusRes.ok) setStatus(await statusRes.json());
    } catch (e) {
      setError('Unable to load membership info.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    if (router.query.membership === 'success') {
      setMessage('Payment received — your membership will activate within a few seconds.');
      setTimeout(load, 3000);
    } else if (router.query.membership === 'cancelled') {
      setMessage('Checkout was cancelled — no changes were made.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upgrade = async (tier) => {
    setBusyTier(tier);
    setError('');
    try {
      const res = await apiFetch('/membership/checkout', { method: 'POST', body: JSON.stringify({ tier }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to start checkout.');
      window.location.href = data.checkoutUrl;
    } catch (e) {
      setError(e.message);
      setBusyTier(null);
    }
  };

  const cancel = async () => {
    if (!confirm('Cancel auto-renew? You\'ll keep your current benefits until the end of this billing period, then drop to Free.')) return;
    setCancelling(true);
    setError('');
    try {
      const res = await apiFetch('/membership/cancel', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to cancel.');
      setMessage('Auto-renew cancelled. Your benefits remain active until the period ends.');
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={s.wrap}><p style={{ color: '#999' }}>Loading…</p></div>
      </Layout>
    );
  }

  const currentTier = status?.tier || 'free';

  return (
    <Layout>
      <div style={s.wrap}>
        <h1 style={s.title}>💎 Membership</h1>
        {message && <div style={s.success}>{message}</div>}
        {error && <div style={s.error}>{error}</div>}

        <div style={s.statusCard}>
          <ProfileFrame tier={currentTier} size={72}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: TIER_COLORS[currentTier], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, color: '#fff' }}>
              {currentTier[0].toUpperCase()}
            </div>
          </ProfileFrame>
          <div style={{ flex: 1, marginLeft: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{status?.label || 'Free'}</div>
            {status?.end_date ? (
              <div style={{ color: '#999', fontSize: 13 }}>
                {status.auto_renew ? 'Renews' : 'Expires'} {new Date(status.end_date).toLocaleDateString()}
              </div>
            ) : (
              <div style={{ color: '#999', fontSize: 13 }}>No active paid membership</div>
            )}
          </div>
          {status?.end_date && status.auto_renew && (
            <button onClick={cancel} disabled={cancelling} style={s.cancelBtn}>
              {cancelling ? 'Cancelling…' : 'Cancel auto-renew'}
            </button>
          )}
        </div>

        <div style={s.planGrid}>
          {plans.filter((p) => p.tier !== 'free').map((plan) => {
            const isCurrent = plan.tier === currentTier;
            return (
              <div key={plan.tier} style={{ ...s.planCard, borderColor: isCurrent ? TIER_COLORS[plan.tier] : '#2a2a3e' }}>
                <div style={{ color: TIER_COLORS[plan.tier], fontWeight: 800, fontSize: 16 }}>{plan.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, margin: '8px 0' }}>${plan.price}<span style={{ fontSize: 13, color: '#999' }}>/mo</span></div>
                <ul style={s.benefitList}>
                  {plan.benefits.map((b) => <li key={b} style={s.benefitItem}>✓ {b}</li>)}
                </ul>
                {isCurrent ? (
                  <div style={s.currentBadge}>Your current plan</div>
                ) : (
                  <button onClick={() => upgrade(plan.tier)} disabled={busyTier === plan.tier} style={s.upgradeBtn}>
                    {busyTier === plan.tier ? 'Redirecting…' : `Get ${plan.label}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

const s = {
  wrap: { maxWidth: 900, margin: '0 auto', padding: '24px 16px', color: '#fff' },
  title: { fontSize: 24, marginBottom: 16 },
  success: { color: '#8f8', background: 'rgba(20,90,20,0.3)', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14 },
  error: { color: '#ff6b6b', background: 'rgba(90,20,20,0.3)', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14 },
  statusCard: { display: 'flex', alignItems: 'center', background: '#161625', border: '1px solid #2a2a3e', borderRadius: 16, padding: 20, marginBottom: 24 },
  cancelBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid #444', color: '#ccc', borderRadius: 10, padding: '8px 14px', fontSize: 13, cursor: 'pointer' },
  planGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 },
  planCard: { background: '#161625', border: '2px solid #2a2a3e', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column' },
  benefitList: { listStyle: 'none', padding: 0, margin: '12px 0', flex: 1 },
  benefitItem: { fontSize: 13, color: '#ccc', padding: '4px 0' },
  currentBadge: { textAlign: 'center', padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', color: '#999', fontSize: 13, fontWeight: 700 },
  upgradeBtn: { padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer' }
};
