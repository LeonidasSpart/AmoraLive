import React from 'react';

export default function Home() {
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
    React.createElement('h1', { style: { color: '#FF6B9D' } }, 'AmoraLive'),
    React.createElement('p', { style: { color: '#aaa' } }, 'Web frontend is live with Next.js 15')
  ]);
}
