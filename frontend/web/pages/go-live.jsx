// pages/go-live.jsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';

const CATEGORIES = ['Chat', 'Music', 'Dance', 'Gaming', 'Talent', 'Just Chatting', 'General'];

export default function GoLive() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startLive = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Give your live room a title.');
      return;
    }
    if (!localStorage.getItem('accessToken')) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/live', {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), category })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to start your live room.');
      // live/[id].jsx already handles the host-publish flow (camera/mic via
      // LiveKit) once it detects the current user is the room's host — so
      // creating the room here is the only missing piece.
      router.push(`/live/${data.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={s.page}>
        <h1 style={s.title}>Go Live</h1>
        <p style={s.subtitle}>Start a live room. Viewers can join, chat and send you gifts in real time.</p>

        <form onSubmit={startLive} style={s.form}>
          <label style={s.label}>Title</label>
          <input
            style={s.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's happening in your stream?"
            maxLength={80}
          />

          <label style={s.label}>Category</label>
          <div style={s.categoryGrid}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                style={category === c ? s.categoryActive : s.category}
              >
                {c}
              </button>
            ))}
          </div>

          {error && <div style={s.error}>{error}</div>}

          <button type="submit" style={s.goBtn} disabled={loading}>
            {loading ? 'Starting…' : '🔴 Go Live'}
          </button>
        </form>

        <p style={s.note}>You'll be asked to allow camera and microphone access once your room is created.</p>
      </div>
    </Layout>
  );
}

const s = {
  page: { maxWidth: 480, margin: '0 auto', padding: '32px 16px', fontFamily: 'sans-serif' },
  title: { color: '#fff', fontSize: 28, marginBottom: 8 },
  subtitle: { color: '#999', marginBottom: 24, fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { color: '#aaa', fontSize: 13, marginTop: 12, marginBottom: 4 },
  input: { background: '#161625', border: '1px solid #2a2a3e', borderRadius: 10, padding: 12, color: '#fff', fontSize: 15 },
  categoryGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  category: { background: 'transparent', border: '1px solid #333', color: '#aaa', padding: '8px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 13 },
  categoryActive: { background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', border: '1px solid #FF6B9D', color: '#fff', padding: '8px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 13 },
  error: { color: '#ff6b6b', marginTop: 8, fontSize: 13 },
  goBtn: { marginTop: 24, background: '#ff3355', border: 'none', color: '#fff', padding: '14px 0', borderRadius: 12, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' },
  note: { color: '#666', fontSize: 12, marginTop: 16, textAlign: 'center' }
};
