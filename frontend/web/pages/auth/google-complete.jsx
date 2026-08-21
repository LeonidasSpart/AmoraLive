import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
export default function GoogleComplete(){
  const router=useRouter();
  useEffect(()=>{ if(!router.isReady)return; const {accessToken,refreshToken,userId}=router.query; if(accessToken){localStorage.setItem('accessToken',String(accessToken)); if(refreshToken)localStorage.setItem('refreshToken',String(refreshToken)); if(userId)localStorage.setItem('userId',String(userId||'')); router.replace('/discover');} },[router.isReady,router.query]);
  return <div className="amora-auth-page"><div className="amora-auth-shell" style={{display:'block',maxWidth:520}}><section className="amora-auth-form" style={{textAlign:'center'}}><img src="/brand/amora-mark.png" alt="Amora" style={{width:110}}/><h2>Connecting you to Amora…</h2><p className="lead">Please wait while we finish signing you in.</p></section></div></div>;
}
