// pages/wallet.jsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from '../lib/api';

export default function Wallet() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('transactions'); // transactions, gifts
  const [packages, setPackages] = useState([]);
  const [showPackages, setShowPackages] = useState(false);

  const fetchWalletData = async () => {
    if (!localStorage.getItem('accessToken')) {
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Get balance
      const balanceRes = await apiFetch('/wallet/me');
      if (!balanceRes.ok) throw new Error('Failed to fetch wallet');
      const wallet = await balanceRes.json();
      setBalance(wallet.balance);

      // Get transactions (or gifts based on tab)
      const endpoint = activeTab === 'transactions' ? 'transactions' : 'gifts';
      const txRes = await apiFetch(`/wallet/${endpoint}?limit=100`);
      if (!txRes.ok) throw new Error('Failed to fetch transactions');
      const data = await txRes.json();
      setTransactions(data);

      // Get coin packages (for purchase)
      const pkgRes = await apiFetch('/wallet/packages?platform=web');
      if (pkgRes.ok) {
        const pkgs = await pkgRes.json();
        setPackages(pkgs);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [activeTab]);

  const purchasePackage = async (packageId) => {
    try {
      const res = await apiFetch('/wallet/purchase', {
        method: 'POST',
        body: JSON.stringify({ packageId })
      });
      if (!res.ok) throw new Error('Purchase failed');
      const data = await res.json();
      setBalance(data.newBalance);
      setShowPackages(false);
      await fetchWalletData(); // Refresh transactions
    } catch (err) {
      alert('Purchase failed: ' + err.message);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
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
    }, 'Loading wallet...');
  }

  if (error) {
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
      React.createElement('p', { key: 'msg', style: { color: '#ff6b6b' } }, `Error: ${error}`),
      React.createElement('button', {
        key: 'retry',
        onClick: fetchWalletData,
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
    ]);
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '16px',
        borderBottom: '1px solid #222'
      }
    }, [
      React.createElement('div', { key: 'left', style: { display: 'flex', alignItems: 'center', gap: '16px' } }, [
        React.createElement(Link, {
          key: 'back',
          href: '/discover',
          style: { color: '#888', textDecoration: 'none', fontSize: '20px' }
        }, '←'),
        React.createElement('h1', { key: 'title', style: { color: '#fff', fontSize: '24px', margin: 0 } }, 'My Wallet')
      ]),
      React.createElement(Link, {
        key: 'profile',
        href: '/profile',
        style: { color: '#888', textDecoration: 'none' }
      }, 'Profile')
    ]),

    // Balance card
    React.createElement('div', {
      key: 'balance',
      style: {
        background: 'linear-gradient(135deg, #1a1a2e, #2a1a3e)',
        padding: '24px',
        borderRadius: '12px',
        marginTop: '20px',
        marginBottom: '20px',
        border: '1px solid #FF6B9D'
      }
    }, [
      React.createElement('div', { key: 'label', style: { color: '#aaa', fontSize: '14px' } }, 'Available Coins'),
      React.createElement('div', { key: 'amount', style: { color: '#FFD700', fontSize: '36px', fontWeight: 'bold', marginTop: '4px' } }, balance),
      React.createElement('button', {
        key: 'buy',
        onClick: () => setShowPackages(!showPackages),
        style: {
          marginTop: '12px',
          padding: '8px 24px',
          borderRadius: '6px',
          border: 'none',
          background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: 'bold'
        }
      }, showPackages ? 'Hide Packages' : 'Buy Coins')
    ]),

    // Coin packages (when toggled)
    showPackages && React.createElement('div', {
      key: 'packages',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }
    }, packages.map(pkg =>
      React.createElement('div', {
        key: pkg.id,
        style: {
          background: '#1a1a2e',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          border: pkg.is_promotion ? '2px solid #FF6B9D' : '1px solid #333'
        }
      }, [
        React.createElement('div', { key: 'name', style: { color: '#fff', fontWeight: 'bold' } }, pkg.name),
        React.createElement('div', { key: 'coins', style: { color: '#FFD700', fontSize: '24px', margin: '4px 0' } }, pkg.coins_amount + (pkg.bonus_coins || 0)),
        React.createElement('div', { key: 'price', style: { color: '#aaa' } }, `$${(pkg.price_cents / 100).toFixed(2)}`),
        pkg.is_promotion && React.createElement('div', { key: 'promo', style: { color: '#FF6B9D', fontSize: '12px' } }, '🔥 Promotion'),
        React.createElement('button', {
          key: 'buy-btn',
          onClick: () => purchasePackage(pkg.id),
          style: {
            marginTop: '8px',
            padding: '6px 16px',
            borderRadius: '4px',
            border: 'none',
            background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)',
            color: '#fff',
            cursor: 'pointer'
          }
        }, 'Buy')
      ])
    )),

    // Tabs
    React.createElement('div', {
      key: 'tabs',
      style: {
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #222',
        marginBottom: '16px',
        paddingBottom: '8px'
      }
    }, [
      ['transactions', 'All Transactions'],
      ['gifts', 'Gift History']
    ].map(([key, label]) =>
      React.createElement('button', {
        key: key,
        onClick: () => setActiveTab(key),
        style: {
          padding: '8px 16px',
          borderRadius: '20px',
          border: 'none',
          background: activeTab === key ? 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)' : 'transparent',
          color: activeTab === key ? '#fff' : '#888',
          cursor: 'pointer',
          fontWeight: activeTab === key ? 'bold' : 'normal'
        }
      }, label)
    )),

    // Transaction list
    transactions.length === 0
      ? React.createElement('div', {
          key: 'empty',
          style: { textAlign: 'center', padding: '40px 0', color: '#666' }
        }, 'No transactions yet')
      : React.createElement('div', {
          key: 'list',
          style: { display: 'flex', flexDirection: 'column', gap: '8px' }
        }, transactions.map(tx => {
          const isGift = tx.type === 'gift_sent' || tx.type === 'gift_received';
          const isPositive = tx.type === 'gift_received' || tx.type === 'purchase';
          const amount = tx.amount || (tx.type === 'gift_sent' ? -tx.coin_cost : tx.coin_cost);
          const displayAmount = isPositive ? `+${amount}` : `-${amount}`;
          const color = isPositive ? '#4caf50' : '#ff6b6b';

          return React.createElement('div', {
            key: tx.id,
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: '#1a1a2e',
              borderRadius: '8px'
            }
          }, [
            React.createElement('div', { key: 'info' }, [
              React.createElement('div', { key: 'desc', style: { color: '#fff' } }, tx.description || 'Transaction'),
              React.createElement('div', { key: 'time', style: { color: '#666', fontSize: '12px' } }, formatDate(tx.created_at))
            ]),
            React.createElement('div', {
              key: 'amount',
              style: { color, fontWeight: 'bold' }
            }, displayAmount)
          ]);
        }))
  ]);
}
