// pages/legal/privacy.jsx
import React from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';

export default function Privacy() {
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
      React.createElement('h1', { key: 'title', style: { color: '#FF6B9D', marginBottom: '20px' } }, 'Privacy Policy'),
      React.createElement('p', { key: 'last-updated', style: { color: '#666', marginBottom: '30px' } }, 'Last updated: August 2026'),
      React.createElement('h2', { key: 'h1', style: { color: '#fff', marginTop: '30px' } }, '1. Information We Collect'),
      React.createElement('p', null, 'We collect information you provide directly, such as your email, username, profile photo, and preferences. We also collect usage data to improve our service.'),
      React.createElement('h2', { key: 'h2', style: { color: '#fff', marginTop: '30px' } }, '2. How We Use Information'),
      React.createElement('ul', { style: { paddingLeft: '20px' } }, [
        React.createElement('li', { key: 'l1' }, 'Provide, maintain, and improve AmoraLive.'),
        React.createElement('li', { key: 'l2' }, 'Personalize your experience.'),
        React.createElement('li', { key: 'l3' }, 'Send you notifications and updates.'),
        React.createElement('li', { key: 'l4' }, 'Enforce our policies and ensure safety.')
      ]),
      React.createElement('h2', { key: 'h3', style: { color: '#fff', marginTop: '30px' } }, '3. Data Sharing'),
      React.createElement('p', null, 'We do not sell your personal data. We may share data with service providers (e.g., hosting, analytics) who are bound by confidentiality.'),
      React.createElement('h2', { key: 'h4', style: { color: '#fff', marginTop: '30px' } }, '4. Security'),
      React.createElement('p', null, 'We implement reasonable safeguards to protect your data, but no system is 100% secure. Use good security practices on your end.'),
      React.createElement('h2', { key: 'h5', style: { color: '#fff', marginTop: '30px' } }, '5. Your Rights'),
      React.createElement('p', null, 'You can access, correct, or delete your data at any time through your account settings or by contacting us.'),
      React.createElement('h2', { key: 'h6', style: { color: '#fff', marginTop: '30px' } }, '6. Cookies'),
      React.createElement('p', null, 'We use cookies to improve your experience. You can manage cookie preferences in your browser.'),
      React.createElement('p', { key: 'back', style: { marginTop: '40px', color: '#666' } },
        React.createElement(Link, { href: '/', style: { color: '#FF6B9D', textDecoration: 'none' } }, '← Back to Home')
      )
    ])
  );
}
