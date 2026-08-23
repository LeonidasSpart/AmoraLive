import React from 'react';
import { LUXURY_GIFT_ART } from './LuxuryGiftArt';

const RARITY_GLOW = {
  common: 'rgba(169,165,181,.15)',
  uncommon: 'rgba(93,224,174,.18)',
  rare: 'rgba(85,184,255,.20)',
  epic: 'rgba(184,117,255,.23)',
  legendary: 'rgba(255,212,94,.28)',
  mythic: 'rgba(255,95,200,.30)'
};

const FALLBACK = {
  common: ['#d5d2df','#706b7e'],
  uncommon: ['#8af5c6','#2eaf7b'],
  rare: ['#a9e2ff','#347bd6'],
  epic: ['#e4b9ff','#7d36d8'],
  legendary: ['#fff5a7','#d89412'],
  mythic: ['#ffd0ec','#a735ff']
};

export default function GiftIcon({ name, glyph, rarity='common', size=64, animated=false }) {
  const file = LUXURY_GIFT_ART[name];
  const r = String(rarity || 'common').toLowerCase();
  const [a,b] = FALLBACK[r] || FALLBACK.common;

  if (file) {
    return (
      <div style={{
        width:size,height:size,display:'grid',placeItems:'center',position:'relative',
        borderRadius:'22%',background:`radial-gradient(circle,${RARITY_GLOW[r] || RARITY_GLOW.common},transparent 72%)`,
        animation:animated ? 'luxuryFloat 2.2s ease-in-out infinite' : 'none'
      }}>
        <img src={`/gifts/luxury/${file}`} alt="" style={{
          width:'100%',height:'100%',objectFit:'contain',
          filter:`drop-shadow(0 10px 16px ${RARITY_GLOW[r] || RARITY_GLOW.common})`
        }} />
        {(r==='legendary'||r==='mythic') && <span style={{
          position:'absolute',inset:'7%',borderRadius:'25%',border:`1px solid ${a}55`,
          boxShadow:`0 0 22px ${a}33`,pointerEvents:'none'
        }} />}
        <style jsx>{`
          @keyframes luxuryFloat {
            0%,100% { transform:translateY(0) scale(1); }
            50% { transform:translateY(-4px) scale(1.035); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      width:size,height:size,display:'grid',placeItems:'center',borderRadius:'22%',
      background:`radial-gradient(circle,${a}25,transparent 70%)`,
      color:a,fontSize:size*.48,fontWeight:900
    }}>
      {glyph || '✦'}
    </div>
  );
}
