'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'

type Status = 'loading' | 'success' | 'error'

export default function VerifyEmailPage() {
  const params   = useParams()
  const router   = useRouter()
  const token    = params?.token as string
  const [status, setStatus]   = useState<Status>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Invalid verification link.'); return }
    verifyEmail()
  }, [token])

  const verifyEmail = async () => {
    try {
      const res  = await fetch(`${API}/auth/verify-email/${token}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')
      setStatus('success')
      setMessage(data.message || 'Email verified successfully!')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Verification failed. The link may have expired.')
    }
  }

  const bg  = '#0a0a0a'
  const card = { background:'#181818', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'16px', padding:'3rem 2.5rem', maxWidth:'460px', width:'100%', textAlign:'center' as const }

  return (
    <div style={{ minHeight:'100vh', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Sans,sans-serif', color:'#f0ede8', padding:'1rem' }}>
      <div style={card}>

        {/* Logo */}
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2.2rem', letterSpacing:'0.1em', marginBottom:'2rem', cursor:'pointer' }} onClick={()=>router.push('/')}>
          FORGE<span style={{ color:'#e8c547' }}>.</span>
        </div>

        {/* Loading */}
        {status === 'loading' && (
          <>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>⏳</div>
            <h2 style={{ fontSize:'1.3rem', fontWeight:600, marginBottom:'0.5rem' }}>Verifying your email...</h2>
            <p style={{ color:'#888880', fontSize:'0.9rem' }}>Please wait a moment.</p>
            {/* Spinner */}
            <div style={{ margin:'2rem auto 0', width:'36px', height:'36px', border:'3px solid rgba(255,255,255,0.1)', borderTopColor:'#e8c547', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'rgba(76,175,125,0.12)', border:'2px solid rgba(76,175,125,0.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem', fontSize:'2rem' }}>✓</div>
            <h2 style={{ fontSize:'1.4rem', fontWeight:700, marginBottom:'0.6rem', color:'#4caf7d' }}>Email Verified!</h2>
            <p style={{ color:'#888880', fontSize:'0.9rem', lineHeight:1.6, marginBottom:'2rem' }}>{message}</p>
            <p style={{ color:'#888880', fontSize:'0.875rem', marginBottom:'1.5rem' }}>Your account is now fully active. You can log in and start your fitness journey.</p>
            <button
              onClick={()=>router.push('/')}
              style={{ width:'100%', padding:'0.9rem', background:'#e8c547', border:'none', color:'#0a0a0a', borderRadius:'8px', cursor:'pointer', fontSize:'0.95rem', fontWeight:700, fontFamily:'inherit' }}>
              Go to Login →
            </button>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'rgba(232,92,58,0.12)', border:'2px solid rgba(232,92,58,0.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem', fontSize:'2rem' }}>✕</div>
            <h2 style={{ fontSize:'1.4rem', fontWeight:700, marginBottom:'0.6rem', color:'#e85c3a' }}>Verification Failed</h2>
            <p style={{ color:'#888880', fontSize:'0.9rem', lineHeight:1.6, marginBottom:'2rem' }}>{message}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              <button
                onClick={()=>router.push('/')}
                style={{ width:'100%', padding:'0.9rem', background:'#e8c547', border:'none', color:'#0a0a0a', borderRadius:'8px', cursor:'pointer', fontSize:'0.95rem', fontWeight:700, fontFamily:'inherit' }}>
                Back to Home
              </button>
              <button
                onClick={()=>router.push('/?resend=true')}
                style={{ width:'100%', padding:'0.9rem', background:'transparent', border:'1px solid rgba(255,255,255,0.15)', color:'#f0ede8', borderRadius:'8px', cursor:'pointer', fontSize:'0.95rem', fontFamily:'inherit' }}>
                Request New Link
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
