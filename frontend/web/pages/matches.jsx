// pages/matches.jsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import VerifiedBadge from '../components/VerifiedBadge';
import { useTranslation } from '../lib/i18n';

const GENDERS = ['woman', 'man', 'nonbinary'];

export default function Matches() {
  const { t } = useTranslation();
  const router = useRouter();
  const [tab, setTab] = useState('discover');
  const [candidate, setCandidate] = useState(null);
  const [candidateLoading, setCandidateLoading] = useState(true);
  const [candidateError, setCandidateError] = useState('');
  const [swiping, setSwiping] = useState(false);
  const [matchList, setMatchList] = useState([]);
  const [matchListLoading, setMatchListLoading] = useState(true);
  const [matchedToast, setMatchedToast] = useState(null);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState({ gender: '', showMe: [], minAge: 18, maxAge: 60 });

  const loadCandidate = async () => {
    setCandidateLoading(true);
    setCandidateError('');
    try {
      const res = await apiFetch('/matches/next');
      if (res.status === 404) {
        setCandidate(null);
      } else if (!res.ok) {
        throw new Error('Unable to load the next profile.');
      } else {
        setCandidate(await res.json());
      }
    } catch (e) {
      setCandidateError(e.message);
    } finally {
      setCandidateLoading(false);
    }
  };

  const loadMatches = async () => {
    setMatchListLoading(true);
    try {
      const res = await apiFetch('/matches');
      if (res.ok) setMatchList(await res.json());
    } catch {} finally {
      setMatchListLoading(false);
    }
  };

  const loadPrefs = async () => {
    try {
      const res = await apiFetch('/matches/preferences');
      if (res.ok) {
        const data = await res.json();
        setPrefs({ gender: data.gender || '', showMe: data.showMe || [], minAge: data.minAge || 18, maxAge: data.maxAge || 60 });
      }
    } catch {}
  };

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      router.push('/login');
      return;
    }
    loadCandidate();
    loadMatches();
    loadPrefs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const swipe = async (decision) => {
    if (!candidate || swiping) return;
    setSwiping(true);
    try {
      const res = await apiFetch('/matches/swipe', {
        method: 'POST',
        body: JSON.stringify({ targetUserId: candidate.id, decision })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to record that.');
      if (data.matched) {
        setMatchedToast(candidate);
        loadMatches();
      }
      await loadCandidate();
    } catch (e) {
      setCandidateError(e.message);
    } finally {
      setSwiping(false);
    }
  };

  const unmatch = async (matchId) => {
    if (!confirm(t('matches.unmatchConfirm'))) return;
    try {
      const res = await apiFetch(`/matches/${matchId}/unmatch`, { method: 'POST' });
      if (res.ok) setMatchList((prev) => prev.filter((m) => m.matchId !== matchId));
    } catch {}
  };

  const savePrefs = async () => {
    try {
      const res = await apiFetch('/matches/preferences', {
        method: 'PATCH',
        body: JSON.stringify(prefs)
      });
      if (res.ok) {
        setShowPrefs(false);
        loadCandidate();
      }
    } catch {}
  };

  const toggleShowMe = (g) => {
    setPrefs((p) => ({ ...p, showMe: p.showMe.includes(g) ? p.showMe.filter((x) => x !== g) : [...p.showMe, g] }));
  };

  return (
    <Layout>
      <div style={s.wrap}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={s.title}>{t('matches.title')}</h1>
          <button onClick={() => setShowPrefs(true)} style={s.prefsBtn}>{t('matches.preferencesBtn')}</button>
        </div>

        <div style={s.tabRow}>
          <button onClick={() => setTab('discover')} style={{ ...s.tabBtn, ...(tab === 'discover' ? s.tabBtnActive : {}) }}>{t('matches.tabDiscover')}</button>
          <button onClick={() => setTab('matches')} style={{ ...s.tabBtn, ...(tab === 'matches' ? s.tabBtnActive : {}) }}>{t('matches.tabMyMatches')} ({matchList.length})</button>
        </div>

        {matchedToast && (
          <div style={s.matchToast} onClick={() => setMatchedToast(null)}>
            {t('matches.matchedWithPrefix')} {matchedToast.display_name || matchedToast.username}{t('matches.matchedWithSuffix')}
          </div>
        )}

        {tab === 'discover' && (
          <div>
            {candidateLoading ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '60px 0' }}>{t('common.loading')}</p>
            ) : candidateError ? (
              <p style={{ color: '#ff6b6b', textAlign: 'center', padding: '40px 0' }}>{candidateError}</p>
            ) : !candidate ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                <p style={{ fontSize: 18 }}>{t('matches.noMoreProfiles')}</p>
                <p style={{ fontSize: 13 }}>{t('matches.widenPreferences')}</p>
              </div>
            ) : (
              <div style={s.card}>
                <div style={s.cardPhoto}>
                  {candidate.profile_photo ? (
                    <img src={candidate.profile_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 60 }}>{(candidate.display_name || candidate.username || '?')[0]?.toUpperCase()}</span>
                  )}
                  {candidate.compatibility && (
                    <div style={s.compatBadge}>{candidate.compatibility.score}{t('matches.matchPercentSuffix')}</div>
                  )}
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <h2 style={{ margin: 0, fontSize: 20 }}>{candidate.display_name || candidate.username}{candidate.age ? `, ${candidate.age}` : ''}</h2>
                    <VerifiedBadge user={candidate} size={16} />
                  </div>
                  {candidate.bio && <p style={{ color: '#ccc', fontSize: 14, marginTop: 8 }}>{candidate.bio}</p>}
                  {candidate.interests?.length > 0 && (
                    <div style={s.chipRow}>
                      {candidate.interests.map((i) => (
                        <span key={i} style={{ ...s.chip, ...(candidate.compatibility?.sharedInterests?.includes(i) ? s.chipShared : {}) }}>{i}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={s.actionRow}>
                  <button onClick={() => swipe('pass')} disabled={swiping} style={s.passBtn}>✕</button>
                  <button onClick={() => swipe('superlike')} disabled={swiping} style={s.superBtn}>⭐</button>
                  <button onClick={() => swipe('like')} disabled={swiping} style={s.likeBtn}>❤️</button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'matches' && (
          <div>
            {matchListLoading ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>{t('common.loading')}</p>
            ) : matchList.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>{t('matches.noMatchesYet')}</p>
            ) : (
              <div style={s.matchGrid}>
                {matchList.map((m) => (
                  <div key={m.matchId} style={s.matchCard}>
                    <div style={s.matchAvatar}>
                      {m.peer.profile_photo ? (
                        <img src={m.peer.profile_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      ) : (
                        (m.peer.display_name || m.peer.username || '?')[0]?.toUpperCase()
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 14 }}>
                      {m.peer.display_name || m.peer.username}
                      <VerifiedBadge user={m.peer} size={12} />
                    </div>
                    <div style={{ color: '#999', fontSize: 11 }}>{m.compatibility.score}{t('matches.compatiblePercentSuffix')}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 10, width: '100%' }}>
                      <Link href={`/chat/${m.peer.id}`} style={s.matchActionBtn}>💬</Link>
                      <Link href={`/matches/date/${m.matchId}`} style={s.matchActionBtn}>📹</Link>
                      <button onClick={() => unmatch(m.matchId)} style={{ ...s.matchActionBtn, background: 'rgba(255,80,80,0.15)', color: '#ff8080', border: 'none', cursor: 'pointer' }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showPrefs && (
          <div style={s.modalOverlay} onClick={() => setShowPrefs(false)}>
            <div style={s.modal} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginTop: 0 }}>{t('matches.prefsTitle')}</h3>
              <label style={s.label}>{t('matches.yourGender')}</label>
              <select value={prefs.gender} onChange={(e) => setPrefs({ ...prefs, gender: e.target.value })} style={s.select}>
                <option value="">{t('matches.preferNotToSay')}</option>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>

              <label style={s.label}>{t('matches.showMe')}</label>
              <div style={s.chipRow}>
                {GENDERS.map((g) => (
                  <button key={g} onClick={() => toggleShowMe(g)} style={{ ...s.chip, cursor: 'pointer', ...(prefs.showMe.includes(g) ? s.chipShared : {}) }}>{g}</button>
                ))}
              </div>

              <label style={s.label}>{t('matches.ageRangeLabel')} {prefs.minAge}–{prefs.maxAge}</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input type="number" min="18" max="99" value={prefs.minAge} onChange={(e) => setPrefs({ ...prefs, minAge: Number(e.target.value) })} style={s.numInput} />
                <input type="number" min="18" max="99" value={prefs.maxAge} onChange={(e) => setPrefs({ ...prefs, maxAge: Number(e.target.value) })} style={s.numInput} />
              </div>

              <button onClick={savePrefs} style={s.saveBtn}>{t('matches.savePreferences')}</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

const s = {
  wrap: { maxWidth: 500, margin: '0 auto', padding: '24px 16px', color: '#fff' },
  title: { fontSize: 22, margin: 0 },
  prefsBtn: { background: '#161625', border: '1px solid #2a2a3e', color: '#ccc', borderRadius: 10, padding: '6px 12px', fontSize: 12, cursor: 'pointer' },
  tabRow: { display: 'flex', gap: 8, marginBottom: 16 },
  tabBtn: { flex: 1, padding: '8px', borderRadius: 10, border: '1px solid #2a2a3e', background: 'transparent', color: '#999', cursor: 'pointer', fontSize: 13 },
  tabBtnActive: { background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', color: '#fff', border: 'none', fontWeight: 700 },
  matchToast: { background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', borderRadius: 12, padding: 14, textAlign: 'center', marginBottom: 16, cursor: 'pointer', fontWeight: 700 },
  card: { background: '#161625', border: '1px solid #2a2a3e', borderRadius: 18, overflow: 'hidden' },
  cardPhoto: { position: 'relative', height: 340, background: '#2a2a3e', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  compatBadge: { position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: '#ffd166', fontWeight: 700, fontSize: 12, padding: '5px 12px', borderRadius: 14 },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  chip: { background: 'rgba(255,255,255,0.06)', border: '1px solid #333', borderRadius: 14, padding: '4px 12px', fontSize: 12, color: '#ccc' },
  chipShared: { background: 'rgba(255,63,157,0.15)', border: '1px solid #ff5da8', color: '#ff5da8' },
  actionRow: { display: 'flex', justifyContent: 'center', gap: 20, padding: '16px 0 20px' },
  passBtn: { width: 56, height: 56, borderRadius: '50%', border: '1px solid #444', background: '#1a1a2e', color: '#ccc', fontSize: 20, cursor: 'pointer' },
  superBtn: { width: 48, height: 48, borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg, #3fa9ff, #1d6fe0)', color: '#fff', fontSize: 18, cursor: 'pointer' },
  likeBtn: { width: 56, height: 56, borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg, #ff3f9d, #ff5da8)', color: '#fff', fontSize: 20, cursor: 'pointer' },
  matchGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 },
  matchCard: { background: '#161625', border: '1px solid #2a2a3e', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  matchAvatar: { width: 56, height: 56, borderRadius: '50%', background: '#2a2a3e', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 22, marginBottom: 8 },
  matchActionBtn: { flex: 1, textAlign: 'center', padding: '6px 0', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: '#fff', textDecoration: 'none', fontSize: 13 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 },
  modal: { background: '#161625', border: '1px solid #2a2a3e', borderRadius: 16, padding: 20, width: '100%', maxWidth: 360 },
  label: { display: 'block', fontSize: 12, color: '#999', marginTop: 14, marginBottom: 6 },
  select: { width: '100%', padding: 10, borderRadius: 8, background: '#0f0f1a', border: '1px solid #333', color: '#fff' },
  numInput: { flex: 1, padding: 10, borderRadius: 8, background: '#0f0f1a', border: '1px solid #333', color: '#fff' },
  saveBtn: { width: '100%', marginTop: 20, padding: 12, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer' }
};
