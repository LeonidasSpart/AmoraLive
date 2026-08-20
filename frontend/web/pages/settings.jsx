// pages/settings.jsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Settings() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('account');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Privacy state
  const [privacy, setPrivacy] = useState({
    online_status_visible: true,
    profile_visible: true,
    show_age: true,
    show_location: true
  });
  const [privacyLoading, setPrivacyLoading] = useState(false);

  // Membership state
  const [membership, setMembership] = useState(null);

  const fetchUser = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('https://api.amoramatch.one/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      setUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivacy = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch('https://api.amoramatch.one/users/me/privacy', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPrivacy({ ...privacy, ...data });
      }
    } catch (e) {
      console.error('Failed to fetch privacy', e);
    }
  };

  const fetchMembership = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch('https://api.amoramatch.one/membership/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMembership(data);
      }
    } catch (e) {
      console.error('Failed to fetch membership', e);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchPrivacy();
    fetchMembership();
  }, []);

  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    setPasswordLoading(true);
    setError('');
    setSuccess('');
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch('https://api.amoramatch.one/users/me/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Update privacy
  const handlePrivacyUpdate = async (key, value) => {
    setPrivacyLoading(true);
    const updated = { ...privacy, [key]: value };
    setPrivacy(updated);
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch('https://api.amoramatch.one/users/me/privacy', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error('Failed to update privacy');
      setSuccess('Privacy settings updated');
    } catch (err) {
      setError(err.message);
      // revert
      fetchPrivacy();
    } finally {
      setPrivacyLoading(false);
    }
  };

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

  const deleteAccount = async () => {
    if (!confirm('Are you sure? This action is permanent and cannot be undone.')) return;
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
    }, 'Loading settings...');
  }

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: '#0f0f1a',
      color: '#fff',
      fontFamily: 'sans-serif',
      padding: '20px'
    }
  }, [
    // Header
    React.createElement('header', {
      key: 'header',
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        paddingBottom: '16px',
        borderBottom: '1px solid #222'
      }
    }, [
      React.createElement(Link, {
        key: 'back',
        href: '/discover',
        style: { color: '#888', textDecoration: 'none', fontSize: '20px' }
      }, '←'),
      React.createElement('h1', { key: 'title', style: { color: '#fff', fontSize: '24px', margin: 0 } }, 'Settings')
    ]),

    // Error / success messages
    error && React.createElement('div', {
      key: 'error',
      style: {
        background: '#2a1a1a',
        color: '#ff6b6b',
        padding: '12px',
        borderRadius: '6px',
        marginTop: '16px',
        marginBottom: '16px'
      }
    }, error),
    success && React.createElement('div', {
      key: 'success',
      style: {
        background: '#1a2a1a',
        color: '#6bff6b',
        padding: '12px',
        borderRadius: '6px',
        marginTop: '16px',
        marginBottom: '16px'
      }
    }, success),

    // Main layout: sidebar + content
    React.createElement('div', {
      key: 'layout',
      style: {
        display: 'flex',
        gap: '30px',
        marginTop: '20px',
        flexWrap: 'wrap'
      }
    }, [
      // Sidebar navigation
      React.createElement('nav', {
        key: 'sidebar',
        style: {
          width: '220px',
          flexShrink: 0
        }
      }, [
        ['account', 'Account'],
        ['privacy', 'Privacy'],
        ['membership', 'Membership'],
        ['support', 'Support & Legal']
      ].map(([key, label]) =>
        React.createElement('button', {
          key: key,
          onClick: () => setActiveSection(key),
          style: {
            display: 'block',
            width: '100%',
            padding: '12px 16px',
            marginBottom: '4px',
            borderRadius: '6px',
            border: 'none',
            background: activeSection === key ? '#FF6B9D' : 'transparent',
            color: activeSection === key ? '#fff' : '#aaa',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: '14px',
            fontWeight: activeSection === key ? 'bold' : 'normal',
            transition: '0.2s'
          }
        }, label)
      ),
      // Danger zone (logout + delete) always visible
      React.createElement('hr', { key: 'divider', style: { borderColor: '#333', margin: '12px 0' } }),
      React.createElement('button', {
        key: 'logout',
        onClick: logout,
        style: {
          display: 'block',
          width: '100%',
          padding: '12px 16px',
          marginBottom: '4px',
          borderRadius: '6px',
          border: '1px solid #444',
          background: 'transparent',
          color: '#ff6b6b',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: '14px'
        }
      }, 'Logout'),
      React.createElement('button', {
        key: 'delete',
        onClick: deleteAccount,
        style: {
          display: 'block',
          width: '100%',
          padding: '12px 16px',
          borderRadius: '6px',
          border: '1px solid #ff4444',
          background: 'transparent',
          color: '#ff4444',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: '14px'
        }
      }, 'Delete Account')
    ]),

    // Content area
    React.createElement('div', {
      key: 'content',
      style: { flex: 1, minWidth: '280px' }
    }, [
      // Account section
      activeSection === 'account' && React.createElement('div', { key: 'account' }, [
        React.createElement('h2', { key: 'title', style: { color: '#fff', marginBottom: '16px' } }, 'Account Settings'),
        React.createElement('div', {
          key: 'info',
          style: {
            background: '#1a1a2e',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '16px'
          }
        }, [
          React.createElement('div', { key: 'email', style: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #222' } }, [
            React.createElement('span', { style: { color: '#aaa' } }, 'Email'),
            React.createElement('span', { style: { color: '#fff' } }, user?.email)
          ]),
          React.createElement('div', { key: 'username', style: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #222' } }, [
            React.createElement('span', { style: { color: '#aaa' } }, 'Username'),
            React.createElement('span', { style: { color: '#fff' } }, user?.username)
          ]),
          React.createElement('div', { key: 'display', style: { display: 'flex', justifyContent: 'space-between', padding: '8px 0' } }, [
            React.createElement('span', { style: { color: '#aaa' } }, 'Display Name'),
            React.createElement('span', { style: { color: '#fff' } }, user?.display_name)
          ])
        ]),
        // Change password form
        React.createElement('div', {
          key: 'password',
          style: {
            background: '#1a1a2e',
            padding: '20px',
            borderRadius: '8px'
          }
        }, [
          React.createElement('h3', { key: 'pwd-title', style: { color: '#fff', marginBottom: '12px' } }, 'Change Password'),
          React.createElement('form', {
            key: 'pwd-form',
            onSubmit: handlePasswordChange,
            style: { display: 'flex', flexDirection: 'column', gap: '12px' }
          }, [
            React.createElement('input', {
              key: 'current',
              type: 'password',
              placeholder: 'Current password',
              value: currentPassword,
              onChange: (e) => setCurrentPassword(e.target.value),
              required: true,
              style: {
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #333',
                background: '#0f0f1a',
                color: '#fff',
                fontSize: '14px'
              }
            }),
            React.createElement('input', {
              key: 'new',
              type: 'password',
              placeholder: 'New password (min 8 chars)',
              value: newPassword,
              onChange: (e) => setNewPassword(e.target.value),
              required: true,
              minLength: 8,
              style: {
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #333',
                background: '#0f0f1a',
                color: '#fff',
                fontSize: '14px'
              }
            }),
            React.createElement('input', {
              key: 'confirm',
              type: 'password',
              placeholder: 'Confirm new password',
              value: confirmPassword,
              onChange: (e) => setConfirmPassword(e.target.value),
              required: true,
              style: {
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #333',
                background: '#0f0f1a',
                color: '#fff',
                fontSize: '14px'
              }
            }),
            React.createElement('button', {
              key: 'submit',
              type: 'submit',
              disabled: passwordLoading,
              style: {
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                background: '#FF6B9D',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
                opacity: passwordLoading ? 0.7 : 1
              }
            }, passwordLoading ? 'Updating...' : 'Update Password')
          ])
        ])
      ]),

      // Privacy section
      activeSection === 'privacy' && React.createElement('div', { key: 'privacy' }, [
        React.createElement('h2', { key: 'title', style: { color: '#fff', marginBottom: '16px' } }, 'Privacy Settings'),
        React.createElement('div', {
          key: 'options',
          style: {
            background: '#1a1a2e',
            padding: '20px',
            borderRadius: '8px'
          }
        }, [
          ['online_status_visible', 'Show online status'],
          ['profile_visible', 'Profile visible to others'],
          ['show_age', 'Show age on profile'],
          ['show_location', 'Show location on profile']
        ].map(([key, label]) =>
          React.createElement('div', {
            key: key,
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid #222'
            }
          }, [
            React.createElement('span', { style: { color: '#aaa' } }, label),
            React.createElement('label', { style: { display: 'flex', alignItems: 'center' } }, [
              React.createElement('input', {
                type: 'checkbox',
                checked: privacy[key] !== false,
                onChange: (e) => handlePrivacyUpdate(key, e.target.checked),
                disabled: privacyLoading,
                style: { accentColor: '#FF6B9D', width: '18px', height: '18px' }
              })
            ])
          ])
        ),
        React.createElement('div', {
          key: 'block-link',
          style: { marginTop: '16px' }
        }, [
          React.createElement(Link, {
            href: '/profile',
            style: { color: '#FF6B9D', textDecoration: 'none' }
          }, 'Manage Block List →')
        ])
      ]),

      // Membership section
      activeSection === 'membership' && React.createElement('div', { key: 'membership' }, [
        React.createElement('h2', { key: 'title', style: { color: '#fff', marginBottom: '16px' } }, 'Membership'),
        React.createElement('div', {
          key: 'current',
          style: {
            background: '#1a1a2e',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '16px'
          }
        }, [
          React.createElement('div', { key: 'tier', style: { display: 'flex', justifyContent: 'space-between', padding: '8px 0' } }, [
            React.createElement('span', { style: { color: '#aaa' } }, 'Current Plan'),
            React.createElement('span', { style: { color: '#FFD700', fontWeight: 'bold' } }, membership?.tier || 'Free')
          ]),
          membership?.expires_at && React.createElement('div', { key: 'expires', style: { display: 'flex', justifyContent: 'space-between', padding: '8px 0' } }, [
            React.createElement('span', { style: { color: '#aaa' } }, 'Expires'),
            React.createElement('span', { style: { color: '#fff' } }, new Date(membership.expires_at).toLocaleDateString())
          ])
        ]),
        React.createElement('div', {
          key: 'upgrade',
          style: {
            background: '#1a1a2e',
            padding: '20px',
            borderRadius: '8px'
          }
        }, [
          React.createElement('h3', { key: 'plans', style: { color: '#fff', marginBottom: '12px' } }, 'Upgrade Your Plan'),
          React.createElement('div', {
            key: 'plan-list',
            style: { display: 'flex', flexDirection: 'column', gap: '12px' }
          }, [
            ['Premium', '$9.99/month', 'Ad-free, exclusive gifts, priority support'],
            ['VIP', '$29.99/month', 'All Premium benefits + extra coins, profile boost'],
            ['SVIP', '$59.99/month', 'All VIP benefits + private shows, unlimited gifts']
          ].map(([tier, price, desc]) =>
            React.createElement('div', {
              key: tier,
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #333',
                background: '#0f0f1a'
              }
            }, [
              React.createElement('div', { key: 'info' }, [
                React.createElement('div', { key: 'name', style: { color: '#fff', fontWeight: 'bold' } }, tier),
                React.createElement('div', { key: 'desc', style: { color: '#aaa', fontSize: '12px' } }, desc)
              ]),
              React.createElement('div', { key: 'price' }, [
                React.createElement('span', { style: { color: '#FFD700', marginRight: '12px' } }, price),
                React.createElement('button', {
                  key: 'btn',
                  style: {
                    padding: '4px 16px',
                    borderRadius: '4px',
                    border: 'none',
                    background: '#FF6B9D',
                    color: '#fff',
                    cursor: 'pointer'
                  }
                }, 'Upgrade')
              ])
            ])
          )
        ])
      ]),

      // Support & Legal
      activeSection === 'support' && React.createElement('div', { key: 'support' }, [
        React.createElement('h2', { key: 'title', style: { color: '#fff', marginBottom: '16px' } }, 'Support & Legal'),
        React.createElement('div', {
          key: 'links',
          style: {
            background: '#1a1a2e',
            padding: '20px',
            borderRadius: '8px'
          }
        }, [
          ['Terms of Service', '/legal/terms'],
          ['Privacy Policy', '/legal/privacy'],
          ['Community Guidelines', '/legal/guidelines'],
          ['Cookie Policy', '/legal/cookies'],
          ['Contact Support', 'mailto:support@amoramatch.one']
        ].map(([label, href]) =>
          React.createElement('div', {
            key: label,
            style: {
              padding: '10px 0',
              borderBottom: '1px solid #222'
            }
          }, [
            React.createElement(Link, {
              href: href,
              style: { color: '#aaa', textDecoration: 'none' }
            }, label)
          ])
        ))
      ])
    ])
  ])
  ]);
}
