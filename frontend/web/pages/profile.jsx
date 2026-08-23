// pages/profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { apiFetch, clearSession } from '../lib/api';
import VerifiedBadge from '../components/VerifiedBadge';
import ProfileFrame from '../components/ProfileFrame';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showBlockList, setShowBlockList] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [xpProgress, setXpProgress] = useState(null);
  const fileInputRef = useRef(null);

  // --- Data fetching ---
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollows = async () => {
    try {
      const [followersRes, followingRes] = await Promise.all([
        apiFetch('/users/me/followers'),
        apiFetch('/users/me/following')
      ]);
      if (followersRes.ok) {
        const data = await followersRes.json();
        setFollowers(data.followers || []);
      }
      if (followingRes.ok) {
        const data = await followingRes.json();
        setFollowing(data.following || []);
      }
    } catch (e) {
      console.error('Failed to fetch follows', e);
    }
  };

  const fetchBlocked = async () => {
    try {
      const res = await apiFetch('/users/me/blocks');
      if (res.ok) {
        const data = await res.json();
        setBlockedUsers(data.blocks || []);
      }
    } catch (e) {
      console.error('Failed to fetch blocks', e);
    }
  };

  const fetchXpProgress = async () => {
    try {
      const res = await apiFetch('/users/me/xp-progress');
      if (res.ok) setXpProgress(await res.json());
    } catch (e) {
      console.error('Failed to fetch XP progress', e);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchFollows();
    fetchBlocked();
    fetchXpProgress();
  }, []);

  // --- Actions ---
  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      setUser(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    setUploading(true);
    try {
      const res = await apiFetch('/users/me/photos', { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setUser({ ...user, profile_photo: data.url });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure? This action is permanent.')) return;
    try {
      const res = await apiFetch('/users/me', { method: 'DELETE' });
      if (res.ok) {
        clearSession();
        router.push('/');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Go to settings
  const goToSettings = () => {
    router.push('/settings');
  };

  // --- Loading / Error states ---
  if (loading) {
    return React.createElement(Layout, null,
      React.createElement('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 80px)',
          color: '#fff'
        }
      }, 'Loading profile...')
    );
  }

  if (error || !user) {
    return React.createElement(Layout, null,
      React.createElement('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 80px)',
          color: '#fff'
        }
      }, [
        React.createElement('p', { key: 'msg', style: { color: '#ff6b6b' } }, `Error: ${error || 'User not found'}`),
        React.createElement('button', {
          key: 'retry',
          onClick: fetchProfile,
          style: {
            marginTop: '20px',
            padding: '8px 24px',
            borderRadius: '6px',
            border: 'none',
            background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)',
            color: '#fff',
            cursor: 'pointer'
          }
        }, 'Retry')
      ])
    );
  }

  // --- Helper: stats array ---
  const stats = [
    ['Level', user.level || 0],
    ['XP', user.xp || 0],
    ['Membership', user.membership_tier || 'Free']
  ];

  // --- Build sidebar children ---
  const sidebarChildren = [];

  // Profile photo
  const photoChildren = [];
  if (user.profile_photo) {
    photoChildren.push(
      React.createElement('img', {
        key: 'img',
        src: user.profile_photo,
        alt: user.display_name || user.username,
        style: { width: '100%', height: '100%', objectFit: 'cover' }
      })
    );
  } else {
    photoChildren.push(
      React.createElement('div', {
        key: 'placeholder',
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '64px',
          color: '#444'
        }
      }, '👤')
    );
  }
  photoChildren.push(
    React.createElement('button', {
      key: 'upload-btn',
      onClick: () => fileInputRef.current?.click(),
      style: {
        position: 'absolute',
        bottom: '8px',
        right: '8px',
        background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)',
        border: 'none',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      disabled: uploading
    }, uploading ? '⏳' : '📷')
  );
  photoChildren.push(
    React.createElement('input', {
      key: 'file-input',
      ref: fileInputRef,
      type: 'file',
      accept: 'image/*',
      style: { display: 'none' },
      onChange: uploadPhoto
    })
  );

  sidebarChildren.push(
    React.createElement('div', { key: 'photo-wrap', style: { textAlign: 'center', marginBottom: '20px' } },
      React.createElement(ProfileFrame, { tier: user.membership_tier, size: 192 },
        React.createElement('div', {
          style: {
            position: 'relative',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: '#2a2a3e',
            overflow: 'hidden',
            border: '3px solid #FF6B9D'
          }
        }, photoChildren)
      )
    )
  );

  sidebarChildren.push(
    React.createElement('h2', {
      key: 'display-name',
      style: { textAlign: 'center', color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
    }, [user.display_name || user.username, React.createElement(VerifiedBadge, { key: 'badge', user, size: 16 })])
  );
  sidebarChildren.push(
    React.createElement('p', {
      key: 'username',
      style: { textAlign: 'center', color: '#888', fontSize: '14px', marginBottom: '16px' }
    }, `@${user.username}`)
  );

  // Stats
  const statsChildren = stats.map(([label, value]) =>
    React.createElement('div', { key: label, style: { textAlign: 'center' } }, [
      React.createElement('div', { key: 'val', style: { color: '#FF6B9D', fontSize: '18px', fontWeight: 'bold' } }, value),
      React.createElement('div', { key: 'label', style: { color: '#666', fontSize: '11px' } }, label)
    ])
  );
  sidebarChildren.push(
    React.createElement('div', {
      key: 'stats',
      style: {
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0',
        borderTop: '1px solid #222',
        borderBottom: '1px solid #222',
        marginBottom: '16px'
      }
    }, statsChildren)
  );

  // XP progress bar — real server-computed progress toward the next level,
  // not just the raw level/xp numbers shown in the stats row above.
  if (xpProgress) {
    sidebarChildren.push(
      React.createElement('div', {
        key: 'xp-progress',
        style: { marginBottom: '16px' }
      }, [
        React.createElement('div', {
          key: 'label',
          style: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#999', marginBottom: '4px' }
        }, [
          React.createElement('span', { key: 'lvl' }, `Level ${xpProgress.level}`),
          React.createElement('span', { key: 'xp' }, `${xpProgress.xpIntoLevel} / ${xpProgress.xpForNextLevel} XP`)
        ]),
        React.createElement('div', {
          key: 'track',
          style: { height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden' }
        },
          React.createElement('div', {
            style: {
              height: '100%',
              width: `${xpProgress.progressPct}%`,
              background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)',
              borderRadius: '4px',
              transition: 'width 0.4s ease'
            }
          })
        ),
        xpProgress.badges?.length > 0 && React.createElement('div', {
          key: 'badges',
          style: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }
        }, xpProgress.badges.map((badge) =>
          React.createElement('span', {
            key: badge,
            style: { fontSize: '11px', background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.4)', color: '#ffd700', borderRadius: '12px', padding: '3px 10px' }
          }, `🏅 ${badge}`)
        ))
      ])
    );
  }

  // Follow counts
  const followChildren = [
    React.createElement('div', { key: 'followers', style: { textAlign: 'center' } }, [
      React.createElement('div', { style: { color: '#fff', fontSize: '16px', fontWeight: 'bold' } }, followers.length || 0),
      React.createElement('div', { style: { color: '#666', fontSize: '11px' } }, 'Followers')
    ]),
    React.createElement('div', { key: 'following', style: { textAlign: 'center' } }, [
      React.createElement('div', { style: { color: '#fff', fontSize: '16px', fontWeight: 'bold' } }, following.length || 0),
      React.createElement('div', { style: { color: '#666', fontSize: '11px' } }, 'Following')
    ])
  ];
  sidebarChildren.push(
    React.createElement('div', {
      key: 'follows',
      style: {
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0',
        borderBottom: '1px solid #222'
      }
    }, followChildren)
  );

  // Action buttons
  const actionChildren = [];
  if (!isEditing) {
    actionChildren.push(
      React.createElement('button', {
        key: 'edit',
        onClick: () => setIsEditing(true),
        style: {
          padding: '10px',
          borderRadius: '8px',
          border: 'none',
          background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: 'bold'
        }
      }, 'Edit Profile')
    );
  }
  actionChildren.push(
    React.createElement('button', {
      key: 'settings',
      onClick: goToSettings,
      style: {
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #333',
        background: 'transparent',
        color: '#fff',
        cursor: 'pointer'
      }
    }, '⚙️ Settings')
  );
  actionChildren.push(
    React.createElement('button', {
      key: 'blocklist',
      onClick: () => setShowBlockList(!showBlockList),
      style: {
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #333',
        background: 'transparent',
        color: '#fff',
        cursor: 'pointer'
      }
    }, `🚫 Block List (${blockedUsers.length})`)
  );
  actionChildren.push(
    React.createElement('button', {
      key: 'delete',
      onClick: deleteAccount,
      style: {
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #ff4444',
        background: 'transparent',
        color: '#ff4444',
        cursor: 'pointer'
      }
    }, '🗑️ Delete Account')
  );
  sidebarChildren.push(
    React.createElement('div', {
      key: 'actions',
      style: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }
    }, actionChildren)
  );

  // Block list
  if (showBlockList) {
    const blockChildren = [];
    if (blockedUsers.length === 0) {
      blockChildren.push(
        React.createElement('p', { key: 'empty', style: { color: '#666', fontSize: '13px' } }, 'No blocked users')
      );
    } else {
      blockedUsers.forEach(block => {
        blockChildren.push(
          React.createElement('div', {
            key: block.id || block.blocked_id,
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom: '1px solid #222'
            }
          }, [
            React.createElement('span', { style: { color: '#aaa' } }, block.username || 'User'),
            React.createElement('button', {
              onClick: async () => {
                await apiFetch('/users/me/unblock', {
                  method: 'POST',
                  body: JSON.stringify({ userId: block.blocked_id || block.id })
                });
                fetchBlocked();
              },
              style: {
                background: 'transparent',
                border: 'none',
                color: '#FF6B9D',
                cursor: 'pointer'
              }
            }, 'Unblock')
          ])
        );
      });
    }
    sidebarChildren.push(
      React.createElement('div', {
        key: 'blocklist',
        style: {
          marginTop: '12px',
          padding: '12px',
          background: '#1a1a2e',
          borderRadius: '8px',
          maxHeight: '200px',
          overflowY: 'auto'
        }
      }, [
        React.createElement('h4', { key: 'title', style: { color: '#fff', marginBottom: '8px' } }, 'Blocked Users'),
        ...blockChildren
      ])
    );
  }

  // Build sidebar
  const sidebar = React.createElement('div', {
    style: { width: '260px', flexShrink: 0 }
  }, sidebarChildren);

  // --- Build main content ---
  let contentChildren = [];

  if (isEditing) {
    // Edit form
    const formFields = ['display_name', 'bio', 'relationship_intent'].map(field => {
      const label = field === 'display_name' ? 'Display Name' :
                    field === 'bio' ? 'Bio' :
                    'Relationship Intent';
      const type = field === 'bio' ? 'textarea' : 'text';
      return React.createElement('div', { key: field, style: { display: 'flex', flexDirection: 'column', gap: '4px' } }, [
        React.createElement('label', { key: 'lbl', style: { color: '#aaa', fontSize: '13px' } }, label),
        type === 'textarea'
          ? React.createElement('textarea', {
              value: editForm[field] || '',
              onChange: (e) => setEditForm({ ...editForm, [field]: e.target.value }),
              style: {
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #333',
                background: '#0f0f1a',
                color: '#fff',
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical'
              }
            })
          : React.createElement('input', {
              type: type,
              value: editForm[field] || '',
              onChange: (e) => setEditForm({ ...editForm, [field]: e.target.value }),
              style: {
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #333',
                background: '#0f0f1a',
                color: '#fff',
                fontSize: '14px'
              }
            })
      ]);
    });

    // Interests and languages as comma-separated inputs
    const interestInput = React.createElement('div', { key: 'interests', style: { display: 'flex', flexDirection: 'column', gap: '4px' } }, [
      React.createElement('label', { style: { color: '#aaa', fontSize: '13px' } }, 'Interests (comma separated)'),
      React.createElement('input', {
        value: (editForm.interests || []).join(', '),
        onChange: (e) => setEditForm({ ...editForm, interests: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }),
        style: {
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid #333',
          background: '#0f0f1a',
          color: '#fff',
          fontSize: '14px'
        }
      })
    ]);
    const langInput = React.createElement('div', { key: 'languages', style: { display: 'flex', flexDirection: 'column', gap: '4px' } }, [
      React.createElement('label', { style: { color: '#aaa', fontSize: '13px' } }, 'Languages (comma separated)'),
      React.createElement('input', {
        value: (editForm.languages || []).join(', '),
        onChange: (e) => setEditForm({ ...editForm, languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }),
        style: {
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid #333',
          background: '#0f0f1a',
          color: '#fff',
          fontSize: '14px'
        }
      })
    ]);

    const formChildren = [...formFields, interestInput, langInput];
    const buttons = [
      React.createElement('button', {
        key: 'save',
        type: 'submit',
        style: {
          padding: '10px 24px',
          borderRadius: '6px',
          border: 'none',
          background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: 'bold'
        }
      }, 'Save'),
      React.createElement('button', {
        key: 'cancel',
        type: 'button',
        onClick: () => setIsEditing(false),
        style: {
          padding: '10px 24px',
          borderRadius: '6px',
          border: '1px solid #333',
          background: 'transparent',
          color: '#fff',
          cursor: 'pointer'
        }
      }, 'Cancel')
    ];

    contentChildren.push(
      React.createElement('div', {
        key: 'edit-form',
        style: {
          background: '#1a1a2e',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '20px'
        }
      }, [
        React.createElement('h3', { key: 'title', style: { color: '#fff', marginBottom: '16px' } }, 'Edit Profile'),
        React.createElement('form', {
          key: 'form',
          onSubmit: updateProfile,
          style: { display: 'flex', flexDirection: 'column', gap: '12px' }
        }, [...formChildren, React.createElement('div', { key: 'buttons', style: { display: 'flex', gap: '12px', marginTop: '8px' } }, buttons)])
      ])
    );
  } else {
    // Not editing – show profile details
    // Bio
    if (user.bio) {
      contentChildren.push(
        React.createElement('div', {
          key: 'bio',
          style: {
            background: '#1a1a2e',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '16px'
          }
        }, [
          React.createElement('h4', { key: 'title', style: { color: '#aaa', fontSize: '13px', marginBottom: '8px' } }, 'Bio'),
          React.createElement('p', { key: 'text', style: { color: '#fff', lineHeight: '1.6' } }, user.bio)
        ])
      );
    }

    // Details grid
    const detailItems = [
      ['Location', user.location?.city || 'Not set'],
      ['Relationship Intent', user.relationship_intent || 'Not set'],
      ['Interests', (user.interests || []).join(', ') || 'Not set'],
      ['Languages', (user.languages || []).join(', ') || 'Not set'],
      ['Member Since', new Date(user.created_at).toLocaleDateString()],
      ['Membership', user.membership_tier || 'Free']
    ].filter(([label, value]) => value !== 'Not set' && value !== '');

    const detailChildren = detailItems.map(([label, value]) =>
      React.createElement('div', {
        key: label,
        style: {
          background: '#1a1a2e',
          padding: '16px',
          borderRadius: '12px'
        }
      }, [
        React.createElement('div', { key: 'label', style: { color: '#666', fontSize: '11px', textTransform: 'uppercase' } }, label),
        React.createElement('div', { key: 'value', style: { color: '#fff', fontSize: '14px', marginTop: '4px' } }, value)
      ])
    );

    if (detailChildren.length > 0) {
      contentChildren.push(
        React.createElement('div', {
          key: 'details',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '16px'
          }
        }, detailChildren)
      );
    }

    // Badges
    if (user.badges && user.badges.length > 0) {
      const badgeChildren = user.badges.map(badge =>
        React.createElement('span', {
          key: badge,
          style: {
            padding: '4px 12px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)',
            color: '#fff',
            fontSize: '12px'
          }
        }, `🏅 ${badge}`)
      );
      contentChildren.push(
        React.createElement('div', {
          key: 'badges',
          style: {
            background: '#1a1a2e',
            padding: '20px',
            borderRadius: '12px'
          }
        }, [
          React.createElement('h4', { key: 'title', style: { color: '#aaa', fontSize: '13px', marginBottom: '8px' } }, 'Badges'),
          React.createElement('div', { key: 'list', style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } }, badgeChildren)
        ])
      );
    }
  }

  const mainContent = React.createElement('div', {
    style: { flex: 1 }
  }, contentChildren);

  // --- Wrap everything in Layout ---
  return React.createElement(Layout, null,
    React.createElement('div', {
      style: {
        display: 'flex',
        gap: '30px',
        padding: '30px',
        maxWidth: '1200px',
        margin: '0 auto'
      }
    }, [sidebar, mainContent])
  );
}
