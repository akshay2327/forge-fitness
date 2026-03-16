'use client'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()
  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Sans,sans-serif', color:'#f0ede8', padding:'2rem', textAlign:'center' as const }}>
      <div>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(6rem,20vw,14rem)', lineHeight:1, color:'rgba(255,255,255,0.04)', letterSpacing:'0.05em', userSelect:'none' as const, marginBottom:'-2rem' }}>404</div>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(2rem,5vw,4rem)', letterSpacing:'0.06em', marginBottom:'1rem' }}>
          FORGE<span style={{ color:'#e8c547' }}>.</span> PAGE NOT FOUND
        </div>
        <p style={{ color:'#888880', fontSize:'1rem', maxWidth:'420px', margin:'0 auto 2.5rem', lineHeight:1.7 }}>
          This page doesn't exist or may have been moved. Let's get you back on track.
        </p>
        <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' as const }}>
          <button onClick={()=>router.push('/')} style={{ padding:'0.9rem 2.2rem', background:'#e8c547', border:'none', color:'#0a0a0a', borderRadius:'8px', cursor:'pointer', fontSize:'0.95rem', fontWeight:700, fontFamily:'inherit' }}>
            ← Back to Home
          </button>
          <button onClick={()=>router.back()} style={{ padding:'0.9rem 2.2rem', background:'transparent', border:'1px solid rgba(255,255,255,0.15)', color:'#f0ede8', borderRadius:'8px', cursor:'pointer', fontSize:'0.95rem', fontFamily:'inherit' }}>
            Go Back
          </button>
        </div>
        <div style={{ marginTop:'3rem', display:'flex', gap:'2rem', justifyContent:'center', flexWrap:'wrap' as const }}>
          {[['Dashboard','/dashboard'],['Admin Panel','/admin'],['Trainer Panel','/trainer']].map(([l,h])=>(
            <span key={l} onClick={()=>router.push(h)} style={{ fontSize:'0.82rem', color:'#888880', cursor:'pointer', textDecoration:'underline', textUnderlineOffset:'3px' }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
