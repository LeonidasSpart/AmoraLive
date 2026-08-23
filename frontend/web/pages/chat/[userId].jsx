import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';
import VerifiedBadge from '../../components/VerifiedBadge';

const GRADIENT = 'linear-gradient(135deg,#ff3f9d 0%,#ff5da8 35%,#9b35ff 100%)';

const RARITY = {
  common: '#a9a5b5',
  uncommon: '#5de0ae',
  rare: '#55b8ff',
  epic: '#b875ff',
  legendary: '#ffd45e',
  mythic: '#ff5fc8'
};

function GiftTray({ userId, onSent }) {
  const [gifts, setGifts] = useState([]);
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);

    apiFetch('/gifts/catalog')
      .then(async (res) => {
        if (!res.ok) throw new Error('Could not load gifts');
        return res.json();
      })
      .then((data) => {
        if (alive) setGifts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (alive) setGifts([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => { alive = false; };
  }, []);

  const categories = useMemo(() => {
    const values = gifts
      .map((g) => String(g.category || '').toLowerCase())
      .filter(Boolean);

    return ['all', ...Array.from(new Set(values))];
  }, [gifts]);

  const visible = category === 'all'
    ? gifts
    : gifts.filter((g) => String(g.category || '').toLowerCase() === category);

  const sendGift = async () => {
    if (!selected || sending || !userId) return;

    setSending(true);
    setMessage('');

    try {
      const res = await apiFetch('/gifts/send', {
        method: 'POST',
        body: JSON.stringify({
          giftId: selected.id,
          receiverId: userId,
          quantity
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to send gift');

      const sentGift = {
        ...selected,
        quantity,
        transaction: data.transaction || data
      };

      setMessage(`✦ ${quantity} × ${selected.name} sent`);
      setSelected(null);
      setQuantity(1);

      if (onSent) onSent(sentGift);
    } catch (err) {
      setMessage(err.message || 'Unable to send gift');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="giftTray">
      <div className="trayTop">
        <div>
          <span className="eyebrow">AMORA PRIVATE COLLECTION</span>
          <strong>Send something unforgettable</strong>
        </div>
        <button className="trayClose" type="button" onClick={() => onSent?.({ closeOnly: true })}>
          ×
        </button>
      </div>

      <div className="categoryBar">
        {categories.map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => setCategory(item)}
            className={category === item ? 'category active' : 'category'}
          >
            {item === 'all'
              ? 'All'
              : item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="giftLoading">Curating your collection…</div>
      ) : (
        <div className="giftScroller">
          {visible.map((gift) => {
            const accent = RARITY[gift.rarity] || RARITY.rare;
            const active = selected?.id === gift.id;

            return (
              <button
                type="button"
                key={gift.id}
                className={`gift ${active ? 'selected' : ''}`}
                style={{ '--accent': accent }}
                onClick={() => {
                  setSelected(gift);
                  setQuantity(1);
                  setMessage('');
                }}
              >
                <span className="rarity">{gift.rarity || 'rare'}</span>

                <span className="giftArt">
                  {gift.image_url ? (
                    <img src={gift.image_url} alt="" />
                  ) : (
                    <span>{gift.glyph || '✦'}</span>
                  )}
                </span>

                <span className="giftName">{gift.name}</span>
                <span className="giftPrice">
                  ◉ {Number(gift.coin_price || 0).toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="selectedGift">
          <div className="selectedArt">
            {selected.image_url ? (
              <img src={selected.image_url} alt="" />
            ) : (
              <span>{selected.glyph || '✦'}</span>
            )}
          </div>

          <div className="selectedInfo">
            <strong>{selected.name}</strong>
            <span>{selected.description || 'A premium Amora gesture.'}</span>

            <div className="quantity">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <b>{quantity}</b>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(100, q + 1))}
              >
                +
              </button>
              <em>
                ◉ {(Number(selected.coin_price || 0) * quantity).toLocaleString()}
              </em>
            </div>
          </div>

          <button
            type="button"
            className="sendGift"
            disabled={sending}
            onClick={sendGift}
          >
            {sending ? 'Sending…' : 'Send Gift'}
          </button>
        </div>
      )}

      {message && <div className="giftMessage">{message}</div>}

      <style jsx>{`
        .giftTray {
          border-top: 1px solid rgba(255,255,255,.08);
          background:
            radial-gradient(circle at 15% 0%, rgba(255,65,175,.1), transparent 28%),
            linear-gradient(145deg,#151020,#0b0912);
          padding: 16px;
        }

        .trayTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .eyebrow {
          display: block;
          color: #d6a2ff;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .2em;
          margin-bottom: 4px;
        }

        .trayTop strong {
          color: #fff;
          font-size: 14px;
        }

        .trayClose {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.05);
          color: #aaa;
          font-size: 20px;
          cursor: pointer;
        }

        .categoryBar {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          margin: 13px 0 10px;
          padding-bottom: 3px;
        }

        .category {
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.035);
          color: #81788d;
          padding: 6px 10px;
          border-radius: 999px;
          white-space: nowrap;
          font-size: 9px;
          cursor: pointer;
        }

        .category.active {
          color: #fff;
          border-color: rgba(255,77,181,.55);
          background: ${GRADIENT};
        }

        .giftScroller {
          display: flex;
          gap: 9px;
          overflow-x: auto;
          padding: 3px 2px 9px;
          scrollbar-width: thin;
        }

        .gift {
          --accent: #b875ff;
          position: relative;
          flex: 0 0 92px;
          height: 126px;
          padding: 8px;
          border: 1px solid rgba(255,255,255,.07);
          border-bottom: 2px solid var(--accent);
          border-radius: 15px;
          background: linear-gradient(160deg,rgba(255,255,255,.065),rgba(255,255,255,.015));
          color: #fff;
          cursor: pointer;
          text-align: center;
          overflow: hidden;
        }

        .gift.selected {
          border-color: var(--accent);
          box-shadow: 0 0 25px color-mix(in srgb,var(--accent) 22%,transparent);
          transform: translateY(-2px);
        }

        .rarity {
          display: block;
          color: var(--accent);
          font-size: 7px;
          text-transform: uppercase;
          letter-spacing: .1em;
          font-weight: 900;
        }

        .giftArt {
          height: 68px;
          display: grid;
          place-items: center;
        }

        .giftArt img {
          width: 60px;
          height: 60px;
          object-fit: contain;
          filter: drop-shadow(0 7px 13px color-mix(in srgb,var(--accent) 30%,transparent));
          transition: transform .2s ease;
        }

        .gift:hover .giftArt img {
          transform: scale(1.1) rotate(-2deg);
        }

        .giftArt > span {
          font-size: 37px;
          color: var(--accent);
          text-shadow: 0 0 18px color-mix(in srgb,var(--accent) 55%,transparent);
        }

        .giftName {
          display: block;
          font-size: 9px;
          font-weight: 800;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .giftPrice {
          display: block;
          margin-top: 3px;
          color: #9d94a8;
          font-size: 8px;
        }

        .selectedGift {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
          padding: 10px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 17px;
          background: rgba(255,255,255,.035);
        }

        .selectedArt {
          width: 58px;
          height: 58px;
          flex: 0 0 58px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          background: rgba(255,80,190,.08);
        }

        .selectedArt img {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }

        .selectedArt > span {
          font-size: 32px;
          color: #ff6bc4;
        }

        .selectedInfo {
          min-width: 0;
          flex: 1;
        }

        .selectedInfo strong {
          display: block;
          color: #fff;
          font-size: 12px;
        }

        .selectedInfo > span {
          display: block;
          color: #777080;
          font-size: 9px;
          margin-top: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .quantity {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 7px;
        }

        .quantity button {
          width: 22px;
          height: 22px;
          border-radius: 7px;
          border: 1px solid rgba(255,255,255,.1);
          background: #17121f;
          color: #fff;
          cursor: pointer;
        }

        .quantity b {
          font-size: 10px;
          min-width: 12px;
          text-align: center;
        }

        .quantity em {
          margin-left: 5px;
          color: #ffd86b;
          font-size: 9px;
          font-style: normal;
          font-weight: 800;
        }

        .sendGift {
          border: 0;
          border-radius: 11px;
          padding: 10px 12px;
          color: #fff;
          background: ${GRADIENT};
          font-weight: 900;
          font-size: 10px;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 7px 22px rgba(255,50,170,.2);
        }

        .sendGift:disabled { opacity: .55; cursor: default; }
        .giftLoading, .giftMessage {
          color: #81788d;
          font-size: 10px;
          padding: 10px 2px;
        }

        .giftMessage {
          color: #ff9bd4;
          text-align: center;
        }

        @media(max-width:600px) {
          .selectedGift {
            flex-wrap: wrap;
          }
          .selectedInfo {
            min-width: calc(100% - 70px);
          }
          .sendGift {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default function ChatRoom() {
  const router = useRouter();
  const { userId } = router.query;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [showGifts, setShowGifts] = useState(false);
  const [giftBurst, setGiftBurst] = useState(null);

  const typingTimer = useRef(null);
  const messagesEndRef = useRef(null);

  const currentUserId = useMemo(
    () => typeof window !== 'undefined' ? localStorage.getItem('userId') : null,
    []
  );

  const fetchMessages = async () => {
    if (!localStorage.getItem('accessToken')) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await apiFetch(`/messages/${userId}?limit=50`);
      if (!res.ok) throw new Error('Failed to load messages');

      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);

      const userRes = await apiFetch(`/users/${userId}`);
      if (userRes.ok) setOtherUser(await userRes.json());
    } catch (err) {
      setError(err.message || 'Unable to load chat');
    } finally {
      setLoading(false);
    }
  };

  const connectSocket = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    const ws = new WebSocket('wss://api.amoramatch.one/ws');

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'authenticate', token }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'private-message' || data.type === 'private-message-sent') {
          const message = data.message;
          if (!message?.id) return;

          setMessages((prev) =>
            prev.some((m) => m.id === message.id)
              ? prev
              : [...prev, message]
          );
        }

        if (data.type === 'typing') setIsTyping(Boolean(data.isTyping));

        if (data.type === 'read-receipt') {
          setMessages((prev) =>
            prev.map((m) =>
              m.sender_id === data.from
                ? { ...m, read_at: new Date().toISOString() }
                : m
            )
          );
        }
      } catch (err) {
        console.error('Realtime message error:', err);
      }
    };

    ws.onerror = () => {
      setError('Realtime connection unavailable. Messages can still be reloaded.');
    };

    setSocket(ws);
    return ws;
  };

  useEffect(() => {
    if (!userId) return;

    fetchMessages();
    const ws = connectSocket();

    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
      if (ws) ws.close();
    };
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();

    const text = input.trim();
    if (!text) return;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError('Realtime connection is not ready.');
      return;
    }

    socket.send(JSON.stringify({
      type: 'private-message',
      receiverId: userId,
      content: text
    }));

    setInput('');
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setInput(value);

    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify({
      type: 'typing',
      receiverId: userId,
      isTyping: true
    }));

    if (typingTimer.current) clearTimeout(typingTimer.current);

    typingTimer.current = setTimeout(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'typing',
          receiverId: userId,
          isTyping: false
        }));
      }
    }, 1800);
  };

  const handleGiftSent = (payload) => {
    if (payload?.closeOnly) {
      setShowGifts(false);
      return;
    }

    if (payload?.gift) {
      setGiftBurst(payload.gift);
      setTimeout(() => setGiftBurst(null), 2800);
    }

    // Refresh messages because the backend can create gift-related notifications
    // independently from the realtime message stream.
    setShowGifts(false);
  };

  if (loading) {
    return (
      <div className="state">
        <div className="loaderOrb">✦</div>
        <span>Opening your private space…</span>
        <style jsx>{`
          .state {
            min-height: 100vh;
            display: grid;
            place-items: center;
            align-content: center;
            gap: 12px;
            color: #9a91a4;
            background: #08070e;
          }
          .loaderOrb {
            color: #ff65bb;
            font-size: 38px;
            text-shadow: 0 0 30px #ff4eb6;
          }
        `}</style>
      </div>
    );
  }

  if (error && !otherUser) {
    return (
      <div className="state">
        <p>{error}</p>
        <button onClick={fetchMessages}>Retry</button>
        <style jsx>{`
          .state {
            min-height: 100vh;
            display: grid;
            place-items: center;
            align-content: center;
            gap: 10px;
            color: #ff8bad;
            background: #08070e;
          }
          button {
            border: 0;
            border-radius: 10px;
            padding: 10px 24px;
            color: #fff;
            background: ${GRADIENT};
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  const displayName = otherUser?.display_name || otherUser?.username || 'User';
  const avatar = otherUser?.profile_photo;

  return (
    <div className="chatPage">
      <div className="ambient ambientOne" />
      <div className="ambient ambientTwo" />

      <header className="chatHeader">
        <Link href="/chat" className="back">‹</Link>

        <div className="headerAvatar">
          {avatar ? <img src={avatar} alt="" /> : <span>👤</span>}
          <i />
        </div>

        <div className="headerInfo">
          <div className="name">
            {displayName}
            <VerifiedBadge user={otherUser} size={15} />
          </div>
          <div className={isTyping ? 'typing' : 'status'}>
            {isTyping ? 'typing…' : 'Private conversation'}
          </div>
        </div>

        <div className="headerActions">
          <Link href={`/profile/${userId}`} className="headerButton" aria-label="Profile">
            ♡
          </Link>
          <button type="button" className="headerButton" aria-label="Call">
            ◌
          </button>
        </div>
      </header>

      <main className="conversation">
        <div className="datePill">PRIVATE • END-TO-END SPACE</div>

        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome">
              <div className="welcomeIcon">✦</div>
              <h2>Start something beautiful.</h2>
              <p>Your first message begins this private conversation.</p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const mine = currentUserId && String(msg.sender_id) === String(currentUserId);
            const time = msg.created_at
              ? new Date(msg.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : '';

            return (
              <div
                key={msg.id || idx}
                className={mine ? 'messageRow mine' : 'messageRow'}
              >
                {!mine && (
                  <div className="smallAvatar">
                    {avatar ? <img src={avatar} alt="" /> : <span>👤</span>}
                  </div>
                )}

                <div className={mine ? 'bubble mineBubble' : 'bubble'}>
                  {msg.content && <div className="messageText">{msg.content}</div>}

                  <div className="messageMeta">
                    <span>{time}</span>
                    {mine && <span className={msg.read_at ? 'read' : ''}>✓✓</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="messageRow">
              <div className="smallAvatar">
                {avatar ? <img src={avatar} alt="" /> : <span>👤</span>}
              </div>
              <div className="typingBubble">
                <i /><i /><i />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {showGifts && (
        <GiftTray
          userId={userId}
          onSent={handleGiftSent}
        />
      )}

      {giftBurst && (
        <div className="giftBurst" aria-live="polite">
          <div className="burstGlow" />
          <div className="burstArt">
            {giftBurst.image_url ? (
              <img src={giftBurst.image_url} alt="" />
            ) : (
              <span>{giftBurst.glyph || '✦'}</span>
            )}
          </div>
          <div className="burstText">
            <span>GIFT SENT</span>
            <strong>{giftBurst.name}</strong>
            <small>✦ A little luxury, delivered.</small>
          </div>
        </div>
      )}

      <form className="composer" onSubmit={sendMessage}>
        <button
          type="button"
          className={showGifts ? 'composerIcon active' : 'composerIcon'}
          onClick={() => setShowGifts((v) => !v)}
          aria-label="Send luxury gift"
        >
          ♢
        </button>

        <button type="button" className="composerIcon" aria-label="Attach">
          ＋
        </button>

        <input
          type="text"
          placeholder="Write a private message…"
          value={input}
          onChange={handleTyping}
          autoComplete="off"
        />

        <button className="sendButton" type="submit" aria-label="Send message">
          ↑
        </button>
      </form>

      <style jsx>{`
        .chatPage {
          min-height: 100vh;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          color: #fff;
          background:
            radial-gradient(circle at 12% 8%, rgba(255,55,170,.1), transparent 27%),
            radial-gradient(circle at 88% 32%, rgba(133,65,255,.09), transparent 29%),
            #08070e;
          overflow: hidden;
          position: relative;
          font-family: inherit;
        }

        .ambient {
          position: absolute;
          border-radius: 50%;
          filter: blur(85px);
          pointer-events: none;
          opacity: .25;
        }

        .ambientOne {
          width: 230px;
          height: 230px;
          background: #ff2c9d;
          left: -130px;
          bottom: 80px;
        }

        .ambientTwo {
          width: 260px;
          height: 260px;
          background: #7034ff;
          right: -150px;
          top: 180px;
        }

        .chatHeader {
          position: relative;
          z-index: 3;
          min-height: 72px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px max(16px, calc((100vw - 1080px) / 2));
          border-bottom: 1px solid rgba(255,255,255,.08);
          background: rgba(12,9,18,.78);
          backdrop-filter: blur(22px);
          box-shadow: 0 12px 40px rgba(0,0,0,.18);
        }

        .back {
          color: #a79dad;
          text-decoration: none;
          font-size: 34px;
          line-height: 1;
          width: 30px;
        }

        .headerAvatar, .smallAvatar {
          position: relative;
          overflow: hidden;
          border-radius: 50%;
          background: #211b2b;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
        }

        .headerAvatar {
          width: 46px;
          height: 46px;
          border: 2px solid rgba(255,100,190,.65);
          box-shadow: 0 0 20px rgba(255,70,180,.14);
        }

        .headerAvatar img, .smallAvatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .headerAvatar i {
          position: absolute;
          right: 0;
          bottom: 1px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #5ce795;
          border: 2px solid #100c16;
          box-shadow: 0 0 10px #5ce795;
        }

        .headerInfo {
          flex: 1;
          min-width: 0;
        }

        .name {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 850;
          font-size: 14px;
        }

        .status, .typing {
          margin-top: 3px;
          color: #706878;
          font-size: 10px;
        }

        .typing { color: #ff69bd; }

        .headerActions {
          display: flex;
          gap: 7px;
        }

        .headerButton {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px;
          color: #a69baa;
          background: rgba(255,255,255,.035);
          text-decoration: none;
          cursor: pointer;
          font-size: 17px;
        }

        .conversation {
          position: relative;
          z-index: 1;
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overscroll-behavior: contain;
        }

        .datePill {
          width: max-content;
          margin: 15px auto;
          padding: 6px 10px;
          border-radius: 999px;
          color: #746b7c;
          background: rgba(255,255,255,.035);
          border: 1px solid rgba(255,255,255,.06);
          font-size: 8px;
          letter-spacing: .16em;
        }

        .messages {
          width: min(820px, calc(100% - 28px));
          margin: 0 auto;
          padding: 4px 0 20px;
        }

        .messageRow {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          margin: 7px 0;
        }

        .messageRow.mine {
          justify-content: flex-end;
        }

        .smallAvatar {
          width: 27px;
          height: 27px;
          font-size: 11px;
        }

        .bubble {
          max-width: min(68%, 560px);
          padding: 10px 12px 7px;
          border-radius: 18px 18px 18px 5px;
          background: linear-gradient(145deg,#201a2a,#17131f);
          border: 1px solid rgba(255,255,255,.07);
          box-shadow: 0 9px 25px rgba(0,0,0,.16);
        }

        .mineBubble {
          border-radius: 18px 18px 5px 18px;
          border-color: rgba(255,89,185,.18);
          background: linear-gradient(135deg,rgba(255,63,157,.96),rgba(151,53,255,.96));
          box-shadow: 0 10px 28px rgba(180,45,170,.18);
        }

        .messageText {
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          line-height: 1.45;
          font-size: 13px;
        }

        .messageMeta {
          display: flex;
          justify-content: flex-end;
          gap: 5px;
          margin-top: 5px;
          color: rgba(255,255,255,.48);
          font-size: 8px;
        }

        .messageMeta .read {
          color: #aef6ff;
        }

        .typingBubble {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 14px;
          border-radius: 18px 18px 18px 5px;
          background: #201a2a;
          border: 1px solid rgba(255,255,255,.07);
        }

        .typingBubble i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #a79aae;
          animation: bounce 1s infinite ease-in-out;
        }

        .typingBubble i:nth-child(2) { animation-delay: .15s; }
        .typingBubble i:nth-child(3) { animation-delay: .3s; }

        .welcome {
          min-height: 48vh;
          display: grid;
          place-items: center;
          align-content: center;
          text-align: center;
          color: #746b7c;
        }

        .welcomeIcon {
          color: #ff67bd;
          font-size: 40px;
          text-shadow: 0 0 30px rgba(255,60,180,.45);
        }

        .welcome h2 {
          color: #eee8f2;
          margin: 8px 0 4px;
          font-size: 20px;
        }

        .welcome p {
          margin: 0;
          font-size: 11px;
        }

        .composer {
          position: relative;
          z-index: 4;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px max(12px, calc((100vw - 1080px) / 2));
          padding-bottom: max(10px, env(safe-area-inset-bottom));
          border-top: 1px solid rgba(255,255,255,.08);
          background: rgba(10,8,15,.88);
          backdrop-filter: blur(24px);
        }

        .composer input {
          flex: 1;
          min-width: 0;
          height: 42px;
          border-radius: 15px;
          border: 1px solid rgba(255,255,255,.09);
          background: rgba(255,255,255,.045);
          color: #fff;
          outline: none;
          padding: 0 14px;
          font-size: 13px;
        }

        .composer input:focus {
          border-color: rgba(255,91,187,.45);
          box-shadow: 0 0 0 3px rgba(255,55,175,.07);
        }

        .composer input::placeholder {
          color: #6f6877;
        }

        .composerIcon, .sendButton {
          flex: 0 0 auto;
          width: 42px;
          height: 42px;
          border-radius: 14px;
          cursor: pointer;
        }

        .composerIcon {
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.035);
          color: #a59baa;
          font-size: 18px;
        }

        .composerIcon.active {
          color: #fff;
          border-color: rgba(255,76,180,.45);
          background: linear-gradient(135deg,rgba(255,63,157,.35),rgba(155,53,255,.35));
          box-shadow: 0 0 22px rgba(255,55,175,.12);
        }

        .sendButton {
          border: 0;
          color: #fff;
          background: ${GRADIENT};
          font-size: 20px;
          font-weight: 900;
          box-shadow: 0 8px 25px rgba(255,55,170,.22);
        }

        .giftBurst {
          position: fixed;
          z-index: 20;
          left: 50%;
          top: 50%;
          transform: translate(-50%,-50%);
          width: min(340px, calc(100% - 40px));
          padding: 22px;
          border-radius: 28px;
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(20,14,29,.92);
          border: 1px solid rgba(255,105,196,.25);
          box-shadow: 0 30px 100px rgba(0,0,0,.65), 0 0 60px rgba(255,50,180,.13);
          backdrop-filter: blur(20px);
          animation: giftIn 2.8s ease both;
          overflow: hidden;
        }

        .burstGlow {
          position: absolute;
          inset: -50px;
          background: radial-gradient(circle,#ff4eb72a,transparent 62%);
          pointer-events: none;
        }

        .burstArt {
          position: relative;
          width: 88px;
          height: 88px;
          flex: 0 0 88px;
          display: grid;
          place-items: center;
          border-radius: 25px;
          background: radial-gradient(circle,#ff60c62a,transparent 70%);
        }

        .burstArt img {
          width: 80px;
          height: 80px;
          object-fit: contain;
          filter: drop-shadow(0 12px 24px rgba(255,50,190,.35));
          animation: floatGift 1.2s ease-in-out infinite alternate;
        }

        .burstArt span {
          font-size: 58px;
          color: #ff70c5;
        }

        .burstText {
          position: relative;
        }

        .burstText span {
          display: block;
          color: #ff78c7;
          font-size: 8px;
          letter-spacing: .2em;
          font-weight: 900;
        }

        .burstText strong {
          display: block;
          color: #fff;
          margin-top: 5px;
          font-size: 19px;
        }

        .burstText small {
          display: block;
          color: #81788c;
          margin-top: 5px;
          font-size: 9px;
        }

        @keyframes bounce {
          0%,80%,100% { transform: translateY(0); opacity: .5; }
          40% { transform: translateY(-4px); opacity: 1; }
        }

        @keyframes giftIn {
          0% { opacity: 0; transform: translate(-50%,-45%) scale(.75); }
          12% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
          78% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%,-55%) scale(.95); }
        }

        @keyframes floatGift {
          from { transform: translateY(2px) scale(.98); }
          to { transform: translateY(-6px) scale(1.03); }
        }

        @media(max-width:600px) {
          .chatHeader { min-height: 64px; padding-left: 9px; padding-right: 9px; }
          .headerActions .headerButton:last-child { display: none; }
          .messages { width: calc(100% - 18px); }
          .bubble { max-width: 80%; }
          .composer { gap: 5px; padding-left: 7px; padding-right: 7px; }
          .composerIcon { width: 38px; height: 38px; }
          .sendButton { width: 42px; height: 42px; }
        }
      `}</style>
    </div>
  );
}
