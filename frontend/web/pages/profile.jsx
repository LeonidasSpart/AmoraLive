import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { apiFetch, clearSession } from '../lib/api';
import VerifiedBadge from '../components/VerifiedBadge';
import ProfileFrame from '../components/ProfileFrame';
import LuxuryGiftShowcase from '../components/LuxuryGiftShowcase';

const gradient = 'linear-gradient(135deg,#ff3f9d 0%,#ff5da8 35%,#9b35ff 100%)';

export default function Profile() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [receivedGifts, setReceivedGifts] = useState([]);
  const [xpProgress, setXpProgress] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showBlockList, setShowBlockList] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editForm, setEditForm] = useState({});

  const fetchProfile = async () => {
    if (!localStorage.getItem('accessToken')) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await apiFetch('/users/me');
      if (!res.ok) throw new Error('Failed to fetch profile');

      const data = await res.json();
      setUser(data);
      setEditForm({
        display_name: data.display_name || '',
        bio: data.bio || '',
        interests: data.interests || [],
        languages: data.languages || [],
        relationship_intent: data.relationship_intent || '',
        location: data.location || { city: '', country: '' }
      });
    } catch (err) {
      setError(err.message || 'Unable to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportingData = async () => {
    try {
      const [followersRes, followingRes, blocksRes, xpRes, giftsRes] =
        await Promise.all([
          apiFetch('/users/me/followers'),
          apiFetch('/users/me/following'),
          apiFetch('/users/me/blocks'),
          apiFetch('/users/me/xp-progress'),
          apiFetch('/gifts/history?direction=received&limit=100')
        ]);

      if (followersRes.ok) {
        const data = await followersRes.json();
        setFollowers(data.followers || []);
      }

      if (followingRes.ok) {
        const data = await followingRes.json();
        setFollowing(data.following || []);
      }

      if (blocksRes.ok) {
        const data = await blocksRes.json();
        setBlockedUsers(data.blocks || []);
      }

      if (xpRes.ok) setXpProgress(await xpRes.json());

      if (giftsRes.ok) {
        const data = await giftsRes.json();
        setReceivedGifts(Array.isArray(data) ? data : data.history || []);
      }
    } catch (err) {
      console.error('Profile supporting data error:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchSupportingData();
  }, []);

  const updateProfile = async (e) => {
    e.preventDefault();

    try {
      const res = await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(editForm)
      });

      if (!res.ok) throw new Error('Update failed');

      setUser(await res.json());
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Update failed');
    }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);
    setUploading(true);

    try {
      const res = await apiFetch('/users/me/photos', {
        method: 'POST',
        body: formData
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setUser((current) => ({ ...current, profile_photo: data.url }));
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const unblock = async (id) => {
    await apiFetch('/users/me/unblock', {
      method: 'POST',
      body: JSON.stringify({ userId: id })
    });

    const res = await apiFetch('/users/me/blocks');
    if (res.ok) {
      const data = await res.json();
      setBlockedUsers(data.blocks || []);
    }
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure? This action is permanent.')) return;

    const res = await apiFetch('/users/me', { method: 'DELETE' });

    if (res.ok) {
      clearSession();
      router.push('/');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="state">Loading your Amora profile…</div>
        <style jsx>{`
          .state {
            min-height: calc(100vh - 80px);
            display: grid;
            place-items: center;
            color: #fff;
          }
        `}</style>
      </Layout>
    );
  }

  if (error || !user) {
    return (
      <Layout>
        <div className="state">
          <div>
            <p>{error || 'User not found'}</p>
            <button onClick={fetchProfile}>Retry</button>
          </div>
        </div>
        <style jsx>{`
          .state {
            min-height: calc(100vh - 80px);
            display: grid;
            place-items: center;
            color: #ff8aae;
            text-align: center;
          }
          button {
            margin-top: 12px;
            border: 0;
            border-radius: 10px;
            padding: 10px 24px;
            color: #fff;
            background: ${gradient};
            cursor: pointer;
          }
        `}</style>
      </Layout>
    );
  }

  const membership = String(user.membership_tier || 'free').toUpperCase();
  const location = user.location?.city
    ? `${user.location.city}${user.location.country ? `, ${user.location.country}` : ''}`
    : 'Location not set';

  return (
    <Layout>
      <main className="page">
        <section className="hero">
          <div className="heroGlow" />
          <div className="heroInner">
            <div className="cover">
              {user.cover_photo ? (
                <img src={user.cover_photo} alt="" />
              ) : (
                <div className="coverFallback" />
              )}
              <div className="coverOverlay" />
            </div>

            <div className="identity">
              <div className="avatarWrap">
                <ProfileFrame tier={user.membership_tier} size={190}>
                  <div className="avatar">
                    {user.profile_photo ? (
                      <img
                        src={user.profile_photo}
                        alt={user.display_name || user.username}
                      />
                    ) : (
                      <span>👤</span>
                    )}

                    <button
                      className="camera"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      aria-label="Change profile photo"
                    >
                      {uploading ? '…' : '＋'}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={uploadPhoto}
                    />
                  </div>
                </ProfileFrame>
              </div>

              <div className="nameBlock">
                <div className="nameLine">
                  <h1>{user.display_name || user.username}</h1>
                  <VerifiedBadge user={user} size={20} />
                  <span className="onlineDot" />
                </div>
                <div className="username">@{user.username}</div>
                <div className="chips">
                  <span>✦ {membership}</span>
                  {user.level != null && <span>LEVEL {user.level}</span>}
                  <span>⌖ {location}</span>
                </div>
              </div>

              <div className="heroActions">
                {!isEditing && (
                  <button className="primary" onClick={() => setIsEditing(true)}>
                    Edit profile
                  </button>
                )}
                <button className="secondary" onClick={() => router.push('/settings')}>
                  Settings
                </button>
                <button className="secondary" onClick={() => router.push('/safety')}>
                  🛡️ Security
                </button>
              </div>
            </div>

            <div className="stats">
              <div><strong>{followers.length}</strong><span>Followers</span></div>
              <div><strong>{following.length}</strong><span>Following</span></div>
              <div><strong>{user.xp || 0}</strong><span>XP</span></div>
              <div><strong>{user.level || 0}</strong><span>Level</span></div>
            </div>
          </div>
        </section>

        <section className="content">
          {isEditing ? (
            <div className="panel editPanel">
              <div className="sectionTitle">
                <div>
                  <span>PROFILE STUDIO</span>
                  <h2>Edit your profile</h2>
                </div>
              </div>

              <form onSubmit={updateProfile} className="form">
                <label>
                  Display name
                  <input
                    value={editForm.display_name || ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, display_name: e.target.value })
                    }
                  />
                </label>

                <label>
                  Bio
                  <textarea
                    value={editForm.bio || ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                  />
                </label>

                <label>
                  Relationship intent
                  <input
                    value={editForm.relationship_intent || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        relationship_intent: e.target.value
                      })
                    }
                  />
                </label>

                <label>
                  Interests
                  <input
                    value={(editForm.interests || []).join(', ')}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        interests: e.target.value
                          .split(',')
                          .map((x) => x.trim())
                          .filter(Boolean)
                      })
                    }
                  />
                </label>

                <label>
                  Languages
                  <input
                    value={(editForm.languages || []).join(', ')}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        languages: e.target.value
                          .split(',')
                          .map((x) => x.trim())
                          .filter(Boolean)
                      })
                    }
                  />
                </label>

                <div className="formButtons">
                  <button className="primary" type="submit">Save changes</button>
                  <button
                    className="secondary"
                    type="button"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="introGrid">
                <div className="panel bioPanel">
                  <div className="sectionTitle">
                    <div>
                      <span>ABOUT</span>
                      <h2>Personal space</h2>
                    </div>
                    <span className="diamond">◆</span>
                  </div>

                  <p className="bio">
                    {user.bio || 'No bio yet. Add something that tells people what makes you, you.'}
                  </p>

                  <div className="details">
                    {[
                      ['Location', location],
                      ['Intent', user.relationship_intent || 'Not set'],
                      ['Member since', user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'],
                      ['Membership', membership]
                    ].map(([label, value]) => (
                      <div className="detail" key={label}>
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel levelPanel">
                  <div className="sectionTitle">
                    <div>
                      <span>AMORA STATUS</span>
                      <h2>Level progress</h2>
                    </div>
                    <span className="levelBadge">LV {xpProgress?.level || user.level || 0}</span>
                  </div>

                  <div className="levelNumber">{xpProgress?.level || user.level || 0}</div>
                  <div className="xpText">
                    {xpProgress
                      ? `${xpProgress.xpIntoLevel} / ${xpProgress.xpForNextLevel} XP`
                      : `${user.xp || 0} XP`}
                  </div>

                  <div className="progressTrack">
                    <div
                      className="progress"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, Number(xpProgress?.progressPct || 0))
                        )}%`
                      }}
                    />
                  </div>

                  <div className="badges">
                    {(xpProgress?.badges || user.badges || []).slice(0, 8).map((badge) => (
                      <span key={badge}>✦ {badge}</span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push('/levels')}
                    style={{ background: 'none', border: 'none', padding: 0, marginTop: 10, color: 'var(--amora-pink-2)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                  >
                    View level rewards →
                  </button>
                </div>
              </div>

              <LuxuryGiftShowcase gifts={receivedGifts} />

              {(user.interests?.length || user.languages?.length || user.badges?.length) ? (
                <div className="panel tagsPanel">
                  <div className="sectionTitle">
                    <div>
                      <span>IDENTITY</span>
                      <h2>Interests & badges</h2>
                    </div>
                  </div>

                  <div className="tagRow">
                    {(user.interests || []).map((item) => <span key={`i-${item}`}>♡ {item}</span>)}
                    {(user.languages || []).map((item) => <span key={`l-${item}`}>◉ {item}</span>)}
                    {(user.badges || []).map((item) => <span key={`b-${item}`}>✦ {item}</span>)}
                  </div>
                </div>
              ) : null}

              <div className="utilityRow">
                <button
                  className="utility"
                  onClick={() => setShowBlockList((v) => !v)}
                >
                  🚫 Block list ({blockedUsers.length})
                </button>

                <button className="danger" onClick={deleteAccount}>
                  Delete account
                </button>
              </div>

              {showBlockList && (
                <div className="panel blocks">
                  <h3>Blocked users</h3>
                  {blockedUsers.length === 0 ? (
                    <p>No blocked users.</p>
                  ) : (
                    blockedUsers.map((block) => (
                      <div className="blockRow" key={block.id || block.blocked_id}>
                        <span>@{block.username || 'user'}</span>
                        <button
                          onClick={() => unblock(block.blocked_id || block.id)}
                        >
                          Unblock
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <style jsx>{`
        .page {
          min-height: calc(100vh - 70px);
          color: #fff;
          background:
            radial-gradient(circle at 10% 0%, rgba(255,45,170,.08), transparent 30%),
            radial-gradient(circle at 90% 15%, rgba(135,55,255,.09), transparent 32%),
            #08070e;
          padding-bottom: 60px;
        }

        .hero {
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }

        .heroGlow {
          position: absolute;
          width: 600px;
          height: 260px;
          left: 50%;
          top: -130px;
          transform: translateX(-50%);
          background: rgba(255,55,180,.14);
          filter: blur(90px);
          pointer-events: none;
        }

        .heroInner, .content {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
        }

        .heroInner {
          padding: 28px 0 0;
        }

        .cover {
          position: relative;
          height: 230px;
          border-radius: 30px 30px 20px 20px;
          overflow: hidden;
          background: linear-gradient(135deg,#22102b,#100b19 55%,#261040);
          border: 1px solid rgba(255,255,255,.08);
        }

        .cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: .78;
        }

        .coverFallback {
          width: 100%;
          height: 100%;
          background:
            radial-gradient(circle at 20% 30%, rgba(255,74,185,.42), transparent 24%),
            radial-gradient(circle at 80% 30%, rgba(142,70,255,.35), transparent 28%),
            linear-gradient(120deg,#180c20,#0b0811 50%,#190b28);
        }

        .coverOverlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, #08070e, transparent 55%);
        }

        .identity {
          position: relative;
          display: flex;
          align-items: flex-end;
          gap: 22px;
          margin-top: -74px;
          padding: 0 26px 18px;
        }

        .avatarWrap {
          flex: 0 0 auto;
          z-index: 2;
        }

        .avatar {
          position: relative;
          width: 180px;
          height: 180px;
          overflow: hidden;
          border-radius: 50%;
          background: #151220;
          border: 4px solid #ff69b7;
          box-shadow: 0 0 0 8px rgba(255,80,185,.08), 0 25px 70px rgba(0,0,0,.55);
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar > span {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          font-size: 60px;
        }

        .camera {
          position: absolute;
          right: 8px;
          bottom: 8px;
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 50%;
          color: #fff;
          background: ${gradient};
          cursor: pointer;
          font-size: 21px;
          box-shadow: 0 8px 25px rgba(255,50,170,.35);
        }

        .nameBlock {
          flex: 1;
          min-width: 0;
          padding-bottom: 7px;
        }

        .nameLine {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-wrap: wrap;
        }

        .nameLine h1 {
          margin: 0;
          font-size: clamp(26px, 4vw, 40px);
          letter-spacing: -.035em;
        }

        .username {
          color: #8d859b;
          margin-top: 3px;
        }

        .onlineDot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #55e889;
          box-shadow: 0 0 12px #55e889;
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 10px;
        }

        .chips span, .levelBadge {
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,.055);
          border: 1px solid rgba(255,255,255,.08);
          color: #c9bfd4;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .06em;
        }

        .heroActions {
          display: flex;
          gap: 8px;
          padding-bottom: 7px;
        }

        button {
          font-family: inherit;
        }

        .primary, .secondary, .utility, .danger {
          border-radius: 12px;
          padding: 11px 16px;
          cursor: pointer;
          font-weight: 800;
        }

        .primary {
          border: 0;
          color: #fff;
          background: ${gradient};
          box-shadow: 0 10px 30px rgba(255,45,170,.22);
        }

        .secondary, .utility {
          color: #fff;
          background: rgba(255,255,255,.045);
          border: 1px solid rgba(255,255,255,.1);
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          border-top: 1px solid rgba(255,255,255,.07);
          background: rgba(255,255,255,.018);
        }

        .stats div {
          padding: 16px;
          text-align: center;
          border-right: 1px solid rgba(255,255,255,.06);
        }

        .stats div:last-child { border-right: 0; }
        .stats strong { display: block; font-size: 19px; }
        .stats span { color: #777080; font-size: 10px; text-transform: uppercase; letter-spacing: .12em; }

        .content {
          padding-top: 24px;
        }

        .introGrid {
          display: grid;
          grid-template-columns: 1.45fr .9fr;
          gap: 18px;
        }

        .panel {
          border: 1px solid rgba(255,255,255,.075);
          border-radius: 24px;
          background: linear-gradient(145deg, rgba(255,255,255,.045), rgba(255,255,255,.015));
          box-shadow: 0 20px 60px rgba(0,0,0,.2);
          padding: 23px;
        }

        .sectionTitle {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .sectionTitle span:first-child {
          color: #bb91d6;
          font-size: 9px;
          letter-spacing: .22em;
          font-weight: 900;
        }

        .sectionTitle h2 {
          margin: 6px 0 0;
          font-size: 21px;
          letter-spacing: -.02em;
        }

        .diamond { color: #ff65bd; }
        .bio { color: #b4aabd; line-height: 1.75; margin: 20px 0; }

        .details {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 9px;
        }

        .detail {
          padding: 12px;
          border-radius: 15px;
          background: rgba(255,255,255,.035);
        }

        .detail span {
          display: block;
          color: #71697c;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .1em;
        }

        .detail strong {
          display: block;
          margin-top: 4px;
          color: #eae5ef;
          font-size: 12px;
        }

        .levelNumber {
          font-size: 58px;
          line-height: 1;
          font-weight: 900;
          margin-top: 24px;
          background: ${gradient};
          -webkit-background-clip: text;
          color: transparent;
        }

        .xpText { color: #8e8598; font-size: 11px; margin: 7px 0 13px; }
        .progressTrack { height: 9px; border-radius: 99px; background: #211a29; overflow: hidden; }
        .progress { height: 100%; border-radius: inherit; background: ${gradient}; box-shadow: 0 0 18px rgba(255,70,190,.35); transition: width .5s ease; }

        .badges, .tagRow {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 15px;
        }

        .badges span, .tagRow span {
          padding: 7px 10px;
          border-radius: 999px;
          color: #d8c8e5;
          background: rgba(187,106,255,.09);
          border: 1px solid rgba(187,106,255,.16);
          font-size: 10px;
        }

        .tagsPanel { margin-top: 18px; }

        .utilityRow {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 18px;
        }

        .danger {
          color: #ff7f9f;
          background: transparent;
          border: 1px solid rgba(255,80,120,.3);
        }

        .blocks {
          margin-top: 15px;
        }

        .blocks h3 { margin: 0 0 12px; }
        .blocks p { color: #777080; }

        .blockRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,.06);
          color: #c8c0d0;
        }

        .blockRow button {
          color: #ff78bf;
          background: transparent;
          border: 0;
          cursor: pointer;
        }

        .editPanel { max-width: 760px; margin: 0 auto; }
        .form { display: grid; gap: 14px; margin-top: 20px; }
        .form label { display: grid; gap: 7px; color: #aaa0b1; font-size: 11px; }
        .form input, .form textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 13px;
          background: #100d18;
          color: #fff;
          padding: 12px;
          outline: none;
        }
        .form textarea { min-height: 120px; resize: vertical; }
        .form input:focus, .form textarea:focus { border-color: rgba(255,90,190,.55); }
        .formButtons { display: flex; gap: 9px; margin-top: 4px; }

        @media(max-width:820px) {
          .identity { align-items: flex-start; flex-wrap: wrap; margin-top: -55px; }
          .avatar { width: 145px; height: 145px; }
          .heroActions { margin-left: 167px; margin-top: -10px; }
          .introGrid { grid-template-columns: 1fr; }
        }

        @media(max-width:620px) {
          .heroInner, .content { width: min(100% - 20px, 1180px); }
          .cover { height: 175px; border-radius: 22px 22px 15px 15px; }
          .identity { margin-top: -45px; padding: 0 10px 14px; gap: 13px; }
          .avatar { width: 108px; height: 108px; border-width: 3px; }
          .camera { width: 32px; height: 32px; right: 2px; bottom: 2px; font-size: 17px; }
          .nameLine h1 { font-size: 23px; }
          .heroActions { margin-left: 0; width: 100%; }
          .heroActions button { flex: 1; }
          .stats div { padding: 12px 5px; }
          .stats strong { font-size: 15px; }
          .stats span { font-size: 8px; }
          .details { grid-template-columns: 1fr; }
          .utilityRow { flex-direction: column; }
          .utility, .danger { width: 100%; }
        }
      `}</style>
    </Layout>
  );
}
