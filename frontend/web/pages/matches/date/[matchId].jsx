// pages/matches/date/[matchId].jsx
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';

export default function VideoDate() {
  const router = useRouter();
  const { matchId } = router.query;

  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [started, setStarted] = useState(false);
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const roomRef = useRef(null);

  useEffect(() => {
    if (!matchId) return;
    if (!localStorage.getItem('accessToken')) {
      router.push('/login');
      return;
    }
  }, [matchId, router]);

  useEffect(() => {
    if (!matchId || !started) return;
    let active = true;

    const connect = async () => {
      try {
        const waitForClient = async () => {
          for (let i = 0; i < 30; i++) {
            if (window.LivekitClient) return window.LivekitClient;
            await new Promise((r) => setTimeout(r, 200));
          }
          return null;
        };
        const LK = await waitForClient();
        if (!LK) throw new Error('Video could not load — please refresh.');

        const tokenRes = await apiFetch(`/matches/${matchId}/video-date/token`);
        const tokenData = await tokenRes.json().catch(() => ({}));
        if (!tokenRes.ok) throw new Error(tokenData.error || 'Unable to start this video date.');
        if (!active) return;

        const room = new LK.Room({ adaptiveStream: true, dynacast: true });
        roomRef.current = room;

        room.on(LK.RoomEvent.TrackSubscribed, (track) => {
          const element = track.attach();
          element.style.width = '100%';
          element.style.height = '100%';
          element.style.objectFit = 'cover';
          remoteRef.current?.appendChild(element);
        });
        room.on(LK.RoomEvent.TrackUnsubscribed, (track) => track.detach().forEach((el) => el.remove()));

        await room.connect(tokenData.url, tokenData.token);
        setConnected(true);

        const tracks = await LK.createLocalTracks({ audio: true, video: true });
        for (const track of tracks) {
          await room.localParticipant.publishTrack(track);
          if (track.kind === 'video') {
            const element = track.attach();
            element.style.width = '100%';
            element.style.height = '100%';
            element.style.objectFit = 'cover';
            element.style.transform = 'scaleX(-1)';
            localRef.current?.appendChild(element);
          }
        }
      } catch (e) {
        if (active) setError(e.message);
      }
    };

    connect();

    return () => {
      active = false;
      roomRef.current?.disconnect();
    };
  }, [matchId, started]);

  if (!started) {
    return (
      <div style={s.stage}>
        <div style={s.page}>
          <Link href="/matches" style={s.closeBtn}>✕</Link>
          <div style={s.intro}>
            <h2 style={{ margin: 0 }}>Ready for your video date?</h2>
            <p style={{ color: '#aaa', maxWidth: 260, textAlign: 'center' }}>
              This will turn on your camera and microphone so you and your match can see each other.
            </p>
            <button type="button" onClick={() => setStarted(true)} style={s.startBtn}>Start video date</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.stage}>
      <div style={s.page}>
        <Link href="/matches" style={s.closeBtn}>✕</Link>

        <div ref={remoteRef} style={s.remoteVideo}>
          {!error && !connected && <div style={{ color: '#999', textAlign: 'center' }}>Connecting…</div>}
          {error && <div style={{ color: '#ff6b6b', textAlign: 'center', padding: 20 }}>{error}</div>}
        </div>

        <div ref={localRef} style={s.localVideo} />
      </div>
    </div>
  );
}

const s = {
  stage: { position: 'fixed', inset: 0, width: '100vw', height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  page: { position: 'relative', height: '100%', width: 'calc(100vh * 9 / 16)', maxWidth: '100vw', background: '#0a0a12', overflow: 'hidden', fontFamily: 'sans-serif', color: '#fff' },
  closeBtn: { position: 'absolute', top: 16, left: 16, zIndex: 5, color: '#fff', textDecoration: 'none', fontSize: 20, width: 32, height: 32, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', borderRadius: '50%' },
  remoteVideo: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a12' },
  localVideo: { position: 'absolute', bottom: 20, right: 20, width: 100, height: 140, borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.3)', background: '#1a1a2e' },
  intro: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center' },
  startBtn: { marginTop: 8, background: 'linear-gradient(135deg, #ff3f9d 0%, #9b35ff 100%)', border: 'none', color: '#fff', fontWeight: 700, padding: '12px 28px', borderRadius: 30, cursor: 'pointer', fontSize: 14 }
};
