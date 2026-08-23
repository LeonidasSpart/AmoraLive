// components/Layout.jsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch, clearSession } from '../lib/api';

function Icon({ name, size = 20 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    discover: <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m8 9 8 3-8 3V9Z"/></>,
    live: <><circle cx="12" cy="12" r="8"/><path d="M9.5 9.5 15 12l-5.5 2.5v-5Z"/><path d="M7 3.5 5.5 5M17 3.5 18.5 5"/></>,
    studio: <><path d="M5 19V10M12 19V5M19 19v-7"/><path d="M3 19h18"/></>,
    match: <path d="M20 8.5c0 5.5-8 10-8 10s-8-4.5-8-10a4.5 4.5 0 0 1 8-2.7 4.5 4.5 0 0 1 8 2.7Z"/>,
    matches: <><rect x="4" y="8" width="12" height="14" rx="2" transform="rotate(-8 10 15)"/><rect x="8" y="5" width="12" height="14" rx="2"/></>,
    events: <path d="m12 3 2.4 4.8 5.3.8-3.8 3.7.9 5.2-4.8-2.5-4.8 2.5.9-5.2-3.8-3.7 5.3-.8L12 3Z"/>,
    rewards: <><path d="M7 8h10v11H7z"/><path d="M9 8V5.5a3 3 0 0 1 6 0V8M5 10h14"/><path d="M10 12h4M10 15h4"/></>,
    missions: <><path d="M5 4h14v16H5z"/><path d="m8 9 1.5 1.5L12 8M8 14l1.5 1.5L12 13"/></>,
    vip: <><path d="m3 7 4 4 5-7 5 7 4-4-2 12H5L3 7Z"/><path d="M7 19h10"/></>,
    chat: <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3.1-.6L4 20l1.4-3.8A7.3 7.3 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z"/>,
    store: <><path d="M4 9h16v11H4z"/><path d="m5 9 1.2-4h11.6L19 9M8 13h8"/></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/></>,
    wallet: <><path d="M4 6h14a2 2 0 0 1 2 2v11H5a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1Z"/><path d="M3 8V6a2 2 0 0 1 2-2h11"/><path d="M16 13h4"/></>,
    user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></>,
    logout: <><path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9"/></>,
  };
  return <svg {...common}>{paths[name] || paths.user}</svg>;
}

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
    try {
      const userRes = await apiFetch('/users/me');
      if (userRes.ok) setUser(await userRes.json());
      const walletRes = await apiFetch('/wallet/me');
      if (walletRes.ok) {
        const wallet = await walletRes.json();
        setBalance(wallet.balance || 0);
      }
      const notifRes = await apiFetch('/notifications/unread-count');
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
      await apiFetch('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken: token }) }, { skipRefresh: true });
    } catch (e) {}
    clearSession();
    router.push('/login');
  };

  const navItems = [
    { href: '/discover', label: 'Discover', icon: 'discover' },
    { href: '/go-live', label: 'Go Live', icon: 'live' },
    { href: '/studio', label: 'Studio', icon: 'studio' },
    { href: '/video-match', label: 'Match', icon: 'match' },
    { href: '/events', label: 'Events', icon: 'events' },
    { href: '/rewards', label: 'Rewards', icon: 'rewards' },
    { href: '/missions', label: 'Missions', icon: 'missions' },
    { href: '/membership', label: 'VIP', icon: 'vip' },
    { href: '/chat', label: 'Chat', icon: 'chat' },
    { href: '/matches', label: 'Matches', icon: 'matches' },
  ];
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const bottomItems = [navItems[0], navItems[3], navItems[1], navItems[8], { href: '/profile', label: 'Profile', icon: 'user' }];

  return (
    <div className="amora-app-shell">
      <header className="amora-app-header">
        <div className="amora-app-header-inner">
          <Link className="amora-app-brand" href="/discover" aria-label="AmoraLive home">
            <img src="/brand/amora-header-logo.png" alt="AmoraLive" />
            <span className="amora-app-brand-name">AmoraLive</span>
          </Link>
          <nav className="amora-app-nav" aria-label="App navigation">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={router.pathname === item.href ? 'is-active' : ''}>
                <Icon name={item.icon} size={17} /><span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="amora-app-actions">
            <Link href="/store" className="amora-icon-action" aria-label="Store"><Icon name="store" /></Link>
            <Link href="/notifications" className="amora-icon-action amora-notification-link" aria-label="Notifications">
              <Icon name="bell" />
              {unreadCount > 0 && <span className="amora-notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </Link>
            <Link href="/wallet" className="amora-wallet-link" aria-label={`Wallet, ${balance} coins`}><Icon name="wallet" /><span>{balance.toLocaleString()}</span></Link>
            <Link href="/profile" className="amora-profile-link" aria-label="Profile"><Icon name="user" size={18} /></Link>
            {isAdmin && <Link className="amora-admin-link" href="/admin">Admin</Link>}
            {!['/login', '/register'].includes(router.pathname) && (
              <button className="amora-logout-button" type="button" onClick={logout} aria-label="Log out"><Icon name="logout" size={17} /><span>Logout</span></button>
            )}
          </div>
        </div>
      </header>
      <main className="amora-app-main">{children}</main>
      <nav className="amora-mobile-bottom-nav" aria-label="Mobile navigation">
        {bottomItems.map((item) => (
          <Link key={item.href} href={item.href} className={router.pathname === item.href ? 'is-active' : ''}>
            <Icon name={item.icon} size={20} /><span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <footer className="amora-app-footer">
        <div className="amora-app-footer-brand"><img src="/brand/amora-mark.png" alt="" aria-hidden="true" /><strong>AmoraLive</strong></div>
        <div className="amora-app-footer-links"><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link><Link href="/legal/guidelines">Guidelines</Link><Link href="/legal/cookies">Cookies</Link></div>
        <span className="amora-app-footer-copy">Made for meaningful connections.</span>
      </footer>
    </div>
  );
}
