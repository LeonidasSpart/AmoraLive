// pages/store.jsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Link from 'next/link';

const API = (process.env.NEXT_PUBLIC_API_URL || 'https://api.amoramatch.one').replace(/\/+$/, '');

const TYPE_LABELS = {
  avatar_frame: 'Avatar Frames',
  entrance_effect: 'Entrance Effects',
  badge: 'Badges',
  chat_bubble: 'Chat Bubbles',
  profile_card: 'Profile Cards'
};

export default function Store() {
  const router = useRouter();
  const [catalog, setCatalog] = useState([]);
  const [owned, setOwned] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [purchasingId, setPurchasingId] = useState(null);
  const [tab, setTab] = useState('catalog'); // catalog | owned

  const authHeaders = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  };

  const load = async () => {
    const headers = authHeaders();
    if (!headers) {
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [catalogRes, ownedRes, walletRes] = await Promise.all([
        fetch(`${API}/store/catalog`),
        fetch(`${API}/store/my`, { headers }),
        fetch(`${API}/wallet/me`, { headers })
      ]);
      if (!catalogRes.ok) throw new Error('Unable to load the store right now.');
      setCatalog(await catalogRes.json());
      if (ownedRes.ok) setOwned(await ownedRes.json());
      if (walletRes.ok) setBalance((await walletRes.json()).balance || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ownedIds = new Set(owned.map((o) => o.cosmetic_id));

  const purchase = async (item) => {
    const headers = authHeaders();
    if (!headers) return router.push('/login');
    if (balance < item.price_coins) {
      setMessage("You don't have enough coins for this item.");
      return;
    }
    setPurchasingId(item.id);
    setMessage('');
    try {
      const res = await fetch(`${API}/store/purchase`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ cosmeticId: item.id })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Purchase failed.');
      setMessage(data.message === 'Cosmetic extended successfully' ? `Extended ${item.name}!` : `Purchased ${item.name}!`);
      await load();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setPurchasingId(null);
    }
  };

  const toggleEquip = async (userCosmetic) => {
    const headers = authHeaders();
    if (!headers) return;
    const endpoint = userCosmetic.is_equipped ? 'unequip' : 'equip';
    try {
      const res = await fetch(`${API}/store/${endpoint}`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ cosmeticId: userCosmetic.cosmetic_id })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to update this item.');
      await load();
    } catch (e) {
      setMessage(e.message);
    }
  };

  const grouped = catalog.reduce((acc, item) => {
    (acc[item.type] = acc[item.type] || []).push(item);
    return acc;
  }, {});

  return (
    <Layout>
      <div style={s.page}>
        <div style={s.header}>
          <div><span className="amora-kicker">AMORA ROYAL SHOP</span><h1 style={s.title}>Boutique</h1><p style={{margin:'5px 0 0',color:'#77718a',fontSize:13}}>Wear the attention. Own your aura.</p></div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}><Link href="/outfits" className="amora-soft-action">✨ My Outfits</Link><div style={s.balance}>🪙 {balance}</div></div>
        </div>

        <div style={s.tabs}>
          <button style={tab === 'catalog' ? s.tabActive : s.tab} onClick={() => setTab('catalog')}>Catalog</button>
          <button style={tab === 'owned' ? s.tabActive : s.tab} onClick={() => setTab('owned')}>My Items ({owned.length})</button>
        </div>

        {message && <div style={s.message}>{message}</div>}
        {error && <div style={s.error}>{error}</div>}

        {loading ? (
          <div style={s.centerMsg}>Loading the boutique…</div>
        ) : tab === 'catalog' ? (
          Object.keys(grouped).length === 0 ? (
            <div style={s.centerMsg}>Nothing in the store right now.</div>
          ) : (
            Object.entries(grouped).map(([type, items]) => (
              <div key={type} style={{ marginBottom: 32 }}>
                <h2 style={s.sectionTitle}>{TYPE_LABELS[type] || type}</h2>
                <div style={s.grid}>
                  {items.map((item) => {
                    const alreadyOwned = ownedIds.has(item.id);
                    return (
                      <div key={item.id} style={s.card}>
                        <div style={s.imageWrap}>
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} style={s.image} />
                          ) : (
                            <span style={{ fontSize: 40 }}>✨</span>
                          )}
                        </div>
                        <div style={s.cardName}>{item.name}</div>
                        <div style={s.cardMeta}>
                          {item.duration_days ? `${item.duration_days} days` : 'Permanent'}
                        </div>
                        <div style={s.cardPrice}>🪙 {item.price_coins}</div>
                        <button
                          style={alreadyOwned && !item.duration_days ? s.ownedBtn : s.buyBtn}
                          disabled={purchasingId === item.id || (alreadyOwned && !item.duration_days)}
                          onClick={() => purchase(item)}
                        >
                          {purchasingId === item.id
                            ? 'Processing…'
                            : alreadyOwned
                              ? (item.duration_days ? 'Extend' : 'Owned')
                              : 'Buy'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )
        ) : owned.length === 0 ? (
          <div style={s.centerMsg}>You don't own any items yet. Check the catalog!</div>
        ) : (
          <div style={s.grid}>
            {owned.map((o) => (
              <div key={o.cosmetic_id} style={s.card}>
                <div style={s.imageWrap}>
                  {o.cosmetic.image_url ? (
                    <img src={o.cosmetic.image_url} alt={o.cosmetic.name} style={s.image} />
                  ) : (
                    <span style={{ fontSize: 40 }}>✨</span>
                  )}
                </div>
                <div style={s.cardName}>{o.cosmetic.name}</div>
                <div style={s.cardMeta}>
                  {o.expires_at ? `Expires ${new Date(o.expires_at).toLocaleDateString()}` : 'Permanent'}
                </div>
                <button
                  style={o.is_equipped ? s.equippedBtn : s.buyBtn}
                  onClick={() => toggleEquip(o)}
                >
                  {o.is_equipped ? 'Equipped ✓' : 'Equip'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

const s = {
  page: { maxWidth: 960, margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: '#fff', fontSize: 28, margin: 0 },
  balance: { color: '#ffd45c', fontWeight: 'bold', background: '#1a1a2e', padding: '8px 16px', borderRadius: 20 },
  tabs: { display: 'flex', gap: 8, marginBottom: 20 },
  tab: { background: 'transparent', border: '1px solid #333', color: '#aaa', padding: '8px 18px', borderRadius: 20, cursor: 'pointer' },
  tabActive: { background: '#FF6B9D', border: '1px solid #FF6B9D', color: '#fff', padding: '8px 18px', borderRadius: 20, cursor: 'pointer' },
  message: { color: '#8f8', background: '#1a3a1a', padding: 10, borderRadius: 8, marginBottom: 16, textAlign: 'center' },
  error: { color: '#ff6b6b', textAlign: 'center', marginBottom: 16 },
  centerMsg: { color: '#888', textAlign: 'center', padding: '60px 0' },
  sectionTitle: { color: '#fff', fontSize: 18, marginBottom: 12 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 },
  card: { background: '#161625', border: '1px solid #2a2a3e', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  imageWrap: { width: '100%', aspectRatio: '1 / 1', background: '#0f0f1a', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  cardName: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  cardMeta: { color: '#888', fontSize: 12 },
  cardPrice: { color: '#ffd45c', fontWeight: 'bold' },
  buyBtn: { width: '100%', background: '#FF6B9D', border: 'none', color: '#fff', padding: '8px 0', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' },
  ownedBtn: { width: '100%', background: '#333', border: 'none', color: '#888', padding: '8px 0', borderRadius: 8, cursor: 'not-allowed' },
  equippedBtn: { width: '100%', background: '#35df70', border: 'none', color: '#06110a', padding: '8px 0', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }
};
