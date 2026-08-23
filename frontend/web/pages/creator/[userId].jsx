// pages/creator/[userId].jsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { apiFetch } from '../../lib/api';
import VerifiedBadge from '../../components/VerifiedBadge';
import ProfileFrame from '../../components/ProfileFrame';
import GiftIcon from '../../components/GiftIcon';

export default function CreatorProfile() {
  const router = useRouter();
  const { userId } = router.query;

  const [profile, setProfile] = useState(null);
  const [followInfo, setFollowInfo] = useState(null);
  const [giftWall, setGiftWall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followBusy, setFollowBusy] = useState(false);
  const [selfId, setSelfId] = useState(null);

  const load = async () => {
    if (!localStorage.getItem('accessToken')) {
      router.push('/login');
      return;
    }
    if (!userId) return;
    setSelfId(localStorage.getItem('userId'));
    setLoading(true);
    setError('');
    try {
      const [profileRes, followRes, giftsRes] = await Promise.all([
        apiFetch(`/users/${userId}`),
        apiFetch(`/users/${userId}/follow-status`),
        apiFetch(`/users/${userId}/gifts?limit=24`)
      ]);
      if (!profileRes.ok) throw new Error('This profile could not be found.');
      setProfile(await profileRes.json());
      if (followRes.ok) setFollowInfo(await followRes.json());
      if (giftsRes.ok) setGiftWall(await giftsRes.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const toggleFollow = async () => {
    setFollowBusy(true);
    try {
      const res = await apiFetch(`/users/${userId}/${followInfo?.following ? 'unfollow' : 'follow'}`, { method: 'POST' });
      if (res.ok) setFollowInfo(await res.json());
    } catch {} finally {
      setFollowBusy(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={s.wrap}><p style={{ color: '#999' }}>Loading…</p></div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <div style={s.wrap}>
          <p style={{ color: '#ff6b6b' }}>{error || 'Profile not found'}</p>
          <Link href="/discover" style={{ color: '#FF6B9D' }}>← Back to Discover</Link>
        </div>
      </Layout>
    );
  }

  const isSelf = selfId === profile.id;

  return (
    <Layout>
      <div style={s.wrap}>
        <div style={s.cover}>
          {profile.cover_photo && <img src={profile.cover_photo} alt="" style={s.coverImg} />}
        </div>

        <div style={s.headerRow}>
          <ProfileFrame tier={profile.membership_tier} size={112}>
            <div style={s.avatarInner}>
              {profile.profile_photo ? (
                <img src={profile.profile_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 36 }}>{(profile.display_name || profile.username || '?')[0]?.toUpperCase()}</span>
              )}
            </div>
          </ProfileFrame>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h1 style={s.name}>{profile.display_name || profile.username}</h1>
              <VerifiedBadge user={profile} size={18} />
            </div>
            <div style={{ color: '#999', fontSize: 14 }}>@{profile.username} · Level {profile.level || 0}</div>
            <div style={{ color: '#777', fontSize: 12, marginTop: 2 }}>
              {followInfo?.followerCount ?? 0} followers · Member since {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
            </div>
          </div>

          {!isSelf && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={toggleFollow} disabled={followBusy} style={followInfo?.following ? s.followingBtn : s.followBtn}>
                {followInfo?.following ? 'Following' : '+ Follow'}
              </button>
              <Link href={`/chat/${profile.id}`} style={s.messageBtn}>Message</Link>
            </div>
          )}
        </div>

        {profile.isLive && (
          <Link href={`/live/${profile.liveRoomId}`} style={s.liveBanner}>
            🔴 Live now — tap to watch
          </Link>
        )}

        {profile.bio && <p style={s.bio}>{profile.bio}</p>}

        {profile.interests?.length > 0 && (
          <div style={s.chipRow}>
            {profile.interests.map((int) => <span key={int} style={s.chip}>{int}</span>)}
          </div>
        )}

        {profile.badges?.length > 0 && (
          <div style={s.section}>
            <h3 style={s.sectionTitle}>🏅 Achievements</h3>
            <div style={s.chipRow}>
              {profile.badges.map((b) => <span key={b} style={s.badgeChip}>{b}</span>)}
            </div>
          </div>
        )}

        <div style={s.section}>
          <h3 style={s.sectionTitle}>🎁 Gift Wall{giftWall?.totalReceived ? ` — ${giftWall.totalReceived.toLocaleString()} coins received` : ''}</h3>
          {!giftWall || giftWall.gifts.length === 0 ? (
            <p style={{ color: '#777', fontSize: 13 }}>No gifts received yet.</p>
          ) : (
            <div style={s.giftGrid}>
              {giftWall.gifts.map((g) => (
                <div key={g.id} style={s.giftCard}>
                  <GiftIcon name={g.gift?.name} glyph={g.gift?.glyph} rarity={g.gift?.rarity} size={36} />
                  <div style={{ fontSize: 11, color: '#ccc', marginTop: 4, textAlign: 'center' }}>{g.gift?.name}</div>
                  <div style={{ fontSize: 10, color: '#777' }}>from {g.sender?.display_name || g.sender?.username}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

const s = {
  wrap: { maxWidth: 700, margin: '0 auto', padding: '0 16px 24px', color: '#fff' },
  cover: { height: 140, background: 'linear-gradient(135deg, #2a1a3e, #1a1a2e)', borderRadius: '0 0 16px 16px', margin: '0 -16px', overflow: 'hidden' },
  coverImg: { width: '100%', height: '100%', objectFit: 'cover' },
  headerRow: { display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: -50, marginBottom: 16, flexWrap: 'wrap' },
  avatarInner: { width: '100%', height: '100%', borderRadius: '50%', background: '#2a2a3e', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #0a0a12', overflow: 'hidden' },
  name: { fontSize: 22, margin: 0 },
  followBtn: { background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  followingBtn: { background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid #444', borderRadius: 10, padding: '8px 18px', fontSize: 13, cursor: 'pointer' },
  messageBtn: { background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid #333', borderRadius: 10, padding: '8px 18px', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center' },
  liveBanner: { display: 'block', background: 'rgba(255,0,60,0.15)', border: '1px solid #ff3060', color: '#ff6b8a', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 13, textDecoration: 'none', marginBottom: 16, textAlign: 'center' },
  bio: { color: '#ccc', fontSize: 14, lineHeight: 1.5, marginBottom: 12 },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { background: 'rgba(255,255,255,0.06)', border: '1px solid #333', borderRadius: 14, padding: '4px 12px', fontSize: 12, color: '#ccc' },
  badgeChip: { background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.4)', color: '#ffd700', borderRadius: 14, padding: '4px 12px', fontSize: 12 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, color: '#ccc', marginBottom: 10 },
  giftGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 10 },
  giftCard: { background: '#161625', border: '1px solid #2a2a3e', borderRadius: 10, padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }
};
