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
      // If on a protected page, redirect to login
      const publicPaths = ['/', '/login', '/register'];
      if (!publicPaths.includes(router.pathname)) {
        router.push('/login');
      }
      return;
    }
    // Fetch user data
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      // Fetch user profile
      const userRes = await fetch('https://api.amoramatch.one/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

      // Fetch wallet balance
      const walletRes = await fetch('https://api.amoramatch.one/wallet/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (walletRes.ok) {
        const wallet = await walletRes.json();
        setBalance(wallet.balance || 0);
      }

      // Fetch unread notifications
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

  // Navigation items (top header)
  const navItems = [
    { href: '/discover', label: 'Discover', icon: '📺' },
    { href: '/video-match', label: 'Match', icon: '❤️' },
    { href: '/chat', label: 'Chat', icon: '💬' },
  ];

  // Check if current page is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: '#0f0f1a',
      color: '#fff',
      fontFamily: 'sans-serif'
    }
  }, [
    // Top Header
    React.createElement('header', {
      key: 'header',
      style: {
        padding: '12px 24px',
        borderBottom: '1px solid #222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#1a1a2e',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }
    }, [
      // Logo
      React.createElement(Link, {
        key: 'logo',
        href: '/discover',
        style: { color: '#FF6B9D', fontSize: '24px', fontWeight: 'bold', textDecoration: 'none' }
      }, 'AmoraLive'),

      // Center navigation (desktop)
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

      // Right side: notifications, wallet, profile
      React.createElement('div', {
        key: 'right',
        style: { display: 'flex', alignItems: 'center', gap: '16px' }
      }, [
        // Store link
        React.createElement(Link, {
          key: 'store',
          href: '/store',
          style: { color: '#aaa', textDecoration: 'none', fontSize: '20px' }
        }, '🛍️'),
        // Notifications
        React.createElement(Link, {
          key: 'notifications',
          href: '/notifications',
          style: {
            color: '#aaa',
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
              background: '#FF6B9D',
              color: '#fff',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '10px',
              fontWeight: 'bold'
            }
          }, unreadCount > 9 ? '9+' : unreadCount)
        ]),
        // Wallet
        React.createElement(Link, {
          key: 'wallet',
          href: '/wallet',
          style: {
            color: '#FFD700',
            fontSize: '16px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }
        }, [`🪙 ${balance}`]),
        // Profile
        React.createElement(Link, {
          key: 'profile',
          href: '/profile',
          style: {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#2a2a3e',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            textDecoration: 'none',
            border: '2px solid #FF6B9D',
            fontSize: '14px'
          }
        }, '👤'),
        // Admin link (if admin)
        isAdmin && React.createElement(Link, {
          key: 'admin',
          href: '/admin',
          style: {
            color: '#FF6B9D',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 'bold'
          }
        }, 'Admin'),
        // Logout button (hidden on login/register pages)
        !['/login', '/register'].includes(router.pathname) && React.createElement('button', {
          key: 'logout',
          onClick: logout,
          style: {
            background: 'transparent',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '14px'
          }
        }, 'Logout')
      ])
    ]),

    // Main content
    React.createElement('main', {
      key: 'main',
      style: { padding: '20px' }
    }, children)
  ]);
}
