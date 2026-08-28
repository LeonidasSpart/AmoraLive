import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { useTranslation } from '../lib/i18n';

export default function Rewards() {
  const { t } = useTranslation();
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [statusRes, historyRes] = await Promise.all([
        apiFetch('/daily-rewards/status'),
        apiFetch('/daily-rewards/history?limit=14')
      ]);
      if (!statusRes.ok) throw new Error(t('rewards.errorLoad'));
      setStatus(await statusRes.json());
      if (historyRes.ok) setHistory(await historyRes.json());
    } catch (e) {
      setError(e.message || t('rewards.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const claim = async () => {
    if (!status?.canClaimToday || claiming) return;
    setClaiming(true); setError(''); setMessage('');
    try {
      const res = await apiFetch('/daily-rewards/claim', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t('rewards.errorClaim'));
      setMessage(`+${Number(data.coinsAwarded || 0).toLocaleString()} ${t('rewards.coinsAddedSuffix')}`);
      await load();
    } catch (e) {
      setError(e.message || t('rewards.errorClaim'));
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return <Layout><div className="amora-rewards-page"><div className="amora-loading-state"><div><div className="amora-spinner" /><p>{t('rewards.loadingRewards')}</p></div></div></div></Layout>;

  const calendar = status?.calendar || [];
  const next = status?.nextReward;

  return (
    <Layout>
      <div className="amora-rewards-page">
        <section className="amora-rewards-hero">
          <div>
            <span className="amora-kicker">{t('rewards.kicker')}</span>
            <h1>{t('rewards.titleLine1')} <span className="amora-gradient-text">{t('rewards.titleLine2')}</span></h1>
            <p>{t('rewards.subtitle')}</p>
            <div className="amora-reward-hero-stats">
              <div><strong>{status?.currentStreak || 0}</strong><span>{t('rewards.currentStreak')}</span></div>
              <div><strong>{status?.bestStreak || 0}</strong><span>{t('rewards.bestStreak')}</span></div>
              <div><strong>{Number(next?.coins || 0).toLocaleString()}</strong><span>{t('rewards.nextReward')}</span></div>
            </div>
          </div>
          <div className="amora-reward-orb" aria-hidden="true"><span>✦</span></div>
        </section>

        {(message || error) && <div className={`amora-reward-message ${error ? 'is-error' : ''}`}>{error || message}</div>}

        <section className="amora-reward-panel">
          <div className="amora-reward-panel-head">
            <div><span className="amora-kicker">{t('rewards.sevenDayKicker')}</span><h2>{t('rewards.claimNext')}</h2></div>
            <button className="amora-btn amora-btn-primary" onClick={claim} disabled={!status?.canClaimToday || claiming}>
              {claiming ? t('rewards.claiming') : status?.canClaimToday ? `${t('rewards.claimPrefix')} +${Number(next?.coins || 0).toLocaleString()}` : t('rewards.claimedToday')}
            </button>
          </div>
          <div className="amora-reward-calendar">
            {calendar.map((day) => {
              const active = day.day === next?.dayInCycle;
              return <div className={`amora-reward-day ${active ? 'is-next' : ''} ${day.isMilestone ? 'is-milestone' : ''}`} key={day.day}>
                <span>{t('rewards.dayWord')} {day.day}</span><strong>{Number(day.coins).toLocaleString()}</strong><small>{t('rewards.coinsWord')}</small>
              </div>;
            })}
          </div>
        </section>

        <section className="amora-reward-history">
          <div><span className="amora-kicker">{t('rewards.recentActivityKicker')}</span><h2>{t('rewards.historyTitle')}</h2></div>
          {history.length === 0 ? <div className="amora-empty-card"><p>{t('rewards.firstRewardWaiting')}</p></div> : (
            <div className="amora-reward-history-list">
              {history.map((item) => <div className="amora-reward-history-row" key={item.id}>
                <div><strong>{t('rewards.dayNumberPrefix')} {item.day_number}</strong><span>{new Date(item.claimed_at).toLocaleDateString()}</span></div>
                <b>+{Number(item.coins).toLocaleString()} {t('rewards.coinsWord')}</b>
              </div>)}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
