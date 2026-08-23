import React, { useMemo, useState } from 'react';

const RARITY = {
  common: { label: 'Common', className: 'common' },
  uncommon: { label: 'Uncommon', className: 'uncommon' },
  rare: { label: 'Rare', className: 'rare' },
  epic: { label: 'Epic', className: 'epic' },
  legendary: { label: 'Legendary', className: 'legendary' },
  mythic: { label: 'Mythic', className: 'mythic' },
};

function rarityMeta(rarity) {
  const key = String(rarity || 'rare').toLowerCase();
  return RARITY[key] || {
    label: key.charAt(0).toUpperCase() + key.slice(1),
    className: key.replace(/[^a-z0-9_-]/g, '') || 'rare'
  };
}

export default function LuxuryGiftShowcase({ gifts = [], title = 'Luxury Gift Collection' }) {
  const [selected, setSelected] = useState(null);

  const items = useMemo(() => {
    const map = new Map();

    for (const tx of Array.isArray(gifts) ? gifts : []) {
      const gift = tx?.gift || tx;
      if (!gift?.id) continue;

      const current = map.get(gift.id) || {
        gift,
        quantity: 0,
        coins: 0,
        transactions: 0
      };

      current.quantity += Number(tx?.quantity || 1);
      current.coins += Number(
        tx?.coin_cost || (gift.coin_price || 0) * Number(tx?.quantity || 1)
      );
      current.transactions += 1;
      map.set(gift.id, current);
    }

    return [...map.values()].sort(
      (a, b) => b.coins - a.coins || b.quantity - a.quantity
    );
  }, [gifts]);

  return (
    <section className="luxury-shell">
      <div className="luxury-head">
        <div>
          <span className="eyebrow">AMORA • PRIVATE COLLECTION</span>
          <h2>{title}</h2>
          <p>
            Gifts received, presented like a premium collection — not a basic
            inventory list.
          </p>
        </div>
        <div className="collection-mark">✦</div>
      </div>

      {items.length === 0 ? (
        <div className="empty-collection">
          <div className="empty-icon">✦</div>
          <strong>Your luxury collection is waiting.</strong>
          <span>
            When someone sends you a gift, it will appear here with its rarity,
            value and artwork.
          </span>
        </div>
      ) : (
        <div className="gift-grid">
          {items.map(({ gift, quantity, coins, transactions }) => {
            const meta = rarityMeta(gift.rarity);

            return (
              <button
                type="button"
                key={gift.id}
                className={`gift-card ${meta.className}`}
                onClick={() =>
                  setSelected({ gift, quantity, coins, transactions })
                }
              >
                <span className="rarity">{meta.label}</span>

                <span className="art">
                  {gift.image_url ? (
                    <img src={gift.image_url} alt="" loading="lazy" />
                  ) : (
                    <span>{gift.glyph || '✦'}</span>
                  )}
                </span>

                <span className="gift-name">{gift.name}</span>
                <span className="gift-value">
                  ◉ {Number(gift.coin_price || 0).toLocaleString()}
                </span>
                <span className="owned">×{quantity}</span>
                <span className="shine" />
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div
          className="gift-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <div
            className={`modal-card ${rarityMeta(selected.gift.rarity).className}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              ×
            </button>

            <span className="modal-rarity">
              {rarityMeta(selected.gift.rarity).label}
            </span>

            <div className="modal-art">
              {selected.gift.image_url ? (
                <img src={selected.gift.image_url} alt="" />
              ) : (
                <span>{selected.gift.glyph || '✦'}</span>
              )}
            </div>

            <h3>{selected.gift.name}</h3>

            {selected.gift.description && (
              <p>{selected.gift.description}</p>
            )}

            <div className="modal-stats">
              <div>
                <b>×{selected.quantity}</b>
                <span>Received</span>
              </div>
              <div>
                <b>◉ {selected.coins.toLocaleString()}</b>
                <span>Total value</span>
              </div>
              <div>
                <b>{selected.transactions}</b>
                <span>Transactions</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .luxury-shell {
          position: relative;
          margin-top: 22px;
          padding: 26px;
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 28px;
          background:
            radial-gradient(circle at 85% 0%, rgba(255,65,175,.12), transparent 34%),
            linear-gradient(145deg, #151022, #0b0913 68%, #160b20);
          box-shadow: 0 24px 80px rgba(0,0,0,.38),
            inset 0 1px rgba(255,255,255,.05);
          overflow: hidden;
        }

        .luxury-shell:before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            115deg,
            transparent 0 35%,
            rgba(255,255,255,.035) 45%,
            transparent 55%
          );
          transform: translateX(-55%);
          animation: sweep 8s ease-in-out infinite;
        }

        .luxury-head {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 22px;
        }

        .eyebrow {
          font-size: 10px;
          letter-spacing: .24em;
          color: #dca8ff;
          font-weight: 800;
        }

        .luxury-head h2 {
          margin: 7px 0 5px;
          color: #fff;
          font-size: 25px;
          letter-spacing: -.02em;
        }

        .luxury-head p {
          margin: 0;
          color: #8f879d;
          font-size: 13px;
          max-width: 620px;
        }

        .collection-mark {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          color: #ff76c8;
          font-size: 25px;
          background: linear-gradient(
            145deg,
            rgba(255,83,185,.16),
            rgba(145,63,255,.12)
          );
          border: 1px solid rgba(255,120,205,.2);
          box-shadow: 0 0 35px rgba(255,60,180,.12);
        }

        .gift-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 15px;
        }

        .gift-card {
          position: relative;
          min-height: 210px;
          padding: 15px 12px 13px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 22px;
          background: linear-gradient(
            145deg,
            rgba(255,255,255,.065),
            rgba(255,255,255,.018)
          );
          color: #fff;
          text-align: left;
          cursor: pointer;
          overflow: hidden;
          transition: transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease;
        }

        .gift-card:hover {
          transform: translateY(-5px) scale(1.015);
          border-color: rgba(255,255,255,.24);
          box-shadow: 0 18px 40px rgba(0,0,0,.38);
        }

        .gift-card .rarity,
        .modal-rarity {
          display: inline-flex;
          padding: 4px 8px;
          border-radius: 999px;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .12em;
          font-weight: 900;
          background: rgba(255,255,255,.07);
          color: #bbb;
        }

        .gift-card .art {
          height: 112px;
          display: grid;
          place-items: center;
          margin: 3px 0 7px;
          position: relative;
          z-index: 1;
        }

        .gift-card img {
          width: 96px;
          height: 96px;
          object-fit: contain;
          filter: drop-shadow(0 10px 18px rgba(255,70,190,.22));
          transition: transform .3s ease;
        }

        .gift-card:hover img {
          transform: scale(1.1) rotate(-2deg);
        }

        .gift-card .art > span {
          font-size: 58px;
          color: #ff77cb;
          text-shadow: 0 0 30px rgba(255,80,190,.45);
        }

        .gift-name {
          display: block;
          font-size: 14px;
          font-weight: 800;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .gift-value {
          display: block;
          margin-top: 5px;
          color: #d4b7e8;
          font-size: 11px;
        }

        .owned {
          position: absolute;
          right: 10px;
          bottom: 10px;
          padding: 4px 7px;
          border-radius: 8px;
          background: rgba(0,0,0,.32);
          font-size: 11px;
          font-weight: 800;
        }

        .shine {
          position: absolute;
          inset: -80% -30%;
          background: linear-gradient(
            100deg,
            transparent 45%,
            rgba(255,255,255,.1) 50%,
            transparent 55%
          );
          transform: rotate(12deg);
          animation: shine 6s ease-in-out infinite;
          pointer-events: none;
        }

        .common { box-shadow: inset 0 -2px 0 rgba(160,160,180,.4); }
        .uncommon { box-shadow: inset 0 -2px 0 rgba(92,220,170,.65); }
        .rare { box-shadow: inset 0 -2px 0 rgba(100,170,255,.7); }
        .epic { box-shadow: inset 0 -2px 0 rgba(183,93,255,.8); }
        .legendary { box-shadow: inset 0 -2px 0 rgba(255,174,60,.9); }
        .mythic {
          box-shadow:
            inset 0 -2px 0 rgba(255,67,177,1),
            0 0 25px rgba(255,55,170,.12);
        }

        .empty-collection {
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          border: 1px dashed rgba(255,255,255,.1);
          border-radius: 20px;
          color: #777;
          padding: 25px;
        }

        .empty-icon {
          font-size: 34px;
          color: #ff70c5;
          margin-bottom: 8px;
        }

        .empty-collection strong {
          color: #eee;
          font-size: 15px;
        }

        .empty-collection span {
          font-size: 12px;
          margin-top: 6px;
          max-width: 430px;
          line-height: 1.5;
        }

        .gift-modal {
          position: fixed;
          z-index: 9999;
          inset: 0;
          background: rgba(3,2,8,.78);
          backdrop-filter: blur(14px);
          display: grid;
          place-items: center;
          padding: 20px;
        }

        .modal-card {
          position: relative;
          width: min(430px,100%);
          padding: 30px;
          border-radius: 30px;
          text-align: center;
          background: linear-gradient(150deg,#1d1428,#0d0a13);
          border: 1px solid rgba(255,255,255,.14);
          box-shadow: 0 35px 100px rgba(0,0,0,.65);
        }

        .close {
          position: absolute;
          right: 15px;
          top: 12px;
          border: 0;
          background: rgba(255,255,255,.07);
          color: #fff;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          font-size: 23px;
          cursor: pointer;
        }

        .modal-art {
          height: 190px;
          display: grid;
          place-items: center;
        }

        .modal-art img {
          width: 170px;
          height: 170px;
          object-fit: contain;
          filter: drop-shadow(0 20px 35px rgba(255,50,190,.3));
        }

        .modal-art span {
          font-size: 95px;
          color: #ff6cc5;
        }

        .modal-card h3 {
          margin: 0;
          color: #fff;
          font-size: 27px;
        }

        .modal-card p {
          color: #9b92a8;
          line-height: 1.5;
          font-size: 13px;
        }

        .modal-stats {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 8px;
          margin-top: 20px;
        }

        .modal-stats div {
          padding: 12px 7px;
          border-radius: 15px;
          background: rgba(255,255,255,.045);
        }

        .modal-stats b {
          display: block;
          color: #fff;
          font-size: 14px;
        }

        .modal-stats span {
          display: block;
          margin-top: 3px;
          color: #7f778c;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        @keyframes sweep {
          0%,65% { transform: translateX(-55%); }
          85%,100% { transform: translateX(55%); }
        }

        @keyframes shine {
          0%,60% { transform: translateX(-30%) rotate(12deg); }
          100% { transform: translateX(30%) rotate(12deg); }
        }

        @media(max-width:640px) {
          .luxury-shell { padding: 18px; border-radius: 22px; }
          .gift-grid {
            grid-template-columns: repeat(2,minmax(0,1fr));
            gap: 10px;
          }
          .gift-card { min-height: 195px; }
          .gift-card .art { height: 100px; }
          .gift-card img { width: 82px; height: 82px; }
          .luxury-head h2 { font-size: 21px; }
        }
      `}</style>
    </section>
  );
}
