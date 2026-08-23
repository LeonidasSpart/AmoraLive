import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { API, apiFetch } from '../../lib/api';
import VerifiedBadge from '../../components/VerifiedBadge';
import GiftIcon from '../../components/GiftIcon';
import LuxuryGiftTray from '../../components/LuxuryGiftTray';
import { io as createSocket } from 'socket.io-client';

const GRADIENT = 'linear-gradient(135deg,#ff3f9d 0%,#ff5da8 35%,#9b35ff 100%)';

export default function ChatRoom() {
  const router = useRouter();
  const { userId } = router.query;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [showGifts, setShowGifts] = useState(false);
  const [giftBurst, setGiftBurst] = useState(null);
  const [socketReady, setSocketReady] = useState(false);

  const typingTimer = useRef(null);
  const seenGiftEvents = useRef(new Set());
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

    const realtime = createSocket(API, {
      transports: ['websocket'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 6
    });

    realtime.on('connect', () => {
      realtime.emit('authenticate', token, (ack) => {
        if (ack?.ok) {
          setSocketReady(true);
          setError('');
        } else {
          setSocketReady(false);
          setError('Realtime authentication failed. Please sign in again.');
        }
      });
    });

    realtime.on('disconnect', () => {
      setSocketReady(false);
    });

    realtime.on('connect_error', () => {
      setSocketReady(false);
      setError('Realtime connection unavailable. Trying again…');
    });

    const showGift = (transaction) => {
      if (!transaction?.id) return;
      if (seenGiftEvents.current.has(transaction.id)) return;

      seenGiftEvents.current.add(transaction.id);
      const gift = transaction.gift || transaction;

      setGiftBurst({
        ...gift,
        quantity: transaction.quantity || 1,
        coin_cost: transaction.coin_cost || 0,
        from: transaction.sender
      });

      window.setTimeout(() => {
        setGiftBurst(null);
      }, 3200);
    };

    realtime.on('gift-received', showGift);
    realtime.on('gift-sent', showGift);

    realtime.on('private-message', (message) => {
      if (!message?.id) return;

      setMessages((prev) =>
        prev.some((item) => item.id === message.id)
          ? prev
          : [...prev, message]
      );
    });

    realtime.on('private-message-sent', (message) => {
      if (!message?.id) return;

      setMessages((prev) =>
        prev.some((item) => item.id === message.id)
          ? prev
          : [...prev, message]
      );
    });

    realtime.on('typing', ({ from, isTyping: typing }) => {
      if (String(from) === String(userId)) {
        setIsTyping(Boolean(typing));
      }
    });

    realtime.on('read-receipt', ({ from }) => {
      setMessages((prev) =>
        prev.map((message) =>
          String(message.sender_id) === String(from)
            ? { ...message, read_at: new Date().toISOString() }
            : message
        )
      );
    });

    setSocket(realtime);
    return realtime;
  };

  useEffect(() => {
    if (!userId) return;

    seenGiftEvents.current.clear();
    fetchMessages();
    const realtime = connectSocket();

    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
      setSocketReady(false);
      if (realtime) realtime.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();

    const text = input.trim();
    if (!text) return;

    if (!socket || !socketReady || !socket.connected) {
      setError('Realtime connection is not ready.');
      return;
    }

    socket.emit('private-message', {
      receiverId: userId,
      content: text
    });

    setInput('');
    setError('');
  };

  const handleAttachClick = () => {
    if (uploadingMedia) return;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again later
    if (!file) return;

    if (!socket || !socketReady || !socket.connected) {
      setError('Realtime connection is not ready.');
      return;
    }

    setUploadingMedia(true);
    setError('');
    try {
      const form = new FormData();
      form.append('media', file);
      const res = await apiFetch('/messages/upload', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to upload that file.');

      socket.emit('private-message', {
        receiverId: userId,
        content: '',
        type: data.type,
        media_urls: [data.url]
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setInput(value);

    if (!socket || !socketReady || !socket.connected) return;

    socket.emit('typing', {
      receiverId: userId,
      isTyping: true
    });

    if (typingTimer.current) clearTimeout(typingTimer.current);

    typingTimer.current = setTimeout(() => {
      if (socket.connected) {
        socket.emit('typing', {
          receiverId: userId,
          isTyping: false
        });
      }
    }, 1800);
  };

  const handleGiftSent = (payload) => {
    if (payload?.closeOnly) {
      setShowGifts(false);
      return;
    }

    if (payload?.gift) {
      const transactionId = payload.transaction?.id;
      if (!transactionId || !seenGiftEvents.current.has(transactionId)) {
        if (transactionId) seenGiftEvents.current.add(transactionId);

        setGiftBurst(payload.gift);
        window.setTimeout(() => setGiftBurst(null), 3200);
      }
    }

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

        <Link href={`/creator/${userId}`} className="headerIdentity" aria-label="View profile">
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
              {isTyping ? 'typing…' : socketReady ? 'Private conversation • Online' : 'Connecting securely…'}
            </div>
          </div>
        </Link>

        <div className="headerActions">
          <Link href={`/creator/${userId}`} className="headerButton" aria-label="View profile">
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
                  {msg.media_urls?.[0] && msg.type === 'video' && (
                    <video src={msg.media_urls[0]} controls className="messageMedia" />
                  )}
                  {msg.media_urls?.[0] && msg.type !== 'video' && (
                    <img src={msg.media_urls[0]} alt="" className="messageMedia" />
                  )}
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
        <LuxuryGiftTray
          receiverId={userId}
          onSent={handleGiftSent}
          onClose={() => setShowGifts(false)}
        />
      )}

      {giftBurst && (
        <div className="giftBurst" aria-live="polite">
          <div className="burstGlow" />
          <div className="burstArt">
            <GiftIcon
              name={giftBurst.name}
              glyph={giftBurst.glyph}
              rarity={giftBurst.rarity}
              size={96}
              animated
            />
          </div>
          <div className="burstText">
            <span>GIFT SENT</span>
            <strong>{giftBurst.name}</strong>
            <small>×{giftBurst.quantity || 1} • ✦ A little luxury, delivered.</small>
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

        <button type="button" className="composerIcon" aria-label="Attach" onClick={handleAttachClick} disabled={uploadingMedia}>
          {uploadingMedia ? '…' : '＋'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelected}
          style={{ display: 'none' }}
        />

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

        .headerIdentity {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: inherit;
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

        .messageMedia {
          display: block;
          width: 100%;
          max-width: 240px;
          border-radius: 12px;
          margin-bottom: 6px;
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
