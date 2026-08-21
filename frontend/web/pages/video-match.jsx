import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const API = (process.env.NEXT_PUBLIC_API_URL || 'https://api.amoramatch.one').replace(/\/+$/, '');

// Phases: idle -> connecting -> queued -> paired -> deciding -> result
export default function VideoMatch() {
  const router = useRouter();
  const [phase, setPhase] = useState('connecting');
  const [error, setError] = useState('');
  const [peerPreview, setPeerPreview] = useState(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [myDecision, setMyDecision] = useState(null);
  const [result, setResult] = useState(null); // { matched, peer }
  const [liveKitAvailable, setLiveKitAvailable] = useState(true);

  const socketRef = useRef(null);
  const livekitRoomRef = useRef(null);
  const sessionIdRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const countdownRef = useRef(null);

  const clearCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = null;
  };

  const startCountdown = (deadline) => {
    clearCountdown();
    const tick = () => setRemainingMs(Math.max(0, deadline - Date.now()));
    tick();
    countdownRef.current = setInterval(tick, 250);
  };

  const teardownLiveKit = useCallback(() => {
    if (livekitRoomRef.current) {
      livekitRoomRef.current.disconnect();
      livekitRoomRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.innerHTML = '';
    if (remoteVideoRef.current) remoteVideoRef.current.innerHTML = '';
  }, []);

  const connectLiveKit = useCallback(async (liveKit, roomName) => {
    const LK = window.LivekitClient;
    if (!LK || !liveKit) {
      setLiveKitAvailable(false);
      return;
    }
    try {
      const room = new LK.Room({ adaptiveStream: true, dynacast: true });
      livekitRoomRef.current = room;
      room.on(LK.RoomEvent.TrackSubscribed, (track) => {
        if (track.kind !== 'video' && track.kind !== 'audio') return;
        const el = track.attach();
        if (track.kind === 'video' && remoteVideoRef.current) {
          el.style.width = '100%';
          el.style.height = '100%';
          el.style.objectFit = 'cover';
          remoteVideoRef.current.innerHTML = '';
          remoteVideoRef.current.appendChild(el);
        }
      });
      await room.connect(liveKit.url, liveKit.token);
      const tracks = await LK.createLocalTracks({ audio: true, video: true });
      for (const track of tracks) {
        await room.localParticipant.publishTrack(track);
        if (track.kind === 'video' && localVideoRef.current) {
          const el = track.attach();
          el.style.width = '100%';
          el.style.height = '100%';
          el.style.objectFit = 'cover';
          localVideoRef.current.innerHTML = '';
          localVideoRef.current.appendChild(el);
        }
      }
    } catch (e) {
      console.error('LiveKit connect failed:', e);
      setLiveKitAvailable(false);
    }
  }, []);

  const joinQueue = useCallback(() => {
    setError('');
    setResult(null);
    setMyDecision(null);
    setPeerPreview(null);
    teardownLiveKit();
    setPhase('queued');
    socketRef.current?.emit('video_match:queue_join');
  }, [teardownLiveKit]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    let socket;
    let active = true;

    (async () => {
      // socket.io-client is loaded lazily so this page never blocks
      // server-side rendering / the initial bundle for pages that don't
      // need real-time video matching.
      const { io } = await import('socket.io-client');
      if (!active) return;
      socket = io(API, { transports: ['websocket'], autoConnect: true });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('authenticate', token, (ack) => {
          if (!active) return;
          if (!ack?.ok) {
            setError('Your session expired. Please sign in again.');
            setPhase('idle');
            return;
          }
          joinQueue();
        });
      });

      socket.on('connect_error', () => {
        if (active) setError('Unable to connect. Check your connection and try again.');
      });

      socket.on('video_match:queued', () => {
        if (active) setPhase('queued');
      });

      socket.on('video_match:paired', async (payload) => {
        if (!active) return;
        sessionIdRef.current = payload.sessionId;
        setPeerPreview(payload.peerPreview);
        setPhase('paired');
        startCountdown(payload.deadline);
        await connectLiveKit(payload.liveKit, payload.roomName);
      });

      socket.on('video_match:decide_now', (payload) => {
        if (!active) return;
        setPhase('deciding');
        startCountdown(payload.deadline);
      });

      socket.on('video_match:peer_left', () => {
        if (active) setError('The other person left the video match.');
      });

      socket.on('video_match:result', (payload) => {
        if (!active) return;
        clearCountdown();
        teardownLiveKit();
        setResult(payload);
        setPhase('result');
      });

      socket.on('video_match:error', (payload) => {
        if (active) setError(payload?.error || 'Video match is unavailable right now.');
      });
    })();

    return () => {
      active = false;
      clearCountdown();
      teardownLiveKit();
      socket?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const decide = (decision) => {
    if (myDecision) return;
    setMyDecision(decision);
    socketRef.current?.emit('video_match:decide', { sessionId: sessionIdRef.current, decision });
  };

  const seconds = Math.ceil(remainingMs / 1000);

  return (
    <div style={s.page}>
      <header style={s.header}>
        <Link href="/discover" style={s.back}>← Back</Link>
        <span style={s.title}>Video Match</span>
        {(phase === 'paired' || phase === 'deciding') && (
          <span style={{ ...s.timer, background: seconds <= 3 ? '#ff4444' : '#2a2a3e' }}>{seconds}s</span>
        )}
      </header>

      {error && <div style={s.error}>{error}</div>}

      {phase === 'connecting' && <div style={s.centerMsg}>Connecting…</div>}
      {phase === 'queued' && (
        <div style={s.centerMsg}>
          <div style={s.pulse} />
          Finding someone to match with…
        </div>
      )}

      {(phase === 'paired' || phase === 'deciding') && (
        <div style={s.videoStage}>
          <div style={s.remoteBox} ref={remoteVideoRef}>
            {!liveKitAvailable && (
              <div style={s.fallback}>
                <div style={{ fontSize: 40 }}>🎥</div>
                <p>{peerPreview?.age ? `${peerPreview.age} · ` : ''}{peerPreview?.location || 'Someone new'}</p>
                {peerPreview?.interests?.length > 0 && (
                  <p style={{ color: '#999', fontSize: 13 }}>{peerPreview.interests.join(' · ')}</p>
                )}
              </div>
            )}
          </div>
          <div style={s.localBox} ref={localVideoRef} />

          {phase === 'deciding' && (
            <div style={s.actions}>
              <button style={s.pass} onClick={() => decide('pass')} disabled={!!myDecision}>✕</button>
              <button style={s.like} onClick={() => decide('like')} disabled={!!myDecision}>❤️</button>
            </div>
          )}
          {phase === 'deciding' && myDecision && (
            <p style={s.waitingText}>Waiting for the other person to decide…</p>
          )}
          {phase === 'paired' && <p style={s.infoText}>Say hi! You'll decide whether to match once time's up.</p>}
        </div>
      )}

      {phase === 'result' && (
        <div style={s.centerMsg}>
          {result?.matched ? (
            <>
              <div style={{ fontSize: 48 }}>🎉</div>
              <h2 style={{ color: '#fff' }}>It's a match!</h2>
              <p style={{ color: '#aaa' }}>{result.peer?.display_name || result.peer?.username}</p>
              <button style={s.primaryBtn} onClick={() => router.push(`/chat/${result.peer.id}`)}>
                Start chatting
              </button>
            </>
          ) : (
            <>
              <p style={{ color: '#aaa' }}>No match this time.</p>
              <button style={s.primaryBtn} onClick={joinQueue}>Find another</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0f0f1a', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', padding: 20 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid #222' },
  back: { color: '#888', textDecoration: 'none' },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  timer: { padding: '6px 16px', borderRadius: 20, color: '#fff', fontWeight: 'bold' },
  error: { color: '#ff6b6b', textAlign: 'center', marginTop: 12 },
  centerMsg: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa', gap: 12, textAlign: 'center' },
  pulse: { width: 60, height: 60, borderRadius: '50%', border: '3px solid #FF6B9D', borderTopColor: 'transparent', animation: 'amora-spin 1s linear infinite' },
  videoStage: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', marginTop: 20 },
  remoteBox: { width: '100%', maxWidth: 600, aspectRatio: '4 / 3', background: '#000', borderRadius: 16, overflow: 'hidden', border: '2px solid #333', position: 'relative' },
  localBox: { width: 120, aspectRatio: '3 / 4', background: '#000', borderRadius: 12, overflow: 'hidden', border: '2px solid #333', position: 'absolute', bottom: 90, right: 'calc(50% - 300px + 16px)' },
  fallback: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' },
  actions: { display: 'flex', gap: 40, marginTop: 24 },
  pass: { width: 64, height: 64, borderRadius: '50%', border: 'none', background: '#444', color: '#fff', fontSize: 28, cursor: 'pointer' },
  like: { width: 72, height: 72, borderRadius: '50%', border: 'none', background: '#FF6B9D', color: '#fff', fontSize: 32, cursor: 'pointer' },
  waitingText: { color: '#888', marginTop: 12, fontSize: 13 },
  infoText: { color: '#888', marginTop: 12, fontSize: 13 },
  primaryBtn: { marginTop: 16, padding: '10px 28px', borderRadius: 8, border: 'none', background: '#FF6B9D', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }
};
