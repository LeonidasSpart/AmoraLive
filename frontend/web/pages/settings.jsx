// pages/settings.jsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch, clearSession } from '../lib/api';
import { useTranslation } from '../lib/i18n';

export default function Settings() {
  const { t } = useTranslation();
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
  const [upgrading, setUpgrading] = useState(null);

  const fetchUser = async () => {
    if (!localStorage.getItem('accessToken')) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/users/me');
      if (!res.ok) throw new Error(t('settings.errorLoadUser'));
      const data = await res.json();
      setUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivacy = async () => {
    try {
      const res = await apiFetch('/users/me/privacy');
      if (res.ok) {
        const data = await res.json();
        setPrivacy({ ...privacy, ...data });
      }
    } catch (e) {
      console.error('Failed to fetch privacy', e);
    }
  };

  const fetchMembership = async () => {
    try {
      const res = await apiFetch('/membership/me');
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
      setError(t('settings.passwordsDontMatch'));
      return;
    }
    if (newPassword.length < 10) {
      setError(t('settings.passwordMinLength'));
      return;
    }
    setPasswordLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiFetch('/users/me/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('settings.errorChangePassword'));
      clearSession();
      setSuccess(t('settings.passwordUpdatedSuccess'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => router.push('/login?passwordChanged=1'), 500);
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
    try {
      const res = await apiFetch('/users/me/privacy', {
        method: 'PATCH',
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error(t('settings.errorUpdatePrivacy'));
      setSuccess(t('settings.privacyUpdatedSuccess'));
    } catch (err) {
      setError(err.message);
      fetchPrivacy();
    } finally {
      setPrivacyLoading(false);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('refreshToken');
    try {
      await apiFetch('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken: token }) }, { skipRefresh: true });
    } catch (e) {}
    clearSession();
    router.push('/login');
  };

  const upgradeMembership = async (tier) => {
    setUpgrading(tier);
    setError('');
    try {
      const res = await apiFetch('/membership/checkout', {
        method: 'POST',
        body: JSON.stringify({ tier })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t('settings.errorStartCheckout'));
      if (!data.checkoutUrl) throw new Error(t('settings.checkoutUnavailable'));
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err.message);
      setUpgrading(null);
    }
  };

  const deleteAccount = async () => {
    if (!confirm(t('settings.deleteConfirm'))) return;
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
    }, t('settings.loadingSettings'));
  }

  // Helper: sidebar navigation
  const sidebarItems = [
    ['account', t('settings.sidebarAccount')],
    ['privacy', t('settings.sidebarPrivacy')],
    ['membership', t('settings.sidebarMembership')],
    ['support', t('settings.sidebarSupport')]
  ];

  const sidebarChildren = [];
  sidebarItems.forEach(([key, label]) => {
    sidebarChildren.push(
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
          background: activeSection === key ? 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)' : 'transparent',
          color: activeSection === key ? '#fff' : '#aaa',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: '14px',
          fontWeight: activeSection === key ? 'bold' : 'normal',
          transition: '0.2s'
        }
      }, label)
    );
  });

  // Danger zone buttons
  const dangerChildren = [
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
    }, t('settings.logout')),
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
    }, t('settings.deleteAccount'))
  ];

  const sidebar = React.createElement('nav', {
    style: { width: '220px', flexShrink: 0 }
  }, [...sidebarChildren, ...dangerChildren]);

  // Helper: content area
  let contentChildren = [];

  // Account section
  if (activeSection === 'account') {
    contentChildren = [
      React.createElement('h2', { key: 'title', style: { color: '#fff', marginBottom: '16px' } }, t('settings.accountSettingsTitle')),
      React.createElement('div', {
        key: 'info',
        style: { background: '#1a1a2e', padding: '20px', borderRadius: '8px', marginBottom: '16px' }
      }, [
        React.createElement('div', { key: 'email', style: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #222' } },
          React.createElement('span', { style: { color: '#aaa' } }, t('settings.emailLabel')),
          React.createElement('span', { style: { color: '#fff' } }, user?.email)
        ),
        React.createElement('div', { key: 'username', style: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #222' } },
          React.createElement('span', { style: { color: '#aaa' } }, t('settings.usernameLabel')),
          React.createElement('span', { style: { color: '#fff' } }, user?.username)
        ),
        React.createElement('div', { key: 'display', style: { display: 'flex', justifyContent: 'space-between', padding: '8px 0' } },
          React.createElement('span', { style: { color: '#aaa' } }, t('settings.displayNameLabel')),
          React.createElement('span', { style: { color: '#fff' } }, user?.display_name)
        )
      ]),
      React.createElement('div', {
        key: 'password',
        style: { background: '#1a1a2e', padding: '20px', borderRadius: '8px' }
      }, [
        React.createElement('h3', { key: 'pwd-title', style: { color: '#fff', marginBottom: '12px' } }, t('settings.changePasswordTitle')),
        React.createElement('form', {
          key: 'pwd-form',
          onSubmit: handlePasswordChange,
          style: { display: 'flex', flexDirection: 'column', gap: '12px' }
        }, [
          React.createElement('input', {
            key: 'current',
            type: 'password',
            placeholder: t('settings.currentPasswordPlaceholder'),
            value: currentPassword,
            onChange: (e) => setCurrentPassword(e.target.value),
            required: true,
            style: { padding: '10px', borderRadius: '6px', border: '1px solid #333', background: '#0f0f1a', color: '#fff', fontSize: '14px' }
          }),
          React.createElement('input', {
            key: 'new',
            type: 'password',
            placeholder: t('settings.newPasswordPlaceholder'),
            value: newPassword,
            onChange: (e) => setNewPassword(e.target.value),
            required: true,
            minLength: 8,
            style: { padding: '10px', borderRadius: '6px', border: '1px solid #333', background: '#0f0f1a', color: '#fff', fontSize: '14px' }
          }),
          React.createElement('input', {
            key: 'confirm',
            type: 'password',
            placeholder: t('settings.confirmPasswordPlaceholder'),
            value: confirmPassword,
            onChange: (e) => setConfirmPassword(e.target.value),
            required: true,
            style: { padding: '10px', borderRadius: '6px', border: '1px solid #333', background: '#0f0f1a', color: '#fff', fontSize: '14px' }
          }),
          React.createElement('button', {
            key: 'submit',
            type: 'submit',
            disabled: passwordLoading,
            style: {
              padding: '10px',
              borderRadius: '6px',
              border: 'none',
              background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
              opacity: passwordLoading ? 0.7 : 1
            }
          }, passwordLoading ? t('settings.updating') : t('settings.updatePassword'))
        ])
      ])
    ];
  }

  // Privacy section
  if (activeSection === 'privacy') {
    const privacyOptions = [
      ['online_status_visible', t('settings.showOnlineStatus')],
      ['profile_visible', t('settings.profileVisibleToOthers')],
      ['show_age', t('settings.showAgeOnProfile')],
      ['show_location', t('settings.showLocationOnProfile')]
    ];
    const optChildren = privacyOptions.map(([key, label]) =>
      React.createElement('div', {
        key: key,
        style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #222' }
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
    );
    contentChildren = [
      React.createElement('h2', { key: 'title', style: { color: '#fff', marginBottom: '16px' } }, t('settings.privacySettingsTitle')),
      React.createElement('div', {
        key: 'options',
        style: { background: '#1a1a2e', padding: '20px', borderRadius: '8px' }
      }, [
        ...optChildren,
        React.createElement('div', {
          key: 'block-link',
          style: { marginTop: '16px' }
        }, [
          React.createElement(Link, {
            href: '/profile',
            style: { color: '#FF6B9D', textDecoration: 'none' }
          }, t('settings.manageBlockList'))
        ])
      ])
    ];
  }

  // Membership section
  if (activeSection === 'membership') {
    const plans = [
      ['premium', t('settings.premiumName'), '$9.99/month', t('settings.premiumDesc')],
      ['vip', t('settings.vipName'), '$29.99/month', t('settings.vipDesc')],
      ['svip', t('settings.svipName'), '$59.99/month', t('settings.svipDesc')]
    ];
    const planChildren = plans.map(([tierKey, tier, price, desc]) =>
      React.createElement('div', {
        key: tier,
        style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '6px', border: '1px solid #333', background: '#0f0f1a' }
      }, [
        React.createElement('div', { key: 'info' }, [
          React.createElement('div', { key: 'name', style: { color: '#fff', fontWeight: 'bold' } }, tier),
          React.createElement('div', { key: 'desc', style: { color: '#aaa', fontSize: '12px' } }, desc)
        ]),
        React.createElement('div', { key: 'price' }, [
          React.createElement('span', { style: { color: '#FFD700', marginRight: '12px' } }, price),
          React.createElement('button', {
            key: 'btn',
            onClick: () => upgradeMembership(tierKey),
            disabled: upgrading === tierKey,
            style: { padding: '4px 16px', borderRadius: '4px', border: 'none', background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', color: '#fff', cursor: upgrading === tierKey ? 'wait' : 'pointer', opacity: upgrading === tierKey ? 0.6 : 1 }
          }, upgrading === tierKey ? t('settings.redirecting') : t('settings.upgrade'))
        ])
      ])
    );
    contentChildren = [
      React.createElement('h2', { key: 'title', style: { color: '#fff', marginBottom: '16px' } }, t('settings.membershipTitle')),
      React.createElement('div', {
        key: 'current',
        style: { background: '#1a1a2e', padding: '20px', borderRadius: '8px', marginBottom: '16px' }
      }, [
        React.createElement('div', { key: 'tier', style: { display: 'flex', justifyContent: 'space-between', padding: '8px 0' } },
          React.createElement('span', { style: { color: '#aaa' } }, t('settings.currentPlan')),
          React.createElement('span', { style: { color: '#FFD700', fontWeight: 'bold' } }, membership?.tier || t('settings.freeWord'))
        ),
        membership?.end_date && React.createElement('div', { key: 'expires', style: { display: 'flex', justifyContent: 'space-between', padding: '8px 0' } },
          React.createElement('span', { style: { color: '#aaa' } }, t('settings.expires')),
          React.createElement('span', { style: { color: '#fff' } }, new Date(membership.end_date).toLocaleDateString())
        )
      ]),
      React.createElement('div', {
        key: 'upgrade',
        style: { background: '#1a1a2e', padding: '20px', borderRadius: '8px' }
      }, [
        React.createElement('h3', { key: 'plans', style: { color: '#fff', marginBottom: '12px' } }, t('settings.upgradeYourPlan')),
        React.createElement('div', {
          key: 'plan-list',
          style: { display: 'flex', flexDirection: 'column', gap: '12px' }
        }, planChildren)
      ])
    ];
  }

  // Support section
  if (activeSection === 'support') {
    const links = [
      [t('settings.termsOfService'), '/legal/terms'],
      [t('settings.privacyPolicy'), '/legal/privacy'],
      [t('settings.communityGuidelines'), '/legal/guidelines'],
      [t('settings.cookiePolicy'), '/legal/cookies'],
      [t('settings.contactSupport'), 'mailto:support@amoramatch.one']
    ];
    const linkChildren = links.map(([label, href]) =>
      React.createElement('div', {
        key: label,
        style: { padding: '10px 0', borderBottom: '1px solid #222' }
      }, [
        React.createElement(Link, {
          href: href,
          style: { color: '#aaa', textDecoration: 'none' }
        }, label)
      ])
    );
    contentChildren = [
      React.createElement('h2', { key: 'title', style: { color: '#fff', marginBottom: '16px' } }, t('settings.supportLegalTitle')),
      React.createElement('div', {
        key: 'links',
        style: { background: '#1a1a2e', padding: '20px', borderRadius: '8px' }
      }, linkChildren)
    ];
  }

  const content = React.createElement('div', {
    style: { flex: 1, minWidth: '280px' }
  }, contentChildren);

  // Main layout
  const headerChildren = [
    React.createElement(Link, {
      key: 'back',
      href: '/discover',
      style: { color: '#888', textDecoration: 'none', fontSize: '20px' }
    }, '←'),
    React.createElement('h1', { key: 'title', style: { color: '#fff', fontSize: '24px', margin: 0 } }, t('settings.title'))
  ];

  const layoutChildren = [
    sidebar,
    content
  ];

  // Full page
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: '#0f0f1a',
      color: '#fff',
      fontFamily: 'sans-serif',
      padding: '20px'
    }
  }, [
    React.createElement('header', {
      key: 'header',
      style: { display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #222' }
    }, headerChildren),
    (error || success) && React.createElement('div', {
      key: 'msg',
      style: {
        background: error ? '#2a1a1a' : '#1a2a1a',
        color: error ? '#ff6b6b' : '#6bff6b',
        padding: '12px',
        borderRadius: '6px',
        marginTop: '16px',
        marginBottom: '16px'
      }
    }, error || success),
    React.createElement('div', {
      key: 'layout',
      style: { display: 'flex', gap: '30px', marginTop: '20px', flexWrap: 'wrap' }
    }, layoutChildren)
  ]);
}
