import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

const API=(process.env.NEXT_PUBLIC_API_URL||'https://api.amoramatch.one').replace(/\/+$/,'');
const tabs=[['all','All'],['avatar_frame','Frames'],['entrance_effect','Effects'],['badge','Badges'],['chat_bubble','Chat'],['profile_card','Cards']];
export default function Outfits(){
 const [items,setItems]=useState([]),[owned,setOwned]=useState([]),[tab,setTab]=useState('all'),[loading,setLoading]=useState(true),[msg,setMsg]=useState('');
 const load=async()=>{const t=localStorage.getItem('accessToken'); if(!t)return; try{const [a,b]=await Promise.all([fetch(`${API}/store/catalog`),fetch(`${API}/store/my`,{headers:{Authorization:`Bearer ${t}`}})]);setItems(a.ok?await a.json():[]);setOwned(b.ok?await b.json():[]);}catch(e){setMsg('Unable to load your wardrobe.')}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const ownedIds=new Set(owned.map(x=>x.cosmetic_id));
 const equip=async id=>{const t=localStorage.getItem('accessToken'); const o=owned.find(x=>x.cosmetic_id===id); if(!o)return; const endpoint=o.is_equipped?'unequip':'equip'; const r=await fetch(`${API}/store/${endpoint}`,{method:'POST',headers:{Authorization:`Bearer ${t}`,'Content-Type':'application/json'},body:JSON.stringify({cosmeticId:id})}); if(r.ok)load();};
 const filtered=tab==='all'?items:items.filter(x=>x.type===tab);
 return <Layout><div className="amora-outfit-page"><div className="amora-outfit-hero"><div><Link href="/store" className="amora-back">← Boutique</Link><span className="amora-kicker">YOUR ROYAL LOOK</span><h1>Dress your aura.</h1><p>Frames, effects, badges and profile styles that make your Amora identity unmistakably yours.</p></div><div className="amora-outfit-avatar">✦</div></div><div className="amora-discover-tabs">{tabs.map(([k,l])=><button key={k} className={tab===k?'is-active':''} onClick={()=>setTab(k)}>{l}</button>)}</div>{msg&&<div className="amora-empty-card"><p>{msg}</p></div>}{loading?<div className="amora-live-grid">{[1,2,3,4].map(x=><div className="amora-skeleton-card" key={x}/>)}</div>:<div className="amora-outfit-grid">{filtered.map(item=>{const own=ownedIds.has(item.id),equipped=owned.find(x=>x.cosmetic_id===item.id)?.is_equipped;return <div className="amora-outfit-card" key={item.id}><div className="amora-outfit-art">{item.image_url?<img src={item.image_url} alt=""/>:<span>✦</span>}<i>{item.type.replace('_',' ')}</i></div><h3>{item.name}</h3><p>{item.duration_days?`${item.duration_days} days`:'Permanent'}</p><div className="amora-outfit-bottom"><strong>🪙 {item.price_coins}</strong>{own?<button onClick={()=>equip(item.id)} className={equipped?'equipped':''}>{equipped?'Equipped':'Equip'}</button>:<Link href="/store">Get it</Link>}</div></div>})}</div>}</div></Layout>;
}
