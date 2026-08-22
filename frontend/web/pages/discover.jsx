import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

const API = (process.env.NEXT_PUBLIC_API_URL || 'https://api.amoramatch.one').replace(/\/+$/, '');

const tabs = [
  ['recommended', '✨', 'Recommended'],
  ['trending', '🔥', 'Trending'],
  ['new', '💎', 'New'],
  ['following', '💗', 'Following'],
];

const categories = ['All', 'Chat', 'Music', 'Entertainment', 'Gaming', 'Lifestyle', 'Travel', 'Dating'];

function initials(name = 'A') {
  return name.trim().slice(0, 1).toUpperCase();
}

export default function Discover() {
  const [rooms, setRooms] = useState([]);
  const [activeTab, setActiveTab] = useState('recommended');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRooms = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;
    setLoading(true); setError('');
    try {
      let url = `${API}/live?limit=48`;
      if (activeTab === 'trending') url += '&sort=viewer_count';
      if (activeTab === 'new') url += '&sort=newest';
      if (activeTab === 'following') url += '&following=true';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Unable to load live rooms.');
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : data.rooms || []);
    } catch (e) {
      setRooms([]); setError(e.message || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRooms(); }, [activeTab]);

  const visibleRooms = useMemo(() => {
    if (category === 'All') return rooms;
    return rooms.filter((room) => String(room.category || '').toLowerCase() === category.toLowerCase());
  }, [rooms, category]);

  return (
    <Layout>
      <div className="amora-discover">
        <section className="amora-discover-hero">
          <div>
            <span className="amora-kicker">AMORALIVE • LIVE NOW</span>
            <h1>Find your <span>spark.</span></h1>
            <p>Meet creators, flirt, chat, match and discover your next favourite person — all in one beautiful place.</p>
          </div>
          <div className="amora-hero-pills">
            <Link href="/go-live" className="amora-hot-action">🔴 Go Live</Link>
            <Link href="/video-match" className="amora-soft-action">💘 Quick Match</Link>
          </div>
        </section>

        <div className="amora-discover-tabs">
          {tabs.map(([key, icon, label]) => (
            <button key={key} className={activeTab === key ? 'is-active' : ''} onClick={() => setActiveTab(key)}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </div>

        <div className="amora-category-strip">
          {categories.map((item) => (
            <button key={item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>

        <section className="amora-section-heading">
          <div>
            <h2>{activeTab === 'trending' ? 'Trending tonight' : activeTab === 'new' ? 'Fresh faces' : 'Live for you'}</h2>
            <p>{visibleRooms.length ? `${visibleRooms.length} live rooms available` : 'Your next connection could be one tap away.'}</p>
          </div>
          <button className="amora-refresh" onClick={fetchRooms}>↻ Refresh</button>
        </section>

        {loading && <div className="amora-live-grid">{Array.from({ length: 8 }).map((_, i) => <div className="amora-skeleton-card" key={i} />)}</div>}

        {!loading && error && (
          <div className="amora-empty-card"><div className="amora-empty-icon">♡</div><h3>We hit a little pause</h3><p>{error}</p><button onClick={fetchRooms} className="amora-hot-action">Try again</button></div>
        )}

        {!loading && !error && visibleRooms.length === 0 && (
          <div className="amora-empty-card"><div className="amora-empty-icon">✦</div><h3>No live rooms right now</h3><p>Be the first to light up Amora and start your own live room.</p><Link href="/go-live" className="amora-hot-action">Start your live</Link></div>
        )}

        {!loading && !error && visibleRooms.length > 0 && (
          <div className="amora-live-grid">
            {visibleRooms.map((room, index) => {
              const host = room.host || {};
              const name = host.display_name || host.username || 'Amora creator';
              return (
                <Link href={`/live/${room.id}`} className="amora-live-card" key={room.id}>
                  <div className={`amora-live-media tone-${index % 6}`}>
                    {room.thumbnail_url ? <img src={room.thumbnail_url} alt="" /> : <div className="amora-avatar-fallback">{initials(name)}</div>}
                    <div className="amora-live-shade" />
                    <div className="amora-live-topline"><span className="amora-live-badge">● LIVE</span><span className="amora-viewers">👁 {room.viewer_count || 0}</span></div>
                    <span className="amora-video-orb">▶</span>
                    <div className="amora-live-bottom">
                      <div className="amora-host-line">
                        <span className="amora-host-avatar">{host.profile_photo ? <img src={host.profile_photo} alt="" /> : initials(name)}</span>
                        <span><strong>{name}</strong><small>● Online now</small></span>
                      </div>
                      <span className="amora-heart">♡</span>
                    </div>
                  </div>
                  <div className="amora-live-info">
                    <h3>{room.title || 'Come say hello 💕'}</h3>
                    <span>#{room.category || 'General'}</span>
                    <b>Join the room →</b>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <section className="amora-discover-cta">
          <div><span className="amora-kicker">YOUR MOMENT</span><h2>Ready to be the one everyone notices?</h2><p>Start a live room, collect gifts, grow your audience and make genuine connections.</p></div>
          <Link href="/go-live" className="amora-hot-action">✨ Start Live</Link>
        </section>
      </div>
    </Layout>
  );
}
