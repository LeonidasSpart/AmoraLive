// pages/index.jsx
import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      window.location.href = '/discover';
    }
  }, []);

  // If you want a landing page for non‑logged‑in users, keep the existing UI.
  // Otherwise, just render the login/register buttons.
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: '#0f0f1a',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: '20px'
    }
  }, [
    React.createElement('h1', {
      key: 'title',
      style: { fontSize: '48px', color: '#FF6B9D', marginBottom: '10px' }
    }, 'AmoraLive'),
    React.createElement('p', {
      key: 'subtitle',
      style: { fontSize: '20px', color: '#aaa', marginBottom: '40px' }
    }, 'Live social dating – connect, chat, and share moments'),
    React.createElement('div', {
      key: 'buttons',
      style: { display: 'flex', gap: '20px' }
    }, [
      React.createElement(Link, {
        key: 'login',
        href: '/login',
        style: {
          padding: '12px 30px',
          borderRadius: '8px',
          background: '#FF6B9D',
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 'bold'
        }
      }, 'Login'),
      React.createElement(Link, {
        key: 'register',
        href: '/register',
        style: {
          padding: '12px 30px',
          borderRadius: '8px',
          border: '2px solid #FF6B9D',
          color: '#FF6B9D',
          textDecoration: 'none',
          fontWeight: 'bold'
        }
      }, 'Register')
    ])
  ]);
}
