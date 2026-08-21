// pages/login.jsx
import React, { useState } from 'react';
import Link from 'next/link';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      console.log('Sending request to:', 'https://api.amoramatch.one/auth/login');
      const res = await fetch('https://api.amoramatch.one/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ identifier, password })
      });
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userId', data.user.id);
      // If admin, redirect to admin dashboard
      if (data.user?.role === 'admin' || data.user?.role === 'superadmin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/discover';
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: '#0f0f1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }
  }, [
    React.createElement('form', {
      key: 'form',
      onSubmit: handleSubmit,
      style: {
        background: '#1a1a2e',
        padding: '40px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }
    }, [
      React.createElement('h2', {
        key: 'title',
        style: { color: '#FF6B9D', marginBottom: '30px', textAlign: 'center' }
      }, 'Login to AmoraLive'),
      error && React.createElement('p', {
        key: 'error',
        style: { 
          color: '#ff4444', 
          marginBottom: '15px', 
          textAlign: 'center',
          background: '#2a1a1a',
          padding: '8px',
          borderRadius: '4px',
          wordBreak: 'break-word'
        }
      }, error),
      React.createElement('input', {
        key: 'identifier',
        type: 'text',
        placeholder: 'Email or username',
        value: identifier,
        onChange: (e) => setIdentifier(e.target.value),
        required: true,
        style: {
          width: '100%',
          padding: '12px',
          marginBottom: '15px',
          borderRadius: '6px',
          border: '1px solid #333',
          background: '#0f0f1a',
          color: '#fff',
          fontSize: '16px'
        }
      }),
      React.createElement('input', {
        key: 'password',
        type: 'password',
        placeholder: 'Password',
        value: password,
        onChange: (e) => setPassword(e.target.value),
        required: true,
        style: {
          width: '100%',
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '6px',
          border: '1px solid #333',
          background: '#0f0f1a',
          color: '#fff',
          fontSize: '16px'
        }
      }),
      React.createElement('button', {
        key: 'google',
        type: 'button',
        onClick: () => { window.location.href = 'https://api.amoramatch.one/auth/google/start'; },
        style: { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #444', background: '#fff', color: '#111', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }
      }, 'Continue with Google'),
      React.createElement('div', { key: 'divider', style: { textAlign: 'center', color: '#666', margin: '10px 0 14px' } }, 'or'),
      React.createElement('button', {
        key: 'submit',
        type: 'submit',
        disabled: loading,
        style: {
          width: '100%',
          padding: '12px',
          borderRadius: '6px',
          border: 'none',
          background: '#FF6B9D',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1
        }
      }, loading ? 'Logging in...' : 'Login'),
      React.createElement('p', {
        key: 'register-link',
        style: { marginTop: '20px', textAlign: 'center', color: '#aaa' }
      }, [
        "Don't have an account? ",
        React.createElement(Link, {
          key: 'link',
          href: '/register',
          style: { color: '#FF6B9D', textDecoration: 'none' }
        }, 'Register')
      ])
    ])
  ]);
}
