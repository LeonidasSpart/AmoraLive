// pages/admin/wallet.jsx
import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../lib/api';

export default function AdminWallet() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [granting, setGranting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const search = async (e) => {
    e.preventDefault();
    if (!localStorage.getItem('accessToken')) {
      window.location.href = '/login';
      return;
    }
    setSearching(true);
    setError('');
    setMessage('');
    try {
      const res = await apiFetch(`/admin/wallet/lookup?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Search failed.');
      setResults(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setSearching(false);
    }
  };

  const grant = async (e) => {
    e.preventDefault();
    if (!selected) {
      setError('Pick a user first.');
      return;
    }
    const amt = Number(amount);
    if (!Number.isInteger(amt) || amt === 0) {
      setError('Enter a non-zero whole number of coins (negative to deduct).');
      return;
    }
    setGranting(true);
    setError('');
    setMessage('');
    try {
      const res = await apiFetch('/admin/wallet/grant', {
        method: 'POST',
        body: JSON.stringify({ userId: selected.id, amount: amt, note: note.trim() || undefined })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Grant failed.');
      setMessage(`${amt > 0 ? 'Granted' : 'Deducted'} ${Math.abs(amt)} coins ${amt > 0 ? 'to' : 'from'} @${data.username}. New balance: ${data.balance}.`);
      setSelected({ ...selected, wallet: { balance: data.balance } });
      setAmount('');
      setNote('');
    } catch (e) {
      setError(e.message);
    } finally {
      setGranting(false);
    }
  };

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 8 }}>Coin Management</h1>
      <p style={{ color: '#999', marginBottom: 24, fontSize: 14 }}>
        Grant or deduct coins on any account directly — including your own, for unlimited testing/support use.
        Every change is logged.
      </p>

      <form onSubmit={search} style={s.searchRow}>
        <input
          style={s.input}
          placeholder="Search by username, email, or display name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" style={s.searchBtn} disabled={searching}>
          {searching ? 'Searching…' : 'Search'}
        </button>
      </form>

      {results.length > 0 && (
        <div style={s.results}>
          {results.map((u) => (
            <button
              key={u.id}
              onClick={() => { setSelected(u); setResults([]); setQuery(''); }}
              style={s.resultRow}
            >
              <span style={{ fontWeight: 'bold' }}>{u.display_name || u.username}</span>
              <span style={{ color: '#888', marginLeft: 8 }}>@{u.username} · {u.email}</span>
              <span style={{ marginLeft: 'auto', color: '#ffd166' }}>🪙 {u.wallet?.balance ?? 0}</span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div style={s.panel}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 16 }}>{selected.display_name || selected.username}</div>
              <div style={{ color: '#888', fontSize: 13 }}>@{selected.username} · Current balance: 🪙 {selected.wallet?.balance ?? 0}</div>
            </div>
            <button onClick={() => setSelected(null)} style={s.clearBtn}>✕</button>
          </div>

          <form onSubmit={grant} style={s.grantForm}>
            <input
              style={s.input}
              type="number"
              placeholder="Amount (e.g. 10000, or -500 to deduct)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <input
              style={s.input}
              placeholder="Note (optional — shown in audit log)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button type="submit" style={s.grantBtn} disabled={granting}>
              {granting ? 'Processing…' : 'Apply'}
            </button>
          </form>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {[1000, 10000, 100000, 1000000].map((v) => (
              <button key={v} type="button" style={s.quickBtn} onClick={() => setAmount(String(v))}>
                +{v.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      )}

      {message && <div style={s.success}>{message}</div>}
      {error && <div style={s.error}>{error}</div>}
    </AdminLayout>
  );
}

const s = {
  searchRow: { display: 'flex', gap: 10, marginBottom: 12 },
  input: { flex: 1, background: '#0f0f1a', border: '1px solid #333', borderRadius: 8, padding: 10, color: '#fff' },
  searchBtn: { background: '#2a2a3e', border: '1px solid #444', color: '#fff', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' },
  results: { background: '#161625', border: '1px solid #2a2a3e', borderRadius: 12, marginBottom: 20, overflow: 'hidden' },
  resultRow: { display: 'flex', alignItems: 'center', width: '100%', background: 'transparent', border: 0, borderBottom: '1px solid #222', color: '#fff', padding: '12px 16px', cursor: 'pointer', textAlign: 'left', fontSize: 14 },
  panel: { background: '#161625', border: '1px solid #2a2a3e', borderRadius: 12, padding: 20, marginBottom: 20 },
  clearBtn: { marginLeft: 'auto', background: 'transparent', border: '1px solid #444', color: '#ccc', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' },
  grantForm: { display: 'flex', gap: 10 },
  grantBtn: { background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' },
  quickBtn: { background: '#2a2a3e', border: '1px solid #444', color: '#ccc', padding: '6px 14px', borderRadius: 16, cursor: 'pointer', fontSize: 12 },
  success: { color: '#8f8', background: '#1a3a1a', padding: 12, borderRadius: 8, marginBottom: 16 },
  error: { color: '#ff6b6b', marginTop: 10 }
};
