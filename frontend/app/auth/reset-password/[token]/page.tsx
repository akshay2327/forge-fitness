'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'

type Step = 'form' | 'success' | 'error'

export default function ResetPasswordPage() {
  const params  = useParams()
  const router  = useRouter()
  const token   = params?.token as string

  const [step, setStep]         = useState<Step>('form')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [show,     setShow]     = useState(false)

  const rules = [
    { label:'At least 8 characters',         ok: password.length >= 8 },
    { label:'At least one uppercase letter', ok: /[A-Z]/.test(password) },
    { label:'At least one number',           ok: /\d/.test(password) },
    { label:'Passwords match',               ok: password === confirm && confirm.length > 0 },
  ]
  const allOk = rules.every(r => r.ok)

  const handleSubmit = async () => {
    setError('')
    if (!allOk) { setError('Please meet all password requirements.'); return }
    setLoading(true)
    try {
      const res  = await fetch(`${API}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Reset failed')
      setStep('success')
    } catch (err: any) {
      if (err.message.includes('expired') || err.message.includes('invalid')) {
        setStep('error')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const card = {
    background:'#181818', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:'16px', padding:'3rem 2.5rem',
    maxWidth:'460px', width:'100%',
  } as const

  const inp = (focus = false) => ({
    width:'100%', background:'#111',
    border:`1px solid ${focus ? '#e8c547' : 'rgba(255,255,255,0.1)'}`,
    color:'#f0ede8', padding:'0.82rem 1rem',
    borderRadius:'8px', fontSize:'0.9rem',
    outline:'none', fontFamily:'inherit',
  } as const)

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Sans,sans-serif', color:'#f0ede8', padding:'1rem' }}>
      <div style={card}>

        {/* Logo */}
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2.2rem', letterSpacing:'0.1em', marginBottom:'2rem', cursor:'pointer', textAlign:'center' as const }} onClick={()=>router.push('/')}>
          FORGE<span style={{ color:'#e8c547' }}>.</span>
        </div>

        {/* ── FORM ── */}
        {step === 'form' && (
          <>
            <h2 style={{ fontSize:'1.4rem', fontWeight:700, marginBottom:'0.4rem' }}>Create New Password</h2>
            <p style={{ color:'#888880', fontSize:'0.875rem', marginBottom:'1.8rem', lineHeight:1.6 }}>
              Choose a strong password for your FORGE account.
            </p>

            {error && (
              <div style={{ background:'rgba(232,92,58,0.1)', border:'1px solid rgba(232,92,58,0.3)', color:'#e85c3a', padding:'0.7rem 1rem', borderRadius:'8px', fontSize:'0.85rem', marginBottom:'1rem' }}>
                {error}
              </div>
            )}

            {/* Password field */}
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ fontSize:'0.72rem', color:'#888880', textTransform:'uppercase' as const, letterSpacing:'0.06em', display:'block', marginBottom:'0.3rem' }}>
                New Password
              </label>
              <div style={{ position:'relative' as const }}>
                <input
                  type={show ? 'text' : 'password'}
                  style={{ ...inp(), paddingRight:'2.8rem' }}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
                />
                <button
                  onClick={()=>setShow(!show)}
                  style={{ position:'absolute', right:'0.8rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#888880', cursor:'pointer', fontSize:'1rem', padding:0 }}>
                  {show ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm field */}
            <div style={{ marginBottom:'1.5rem' }}>
              <label style={{ fontSize:'0.72rem', color:'#888880', textTransform:'uppercase' as const, letterSpacing:'0.06em', display:'block', marginBottom:'0.3rem' }}>
                Confirm Password
              </label>
              <input
                type={show ? 'text' : 'password'}
                style={inp()}
                placeholder="Repeat your password"
                value={confirm}
                onChange={e=>setConfirm(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
              />
            </div>

            {/* Strength checklist */}
            {password.length > 0 && (
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', padding:'1rem', marginBottom:'1.5rem' }}>
                <div style={{ fontSize:'0.72rem', color:'#888880', textTransform:'uppercase' as const, letterSpacing:'0.08em', marginBottom:'0.75rem' }}>Password strength</div>
                {rules.map(r => (
                  <div key={r.label} style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.82rem', marginBottom:'0.4rem', color: r.ok ? '#4caf7d' : '#888880' }}>
                    <span style={{ fontSize:'0.75rem', flexShrink:0 }}>{r.ok ? '✓' : '○'}</span>
                    {r.label}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !allOk}
              style={{ width:'100%', padding:'0.9rem', background: allOk ? '#e8c547' : 'rgba(232,197,71,0.3)', border:'none', color: allOk ? '#0a0a0a' : 'rgba(0,0,0,0.4)', borderRadius:'8px', cursor: allOk ? 'pointer' : 'not-allowed', fontSize:'0.95rem', fontWeight:700, fontFamily:'inherit', transition:'all 0.2s' }}>
              {loading ? 'Updating Password...' : 'Set New Password →'}
            </button>

            <div style={{ textAlign:'center' as const, marginTop:'1.2rem' }}>
              <span style={{ fontSize:'0.82rem', color:'#888880', cursor:'pointer', textDecoration:'underline' }} onClick={()=>router.push('/')}>
                Back to Login
              </span>
            </div>
          </>
        )}

        {/* ── SUCCESS ── */}
        {step === 'success' && (
          <div style={{ textAlign:'center' as const }}>
            <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'rgba(76,175,125,0.12)', border:'2px solid rgba(76,175,125,0.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem', fontSize:'2rem' }}>✓</div>
            <h2 style={{ fontSize:'1.4rem', fontWeight:700, marginBottom:'0.6rem', color:'#4caf7d' }}>Password Updated!</h2>
            <p style={{ color:'#888880', fontSize:'0.9rem', lineHeight:1.6, marginBottom:'2rem' }}>
              Your password has been changed successfully. You can now log in with your new password.
            </p>
            <button
              onClick={()=>router.push('/')}
              style={{ width:'100%', padding:'0.9rem', background:'#e8c547', border:'none', color:'#0a0a0a', borderRadius:'8px', cursor:'pointer', fontSize:'0.95rem', fontWeight:700, fontFamily:'inherit' }}>
              Login Now →
            </button>
          </div>
        )}

        {/* ── EXPIRED / ERROR ── */}
        {step === 'error' && (
          <div style={{ textAlign:'center' as const }}>
            <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'rgba(232,92,58,0.12)', border:'2px solid rgba(232,92,58,0.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem', fontSize:'2rem' }}>✕</div>
            <h2 style={{ fontSize:'1.4rem', fontWeight:700, marginBottom:'0.6rem', color:'#e85c3a' }}>Link Expired</h2>
            <p style={{ color:'#888880', fontSize:'0.9rem', lineHeight:1.6, marginBottom:'2rem' }}>
              This password reset link has expired or is invalid. Reset links are valid for 30 minutes.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              <button
                onClick={()=>router.push('/')}
                style={{ width:'100%', padding:'0.9rem', background:'#e8c547', border:'none', color:'#0a0a0a', borderRadius:'8px', cursor:'pointer', fontSize:'0.95rem', fontWeight:700, fontFamily:'inherit' }}>
                Request New Reset Link
              </button>
              <button
                onClick={()=>router.push('/')}
                style={{ width:'100%', padding:'0.9rem', background:'transparent', border:'1px solid rgba(255,255,255,0.15)', color:'#f0ede8', borderRadius:'8px', cursor:'pointer', fontSize:'0.95rem', fontFamily:'inherit' }}>
                Back to Home
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
