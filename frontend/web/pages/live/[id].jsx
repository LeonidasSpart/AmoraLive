// pages/live/[id].jsx
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function LiveRoom() {
  const router = useRouter();
  const { id } = router.query;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [giftCatalog, setGiftCatalog] = useState([]);
  const [showGiftPicker, setShowGiftPicker] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const chatContainerRef = useRef(null);
  const videoRef = useRef(null);

  // Mock data for demonstration – will be replaced by real API
  const mockRoom = {
    id: id || 'room-1',
    title: 'Dragon Slayer Event!',
    host: { id: 'host-1', username: 'Lucia★', display_name: 'Lucia★', profile_photo: null },
    category: 'Chat',
    viewer_count: 243,
    status: 'live',
    stream_key: 'mock_stream',
    thumbnail_url: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    settings: { slow_mode: false, pinned_comment: null }
  };

  const mockMessages = [
    { id: 'm1', user_id: 'u1', username: 'User1', message: 'Hello everyone! 🎉', created_at: new Date(Date.now() - 120000).toISOString() },
    { id: 'm2', user_id: 'u2', username: 'User2', message: 'This is amazing!', created_at: new Date(Date.now() - 60000).toISOString() },
    { id: 'm3', user_id: 'host-1', username: 'Lucia★', message: 'Welcome to the stream! ❤️', created_at: new Date(Date.now() - 30000).toISOString() }
  ];

  const mockGifts = [
    { id: 'g1', name: 'Rose', image_url: '🌹', coin_price: 10, rarity: 'common' },
    { id: 'g2', name: 'Heart', image_url: '❤️', coin_price: 50, rarity: 'common' },
    { id: 'g3', name: 'Crown', image_url: '👑', coin_price: 200, rarity: 'rare' },
    { id: 'g4', name: 'Dragon', image_url: '🐉', coin_price: 500, rarity: 'epic' },
    { id: 'g5', name: 'Golden Rocket', image_url: '🚀', coin_price: 1000, rarity: 'legendary' }
  ];

  useEffect(() => {
    if (!id) return;

    // Fetch room data (replace with real API)
    const fetchRoom = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/login');
          return;
        }
        // In production: fetch from API
        // const res = await fetch(`https://api.amoramatch.one/live/${id}`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const data = await res.json();
        // setRoom(data);
        // setViewerCount(data.viewer_count || 0);
        // setIsHost(data.host.id === userId);
        // setChatMessages(data.messages || []);
        // setGiftCatalog(data.gifts || []);

        // Using mock data for now
        setRoom(mockRoom);
        setViewerCount(mockRoom.viewer_count);
        setIsHost(false); // would check against logged-in user
        setChatMessages(mockMessages);
        setGiftCatalog(mockGifts);
        setLoading(false);

        // Simulate WebSocket connection
        const ws = new WebSocket('wss://api.amoramatch.one/live');
        ws.onopen = () => {
          ws.send(JSON.stringify({ type: 'join', roomId: id }));
        };
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'new-chat') {
            setChatMessages(prev => [...prev, data.message]);
          } else if (data.type === 'viewer-count') {
            setViewerCount(data.count);
          } else if (data.type === 'gift-animation') {
            // Show gift animation
            alert(`Gift sent: ${data.gift.name}`);
          }
        };
        return () => ws.close();
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    // In production: send via WebSocket or API
    setChatMessages(prev => [
      ...prev,
      { id: 'temp', user_id: 'me', username: 'Me', message: messageInput, created_at: new Date().toISOString() }
    ]);
    setMessageInput('');
    // Also send to server
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`https://api.amoramatch.one/live/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: messageInput })
      });
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const sendGift = async (giftId) => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch('https://api.amoramatch.one/gifts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ giftId, roomId: id })
      });
      if (res.ok) {
        alert('Gift sent!');
        setShowGiftPicker(false);
      }
    } catch (err) {
      console.error('Gift failed', err);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
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
    }, 'Loading room...');
  }

  if (error || !room) {
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
      React.createElement('p', { key: 'msg', style: { color: '#ff6b6b' } }, `Error: ${error || 'Room not found'}`),
      React.createElement(Link, {
        key: 'back',
        href: '/discover',
        style: { marginTop: '20px', color: '#FF6B9D', textDecoration: 'none' }
      }, '← Back to Discovery')
    ]);
  }

  return React.createElement('div', {
    style: {
      height: '100vh',
      background: '#0f0f1a',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'sans-serif',
      overflow: 'hidden'
    }
  }, [
    // Main content: video + chat sidebar
    React.createElement('div', {
      key: 'main',
      style: {
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
      }
    }, [
      // Video area (2/3)
      React.createElement('div', {
        key: 'video',
        style: {
          flex: 2,
          position: 'relative',
          background: '#000',
          display: 'flex',
          flexDirection: 'column'
        }
      }, [
        // Video player placeholder
        React.createElement('div', {
          ref: videoRef,
          style: {
            flex: 1,
            background: '#1a1a2e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }
        }, [
          React.createElement('div', {
            style: { color: '#444', fontSize: '64px' }
          }, '📺'),
          // Live badge
          React.createElement('span', {
            style: {
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: '#ff0000',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold'
            }
          }, '🔴 LIVE'),
          // Viewer count
          React.createElement('span', {
            style: {
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }
          }, [`👁️ ${viewerCount || 0}`]),
          // Room title overlay
          React.createElement('div', {
            style: {
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 'bold',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }
          }, room.title),
          // Host name
          React.createElement('div', {
            style: {
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              color: '#aaa',
              fontSize: '14px',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }
          }, [`Host: ${room.host?.display_name || room.host?.username}`]),
          // Fullscreen button
          React.createElement('button', {
            onClick: toggleFullscreen,
            style: {
              position: 'absolute',
              bottom: '60px',
              right: '16px',
              background: 'rgba(0,0,0,0.6)',
              border: 'none',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }
          }, isFullscreen ? '⛶' : '⛶')
        ])
      ]),

      // Chat sidebar (1/3)
      React.createElement('div', {
        key: 'chat',
        style: {
          flex: 1,
          background: '#1a1a2e',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid #333',
          minWidth: '280px'
        }
      }, [
        // Chat header
        React.createElement('div', {
          style: {
            padding: '12px 16px',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, [
          React.createElement('span', { key: 'title', style: { color: '#fff', fontWeight: 'bold' } }, 'Live Chat'),
          React.createElement('div', { key: 'actions', style: { display: 'flex', gap: '8px' } }, [
            React.createElement('button', {
              key: 'gift',
              onClick: () => setShowGiftPicker(!showGiftPicker),
              style: {
                background: '#FF6B9D',
                border: 'none',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '12px'
              }
            }, '🎁 Gifts'),
            React.createElement('button', {
              key: 'toggle',
              onClick: () => setIsChatOpen(!isChatOpen),
              style: {
                background: 'transparent',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontSize: '16px'
              }
            }, isChatOpen ? '➡️' : '⬅️')
          ])
        ]),

        // Gift picker (toggled)
        showGiftPicker && React.createElement('div', {
          style: {
            padding: '12px',
            borderBottom: '1px solid #333',
            maxHeight: '150px',
            overflowY: 'auto',
            background: '#0f0f1a'
          }
        }, [
          React.createElement('div', {
            style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }
          }, giftCatalog.map(gift =>
            React.createElement('button', {
              key: gift.id,
              onClick: () => sendGift(gift.id),
              style: {
                background: '#1a1a2e',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '8px',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: '12px'
              }
            }, [
              React.createElement('div', { key: 'icon', style: { fontSize: '24px' } }, gift.image_url || '🎁'),
              React.createElement('div', { key: 'price', style: { color: '#FFD700', fontSize: '10px' } }, `${gift.coin_price} 🪙`)
            ])
          ))
        ]),

        // Chat messages
        React.createElement('div', {
          ref: chatContainerRef,
          style: {
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }
        }, chatMessages.map(msg =>
          React.createElement('div', {
            key: msg.id,
            style: {
              display: 'flex',
              gap: '8px',
              alignItems: 'baseline',
              fontSize: '13px',
              wordWrap: 'break-word'
            }
          }, [
            React.createElement('span', {
              key: 'user',
              style: {
                color: msg.user_id === room.host.id ? '#FF6B9D' : '#4fc3f7',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }
            }, msg.username || 'User'),
            React.createElement('span', {
              key: 'msg',
              style: { color: '#ddd' }
            }, msg.message)
          ])
        )),

        // Chat input
        React.createElement('form', {
          onSubmit: sendMessage,
          style: {
            padding: '12px 16px',
            borderTop: '1px solid #333',
            display: 'flex',
            gap: '8px'
          }
        }, [
          React.createElement('input', {
            type: 'text',
            placeholder: 'Send a message...',
            value: messageInput,
            onChange: (e) => setMessageInput(e.target.value),
            style: {
              flex: 1,
              padding: '8px 12px',
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
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: '#FF6B9D',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold'
            }
          }, 'Send')
        ])
      ])
    ]),

    // Bottom bar (mobile friendly - optional)
    React.createElement('div', {
      style: {
        padding: '8px 20px',
        background: '#111',
        borderTop: '1px solid #222',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#888'
      }
    }, [
      React.createElement('span', { key: 'room' }, `Room: ${room.title}`),
      React.createElement('span', { key: 'actions' }, [
        React.createElement('button', {
          key: 'report',
          style: { background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', marginLeft: '16px' }
        }, 'Report'),
        React.createElement('button', {
          key: 'block',
          style: { background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', marginLeft: '16px' }
        }, 'Block')
      ])
    ])
  ]);
}
