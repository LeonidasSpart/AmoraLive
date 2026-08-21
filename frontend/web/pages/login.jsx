import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.amoramatch.one';

export default function Login() {
  const router = useRouter();
  const [identifier,setIdentifier]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
  const googleLogin=()=>{ window.location.href=`${API}/auth/google/start`; };
  const handleSubmit=async(e)=>{ e.preventDefault(); setError(''); setLoading(true); try { const res=await fetch(`${API}/auth/login`,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({identifier:identifier.trim(),password})}); const data=await res.json().catch(()=>({})); if(!res.ok) throw new Error(data.error||'We could not sign you in. Please check your details.'); localStorage.setItem('accessToken',data.accessToken); if(data.refreshToken)localStorage.setItem('refreshToken',data.refreshToken); if(data.user?.id)localStorage.setItem('userId',data.user.id); router.replace(data.user?.role==='admin'||data.user?.role==='superadmin'?'/admin':'/discover'); } catch(err){setError(err.message||'Unable to connect to AmoraLive.');} finally{setLoading(false);} };
  return <div className="amora-auth-page"><div className="amora-auth-shell">
    <section className="amora-auth-brand"><img src="/brand/amora-logo.png" alt="Amora — Meaningful Connections"/><h1>Welcome back to <span className="amora-gradient-text">Amora.</span></h1><p>Come back to your conversations, matches and live moments — wherever you are.</p></section>
    <section className="amora-auth-form"><Link href="/" style={{color:'#8f89a2',textDecoration:'none',fontSize:13}}>← Back to AmoraLive</Link><div style={{height:20}}/><h2>Sign in</h2><p className="lead">Use your email or username to continue.</p>
      {router.query.error && <div className="amora-error">Google sign-in could not be completed. Please try again.</div>}{error&&<div className="amora-error">{error}</div>}
      <form onSubmit={handleSubmit}><div className="amora-field"><label className="amora-label">Email or username</label><input className="amora-input" autoComplete="username" value={identifier} onChange={e=>setIdentifier(e.target.value)} placeholder="you@example.com or username" required/></div><div className="amora-field"><label className="amora-label">Password</label><input className="amora-input" autoComplete="current-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" required/></div><button className="amora-btn amora-btn-primary amora-auth-submit" disabled={loading}>{loading?'Signing you in…':'Sign in'}</button></form>
      <div className="amora-divider">OR</div><button className="amora-google" type="button" onClick={googleLogin}>Continue with Google</button>
      <p className="amora-auth-bottom">New to Amora? <Link href="/register">Create your account</Link></p>
    </section>
  </div></div>;
}
