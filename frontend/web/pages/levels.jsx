import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { useTranslation } from '../lib/i18n';

export default function Levels() {
  const { t } = useTranslation();
  const perks = [
    ['LV.1', t('levels.perk1Title'), t('levels.perk1Desc'), '🏅'],
    ['LV.5', t('levels.perk2Title'), t('levels.perk2Desc'), '✨'],
    ['LV.10', t('levels.perk3Title'), t('levels.perk3Desc'), '💬'],
    ['LV.15', t('levels.perk4Title'), t('levels.perk4Desc'), '🎁'],
    ['LV.20', t('levels.perk5Title'), t('levels.perk5Desc'), '💎'],
    ['LV.25', t('levels.perk6Title'), t('levels.perk6Desc'), '🌟'],
    ['LV.32', t('levels.perk7Title'), t('levels.perk7Desc'), '👑'],
    ['LV.40', t('levels.perk8Title'), t('levels.perk8Desc'), '🌙'],
    ['LV.50', t('levels.perk9Title'), t('levels.perk9Desc'), '👑'],
  ];
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
    <div className="amora-level-hero"><div><span className="amora-kicker">{t('levels.kicker')}</span><h1>{t('levels.title')}</h1><p>{t('levels.subtitle')}</p></div><div className="amora-level-badge"><span>LV.</span><strong>{level}</strong></div></div>
    <div className="amora-xp-card"><div className="amora-xp-top"><div><span>{t('levels.currentLevel')}</span><strong>{t('levels.levelPrefix')} {level}</strong></div><div><span>{t('levels.xpWord')}</span><strong>{xpIntoLevel} / {xpForNextLevel}</strong></div></div><div className="amora-xp-track"><i style={{width:`${progress}%`}} /></div><small>{Math.max(0, xpForNextLevel - xpIntoLevel)} {t('levels.xpUntilNext')}</small></div>
    <div className="amora-section-heading"><div><h2>{t('levels.privilegesTitle')}</h2><p>{t('levels.privilegesSubtitle')}</p></div></div>
    <div className="amora-perk-list">{perks.map(([lv,title,desc,icon])=><div className={`amora-perk ${Number(lv.replace('LV.',''))<=level?'unlocked':''}`} key={lv}><span className="perk-icon">{icon}</span><div><em>{lv}</em><h3>{title}</h3><p>{desc}</p></div><b>{Number(lv.replace('LV.',''))<=level?t('levels.unlocked'):t('levels.locked')}</b></div>)}</div>
  </div></Layout>;
}
