// pages/admin/events.jsx
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../lib/api';

function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const now = new Date();
  const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

  const [form, setForm] = useState({
    title: '',
    description: '',
    banner_url: '',
    event_type: 'team_battle',
    teamA: '',
    teamB: '',
    starts_at: toLocalInputValue(now),
    ends_at: toLocalInputValue(inFiveDays)
  });

  const load = async () => {
    if (!localStorage.getItem('accessToken')) {
      window.location.href = '/login';
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/admin/events');
      if (!res.ok) throw new Error('Failed to fetch events');
      setEvents(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createEvent = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.teamA.trim() || !form.teamB.trim()) {
      setError('Title and both team names are required.');
      return;
    }
    setCreating(true);
    try {
      const res = await apiFetch('/admin/events', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          banner_url: form.banner_url.trim() || undefined,
          event_type: form.event_type,
          teams: [form.teamA.trim(), form.teamB.trim()],
          starts_at: new Date(form.starts_at).toISOString(),
          ends_at: new Date(form.ends_at).toISOString()
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to create event.');
      setForm({ ...form, title: '', description: '', banner_url: '', teamA: '', teamB: '' });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const endEvent = async (id) => {
    if (!confirm('End this event now?')) return;
    try {
      await apiFetch(`/admin/events/${id}/end`, { method: 'POST' });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteEvent = async (id) => {
    if (!confirm('Permanently delete this event and its scores?')) return;
    try {
      await apiFetch(`/admin/events/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 20 }}>Team-Battle Events</h1>

      <form onSubmit={createEvent} style={s.form}>
        <h3 style={{ marginTop: 0 }}>Create new event</h3>
        <div style={s.grid}>
          <input style={s.input} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input style={s.input} placeholder="Banner image URL (optional)" value={form.banner_url} onChange={(e) => setForm({ ...form, banner_url: e.target.value })} />
          <input style={s.input} placeholder="Team A name (e.g. Dragon)" value={form.teamA} onChange={(e) => setForm({ ...form, teamA: e.target.value })} />
          <input style={s.input} placeholder="Team B name (e.g. Slayer)" value={form.teamB} onChange={(e) => setForm({ ...form, teamB: e.target.value })} />
          <label style={s.label}>Starts<input style={s.input} type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></label>
          <label style={s.label}>Ends<input style={s.input} type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></label>
        </div>
        <textarea style={{ ...s.input, marginTop: 10, width: '100%', minHeight: 60 }} placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        {error && <div style={s.error}>{error}</div>}
        <button type="submit" style={s.createBtn} disabled={creating}>{creating ? 'Creating…' : 'Create Event'}</button>
      </form>

      <h3>All events</h3>
      {loading ? (
        <p>Loading…</p>
      ) : events.length === 0 ? (
        <p style={{ color: '#888' }}>No events yet.</p>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Title</th>
              <th style={s.th}>Teams</th>
              <th style={s.th}>Starts</th>
              <th style={s.th}>Ends</th>
              <th style={s.th}>Status</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => {
              const active = ev.is_active && new Date(ev.starts_at) <= new Date() && new Date(ev.ends_at) >= new Date();
              return (
                <tr key={ev.id}>
                  <td style={s.td}>{ev.title}</td>
                  <td style={s.td}>{(ev.teams || []).join(' vs ')}</td>
                  <td style={s.td}>{new Date(ev.starts_at).toLocaleString()}</td>
                  <td style={s.td}>{new Date(ev.ends_at).toLocaleString()}</td>
                  <td style={s.td}>{active ? '🟢 Live' : ev.is_active ? '⏳ Scheduled/Ended' : '⚫ Ended'}</td>
                  <td style={s.td}>
                    {active && <button style={s.smallBtn} onClick={() => endEvent(ev.id)}>End now</button>}
                    <button style={{ ...s.smallBtn, marginLeft: 6, color: '#ff6b6b' }} onClick={() => deleteEvent(ev.id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
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
  label: { display: 'flex', flexDirection: 'column', gap: 4, color: '#aaa', fontSize: 13 },
  error: { color: '#ff6b6b', marginTop: 10 },
  createBtn: { marginTop: 14, background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', borderBottom: '1px solid #333', padding: 8, color: '#999', fontSize: 13 },
  td: { borderBottom: '1px solid #222', padding: 8, fontSize: 13 },
  smallBtn: { background: 'transparent', border: '1px solid #444', color: '#ccc', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }
};
