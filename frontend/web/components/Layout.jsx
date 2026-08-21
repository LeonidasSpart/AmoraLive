// components/Layout.jsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      const publicPaths = ['/', '/login', '/register'];
      if (!publicPaths.includes(router.pathname)) {
        router.push('/login');
      }
      return;
    }
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const userRes = await fetch('https://api.amoramatch.one/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }
      const walletRes = await fetch('https://api.amoramatch.one/wallet/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (walletRes.ok) {
        const wallet = await walletRes.json();
        setBalance(wallet.balance || 0);
      }
      const notifRes = await fetch('https://api.amoramatch.one/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (notifRes.ok) {
        const data = await notifRes.json();
        setUnreadCount(data.count || 0);
      }
    } catch (e) {
      console.error('Failed to fetch user data', e);
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

  const navItems = [
    { href: '/discover', label: 'Discover', icon: '📺' },
    { href: '/video-match', label: 'Match', icon: '❤️' },
    { href: '/chat', label: 'Chat', icon: '💬' },
  ];

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'var(--amora-bg)',
      color: 'var(--amora-text)',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }
  }, [
    // Header
    React.createElement('header', {
      key: 'header',
      style: {
        padding: '12px 24px',
        borderBottom: '1px solid var(--amora-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(21,16,43,.88)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }
    }, [
      React.createElement(Link, { key: 'logo', href: '/discover', style: { display:'flex', alignItems:'center', textDecoration:'none' } }, React.createElement('img', { src:'/brand/amora-logo.png', alt:'Amora', style:{ width:'132px', height:'auto', display:'block' } })),
      React.createElement('nav', {
        key: 'nav',
        style: { display: 'flex', gap: '20px', alignItems: 'center' }
      }, navItems.map(item =>
        React.createElement(Link, {
          key: item.href,
          href: item.href,
          style: {
            color: router.pathname === item.href ? '#FF6B9D' : '#aaa',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: router.pathname === item.href ? 'bold' : 'normal',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }
        }, [item.icon, item.label])
      )),
      React.createElement('div', {
        key: 'right',
        style: { display: 'flex', alignItems: 'center', gap: '16px' }
      }, [
        React.createElement(Link, {
          key: 'store',
          href: '/store',
          style: { color: 'var(--amora-muted)', textDecoration: 'none', fontSize: '20px' }
        }, '🛍️'),
        React.createElement(Link, {
          key: 'notifications',
          href: '/notifications',
          style: {
            color: 'var(--amora-muted)',
            textDecoration: 'none',
            fontSize: '20px',
            position: 'relative',
            display: 'inline-flex'
          }
        }, [
          '🔔',
          unreadCount > 0 && React.createElement('span', {
            key: 'badge',
            style: {
              position: 'absolute',
              top: '-6px',
              right: '-8px',
              background: 'var(--amora-pink)',
              color: 'var(--amora-text)',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '10px',
              fontWeight: 'bold'
            }
          }, unreadCount > 9 ? '9+' : unreadCount)
        ]),
        React.createElement(Link, {
          key: 'wallet',
          href: '/wallet',
          style: {
            color: '#ffd66b',
            fontSize: '16px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }
        }, [`🪙 ${balance}`]),
        React.createElement(Link, {
          key: 'profile',
          href: '/profile',
          style: {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,.05)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--amora-text)',
            textDecoration: 'none',
            border: '2px solid #FF6B9D',
            fontSize: '14px'
          }
        }, '👤'),
        isAdmin && React.createElement(Link, {
          key: 'admin',
          href: '/admin',
          style: {
            color: 'var(--amora-pink-2)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 'bold'
          }
        }, 'Admin'),
        !['/login', '/register'].includes(router.pathname) && React.createElement('button', {
          key: 'logout',
          onClick: logout,
          style: {
            background: 'transparent',
            border: 'none',
            color: '#8f89a2',
            cursor: 'pointer',
            fontSize: '14px'
          }
        }, 'Logout')
      ])
    ]),

    // Main content
    React.createElement('main', {
      key: 'main',
      style: { padding: '20px', flex: 1 }
    }, children),

    // Footer
    React.createElement('footer', {
      key: 'footer',
      style: {
        borderTop: '1px solid var(--amora-border)',
        padding: '20px',
        textAlign: 'center',
        color: '#77718a',
        fontSize: '13px',
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        flexWrap: 'wrap',
        background: 'rgba(21,16,43,.88)'
      }
    }, [
      React.createElement(Link, {
        key: 'terms',
        href: '/legal/terms',
        style: { color: '#77718a', textDecoration: 'none' }
      }, 'Terms of Service'),
      React.createElement(Link, {
        key: 'privacy',
        href: '/legal/privacy',
        style: { color: '#77718a', textDecoration: 'none' }
      }, 'Privacy Policy'),
      React.createElement(Link, {
        key: 'guidelines',
        href: '/legal/guidelines',
        style: { color: '#77718a', textDecoration: 'none' }
      }, 'Community Guidelines'),
      React.createElement(Link, {
        key: 'cookies',
        href: '/legal/cookies',
        style: { color: '#77718a', textDecoration: 'none' }
      }, 'Cookie Policy'),
      React.createElement('span', {
        key: 'copyright',
        style: { color: '#55506a' }
      }, `© ${new Date().getFullYear()} AmoraLive. All rights reserved.`)
    ])
  ]);
}
