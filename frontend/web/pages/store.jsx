// pages/store.jsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { useTranslation } from '../lib/i18n';

export default function Store() {
  const { t } = useTranslation();
  const TYPE_LABELS = {
    avatar_frame: t('store.typeAvatarFrame'),
    entrance_effect: t('store.typeEntranceEffect'),
    badge: t('store.typeBadge'),
    chat_bubble: t('store.typeChatBubble'),
    profile_card: t('store.typeProfileCard')
  };
  const router = useRouter();
  const [catalog, setCatalog] = useState([]);
  const [owned, setOwned] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [purchasingId, setPurchasingId] = useState(null);
  const [tab, setTab] = useState('catalog'); // catalog | owned

  const load = async () => {
    if (!localStorage.getItem('accessToken')) {
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [catalogRes, ownedRes, walletRes] = await Promise.all([
        apiFetch('/store/catalog', {}, { skipAuth: true }),
        apiFetch('/store/my'),
        apiFetch('/wallet/me')
      ]);
      if (!catalogRes.ok) throw new Error(t('store.errorLoadStore'));
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
    if (!localStorage.getItem('accessToken')) return router.push('/login');
    if (balance < item.price_coins) {
      setMessage(t('store.notEnoughCoins'));
      return;
    }
    setPurchasingId(item.id);
    setMessage('');
    try {
      const res = await apiFetch('/store/purchase', {
        method: 'POST',
        body: JSON.stringify({ cosmeticId: item.id })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t('store.purchaseFailed'));
      setMessage(data.message === 'Cosmetic extended successfully' ? `${t('store.extendedPrefix')} ${item.name}!` : `${t('store.purchasedPrefix')} ${item.name}!`);
      await load();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setPurchasingId(null);
    }
  };

  const toggleEquip = async (userCosmetic) => {
    const endpoint = userCosmetic.is_equipped ? 'unequip' : 'equip';
    try {
      const res = await apiFetch(`/store/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify({ cosmeticId: userCosmetic.cosmetic_id })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t('store.updateItemFailed'));
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
          <div>
            <div style={s.kicker}>{t('store.kicker')}</div>
            <h1 style={s.title}>{t('store.title')}</h1>
            <p style={s.subtitle}>{t('store.subtitle')}</p>
          </div>
          <div style={s.balance}>🪙 {balance}</div>
        </div>

        <div style={s.tabs}>
          <button style={tab === 'catalog' ? s.tabActive : s.tab} onClick={() => setTab('catalog')}>{t('store.catalogTab')}</button>
          <button style={tab === 'owned' ? s.tabActive : s.tab} onClick={() => setTab('owned')}>{t('store.myItemsTab')} ({owned.length})</button>
          <button style={s.tab} onClick={() => router.push('/outfits')}>{t('store.equipOutfits')}</button>
        </div>

        {message && <div style={s.message}>{message}</div>}
        {error && <div style={s.error}>{error}</div>}

        {loading ? (
          <div style={s.centerMsg}>{t('store.loadingBoutique')}</div>
        ) : tab === 'catalog' ? (
          Object.keys(grouped).length === 0 ? (
            <div style={s.centerMsg}>{t('store.nothingInStore')}</div>
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
                          {item.duration_days ? `${item.duration_days} ${t('store.daysSuffix')}` : t('store.permanent')}
                        </div>
                        <div style={s.cardPrice}>🪙 {item.price_coins}</div>
                        <button
                          style={alreadyOwned && !item.duration_days ? s.ownedBtn : s.buyBtn}
                          disabled={purchasingId === item.id || (alreadyOwned && !item.duration_days)}
                          onClick={() => purchase(item)}
                        >
                          {purchasingId === item.id
                            ? t('store.processing')
                            : alreadyOwned
                              ? (item.duration_days ? t('store.extend') : t('store.owned'))
                              : t('store.buy')}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )
        ) : owned.length === 0 ? (
          <div style={s.centerMsg}>{t('store.noOwnedItems')}</div>
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
                  {o.expires_at ? `${t('store.expiresPrefix')} ${new Date(o.expires_at).toLocaleDateString()}` : t('store.permanent')}
                </div>
                <button
                  style={o.is_equipped ? s.equippedBtn : s.buyBtn}
                  onClick={() => toggleEquip(o)}
                >
                  {o.is_equipped ? t('store.equipped') : t('store.equip')}
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
  kicker: { color: '#ffd86b', fontSize: 8, fontWeight: 900, letterSpacing: 2.5, marginBottom: 5 },
  title: { color: '#fff', fontSize: 30, margin: 0 },
  subtitle: { color: '#92889e', fontSize: 12, margin: '6px 0 0', maxWidth: 540 },
  balance: { color: '#ffd45c', fontWeight: 'bold', background: '#1a1a2e', padding: '8px 16px', borderRadius: 20 },
  tabs: { display: 'flex', gap: 8, marginBottom: 20 },
  tab: { background: 'transparent', border: '1px solid #333', color: '#aaa', padding: '8px 18px', borderRadius: 20, cursor: 'pointer' },
  tabActive: { background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', border: '1px solid #FF6B9D', color: '#fff', padding: '8px 18px', borderRadius: 20, cursor: 'pointer' },
  message: { color: '#8f8', background: '#1a3a1a', padding: 10, borderRadius: 8, marginBottom: 16, textAlign: 'center' },
  error: { color: '#ff6b6b', textAlign: 'center', marginBottom: 16 },
  centerMsg: { color: '#888', textAlign: 'center', padding: '60px 0' },
  sectionTitle: { color: '#fff', fontSize: 18, marginBottom: 12 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 },
  card: { position: 'relative', overflow: 'hidden', background: 'radial-gradient(circle at 50% 0%, rgba(255,63,157,.12), transparent 42%), linear-gradient(145deg,#181126,#0d0915)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 22, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, boxShadow: '0 18px 45px rgba(0,0,0,.28), inset 0 1px rgba(255,255,255,.06)', transition: 'transform .25s ease, box-shadow .25s ease' },
  imageWrap: { width: '100%', aspectRatio: '1 / 1', background: 'radial-gradient(circle, rgba(139,77,255,.18), rgba(7,5,17,.35) 65%)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', transform: 'perspective(700px) rotateX(2deg)', boxShadow: 'inset 0 1px rgba(255,255,255,.08), 0 12px 30px rgba(0,0,0,.2)' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  cardName: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  cardMeta: { color: '#888', fontSize: 12 },
  cardPrice: { color: '#ffd45c', fontWeight: 'bold' },
  buyBtn: { width: '100%', background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', border: 'none', color: '#fff', padding: '8px 0', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' },
  ownedBtn: { width: '100%', background: '#333', border: 'none', color: '#888', padding: '8px 0', borderRadius: 8, cursor: 'not-allowed' },
  equippedBtn: { width: '100%', background: '#35df70', border: 'none', color: '#06110a', padding: '8px 0', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }
};
