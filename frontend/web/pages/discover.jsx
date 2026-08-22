// pages/discover.jsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';

export default function Discover() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommended');
  const [error, setError] = useState('');

  const tabs = [
    { key: 'recommended', label: 'Recommended' },
    { key: 'trending', label: 'Trending' },
    { key: 'new', label: 'New' },
    { key: 'following', label: 'Following' },
    { key: 'categories', label: 'Categories' }
  ];

  const categories = ['Chat', 'Music', 'Entertainment', 'Gaming', 'Lifestyle', 'Travel', 'Q&A', 'Dating'];

  const fetchRooms = async () => {
    if (!localStorage.getItem('accessToken')) {
      window.location.href = '/login';
      return;
    }
    setLoading(true);
    setError('');
    try {
      let url = '/live?limit=30';
      if (activeTab === 'trending') url += '&sort=viewer_count';
      if (activeTab === 'new') url += '&sort=newest';
      if (activeTab === 'following') url += '&following=true';

      const res = await apiFetch(url);
      if (!res.ok) throw new Error('Failed to fetch live rooms');
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : data.rooms || []);
    } catch (err) {
      setError(err.message);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [activeTab]);

  const timeSince = (date) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return React.createElement(Layout, null,
    React.createElement('div', null, [
      // Tabs
      React.createElement('nav', {
        key: 'tabs',
        style: {
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '15px',
          marginBottom: '20px',
          borderBottom: '1px solid #1a1a2e'
        }
      }, tabs.map(tab =>
        React.createElement('button', {
          key: tab.key,
          onClick: () => setActiveTab(tab.key),
          style: {
            padding: '8px 20px',
            borderRadius: '20px',
            border: 'none',
            background: activeTab === tab.key ? '#FF6B9D' : 'transparent',
            color: activeTab === tab.key ? '#fff' : '#888',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === tab.key ? 'bold' : 'normal',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
            border: activeTab === tab.key ? 'none' : '1px solid #333'
          }
        }, tab.label)
      )),

      // Categories sub‑tabs
      activeTab === 'categories' && React.createElement('div', {
        key: 'category-grid',
        style: {
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          padding: '10px 0'
        }
      }, categories.map(cat =>
        React.createElement('button', {
          key: cat,
          style: {
            padding: '8px 20px',
            borderRadius: '20px',
            border: '1px solid #333',
            background: '#1a1a2e',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            transition: '0.2s'
          },
          onMouseEnter: (e) => e.target.style.background = '#2a2a3e',
          onMouseLeave: (e) => e.target.style.background = '#1a1a2e'
        }, cat)
      )),

      // Loading / Error / Grid
      loading && React.createElement('div', {
        key: 'loading',
        style: { textAlign: 'center', padding: '60px 0', color: '#666' }
      }, 'Loading live streams...'),

      error && React.createElement('div', {
        key: 'error',
        style: { textAlign: 'center', padding: '40px 0', color: '#ff6b6b' }
      }, [
        React.createElement('p', { key: 'msg' }, `Error: ${error}`),
        React.createElement('button', {
          key: 'retry',
          onClick: fetchRooms,
          style: {
            marginTop: '10px',
            padding: '8px 24px',
            borderRadius: '6px',
            border: 'none',
            background: '#FF6B9D',
            color: '#fff',
            cursor: 'pointer'
          }
        }, 'Retry')
      ]),

      !loading && !error && React.createElement('div', {
        key: 'grid',
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '20px',
          marginTop: '10px'
        }
      }, rooms.length === 0 ? [
        React.createElement('div', {
          key: 'empty',
          style: {
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '60px 0',
            color: '#666'
          }
        }, [
          React.createElement('p', { key: 'msg', style: { fontSize: '18px' } }, 'No live streams right now'),
          React.createElement('p', { key: 'sub', style: { fontSize: '14px' } }, 'Check back later or start your own!')
        ])
      ] : rooms.map(room =>
        React.createElement(Link, {
          key: room.id,
          href: `/live/${room.id}`,
          style: { textDecoration: 'none' }
        }, [
          React.createElement('div', {
            style: {
              background: '#1a1a2e',
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,107,157,0.15)';
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
            }
          }, [
            // Thumbnail
            React.createElement('div', {
              style: {
                position: 'relative',
                height: '140px',
                background: '#2a2a3e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }
            }, [
              !room.thumbnail_url && React.createElement('div', {
                key: 'placeholder',
                style: { color: '#444', fontSize: '40px' }
              }, '📺'),
              room.thumbnail_url && React.createElement('img', {
                key: 'thumb',
                src: room.thumbnail_url,
                alt: room.title,
                style: { width: '100%', height: '100%', objectFit: 'cover' }
              }),
              React.createElement('span', {
                key: 'live-badge',
                style: {
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  background: '#ff0000',
                  color: '#fff',
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }
              }, 'LIVE'),
              React.createElement('span', {
                key: 'viewers',
                style: {
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }
              }, ['👁️', ` ${room.viewer_count || 0}`])
            ]),
            // Info
            React.createElement('div', {
              style: { padding: '12px 14px' }
            }, [
              React.createElement('div', {
                key: 'host',
                style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }
              }, [
                React.createElement('div', {
                  style: {
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#2a2a3e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    fontSize: '14px'
                  }
                }, room.host?.profile_photo
                  ? React.createElement('img', {
                      src: room.host.profile_photo,
                      alt: room.host.display_name || room.host.username,
                      style: { width: '100%', height: '100%', objectFit: 'cover' }
                    })
                  : '👤'
                ),
                React.createElement('span', {
                  style: { color: '#fff', fontSize: '13px', fontWeight: '500' }
                }, room.host?.display_name || room.host?.username || 'Unknown')
              ]),
              React.createElement('h3', {
                style: {
                  color: '#fff',
                  fontSize: '15px',
                  margin: '4px 0 2px 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }
              }, room.title || 'Untitled'),
              React.createElement('div', {
                style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }
              }, [
                React.createElement('span', {
                  style: { color: '#888', fontSize: '11px' }
                }, `#${room.category || 'General'}`),
                React.createElement('span', {
                  style: { color: '#666', fontSize: '11px' }
                }, timeSince(room.created_at))
              ])
            ])
          ])
        ])
      ))
    ])
  );
}
