// pages/discover.jsx
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import VerifiedBadge from '../components/VerifiedBadge';
import Stories from '../components/Stories';

export default function Discover() {
  const [rooms, setRooms] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommended');
  const [creatorType, setCreatorType] = useState('popular');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [followBusy, setFollowBusy] = useState(null);
  const searchTimer = useRef(null);

  const tabs = [
    { key: 'recommended', label: 'Recommended' },
    { key: 'trending', label: 'Trending' },
    { key: 'new', label: 'New' },
    { key: 'following', label: 'Following' },
    { key: 'creators', label: 'Creators' },
    { key: 'categories', label: 'Categories' }
  ];

  const creatorTypes = [
    { key: 'popular', label: 'Popular' },
    { key: 'rising', label: 'Rising' },
    { key: 'new', label: 'New' }
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
      if (activeTab === 'creators') {
        const res = await apiFetch(`/discover/creators?type=${creatorType}&limit=30`);
        if (!res.ok) throw new Error('Failed to fetch creators');
        setCreators(await res.json());
        setRooms([]);
        return;
      }

      if (activeTab === 'recommended') {
        const res = await apiFetch('/discover/recommended?limit=30');
        if (!res.ok) throw new Error('Failed to fetch recommendations');
        setRooms(await res.json());
        setCreators([]);
        return;
      }

      let url = '/live?limit=30';
      if (activeTab === 'trending') url += '&sort=trending';
      if (activeTab === 'new') url += '&sort=newest';
      if (activeTab === 'following') url += '&following=true';
      if (activeTab === 'categories' && selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;

      const res = await apiFetch(url);
      if (!res.ok) throw new Error('Failed to fetch live rooms');
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : data.rooms || []);
      setCreators([]);
    } catch (err) {
      setError(err.message);
      setRooms([]);
      setCreators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, creatorType, selectedCategory]);

  // Debounced search — waits 350ms after typing stops before hitting the
  // API, and cancels the previous timer on every keystroke.
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (searchQuery.trim().length < 2) {
      setSearchResults(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await apiFetch(`/discover/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) setSearchResults(await res.json());
      } catch {
        setSearchResults({ rooms: [], creators: [] });
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery]);

  const toggleFollow = async (userId, currentlyFollowing) => {
    setFollowBusy(userId);
    try {
      const res = await apiFetch(`/users/${userId}/${currentlyFollowing ? 'unfollow' : 'follow'}`, { method: 'POST' });
      if (res.ok) {
        const applyUpdate = (list) => list.map((c) => (c.id === userId ? { ...c, isFollowing: !currentlyFollowing } : c));
        setCreators((prev) => applyUpdate(prev));
        setSearchResults((prev) => (prev ? { ...prev, creators: applyUpdate(prev.creators || []) } : prev));
      }
    } catch {} finally {
      setFollowBusy(null);
    }
  };

  const timeSince = (date) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const renderRoomCard = (room) =>
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
              key: 'hostname',
              style: { display: 'inline-flex', alignItems: 'center', color: '#fff', fontSize: '13px', fontWeight: '500' }
            }, [room.host?.display_name || room.host?.username || 'Unknown', React.createElement(VerifiedBadge, { key: 'badge', user: room.host, size: 12 })])
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
    ]);

  const renderCreatorCard = (creator) =>
    React.createElement('div', {
      key: creator.id,
      style: {
        background: '#1a1a2e',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '8px'
      }
    }, [
      React.createElement(Link, { key: 'avatar-link', href: `/creator/${creator.id}`, style: { textDecoration: 'none' } },
        React.createElement('div', {
          style: {
            width: '64px', height: '64px', borderRadius: '50%', background: '#2a2a3e',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: '28px'
          }
        }, creator.profile_photo
          ? React.createElement('img', { src: creator.profile_photo, alt: creator.display_name, style: { width: '100%', height: '100%', objectFit: 'cover' } })
          : '👤'
        )
      ),
      React.createElement(Link, {
        key: 'name-link', href: `/creator/${creator.id}`,
        style: { display: 'flex', alignItems: 'center', color: '#fff', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }
      }, [creator.display_name || creator.username, React.createElement(VerifiedBadge, { key: 'b', user: creator, size: 12 })]),
      creator.bio && React.createElement('p', { key: 'bio', style: { color: '#888', fontSize: '12px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' } }, creator.bio),
      creator.followerCount != null && React.createElement('span', { key: 'followers', style: { color: '#666', fontSize: '11px' } }, `${creator.followerCount} followers`),
      creator.newFollowersThisWeek != null && React.createElement('span', { key: 'rising', style: { color: '#8f8', fontSize: '11px' } }, `+${creator.newFollowersThisWeek} this week`),
      React.createElement('div', { key: 'actions', style: { display: 'flex', gap: '8px', marginTop: '6px', width: '100%' } }, [
        React.createElement('button', {
          key: 'follow',
          onClick: () => toggleFollow(creator.id, creator.isFollowing),
          disabled: followBusy === creator.id,
          style: {
            flex: 1, padding: '6px 0', borderRadius: '8px', border: 'none', fontSize: '12px', cursor: 'pointer',
            background: creator.isFollowing ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)',
            color: '#fff'
          }
        }, creator.isFollowing ? 'Following' : 'Follow'),
        React.createElement(Link, { key: 'msg', href: `/chat/${creator.id}`, style: { flex: 1, textDecoration: 'none' } },
          React.createElement('div', { style: { padding: '6px 0', borderRadius: '8px', border: '1px solid #333', fontSize: '12px', color: '#ccc', textAlign: 'center' } }, 'Message')
        )
      ])
    ]);

  const isSearching = searchQuery.trim().length >= 2;

  return React.createElement(Layout, null,
    React.createElement('div', null, [
      React.createElement(Stories, { key: 'stories' }),

      // Search bar
      React.createElement('input', {
        key: 'search',
        type: 'text',
        placeholder: '🔍 Search creators and live streams…',
        value: searchQuery,
        onChange: (e) => setSearchQuery(e.target.value),
        style: {
          width: '100%',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid #333',
          background: '#161625',
          color: '#fff',
          fontSize: '14px',
          marginBottom: '16px',
          boxSizing: 'border-box'
        }
      }),

      isSearching
        ? React.createElement('div', { key: 'search-results' }, [
            searching && React.createElement('p', { key: 'loading', style: { color: '#666', padding: '20px 0' } }, 'Searching…'),
            !searching && searchResults?.creators?.length > 0 && React.createElement('div', { key: 'creators', style: { marginBottom: '24px' } }, [
              React.createElement('h4', { key: 't', style: { color: '#999', fontSize: '13px', marginBottom: '10px' } }, 'Creators'),
              React.createElement('div', { key: 'grid', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' } }, searchResults.creators.map(renderCreatorCard))
            ]),
            !searching && searchResults?.rooms?.length > 0 && React.createElement('div', { key: 'rooms' }, [
              React.createElement('h4', { key: 't', style: { color: '#999', fontSize: '13px', marginBottom: '10px' } }, 'Live now'),
              React.createElement('div', { key: 'grid', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' } }, searchResults.rooms.map(renderRoomCard))
            ]),
            !searching && searchResults && searchResults.creators?.length === 0 && searchResults.rooms?.length === 0 &&
              React.createElement('p', { key: 'empty', style: { color: '#666', padding: '40px 0', textAlign: 'center' } }, `No results for "${searchQuery}"`)
          ])
        : [
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
            border: activeTab === tab.key ? 'none' : '1px solid #333',
            background: activeTab === tab.key ? 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)' : 'transparent',
            color: activeTab === tab.key ? '#fff' : '#888',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === tab.key ? 'bold' : 'normal',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }
        }, tab.label)
      )),

      // Creator type sub-tabs
      activeTab === 'creators' && React.createElement('div', {
        key: 'creator-type-tabs',
        style: { display: 'flex', gap: '10px', marginBottom: '20px' }
      }, creatorTypes.map(ct =>
        React.createElement('button', {
          key: ct.key,
          onClick: () => setCreatorType(ct.key),
          style: {
            padding: '6px 16px',
            borderRadius: '16px',
            border: creatorType === ct.key ? 'none' : '1px solid #333',
            background: creatorType === ct.key ? '#2a2a3e' : 'transparent',
            color: creatorType === ct.key ? '#fff' : '#888',
            cursor: 'pointer',
            fontSize: '13px'
          }
        }, ct.label)
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
          onClick: () => setSelectedCategory(selectedCategory === cat ? null : cat),
          style: {
            padding: '8px 20px',
            borderRadius: '20px',
            border: selectedCategory === cat ? 'none' : '1px solid #333',
            background: selectedCategory === cat ? 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)' : '#1a1a2e',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            transition: '0.2s'
          }
        }, cat)
      )),

      // Loading / Error / Grid
      loading && React.createElement('div', {
        key: 'loading',
        style: { textAlign: 'center', padding: '60px 0', color: '#666' }
      }, activeTab === 'creators' ? 'Loading creators...' : 'Loading live streams...'),

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
            background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)',
            color: '#fff',
            cursor: 'pointer'
          }
        }, 'Retry')
      ]),

      !loading && !error && activeTab === 'creators' && React.createElement('div', {
        key: 'creator-grid',
        style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }
      }, creators.length === 0
        ? React.createElement('p', { style: { gridColumn: '1 / -1', textAlign: 'center', color: '#666', padding: '40px 0' } }, 'No creators to show yet.')
        : creators.map(renderCreatorCard)
      ),

      !loading && !error && activeTab !== 'creators' && React.createElement('div', {
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
      ] : rooms.map(renderRoomCard))
      ]
    ])
  );
}

