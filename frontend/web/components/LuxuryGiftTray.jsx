import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';
import GiftIcon from './GiftIcon';

const RARITY = {
  common: { label: 'Classic', accent: '#a9a5b5' },
  uncommon: { label: 'Uncommon', accent: '#5de0ae' },
  rare: { label: 'Rare', accent: '#55b8ff' },
  epic: { label: 'Epic', accent: '#b875ff' },
  legendary: { label: 'Legendary', accent: '#ffd45e' },
  mythic: { label: 'Mythic', accent: '#ff5fc8' }
};

const GRADIENT = 'linear-gradient(135deg,#ff3f9d 0%,#ff5da8 35%,#9b35ff 100%)';

export default function LuxuryGiftTray({ receiverId, onSent, onClose }) {
  const [gifts, setGifts] = useState([]);
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let alive = true;

    apiFetch('/gifts/catalog')
      .then(async (res) => {
        if (!res.ok) throw new Error('Unable to load gifts');
        return res.json();
      })
      .then((data) => {
        if (alive) setGifts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (alive) setMessage(err.message || 'Unable to load gifts');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => { alive = false; };
  }, []);

  const categories = useMemo(() => {
    const values = gifts
      .map((gift) => String(gift.category || '').toLowerCase())
      .filter(Boolean);

    return ['all', ...Array.from(new Set(values))];
  }, [gifts]);

  const visible = category === 'all'
    ? gifts
    : gifts.filter((gift) => String(gift.category || '').toLowerCase() === category);

  const sendGift = async () => {
    if (!receiverId || !selected || sending) return;

    setSending(true);
    setMessage('');

    try {
      // The backend supports idempotency keys. This prevents a double tap,
      // flaky mobile connection, or retry from charging the sender twice.
      const idempotencyKey =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const res = await apiFetch('/gifts/send', {
        method: 'POST',
        body: JSON.stringify({
          giftId: selected.id,
          receiverId,
          quantity,
          idempotencyKey
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to send gift');

      const transaction = data.transaction || data;
      const sentGift = {
        ...(transaction.gift || selected),
        quantity: transaction.quantity || quantity,
        transaction
      };

      setSelected(null);
      setQuantity(1);
      setMessage(`✦ ${sentGift.quantity} × ${sentGift.name} sent`);

      onSent?.(sentGift);
    } catch (err) {
      setMessage(err.message || 'Unable to send gift');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="tray" aria-label="Amora luxury gifts">
      <div className="top">
        <div>
          <span className="eyebrow">AMORA PRIVATE COLLECTION</span>
          <h3>Send something unforgettable</h3>
          <p>Choose a gift worthy of the moment.</p>
        </div>

        <button type="button" className="close" onClick={onClose} aria-label="Close gifts">
          ×
        </button>
      </div>

      <div className="categories">
        {categories.map((item) => (
          <button
            type="button"
            key={item}
            className={category === item ? 'category active' : 'category'}
            onClick={() => setCategory(item)}
          >
            {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Curating the collection…</div>
      ) : visible.length === 0 ? (
        <div className="loading">No gifts available right now.</div>
      ) : (
        <div className="scroller">
          {visible.map((gift) => {
            const rarity = RARITY[String(gift.rarity || 'common').toLowerCase()] || RARITY.common;
            const active = selected?.id === gift.id;

            return (
              <button
                type="button"
                key={gift.id}
                className={`giftCard ${active ? 'selected' : ''}`}
                style={{ '--accent': rarity.accent }}
                onClick={() => {
                  setSelected(gift);
                  setQuantity(1);
                  setMessage('');
                }}
              >
                <span className="rarity">{rarity.label}</span>
                <span className="art">
                  <GiftIcon
                    name={gift.name}
                    glyph={gift.glyph}
                    rarity={gift.rarity}
                    size={66}
                    animated={gift.rarity === 'legendary' || gift.rarity === 'mythic'}
                  />
                </span>
                <strong>{gift.name}</strong>
                <span className="price">◉ {Number(gift.coin_price || 0).toLocaleString()}</span>
                <span className="shine" />
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="selected">
          <div className="selectedArt">
            <GiftIcon
              name={selected.name}
              glyph={selected.glyph}
              rarity={selected.rarity}
              size={72}
              animated={selected.rarity === 'legendary' || selected.rarity === 'mythic'}
            />
          </div>

          <div className="selectedInfo">
            <span className="selectedRarity">
              {(RARITY[String(selected.rarity || 'common').toLowerCase()] || RARITY.common).label}
            </span>
            <strong>{selected.name}</strong>
            <p>{selected.description || 'A premium Amora gesture.'}</p>

            <div className="quantity">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
              <b>{quantity}</b>
              <button type="button" onClick={() => setQuantity((q) => Math.min(100, q + 1))}>+</button>
              <span>◉ {(Number(selected.coin_price || 0) * quantity).toLocaleString()}</span>
            </div>
          </div>

          <button type="button" className="send" disabled={sending} onClick={sendGift}>
            {sending ? 'Sending…' : 'Send Gift'}
          </button>
        </div>
      )}

      {message && <div className="message">{message}</div>}

      <style jsx>{`
        .tray {
          position: relative;
          z-index: 8;
          padding: 16px max(14px, calc((100vw - 1080px) / 2));
          border-top: 1px solid rgba(255,255,255,.08);
          background:
            radial-gradient(circle at 10% 0%, rgba(255,55,175,.13), transparent 28%),
            radial-gradient(circle at 90% 100%, rgba(122,55,255,.12), transparent 30%),
            rgba(13,9,20,.97);
          backdrop-filter: blur(28px);
          box-shadow: 0 -18px 55px rgba(0,0,0,.3);
        }

        .top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .eyebrow {
          display: block;
          color: #d9a4ff;
          font-size: 7px;
          letter-spacing: .24em;
          font-weight: 900;
        }

        h3 {
          margin: 4px 0 2px;
          color: #fff;
          font-size: 15px;
        }

        .top p {
          margin: 0;
          color: #756c7e;
          font-size: 9px;
        }

        .close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.1);
          color: #aaa0af;
          background: rgba(255,255,255,.04);
          font-size: 20px;
          cursor: pointer;
        }

        .categories {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          margin: 12px 0 9px;
          padding-bottom: 2px;
        }

        .category {
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.035);
          color: #81788c;
          padding: 6px 11px;
          border-radius: 999px;
          font-size: 9px;
          white-space: nowrap;
          cursor: pointer;
        }

        .category.active {
          color: #fff;
          border-color: rgba(255,82,185,.55);
          background: ${GRADIENT};
        }

        .scroller {
          display: flex;
          gap: 9px;
          overflow-x: auto;
          padding: 2px 2px 8px;
          scrollbar-width: thin;
        }

        .giftCard {
          --accent: #a9a5b5;
          position: relative;
          flex: 0 0 98px;
          height: 132px;
          overflow: hidden;
          padding: 7px;
          border-radius: 17px;
          border: 1px solid rgba(255,255,255,.07);
          border-bottom-color: color-mix(in srgb, var(--accent) 75%, transparent);
          background: linear-gradient(155deg, rgba(255,255,255,.065), rgba(255,255,255,.015));
          color: #fff;
          cursor: pointer;
          text-align: center;
          transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
        }

        .giftCard:hover, .giftCard.selected {
          transform: translateY(-3px);
          border-color: var(--accent);
          box-shadow: 0 15px 34px color-mix(in srgb, var(--accent) 17%, transparent);
        }

        .rarity {
          display: block;
          color: var(--accent);
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .art {
          height: 76px;
          display: grid;
          place-items: center;
        }

        .giftCard strong {
          display: block;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 9px;
        }

        .price {
          display: block;
          margin-top: 3px;
          color: #9a91a4;
          font-size: 8px;
        }

        .shine {
          position: absolute;
          width: 90px;
          height: 170px;
          left: -120px;
          top: -40px;
          transform: rotate(22deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.13), transparent);
          transition: left .6s ease;
          pointer-events: none;
        }

        .giftCard:hover .shine {
          left: 130px;
        }

        .selected {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 7px;
          padding: 10px;
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 18px;
          background: rgba(255,255,255,.035);
        }

        .selectedArt {
          width: 72px;
          height: 72px;
          flex: 0 0 72px;
          display: grid;
          place-items: center;
          border-radius: 20px;
          background: radial-gradient(circle, rgba(255,70,190,.13), transparent 70%);
        }

        .selectedInfo {
          min-width: 0;
          flex: 1;
        }

        .selectedRarity {
          color: #ff75c6;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .14em;
          text-transform: uppercase;
        }

        .selectedInfo strong {
          display: block;
          color: #fff;
          font-size: 13px;
          margin-top: 2px;
        }

        .selectedInfo p {
          margin: 3px 0 6px;
          color: #7e7487;
          font-size: 9px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .quantity {
          display: flex;
          align-items: center;
          gap: 6px;
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
          min-width: 12px;
          text-align: center;
          font-size: 10px;
        }

        .quantity span {
          margin-left: 4px;
          color: #ffd86b;
          font-size: 9px;
          font-weight: 800;
        }

        .send {
          border: 0;
          border-radius: 12px;
          padding: 11px 14px;
          color: #fff;
          background: ${GRADIENT};
          font-size: 10px;
          font-weight: 900;
          white-space: nowrap;
          cursor: pointer;
          box-shadow: 0 8px 26px rgba(255,55,170,.22);
        }

        .send:disabled { opacity: .55; cursor: default; }

        .loading, .message {
          padding: 12px 2px;
          color: #81788d;
          font-size: 10px;
          text-align: center;
        }

        .message { color: #ff9bd4; }

        @media (max-width: 600px) {
          .tray { padding-left: 8px; padding-right: 8px; }
          .selected { flex-wrap: wrap; }
          .selectedInfo { min-width: calc(100% - 86px); }
          .send { width: 100%; }
        }
      `}</style>
    </section>
  );
}
