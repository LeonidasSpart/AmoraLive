// pages/missions.jsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { useTranslation } from '../lib/i18n';

const TYPE_ORDER = ['daily', 'weekly', 'lifetime'];

export default function Missions() {
  const { t } = useTranslation();
  const TYPE_LABELS = { daily: t('missions.typeDaily'), weekly: t('missions.typeWeekly'), lifetime: t('missions.typeLifetime') };
  const router = useRouter();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimingKey, setClaimingKey] = useState(null);
  const [toast, setToast] = useState('');

  const load = async () => {
    if (!localStorage.getItem('accessToken')) {
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/missions');
      if (!res.ok) throw new Error(t('missions.errorLoad'));
      setMissions(await res.json());
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

  const claim = async (mission) => {
    setClaimingKey(mission.key);
    setError('');
    try {
      const res = await apiFetch(`/missions/${mission.key}/claim`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t('missions.errorClaim'));
      const badgeKey = `missionsCatalog.${mission.key}.badge`;
      const badgeLabel = t(badgeKey) !== badgeKey ? t(badgeKey) : mission.badge;
      setToast(`+${data.coinsAwarded} ${t('missions.coinsWord')}${data.xpAwarded ? `, +${data.xpAwarded} ${t('missions.xpSuffix')}` : ''}${mission.badge ? ` — "${badgeLabel}" ${t('missions.earnedSuffix')}!` : ''}`);
      setTimeout(() => setToast(''), 3500);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setClaimingKey(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={s.wrap}><p style={{ color: '#999' }}>{t('common.loading')}</p></div>
      </Layout>
    );
  }

  const grouped = TYPE_ORDER.map((type) => ({ type, items: missions.filter((m) => m.type === type) }));

  return (
    <Layout>
      <div style={s.wrap}>
        <h1 style={s.title}>{t('missions.title')}</h1>
        {toast && <div style={s.toast}>{toast}</div>}
        {error && <div style={s.error}>{error}</div>}

        {grouped.map(({ type, items }) => items.length > 0 && (
          <div key={type} style={{ marginBottom: 28 }}>
            <h3 style={s.sectionTitle}>{TYPE_LABELS[type]}</h3>
            <div style={s.grid}>
              {items.map((m) => {
                const pct = Math.min(100, Math.round((m.progress / m.target) * 100));
                const titleKey = `missionsCatalog.${m.key}.title`;
                const descKey = `missionsCatalog.${m.key}.description`;
                const title = t(titleKey) !== titleKey ? t(titleKey) : m.title;
                const description = t(descKey) !== descKey ? t(descKey) : m.description;
                return (
                  <div key={m.key} style={{ ...s.card, opacity: m.claimed ? 0.6 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 24 }}>{m.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>{description}</div>
                      </div>
                    </div>
                    <div style={s.progressTrack}>
                      <div style={{ ...s.progressFill, width: `${pct}%` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ fontSize: 12, color: '#999' }}>{m.progress}/{m.target}</span>
                      <span style={{ fontSize: 12, color: '#ffd166' }}>🪙 {m.reward.coins}{m.reward.xp ? ` · ⭐${m.reward.xp}` : ''}</span>
                    </div>
                    {m.claimed ? (
                      <div style={s.claimedBadge}>{t('missions.claimed')}</div>
                    ) : m.completed ? (
                      <button onClick={() => claim(m)} disabled={claimingKey === m.key} style={s.claimBtn}>
                        {claimingKey === m.key ? t('missions.claiming') : t('missions.claimReward')}
                      </button>
                    ) : (
                      <div style={s.inProgress}>{t('missions.inProgress')}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

const s = {
  wrap: { maxWidth: 900, margin: '0 auto', padding: '24px 16px', color: '#fff' },
  title: { fontSize: 24, marginBottom: 16 },
  toast: { color: '#8f8', background: 'rgba(20,90,20,0.3)', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14 },
  error: { color: '#ff6b6b', background: 'rgba(90,20,20,0.3)', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14 },
  sectionTitle: { fontSize: 15, color: '#ccc', marginBottom: 12 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 },
  card: { background: '#161625', border: '1px solid #2a2a3e', borderRadius: 14, padding: 16 },
  progressTrack: { height: 6, background: '#222', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', borderRadius: 3, transition: 'width 0.4s ease' },
  claimBtn: { width: '100%', marginTop: 10, padding: '8px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  claimedBadge: { textAlign: 'center', marginTop: 10, padding: '8px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: '#8f8', fontSize: 12, fontWeight: 700 },
  inProgress: { textAlign: 'center', marginTop: 10, padding: '8px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', color: '#777', fontSize: 12 }
};
