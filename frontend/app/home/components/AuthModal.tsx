'use client'
import { useState } from 'react'

const API = 'http://localhost:5001/api/v1'

interface AuthModalProps {
  onClose: () => void
  onSuccess: (user: any, token: string) => void
  defaultTab?: 'login' | 'signup'
}

export default function AuthModal({ onClose, onSuccess, defaultTab = 'login' }: AuthModalProps) {
  const [tab, setTab]         = useState<'login'|'signup'|'forgot'>(defaultTab)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  // Login fields
  const [loginEmail, setLoginEmail]   = useState('')
  const [loginPass,  setLoginPass]    = useState('')

  // Signup fields
  const [signupName,  setSignupName]  = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPass,  setSignupPass]  = useState('')

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('')

  const handleLogin = async () => {
    setError(''); setLoading(true)
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      localStorage.setItem('forge_token', data.accessToken)
      localStorage.setItem('forge_user',  JSON.stringify(data.user))
      onSuccess(data.user, data.accessToken)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async () => {
    setError(''); setLoading(true)
    try {
      const res  = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: signupName, email: signupEmail, password: signupPass }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.errors?.[0]?.msg || data.error || 'Signup failed')
      localStorage.setItem('forge_token', data.accessToken)
      localStorage.setItem('forge_user',  JSON.stringify(data.user))
      onSuccess(data.user, data.accessToken)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async () => {
    setError(''); setLoading(true)
    try {
      const res  = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })
      const data = await res.json()
      setSuccess(data.message || 'Reset link sent!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const overlay: React.CSSProperties = {
    position:'fixed', inset:0, zIndex:1000,
    background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)',
    display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem',
  }
  const modal: React.CSSProperties = {
    background:'#181818', border:'1px solid rgba(255,255,255,0.12)',
    borderRadius:'16px', width:'100%', maxWidth:'440px',
    padding:'2.5rem', position:'relative', animation:'modalIn 0.2s ease',
  }
  const inp: React.CSSProperties = {
    width:'100%', background:'#111', border:'1px solid rgba(255,255,255,0.1)',
    color:'#f0ede8', padding:'0.8rem 1rem', borderRadius:'8px',
    fontSize:'0.9rem', outline:'none', fontFamily:'inherit', marginTop:'0.4rem',
  }
  const btn: React.CSSProperties = {
    width:'100%', padding:'0.9rem', background:'#e8c547', border:'none',
    color:'#0a0a0a', borderRadius:'8px', cursor:'pointer', fontSize:'0.95rem',
    fontWeight:700, marginTop:'1.2rem', fontFamily:'inherit',
    opacity: loading ? 0.7 : 1,
  }
  const ghostBtn: React.CSSProperties = {
    background:'none', border:'none', color:'#e8c547', cursor:'pointer',
    fontSize:'0.82rem', padding:0, fontFamily:'inherit', textDecoration:'underline',
  }

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(12px) } to { opacity:1; transform:scale(1) translateY(0) } }`}</style>
      <div style={modal}>

        {/* Close */}
        <button onClick={onClose} style={{ position:'absolute', top:'1rem', right:'1rem', background:'rgba(255,255,255,0.07)', border:'none', color:'#888', width:'30px', height:'30px', borderRadius:'50%', cursor:'pointer', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
          <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'2.2rem', letterSpacing:'0.08em', color:'#f0ede8' }}>FORGE<span style={{ color:'#e8c547' }}>.</span></div>
          <div style={{ fontSize:'0.85rem', color:'#888880', marginTop:'0.2rem' }}>
            {tab==='login' ? 'Welcome back' : tab==='signup' ? 'Start your journey' : 'Reset your password'}
          </div>
        </div>

        {/* Tabs (only for login/signup) */}
        {tab !== 'forgot' && (
          <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:'1.5rem' }}>
            {(['login','signup'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); setSuccess('') }}
                style={{ flex:1, padding:'0.75rem', background:'none', border:'none', color: tab===t ? '#f0ede8' : '#888880', borderBottom: tab===t ? '2px solid #e8c547' : '2px solid transparent', cursor:'pointer', fontSize:'0.875rem', fontWeight:500, textTransform:'capitalize', fontFamily:'inherit', transition:'all 0.2s' }}>
                {t === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>
        )}

        {/* Error / Success */}
        {error   && <div style={{ background:'rgba(232,92,58,0.1)', border:'1px solid rgba(232,92,58,0.3)', color:'#e85c3a', padding:'0.7rem 1rem', borderRadius:'8px', fontSize:'0.85rem', marginBottom:'1rem' }}>{error}</div>}
        {success && <div style={{ background:'rgba(76,175,125,0.1)', border:'1px solid rgba(76,175,125,0.3)', color:'#4caf7d', padding:'0.7rem 1rem', borderRadius:'8px', fontSize:'0.85rem', marginBottom:'1rem' }}>{success}</div>}

        {/* LOGIN */}
        {tab === 'login' && (
          <div>
            <div><label style={{ fontSize:'0.75rem', color:'#888880', textTransform:'uppercase', letterSpacing:'0.06em' }}>Email or Member ID</label>
              <input style={inp} type="email" placeholder="you@email.com" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
            </div>
            <div style={{ marginTop:'1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <label style={{ fontSize:'0.75rem', color:'#888880', textTransform:'uppercase', letterSpacing:'0.06em' }}>Password</label>
                <button style={ghostBtn} onClick={()=>{setTab('forgot');setError('');setSuccess('')}}>Forgot password?</button>
              </div>
              <input style={inp} type="password" placeholder="••••••••" value={loginPass} onChange={e=>setLoginPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
            </div>
            <button style={btn} onClick={handleLogin} disabled={loading}>{loading ? 'Logging in...' : 'Login to Dashboard →'}</button>
            <div style={{ textAlign:'center', marginTop:'1rem', fontSize:'0.78rem', color:'#555' }}>
              Demo: <span style={{ color:'#e8c547' }}>demo@forgefitness.com</span> / <span style={{ color:'#e8c547' }}>Member@123</span>
            </div>
          </div>
        )}

        {/* SIGNUP */}
        {tab === 'signup' && (
          <div>
            <div><label style={{ fontSize:'0.75rem', color:'#888880', textTransform:'uppercase', letterSpacing:'0.06em' }}>Full Name</label>
              <input style={inp} type="text" placeholder="Your full name" value={signupName} onChange={e=>setSignupName(e.target.value)}/>
            </div>
            <div style={{ marginTop:'1rem' }}><label style={{ fontSize:'0.75rem', color:'#888880', textTransform:'uppercase', letterSpacing:'0.06em' }}>Email</label>
              <input style={inp} type="email" placeholder="you@email.com" value={signupEmail} onChange={e=>setSignupEmail(e.target.value)}/>
            </div>
            <div style={{ marginTop:'1rem' }}><label style={{ fontSize:'0.75rem', color:'#888880', textTransform:'uppercase', letterSpacing:'0.06em' }}>Password</label>
              <input style={inp} type="password" placeholder="Min. 8 characters" value={signupPass} onChange={e=>setSignupPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSignup()}/>
            </div>
            <button style={btn} onClick={handleSignup} disabled={loading}>{loading ? 'Creating account...' : 'Create Account →'}</button>
            <div style={{ textAlign:'center', marginTop:'0.8rem', fontSize:'0.75rem', color:'#555' }}>By signing up you agree to our Terms & Privacy Policy.</div>
          </div>
        )}

        {/* FORGOT PASSWORD */}
        {tab === 'forgot' && (
          <div>
            <p style={{ fontSize:'0.875rem', color:'#888880', lineHeight:1.6, marginBottom:'1.2rem' }}>Enter your email and we'll send you a reset link.</p>
            <div><label style={{ fontSize:'0.75rem', color:'#888880', textTransform:'uppercase', letterSpacing:'0.06em' }}>Email Address</label>
              <input style={inp} type="email" placeholder="you@email.com" value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleForgot()}/>
            </div>
            <button style={btn} onClick={handleForgot} disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
            <div style={{ textAlign:'center', marginTop:'1rem' }}>
              <button style={ghostBtn} onClick={()=>{setTab('login');setError('');setSuccess('')}}>← Back to Login</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
