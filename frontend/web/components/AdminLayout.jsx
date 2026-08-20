// frontend/web/components/AdminLayout.jsx
import React from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  return React.createElement('div', {
    style: {
      display: 'flex',
      minHeight: '100vh',
      background: '#0f0f1a',
      color: '#fff',
      fontFamily: 'sans-serif'
    }
  }, [
    // Sidebar
    React.createElement('nav', {
      key: 'sidebar',
      style: {
        width: '220px',
        background: '#1a1a2e',
        padding: '20px',
        borderRight: '1px solid #333',
        flexShrink: 0
      }
    }, [
      React.createElement('h2', { key: 'title', style: { color: '#FF6B9D', marginBottom: '20px' } }, 'Admin'),
      React.createElement('ul', { key: 'menu', style: { listStyle: 'none', padding: 0, margin: 0 } }, [
        ['/admin', 'Dashboard'],
        ['/admin/users', 'Users'],
        ['/admin/rooms', 'Rooms'],
        ['/admin/gifts', 'Gifts'],
        ['/admin/reports', 'Reports'],
        ['/admin/packages', 'Packages']
      ].map(([path, label]) =>
        React.createElement('li', { key: path, style: { margin: '10px 0' } },
          React.createElement(Link, { href: path, style: { color: '#aaa', textDecoration: 'none' } }, label)
        )
      ))
    ]),
    // Main content
    React.createElement('div', {
      key: 'content',
      style: { flex: 1, padding: '30px', overflowY: 'auto' }
    }, children)
  ]);
}
