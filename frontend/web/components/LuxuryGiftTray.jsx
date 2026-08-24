import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';
import GiftIcon from './GiftIcon';

const RARITY = {
  common: { label: 'Classic', accent: '#a9a5b5' }, uncommon: { label: 'Uncommon', accent: '#5de0ae' },
  rare: { label: 'Rare', accent: '#55b8ff' }, epic: { label: 'Epic', accent: '#b875ff' },
  legendary: { label: 'Legendary', accent: '#ffd45e' }, mythic: { label: 'Mythic', accent: '#ff5fc8' }
};
const GRADIENT = 'linear-gradient(135deg,#ff3f9d 0%,#ff5da8 35%,#9b35ff 100%)';

export default function LuxuryGiftTray({ receiverId, onSent, onClose }) {
  const [gifts, setGifts] = useState([]); const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null); const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true); const [sending, setSending] = useState(false); const [message, setMessage] = useState('');

  useEffect(() => {
    let alive = true;
    apiFetch('/gifts/catalog').then(async r => { if (!r.ok) throw new Error('Unable to load gifts'); return r.json(); })
      .then(data => alive && setGifts(Array.isArray(data) ? data : []))
      .catch(err => alive && setMessage(err.message || 'Unable to load gifts'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const categories = useMemo(() => ['all', ...Array.from(new Set(gifts.map(g => String(g.category || '').toLowerCase()).filter(Boolean)))], [gifts]);
  const visible = category === 'all' ? gifts : gifts.filter(g => String(g.category || '').toLowerCase() === category);
  const meta = selected ? (RARITY[String(selected.rarity || 'common').toLowerCase()] || RARITY.common) : null;

  const sendGift = async () => {
    if (!receiverId || !selected || sending) return;
    setSending(true); setMessage('');
    try {
      const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const res = await apiFetch('/gifts/send', { method: 'POST', body: JSON.stringify({ giftId: selected.id, receiverId, quantity, idempotencyKey }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to send gift');
      const transaction = data.transaction || data;
      const sentGift = { ...(transaction.gift || selected), quantity: transaction.quantity || quantity, transaction };
      setSelected(null); setQuantity(1); setMessage(`✦ ${sentGift.quantity} × ${sentGift.name} sent`); onSent?.(sentGift);
    } catch (err) { setMessage(err.message || 'Unable to send gift'); }
    finally { setSending(false); }
  };

  return <section className="amora-luxury-tray" aria-label="Amora luxury gifts">
    <div className="amora-luxury-tray-head">
      <div><span className="amora-luxury-kicker">AMORA PRIVATE COLLECTION</span><h3>Send something unforgettable</h3><p>Three-dimensional gifts designed to feel rare, expressive and alive.</p></div>
      <button type="button" className="amora-luxury-close" onClick={onClose} aria-label="Close gifts">×</button>
    </div>
    <div className="amora-luxury-categories">
      {categories.map(item => <button type="button" key={item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)}>{item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}</button>)}
    </div>
    {loading ? <div className="amora-luxury-loading">Curating the collection…</div> : visible.length === 0 ? <div className="amora-luxury-loading">No gifts available right now.</div> :
      <div className="amora-luxury-scroller">
        {visible.map(gift => { const r = RARITY[String(gift.rarity || 'common').toLowerCase()] || RARITY.common; const active = selected?.id === gift.id;
          return <button type="button" key={gift.id} className={`amora-luxury-gift-card${active ? ' is-selected' : ''}`} style={{ '--gift-accent': r.accent }} onClick={() => { setSelected(gift); setQuantity(1); setMessage(''); }}>
            <span className="amora-luxury-rarity">{r.label}</span><span className="amora-luxury-art"><GiftIcon name={gift.name} glyph={gift.glyph} rarity={gift.rarity} size={72} animated={gift.rarity === 'legendary' || gift.rarity === 'mythic'} /></span>
            <strong>{gift.name}</strong><span className="amora-luxury-price">◉ {Number(gift.coin_price || 0).toLocaleString()}</span><i className="amora-luxury-card-shine" />
          </button>;
        })}
      </div>}
    {selected && <div className="amora-luxury-selected" style={{ '--gift-accent': meta.accent }}>
      <div className="amora-luxury-selected-art"><GiftIcon name={selected.name} glyph={selected.glyph} rarity={selected.rarity} size={104} animated /></div>
      <div className="amora-luxury-selected-info"><span className="amora-luxury-rarity">{meta.label}</span><strong>{selected.name}</strong><p>{selected.description || 'A premium Amora gesture, crafted for the moment.'}</p>
        <div className="amora-luxury-quantity"><button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button><b>{quantity}</b><button type="button" onClick={() => setQuantity(q => Math.min(100, q + 1))}>+</button><span>◉ {(Number(selected.coin_price || 0) * quantity).toLocaleString()}</span></div>
      </div><button type="button" className="amora-luxury-send" disabled={sending || !receiverId} onClick={sendGift}>{sending ? 'Sending…' : 'Send Gift'}</button>
    </div>}
    {message && <div className="amora-luxury-message">{message}</div>}
    <style jsx>{`
      .amora-luxury-tray{position:relative;z-index:8;padding:18px max(14px,calc((100vw - 1120px)/2));border-top:1px solid rgba(255,255,255,.09);background:radial-gradient(circle at 12% 0%,rgba(255,55,175,.16),transparent 30%),radial-gradient(circle at 88% 100%,rgba(122,55,255,.14),transparent 34%),rgba(9,7,17,.97);backdrop-filter:blur(28px);box-shadow:0 -22px 70px rgba(0,0,0,.42),inset 0 1px rgba(255,255,255,.08)}
      .amora-luxury-tray-head{display:flex;align-items:center;justify-content:space-between;gap:16px}.amora-luxury-kicker{display:block;color:#d9a4ff;font-size:8px;letter-spacing:.24em;font-weight:900}.amora-luxury-tray h3{margin:5px 0 2px;color:#fff;font-size:18px}.amora-luxury-tray p{margin:0;color:#7f768e;font-size:10px}.amora-luxury-close{width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.12);color:#d9d0e2;background:rgba(255,255,255,.045);font-size:23px;cursor:pointer}.amora-luxury-categories{display:flex;gap:7px;overflow-x:auto;margin:13px 0 10px;padding-bottom:2px;scrollbar-width:none}.amora-luxury-categories button{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);color:#82788d;padding:7px 12px;border-radius:999px;font-size:9px;white-space:nowrap;cursor:pointer}.amora-luxury-categories button.is-active{color:#fff;border-color:rgba(255,82,185,.6);background:${GRADIENT};box-shadow:0 8px 24px rgba(255,63,157,.18)}
      .amora-luxury-scroller{display:flex;gap:10px;overflow-x:auto;padding:3px 3px 11px;scrollbar-width:thin}.amora-luxury-gift-card{--gift-accent:#a9a5b5;position:relative;flex:0 0 112px;height:154px;overflow:hidden;padding:8px;border-radius:21px;border:1px solid rgba(255,255,255,.08);border-bottom-color:var(--gift-accent);background:linear-gradient(155deg,rgba(255,255,255,.08),rgba(255,255,255,.018));color:#fff;cursor:pointer;text-align:center;box-shadow:inset 0 1px rgba(255,255,255,.06),0 10px 24px rgba(0,0,0,.22);transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}.amora-luxury-gift-card:hover,.amora-luxury-gift-card.is-selected{transform:translateY(-5px);border-color:var(--gift-accent);box-shadow:0 18px 40px rgba(0,0,0,.35),0 0 30px color-mix(in srgb,var(--gift-accent) 18%,transparent)}.amora-luxury-rarity{display:block;color:var(--gift-accent,#ff75c6);font-size:7px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.amora-luxury-art{height:92px;display:grid;place-items:center}.amora-luxury-gift-card strong{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:9px}.amora-luxury-price{display:block;margin-top:4px;color:#aaa0b5;font-size:8px}.amora-luxury-card-shine{position:absolute;width:70px;height:180px;left:-100px;top:-30px;transform:rotate(22deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);pointer-events:none;transition:left .7s ease}.amora-luxury-gift-card:hover .amora-luxury-card-shine{left:140px}
      .amora-luxury-selected{display:flex;align-items:center;gap:14px;margin-top:8px;padding:10px 12px;border:1px solid color-mix(in srgb,var(--gift-accent) 32%,rgba(255,255,255,.08));border-radius:22px;background:linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,.025));box-shadow:inset 0 1px rgba(255,255,255,.08),0 12px 35px rgba(0,0,0,.25)}.amora-luxury-selected-art{width:96px;height:96px;flex:0 0 96px;display:grid;place-items:center}.amora-luxury-selected-info{min-width:0;flex:1}.amora-luxury-selected-info strong{display:block;color:#fff;font-size:15px;margin-top:2px}.amora-luxury-selected-info p{margin:4px 0 8px;color:#81788d;font-size:9px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.amora-luxury-quantity{display:flex;align-items:center;gap:7px}.amora-luxury-quantity button{width:26px;height:26px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:#17121f;color:#fff;cursor:pointer}.amora-luxury-quantity b{min-width:15px;text-align:center;font-size:10px}.amora-luxury-quantity span{margin-left:4px;color:#ffd86b;font-size:9px;font-weight:900}.amora-luxury-send{border:0;border-radius:14px;padding:13px 17px;color:#fff;background:${GRADIENT};font-size:10px;font-weight:900;white-space:nowrap;cursor:pointer;box-shadow:0 10px 28px rgba(255,55,170,.25)}.amora-luxury-send:disabled{opacity:.55;cursor:default}.amora-luxury-loading,.amora-luxury-message{padding:14px 2px;color:#81788d;font-size:10px;text-align:center}.amora-luxury-message{color:#ff9bd4}@media(max-width:620px){.amora-luxury-tray{padding-left:8px;padding-right:8px}.amora-luxury-selected{flex-wrap:wrap}.amora-luxury-selected-info{min-width:calc(100% - 110px)}.amora-luxury-send{width:100%}}
    `}</style>
  </section>;
}
