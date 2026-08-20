// pages/profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [activeTab, setActiveTab] = useState('profile'); // profile, photos, privacy, settings
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showBlockList, setShowBlockList] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch user profile
  const fetchProfile = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://api.amoramatch.one/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  // Fetch followers/following
  const fetchFollows = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const [followersRes, followingRes] = await Promise.all([
        fetch('https://api.amoramatch.one/users/me/followers', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('https://api.amoramatch.one/users/me/following', {
          headers: { Authorization: `Bearer ${token}` }
        })
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

  // Fetch blocked users
  const fetchBlocked = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch('https://api.amoramatch.one/users/me/blocks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBlockedUsers(data.blocks || []);
      }
    } catch (e) {
      console.error('Failed to fetch blocks', e);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchFollows();
    fetchBlocked();
  }, []);

  // Update profile
  const updateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch('https://api.amoramatch.one/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
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

  // Upload profile photo
  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    setUploading(true);
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch('https://api.amoramatch.one/users/me/photos', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setUser({ ...user, profile_photo: data.url });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Delete account
  const deleteAccount = async () => {
    if (!confirm('Are you sure? This action is permanent.')) return;
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch('https://api.amoramatch.one/users/me', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        localStorage.clear();
        router.push('/');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Logout
  const logout = async () => {
    const token = localStorage.getItem('refreshToken');
    try {
      await fetch('https://api.amoramatch.one/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: token })
      });
    } catch (e) {}
    localStorage.clear();
    router.push('/login');
  };

  if (loading) {
    return React.createElement('div', {
      style: {
        minHeight: '100vh',
        background: '#0f0f1a',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif'
      }
    }, 'Loading profile...');
  }

  if (error || !user) {
    return React.createElement('div', {
      style: {
        minHeight: '100vh',
        background: '#0f0f1a',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif'
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
          background: '#FF6B9D',
          color: '#fff',
          cursor: 'pointer'
        }
      }, 'Retry')
    ]);
  }

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: '#0f0f1a',
      color: '#fff',
      fontFamily: 'sans-serif'
    }
  }, [
    // Header
    React.createElement('header', {
      key: 'header',
      style: {
        padding: '20px 30px',
        borderBottom: '1px solid #222',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, [
      React.createElement('div', { key: 'left', style: { display: 'flex', alignItems: 'center', gap: '16px' } }, [
        React.createElement(Link, {
          key: 'back',
          href: '/discover',
          style: { color: '#888', textDecoration: 'none', fontSize: '20px' }
        }, '←'),
        React.createElement('h1', { key: 'title', style: { color: '#fff', fontSize: '20px', margin: 0 } }, 'Profile')
      ]),
      React.createElement('div', { key: 'right', style: { display: 'flex', gap: '12px' } }, [
        React.createElement('button', {
          key: 'logout',
          onClick: logout,
          style: {
            padding: '6px 16px',
            borderRadius: '6px',
            border: '1px solid #333',
            background: 'transparent',
            color: '#888',
            cursor: 'pointer'
          }
        }, 'Logout')
      ])
    ]),

    // Main content
    React.createElement('div', {
      key: 'main',
      style: {
        display: 'flex',
        gap: '30px',
        padding: '30px',
        maxWidth: '1200px',
        margin: '0 auto'
      }
    }, [
      // Sidebar with profile card
      React.createElement('div', {
        key: 'sidebar',
        style: {
          width: '260px',
          flexShrink: 0
        }
      }, [
        // Profile photo
        React.createElement('div', {
          style: {
            position: 'relative',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: '#2a2a3e',
            margin: '0 auto 20px',
            overflow: 'hidden',
            border: '3px solid #FF6B9D'
          }
        }, [
          user.profile_photo
            ? React.createElement('img', {
                src: user.profile_photo,
                alt: user.display_name || user.username,
                style: { width: '100%', height: '100%', objectFit: 'cover' }
              })
            : React.createElement('div', {
                style: {
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '64px',
                  color: '#444'
                }
              }, '👤'),
          React.createElement('button', {
            onClick: () => fileInputRef.current?.click(),
            style: {
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              background: '#FF6B9D',
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
          }, uploading ? '⏳' : '📷'),
          React.createElement('input', {
            ref: fileInputRef,
            type: 'file',
            accept: 'image/*',
            style: { display: 'none' },
            onChange: uploadPhoto
          })
        ]),

        // User info
        React.createElement('h2', {
          style: { textAlign: 'center', color: '#fff', marginBottom: '4px' }
        }, user.display_name || user.username),
        React.createElement('p', {
          style: { textAlign: 'center', color: '#888', fontSize: '14px', marginBottom: '16px' }
        }, `@${user.username}`),

        // Stats
        React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'space-around',
            padding: '12px 0',
            borderTop: '1px solid #222',
            borderBottom: '1px solid #222',
            marginBottom: '16px'
          }
        }, [
          ['Level', user.level || 0],
          ['XP', user.xp || 0],
          ['Membership', user.membership_tier || 'Free']
        ].map(([label, value]) =>
          React.createElement('div', { key: label, style: { textAlign: 'center' } }, [
            React.createElement('div', { key: 'val', style: { color: '#FF6B9D', fontSize: '18px', fontWeight: 'bold' } }, value),
            React.createElement('div', { key: 'label', style: { color: '#666', fontSize: '11px' } }, label)
          ])
        )),

        // Follow counts
        React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'space-around',
            padding: '12px 0',
            borderBottom: '1px solid #222'
          }
        }, [
          React.createElement('div', { key: 'followers', style: { textAlign: 'center' } }, [
            React.createElement('div', { style: { color: '#fff', fontSize: '16px', fontWeight: 'bold' } }, followers.length || 0),
            React.createElement('div', { style: { color: '#666', fontSize: '11px' } }, 'Followers')
          ]),
          React.createElement('div', { key: 'following', style: { textAlign: 'center' } }, [
            React.createElement('div', { style: { color: '#fff', fontSize: '16px', fontWeight: 'bold' } }, following.length || 0),
            React.createElement('div', { style: { color: '#666', fontSize: '11px' } }, 'Following')
          ])
        ]),

        // Action buttons
        React.createElement('div', {
          style: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }
        }, [
          !isEditing && React.createElement('button', {
            key: 'edit',
            onClick: () => setIsEditing(true),
            style: {
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: '#FF6B9D',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold'
            }
          }, 'Edit Profile'),
          React.createElement('button', {
            key: 'settings',
            onClick: () => setActiveTab('settings'),
            style: {
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #333',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer'
            }
          }, '⚙️ Settings'),
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
          }, `🚫 Block List (${blockedUsers.length})`),
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
        ]),

        // Block list
        showBlockList && React.createElement('div', {
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
          blockedUsers.length === 0
            ? React.createElement('p', { key: 'empty', style: { color: '#666', fontSize: '13px' } }, 'No blocked users')
            : blockedUsers.map(block =>
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
                      const token = localStorage.getItem('accessToken');
                      await fetch(`https://api.amoramatch.one/users/me/unblock`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
              )
        ])
      ]),

      // Main content area
      React.createElement('div', {
        key: 'content',
        style: { flex: 1 }
      }, [
        // Edit form
        isEditing && React.createElement('div', {
          key: 'edit',
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
          }, [
            ['display_name', 'Display Name', 'text'],
            ['bio', 'Bio', 'textarea'],
            ['relationship_intent', 'Relationship Intent', 'text']
          ].map(([field, label, type]) =>
            React.createElement('div', { key: field, style: { display: 'flex', flexDirection: 'column', gap: '4px' } }, [
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
            ])
          ),
          React.createElement('div', { key: 'interests', style: { display: 'flex', flexDirection: 'column', gap: '4px' } }, [
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
          ]),
          React.createElement('div', { key: 'languages', style: { display: 'flex', flexDirection: 'column', gap: '4px' } }, [
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
          ]),
          React.createElement('div', { key: 'buttons', style: { display: 'flex', gap: '12px', marginTop: '8px' } }, [
            React.createElement('button', {
              type: 'submit',
              style: {
                padding: '10px 24px',
                borderRadius: '6px',
                border: 'none',
                background: '#FF6B9D',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold'
              }
            }, 'Save'),
            React.createElement('button', {
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
          ])
        ]),

        // Profile view (when not editing)
        !isEditing && React.createElement('div', { key: 'view' }, [
          // Bio
          user.bio && React.createElement('div', {
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
          ]),

          // Details grid
          React.createElement('div', {
            key: 'details',
            style: {
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '16px'
            }
          }, [
            ['Location', user.location?.city || 'Not set'],
            ['Relationship Intent', user.relationship_intent || 'Not set'],
            ['Interests', (user.interests || []).join(', ') || 'Not set'],
            ['Languages', (user.languages || []).join(', ') || 'Not set'],
            ['Member Since', new Date(user.created_at).toLocaleDateString()],
            ['Membership', user.membership_tier || 'Free']
          ].filter(([label, value]) => value !== 'Not set' && value !== '').map(([label, value]) =>
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
          ]),

          // Badges
          user.badges && user.badges.length > 0 && React.createElement('div', {
            key: 'badges',
            style: {
              background: '#1a1a2e',
              padding: '20px',
              borderRadius: '12px'
            }
          }, [
            React.createElement('h4', { key: 'title', style: { color: '#aaa', fontSize: '13px', marginBottom: '8px' } }, 'Badges'),
            React.createElement('div', { key: 'list', style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
              user.badges.map(badge =>
                React.createElement('span', {
                  key: badge,
                  style: {
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: '#FF6B9D',
                    color: '#fff',
                    fontSize: '12px'
                  }
                }, `🏅 ${badge}`)
              )
            )
          ])
        ])
      ])
    ])
  ]);
}
