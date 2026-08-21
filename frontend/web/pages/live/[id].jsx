import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const API = 'https://api.amoramatch.one';
const WS = 'wss://api.amoramatch.one/ws';

export default function LiveRoom() {
  const router = useRouter();
  const { id } = router.query;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [giftCatalog, setGiftCatalog] = useState([]);
  const [showGiftPicker, setShowGiftPicker] = useState(false);
  const [socket, setSocket] = useState(null);
  const chatContainerRef = useRef(null);
  const videoContainerRef = useRef(null);
  const livekitRoomRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (!id) return;
    let ws;
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
        setIsHost(data.host?.id === currentUserId);
        setViewerCount(data.viewer_count || 0);
        setChatMessages(data.messages || []);
        setGiftCatalog(gifts || []);
        setLoading(false);

        await fetch(`${API}/live/${id}/join`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });

        ws = new WebSocket(WS);
        ws.onopen = () => {
          ws.send(JSON.stringify({ type: 'authenticate', token }));
          ws.send(JSON.stringify({ type: 'join-live', roomId: id }));
        };
        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'new-chat') setChatMessages(prev => [...prev, msg.message]);
            if (msg.type === 'viewer-count') setViewerCount(msg.count);
            if (msg.type === 'gift-animation') setChatMessages(prev => [...prev, { id: `gift-${Date.now()}`, system: true, message: `🎁 ${msg.transaction?.sender?.display_name || 'Someone'} sent ${msg.transaction?.gift?.name || 'a gift'}!` }]);
          } catch {}
        };
        setSocket(ws);

        // Real LiveKit video: the backend issues a short-lived role-aware token.
        const connectLiveKit = async () => {
          const waitForClient = async () => {
            for (let i = 0; i < 30; i++) {
              if (window.LivekitClient) return window.LivekitClient;
              await new Promise(r => setTimeout(r, 200));
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
            element.style.width = '100%'; element.style.height = '100%'; element.style.objectFit = 'contain';
            videoContainerRef.current?.appendChild(element);
            setVideoReady(true);
          });
          livekitRoom.on(LK.RoomEvent.TrackUnsubscribed, (track) => track.detach().forEach(el => el.remove()));
          await livekitRoom.connect(tokenData.url, tokenData.token);
          if (tokenData.role === 'host') {
            const tracks = await LK.createLocalTracks({ audio: true, video: true });
            for (const track of tracks) {
              await livekitRoom.localParticipant.publishTrack(track);
              if (track.kind === 'video') {
                const element = track.attach();
                element.style.width = '100%'; element.style.height = '100%'; element.style.objectFit = 'contain';
                videoContainerRef.current?.appendChild(element);
                setVideoReady(true);
              }
            }
          }
          for (const publication of livekitRoom.remoteParticipants.values()) {
            for (const pub of publication.trackPublications.values()) if (pub.track) {
              const element = pub.track.attach();
              element.style.width = '100%'; element.style.height = '100%'; element.style.objectFit = 'contain';
              videoContainerRef.current?.appendChild(element);
              setVideoReady(true);
            }
          }
        };
        connectLiveKit().catch(err => console.warn('LiveKit connection unavailable:', err.message));
      } catch (e) {
        if (active) { setError(e.message); setLoading(false); }
      }
    };
    load();

    return () => {
      active = false;
      if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'leave-live', roomId: id }));
      if (ws) ws.close();
      if (livekitRoomRef.current) { livekitRoomRef.current.disconnect(); livekitRoomRef.current = null; }
      const token = localStorage.getItem('accessToken');
      if (token) fetch(`${API}/live/${id}/leave`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    };
  }, [id]);

  useEffect(() => {
    if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [chatMessages]);

  const sendMessage = (e) => {
    e.preventDefault();
    const message = messageInput.trim();
    if (!message || !socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: 'live-chat', roomId: id, message }));
    setMessageInput('');
  };

  const sendGift = async (giftId) => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${API}/gifts/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ giftId, roomId: id, idempotencyKey: crypto.randomUUID() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gift failed');
      setShowGiftPicker(false);
    } catch (e) { setError(e.message); }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: '#0f0f1a', color: '#fff', display: 'grid', placeItems: 'center' }}>Loading live room…</div>;
  if (error || !room) return <div style={{ minHeight: '100vh', background: '#0f0f1a', color: '#fff', display: 'grid', placeItems: 'center' }}><div><p style={{ color: '#ff6b6b' }}>{error || 'Room not found'}</p><Link href="/discover" style={{ color: '#FF6B9D' }}>← Back</Link></div></div>;

  const playbackUrl = room.settings?.playback_url || room.settings?.hls_url || room.settings?.playbackUrl;

  return (
    <div style={{ height: '100vh', background: '#0f0f1a', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ flex: 2, background: '#000', position: 'relative', minWidth: 0 }}>
          <div ref={videoContainerRef} style={{ width: '100%', height: '100%', background: '#050509', position: 'relative', display: 'grid', placeItems: 'center' }}>
            {!videoReady && playbackUrl && <video src={playbackUrl} autoPlay controls playsInline style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />}
            {!videoReady && !playbackUrl && <div style={{ textAlign: 'center', padding: 30 }}><div style={{ fontSize: 64 }}>📺</div><h2>{room.title}</h2><p style={{ color: '#aaa' }}>{isHost ? 'Connecting your camera and microphone…' : 'Waiting for the host video…'}</p><p style={{ color: '#666', fontSize: 13 }}>LiveKit must be configured on Railway with LIVEKIT_URL, LIVEKIT_API_KEY and LIVEKIT_API_SECRET.</p></div>}
          </div>
          <span style={{ position: 'absolute', top: 16, left: 16, background: '#e22', padding: '5px 10px', borderRadius: 6, fontWeight: 700 }}>🔴 LIVE</span>
          <span style={{ position: 'absolute', top: 16, right: 16, background: '#222c', padding: '5px 10px', borderRadius: 6 }}>👁 {viewerCount}</span>
        </div>

        <aside style={{ width: 360, maxWidth: '40vw', background: '#151522', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 16, borderBottom: '1px solid #29293a' }}><strong>{room.host?.display_name || room.host?.username}</strong><div style={{ color: '#888', fontSize: 13 }}>{room.category}</div></div>
          <div ref={chatContainerRef} style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
            {chatMessages.map((m, i) => <div key={m.id || i} style={{ marginBottom: 10, color: m.system ? '#ffd166' : '#ddd' }}><strong>{m.user?.display_name || m.username || ''}</strong>{m.user?.display_name || m.username ? ': ' : ''}{m.message}</div>)}
          </div>
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid #29293a' }}>
            <input value={messageInput} onChange={e => setMessageInput(e.target.value)} placeholder="Say something…" style={{ flex: 1, background: '#222235', border: 0, borderRadius: 10, color: '#fff', padding: '11px 12px' }} />
            <button type="submit" style={{ background: '#FF6B9D', color: '#fff', border: 0, borderRadius: 10, padding: '0 16px' }}>Send</button>
          </form>
          <div style={{ padding: 12, borderTop: '1px solid #29293a', position: 'relative' }}>
            <button onClick={() => setShowGiftPicker(v => !v)} style={{ width: '100%', padding: 12, border: 0, borderRadius: 10, background: '#ffb347', fontWeight: 700 }}>🎁 Send paid gift</button>
            {showGiftPicker && <div style={{ position: 'absolute', bottom: 70, left: 12, right: 12, background: '#222235', border: '1px solid #444', borderRadius: 12, padding: 10, display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
              {giftCatalog.map(g => <button key={g.id} onClick={() => sendGift(g.id)} style={{ background: '#2c2c42', color: '#fff', border: 0, borderRadius: 10, padding: 10, cursor: 'pointer' }}><div>{g.image_url?.startsWith('http') ? '🎁' : (g.image_url || '🎁')}</div><strong>{g.name}</strong><div style={{ color: '#ffd166' }}>🪙 {g.coin_price}</div></button>)}
            </div>}
          </div>
        </aside>
      </div>
    </div>
  );
}
