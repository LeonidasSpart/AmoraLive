import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';

const perks = [
  ['LV.1','Medal of Honor','A signature badge beside your profile','🏅'],
  ['LV.5','Glow Entrance','A premium entrance effect in live rooms','✨'],
  ['LV.10','Creator Chat','Unlock enhanced chat styling','💬'],
  ['LV.15','VIP Gift Set','Special gifts reserved for rising stars','🎁'],
  ['LV.20','Profile Spotlight','Your profile gets a premium highlight','💎'],
  ['LV.25','Elite Effects','Exclusive effects for entering live rooms','🌟'],
  ['LV.32','Golden Aura','A royal profile aura and badge','👑'],
  ['LV.40','Hidden Status','Optional discreet online visibility','🌙'],
  ['LV.50','Royal Creator','A signature creator identity and premium frame','👑'],
];

export default function Levels() {
  const [progressData, setProgressData] = useState(null);
  useEffect(() => {
    if (!localStorage.getItem('accessToken')) return;
    apiFetch('/users/me/xp-progress').then((r) => (r.ok ? r.json() : null)).then(setProgressData).catch(() => {});
  }, []);
  const level = Number(progressData?.level || 0);
  const xpIntoLevel = Number(progressData?.xpIntoLevel || 0);
  const xpForNextLevel = Number(progressData?.xpForNextLevel || 0);
  const progress = Math.min(100, Number(progressData?.progressPct || 0));
  return <Layout><div className="amora-level-page">
    <div className="amora-level-hero"><div><span className="amora-kicker">AMORA ROYAL CLUB</span><h1>Your level. Your aura.</h1><p>Every connection, gift and moment helps you unlock a more exclusive Amora identity.</p></div><div className="amora-level-badge"><span>LV.</span><strong>{level}</strong></div></div>
    <div className="amora-xp-card"><div className="amora-xp-top"><div><span>Current level</span><strong>Level {level}</strong></div><div><span>XP</span><strong>{xpIntoLevel} / {xpForNextLevel}</strong></div></div><div className="amora-xp-track"><i style={{width:`${progress}%`}} /></div><small>{Math.max(0, xpForNextLevel - xpIntoLevel)} XP until your next unlock</small></div>
    <div className="amora-section-heading"><div><h2>Privileges</h2><p>Build your status and collect your rewards.</p></div></div>
    <div className="amora-perk-list">{perks.map(([lv,title,desc,icon])=><div className={`amora-perk ${Number(lv.replace('LV.',''))<=level?'unlocked':''}`} key={lv}><span className="perk-icon">{icon}</span><div><em>{lv}</em><h3>{title}</h3><p>{desc}</p></div><b>{Number(lv.replace('LV.',''))<=level?'UNLOCKED':'LOCKED'}</b></div>)}</div>
  </div></Layout>;
}
