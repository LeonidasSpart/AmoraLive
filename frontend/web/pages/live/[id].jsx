import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';
import VerifiedBadge from '../../components/VerifiedBadge';
import GiftIcon from '../../components/GiftIcon';
import ProfileFrame from '../../components/ProfileFrame';

const API = (process.env.NEXT_PUBLIC_API_URL || 'https://api.amoramatch.one').replace(/\/+$/, '');

let heartId = 0;

export default function LiveRoom() {
  const router = useRouter();
  const { id } = router.query;

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const mutedIdsRef = useRef(new Set());
  const [messageInput, setMessageInput] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [giftCount, setGiftCount] = useState(0);
  const [giftCatalog, setGiftCatalog] = useState([]);
  const [showGiftPicker, setShowGiftPicker] = useState(false);
  const [giftCategory, setGiftCategory] = useState('romance');
  const [pendingGift, setPendingGift] = useState(null);
  const [sendingGift, setSendingGift] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [topGifters, setTopGifters] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [ending, setEnding] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [battle, setBattle] = useState(null); // { battleId, mySide, endsAt, opponent, scoreA, scoreB }
  const [battleTimeLeft, setBattleTimeLeft] = useState(0);
  const [battleResult, setBattleResult] = useState(null); // { text }
  const [incomingInvite, setIncomingInvite] = useState(null);
  const [outgoingInvite, setOutgoingInvite] = useState(null); // { targetRoomId }
  const [showBattlePicker, setShowBattlePicker] = useState(false);
  const [challengeableRooms, setChallengeableRooms] = useState([]);
  const [giftAlert, setGiftAlert] = useState(null);
  const [shareToast, setShareToast] = useState('');
  const [videoFilter, setVideoFilter] = useState('none');
  const [showFilters, setShowFilters] = useState(false);

  const FILTER_PRESETS = {
    none: { label: 'Normal', css: 'none' },
    warm: { label: 'Warm', css: 'saturate(1.3) sepia(0.15) brightness(1.05)' },
    cool: { label: 'Cool', css: 'saturate(1.1) hue-rotate(-10deg) brightness(1.02) contrast(1.05)' },
    vivid: { label: 'Vivid', css: 'saturate(1.6) contrast(1.15)' },
    bw: { label: 'B&W', css: 'grayscale(1) contrast(1.1)' },
    vintage: { label: 'Vintage', css: 'sepia(0.4) contrast(0.9) brightness(1.05) saturate(0.8)' },
    soft: { label: 'Soft', css: 'brightness(1.08) contrast(0.92) saturate(0.95)' },
    dramatic: { label: 'Dramatic', css: 'contrast(1.35) saturate(1.25) brightness(0.95)' },
    moody: { label: 'Moody', css: 'saturate(0.7) brightness(0.85) hue-rotate(-15deg) contrast(1.1)' },
    bright: { label: 'Bright', css: 'brightness(1.2) saturate(0.9) contrast(0.98)' },
    noir: { label: 'Noir', css: 'grayscale(1) contrast(1.4) brightness(0.9)' },
    sepia: { label: 'Sepia', css: 'sepia(0.85) contrast(1.05) brightness(1.02)' },
    sunset: { label: 'Sunset', css: 'saturate(1.4) hue-rotate(-8deg) sepia(0.2) brightness(1.03)' }
  };

  const chatContainerRef = useRef(null);
  const videoContainerRef = useRef(null);
  const localVideoElRef = useRef(null);
  const opponentVideoRef = useRef(null);
  const livekitRoomRef = useRef(null);
  const opponentLivekitRoomRef = useRef(null);
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

  const disconnectOpponentVideo = () => {
    if (opponentLivekitRoomRef.current) {
      opponentLivekitRoomRef.current.disconnect();
      opponentLivekitRoomRef.current = null;
    }
    if (opponentVideoRef.current) opponentVideoRef.current.innerHTML = '';
  };

  const connectOpponentVideo = async (opponentRoomId) => {
    const LK = window.LivekitClient;
    if (!LK) return;
    // The opponent video container only mounts once `battle` state becomes
    // truthy, which happens asynchronously right before this runs — wait
    // for the ref to actually attach rather than bailing immediately.
    let attempts = 0;
    while (!opponentVideoRef.current && attempts < 25) {
      await new Promise((r) => setTimeout(r, 100));
      attempts++;
    }
    if (!opponentVideoRef.current) return;
    try {
      const tokenRes = await apiFetch(`/live/${opponentRoomId}/token`);
      if (!tokenRes.ok) return;
      const tokenData = await tokenRes.json();
      const opponentRoom = new LK.Room({ adaptiveStream: true, dynacast: true });
      opponentLivekitRoomRef.current = opponentRoom;
      opponentRoom.on(LK.RoomEvent.TrackSubscribed, (track) => {
        const element = track.attach();
        element.style.width = '100%';
        element.style.height = '100%';
        element.style.objectFit = 'cover';
        opponentVideoRef.current?.appendChild(element);
      });
      opponentRoom.on(LK.RoomEvent.TrackUnsubscribed, (track) => track.detach().forEach((el) => el.remove()));
      await opponentRoom.connect(tokenData.url, tokenData.token);
    } catch {}
  };

  const startChallenge = async (targetRoomId) => {
    try {
      const res = await apiFetch(`/live/${id}/battle/invite`, {
        method: 'POST',
        body: JSON.stringify({ targetRoomId })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to send battle invite.');
      setOutgoingInvite({ targetRoomId });
      setShowBattlePicker(false);
    } catch (e) {
      setError(e.message);
    }
  };

  const openBattlePicker = async () => {
    try {
      const res = await apiFetch(`/live?limit=20&sort=viewer_count`);
      if (res.ok) {
        const rooms = await res.json();
        setChallengeableRooms((Array.isArray(rooms) ? rooms : []).filter((r) => r.id !== id));
      }
      setShowBattlePicker(true);
    } catch {
      setShowBattlePicker(true);
    }
  };

  const respondToInvite = async (accept) => {
    if (!incomingInvite) return;
    try {
      await apiFetch(`/live/${id}/battle/${accept ? 'accept' : 'decline'}`, {
        method: 'POST'
      });
    } catch {}
    setIncomingInvite(null);
  };

  useEffect(() => {
    if (!id) return;
    let active = true;

    const load = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return router.push('/login');
      try {
        const [roomRes, giftsRes] = await Promise.all([
          apiFetch(`/live/${id}`),
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

        apiFetch('/safety/muted')
          .then((r) => (r.ok ? r.json() : []))
          .then((muted) => { mutedIdsRef.current = new Set(muted.map((u) => u.id)); })
          .catch(() => {});
        setLikeCount(data.like_count || 0);
        setGiftCount(data.gift_count || 0);
        setChatMessages(data.messages || []);
        setGiftCatalog(gifts || []);
        setLoading(false);
        loadTopGifters(id);

        if (!hostIsMe && data.host?.id) {
          apiFetch(`/users/${data.host.id}/follow-status`)
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => { if (active && d) setIsFollowing(d.following); })
            .catch(() => {});
        }

        await apiFetch(`/live/${id}/join`, { method: 'POST' });

        const { io } = await import('socket.io-client');
        if (!active) return;
        const socket = io(API, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
          // Re-read from storage rather than the `token` closed over above —
          // apiFetch may have already silently refreshed it by this point.
          const currentToken = localStorage.getItem('accessToken');
          socket.emit('authenticate', currentToken, (ack) => {
            if (!ack?.ok) {
              setError('Your session expired. Please sign in again.');
              return;
            }
            socket.emit('join-live', id);
          });
        });

        socket.on('new-chat', (msg) => {
          if (!active || mutedIdsRef.current.has(msg.user?.id)) return;
          setChatMessages((prev) => [...prev, msg]);
        });
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
          setGiftAlert({ senderName: name, quantity: tx.quantity || 1, gift: tx.gift });
          spawnHeart();
          loadTopGifters(id);
          const holdMs = tx.gift?.rarity === 'mythic' || tx.gift?.rarity === 'legendary' ? 5000 : 3000;
          setTimeout(() => setGiftAlert(null), holdMs);
        });
        socket.on('room-ended', () => {
          if (!active) return;
          setError('This stream has ended.');
          setTimeout(() => router.push('/discover'), 1500);
        });

        // ---------- PK battle events ----------
        socket.on('battle:invite', (payload) => {
          if (!active) return;
          setIncomingInvite(payload);
        });
        socket.on('battle:invite_expired', () => {
          if (!active) return;
          setIncomingInvite(null);
          setOutgoingInvite(null);
        });
        socket.on('battle:invite_declined', () => {
          if (!active) return;
          setOutgoingInvite(null);
          setError('Your battle invite was declined.');
        });
        socket.on('battle:invite_cancelled', () => {
          if (!active) return;
          setIncomingInvite(null);
        });
        socket.on('battle:started', async (payload) => {
          if (!active) return;
          setIncomingInvite(null);
          setOutgoingInvite(null);
          setBattle({ ...payload, scoreA: 0, scoreB: 0 });
          setBattleResult(null);
          await connectOpponentVideo(payload.opponent.id);
        });
        socket.on('battle:score', (payload) => {
          if (!active) return;
          setBattle((prev) => (prev && prev.battleId === payload.battleId ? { ...prev, scoreA: payload.scoreA, scoreB: payload.scoreB } : prev));
        });
        socket.on('battle:ended', (payload) => {
          if (!active) return;
          setBattle((prev) => {
            if (!prev || prev.battleId !== payload.battleId) return prev;
            const myScore = prev.mySide === 'a' ? payload.scoreA : payload.scoreB;
            const oppScore = prev.mySide === 'a' ? payload.scoreB : payload.scoreA;
            const text = myScore === oppScore ? "🤝 It's a draw!" : myScore > oppScore ? '🏆 You won the battle!' : '😢 You lost the battle.';
            setBattleResult(text);
            return { ...prev, scoreA: payload.scoreA, scoreB: payload.scoreB };
          });
          disconnectOpponentVideo();
          setTimeout(() => {
            if (active) {
              setBattle(null);
              setBattleResult(null);
            }
          }, 4000);
        });

        // In case a viewer joins a room that's already mid-battle.
        fetch(`${API}/live/${id}/battle`).then((r) => (r.ok ? r.json() : null)).then(async (b) => {
          if (!active || !b?.active) return;
          setBattle({ battleId: b.battleId, mySide: b.mySide, endsAt: b.endsAt, opponent: b.opponent, scoreA: b.scoreA, scoreB: b.scoreB });
          await connectOpponentVideo(b.opponent.id);
        }).catch(() => {});

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
          const tokenRes = await apiFetch(`/live/${id}/token`);
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
            // Requesting a portrait-friendly capture (instead of the
            // browser's landscape default) means less gets cropped away
            // when objectFit:cover fits it into this portrait player —
            // that cropping is what was showing as an overly "zoomed in"
            // picture before.
            const tracks = await LK.createLocalTracks({
              audio: true,
              video: { aspectRatio: 9 / 16, resolution: { width: 720, height: 1280 } }
            });
            for (const track of tracks) {
              await livekitRoom.localParticipant.publishTrack(track);
              if (track.kind === 'video') {
                const element = track.attach();
                element.style.width = '100%';
                element.style.height = '100%';
                element.style.objectFit = 'cover';
                element.style.transform = 'scaleX(-1)';
                videoContainerRef.current?.appendChild(element);
                localVideoElRef.current = element;
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
      apiFetch(`/live/${id}/leave`, { method: 'POST' }, { skipRefresh: true }).catch(() => {});
      socketRef.current?.emit('leave-live', id);
      socketRef.current?.disconnect();
      livekitRoomRef.current?.disconnect();
      opponentLivekitRoomRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [chatMessages]);

  useEffect(() => {
    if (!battle?.endsAt) {
      setBattleTimeLeft(0);
      return;
    }
    const tick = () => setBattleTimeLeft(Math.max(0, Math.ceil((battle.endsAt - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, [battle?.endsAt, battle?.battleId]);

  useEffect(() => {
    if (localVideoElRef.current) {
      localVideoElRef.current.style.filter = FILTER_PRESETS[videoFilter]?.css || 'none';
    }
  }, [videoFilter]);

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

  const confirmSendGift = async () => {
    if (!pendingGift) return;
    setSendingGift(true);
    try {
      const res = await apiFetch(`/gifts/send`, {
        method: 'POST',
        body: JSON.stringify({ giftId: pendingGift.id, roomId: id, idempotencyKey: window.crypto.randomUUID() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gift failed');
      setShowGiftPicker(false);
      setPendingGift(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setSendingGift(false);
    }
  };

  const toggleFollow = async () => {
    if (!room?.host?.id) return;
    setFollowBusy(true);
    try {
      const res = await apiFetch(`/users/${room.host.id}/${isFollowing ? 'unfollow' : 'follow'}`, {
        method: 'POST'
      });
      if (res.ok) setIsFollowing((v) => !v);
    } catch {} finally {
      setFollowBusy(false);
    }
  };

  const shareRoom = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = room?.title ? `${room.title} — live on Amora` : 'Live on Amora';
    if (navigator.share) {
      try {
        await navigator.share({ title, text: title, url });
      } catch {} // user cancelled the native share sheet — not an error
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareToast('Link copied — share it anywhere!');
      setTimeout(() => setShareToast(''), 2500);
    } catch {
      setShareToast(url);
      setTimeout(() => setShareToast(''), 4000);
    }
  };

  const endLive = async () => {
    if (!confirm('End this live stream now?')) return;
    setEnding(true);
    try {
      const res = await apiFetch(`/live/${id}/end`, { method: 'POST' });
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
    <div style={s.stage} className="amora-live-stage">
    <div style={s.page}>
      <style>{`
        @keyframes floatUp { 0% { transform: translateY(0) scale(0.6); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(-420px) scale(1.1); opacity: 0; } }
        @keyframes popIn { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        /* 100vh doesn't account for Safari's dynamic address bar, which was
           pushing the chat/composer below the visible viewport on iOS. A
           plain inline style can't express "use dvh if supported, else vh"
           as one property, so that fallback lives here instead. */
        .amora-live-stage { height: 100vh; }
        @supports (height: 100dvh) {
          .amora-live-stage { height: 100dvh; }
        }
      `}</style>

      <div
        ref={videoContainerRef}
        style={{ ...(battle ? s.videoLeftHalf : s.video), cursor: 'pointer' }}
        onClick={sendLike}
        aria-label="Tap to like"
      >
        {!videoReady && (
          <div style={{ textAlign: 'center', padding: 30 }}>
            <div style={{ fontSize: 64 }}>📺</div>
            <h2 style={{ margin: '8px 0' }}>{room.title}</h2>
            <p style={{ color: '#aaa' }}>{isHost ? 'Connecting your camera and microphone…' : 'Waiting for the host video…'}</p>
          </div>
        )}
      </div>
      {battle && (
        <div ref={opponentVideoRef} style={s.videoRightHalf}>
          <div style={s.opponentLabel}>{battle.opponent?.host?.display_name || battle.opponent?.host?.username}</div>
        </div>
      )}

      {battle && (
        <div style={s.battleBar}>
          <div style={s.battleScoreRow}>
            <span>🔥 {battle.mySide === 'a' ? battle.scoreA : battle.scoreB}</span>
            <span style={s.battleTimer}>{Math.floor(battleTimeLeft / 60)}:{String(battleTimeLeft % 60).padStart(2, '0')}</span>
            <span>{battle.mySide === 'a' ? battle.scoreB : battle.scoreA} 🔥</span>
          </div>
          <div style={s.battleFillTrack}>
            <div style={{
              ...s.battleFill,
              width: `${(() => {
                const mine = battle.mySide === 'a' ? battle.scoreA : battle.scoreB;
                const theirs = battle.mySide === 'a' ? battle.scoreB : battle.scoreA;
                const total = mine + theirs || 1;
                return Math.round((mine / total) * 100);
              })()}%`
            }} />
          </div>
        </div>
      )}
      {battleResult && <div style={s.battleResultBanner}>{battleResult}</div>}

      <div style={s.topBar}>
        <Link href="/discover" style={s.closeBtn}>✕</Link>
        <div style={s.hostChip}>
          <Link href={`/creator/${room.host?.id}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0 }}>
            <ProfileFrame tier={room.host?.membership_tier} size={34}>
              <div style={s.hostAvatar}>{(room.host?.display_name || room.host?.username || '?')[0]?.toUpperCase()}</div>
            </ProfileFrame>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{room.host?.display_name || room.host?.username}<VerifiedBadge user={room.host} size={13} /></div>
              <div style={{ fontSize: 11, color: '#ccc' }}>#{room.category}</div>
            </div>
          </Link>
          {!isHost && (
            <button onClick={toggleFollow} disabled={followBusy} style={isFollowing ? s.followingBtn : s.followBtn}>
              {isFollowing ? 'Following' : '+ Follow'}
            </button>
          )}
        </div>
        <div style={s.viewerBadge}>🔴 {viewerCount}</div>
      </div>

      {error && <div style={s.errorBanner}>{error}</div>}
      {giftAlert && (
        <div style={{ ...s.giftAlert, ...(giftAlert.gift?.rarity === 'mythic' || giftAlert.gift?.rarity === 'legendary' ? s.giftAlertBig : {}) }}>
          <GiftIcon name={giftAlert.gift?.name} glyph={giftAlert.gift?.glyph} rarity={giftAlert.gift?.rarity} size={giftAlert.gift?.rarity === 'mythic' || giftAlert.gift?.rarity === 'legendary' ? 44 : 28} animated />
          <span>{giftAlert.senderName} sent {giftAlert.quantity > 1 ? `${giftAlert.quantity}x ` : ''}{giftAlert.gift?.name || 'a gift'}!</span>
        </div>
      )}
      {outgoingInvite && !battle && <div style={s.errorBanner}>⚔️ Battle invite sent — waiting for a response…</div>}

      {incomingInvite && isHost && !battle && (
        <div style={s.inviteBanner}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>🔥 {incomingInvite.fromHost?.display_name || incomingInvite.fromHost?.username} wants to battle!</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => respondToInvite(true)} style={s.acceptBtn}>Accept</button>
            <button onClick={() => respondToInvite(false)} style={s.declineBtn}>Decline</button>
          </div>
        </div>
      )}

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
        <button onClick={shareRoom} style={s.railBtn}>
          <div style={s.railIcon}>📤</div>
          <div style={s.railCount}>Share</div>
        </button>
        {isHost && (
          <button onClick={() => setShowFilters((v) => !v)} style={s.railBtn}>
            <div style={s.railIcon}>🎨</div>
            <div style={s.railCount}>Filter</div>
          </button>
        )}
        {isHost && !battle && (
          <button onClick={openBattlePicker} style={s.railBtn}>
            <div style={s.railIcon}>⚔️</div>
            <div style={s.railCount}>Battle</div>
          </button>
        )}
        {isHost && battle && (
          <button onClick={async () => {
            await apiFetch(`/live/${id}/battle/end`, { method: 'POST' }).catch(() => {});
          }} style={s.railBtn}>
            <div style={s.railIcon}>⚔️</div>
            <div style={s.railCount}>End</div>
          </button>
        )}
        {isHost && (
          <button onClick={endLive} disabled={ending} style={s.railBtn}>
            <div style={s.railIcon}>⏹</div>
            <div style={s.railCount}>{ending ? '…' : 'End'}</div>
          </button>
        )}
      </div>

      {shareToast && <div style={s.shareToast}>{shareToast}</div>}

      {showFilters && (
        <div style={s.filterPicker}>
          {Object.entries(FILTER_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => setVideoFilter(key)}
              style={{ ...s.filterChip, ...(videoFilter === key ? s.filterChipActive : {}) }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

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
        <div style={s.giftPickerWrap}>
          <div style={s.categoryTabs}>
            {['romance', 'luxury', 'cosmic', 'power', 'fun'].map((cat) => (
              <button
                key={cat}
                onClick={() => setGiftCategory(cat)}
                style={{ ...s.categoryTab, ...(giftCategory === cat ? s.categoryTabActive : {}) }}
              >
                {cat[0].toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          <div style={s.giftPicker}>
            {giftCatalog.filter((g) => g.category === giftCategory).map((g) => (
              <button key={g.id} onClick={() => setPendingGift(g)} style={s.giftBtn}>
                <GiftIcon name={g.name} glyph={g.glyph} rarity={g.rarity} size={40} />
                <strong style={{ fontSize: 12 }}>{g.name}</strong>
                <div style={{ color: '#ffd166', fontSize: 11 }}>🪙 {g.coin_price}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {pendingGift && (
        <div style={s.confirmOverlay} onClick={() => !sendingGift && setPendingGift(null)}>
          <div style={s.confirmPanel} onClick={(e) => e.stopPropagation()}>
            <GiftIcon name={pendingGift.name} glyph={pendingGift.glyph} rarity={pendingGift.rarity} size={72} animated />
            <div style={{ fontWeight: 800, fontSize: 16, marginTop: 8 }}>{pendingGift.name}</div>
            <div style={{ color: '#999', fontSize: 13, marginBottom: 4 }}>to {room.host?.display_name || room.host?.username}</div>
            <div style={{ color: '#ffd166', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>🪙 {pendingGift.coin_price}</div>
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button onClick={() => setPendingGift(null)} disabled={sendingGift} style={s.declineBtn}>Cancel</button>
              <button onClick={confirmSendGift} disabled={sendingGift} style={s.acceptBtn}>{sendingGift ? 'Sending…' : 'Send Gift'}</button>
            </div>
          </div>
        </div>
      )}

      {showBattlePicker && (
        <div style={s.battlePickerOverlay} onClick={() => setShowBattlePicker(false)}>
          <div style={s.battlePickerPanel} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>⚔️ Challenge a live streamer</div>
            {challengeableRooms.length === 0 ? (
              <div style={{ color: '#999', fontSize: 13 }}>No other streamers are live right now.</div>
            ) : (
              <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {challengeableRooms.map((r) => (
                  <button key={r.id} onClick={() => startChallenge(r.id)} style={s.challengeRow}>
                    <span style={{ flex: 1, textAlign: 'left' }}>{r.host?.display_name || r.host?.username} — {r.title}</span>
                    <span style={{ color: '#999', fontSize: 12 }}>👁 {r.viewer_count}</span>
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setShowBattlePicker(false)} style={{ ...s.declineBtn, marginTop: 12, width: '100%' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={s.chatOverlay}>
        <div ref={chatContainerRef} style={s.chatFeed}>
          {chatMessages.slice(-30).map((m, i) => (
            <div key={m.id || i} style={{ ...s.chatLine, color: m.system ? '#ffd166' : '#fff', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              {!m.system && (
                m.user?.id ? (
                  <Link href={`/creator/${m.user.id}`} onClick={(e) => e.stopPropagation()} style={s.chatAvatar}>
                    {m.user?.profile_photo ? (
                      <img src={m.user.profile_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      (m.user?.display_name || m.user?.username || m.username || '?')[0]?.toUpperCase()
                    )}
                  </Link>
                ) : (
                  <div style={s.chatAvatar}>
                    {m.user?.profile_photo ? (
                      <img src={m.user.profile_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      (m.user?.display_name || m.user?.username || m.username || '?')[0]?.toUpperCase()
                    )}
                  </div>
                )
              )}
              <span>
                {!m.system && (
                  <strong>
                    {m.user?.id ? (
                      <Link href={`/creator/${m.user.id}`} onClick={(e) => e.stopPropagation()} style={s.chatNameLink}>
                        {m.user?.display_name || m.user?.username || m.username || ''}
                      </Link>
                    ) : (
                      m.user?.display_name || m.user?.username || m.username || ''
                    )}
                    <VerifiedBadge user={m.user} size={11} />: </strong>
                )}
                {m.message}
              </span>
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
    </div>
  );
}

const s = {
  centerPage: { minHeight: '100vh', background: '#0a0a12', color: '#fff', display: 'grid', placeItems: 'center', fontFamily: 'sans-serif' },
  // TikTok-style letterboxing: the outer stage is always full viewport with
  // a solid black background; the inner page is capped to a 9:16 portrait
  // box. On phones (already taller than 9:16) `maxWidth: 100vw` is what
  // actually constrains it, so it stays full-bleed exactly as before. On a
  // landscape tablet or desktop, `calc(100vh * 9 / 16)` becomes the smaller
  // number and the box centers with black bars on the sides — no JS or
  // media queries needed, this is a pure CSS "contain" calculation.
  stage: { position: 'fixed', inset: 0, width: '100vw', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  page: { position: 'relative', height: '100%', width: 'calc(100vh * 9 / 16)', maxWidth: '100vw', flexShrink: 0, background: '#000', overflow: 'hidden', fontFamily: 'sans-serif', color: '#fff' },
  video: { position: 'absolute', inset: 0, background: '#0a0a12', display: 'grid', placeItems: 'center', overflow: 'hidden' },
  videoLeftHalf: { position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', background: '#0a0a12', display: 'grid', placeItems: 'center', overflow: 'hidden', borderRight: '2px solid #FF6B9D' },
  videoRightHalf: { position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', background: '#0a0a12', display: 'grid', placeItems: 'center', overflow: 'hidden' },
  opponentLabel: { position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8, zIndex: 1 },
  battleBar: { position: 'absolute', top: 64, left: 0, right: 0, zIndex: 5, padding: '0 16px' },
  battleScoreRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', fontWeight: 800, fontSize: 14, textShadow: '0 1px 4px rgba(0,0,0,0.8)', marginBottom: 4 },
  battleTimer: { background: 'rgba(0,0,0,0.6)', borderRadius: 10, padding: '2px 10px', fontSize: 12 },
  battleFillTrack: { height: 6, background: 'rgba(255,255,255,0.25)', borderRadius: 4, overflow: 'hidden' },
  battleFill: { height: '100%', background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)' },
  battleResultBanner: { position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', fontWeight: 800, fontSize: 18, padding: '14px 24px', borderRadius: 16, zIndex: 6, animation: 'popIn 0.3s ease-out' },
  inviteBanner: { position: 'absolute', top: 70, left: 12, right: 12, background: 'rgba(20,20,35,0.95)', border: '1px solid #FF6B9D', borderRadius: 12, padding: 12, zIndex: 5 },
  acceptBtn: { background: '#35df70', color: '#06110a', border: 0, borderRadius: 10, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', flex: 1 },
  declineBtn: { background: 'rgba(255,255,255,0.15)', color: '#fff', border: 0, borderRadius: 10, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', flex: 1 },
  battlePickerOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  battlePickerPanel: { width: '85%', maxHeight: '70%', background: '#161625', border: '1px solid #333', borderRadius: 16, padding: 16 },
  challengeRow: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: 0, borderRadius: 10, padding: 10, color: '#fff', cursor: 'pointer', fontSize: 13 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, padding: '16px 12px', display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(rgba(0,0,0,0.6), transparent)', zIndex: 3 },
  closeBtn: { color: '#fff', textDecoration: 'none', fontSize: 20, width: 32, height: 32, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: '50%' },
  hostChip: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.35)', borderRadius: 20, padding: '6px 10px', flex: 1, minWidth: 0 },
  hostAvatar: { width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 },
  followBtn: { background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', color: '#fff', border: 0, borderRadius: 12, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginLeft: 4 },
  followingBtn: { background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12, padding: '4px 10px', fontSize: 11, cursor: 'pointer', marginLeft: 4 },
  viewerBadge: { background: 'rgba(0,0,0,0.4)', borderRadius: 14, padding: '6px 12px', fontSize: 12, fontWeight: 700, flexShrink: 0 },
  errorBanner: { position: 'absolute', top: 66, left: 12, right: 12, background: 'rgba(90,20,20,0.85)', color: '#f88', padding: '8px 12px', borderRadius: 8, fontSize: 13, zIndex: 4, textAlign: 'center' },
  giftAlert: { position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,209,102,0.95)', color: '#3a2a00', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 800, zIndex: 4, animation: 'popIn 0.25s ease-out', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 },
  giftAlertBig: { top: '38%', transform: 'translate(-50%, -50%)', padding: '16px 28px', borderRadius: 24, fontSize: 16, background: 'linear-gradient(135deg, #ffd700, #ff9d00)' },
  shareToast: { position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)', background: 'rgba(30,30,45,0.95)', color: '#fff', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, zIndex: 4, animation: 'popIn 0.25s ease-out', maxWidth: '80%', textAlign: 'center' },
  filterPicker: { position: 'absolute', left: 12, right: 70, bottom: 150, zIndex: 4, background: 'rgba(15,15,26,0.92)', border: '1px solid #333', borderRadius: 14, padding: 12, display: 'flex', gap: 8, overflowX: 'auto' },
  filterChip: { background: 'rgba(255,255,255,0.08)', border: '1px solid #333', color: '#ccc', borderRadius: 16, padding: '8px 14px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 },
  filterChipActive: { background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', color: '#fff', border: 'none', fontWeight: 700 },
  heartLayer: { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 },
  heart: { position: 'absolute', bottom: 100, fontSize: 26, animation: 'floatUp 2.2s ease-out forwards' },
  rightRail: { position: 'absolute', right: 10, bottom: 150, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', zIndex: 3 },
  railBtn: { background: 'transparent', border: 0, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer' },
  railIcon: { width: 46, height: 46, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', fontSize: 22 },
  railCount: { fontSize: 11, fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.8)' },
  leaderboardPanel: { position: 'absolute', right: 70, bottom: 150, width: 220, background: 'rgba(15,15,26,0.92)', border: '1px solid #333', borderRadius: 14, padding: 14, zIndex: 4 },
  leaderboardRow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '4px 0' },
  giftPickerWrap: { position: 'absolute', left: 12, right: 70, bottom: 150, zIndex: 4, display: 'flex', flexDirection: 'column', gap: 6 },
  categoryTabs: { display: 'flex', gap: 6, overflowX: 'auto' },
  categoryTab: { background: 'rgba(15,15,26,0.85)', border: '1px solid #333', color: '#ccc', borderRadius: 14, padding: '5px 12px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' },
  categoryTabActive: { background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', color: '#fff', border: 'none', fontWeight: 700 },
  giftPicker: { background: 'rgba(15,15,26,0.92)', border: '1px solid #333', borderRadius: 14, padding: 10, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxHeight: 240, overflowY: 'auto' },
  giftBtn: { background: 'rgba(255,255,255,0.06)', color: '#fff', border: 0, borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  confirmOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  confirmPanel: { width: '80%', maxWidth: 280, background: '#161625', border: '1px solid #333', borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  chatOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 12px 16px', background: 'linear-gradient(transparent, rgba(0,0,0,0.75) 60%)', zIndex: 2 },
  chatFeed: { maxHeight: 130, overflowY: 'auto', marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 4 },
  chatLine: { fontSize: 13, lineHeight: 1.3, textShadow: '0 1px 3px rgba(0,0,0,0.6)' },
  chatAvatar: { width: 20, height: 20, minWidth: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, overflow: 'hidden', flexShrink: 0, marginTop: 1, textDecoration: 'none', color: '#fff' },
  chatNameLink: { color: 'inherit', textDecoration: 'none' },
  composer: { display: 'flex', gap: 8 },
  composerInput: { flex: 1, background: 'rgba(255,255,255,0.15)', border: 0, borderRadius: 20, color: '#fff', padding: '10px 14px', fontSize: 13 },
  sendBtn: { background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', color: '#fff', border: 0, borderRadius: 20, padding: '0 18px', fontWeight: 700, cursor: 'pointer' }
};
