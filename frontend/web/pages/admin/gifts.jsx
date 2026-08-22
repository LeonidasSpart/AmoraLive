// pages/admin/gifts.jsx
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

const API = (process.env.NEXT_PUBLIC_API_URL || 'https://api.amoramatch.one').replace(/\/+$/, '');
const RARITIES = ['common', 'rare', 'epic', 'legendary'];
const CATEGORIES = ['classic', 'romantic', 'luxury', 'seasonal', 'fun'];

const emptyForm = { name: '', description: '', image_url: '', animation_url: '', coin_price: '', rarity: 'common', category: 'classic' };

export default function AdminGifts() {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  };

  const load = async () => {
    const headers = authHeaders();
    if (!headers) {
      window.location.href = '/login';
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/gifts`, { headers });
      if (!res.ok) throw new Error('Failed to fetch gifts');
      setGifts(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (gift) => {
    setEditingId(gift.id);
    setForm({
      name: gift.name || '',
      description: gift.description || '',
      image_url: gift.image_url || '',
      animation_url: gift.animation_url || '',
      coin_price: String(gift.coin_price ?? ''),
      rarity: gift.rarity || 'common',
      category: gift.category || 'classic'
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    const headers = authHeaders();
    if (!headers) return;
    if (!form.name.trim() || !form.image_url.trim() || !form.coin_price) {
      setError('Name, image URL, and coin price are required.');
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        image_url: form.image_url.trim(),
        animation_url: form.animation_url.trim() || undefined,
        coin_price: Number(form.coin_price),
        rarity: form.rarity,
        category: form.category
      };
      const res = await fetch(`${API}/admin/gifts${editingId ? `/${editingId}` : ''}`, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to save gift.');
      cancelEdit();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (id) => {
    const headers = authHeaders();
    if (!headers) return;
    if (!confirm('Deactivate this gift? It will disappear from the catalog.')) return;
    try {
      await fetch(`${API}/admin/gifts/${id}`, { method: 'DELETE', headers });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 20 }}>Gift Catalog</h1>

      <form onSubmit={save} style={s.form}>
        <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit gift' : 'Add a new gift'}</h3>
        <div style={s.grid}>
          <input style={s.input} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input style={s.input} placeholder="Coin price" type="number" min="1" value={form.coin_price} onChange={(e) => setForm({ ...form, coin_price: e.target.value })} />
          <input style={s.input} placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <input style={s.input} placeholder="Animation URL (optional)" value={form.animation_url} onChange={(e) => setForm({ ...form, animation_url: e.target.value })} />
          <select style={s.input} value={form.rarity} onChange={(e) => setForm({ ...form, rarity: e.target.value })}>
            {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select style={s.input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <textarea style={{ ...s.input, marginTop: 10, width: '100%', minHeight: 50 }} placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        {error && <div style={s.error}>{error}</div>}
        <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
          <button type="submit" style={s.createBtn} disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add gift'}</button>
          {editingId && <button type="button" style={s.cancelBtn} onClick={cancelEdit}>Cancel</button>}
        </div>
      </form>

      {loading ? (
        <p>Loading…</p>
      ) : gifts.length === 0 ? (
        <p style={{ color: '#888' }}>No gifts yet.</p>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Image</th>
              <th style={s.th}>Name</th>
              <th style={s.th}>Price</th>
              <th style={s.th}>Rarity</th>
              <th style={s.th}>Category</th>
              <th style={s.th}>Status</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {gifts.map((g) => (
              <tr key={g.id}>
                <td style={s.td}>{g.image_url ? <img src={g.image_url} alt={g.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} /> : '—'}</td>
                <td style={s.td}>{g.name}</td>
                <td style={s.td}>🪙 {g.coin_price}</td>
                <td style={s.td}>{g.rarity}</td>
                <td style={s.td}>{g.category}</td>
                <td style={s.td}>{g.is_active ? '🟢 Active' : '⚫ Inactive'}</td>
                <td style={s.td}>
                  <button style={s.smallBtn} onClick={() => startEdit(g)}>Edit</button>
                  {g.is_active && <button style={{ ...s.smallBtn, marginLeft: 6, color: '#ff6b6b' }} onClick={() => deactivate(g.id)}>Deactivate</button>}
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
  error: { color: '#ff6b6b', marginTop: 10 },
  createBtn: { background: '#FF6B9D', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' },
  cancelBtn: { background: 'transparent', border: '1px solid #444', color: '#ccc', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', borderBottom: '1px solid #333', padding: 8, color: '#999', fontSize: 13 },
  td: { borderBottom: '1px solid #222', padding: 8, fontSize: 13 },
  smallBtn: { background: 'transparent', border: '1px solid #444', color: '#ccc', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }
};
