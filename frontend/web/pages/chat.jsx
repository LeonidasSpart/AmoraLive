// pages/chat.jsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from '../lib/api';

export default function ChatList() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchConversations = async () => {
    if (!localStorage.getItem('accessToken')) {
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/messages/conversations');
      if (!res.ok) throw new Error('Failed to load conversations');
      const data = await res.json();
      setConversations(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // WebSocket connection for real-time updates
    // ... (we'll add socket integration later)
  }, []);

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return React.createElement('div', {
      style: {
        minHeight: '100vh',
        background: '#0f0f1a',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif'
      }
    }, 'Loading chats...');
  }

  if (error) {
    return React.createElement('div', {
      style: {
        minHeight: '100vh',
        background: '#0f0f1a',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif'
      }
    }, [
      React.createElement('p', { key: 'msg', style: { color: '#ff6b6b' } }, `Error: ${error}`),
      React.createElement('button', {
        key: 'retry',
        onClick: fetchConversations,
        style: {
          marginTop: '20px',
          padding: '8px 24px',
          borderRadius: '6px',
          border: 'none',
          background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)',
          color: '#fff',
          cursor: 'pointer'
        }
      }, 'Retry')
    ]);
  }

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: '#0f0f1a',
      color: '#fff',
      fontFamily: 'sans-serif',
      padding: '20px'
    }
  }, [
    React.createElement('header', {
      key: 'header',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '16px',
        borderBottom: '1px solid #222'
      }
    }, [
      React.createElement('h1', { key: 'title', style: { color: '#fff', fontSize: '24px', margin: 0 } }, 'Messages'),
      React.createElement(Link, {
        key: 'back',
        href: '/discover',
        style: { color: '#888', textDecoration: 'none' }
      }, '← Back')
    ]),
    conversations.length === 0
      ? React.createElement('div', {
          key: 'empty',
          style: {
            textAlign: 'center',
            padding: '60px 0',
            color: '#666'
          }
        }, [
          React.createElement('p', { key: 'msg', style: { fontSize: '18px' } }, 'No conversations yet'),
          React.createElement('p', { key: 'sub', style: { fontSize: '14px' } }, 'Start a match and say hello!')
        ])
      : React.createElement('div', {
          key: 'list',
          style: { marginTop: '16px' }
        }, conversations.map(conv =>
          React.createElement(Link, {
            key: conv.id,
            href: `/chat/${conv.id}`,
            style: { textDecoration: 'none' }
          }, [
            React.createElement('div', {
              style: {
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                background: '#1a1a2e',
                borderRadius: '8px',
                marginBottom: '8px',
                transition: 'background 0.2s',
                cursor: 'pointer',
                border: conv.unread_count > 0 ? '1px solid #FF6B9D' : 'none'
              },
              onMouseEnter: (e) => e.currentTarget.style.background = '#2a2a3e',
              onMouseLeave: (e) => e.currentTarget.style.background = '#1a1a2e'
            }, [
              React.createElement('div', {
                key: 'avatar',
                style: {
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#2a2a3e',
                  marginRight: '14px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0
                }
              }, conv.profile_photo
                ? React.createElement('img', {
                    src: conv.profile_photo,
                    alt: conv.display_name || conv.username,
                    style: { width: '100%', height: '100%', objectFit: 'cover' }
                  })
                : '👤'
              ),
              React.createElement('div', {
                key: 'info',
                style: { flex: 1, overflow: 'hidden' }
              }, [
                React.createElement('div', {
                  key: 'name',
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline'
                  }
                }, [
                  React.createElement('span', {
                    style: {
                      color: '#fff',
                      fontWeight: conv.unread_count > 0 ? 'bold' : 'normal',
                      fontSize: '16px'
                    }
                  }, conv.display_name || conv.username),
                  conv.last_message_time && React.createElement('span', {
                    style: { color: '#666', fontSize: '12px' }
                  }, timeAgo(conv.last_message_time))
                ]),
                React.createElement('div', {
                  key: 'last-msg',
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '2px'
                  }
                }, [
                  React.createElement('span', {
                    style: {
                      color: '#888',
                      fontSize: '14px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '200px'
                    }
                  }, conv.last_message || ''),
                  conv.unread_count > 0 && React.createElement('span', {
                    style: {
                      background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)',
                      color: '#fff',
                      borderRadius: '50%',
                      padding: '2px 8px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }
                  }, conv.unread_count)
                ])
              ])
            ])
          ])
        ))
  ]);
}
