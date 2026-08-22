// pages/chat/[userId].jsx
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';
import VerifiedBadge from '../../components/VerifiedBadge';

export default function ChatRoom() {
  const router = useRouter();
  const { userId } = router.query;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch messages
  const fetchMessages = async () => {
    if (!localStorage.getItem('accessToken')) {
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/messages/${userId}?limit=50`);
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      setMessages(data || []);
      // Also fetch user info
      const userRes = await apiFetch(`/users/${userId}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        setOtherUser(userData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Setup WebSocket
  const connectSocket = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    // In production, use the actual WebSocket URL
    const ws = new WebSocket('wss://api.amoramatch.one/ws');
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'authenticate', token }));
      ws.send(JSON.stringify({ type: 'join-chat', userId }));
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'private-message' || data.type === 'private-message-sent') {
        setMessages(prev => prev.some(m => m.id === data.message.id) ? prev : [...prev, data.message]);
      } else if (data.type === 'typing') {
        setIsTyping(data.isTyping);
      } else if (data.type === 'read-receipt') {
        // Update read status of messages
        setMessages(prev => prev.map(m => 
          m.sender_id === data.from ? { ...m, read_at: new Date().toISOString() } : m
        ));
      }
    };
    setSocket(ws);
    return ws;
  };

  useEffect(() => {
    if (!userId) return;
    fetchMessages();
    const ws = connectSocket();
    return () => {
      if (ws) ws.close();
    };
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const token = localStorage.getItem('accessToken');
    try {
      if (!socket || socket.readyState !== WebSocket.OPEN) throw new Error('Realtime connection is not ready');
      socket.send(JSON.stringify({ type: 'private-message', receiverId: userId, content: input.trim() }));
      setInput('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (socket && socket.readyState === WebSocket.OPEN) {
      if (typingTimeout) clearTimeout(typingTimeout);
      socket.send(JSON.stringify({ type: 'typing', receiverId: userId, isTyping: true }));
      setTypingTimeout(setTimeout(() => {
        socket.send(JSON.stringify({ type: 'typing', receiverId: userId, isTyping: false }));
      }, 2000));
    }
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
    }, 'Loading chat...');
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
        onClick: fetchMessages,
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
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'sans-serif'
    }
  }, [
    // Header
    React.createElement('header', {
      key: 'header',
      style: {
        padding: '16px 20px',
        borderBottom: '1px solid #222',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: '#1a1a2e'
      }
    }, [
      React.createElement(Link, {
        key: 'back',
        href: '/chat',
        style: { color: '#888', textDecoration: 'none', fontSize: '20px' }
      }, '←'),
      React.createElement('div', {
        key: 'avatar',
        style: {
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: '#2a2a3e',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px'
        }
      }, otherUser?.profile_photo
        ? React.createElement('img', {
            src: otherUser.profile_photo,
            alt: otherUser.display_name || otherUser.username,
            style: { width: '100%', height: '100%', objectFit: 'cover' }
          })
        : '👤'
      ),
      React.createElement('div', { key: 'info', style: { flex: 1 } }, [
        React.createElement('span', {
          key: 'name',
          style: { display: 'inline-flex', alignItems: 'center', color: '#fff', fontWeight: 'bold' }
        }, [otherUser?.display_name || otherUser?.username || 'User', React.createElement(VerifiedBadge, { key: 'badge', user: otherUser, size: 14 })]),
        React.createElement('span', {
          key: 'status',
          style: {
            display: 'block',
            color: isTyping ? '#FF6B9D' : '#666',
            fontSize: '12px'
          }
        }, isTyping ? 'typing...' : '')
      ]),
      React.createElement('button', {
        key: 'call',
        style: {
          background: 'transparent',
          border: 'none',
          color: '#888',
          fontSize: '20px',
          cursor: 'pointer'
        }
      }, '📞')
    ]),

    // Messages
    React.createElement('div', {
      key: 'messages',
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }
    }, messages.map((msg, idx) => {
      const isMine = msg.sender_id === localStorage.getItem('userId');
      return React.createElement('div', {
        key: msg.id || idx,
        style: {
          alignSelf: isMine ? 'flex-end' : 'flex-start',
          maxWidth: '70%',
          background: isMine ? 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)' : '#2a2a3e',
          padding: '10px 14px',
          borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          color: '#fff',
          wordWrap: 'break-word',
          position: 'relative'
        }
      }, [
        React.createElement('span', { key: 'text' }, msg.content),
        msg.read_at && isMine && React.createElement('span', {
          key: 'read',
          style: { fontSize: '10px', color: '#aaa', marginLeft: '8px' }
        }, '✓✓')
      ]);
    }),
    React.createElement('div', { ref: messagesEndRef })),

    // Input
    React.createElement('form', {
      key: 'input',
      onSubmit: sendMessage,
      style: {
        padding: '12px 20px',
        borderTop: '1px solid #222',
        display: 'flex',
        gap: '8px',
        background: '#1a1a2e'
      }
    }, [
      React.createElement('input', {
        type: 'text',
        placeholder: 'Type a message...',
        value: input,
        onChange: handleTyping,
        style: {
          flex: 1,
          padding: '10px 14px',
          borderRadius: '20px',
          border: '1px solid #333',
          background: '#0f0f1a',
          color: '#fff',
          outline: 'none',
          fontSize: '14px'
        }
      }),
      React.createElement('button', {
        type: 'submit',
        style: {
          padding: '10px 20px',
          borderRadius: '20px',
          border: 'none',
          background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: 'bold'
        }
      }, 'Send')
    ])
  ]);
}
