// pages/register.jsx
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [googleToken, setGoogleToken] = useState('');
  const [googleMode, setGoogleMode] = useState(false);

  React.useEffect(() => {
    if (!router.isReady) return;
    if (router.query.google) { setGoogleToken(String(router.query.google)); setGoogleMode(true); }
  }, [router.isReady, router.query.google]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = googleMode ? 'https://api.amoramatch.one/auth/google/complete' : 'https://api.amoramatch.one/auth/register';
      const body = googleMode ? { completionToken: googleToken, username, dateOfBirth } : { email, username, password, dateOfBirth };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      if (googleMode) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userId', data.user.id);
        window.location.href = '/discover';
        return;
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return React.createElement('div', {
      style: {
        minHeight: '100vh',
        background: '#0f0f1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        color: '#fff'
      }
    }, [
      React.createElement('div', {
        key: 'success',
        style: {
          background: '#1a1a2e',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '400px'
        }
      }, [
        React.createElement('h2', { key: 'title', style: { color: '#4caf50' } }, 'Registration successful!'),
        React.createElement('p', { key: 'msg', style: { margin: '20px 0' } }, 'Please check your email to verify your account.'),
        React.createElement(Link, {
          key: 'login',
          href: '/login',
          style: { color: '#FF6B9D', textDecoration: 'none' }
        }, 'Go to Login')
      ])
    ]);
  }

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
      }, googleMode ? 'Complete Google Registration' : 'Create Account'),
      error && React.createElement('p', {
        key: 'error',
        style: { color: '#ff4444', marginBottom: '15px', textAlign: 'center' }
      }, error),
      googleMode && React.createElement('p', { key: 'google-note', style: { color: '#aaa', textAlign: 'center', marginBottom: 18 } }, 'Finish your Google registration by choosing a username and confirming you are 18+.'),
      !googleMode && React.createElement('button', { key: 'google', type: 'button', onClick: () => { window.location.href = 'https://api.amoramatch.one/auth/google/start'; }, style: { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #444', background: '#fff', color: '#111', fontWeight: 'bold', cursor: 'pointer' } }, 'Continue with Google'),
      !googleMode && React.createElement('div', { key: 'divider', style: { textAlign: 'center', color: '#666', margin: '10px 0 14px' } }, 'or'),
      !googleMode && React.createElement('input', {
        key: 'email',
        type: 'email',
        placeholder: 'Email',
        value: email,
        onChange: (e) => setEmail(e.target.value),
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
        key: 'username',
        type: 'text',
        placeholder: 'Username (min 3 chars)',
        value: username,
        onChange: (e) => setUsername(e.target.value),
        required: true,
        minLength: 3,
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
      !googleMode && React.createElement('input', {
        key: 'password',
        type: 'password',
        placeholder: 'Password (min 8 chars)',
        value: password,
        onChange: (e) => setPassword(e.target.value),
        required: true,
        minLength: 8,
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
        key: 'dob',
        type: 'date',
        placeholder: 'Date of Birth',
        value: dateOfBirth,
        onChange: (e) => setDateOfBirth(e.target.value),
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
      }, loading ? 'Registering...' : 'Register'),
      React.createElement('p', {
        key: 'login-link',
        style: { marginTop: '20px', textAlign: 'center', color: '#aaa' }
      }, [
        "Already have an account? ",
        React.createElement(Link, {
          key: 'link',
          href: '/login',
          style: { color: '#FF6B9D', textDecoration: 'none' }
        }, 'Login')
      ])
    ])
  ]);
}
