// pages/admin/withdrawals.jsx
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../lib/api';

const STATUS_TABS = ['pending', 'approved', 'rejected', 'paid'];

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [noteDrafts, setNoteDrafts] = useState({});

  const load = async () => {
    if (!localStorage.getItem('accessToken')) {
      window.location.href = '/login';
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/admin/withdrawals?status=${status}&limit=50`);
      if (!res.ok) throw new Error('Failed to load withdrawals');
      const data = await res.json();
      setWithdrawals(data.withdrawals || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const review = async (id, newStatus) => {
    if (newStatus === 'rejected' && !confirm('Reject this withdrawal? The coins will be refunded to the creator.')) return;
    setBusyId(id);
    try {
      const res = await apiFetch(`/admin/withdrawals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, adminNote: noteDrafts[id] || undefined })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to update this withdrawal.');
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <h1 style={{ color: '#FF6B9D', marginBottom: 4 }}>Withdrawals</h1>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>
        Approving or marking paid never moves real money automatically — no payout provider is wired up. This just tracks the review workflow; actually sending the funds is a manual step outside this app.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setStatus(t)}
            style={{
              padding: '6px 16px', borderRadius: 16, fontSize: 13, cursor: 'pointer',
              border: status === t ? 'none' : '1px solid #333',
              background: status === t ? 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)' : 'transparent',
              color: status === t ? '#fff' : '#888', textTransform: 'capitalize'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {error && <div style={{ color: '#ff6b6b', marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <p style={{ color: '#888' }}>Loading…</p>
      ) : withdrawals.length === 0 ? (
        <p style={{ color: '#888' }}>No {status} withdrawals.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {withdrawals.map((w) => (
            <div key={w.id} style={{ background: '#161625', border: '1px solid #2a2a3e', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{w.user?.display_name || w.user?.username} <span style={{ color: '#777', fontWeight: 400 }}>({w.user?.email})</span></div>
                  <div style={{ color: '#ffd166', fontSize: 15, fontWeight: 700, marginTop: 4 }}>🪙 {w.coins_amount.toLocaleString()} → ${(w.usd_cents / 100).toFixed(2)}</div>
                  <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{w.payout_method.replace('_', ' ')}: {w.payout_details}</div>
                  <div style={{ color: '#666', fontSize: 11, marginTop: 4 }}>Requested {new Date(w.requested_at).toLocaleString()}</div>
                  {w.admin_note && <div style={{ color: '#999', fontSize: 12, marginTop: 6 }}>Note: {w.admin_note}</div>}
                </div>
              </div>

              {status === 'pending' && (
                <div style={{ marginTop: 12 }}>
                  <input
                    placeholder="Optional note…"
                    value={noteDrafts[w.id] || ''}
                    onChange={(e) => setNoteDrafts({ ...noteDrafts, [w.id]: e.target.value })}
                    style={{ width: '100%', padding: 8, borderRadius: 6, background: '#0f0f1a', border: '1px solid #333', color: '#fff', boxSizing: 'border-box', marginBottom: 8 }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => review(w.id, 'approved')} disabled={busyId === w.id} style={{ flex: 1, padding: 8, borderRadius: 8, border: 'none', background: '#35df70', color: '#06110a', fontWeight: 700, cursor: 'pointer' }}>Approve</button>
                    <button onClick={() => review(w.id, 'rejected')} disabled={busyId === w.id} style={{ flex: 1, padding: 8, borderRadius: 8, border: 'none', background: 'rgba(255,60,60,0.2)', color: '#ff8080', fontWeight: 700, cursor: 'pointer' }}>Reject</button>
                  </div>
                </div>
              )}

              {status === 'approved' && (
                <button onClick={() => review(w.id, 'paid')} disabled={busyId === w.id} style={{ marginTop: 12, width: '100%', padding: 8, borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                  Mark as Paid
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
