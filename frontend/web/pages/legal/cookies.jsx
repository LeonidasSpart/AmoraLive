// pages/legal/cookies.jsx
import React from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';

export default function Cookies() {
  return React.createElement(Layout, null,
    React.createElement('div', {
      style: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px 0',
        color: '#ddd',
        lineHeight: '1.8'
      }
    }, [
      React.createElement('h1', { key: 'title', style: { color: '#FF6B9D', marginBottom: '20px' } }, 'Cookie Policy'),
      React.createElement('p', { key: 'last-updated', style: { color: '#666', marginBottom: '30px' } }, 'Last updated: August 2026'),
      React.createElement('h2', { key: 'h1', style: { color: '#fff', marginTop: '30px' } }, 'What Are Cookies?'),
      React.createElement('p', null, 'Cookies are small text files stored on your device that help us enhance your experience on AmoraLive.'),
      React.createElement('h2', { key: 'h2', style: { color: '#fff', marginTop: '30px' } }, 'How We Use Cookies'),
      React.createElement('ul', { style: { paddingLeft: '20px' } }, [
        React.createElement('li', { key: 'l1' }, 'Authentication – keep you logged in.'),
        React.createElement('li', { key: 'l2' }, 'Preferences – remember your settings.'),
        React.createElement('li', { key: 'l3' }, 'Analytics – understand how you use our service.'),
        React.createElement('li', { key: 'l4' }, 'Security – protect against fraud.')
      ]),
      React.createElement('h2', { key: 'h3', style: { color: '#fff', marginTop: '30px' } }, 'Your Choices'),
      React.createElement('p', null, 'You can manage or delete cookies in your browser settings. However, some features may not work properly without cookies.'),
      React.createElement('h2', { key: 'h4', style: { color: '#fff', marginTop: '30px' } }, 'Third-Party Cookies'),
      React.createElement('p', null, 'We may use third-party services (e.g., analytics) that set their own cookies. These are governed by their respective privacy policies.'),
      React.createElement('p', { key: 'back', style: { marginTop: '40px', color: '#666' } },
        React.createElement(Link, { href: '/', style: { color: '#FF6B9D', textDecoration: 'none' } }, '← Back to Home')
      )
    ])
  );
}
