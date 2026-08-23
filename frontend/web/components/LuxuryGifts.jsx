import React, { useEffect, useMemo, useState } from 'react';
import GiftIcon from './GiftIcon';
import { apiFetch } from '../lib/api';

const RARITY = {
  common:    { label: 'Classic',   accent: '#a9a5b5' },
  rare:      { label: 'Rare',      accent: '#55b8ff' },
  epic:      { label: 'Epic',      accent: '#b875ff' },
  legendary: { label: 'Legendary', accent: '#ffd45e' },
  mythic:    { label: 'Mythic',    accent: '#ff5fc8' }
};

const FALLBACK_CATEGORIES = ['all', 'romance', 'luxury', 'cosmic', 'power', 'fun'];

export default function LuxuryGifts({
  receiverId,
  compact = false,
  title = 'Luxury Gifts',
  showHeader = true,
  onSent
}) {
  const [gifts, setGifts] = useState([]);
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);

    apiFetch('/gifts/catalog')
      .then(async (res) => {
        if (!res.ok) throw new Error('Unable to load gifts');
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
    const fromCatalog = Array.from(
      new Set(gifts.map(g => String(g.category || '').toLowerCase()).filter(Boolean))
    );
    return ['all', ...Array.from(new Set([...FALLBACK_CATEGORIES.slice(1), ...fromCatalog]))];
  }, [gifts]);

  const visible = useMemo(() => {
    if (category === 'all') return gifts;
    return gifts.filter(g => String(g.category || '').toLowerCase() === category);
  }, [gifts, category]);

  const selectGift = (gift) => {
    setSelected(gift);
    setQuantity(1);
    setStatus('');
  };

  const sendGift = async () => {
    if (!receiverId || !selected || sending) return;

    setSending(true);
    setStatus('');

    try {
      const res = await apiFetch('/gifts/send', {
        method: 'POST',
        body: JSON.stringify({
          giftId: selected.id,
          receiverId,
          quantity
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to send gift');

      const sent = selected;
      setSelected(null);
      setQuantity(1);
      setStatus(`Sent ${quantity} × ${sent.name}`);

      if (onSent) onSent(data.transaction || data);
    } catch (err) {
      setStatus(err.message || 'Unable to send gift');
    } finally {
      setSending(false);
    }
  };

  return (
    <section style={styles.shell}>
      {showHeader && (
        <div style={styles.header}>
          <div>
            <div style={styles.kicker}>AMORA COLLECTION</div>
            <h3 style={styles.title}>{title}</h3>
            <div style={styles.subtitle}>A little luxury goes a long way.</div>
          </div>
          <div style={styles.gem}>✦</div>
        </div>
      )}

      <div style={styles.tabs}>
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            style={{
              ...styles.tab,
              ...(category === item ? styles.activeTab : {})
            }}
          >
            {item === 'all'
              ? 'All'
              : item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.empty}>Curating the collection…</div>
      ) : visible.length === 0 ? (
        <div style={styles.empty}>No gifts in this collection yet.</div>
      ) : (
        <div style={compact ? styles.gridCompact : styles.grid}>
          {visible.map((gift) => {
            const rarity = RARITY[gift.rarity] || RARITY.common;
            const active = selected?.id === gift.id;

            return (
              <button
                key={gift.id}
                type="button"
                onClick={() => selectGift(gift)}
                style={{
                  ...styles.card,
                  ...(active ? styles.cardActive : {})
                }}
              >
                <div
                  style={{
                    ...styles.art,
                    borderColor: `${rarity.accent}55`,
                    boxShadow: active
                      ? `0 0 34px ${rarity.accent}44`
                      : `0 10px 28px ${rarity.accent}12`
                  }}
                >
                  <GiftIcon
                    name={gift.name}
                    glyph={gift.glyph}
                    rarity={gift.rarity}
                    size={compact ? 54 : 68}
                    animated={gift.rarity === 'legendary' || gift.rarity === 'mythic'}
                  />
                </div>

                <div style={styles.name}>{gift.name}</div>
                <div style={{ ...styles.rarity, color: rarity.accent }}>
                  {rarity.label}
                </div>
                <div style={styles.price}>◉ {gift.coin_price}</div>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div style={styles.checkout}>
          <div style={styles.checkoutArt}>
            <GiftIcon
              name={selected.name}
              glyph={selected.glyph}
              rarity={selected.rarity}
              size={78}
              animated
            />
          </div>

          <div style={styles.checkoutInfo}>
            <div style={styles.checkoutName}>{selected.name}</div>
            <div style={styles.checkoutDescription}>
              {selected.description || 'A premium Amora gift, chosen with intention.'}
            </div>

            <div style={styles.quantityRow}>
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                style={styles.qty}
              >
                −
              </button>
              <span style={styles.quantity}>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(q => Math.min(100, q + 1))}
                style={styles.qty}
              >
                +
              </button>
              <span style={styles.total}>
                ◉ {Number(selected.coin_price || 0) * quantity}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={sendGift}
            disabled={sending || !receiverId}
            style={{
              ...styles.send,
              opacity: sending || !receiverId ? 0.55 : 1
            }}
          >
            {sending ? 'Sending…' : 'Send Gift'}
          </button>
        </div>
      )}

      {!receiverId && !status && (
        <div style={styles.hint}>Open a member profile to send a gift.</div>
      )}

      {status && <div style={styles.status}>{status}</div>}
    </section>
  );
}

const styles = {
  shell: {
    background: 'linear-gradient(145deg,#171225,#211633 55%,#120e1e)',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: 24,
    padding: 20,
    color: '#fff',
    boxShadow: '0 24px 70px rgba(0,0,0,.35)',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  kicker: {
    color: '#d5a7ff',
    letterSpacing: 2.2,
    fontSize: 10,
    fontWeight: 800
  },
  title: {
    margin: '4px 0 2px',
    fontSize: 24,
    letterSpacing: -0.5
  },
  subtitle: {
    color: '#8e879f',
    fontSize: 12
  },
  gem: {
    width: 44,
    height: 44,
    borderRadius: 15,
    display: 'grid',
    placeItems: 'center',
    color: '#ffd86b',
    background: 'radial-gradient(circle,#ffd86b33,transparent 65%)',
    fontSize: 25
  },
  tabs: {
    display: 'flex',
    gap: 7,
    overflowX: 'auto',
    paddingBottom: 12,
    scrollbarWidth: 'none'
  },
  tab: {
    border: '1px solid #302842',
    background: '#191427',
    color: '#8f879e',
    borderRadius: 999,
    padding: '7px 12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontSize: 11
  },
  activeTab: {
    color: '#fff',
    borderColor: '#a954ff',
    background: 'linear-gradient(90deg,#7427d9,#c53cff)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill,minmax(112px,1fr))',
    gap: 10,
    maxHeight: 430,
    overflowY: 'auto',
    padding: 3
  },
  gridCompact: {
    display: 'flex',
    gap: 10,
    overflowX: 'auto',
    padding: 3
  },
  card: {
    minWidth: 108,
    border: '1px solid rgba(255,255,255,.06)',
    background: 'linear-gradient(180deg,#211a32,#181326)',
    borderRadius: 17,
    padding: 10,
    color: '#fff',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'transform .18s ease, border-color .18s ease'
  },
  cardActive: {
    transform: 'translateY(-2px)',
    borderColor: '#c44fff88',
    background: 'linear-gradient(180deg,#302044,#1d152b)'
  },
  art: {
    width: 76,
    height: 76,
    margin: '0 auto 8px',
    borderRadius: 22,
    border: '1px solid',
    display: 'grid',
    placeItems: 'center',
    background: 'radial-gradient(circle at 50% 30%,rgba(255,255,255,.1),transparent 62%)'
  },
  name: {
    fontWeight: 700,
    fontSize: 11,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  rarity: {
    fontSize: 9,
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  price: {
    color: '#d0c8dd',
    fontSize: 11,
    marginTop: 6,
    fontWeight: 700
  },
  checkout: {
    marginTop: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: 13,
    borderRadius: 18,
    border: '1px solid rgba(255,255,255,.09)',
    background: 'linear-gradient(90deg,#241836,#1b1428)'
  },
  checkoutArt: {
    width: 88,
    height: 88,
    flexShrink: 0,
    borderRadius: 24,
    display: 'grid',
    placeItems: 'center',
    background: 'radial-gradient(circle,#b35cff25,transparent 70%)'
  },
  checkoutInfo: {
    flex: 1,
    minWidth: 0
  },
  checkoutName: {
    fontWeight: 800,
    fontSize: 16
  },
  checkoutDescription: {
    color: '#8f879e',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 1.4
  },
  quantityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 9,
    fontSize: 12
  },
  qty: {
    width: 25,
    height: 25,
    borderRadius: 8,
    border: '1px solid #3a304c',
    background: '#171223',
    color: '#fff',
    cursor: 'pointer'
  },
  quantity: {
    minWidth: 14,
    textAlign: 'center'
  },
  total: {
    marginLeft: 5,
    color: '#ffd86b',
    fontWeight: 800
  },
  send: {
    border: 0,
    borderRadius: 13,
    padding: '11px 15px',
    background: 'linear-gradient(135deg,#ff4fa7,#8f3cff)',
    color: '#fff',
    fontWeight: 800,
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  hint: {
    marginTop: 10,
    color: '#756d83',
    fontSize: 11,
    textAlign: 'center'
  },
  status: {
    marginTop: 10,
    color: '#cbbbdc',
    fontSize: 11,
    textAlign: 'center'
  },
  empty: {
    padding: 28,
    color: '#81788f',
    textAlign: 'center',
    fontSize: 12
  }
};
