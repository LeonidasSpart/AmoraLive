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
      if (!publicPaths.includes(router.pathname)) router.push('/login');
      return;
    }
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const userRes = await fetch('https://api.amoramatch.one/users/me', { headers: { Authorization: `Bearer ${token}` } });
      if (userRes.ok) setUser(await userRes.json());

      const walletRes = await fetch('https://api.amoramatch.one/wallet/me', { headers: { Authorization: `Bearer ${token}` } });
      if (walletRes.ok) {
        const wallet = await walletRes.json();
        setBalance(wallet.balance || 0);
      }

      const notifRes = await fetch('https://api.amoramatch.one/notifications/unread-count', { headers: { Authorization: `Bearer ${token}` } });
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
        body: JSON.stringify({ refreshToken: token }),
      });
    } catch (e) {}
    localStorage.clear();
    router.push('/login');
  };

  const navItems = [
    { href: '/discover', label: 'Discover', icon: '📺' },
    { href: '/go-live', label: 'Go Live', icon: '🔴' },
    { href: '/video-match', label: 'Match', icon: '❤️' },
    { href: '/events', label: 'Events', icon: '🏆' },
    { href: '/chat', label: 'Chat', icon: '💬' },
  ];

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <div className="amora-app-shell">
      <header className="amora-app-header">
        <div className="amora-app-header-inner">
          <Link className="amora-app-brand" href="/discover" aria-label="Amora">
            <img src="/brand/amora-header-logo.png" alt="Amora" />
          </Link>

          <nav className="amora-app-nav" aria-label="App navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={router.pathname === item.href ? 'is-active' : ''}
              >
                <span aria-hidden="true">{item.icon}</span>{item.label}
              </Link>
            ))}
          </nav>

          <div className="amora-app-actions">
            <Link href="/store" aria-label="Store">🛍️</Link>
            <Link href="/notifications" className="amora-notification-link" aria-label="Notifications">
              🔔
              {unreadCount > 0 && <span className="amora-notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </Link>
            <Link href="/wallet" className="amora-wallet-link" aria-label="Wallet">🪙 {balance}</Link>
            <Link href="/profile" className="amora-profile-link" aria-label="Profile">👤</Link>
            {isAdmin && <Link className="amora-admin-link" href="/admin">Admin</Link>}
            {!['/login', '/register'].includes(router.pathname) && (
              <button className="amora-logout-button" type="button" onClick={logout}>Logout</button>
            )}
          </div>
        </div>
      </header>

      <main className="amora-app-main">{children}</main>

      <footer className="amora-app-footer">
        <Link href="/legal/terms">Terms of Service</Link>
        <Link href="/legal/privacy">Privacy Policy</Link>
        <Link href="/legal/guidelines">Community Guidelines</Link>
      </footer>
    </div>
  );
}
