import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import VerifiedBadge from '../components/VerifiedBadge';

const tabs = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'trending', label: 'Trending' },
  { key: 'new', label: 'New' },
  { key: 'following', label: 'Following' },
  { key: 'categories', label: 'Categories' },
];

const categories = [
  'Chat',
  'Music',
  'Entertainment',
  'Gaming',
  'Lifestyle',
  'Travel',
  'Q&A',
  'Dating',
];

export default function Discover() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommended');
  const [error, setError] = useState('');

  const fetchRooms = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('accessToken');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    setError('');

    try {
      let url = '/live?limit=30';

      if (activeTab === 'trending') {
        url += '&sort=viewer_count';
      }

      if (activeTab === 'new') {
        url += '&sort=newest';
      }

      if (activeTab === 'following') {
        url += '&following=true';
      }

      const res = await apiFetch(url);

      if (!res.ok) {
        throw new Error(`Failed to fetch live rooms (${res.status})`);
      }

      const data = await res.json();

      setRooms(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.rooms)
            ? data.rooms
            : []
      );
    } catch (err) {
      console.error('Discover error:', err);
      setError(err?.message || 'Failed to load live streams');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const timeSince = (date) => {
    if (!date) return '';

    const timestamp = new Date(date).getTime();

    if (Number.isNaN(timestamp)) return '';

    const diff = Math.max(
      0,
      Math.floor((Date.now() - timestamp) / 60000)
    );

    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;

    const hours = Math.floor(diff / 60);

    if (hours < 24) return `${hours}h ago`;

    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Layout>
      <div
        style={{
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* TABS */}
        <nav
          aria-label="Discover filters"
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '15px',
            marginBottom: '20px',
            borderBottom: '1px solid #1a1a2e',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                background:
                  activeTab === tab.key
                    ? 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)'
                    : 'transparent',
                color: activeTab === tab.key ? '#fff' : '#888',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab.key ? 'bold' : 'normal',
                whiteSpace: 'nowrap',
                border:
                  activeTab === tab.key
                    ? 'none'
                    : '1px solid #333',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* CATEGORIES */}
        {activeTab === 'categories' && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px',
              padding: '10px 0',
            }}
          >
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                style={{
                  padding: '8px 20px',
                  borderRadius: '20px',
                  border: '1px solid #333',
                  background: '#1a1a2e',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 0',
              color: '#666',
            }}
          >
            Loading live streams...
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 0',
              color: '#ff6b6b',
            }}
          >
            <p>Error: {error}</p>

            <button
              type="button"
              onClick={fetchRooms}
              style={{
                marginTop: '10px',
                padding: '8px 24px',
                borderRadius: '6px',
                border: 'none',
                background:
                  'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && rooms.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 0',
              color: '#666',
            }}
          >
            <p style={{ fontSize: '18px' }}>
              No live streams right now
            </p>

            <p style={{ fontSize: '14px' }}>
              Check back later or start your own!
            </p>
          </div>
        )}

        {/* ROOMS */}
        {!loading && !error && rooms.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '20px',
              marginTop: '10px',
            }}
          >
            {rooms.map((room) => {
              const host = room?.host || {};
              const roomId = room?.id;

              if (!roomId) return null;

              return (
                <Link
                  key={roomId}
                  href={`/live/${roomId}`}
                  style={{
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  <div
                    style={{
                      background: '#1a1a2e',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow:
                        '0 2px 10px rgba(0,0,0,0.3)',
                    }}
                  >
                    {/* THUMBNAIL */}
                    <div
                      style={{
                        position: 'relative',
                        height: '140px',
                        background: '#2a2a3e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {room.thumbnail_url ? (
                        <img
                          src={room.thumbnail_url}
                          alt={room.title || 'Live stream'}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            color: '#444',
                            fontSize: '40px',
                          }}
                        >
                          📺
                        </div>
                      )}

                      <span
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          background: '#ff0000',
                          color: '#fff',
                          fontSize: '10px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                        }}
                      >
                        LIVE
                      </span>

                      <span
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          background: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          fontSize: '12px',
                          padding: '4px 10px',
                          borderRadius: '12px',
                        }}
                      >
                        👁️ {room.viewer_count || 0}
                      </span>
                    </div>

                    {/* INFO */}
                    <div style={{ padding: '12px 14px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginBottom: '6px',
                        }}
                      >
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: '#2a2a3e',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          {host.profile_photo ? (
                            <img
                              src={host.profile_photo}
                              alt={
                                host.display_name ||
                                host.username ||
                                'Host'
                              }
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          ) : (
                            '👤'
                          )}
                        </div>

                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: '#fff',
                            fontSize: '13px',
                            fontWeight: '500',
                          }}
                        >
                          {host.display_name ||
                            host.username ||
                            'Unknown'}

                          <VerifiedBadge
                            user={host}
                            size={12}
                          />
                        </span>
                      </div>

                      <h3
                        style={{
                          color: '#fff',
                          fontSize: '15px',
                          margin: '4px 0 2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {room.title || 'Untitled'}
                      </h3>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '4px',
                        }}
                      >
                        <span
                          style={{
                            color: '#888',
                            fontSize: '11px',
                          }}
                        >
                          #{room.category || 'General'}
                        </span>

                        <span
                          style={{
                            color: '#666',
                            fontSize: '11px',
                          }}
                        >
                          {timeSince(room.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
