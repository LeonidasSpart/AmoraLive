// pages/admin/packages.jsx
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../lib/api';

const PLATFORMS = ['web', 'ios', 'android'];

const emptyForm = { name: '', price_cents: '', coins_amount: '', bonus_coins: '0', is_promotion: false, region: '', platform: 'web', stripe_price_id: '', apple_product_id: '', google_product_id: '' };

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!localStorage.getItem('accessToken')) {
      window.location.href = '/login';
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/admin/packages');
      if (!res.ok) throw new Error('Failed to fetch packages');
      setPackages(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (pkg) => {
    setEditingId(pkg.id);
    setForm({
      name: pkg.name || '',
      price_cents: String(pkg.price_cents ?? ''),
      coins_amount: String(pkg.coins_amount ?? ''),
      bonus_coins: String(pkg.bonus_coins ?? '0'),
      is_promotion: Boolean(pkg.is_promotion),
      region: pkg.region || '',
      platform: pkg.platform || 'web',
      stripe_price_id: pkg.stripe_price_id || '',
      apple_product_id: pkg.apple_product_id || '',
      google_product_id: pkg.google_product_id || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.price_cents || !form.coins_amount) {
      setError('Name, price, and coin amount are required.');
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        price_cents: Number(form.price_cents),
        coins_amount: Number(form.coins_amount),
        bonus_coins: Number(form.bonus_coins || 0),
        is_promotion: form.is_promotion,
        region: form.region.trim() || undefined,
        platform: form.platform,
        stripe_price_id: form.stripe_price_id.trim() || undefined,
        apple_product_id: form.apple_product_id.trim() || undefined,
        google_product_id: form.google_product_id.trim() || undefined
      };
      const res = await apiFetch(`/admin/packages${editingId ? `/${editingId}` : ''}`, {
        method: editingId ? 'PATCH' : 'POST',
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to save package.');
      cancelEdit();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Deactivate this package? It will stop appearing for purchase, but past purchase history stays intact.')) return;
    try {
      const res = await apiFetch(`/admin/packages/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to deactivate package.');
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const reactivate = async (id) => {
    try {
      const res = await apiFetch(`/admin/packages/${id}/reactivate`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to reactivate package.');
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 20 }}>Coin Packages</h1>

      <form onSubmit={save} style={s.form}>
        <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit package' : 'Add a new package'}</h3>
        <div style={s.grid}>
          <input style={s.input} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input style={s.input} placeholder="Price (cents)" type="number" min="1" value={form.price_cents} onChange={(e) => setForm({ ...form, price_cents: e.target.value })} />
          <input style={s.input} placeholder="Coins amount" type="number" min="1" value={form.coins_amount} onChange={(e) => setForm({ ...form, coins_amount: e.target.value })} />
          <input style={s.input} placeholder="Bonus coins" type="number" min="0" value={form.bonus_coins} onChange={(e) => setForm({ ...form, bonus_coins: e.target.value })} />
          <select style={s.input} value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
            {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <input style={s.input} placeholder="Region (optional)" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
          <input style={s.input} placeholder="Stripe price ID (optional)" value={form.stripe_price_id} onChange={(e) => setForm({ ...form, stripe_price_id: e.target.value })} />
          <input style={s.input} placeholder="Apple product ID (e.g. com.amora.coins500)" value={form.apple_product_id} onChange={(e) => setForm({ ...form, apple_product_id: e.target.value })} />
          <input style={s.input} placeholder="Google product ID (e.g. coins_500)" value={form.google_product_id} onChange={(e) => setForm({ ...form, google_product_id: e.target.value })} />
          <label style={s.checkboxLabel}>
            <input type="checkbox" checked={form.is_promotion} onChange={(e) => setForm({ ...form, is_promotion: e.target.checked })} />
            Promotional package
          </label>
        </div>
        {error && <div style={s.error}>{error}</div>}
        <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
          <button type="submit" style={s.createBtn} disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add package'}</button>
          {editingId && <button type="button" style={s.cancelBtn} onClick={cancelEdit}>Cancel</button>}
        </div>
      </form>

      {loading ? (
        <p>Loading…</p>
      ) : packages.length === 0 ? (
        <p style={{ color: '#888' }}>No packages yet.</p>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Name</th>
              <th style={s.th}>Price</th>
              <th style={s.th}>Coins</th>
              <th style={s.th}>Bonus</th>
              <th style={s.th}>Platform</th>
              <th style={s.th}>Promo</th>
              <th style={s.th}>Status</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {packages.map((p) => (
              <tr key={p.id}>
                <td style={s.td}>{p.name}</td>
                <td style={s.td}>${(p.price_cents / 100).toFixed(2)}</td>
                <td style={s.td}>🪙 {p.coins_amount}</td>
                <td style={s.td}>{p.bonus_coins > 0 ? `+${p.bonus_coins}` : '—'}</td>
                <td style={s.td}>{p.platform}</td>
                <td style={s.td}>{p.is_promotion ? '🏷️' : ''}</td>
                <td style={s.td}>{p.is_active ? '🟢 Active' : '⚫ Inactive'}</td>
                <td style={s.td}>
                  <button style={s.smallBtn} onClick={() => startEdit(p)}>Edit</button>
                  {p.is_active ? (
                    <button style={{ ...s.smallBtn, marginLeft: 6, color: '#ff6b6b' }} onClick={() => remove(p.id)}>Deactivate</button>
                  ) : (
                    <button style={{ ...s.smallBtn, marginLeft: 6, color: '#8f8' }} onClick={() => reactivate(p.id)}>Reactivate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}

const s = {
  form: { background: '#161625', border: '1px solid #2a2a3e', borderRadius: 12, padding: 20, marginBottom: 32 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 },
  input: { background: '#0f0f1a', border: '1px solid #333', borderRadius: 8, padding: 10, color: '#fff' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: 8, color: '#aaa', fontSize: 13 },
  error: { color: '#ff6b6b', marginTop: 10 },
  createBtn: { background: '#FF6B9D', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' },
  cancelBtn: { background: 'transparent', border: '1px solid #444', color: '#ccc', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', borderBottom: '1px solid #333', padding: 8, color: '#999', fontSize: 13 },
  td: { borderBottom: '1px solid #222', padding: 8, fontSize: 13 },
  smallBtn: { background: 'transparent', border: '1px solid #444', color: '#ccc', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }
};
