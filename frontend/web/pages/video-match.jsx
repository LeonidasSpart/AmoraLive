// pages/video-match.jsx
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function VideoMatch() {
  const router = useRouter();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(10);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeciding, setIsDeciding] = useState(false);
  const [matched, setMatched] = useState(false);
  const [matchId, setMatchId] = useState(null);
  const timerRef = useRef(null);
  const videoRef = useRef(null);

  // Fetch next match
  const fetchNextMatch = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');
    setTimer(10);
    setIsDeciding(false);
    setMatched(false);
    setMatchId(null);
    try {
      const res = await fetch('https://api.amoramatch.one/matches/next', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 404) {
        setError('No matches available right now. Try again later.');
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch match');
      const data = await res.json();
      setCandidate(data);
      // Start timer
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto-skip if no decision made
            if (!isDeciding && !matched) {
              handleSkip(data.id);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextMatch();
    return () => clearInterval(timerRef.current);
  }, []);

  // Handle accept
  const handleAccept = async (targetId) => {
    if (isDeciding || matched) return;
    setIsDeciding(true);
    clearInterval(timerRef.current);
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch('https://api.amoramatch.one/matches/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId: targetId })
      });
      if (!res.ok) throw new Error('Accept failed');
      const data = await res.json();
      if (data.matched) {
        setMatched(true);
        setMatchId(data.matchId);
        // Optionally show a success message and redirect to chat or profile
        setTimeout(() => {
          router.push(`/chat/${data.matchId}`); // You'll need a chat page with match ID
        }, 2000);
      } else {
        setError('Something went wrong');
        setIsDeciding(false);
      }
    } catch (err) {
      setError(err.message);
      setIsDeciding(false);
    }
  };

  // Handle skip
  const handleSkip = async (targetId) => {
    if (isDeciding || matched) return;
    setIsDeciding(true);
    clearInterval(timerRef.current);
    const token = localStorage.getItem('accessToken');
    try {
      await fetch('https://api.amoramatch.one/matches/skip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId: targetId })
      });
      // Load next match after a brief delay
      setTimeout(() => {
        setIsDeciding(false);
        fetchNextMatch();
      }, 500);
    } catch (err) {
      setError(err.message);
      setIsDeciding(false);
    }
  };

  // Render video placeholder
  const renderVideo = () => {
    if (candidate && candidate.profile_photo) {
      return React.createElement('img', {
        src: candidate.profile_photo,
        alt: candidate.display_name || candidate.username,
        style: {
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }
      });
    }
    return React.createElement('div', {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '80px',
        color: '#444',
        background: '#1a1a2e'
      }
    }, '📷');
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
    }, 'Finding your match...');
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
        fontFamily: 'sans-serif',
        padding: '20px'
      }
    }, [
      React.createElement('p', { key: 'msg', style: { color: '#ff6b6b' } }, error),
      React.createElement('button', {
        key: 'retry',
        onClick: () => { setError(''); fetchNextMatch(); },
        style: {
          marginTop: '20px',
          padding: '8px 24px',
          borderRadius: '6px',
          border: 'none',
          background: '#FF6B9D',
          color: '#fff',
          cursor: 'pointer'
        }
      }, 'Try Again'),
      React.createElement(Link, {
        key: 'back',
        href: '/discover',
        style: { marginTop: '10px', color: '#888', textDecoration: 'none' }
      }, '← Back to Discovery')
    ]);
  }

  if (!candidate) {
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
      React.createElement('p', { key: 'msg', style: { color: '#aaa' } }, 'No matches available right now.'),
      React.createElement(Link, {
        key: 'back',
        href: '/discover',
        style: { marginTop: '20px', color: '#FF6B9D', textDecoration: 'none' }
      }, '← Back to Discovery')
    ]);
  }

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: '#0f0f1a',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'sans-serif',
      padding: '20px'
    }
  }, [
    // Header
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
      React.createElement('div', { key: 'left', style: { display: 'flex', alignItems: 'center', gap: '12px' } }, [
        React.createElement(Link, {
          key: 'back',
          href: '/discover',
          style: { color: '#888', textDecoration: 'none', fontSize: '20px' }
        }, '←'),
        React.createElement('span', { key: 'title', style: { color: '#fff', fontSize: '18px', fontWeight: 'bold' } }, 'First Impressions')
      ]),
      React.createElement('span', {
        key: 'timer',
        style: {
          background: timer <= 3 ? '#ff4444' : '#2a2a3e',
          padding: '6px 16px',
          borderRadius: '20px',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      }, `${timer}s`)
    ]),

    // Main video area
    React.createElement('div', {
      key: 'video-container',
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '20px',
        position: 'relative'
      }
    }, [
      // Video placeholder
      React.createElement('div', {
        ref: videoRef,
        style: {
          width: '100%',
          maxWidth: '600px',
          aspectRatio: '4 / 3',
          background: '#000',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
          border: '2px solid #333'
        }
      }, [
        renderVideo(),
        // Overlay: candidate info
        React.createElement('div', {
          style: {
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            background: 'rgba(0,0,0,0.6)',
            padding: '12px 18px',
            borderRadius: '8px',
            color: '#fff'
          }
        }, [
          React.createElement('h3', { key: 'name', style: { margin: 0, fontSize: '18px' } }, 
            candidate.display_name || candidate.username
          ),
          candidate.location && React.createElement('p', { key: 'loc', style: { margin: 0, fontSize: '12px', color: '#aaa' } }, 
            candidate.location.city || candidate.location.country || ''
          ),
          candidate.interests && candidate.interests.length > 0 && React.createElement('p', { key: 'interests', style: { margin: '4px 0 0 0', fontSize: '12px', color: '#aaa' } },
            candidate.interests.slice(0, 3).join(' · ')
          )
        ])
      ]),

      // Action buttons
      React.createElement('div', {
        key: 'actions',
        style: {
          display: 'flex',
          gap: '40px',
          marginTop: '30px',
          justifyContent: 'center'
        }
      }, [
        // Skip button
        React.createElement('button', {
          key: 'skip',
          onClick: () => handleSkip(candidate.id),
          disabled: isDeciding || matched,
          style: {
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: 'none',
            background: '#444',
            color: '#fff',
            fontSize: '28px',
            cursor: isDeciding || matched ? 'not-allowed' : 'pointer',
            opacity: isDeciding || matched ? 0.5 : 1,
            transition: '0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }
        }, '✕'),
        // Accept (Heart) button
        React.createElement('button', {
          key: 'accept',
          onClick: () => handleAccept(candidate.id),
          disabled: isDeciding || matched,
          style: {
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            border: 'none',
            background: '#FF6B9D',
            color: '#fff',
            fontSize: '32px',
            cursor: isDeciding || matched ? 'not-allowed' : 'pointer',
            opacity: isDeciding || matched ? 0.5 : 1,
            transition: '0.2s',
            boxShadow: '0 0 20px rgba(255,107,157,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }
        }, '❤️')
      ]),

      // Match success message
      matched && React.createElement('div', {
        key: 'matched',
        style: {
          marginTop: '20px',
          padding: '12px 24px',
          background: '#1a5a2a',
          borderRadius: '8px',
          color: '#8f8',
          fontSize: '16px'
        }
      }, '🎉 It\'s a match! Redirecting to chat...'),

      // Info text
      React.createElement('p', {
        key: 'info',
        style: {
          marginTop: '16px',
          color: '#666',
          fontSize: '13px',
          textAlign: 'center',
          maxWidth: '400px'
        }
      }, 'You have 10 seconds to decide. Tap ❤️ if you like them, or ✕ to skip.')
    ])
  ]);
}
