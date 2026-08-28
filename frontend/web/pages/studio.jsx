// pages/studio.jsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import VerifiedBadge from '../components/VerifiedBadge';
import { useTranslation } from '../lib/i18n';

function formatMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function CreatorStudio() {
  const { t } = useTranslation();
  const router = useRouter();
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [range, setRange] = useState(30);
  const [streams, setStreams] = useState([]);
  const [battleStats, setBattleStats] = useState(null);
  const [supporters, setSupporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = async () => {
    if (!localStorage.getItem('accessToken')) {
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [ov, an, st, bt, sup] = await Promise.all([
        apiFetch('/creator-studio/overview'),
        apiFetch(`/creator-studio/analytics?days=${range}`),
        apiFetch('/creator-studio/streams?limit=10'),
        apiFetch('/creator-studio/battles?limit=5'),
        apiFetch('/creator-studio/top-supporters?limit=8')
      ]);
      if (ov.ok) setOverview(await ov.json());
      if (an.ok) setAnalytics(await an.json());
      if (st.ok) setStreams(await st.json());
      if (bt.ok) setBattleStats(await bt.json());
      if (sup.ok) setSupporters(await sup.json());
    } catch (e) {
      setError(t('studio.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  if (loading) {
    return (
      <Layout>
        <div style={s.wrap}><p style={{ color: '#999' }}>{t('studio.loadingStudio')}</p></div>
      </Layout>
    );
  }

  const maxCoins = Math.max(1, ...analytics.map((d) => d.coinsEarned));
  const maxFollowers = Math.max(1, ...analytics.map((d) => d.newFollowers));

  return (
    <Layout>
      <div style={s.wrap}>
        <h1 style={s.title}>{t('studio.title')}</h1>
        {error && <div style={s.error}>{error}</div>}

        {/* Overview */}
        <div style={s.statGrid}>
          {[
            [t('studio.followers'), overview?.totalFollowers ?? 0],
            [t('studio.newThisWeek'), `+${overview?.newFollowersThisWeek ?? 0}`],
            [t('studio.streams'), overview?.totalStreams ?? 0],
            [t('studio.liveTime'), formatMinutes(overview?.totalLiveMinutes ?? 0)],
            [t('studio.peakViewers'), overview?.peakViewers ?? 0],
            [t('studio.giftsReceived'), overview?.totalGiftsReceived ?? 0],
            [t('studio.earnings'), `🪙 ${overview?.totalEarnings ?? 0}`],
            [t('studio.level'), `${overview?.level ?? 0} (${(overview?.xp ?? 0).toLocaleString()} ${t('levels.xpWord')})`]
          ].map(([label, value]) => (
            <div key={label} style={s.statCard}>
              <div style={s.statValue}>{value}</div>
              <div style={s.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        {/* Quick tools */}
        <div style={s.toolsRow}>
          <Link href="/profile" style={s.toolBtn}>{t('studio.editProfile')}</Link>
          <Link href="/wallet" style={s.toolBtn}>{t('studio.giftHistory')}</Link>
          <Link href="/missions" style={s.toolBtn}>{t('studio.missionsLink')}</Link>
          <Link href="/go-live" style={s.toolBtn}>{t('studio.goLiveLink')}</Link>
        </div>

        {/* Analytics */}
        <div style={s.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={s.sectionTitle}>{t('studio.performance')}</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {[7, 30, 90].map((d) => (
                <button key={d} onClick={() => setRange(d)} style={{ ...s.rangeBtn, ...(range === d ? s.rangeBtnActive : {}) }}>
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <div style={s.chartCard}>
            <div style={s.chartLabel}>{t('studio.coinsEarned')}</div>
            <div style={s.chartRow}>
              {analytics.map((d) => (
                <div key={d.date} title={`${d.date}: ${d.coinsEarned} coins`} style={{ ...s.bar, height: `${Math.max(2, (d.coinsEarned / maxCoins) * 60)}px`, background: 'linear-gradient(180deg, #ff5da8, #9b35ff)' }} />
              ))}
            </div>
          </div>

          <div style={s.chartCard}>
            <div style={s.chartLabel}>{t('studio.newFollowers')}</div>
            <div style={s.chartRow}>
              {analytics.map((d) => (
                <div key={d.date} title={`${d.date}: +${d.newFollowers}`} style={{ ...s.bar, height: `${Math.max(2, (d.newFollowers / maxFollowers) * 60)}px`, background: '#3fa9ff' }} />
              ))}
            </div>
          </div>
        </div>

        {/* Battle record */}
        {battleStats && (battleStats.wins + battleStats.losses + battleStats.draws) > 0 && (
          <div style={s.section}>
            <h3 style={s.sectionTitle}>{t('studio.battleRecord')}</h3>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
              <div style={{ color: '#8f8' }}>{battleStats.wins} {t('studio.wins')}</div>
              <div style={{ color: '#f88' }}>{battleStats.losses} {t('studio.losses')}</div>
              <div style={{ color: '#999' }}>{battleStats.draws} {t('studio.draws')}</div>
            </div>
          </div>
        )}

        {/* Top supporters */}
        <div style={s.section}>
          <h3 style={s.sectionTitle}>{t('studio.topSupporters')}</h3>
          {supporters.length === 0 ? (
            <p style={{ color: '#777', fontSize: 13 }}>{t('studio.noGiftsYet')}</p>
          ) : (
            <div style={s.supporterList}>
              {supporters.map((sup, i) => (
                <div key={sup.user?.id || i} style={s.supporterRow}>
                  <span style={{ color: '#ffd166', fontWeight: 800, width: 24 }}>#{i + 1}</span>
                  <span style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    {sup.user?.display_name || sup.user?.username || t('studio.someoneFallback')}
                    <VerifiedBadge user={sup.user} size={12} />
                  </span>
                  <span style={{ color: '#ffd166' }}>🪙 {sup.totalCoins}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stream history */}
        <div style={s.section}>
          <h3 style={s.sectionTitle}>{t('studio.recentStreams')}</h3>
          {streams.length === 0 ? (
            <p style={{ color: '#777', fontSize: 13 }}>{t('studio.noStreamsYet')}</p>
          ) : (
            <div style={s.streamList}>
              {streams.map((st) => (
                <div key={st.id} style={s.streamRow}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{st.title}</div>
                    <div style={{ color: '#777', fontSize: 11 }}>{new Date(st.start_time).toLocaleDateString()} · {st.durationMinutes != null ? formatMinutes(st.durationMinutes) : '—'}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 12, color: '#999' }}>
                    <div>👁 peak {st.peak_viewer_count}</div>
                    <div>🎁 {st.gift_count}</div>
                  </div>
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
  wrap: { maxWidth: 900, margin: '0 auto', padding: '24px 16px', color: '#fff' },
  title: { fontSize: 24, marginBottom: 16 },
  error: { color: '#ff6b6b', background: 'rgba(90,20,20,0.3)', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14 },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 },
  statCard: { background: '#161625', border: '1px solid #2a2a3e', borderRadius: 12, padding: 14 },
  statValue: { fontSize: 20, fontWeight: 800 },
  statLabel: { fontSize: 11, color: '#999', marginTop: 2 },
  toolsRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 },
  toolBtn: { background: '#161625', border: '1px solid #2a2a3e', borderRadius: 10, padding: '8px 14px', color: '#fff', textDecoration: 'none', fontSize: 13 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, color: '#ccc', margin: 0 },
  rangeBtn: { background: '#161625', border: '1px solid #2a2a3e', color: '#999', borderRadius: 8, padding: '4px 10px', fontSize: 12, cursor: 'pointer' },
  rangeBtnActive: { background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', color: '#fff', border: 'none' },
  chartCard: { background: '#161625', border: '1px solid #2a2a3e', borderRadius: 12, padding: 14, marginBottom: 10 },
  chartLabel: { fontSize: 12, color: '#999', marginBottom: 8 },
  chartRow: { display: 'flex', alignItems: 'flex-end', gap: 2, height: 64, overflowX: 'auto' },
  bar: { flex: 1, minWidth: 3, borderRadius: '2px 2px 0 0' },
  supporterList: { display: 'flex', flexDirection: 'column', gap: 6 },
  supporterRow: { display: 'flex', alignItems: 'center', gap: 8, background: '#161625', border: '1px solid #2a2a3e', borderRadius: 8, padding: '8px 12px', fontSize: 13 },
  streamList: { display: 'flex', flexDirection: 'column', gap: 8 },
  streamRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161625', border: '1px solid #2a2a3e', borderRadius: 10, padding: '10px 14px' }
};
