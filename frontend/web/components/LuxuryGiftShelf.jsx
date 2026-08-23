import React, { useEffect, useState } from 'react';
import GiftIcon from './GiftIcon';
import { apiFetch } from '../lib/api';

/*
 * LuxuryGiftShelf
 * ----------------
 * Read-only profile display of gifts a member has received.
 *
 * Expected API:
 *   GET /gifts/history?direction=received&limit=100
 *
 * The existing Amora backend already returns completed gift history with
 * gift information, including quantity.
 */

export default function LuxuryGiftShelf({ limit = 100, title = 'Gift Collection' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    apiFetch(`/gifts/history?direction=received&limit=${limit}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Unable to load gift collection');
        return res.json();
      })
      .then((data) => {
        if (!alive) return;
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (alive) setItems([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => { alive = false; };
  }, [limit]);

  const grouped = items.reduce((map, tx) => {
    const gift = tx.gift;
    if (!gift) return map;

    const key = gift.id;
    if (!map[key]) {
      map[key] = {
        gift,
        quantity: 0,
        lastReceived: tx.created_at
      };
    }

    map[key].quantity += Number(tx.quantity || 1);
    return map;
  }, {});

  const collection = Object.values(grouped);

  return (
    <section style={styles.shell}>
      <div style={styles.heading}>
        <div>
          <div style={styles.kicker}>AMORA COLLECTION</div>
          <h3 style={styles.title}>{title}</h3>
        </div>
        <div style={styles.count}>{collection.length}</div>
      </div>

      {loading ? (
        <div style={styles.empty}>Loading collection…</div>
      ) : collection.length === 0 ? (
        <div style={styles.empty}>
          Gifts received from people you connect with will appear here.
        </div>
      ) : (
        <div style={styles.grid}>
          {collection.map(({ gift, quantity }) => (
            <div key={gift.id} style={styles.card}>
              <div style={styles.art}>
                <GiftIcon
                  name={gift.name}
                  glyph={gift.glyph}
                  rarity={gift.rarity}
                  size={64}
                  animated={gift.rarity === 'legendary' || gift.rarity === 'mythic'}
                />
              </div>

              <div style={styles.name}>{gift.name}</div>
              <div style={styles.rarity}>{gift.rarity || 'classic'}</div>

              <div style={styles.quantity}>
                <span>×</span>{quantity}
              </div>
            </div>
          ))}
        </div>
      )}
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
    boxShadow: '0 24px 70px rgba(0,0,0,.28)'
  },
  heading: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  kicker: {
    color: '#d5a7ff',
    letterSpacing: 2.2,
    fontSize: 10,
    fontWeight: 800
  },
  title: {
    margin: '4px 0 0',
    fontSize: 21
  },
  count: {
    minWidth: 34,
    height: 34,
    padding: '0 10px',
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    color: '#ffd86b',
    background: '#ffd86b12',
    border: '1px solid #ffd86b33',
    fontWeight: 800
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill,minmax(105px,1fr))',
    gap: 10
  },
  card: {
    position: 'relative',
    minWidth: 0,
    textAlign: 'center',
    padding: 10,
    borderRadius: 17,
    border: '1px solid rgba(255,255,255,.06)',
    background: 'linear-gradient(180deg,#211a32,#181326)'
  },
  art: {
    width: 72,
    height: 72,
    margin: '0 auto 8px',
    borderRadius: 21,
    display: 'grid',
    placeItems: 'center',
    background: 'radial-gradient(circle,#b35cff22,transparent 70%)'
  },
  name: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 11,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  rarity: {
    marginTop: 3,
    color: '#8f879e',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  quantity: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    marginTop: 7,
    padding: '3px 8px',
    borderRadius: 999,
    color: '#ffd86b',
    background: '#ffd86b12',
    border: '1px solid #ffd86b22',
    fontSize: 10,
    fontWeight: 800
  },
  empty: {
    padding: 28,
    color: '#81788f',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 1.5
  }
};
