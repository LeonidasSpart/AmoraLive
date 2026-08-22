// pages/notifications.jsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API = (process.env.NEXT_PUBLIC_API_URL || 'https://api.amoramatch.one').replace(/\/+$/, '');

function describe(notification) {
  const p = notification.payload || {};
  switch (notification.type) {
    case 'new_match':
      return { icon: '❤️', text: 'You have a new match!', href: p.peerId ? `/chat/${p.peerId}` : '/discover' };
    case 'new_message':
      return { icon: '💬', text: `${p.senderName || 'Someone'} sent you a message: "${p.preview || ''}"`, href: p.senderId ? `/chat/${p.senderId}` : '/chat' };
    case 'gift_received':
      return { icon: '🎁', text: `You received ${p.quantity || 1}x ${p.giftName || 'a gift'}!`, href: '/wallet' };
    default:
      return { icon: '🔔', text: notification.type?.replace(/_/g, ' ') || 'Notification', href: null };
  }
}

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAll, setMarkingAll] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  };

  const load = async () => {
    const headers = authHeaders();
    if (!headers) {
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/notifications?limit=50`, { headers });
      if (!res.ok) throw new Error('Unable to load notifications.');
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markRead = async (id) => {
    const headers = authHeaders();
    if (!headers) return;
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await fetch(`${API}/notifications/${id}/read`, { method: 'PATCH', headers });
    } catch {}
  };

  const markAllRead = async () => {
    const headers = authHeaders();
    if (!headers) return;
    setMarkingAll(true);
    try {
      await fetch(`${API}/notifications/mark-all-read`, { method: 'POST', headers });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {} finally {
      setMarkingAll(false);
    }
  };

  const removeNotification = async (id) => {
    const headers = authHeaders();
    if (!headers) return;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`${API}/notifications/${id}`, { method: 'DELETE', headers });
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Layout>
      <div style={s.page}>
        <div style={s.header}>
          <h1 style={s.title}>Notifications</h1>
          {unreadCount > 0 && (
            <button style={s.markAllBtn} onClick={markAllRead} disabled={markingAll}>
              {markingAll ? 'Marking…' : `Mark all read (${unreadCount})`}
            </button>
          )}
        </div>

        {error && <div style={s.error}>{error}</div>}

        {loading ? (
          <div style={s.centerMsg}>Loading…</div>
        ) : notifications.length === 0 ? (
          <div style={s.centerMsg}>
            <div style={{ fontSize: 48 }}>🔔</div>
            <p>You're all caught up. Nothing here yet.</p>
          </div>
        ) : (
          <div style={s.list}>
            {notifications.map((n) => {
              const { icon, text, href } = describe(n);
              const content = (
                <div style={{ ...s.item, ...(n.is_read ? {} : s.itemUnread) }} onClick={() => !n.is_read && markRead(n.id)}>
                  <span style={s.icon}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={s.itemText}>{text}</div>
                    <div style={s.itemTime}>{timeAgo(n.created_at)}</div>
                  </div>
                  <button
                    style={s.removeBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeNotification(n.id);
                    }}
                    aria-label="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              );
              return href ? (
                <Link key={n.id} href={href} style={{ textDecoration: 'none' }}>
                  {content}
                </Link>
              ) : (
                <div key={n.id}>{content}</div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

const s = {
  page: { maxWidth: 640, margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: '#fff', fontSize: 26, margin: 0 },
  markAllBtn: { background: 'transparent', border: '1px solid #FF6B9D', color: '#FF6B9D', padding: '6px 14px', borderRadius: 16, cursor: 'pointer', fontSize: 13 },
  error: { color: '#ff6b6b', textAlign: 'center', marginBottom: 16 },
  centerMsg: { color: '#888', textAlign: 'center', padding: '60px 0' },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  item: { display: 'flex', alignItems: 'center', gap: 12, background: '#161625', border: '1px solid #2a2a3e', borderRadius: 12, padding: 14, cursor: 'pointer' },
  itemUnread: { borderColor: '#FF6B9D', background: '#1e1526' },
  icon: { fontSize: 22 },
  itemText: { color: '#eee', fontSize: 14 },
  itemTime: { color: '#777', fontSize: 12, marginTop: 4 },
  removeBtn: { background: 'transparent', border: 'none', color: '#666', fontSize: 14, cursor: 'pointer', padding: 4 }
};
