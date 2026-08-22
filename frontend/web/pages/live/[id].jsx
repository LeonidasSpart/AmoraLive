import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const API = (process.env.NEXT_PUBLIC_API_URL || 'https://api.amoramatch.one').replace(/\/+$/, '');

let heartId = 0;

export default function LiveRoom() {
  const router = useRouter();
  const { id } = router.query;

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [giftCount, setGiftCount] = useState(0);
  const [giftCatalog, setGiftCatalog] = useState([]);
  const [showGiftPicker, setShowGiftPicker] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [topGifters, setTopGifters] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [ending, setEnding] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [giftAlert, setGiftAlert] = useState(null);

  const chatContainerRef = useRef(null);
  const videoContainerRef = useRef(null);
  const livekitRoomRef = useRef(null);
  const socketRef = useRef(null);

  const spawnHeart = () => {
    const newId = heartId++;
    const left = 10 + Math.random() * 60;
    setFloatingHearts((prev) => [...prev.slice(-20), { id: newId, left }]);
    setTimeout(() => setFloatingHearts((prev) => prev.filter((h) => h.id !== newId)), 2200);
  };

  const loadTopGifters = async (roomId) => {
    try {
      const res = await fetch(`${API}/live/${roomId}/top-gifters`);
      if (res.ok) setTopGifters(await res.json());
    } catch {}
  };

  useEffect(() => {
    if (!id) return;
    let active = true;

    const load = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return router.push('/login');
      try {
        const [roomRes, giftsRes] = await Promise.all([
          fetch(`${API}/live/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/gifts/catalog`)
        ]);
        if (!roomRes.ok) throw new Error('Live room not found');
        const data = await roomRes.json();
        const gifts = giftsRes.ok ? await giftsRes.json() : [];
        if (!active) return;

        setRoom(data);
        const currentUserId = localStorage.getItem('userId');
        const hostIsMe = data.host?.id === currentUserId;
        setIsHost(hostIsMe);
        setViewerCount(data.viewer_count || 0);
        setLikeCount(data.like_count || 0);
        setGiftCount(data.gift_count || 0);
        setChatMessages(data.messages || []);
        setGiftCatalog(gifts || []);
        setLoading(false);
        loadTopGifters(id);

        if (!hostIsMe && data.host?.id) {
          fetch(`${API}/users/${data.host.id}/follow-status`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => { if (active && d) setIsFollowing(d.following); })
            .catch(() => {});
        }

        await fetch(`${API}/live/${id}/join`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });

        const { io } = await import('socket.io-client');
        if (!active) return;
        const socket = io(API, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
          socket.emit('authenticate', token, (ack) => {
            if (!ack?.ok) {
              setError('Your session expired. Please sign in again.');
              return;
            }
            socket.emit('join-live', id);
          });
        });

        socket.on('new-chat', (msg) => active && setChatMessages((prev) => [...prev, msg]));
        socket.on('viewer-count', (payload) => active && setViewerCount(payload.count));
        socket.on('like-count', (payload) => {
          if (!active) return;
          setLikeCount(payload.count);
          spawnHeart();
        });
        socket.on('gift-animation', (tx) => {
          if (!active) return;
          const name = tx.sender?.display_name || tx.sender?.username || 'Someone';
          const giftName = tx.gift?.name || 'a gift';
          setChatMessages((prev) => [...prev, { id: `gift-${Date.now()}`, system: true, message: `🎁 ${name} sent ${giftName}!` }]);
          setGiftCount((prev) => prev + (tx.quantity || 1));
          setGiftAlert(`${name} sent ${tx.quantity > 1 ? `${tx.quantity}x ` : ''}${giftName}!`);
          spawnHeart();
          loadTopGifters(id);
          setTimeout(() => setGiftAlert(null), 3000);
        });
        socket.on('room-ended', () => {
          if (!active) return;
          setError('This stream has ended.');
          setTimeout(() => router.push('/discover'), 1500);
        });

        // Real LiveKit video: the backend issues a short-lived role-aware token.
        const connectLiveKit = async () => {
          const waitForClient = async () => {
            for (let i = 0; i < 30; i++) {
              if (window.LivekitClient) return window.LivekitClient;
              await new Promise((r) => setTimeout(r, 200));
            }
            return null;
          };
          const LK = await waitForClient();
          if (!LK || !active || !videoContainerRef.current) return;
          const tokenRes = await fetch(`${API}/live/${id}/token`, { headers: { Authorization: `Bearer ${token}` } });
          if (!tokenRes.ok) return;
          const tokenData = await tokenRes.json();
          const livekitRoom = new LK.Room({ adaptiveStream: true, dynacast: true });
          livekitRoomRef.current = livekitRoom;
          livekitRoom.on(LK.RoomEvent.TrackSubscribed, (track) => {
            const element = track.attach();
            element.style.width = '100%';
            element.style.height = '100%';
            element.style.objectFit = 'cover';
            videoContainerRef.current?.appendChild(element);
            setVideoReady(true);
          });
          livekitRoom.on(LK.RoomEvent.TrackUnsubscribed, (track) => track.detach().forEach((el) => el.remove()));
          await livekitRoom.connect(tokenData.url, tokenData.token);
          if (tokenData.role === 'host') {
            const tracks = await LK.createLocalTracks({ audio: true, video: true });
            for (const track of tracks) {
              await livekitRoom.localParticipant.publishTrack(track);
              if (track.kind === 'video') {
                const element = track.attach();
                element.style.width = '100%';
                element.style.height = '100%';
                element.style.objectFit = 'cover';
                element.style.transform = 'scaleX(-1)';
                videoContainerRef.current?.appendChild(element);
                setVideoReady(true);
              }
            }
          }
        };
        connectLiveKit();
      } catch (err) {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
      const token = localStorage.getItem('accessToken');
      fetch(`${API}/live/${id}/leave`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
      socketRef.current?.emit('leave-live', id);
      socketRef.current?.disconnect();
      livekitRoomRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [chatMessages]);

  const sendMessage = (e) => {
    e.preventDefault();
    const message = messageInput.trim();
    if (!message) return;
    socketRef.current?.emit('live-chat', { roomId: id, message });
    setMessageInput('');
  };

  const sendLike = () => {
    setLikeCount((c) => c + 1);
    spawnHeart();
    socketRef.current?.emit('live-like', id);
  };

  const sendGift = async (giftId) => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${API}/gifts/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ giftId, roomId: id, idempotencyKey: window.crypto.randomUUID() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gift failed');
      setShowGiftPicker(false);
    } catch (e) {
      setError(e.message);
    }
  };

  const toggleFollow = async () => {
    if (!room?.host?.id) return;
    setFollowBusy(true);
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${API}/users/${room.host.id}/${isFollowing ? 'unfollow' : 'follow'}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setIsFollowing((v) => !v);
    } catch {} finally {
      setFollowBusy(false);
    }
  };

  const endLive = async () => {
    if (!confirm('End this live stream now?')) return;
    setEnding(true);
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${API}/live/${id}/end`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to end this room.');
      }
      router.push('/discover');
    } catch (e) {
      setError(e.message);
      setEnding(false);
    }
  };

  if (loading) return <div style={s.centerPage}>Loading live room…</div>;
  if (!room) return <div style={s.centerPage}><div><p style={{ color: '#ff6b6b' }}>{error || 'Room not found'}</p><Link href="/discover" style={{ color: '#FF6B9D' }}>← Back</Link></div></div>;

  return (
    <div style={s.page}>
      <style>{`
        @keyframes floatUp { 0% { transform: translateY(0) scale(0.6); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(-420px) scale(1.1); opacity: 0; } }
        @keyframes popIn { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>

      <div ref={videoContainerRef} style={s.video}>
        {!videoReady && (
          <div style={{ textAlign: 'center', padding: 30 }}>
            <div style={{ fontSize: 64 }}>📺</div>
            <h2 style={{ margin: '8px 0' }}>{room.title}</h2>
            <p style={{ color: '#aaa' }}>{isHost ? 'Connecting your camera and microphone…' : 'Waiting for the host video…'}</p>
          </div>
        )}
      </div>

      <div style={s.topBar}>
        <Link href="/discover" style={s.closeBtn}>✕</Link>
        <div style={s.hostChip}>
          <div style={s.hostAvatar}>{(room.host?.display_name || room.host?.username || '?')[0]?.toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{room.host?.display_name || room.host?.username}</div>
            <div style={{ fontSize: 11, color: '#ccc' }}>#{room.category}</div>
          </div>
          {!isHost && (
            <button onClick={toggleFollow} disabled={followBusy} style={isFollowing ? s.followingBtn : s.followBtn}>
              {isFollowing ? 'Following' : '+ Follow'}
            </button>
          )}
        </div>
        <div style={s.viewerBadge}>🔴 {viewerCount}</div>
      </div>

      {error && <div style={s.errorBanner}>{error}</div>}
      {giftAlert && <div style={s.giftAlert}>{giftAlert}</div>}

      <div style={s.heartLayer}>
        {floatingHearts.map((h) => (
          <div key={h.id} style={{ ...s.heart, left: `${h.left}%` }}>❤️</div>
        ))}
      </div>

      <div style={s.rightRail}>
        <button onClick={sendLike} style={s.railBtn}>
          <div style={s.railIcon}>❤️</div>
          <div style={s.railCount}>{likeCount}</div>
        </button>
        <button onClick={() => setShowGiftPicker((v) => !v)} style={s.railBtn}>
          <div style={s.railIcon}>🎁</div>
          <div style={s.railCount}>{giftCount}</div>
        </button>
        <button onClick={() => setShowLeaderboard((v) => !v)} style={s.railBtn}>
          <div style={s.railIcon}>🏆</div>
          <div style={s.railCount}>Top</div>
        </button>
        {isHost && (
          <button onClick={endLive} disabled={ending} style={s.railBtn}>
            <div style={s.railIcon}>⏹</div>
            <div style={s.railCount}>{ending ? '…' : 'End'}</div>
          </button>
        )}
      </div>

      {showLeaderboard && (
        <div style={s.leaderboardPanel}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Top gifters this stream</div>
          {topGifters.length === 0 ? (
            <div style={{ color: '#999', fontSize: 13 }}>No gifts yet — be the first!</div>
          ) : (
            topGifters.map((g, i) => (
              <div key={g.user?.id || i} style={s.leaderboardRow}>
                <span style={{ color: '#ffd166', fontWeight: 800, width: 20 }}>#{i + 1}</span>
                <span style={{ flex: 1 }}>{g.user?.display_name || g.user?.username || 'Someone'}</span>
                <span style={{ color: '#ffd166' }}>🪙 {g.totalCoins}</span>
              </div>
            ))
          )}
        </div>
      )}

      {showGiftPicker && (
        <div style={s.giftPicker}>
          {giftCatalog.map((g) => (
            <button key={g.id} onClick={() => sendGift(g.id)} style={s.giftBtn}>
              <div style={{ fontSize: 22 }}>{g.image_url?.startsWith('http') ? <img src={g.image_url} alt={g.name} style={{ width: 28, height: 28 }} /> : (g.image_url || '🎁')}</div>
              <strong style={{ fontSize: 12 }}>{g.name}</strong>
              <div style={{ color: '#ffd166', fontSize: 11 }}>🪙 {g.coin_price}</div>
            </button>
          ))}
        </div>
      )}

      <div style={s.chatOverlay}>
        <div ref={chatContainerRef} style={s.chatFeed}>
          {chatMessages.slice(-30).map((m, i) => (
            <div key={m.id || i} style={{ ...s.chatLine, color: m.system ? '#ffd166' : '#fff' }}>
              {!m.system && <strong>{m.user?.display_name || m.username || ''}: </strong>}
              {m.message}
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} style={s.composer}>
          <input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Say something…"
            style={s.composerInput}
          />
          <button type="submit" style={s.sendBtn}>Send</button>
        </form>
      </div>
    </div>
  );
}

const s = {
  centerPage: { minHeight: '100vh', background: '#0a0a12', color: '#fff', display: 'grid', placeItems: 'center', fontFamily: 'sans-serif' },
  page: { position: 'relative', height: '100vh', maxWidth: 480, margin: '0 auto', background: '#000', overflow: 'hidden', fontFamily: 'sans-serif', color: '#fff' },
  video: { position: 'absolute', inset: 0, background: '#0a0a12', display: 'grid', placeItems: 'center', overflow: 'hidden' },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, padding: '16px 12px', display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(rgba(0,0,0,0.6), transparent)', zIndex: 3 },
  closeBtn: { color: '#fff', textDecoration: 'none', fontSize: 20, width: 32, height: 32, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: '50%' },
  hostChip: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.35)', borderRadius: 20, padding: '6px 10px', flex: 1, minWidth: 0 },
  hostAvatar: { width: 30, height: 30, borderRadius: '50%', background: '#FF6B9D', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 },
  followBtn: { background: '#FF6B9D', color: '#fff', border: 0, borderRadius: 12, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginLeft: 4 },
  followingBtn: { background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12, padding: '4px 10px', fontSize: 11, cursor: 'pointer', marginLeft: 4 },
  viewerBadge: { background: 'rgba(0,0,0,0.4)', borderRadius: 14, padding: '6px 12px', fontSize: 12, fontWeight: 700, flexShrink: 0 },
  errorBanner: { position: 'absolute', top: 66, left: 12, right: 12, background: 'rgba(90,20,20,0.85)', color: '#f88', padding: '8px 12px', borderRadius: 8, fontSize: 13, zIndex: 4, textAlign: 'center' },
  giftAlert: { position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,209,102,0.95)', color: '#3a2a00', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 800, zIndex: 4, animation: 'popIn 0.25s ease-out', whiteSpace: 'nowrap' },
  heartLayer: { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 },
  heart: { position: 'absolute', bottom: 100, fontSize: 26, animation: 'floatUp 2.2s ease-out forwards' },
  rightRail: { position: 'absolute', right: 10, bottom: 150, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', zIndex: 3 },
  railBtn: { background: 'transparent', border: 0, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer' },
  railIcon: { width: 46, height: 46, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', fontSize: 22 },
  railCount: { fontSize: 11, fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.8)' },
  leaderboardPanel: { position: 'absolute', right: 70, bottom: 150, width: 220, background: 'rgba(15,15,26,0.92)', border: '1px solid #333', borderRadius: 14, padding: 14, zIndex: 4 },
  leaderboardRow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '4px 0' },
  giftPicker: { position: 'absolute', left: 12, right: 70, bottom: 150, background: 'rgba(15,15,26,0.92)', border: '1px solid #333', borderRadius: 14, padding: 10, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxHeight: 240, overflowY: 'auto', zIndex: 4 },
  giftBtn: { background: 'rgba(255,255,255,0.06)', color: '#fff', border: 0, borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  chatOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 12px 16px', background: 'linear-gradient(transparent, rgba(0,0,0,0.75) 60%)', zIndex: 2 },
  chatFeed: { maxHeight: 130, overflowY: 'auto', marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 4 },
  chatLine: { fontSize: 13, lineHeight: 1.3, textShadow: '0 1px 3px rgba(0,0,0,0.6)' },
  composer: { display: 'flex', gap: 8 },
  composerInput: { flex: 1, background: 'rgba(255,255,255,0.15)', border: 0, borderRadius: 20, color: '#fff', padding: '10px 14px', fontSize: 13 },
  sendBtn: { background: '#FF6B9D', color: '#fff', border: 0, borderRadius: 20, padding: '0 18px', fontWeight: 700, cursor: 'pointer' }
};
