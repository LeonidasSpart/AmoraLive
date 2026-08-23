// components/Stories.jsx
import React, { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../lib/api';
import VerifiedBadge from './VerifiedBadge';
import ProfileFrame from './ProfileFrame';

const PHOTO_DURATION_MS = 5000;
const REACTIONS = ['❤️', '😂', '😮', '🔥', '👏', '😢'];

export default function Stories() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openGroupIndex, setOpenGroupIndex] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selfId, setSelfId] = useState(null);

  const load = async () => {
    try {
      const res = await apiFetch('/stories/feed');
      if (res.ok) setGroups(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelfId(typeof window !== 'undefined' ? localStorage.getItem('userId') : null);
    load();
  }, []);

  const selfGroup = groups.find((g) => g.user.id === selfId);
  const otherGroups = groups.filter((g) => g.user.id !== selfId);

  return (
    <div style={s.barWrap}>
      <div style={s.bar}>
        <button onClick={() => (selfGroup ? setOpenGroupIndex(groups.indexOf(selfGroup)) : setShowCreate(true))} style={s.ring}>
          <div style={{ position: 'relative' }}>
            <ProfileFrame tier={null} size={64}>
              <div style={s.avatarInner}>
                {selfGroup?.user.profile_photo ? (
                  <img src={selfGroup.user.profile_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : '👤'}
              </div>
            </ProfileFrame>
            <div style={s.addBadge}>+</div>
          </div>
          <span style={s.ringLabel}>Your Story</span>
        </button>

        {!loading && otherGroups.map((g) => (
          <button key={g.user.id} onClick={() => setOpenGroupIndex(groups.indexOf(g))} style={s.ring}>
            <div style={{ ...s.storyRing, ...(g.hasUnseen ? s.storyRingUnseen : s.storyRingSeen) }}>
              <div style={s.avatarInner}>
                {g.user.profile_photo ? (
                  <img src={g.user.profile_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : '👤'}
              </div>
            </div>
            <span style={s.ringLabel}>{g.user.display_name || g.user.username}</span>
          </button>
        ))}
      </div>

      {openGroupIndex !== null && (
        <StoryViewer
          groups={groups}
          startIndex={openGroupIndex}
          selfId={selfId}
          onClose={() => { setOpenGroupIndex(null); load(); }}
        />
      )}

      {showCreate && (
        <CreateStory onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />
      )}
    </div>
  );
}

function StoryViewer({ groups, startIndex, selfId, onClose }) {
  const [groupIndex, setGroupIndex] = useState(startIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [replyText, setReplyText] = useState('');
  const timerRef = useRef(null);
  const videoRef = useRef(null);

  const group = groups[groupIndex];
  const story = group?.stories[storyIndex];
  const isOwn = group?.user.id === selfId;

  useEffect(() => {
    if (!story) return;
    setProgress(0);
    apiFetch(`/stories/${story.id}/view`, { method: 'POST' }).catch(() => {});
  }, [story?.id]);

  useEffect(() => {
    if (!story || paused || showViewers) return;
    if (story.media_type === 'video') return; // video advances on its own 'ended' event
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / PHOTO_DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100) goNext();
    }, 50);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, paused, showViewers]);

  const goNext = () => {
    if (!group) return;
    if (storyIndex < group.stories.length - 1) {
      setStoryIndex((i) => i + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((i) => i + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
    } else if (groupIndex > 0) {
      const prevGroup = groups[groupIndex - 1];
      setGroupIndex((i) => i - 1);
      setStoryIndex(prevGroup.stories.length - 1);
    }
  };

  const openViewers = async () => {
    setPaused(true);
    try {
      const res = await apiFetch(`/stories/${story.id}/viewers`);
      if (res.ok) setViewers(await res.json());
    } catch {}
    setShowViewers(true);
  };

  const react = async (emoji) => {
    try {
      await apiFetch(`/stories/${story.id}/react`, { method: 'POST', body: JSON.stringify({ emoji }) });
    } catch {}
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    try {
      await apiFetch(`/stories/${story.id}/reply`, { method: 'POST', body: JSON.stringify({ content: replyText.trim() }) });
      setReplyText('');
    } catch {}
  };

  const deleteStory = async () => {
    if (!confirm('Delete this story?')) return;
    try {
      await apiFetch(`/stories/${story.id}`, { method: 'DELETE' });
      onClose();
    } catch {}
  };

  if (!story) return null;

  return (
    <div style={s.viewerStage}>
      <div style={s.viewerPage}>
        <div style={s.progressRow}>
          {group.stories.map((st, i) => (
            <div key={st.id} style={s.progressTrack}>
              <div style={{ ...s.progressFill, width: `${i < storyIndex ? 100 : i === storyIndex ? progress : 0}%` }} />
            </div>
          ))}
        </div>

        <div style={s.viewerHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={s.viewerAvatar}>
              {group.user.profile_photo ? <img src={group.user.profile_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : '👤'}
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center' }}>
              {group.user.display_name || group.user.username}<VerifiedBadge user={group.user} size={12} />
            </span>
          </div>
          <button onClick={onClose} style={s.viewerClose}>✕</button>
        </div>

        <div style={s.mediaWrap} onClick={(e) => {
          const x = e.clientX - e.currentTarget.getBoundingClientRect().left;
          const width = e.currentTarget.getBoundingClientRect().width;
          if (x < width * 0.3) goPrev(); else goNext();
        }}>
          {story.media_type === 'video' ? (
            <video ref={videoRef} src={story.media_url} autoPlay style={s.media} onEnded={goNext} />
          ) : (
            <img src={story.media_url} alt="" style={s.media} />
          )}
          {story.caption && <div style={s.caption}>{story.caption}</div>}
        </div>

        {isOwn ? (
          <div style={s.ownerBar}>
            <button onClick={openViewers} style={s.viewersBtn}>👁 Viewers</button>
            <button onClick={deleteStory} style={s.deleteBtn}>🗑 Delete</button>
          </div>
        ) : (
          <div style={s.replyBar}>
            <div style={s.reactionRow}>
              {REACTIONS.map((e) => <button key={e} onClick={() => react(e)} style={s.reactionBtn}>{e}</button>)}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={replyText}
                onChange={(ev) => setReplyText(ev.target.value)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
                placeholder="Reply…"
                style={s.replyInput}
              />
              <button onClick={sendReply} style={s.sendBtn}>Send</button>
            </div>
          </div>
        )}

        {showViewers && (
          <div style={s.viewersOverlay} onClick={() => { setShowViewers(false); setPaused(false); }}>
            <div style={s.viewersPanel} onClick={(e) => e.stopPropagation()}>
              <h4 style={{ marginTop: 0 }}>👁 {viewers.length} viewer{viewers.length !== 1 ? 's' : ''}</h4>
              {viewers.length === 0 ? (
                <p style={{ color: '#777', fontSize: 13 }}>No views yet.</p>
              ) : (
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {viewers.map((v) => (
                    <div key={v.user.id} style={s.viewerRow}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>{v.user.display_name || v.user.username}<VerifiedBadge user={v.user} size={11} /></span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => { setShowViewers(false); setPaused(false); }} style={s.closeViewersBtn}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateStory({ onClose, onCreated }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('media', file);
      form.append('caption', caption);
      form.append('privacy', privacy);
      const res = await apiFetch('/stories', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to post story.');
      onCreated();
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={s.viewersOverlay}>
      <div style={s.createPanel}>
        <h3 style={{ marginTop: 0 }}>Create Story</h3>
        {error && <div style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 10 }}>{error}</div>}

        {!preview ? (
          <label style={s.filePicker}>
            📷 Choose photo or video
            <input type="file" accept="image/*,video/*" onChange={pickFile} style={{ display: 'none' }} />
          </label>
        ) : (
          <div style={s.previewWrap}>
            {file.type.startsWith('video/') ? (
              <video src={preview} style={s.media} controls />
            ) : (
              <img src={preview} alt="" style={s.media} />
            )}
          </div>
        )}

        <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption…" style={s.captionInput} maxLength={280} />

        <select value={privacy} onChange={(e) => setPrivacy(e.target.value)} style={s.privacySelect}>
          <option value="public">🌍 Public</option>
          <option value="followers">👥 Followers only</option>
          <option value="private">🔒 Only me</option>
        </select>

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button onClick={onClose} style={s.cancelBtn}>Cancel</button>
          <button onClick={submit} disabled={!file || uploading} style={s.postBtn}>{uploading ? 'Posting…' : 'Post Story'}</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  barWrap: { marginBottom: 16 },
  bar: { display: 'flex', gap: 14, overflowX: 'auto', padding: '4px 2px 10px' },
  ring: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 },
  storyRing: { width: 68, height: 68, borderRadius: '50%', padding: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  storyRingUnseen: { background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)' },
  storyRingSeen: { background: '#333' },
  avatarInner: { width: '100%', height: '100%', borderRadius: '50%', background: '#2a2a3e', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 24, border: '2px solid #0a0a12' },
  addBadge: { position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #ff3f9d, #9b35ff)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, border: '2px solid #0a0a12' },
  ringLabel: { color: '#ccc', fontSize: 11, maxWidth: 68, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },

  viewerStage: { position: 'fixed', inset: 0, background: '#000', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  viewerPage: { position: 'relative', height: '100%', width: 'min(100vw, calc(100vh * 9 / 16))', background: '#000' },
  progressRow: { position: 'absolute', top: 8, left: 8, right: 8, display: 'flex', gap: 4, zIndex: 3 },
  progressTrack: { flex: 1, height: 3, background: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', background: '#fff' },
  viewerHeader: { position: 'absolute', top: 20, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 3, color: '#fff' },
  viewerAvatar: { width: 30, height: 30, borderRadius: '50%', background: '#2a2a3e', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  viewerClose: { background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: '50%', fontSize: 16, cursor: 'pointer' },
  mediaWrap: { position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  media: { width: '100%', height: '100%', objectFit: 'contain' },
  caption: { position: 'absolute', bottom: 100, left: 16, right: 16, color: '#fff', fontSize: 14, textAlign: 'center', textShadow: '0 1px 4px rgba(0,0,0,0.8)' },
  ownerBar: { position: 'absolute', bottom: 20, left: 16, right: 16, display: 'flex', gap: 10, zIndex: 3 },
  viewersBtn: { flex: 1, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: 10, borderRadius: 10, cursor: 'pointer' },
  deleteBtn: { flex: 1, background: 'rgba(255,60,60,0.2)', border: 'none', color: '#ff8080', padding: 10, borderRadius: 10, cursor: 'pointer' },
  replyBar: { position: 'absolute', bottom: 16, left: 12, right: 12, zIndex: 3 },
  reactionRow: { display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 10 },
  reactionBtn: { background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: 38, height: 38, fontSize: 18, cursor: 'pointer' },
  replyInput: { flex: 1, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 20, color: '#fff', padding: '10px 16px', fontSize: 13 },
  sendBtn: { background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', border: 'none', color: '#fff', borderRadius: 20, padding: '0 18px', fontWeight: 700, cursor: 'pointer' },

  viewersOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  viewersPanel: { background: '#161625', border: '1px solid #2a2a3e', borderRadius: 16, padding: 20, width: '100%', maxWidth: 340, color: '#fff' },
  viewerRow: { padding: '8px 0', borderBottom: '1px solid #222', fontSize: 13 },
  closeViewersBtn: { width: '100%', marginTop: 14, padding: 10, borderRadius: 10, border: '1px solid #444', background: 'transparent', color: '#ccc', cursor: 'pointer' },

  createPanel: { background: '#161625', border: '1px solid #2a2a3e', borderRadius: 16, padding: 20, width: '100%', maxWidth: 400, color: '#fff' },
  filePicker: { display: 'block', textAlign: 'center', padding: '40px 0', border: '2px dashed #333', borderRadius: 12, color: '#999', cursor: 'pointer', marginBottom: 12 },
  previewWrap: { height: 300, background: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  captionInput: { width: '100%', padding: 10, borderRadius: 8, background: '#0f0f1a', border: '1px solid #333', color: '#fff', marginBottom: 10, boxSizing: 'border-box' },
  privacySelect: { width: '100%', padding: 10, borderRadius: 8, background: '#0f0f1a', border: '1px solid #333', color: '#fff' },
  cancelBtn: { flex: 1, padding: 10, borderRadius: 10, border: '1px solid #444', background: 'transparent', color: '#ccc', cursor: 'pointer' },
  postBtn: { flex: 1, padding: 10, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer' }
};
