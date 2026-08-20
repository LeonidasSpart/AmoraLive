// pages/admin/index.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetch('https://api.amoramatch.one/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch stats');
        return r.json();
      })
      .then(data => { setStats(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) {
    return React.createElement(AdminLayout, null,
      React.createElement('div', { style: { color: '#fff' } }, 'Loading...')
    );
  }

  if (error) {
    return React.createElement(AdminLayout, null,
      React.createElement('div', { style: { color: '#ff6b6b' } }, `Error: ${error}`)
    );
  }

  const statItems = [
    ['Total Users', stats.totalUsers],
    ['Active Users', stats.activeUsers],
    ['Total Rooms', stats.totalRooms],
    ['Active Rooms', stats.activeRooms],
    ['Total Gifts', stats.totalGifts],
    ['Revenue (coins)', stats.totalRevenue],
    ['Pending Reports', stats.pendingReports]
  ];

  return React.createElement(AdminLayout, null,
    React.createElement('div', null, [
      React.createElement('h1', { key: 'title', style: { color: '#FF6B9D' } }, 'Dashboard'),
      React.createElement('div', {
        key: 'stats',
        style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }
      }, statItems.map(([label, value]) =>
        React.createElement('div', {
          key: label,
          style: { background: '#1a1a2e', padding: '20px', borderRadius: '8px', textAlign: 'center' }
        }, [
          React.createElement('h3', { key: 'label', style: { color: '#aaa', fontSize: '14px' } }, label),
          React.createElement('p', { key: 'value', style: { fontSize: '28px', color: '#FF6B9D' } }, value || 0)
        ])
      ))
    ])
  );
}
