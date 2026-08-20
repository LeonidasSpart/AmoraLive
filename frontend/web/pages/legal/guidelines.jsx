// pages/legal/guidelines.jsx
import React from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';

export default function Guidelines() {
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
      React.createElement('h1', { key: 'title', style: { color: '#FF6B9D', marginBottom: '20px' } }, 'Community Guidelines'),
      React.createElement('p', { key: 'last-updated', style: { color: '#666', marginBottom: '30px' } }, 'Last updated: August 2026'),
      React.createElement('p', null, 'Our community is built on respect, authenticity, and safety. We encourage you to:'),
      React.createElement('ul', { style: { paddingLeft: '20px' } }, [
        React.createElement('li', { key: 'l1' }, 'Be kind and respectful to others.'),
        React.createElement('li', { key: 'l2' }, 'Use your real identity and be authentic.'),
        React.createElement('li', { key: 'l3' }, 'Respect privacy and boundaries.'),
        React.createElement('li', { key: 'l4' }, 'Report inappropriate behavior.'),
        React.createElement('li', { key: 'l5' }, 'Keep the content safe and legal.')
      ]),
      React.createElement('h2', { key: 'h1', style: { color: '#fff', marginTop: '30px' } }, 'Prohibited Content'),
      React.createElement('ul', { style: { paddingLeft: '20px' } }, [
        React.createElement('li', { key: 'p1' }, 'Harassment, bullying, or threats.'),
        React.createElement('li', { key: 'p2' }, 'Hate speech or discrimination.'),
        React.createElement('li', { key: 'p3' }, 'Nudity, sexual content, or exploitation.'),
        React.createElement('li', { key: 'p4' }, 'Fraud, spam, or scams.'),
        React.createElement('li', { key: 'p5' }, 'Impersonation of others.')
      ]),
      React.createElement('h2', { key: 'h2', style: { color: '#fff', marginTop: '30px' } }, 'Enforcement'),
      React.createElement('p', null, 'Violations may result in warnings, content removal, account suspension, or termination. We encourage users to report violations.'),
      React.createElement('p', { key: 'back', style: { marginTop: '40px', color: '#666' } },
        React.createElement(Link, { href: '/', style: { color: '#FF6B9D', textDecoration: 'none' } }, '← Back to Home')
      )
    ])
  );
}
