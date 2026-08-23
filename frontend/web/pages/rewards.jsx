import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';

export default function Rewards() {
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
      if (!statusRes.ok) throw new Error('Unable to load rewards');
      setStatus(await statusRes.json());
      if (historyRes.ok) setHistory(await historyRes.json());
    } catch (e) {
      setError(e.message || 'Unable to load rewards');
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
      if (!res.ok) throw new Error(data.error || 'Unable to claim reward');
      setMessage(`+${Number(data.coinsAwarded || 0).toLocaleString()} coins added to your wallet.`);
      await load();
    } catch (e) {
      setError(e.message || 'Unable to claim reward');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return <Layout><div className="amora-rewards-page"><div className="amora-loading-state"><div><div className="amora-spinner" /><p>Loading your rewards…</p></div></div></div></Layout>;

  const calendar = status?.calendar || [];
  const next = status?.nextReward;

  return (
    <Layout>
      <div className="amora-rewards-page">
        <section className="amora-rewards-hero">
          <div>
            <span className="amora-kicker">DAILY AMORA REWARDS</span>
            <h1>Come back. <span className="amora-gradient-text">Get rewarded.</span></h1>
            <p>Keep your streak alive and collect coins every day. Milestones unlock bigger moments.</p>
            <div className="amora-reward-hero-stats">
              <div><strong>{status?.currentStreak || 0}</strong><span>Current streak</span></div>
              <div><strong>{status?.bestStreak || 0}</strong><span>Best streak</span></div>
              <div><strong>{Number(next?.coins || 0).toLocaleString()}</strong><span>Next reward</span></div>
            </div>
          </div>
          <div className="amora-reward-orb" aria-hidden="true"><span>✦</span></div>
        </section>

        {(message || error) && <div className={`amora-reward-message ${error ? 'is-error' : ''}`}>{error || message}</div>}

        <section className="amora-reward-panel">
          <div className="amora-reward-panel-head">
            <div><span className="amora-kicker">YOUR 7-DAY CYCLE</span><h2>Claim your next reward</h2></div>
            <button className="amora-btn amora-btn-primary" onClick={claim} disabled={!status?.canClaimToday || claiming}>
              {claiming ? 'Claiming…' : status?.canClaimToday ? `Claim +${Number(next?.coins || 0).toLocaleString()}` : 'Claimed today'}
            </button>
          </div>
          <div className="amora-reward-calendar">
            {calendar.map((day) => {
              const active = day.day === next?.dayInCycle;
              return <div className={`amora-reward-day ${active ? 'is-next' : ''} ${day.isMilestone ? 'is-milestone' : ''}`} key={day.day}>
                <span>DAY {day.day}</span><strong>{Number(day.coins).toLocaleString()}</strong><small>coins</small>
              </div>;
            })}
          </div>
        </section>

        <section className="amora-reward-history">
          <div><span className="amora-kicker">RECENT ACTIVITY</span><h2>Reward history</h2></div>
          {history.length === 0 ? <div className="amora-empty-card"><p>Your first reward is waiting.</p></div> : (
            <div className="amora-reward-history-list">
              {history.map((item) => <div className="amora-reward-history-row" key={item.id}>
                <div><strong>Day {item.day_number}</strong><span>{new Date(item.claimed_at).toLocaleDateString()}</span></div>
                <b>+{Number(item.coins).toLocaleString()} coins</b>
              </div>)}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
