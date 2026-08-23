// pages/withdraw.jsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';

const STATUS_COLORS = { pending: '#ffd166', approved: '#3fa9ff', rejected: '#ff6b6b', paid: '#8f8' };

export default function Withdraw() {
  const router = useRouter();
  const [info, setInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coinsAmount, setCoinsAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('paypal');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    if (!localStorage.getItem('accessToken')) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const [infoRes, historyRes] = await Promise.all([
        apiFetch('/wallet/withdrawal-info'),
        apiFetch('/wallet/withdrawals')
      ]);
      if (infoRes.ok) setInfo(await infoRes.json());
      if (historyRes.ok) setHistory(await historyRes.json());
    } catch (e) {
      setError('Unable to load withdrawal info.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const coins = Number(coinsAmount);
    if (!Number.isInteger(coins) || coins < (info?.minWithdrawalCoins || 0)) {
      setError(`Minimum withdrawal is ${info?.minWithdrawalCoins?.toLocaleString()} coins.`);
      return;
    }
    if (coins > (info?.balance || 0)) {
      setError('You cannot withdraw more than your available balance.');
      return;
    }
    if (!payoutDetails.trim()) {
      setError('Enter your payout details.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch('/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify({ coinsAmount: coins, payoutMethod, payoutDetails: payoutDetails.trim() })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to submit withdrawal request.');
      setMessage(`Withdrawal request submitted for $${(data.usd_cents / 100).toFixed(2)}.`);
      setCoinsAmount('');
      setPayoutDetails('');
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={s.wrap}><p style={{ color: '#999' }}>Loading…</p></div>
      </Layout>
    );
  }

  const requestedUsd = coinsAmount && info ? ((Number(coinsAmount) * info.coinToUsdCents) / 100).toFixed(2) : '0.00';

  return (
    <Layout>
      <div style={s.wrap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Link href="/wallet" style={{ color: '#999', textDecoration: 'none' }}>←</Link>
          <h1 style={s.title}>💵 Withdraw</h1>
        </div>

        <div style={s.noticeBox}>
          Payouts are reviewed and sent manually by the AmoraLive team — this isn't an instant transfer. Rate: 100 coins = ${info ? (info.coinToUsdCents).toFixed(0) : '1'}.00. Minimum: {info?.minWithdrawalCoins?.toLocaleString()} coins.
        </div>

        {message && <div style={s.success}>{message}</div>}
        {error && <div style={s.error}>{error}</div>}

        <div style={s.balanceCard}>
          <div style={{ color: '#999', fontSize: 12 }}>Available balance</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#ffd166' }}>🪙 {info?.balance?.toLocaleString() ?? 0}</div>
          <div style={{ color: '#777', fontSize: 12 }}>≈ ${info?.availableForWithdrawalUsd ?? '0.00'}</div>
        </div>

        <form onSubmit={submit} style={s.form}>
          <label style={s.label}>Coins to withdraw</label>
          <input
            type="number"
            value={coinsAmount}
            onChange={(e) => setCoinsAmount(e.target.value)}
            placeholder={`Minimum ${info?.minWithdrawalCoins?.toLocaleString()}`}
            style={s.input}
          />
          <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>≈ ${requestedUsd}</div>

          <label style={s.label}>Payout method</label>
          <select value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)} style={s.input}>
            <option value="paypal">PayPal</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="other">Other</option>
          </select>

          <label style={s.label}>{payoutMethod === 'paypal' ? 'PayPal email' : payoutMethod === 'bank_transfer' ? 'Bank details' : 'Payout details'}</label>
          <textarea
            value={payoutDetails}
            onChange={(e) => setPayoutDetails(e.target.value)}
            placeholder={payoutMethod === 'paypal' ? 'you@example.com' : 'Account details for payout'}
            style={{ ...s.input, minHeight: 70 }}
          />

          <button type="submit" disabled={submitting} style={s.submitBtn}>
            {submitting ? 'Submitting…' : 'Request Withdrawal'}
          </button>
        </form>

        <h3 style={s.historyTitle}>Withdrawal History</h3>
        {history.length === 0 ? (
          <p style={{ color: '#777', fontSize: 13 }}>No withdrawal requests yet.</p>
        ) : (
          <div style={s.historyList}>
            {history.map((w) => (
              <div key={w.id} style={s.historyRow}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>🪙 {w.coins_amount.toLocaleString()} → ${(w.usd_cents / 100).toFixed(2)}</div>
                  <div style={{ color: '#777', fontSize: 11 }}>{new Date(w.requested_at).toLocaleDateString()} · {w.payout_method.replace('_', ' ')}</div>
                </div>
                <span style={{ color: STATUS_COLORS[w.status] || '#999', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>{w.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

const s = {
  wrap: { maxWidth: 500, margin: '0 auto', padding: '24px 16px', color: '#fff' },
  title: { fontSize: 22, margin: 0 },
  noticeBox: { background: 'rgba(63,169,255,0.1)', border: '1px solid rgba(63,169,255,0.3)', color: '#9ecfff', borderRadius: 10, padding: 12, fontSize: 12, marginBottom: 16, lineHeight: 1.5 },
  success: { color: '#8f8', background: 'rgba(20,90,20,0.3)', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14 },
  error: { color: '#ff6b6b', background: 'rgba(90,20,20,0.3)', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14 },
  balanceCard: { background: '#161625', border: '1px solid #2a2a3e', borderRadius: 14, padding: 18, textAlign: 'center', marginBottom: 20 },
  form: { background: '#161625', border: '1px solid #2a2a3e', borderRadius: 14, padding: 18, marginBottom: 24 },
  label: { display: 'block', fontSize: 12, color: '#999', marginTop: 12, marginBottom: 6 },
  input: { width: '100%', padding: 10, borderRadius: 8, background: '#0f0f1a', border: '1px solid #333', color: '#fff', boxSizing: 'border-box', fontFamily: 'inherit' },
  submitBtn: { width: '100%', marginTop: 18, padding: 12, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer' },
  historyTitle: { fontSize: 15, color: '#ccc', marginBottom: 10 },
  historyList: { display: 'flex', flexDirection: 'column', gap: 8 },
  historyRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161625', border: '1px solid #2a2a3e', borderRadius: 10, padding: '10px 14px' }
};
