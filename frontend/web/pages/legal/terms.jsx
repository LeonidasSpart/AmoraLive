// pages/legal/terms.jsx
import React from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';

export default function Terms() {
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
      React.createElement('h1', { key: 'title', style: { color: '#FF6B9D', marginBottom: '20px' } }, 'Terms of Service'),
      React.createElement('p', { key: 'last-updated', style: { color: '#666', marginBottom: '30px' } }, 'Last updated: August 2026'),
      React.createElement('h2', { key: 'h1', style: { color: '#fff', marginTop: '30px' } }, '1. Acceptance of Terms'),
      React.createElement('p', null, 'By using AmoraLive, you agree to these Terms of Service. If you do not agree, do not use the service.'),
      React.createElement('h2', { key: 'h2', style: { color: '#fff', marginTop: '30px' } }, '2. Eligibility'),
      React.createElement('p', null, 'You must be at least 18 years old to use AmoraLive. By registering, you confirm that you are 18 or older.'),
      React.createElement('h2', { key: 'h3', style: { color: '#fff', marginTop: '30px' } }, '3. User Conduct'),
      React.createElement('ul', { style: { paddingLeft: '20px' } }, [
        React.createElement('li', { key: 'l1' }, 'You are solely responsible for your content and interactions.'),
        React.createElement('li', { key: 'l2' }, 'Do not harass, abuse, or harm others.'),
        React.createElement('li', { key: 'l3' }, 'Do not post illegal, obscene, or harmful content.'),
        React.createElement('li', { key: 'l4' }, 'Respect the privacy and rights of other users.')
      ]),
      React.createElement('h2', { key: 'h4', style: { color: '#fff', marginTop: '30px' } }, '4. Intellectual Property'),
      React.createElement('p', null, 'All content on AmoraLive is owned by us or our licensors. You may not copy, distribute, or modify it without permission.'),
      React.createElement('h2', { key: 'h5', style: { color: '#fff', marginTop: '30px' } }, '5. Termination'),
      React.createElement('p', null, 'We reserve the right to suspend or terminate your account at any time for violations of these terms.'),
      React.createElement('h2', { key: 'h6', style: { color: '#fff', marginTop: '30px' } }, '6. Disclaimer'),
      React.createElement('p', null, 'AmoraLive is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service.'),
      React.createElement('h2', { key: 'h7', style: { color: '#fff', marginTop: '30px' } }, '7. Changes to Terms'),
      React.createElement('p', null, 'We may update these terms from time to time. Continued use after changes constitutes acceptance.'),
      React.createElement('p', { key: 'back', style: { marginTop: '40px', color: '#666' } },
        React.createElement(Link, { href: '/', style: { color: '#FF6B9D', textDecoration: 'none' } }, '← Back to Home')
      )
    ])
  );
}
