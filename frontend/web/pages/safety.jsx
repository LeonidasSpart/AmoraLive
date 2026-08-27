// pages/safety.jsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { apiFetch, getRefreshToken } from '../lib/api';
import VerifiedBadge from '../components/VerifiedBadge';
import { useTranslation } from '../lib/i18n';

const STATUS_COLORS = { pending: '#ffd166', reviewing: '#3fa9ff', resolved: '#8f8', dismissed: '#777' };

export default function SafetyCenter() {
  const { t } = useTranslation();
  const router = useRouter();
  const [tab, setTab] = useState('blocked');
  const [blocked, setBlocked] = useState([]);
  const [muted, setMuted] = useState([]);
  const [reports, setReports] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [security, setSecurity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    if (!localStorage.getItem('accessToken')) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const [blockedRes, mutedRes, reportsRes, sessionsRes, securityRes] = await Promise.all([
        apiFetch('/users/me/blocks'),
        apiFetch('/safety/muted'),
        apiFetch('/safety/my-reports'),
        apiFetch('/safety/sessions'),
        apiFetch('/safety/security/overview')
      ]);
      if (blockedRes.ok) setBlocked((await blockedRes.json()).blocks || []);
      if (mutedRes.ok) setMuted(await mutedRes.json());
      if (reportsRes.ok) setReports(await reportsRes.json());
      if (sessionsRes.ok) setSessions(await sessionsRes.json());
      if (securityRes.ok) setSecurity(await securityRes.json());
    } catch (e) {
      setError(t('safety.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unblock = async (userId) => {
    try {
      const res = await apiFetch('/users/me/unblock', { method: 'POST', body: JSON.stringify({ userId }) });
      if (res.ok) setBlocked((prev) => prev.filter((u) => u.id !== userId));
    } catch {}
  };

  const unmute = async (userId) => {
    try {
      const res = await apiFetch('/safety/unmute', { method: 'POST', body: JSON.stringify({ userId }) });
      if (res.ok) setMuted((prev) => prev.filter((u) => u.id !== userId));
    } catch {}
  };

  const revokeSession = async (sessionId) => {
    try {
      const res = await apiFetch(`/safety/sessions/${sessionId}`, { method: 'DELETE' });
      if (res.ok) setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch {}
  };

  const revokeOthers = async () => {
    if (!confirm(t('safety.revokeOthersConfirm'))) return;
    try {
      const res = await apiFetch('/safety/sessions/revoke-others', {
        method: 'POST',
        body: JSON.stringify({ currentRefreshToken: getRefreshToken() })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage(`${t('safety.signedOutOf')} ${data.revokedCount} ${data.revokedCount === 1 ? t('safety.otherDevice') : t('safety.otherDevices')}`);
        await load();
      }
    } catch {}
  };

  const tabs = [
    { key: 'blocked', label: `${t('safety.tabBlocked')} (${blocked.length})` },
    { key: 'muted', label: `${t('safety.tabMuted')} (${muted.length})` },
    { key: 'reports', label: `${t('safety.tabMyReports')} (${reports.length})` },
    { key: 'sessions', label: `${t('safety.tabDevices')} (${sessions.length})` }
  ];

  if (loading) {
    return (
      <Layout>
        <div style={s.wrap}><p style={{ color: '#999' }}>{t('common.loading')}</p></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={s.wrap}>
        <h1 style={s.title}>{t('safety.title')}</h1>
        {security && (
          <div style={s.securityCard}>
            <div style={s.securityOrb}><strong>{security.score}</strong><span>/100</span></div>
            <div style={{ flex: 1 }}>
              <div style={s.securityKicker}>{t('safety.securityKicker')}</div>
              <h2 style={s.securityTitle}>{security.score >= 90 ? t('safety.excellentProtection') : security.score >= 75 ? t('safety.strongProtection') : t('safety.protectionNeedsAttention')}</h2>
              <p style={s.securityText}>{security.recommendations?.[0]}</p>
              <div style={s.securityChips}><span>{security.emailVerified ? t('safety.emailVerified') : t('safety.reviewEmail')}</span><span>{security.activeSessions} {security.activeSessions === 1 ? t('safety.device') : t('safety.devices')}</span><span>{security.privacyConfigured ? t('safety.privacyConfigured') : t('safety.reviewPrivacy')}</span></div>
            </div>
          </div>
        )}
        {message && <div style={s.success}>{message}</div>}
        {error && <div style={s.error}>{error}</div>}

        <div style={s.linkRow}>
          <Link href="/settings" style={s.linkChip}>{t('safety.changePassword')}</Link>
          <Link href="/settings" style={s.linkChip}>{t('safety.privacySettings')}</Link>
        </div>

        <div style={s.tabRow}>
          {tabs.map((tabItem) => (
            <button key={tabItem.key} onClick={() => setTab(tabItem.key)} style={{ ...s.tabBtn, ...(tab === tabItem.key ? s.tabBtnActive : {}) }}>{tabItem.label}</button>
          ))}
        </div>

        {tab === 'blocked' && (
          blocked.length === 0 ? <p style={s.empty}>{t('safety.noBlockedUsers')}</p> : (
            <div style={s.list}>
              {blocked.map((u) => (
                <div key={u.id} style={s.row}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>{u.display_name || u.username}<VerifiedBadge user={u} size={12} /></span>
                  <button onClick={() => unblock(u.id)} style={s.actionBtn}>{t('safety.unblock')}</button>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'muted' && (
          muted.length === 0 ? <p style={s.empty}>{t('safety.noMutedUsers')}</p> : (
            <div style={s.list}>
              {muted.map((u) => (
                <div key={u.id} style={s.row}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>{u.display_name || u.username}<VerifiedBadge user={u} size={12} /></span>
                  <button onClick={() => unmute(u.id)} style={s.actionBtn}>{t('safety.unmute')}</button>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'reports' && (
          reports.length === 0 ? <p style={s.empty}>{t('safety.noReportsSubmitted')}</p> : (
            <div style={s.list}>
              {reports.map((r) => (
                <div key={r.id} style={s.reportRow}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, textTransform: 'capitalize' }}>{r.target_type} — {r.category.replace(/_/g, ' ')}</div>
                    <div style={{ color: '#777', fontSize: 11 }}>{new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                  <span style={{ ...s.statusBadge, color: STATUS_COLORS[r.status] || '#999' }}>{r.status}</span>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'sessions' && (
          <div>
            {sessions.length > 1 && (
              <button onClick={revokeOthers} style={s.revokeAllBtn}>{t('safety.logOutAllOtherDevices')}</button>
            )}
            <div style={s.list}>
              {sessions.map((sess) => (
                <div key={sess.id} style={s.row}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{sess.device_info ? sess.device_info.slice(0, 60) : t('safety.unknownDevice')}</div>
                    <div style={{ color: '#777', fontSize: 11 }}>{sess.ip_address || t('safety.unknownLocation')} · {t('safety.signedInPrefix')} {new Date(sess.created_at).toLocaleDateString()}</div>
                  </div>
                  <button onClick={() => revokeSession(sess.id)} style={s.actionBtn}>{t('safety.revoke')}</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

const s = {
  wrap: { maxWidth: 640, margin: '0 auto', padding: '24px 16px', color: '#fff' },
  title: { fontSize: 24, marginBottom: 16 },
  securityCard: { display: 'flex', gap: 16, alignItems: 'center', padding: 18, marginBottom: 18, borderRadius: 22, border: '1px solid rgba(255,216,107,.2)', background: 'radial-gradient(circle at 85% 0%, rgba(155,53,255,.2), transparent 38%), linear-gradient(145deg,#171126,#0b0712)', boxShadow: '0 20px 60px rgba(0,0,0,.3)' },
  securityOrb: { width: 76, height: 76, borderRadius: 38, border: '2px solid #ffd86b', background: 'rgba(255,216,107,.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' },
  securityOrbStrong: { fontSize: 26 },
  'securityOrb span': { color: '#9f96aa', fontSize: 9 },
  securityKicker: { color: '#ffd86b', fontSize: 8, fontWeight: 900, letterSpacing: 2 },
  securityTitle: { margin: '4px 0', color: '#fff', fontSize: 17 },
  securityText: { margin: 0, color: '#aaa1b5', fontSize: 11, lineHeight: 1.5 },
  securityChips: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 9 },
  'securityChips span': { padding: '4px 7px', borderRadius: 999, background: 'rgba(255,255,255,.05)', color: '#cfc7d8', fontSize: 9 },
  success: { color: '#8f8', background: 'rgba(20,90,20,0.3)', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14 },
  error: { color: '#ff6b6b', background: 'rgba(90,20,20,0.3)', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14 },
  linkRow: { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  linkChip: { background: '#161625', border: '1px solid #2a2a3e', borderRadius: 10, padding: '8px 14px', color: '#ccc', textDecoration: 'none', fontSize: 13 },
  tabRow: { display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' },
  tabBtn: { padding: '6px 14px', borderRadius: 16, border: '1px solid #2a2a3e', background: 'transparent', color: '#999', cursor: 'pointer', fontSize: 12 },
  tabBtnActive: { background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', color: '#fff', border: 'none', fontWeight: 700 },
  empty: { color: '#777', fontSize: 13, padding: '20px 0' },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161625', border: '1px solid #2a2a3e', borderRadius: 10, padding: '10px 14px', fontSize: 13 },
  reportRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161625', border: '1px solid #2a2a3e', borderRadius: 10, padding: '10px 14px' },
  statusBadge: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase' },
  actionBtn: { background: 'rgba(255,255,255,0.08)', border: '1px solid #444', color: '#ccc', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' },
  revokeAllBtn: { width: '100%', padding: 10, borderRadius: 10, border: '1px solid #ff5050', background: 'rgba(255,60,60,0.1)', color: '#ff8080', fontSize: 13, cursor: 'pointer', marginBottom: 14 }
};
