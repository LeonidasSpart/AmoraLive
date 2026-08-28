import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from '../lib/api';
import VerifiedBadge from '../components/VerifiedBadge';
import { useTranslation } from '../lib/i18n';

const GRADIENT = 'linear-gradient(135deg,#ff3f9d 0%,#ff5da8 35%,#9b35ff 100%)';

export default function ChatList() {
  const { t } = useTranslation();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchConversations = async (silent = false) => {
    if (!localStorage.getItem('accessToken')) {
      router.push('/login');
      return;
    }

    if (!silent) setLoading(true);
    setError('');

    try {
      const res = await apiFetch('/messages/conversations');
      if (!res.ok) throw new Error(t('chat.failedLoadConversations'));
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || t('chat.unableToLoadMessages'));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const timer = window.setInterval(() => fetchConversations(true), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const timeAgo = (date) => {
    if (!date) return '';
    const diff = Math.max(0, Date.now() - new Date(date).getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('chat.justNow');
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="state">
        <div className="orb">✦</div>
        <span>{t('chat.openingMessages')}</span>
        <style jsx>{`
          .state { min-height:100vh; display:grid; place-items:center; align-content:center; gap:12px; color:#918899; background:#08070e; }
          .orb { color:#ff65bb; font-size:38px; text-shadow:0 0 30px #ff4eb6; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <span className="eyebrow">{t('chat.eyebrow')}</span>
          <h1>{t('chat.title')}</h1>
          <p>{t('chat.subtitle')}</p>
        </div>
        <Link href="/discover" className="back">{t('chat.discoverLink')}</Link>
      </header>

      {error && (
        <div className="error">
          <span>{error}</span>
          <button onClick={() => fetchConversations()}>{t('chat.retry')}</button>
        </div>
      )}

      <main className="list">
        {conversations.length === 0 ? (
          <div className="empty">
            <div className="emptyIcon">♡</div>
            <h2>{t('chat.noConversationsYet')}</h2>
            <p>{t('chat.startMatchSayHello')}</p>
            <Link href="/discover" className="cta">{t('chat.discoverPeople')}</Link>
          </div>
        ) : (
          conversations.map((conv) => (
            <Link key={conv.id} href={`/chat/${conv.id}`} className="conversation">
              <div className={`avatar ${conv.unread_count > 0 ? 'unread' : ''}`}>
                {conv.profile_photo ? <img src={conv.profile_photo} alt="" /> : <span>👤</span>}
                <i />
              </div>

              <div className="details">
                <div className="topline">
                  <span className={conv.unread_count > 0 ? 'name unreadName' : 'name'}>
                    {conv.display_name || conv.username}
                    <VerifiedBadge user={conv} size={13} />
                  </span>
                  <time>{timeAgo(conv.last_message_time)}</time>
                </div>
                <div className="preview">
                  <span>
                    {conv.last_message
                      ? conv.last_message
                      : t('chat.sentPhotoOrVideo')}
                  </span>
                  {Number(conv.unread_count) > 0 && (
                    <b>{Number(conv.unread_count)}</b>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </main>

      <style jsx>{`
        .page {
          min-height:100vh;
          color:#fff;
          background:
            radial-gradient(circle at 8% 0%,rgba(255,55,170,.10),transparent 28%),
            radial-gradient(circle at 92% 25%,rgba(133,65,255,.10),transparent 30%),
            #08070e;
          padding:24px max(14px,calc((100vw - 900px)/2));
          box-sizing:border-box;
        }
        .header {
          display:flex;
          align-items:flex-end;
          justify-content:space-between;
          gap:18px;
          padding:8px 0 20px;
          border-bottom:1px solid rgba(255,255,255,.08);
        }
        .eyebrow { color:#d9a4ff; font-size:8px; letter-spacing:.24em; font-weight:900; }
        h1 { margin:4px 0 2px; font-size:28px; letter-spacing:-.02em; }
        .header p { margin:0; color:#756d7f; font-size:11px; }
        .back { color:#b6adbb; text-decoration:none; border:1px solid rgba(255,255,255,.09); border-radius:12px; padding:9px 12px; background:rgba(255,255,255,.035); }
        .list { padding:14px 0 30px; }
        .conversation {
          display:flex; align-items:center; gap:13px; padding:12px;
          margin:8px 0; border:1px solid rgba(255,255,255,.07);
          border-radius:18px; text-decoration:none; color:inherit;
          background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018));
          transition:transform .16s ease,border-color .16s ease,background .16s ease;
        }
        .conversation:hover { transform:translateY(-1px); border-color:rgba(255,91,187,.28); background:rgba(255,255,255,.055); }
        .avatar { position:relative; width:52px; height:52px; flex:0 0 52px; overflow:hidden; display:grid; place-items:center; border-radius:50%; background:#211b2b; border:2px solid rgba(255,255,255,.07); }
        .avatar.unread { border-color:rgba(255,82,185,.75); box-shadow:0 0 22px rgba(255,60,180,.15); }
        .avatar img { width:100%; height:100%; object-fit:cover; }
        .avatar i { position:absolute; right:0; bottom:1px; width:10px; height:10px; border-radius:50%; background:#5ce795; border:2px solid #100c16; }
        .details { min-width:0; flex:1; }
        .topline,.preview { display:flex; align-items:center; justify-content:space-between; gap:10px; }
        .name { min-width:0; display:inline-flex; align-items:center; gap:5px; color:#eee9f0; font-size:15px; font-weight:700; }
        .unreadName { color:#fff; }
        time { flex:0 0 auto; color:#696172; font-size:9px; }
        .preview { margin-top:4px; color:#7d7485; font-size:11px; }
        .preview > span { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .preview b { flex:0 0 auto; min-width:20px; height:20px; display:grid; place-items:center; padding:0 5px; box-sizing:border-box; border-radius:999px; background:${GRADIENT}; color:#fff; font-size:9px; }
        .empty { text-align:center; padding:18vh 10px 10vh; color:#786f80; }
        .emptyIcon { color:#ff67bd; font-size:46px; text-shadow:0 0 30px rgba(255,60,180,.35); }
        .empty h2 { color:#eee8f2; margin:8px 0 4px; font-size:20px; }
        .empty p { margin:0 0 18px; font-size:11px; }
        .cta { display:inline-block; padding:10px 16px; border-radius:12px; color:#fff; text-decoration:none; background:${GRADIENT}; }
        .error { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:14px; padding:10px 12px; border:1px solid rgba(255,80,120,.25); border-radius:12px; color:#ff9ab5; background:rgba(255,50,100,.06); font-size:11px; }
        .error button { border:0; border-radius:9px; padding:7px 10px; color:#fff; background:${GRADIENT}; cursor:pointer; }
        @media(max-width:600px) {
          .page { padding:16px 10px max(20px,env(safe-area-inset-bottom)); }
          .header { align-items:center; }
          h1 { font-size:24px; }
          .header p { font-size:10px; }
          .back { padding:8px 10px; font-size:11px; }
          .conversation { padding:11px 10px; border-radius:16px; }
        }
      `}</style>
    </div>
  );
}
