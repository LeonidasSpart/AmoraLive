// pages/register.jsx
import React, { useState } from 'react';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('https://api.amoramatch.one/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, dateOfBirth })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
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
      }, 'Create Account'),
      error && React.createElement('p', {
        key: 'error',
        style: { color: '#ff4444', marginBottom: '15px', textAlign: 'center' }
      }, error),
      React.createElement('input', {
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
      React.createElement('input', {
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
