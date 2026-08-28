// pages/notifications.jsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { useTranslation } from '../lib/i18n';

function describe(notification, t) {
  const p = notification.payload || {};
  switch (notification.type) {
    case 'new_match':
      return { icon: '❤️', text: t('notifications.newMatch'), href: '/matches' };
    case 'super_liked':
      return { icon: '⭐', text: `${p.fromName || t('notifications.someoneFallback')} ${t('notifications.superLikedYou')}`, href: '/matches' };
    case 'new_message':
      return { icon: '💬', text: `${p.senderName || t('notifications.someoneFallback')} ${t('notifications.sentMessage')} "${p.preview || ''}"`, href: p.senderId ? `/chat/${p.senderId}` : '/chat' };
    case 'gift_received':
      return { icon: '🎁', text: `${t('notifications.youReceived')} ${p.quantity || 1}x ${p.giftName || t('notifications.giftFallback')}!`, href: '/wallet' };
    case 'level_up':
      return { icon: '⭐', text: `${t('notifications.levelUpTo')} ${p.newLevel}${p.badge ? ` ${t('notifications.earnedBadgePrefix')} "${p.badge}" ${t('notifications.earnedBadgeSuffix')}` : ''}`, href: '/profile' };
    case 'daily_reward_claimed':
      return { icon: '🎁', text: `${t('notifications.dailyRewardClaimed')} +${p.coins || 0} ${t('notifications.coinsWord')} (${p.streak || 1}-${t('notifications.dayStreak')})`, href: '/rewards' };
    case 'membership_bonus':
      return { icon: '💎', text: `${t('notifications.yourWord')} ${(p.tier || '').toUpperCase()} ${t('notifications.monthlyBonusArrived')} +${p.coins || 0} ${t('notifications.coinsWord')}!`, href: '/wallet' };
    case 'mission_claimed':
      return { icon: '🎯', text: `${t('notifications.missionComplete')} ${p.title || t('notifications.missionFallback')} — +${p.coins || 0} ${t('notifications.coinsWord')}${p.xp ? `, +${p.xp} ${t('notifications.xpWord')}` : ''}`, href: '/missions' };
    case 'withdrawal_approved':
      return { icon: '✅', text: `${t('notifications.yourWithdrawalOf')} ${p.coins || 0} ${t('notifications.coinsWord')} ($${((p.usdCents || 0) / 100).toFixed(2)}) ${t('notifications.wasApproved')}`, href: '/wallet' };
    case 'withdrawal_rejected':
      return { icon: '❌', text: `${t('notifications.yourWithdrawalOf')} ${p.coins || 0} ${t('notifications.coinsWord')} ${t('notifications.wasRejected')}`, href: '/wallet' };
    case 'withdrawal_paid':
      return { icon: '💵', text: `${t('notifications.yourWithdrawalOf')} $${((p.usdCents || 0) / 100).toFixed(2)} ${t('notifications.hasBeenPaid')}`, href: '/wallet' };
    default:
      return { icon: '🔔', text: notification.type?.replace(/_/g, ' ') || t('notifications.notificationFallback'), href: null };
  }
}

function timeAgo(dateStr, t) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return t('notifications.justNow');
  if (mins < 60) return `${mins}${t('notifications.minAgo')}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}${t('notifications.hAgo')}`;
  const days = Math.floor(hrs / 24);
  return `${days}${t('notifications.dAgo')}`;
}

export default function Notifications() {
  const { t } = useTranslation();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAll, setMarkingAll] = useState(false);

  const load = async () => {
    if (!localStorage.getItem('accessToken')) {
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/notifications?limit=50');
      if (!res.ok) throw new Error(t('notifications.errorLoad'));
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
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
    } catch {}
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await apiFetch('/notifications/mark-all-read', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {} finally {
      setMarkingAll(false);
    }
  };

  const removeNotification = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Layout>
      <div style={s.page}>
        <div style={s.header}>
          <h1 style={s.title}>{t('notifications.title')}</h1>
          {unreadCount > 0 && (
            <button style={s.markAllBtn} onClick={markAllRead} disabled={markingAll}>
              {markingAll ? t('notifications.markingEllipsis') : `${t('notifications.markAllRead')} (${unreadCount})`}
            </button>
          )}
        </div>

        {error && <div style={s.error}>{error}</div>}

        {loading ? (
          <div style={s.centerMsg}>{t('common.loading')}</div>
        ) : notifications.length === 0 ? (
          <div style={s.centerMsg}>
            <div style={{ fontSize: 48 }}>🔔</div>
            <p>{t('notifications.allCaughtUp')}</p>
          </div>
        ) : (
          <div style={s.list}>
            {notifications.map((n) => {
              const { icon, text, href } = describe(n, t);
              const content = (
                <div style={{ ...s.item, ...(n.is_read ? {} : s.itemUnread) }} onClick={() => !n.is_read && markRead(n.id)}>
                  <span style={s.icon}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={s.itemText}>{text}</div>
                    <div style={s.itemTime}>{timeAgo(n.created_at, t)}</div>
                  </div>
                  <button
                    style={s.removeBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeNotification(n.id);
                    }}
                    aria-label={t('notifications.dismiss')}
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
  itemUnread: { borderColor: '#ff3f9d', background: '#1e1526' },
  icon: { fontSize: 22 },
  itemText: { color: '#eee', fontSize: 14 },
  itemTime: { color: '#777', fontSize: 12, marginTop: 4 },
  removeBtn: { background: 'transparent', border: 'none', color: '#666', fontSize: 14, cursor: 'pointer', padding: 4 }
};
