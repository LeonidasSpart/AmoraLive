export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f0f1a', 
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ color: '#FF6B9D' }}>AmoraLive</h1>
      <p style={{ color: '#aaa' }}>Web frontend is live with Next.js 15</p>
    </div>
  );
}
