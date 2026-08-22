// pages/events.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { apiFetch, API } from '../lib/api';

function formatTimeLeft(seconds) {
  if (seconds <= 0) return 'Ended';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

export default function Events() {
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [myTeam, setMyTeam] = useState(null);
  const [scores, setScores] = useState([]);
  const [teamTotals, setTeamTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const socketRef = useRef(null);
  const countdownRef = useRef(null);

  const loadLeaderboard = async (eventId) => {
    const res = await apiFetch(`/events/leaderboard/${eventId}`);
    if (res.ok) {
      const data = await res.json();
      setScores(data.scores || []);
      setTeamTotals(data.teamTotals || {});
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      router.push('/login');
      return;
    }
    let active = true;

    (async () => {
      try {
        const res = await apiFetch('/events/active');
        if (res.status === 404) {
          setEvent(null);
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error('Unable to load the current event.');
        const data = await res.json();
        if (!active) return;
        setEvent(data);
        setMyTeam(data.myTeam);
        setTimeLeft(data.timeLeft);
        await loadLeaderboard(data.id);

        const { io } = await import('socket.io-client');
        if (!active) return;
        const socket = io(API, { transports: ['websocket'] });
        socketRef.current = socket;
        socket.on('connect', () => {
          const token = localStorage.getItem('accessToken');
          socket.emit('authenticate', token, (ack) => {
            if (ack?.ok) socket.emit('join-event', data.id);
          });
        });
        socket.on('leaderboard-update', (payload) => {
          if (!active) return;
          setScores(payload.scores || []);
          setTeamTotals(payload.teamTotals || {});
        });
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      socketRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    countdownRef.current = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(countdownRef.current);
  }, []);

  const joinTeam = async (team) => {
    if (!event) return;
    setJoining(true);
    setError('');
    try {
      const res = await apiFetch('/events/join', {
        method: 'POST',
        body: JSON.stringify({ eventId: event.id, team })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to join this team.');
      setMyTeam(team);
    } catch (e) {
      setError(e.message);
    } finally {
      setJoining(false);
    }
  };

  const totalA = teamTotals[event?.teams?.[0]] || 0;
  const totalB = teamTotals[event?.teams?.[1]] || 0;
  const totalAll = totalA + totalB || 1;

  return (
    <Layout>
      <div style={s.page}>
        {loading ? (
          <div style={s.centerMsg}>Loading…</div>
        ) : !event ? (
          <div style={s.centerMsg}>
            <div style={{ fontSize: 48 }}>🏆</div>
            <p>No live event right now. Check back soon!</p>
          </div>
        ) : (
          <>
            {event.banner_url && <img src={event.banner_url} alt={event.title} style={s.banner} />}
            <h1 style={s.title}>{event.title}</h1>
            {event.description && <p style={s.description}>{event.description}</p>}
            <div style={s.timer}>{formatTimeLeft(timeLeft)}</div>

            {error && <div style={s.error}>{error}</div>}

            {!myTeam ? (
              <div style={s.teamPicker}>
                <p style={{ color: '#aaa' }}>Pick a side to join the battle:</p>
                <div style={s.teamButtons}>
                  {(event.teams || []).map((t) => (
                    <button key={t} style={s.teamBtn} onClick={() => joinTeam(t)} disabled={joining}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={s.myTeamBanner}>You're on Team <strong>{myTeam}</strong> — send gifts to boost your team's score!</div>
            )}

            <div style={s.scoreBar}>
              <div style={{ ...s.scoreBarFill, width: `${(totalA / totalAll) * 100}%` }} />
            </div>
            <div style={s.scoreLabels}>
              <span>{event.teams?.[0]}: {totalA}</span>
              <span>{event.teams?.[1]}: {totalB}</span>
            </div>

            <h3 style={{ marginTop: 32 }}>Top contributors</h3>
            {scores.length === 0 ? (
              <p style={{ color: '#888' }}>No one has scored yet — be the first!</p>
            ) : (
              <div style={s.list}>
                {scores.slice(0, 20).map((sc, i) => (
                  <div key={`${sc.user_id}-${sc.event_id}`} style={s.listItem}>
                    <span style={s.rank}>#{i + 1}</span>
                    <span style={{ flex: 1 }}>{sc.user?.display_name || sc.user?.username}</span>
                    <span style={s.teamTag}>{sc.team_side}</span>
                    <span style={s.points}>{sc.total_gifts_sent + sc.total_gifts_received} pts</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

const s = {
  page: { maxWidth: 640, margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif' },
  centerMsg: { color: '#888', textAlign: 'center', padding: '80px 0' },
  banner: { width: '100%', borderRadius: 16, marginBottom: 16 },
  title: { color: '#fff', fontSize: 26, margin: '0 0 8px' },
  description: { color: '#aaa', fontSize: 14 },
  timer: { display: 'inline-block', background: '#2a2a3e', color: '#ffd45c', padding: '4px 14px', borderRadius: 16, fontWeight: 'bold', fontSize: 13, marginBottom: 16 },
  error: { color: '#ff6b6b', marginBottom: 12 },
  teamPicker: { marginBottom: 20 },
  teamButtons: { display: 'flex', gap: 10, marginTop: 8 },
  teamBtn: { flex: 1, background: '#161625', border: '1px solid #FF6B9D', color: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', padding: '14px 0', borderRadius: 10, fontWeight: 'bold', cursor: 'pointer', fontSize: 15 },
  myTeamBanner: { background: '#1e1526', border: '1px solid #FF6B9D', borderRadius: 10, padding: 12, color: '#eee', marginBottom: 20, fontSize: 14 },
  scoreBar: { height: 10, background: '#2a2a3e', borderRadius: 6, overflow: 'hidden' },
  scoreBarFill: { height: '100%', background: 'linear-gradient(90deg, #FF6B9D, #ff3355)' },
  scoreLabels: { display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: 13, marginTop: 6 },
  list: { display: 'flex', flexDirection: 'column', gap: 6 },
  listItem: { display: 'flex', alignItems: 'center', gap: 10, background: '#161625', border: '1px solid #2a2a3e', borderRadius: 10, padding: 10, fontSize: 13, color: '#eee' },
  rank: { color: '#ffd45c', fontWeight: 'bold', width: 30 },
  teamTag: { color: '#888', fontSize: 11 },
  points: { color: '#FF6B9D', fontWeight: 'bold' }
};
