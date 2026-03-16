'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, getUser, clearSession } from '@/lib/api'

const ACCENT = '#e8c547'
const CARD   = '#1a1a1a'
const BORDER = 'rgba(255,255,255,0.08)'

export default function TrainerPage() {
  const router = useRouter()
  const [user, setUser]       = useState<any>(null)
  const [tab,  setTab]        = useState('clients')
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast]     = useState('')

  useEffect(() => {
    const u = getUser()
    if (!u) { router.push('/'); return }
    if (u.role === 'admin') { router.push('/admin'); return }
    if (u.role === 'member') { router.push('/dashboard'); return }
    setUser(u)
    setLoading(false)
  }, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(''), 3000) }
  const handleLogout = () => { clearSession(); router.push('/') }

  const s = {
    layout:  { display:'flex', minHeight:'100vh', background:'#0a0a0a', fontFamily:'DM Sans, sans-serif', color:'#f0ede8' } as any,
    sidebar: { width:'240px', background:'#111', borderRight:`1px solid ${BORDER}`, padding:'1.5rem', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh', flexShrink:0 } as any,
    main:    { flex:1, padding:'2rem', overflowY:'auto', maxHeight:'100vh' } as any,
    card:    { background:CARD, border:`1px solid ${BORDER}`, borderRadius:'12px', padding:'1.5rem', marginBottom:'1rem' } as any,
    btn:     { padding:'0.7rem 1.4rem', background:ACCENT, border:'none', color:'#0a0a0a', borderRadius:'8px', cursor:'pointer', fontSize:'0.875rem', fontWeight:700, fontFamily:'inherit' } as any,
    btnGhost:{ padding:'0.7rem 1.4rem', background:'transparent', border:`1px solid ${BORDER}`, color:'#f0ede8', borderRadius:'8px', cursor:'pointer', fontSize:'0.875rem', fontFamily:'inherit' } as any,
  }

  const navLinks = [
    { icon:'👥', label:'My Clients',    key:'clients' },
    { icon:'📋', label:'Assign Plans',  key:'plans' },
    { icon:'📊', label:'Analytics',     key:'analytics' },
    { icon:'👤', label:'My Profile',    key:'profile' },
  ]

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', color:'#f0ede8', fontFamily:'DM Sans, sans-serif' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'2.5rem', color:'#f0ede8' }}>FORGE<span style={{ color:ACCENT }}>.</span></div>
        <div style={{ color:'#888880' }}>Loading trainer panel...</div>
      </div>
    </div>
  )

  return (
    <div style={s.layout}>
      {toast && <div style={{ position:'fixed', bottom:'2rem', right:'2rem', zIndex:999, background:'#1e1e1e', border:'1px solid rgba(232,197,71,0.4)', borderRadius:'8px', padding:'0.9rem 1.5rem', color:'#f0ede8', fontSize:'0.875rem' }}>{toast}</div>}
      <aside style={s.sidebar}>
        <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'1.8rem', letterSpacing:'0.08em', marginBottom:'0.3rem', cursor:'pointer' }} onClick={()=>router.push('/')}>FORGE<span style={{ color:ACCENT }}>.</span></div>
        <div style={{ fontSize:'0.72rem', color:ACCENT, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'2rem' }}>Trainer Panel</div>
        <nav style={{ flex:1 }}>
          {navLinks.map(l => (
            <div key={l.key} onClick={()=>setTab(l.key)} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.7rem 0.9rem', borderRadius:'8px', cursor:'pointer', background: tab===l.key ? 'rgba(232,197,71,0.1)' : 'transparent', color: tab===l.key ? '#f0ede8' : '#888880', fontSize:'0.875rem', fontWeight:500, marginBottom:'2px' }}>
              <span>{l.icon}</span> {l.label}
            </div>
          ))}
        </nav>
        <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:'1rem' }}>
          <div style={{ fontSize:'0.875rem', fontWeight:500, marginBottom:'0.3rem' }}>{user?.fullName}</div>
          <div style={{ fontSize:'0.72rem', color:ACCENT, marginBottom:'0.75rem' }}>Certified Trainer</div>
          <button onClick={handleLogout} style={{ ...s.btnGhost, width:'100%', padding:'0.5rem', fontSize:'0.8rem' }}>Logout</button>
        </div>
      </aside>
      <main style={s.main}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
          <h1 style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'2rem', letterSpacing:'0.04em', margin:0 }}>
            {navLinks.find(l=>l.key===tab)?.label || 'Trainer Panel'}
          </h1>
          <button onClick={()=>router.push('/')} style={s.btnGhost}>← Home</button>
        </div>
        {tab === 'clients' && (
          <div style={s.card}>
            <div style={{ fontWeight:500, marginBottom:'1rem' }}>Your Assigned Clients</div>
            <p style={{ color:'#888880', fontSize:'0.875rem', lineHeight:1.7 }}>
              Clients are assigned by the admin. Once assigned, you can view their assessments, track their progress, and update their workout and diet plans from here.
            </p>
            <div style={{ marginTop:'1.5rem', padding:'2rem', background:'#111', borderRadius:'8px', textAlign:'center' }}>
              <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>👥</div>
              <div style={{ color:'#888880', fontSize:'0.875rem' }}>No clients assigned yet. Contact admin to get clients assigned to you.</div>
            </div>
          </div>
        )}
        {tab === 'plans' && (
          <div style={s.card}>
            <div style={{ fontWeight:500, marginBottom:'1rem' }}>Assign Workout & Diet Plans</div>
            <p style={{ color:'#888880', fontSize:'0.875rem', lineHeight:1.7 }}>Select a client and assign personalised plans based on their assessment data.</p>
            <button style={{ ...s.btn, marginTop:'1rem' }} onClick={()=>setTab('clients')}>Select a Client →</button>
          </div>
        )}
        {tab === 'analytics' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
            {[['Total Clients','0','👥'],['Avg. Goal Progress','—','📈'],['Plans Assigned','0','📋']].map(([l,v,i])=>(
              <div key={String(l)} style={s.card}>
                <div style={{ fontSize:'0.72rem', color:'#888880', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.5rem' }}>{l}</div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'2.4rem', lineHeight:1, color:'#f0ede8' }}>{v}</div>
                  <div style={{ fontSize:'1.5rem' }}>{i}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'profile' && (
          <div style={s.card}>
            <div style={{ fontWeight:500, marginBottom:'1rem' }}>Trainer Profile</div>
            {[['Full Name',user?.fullName],['Email',user?.email],['Member ID',user?.memberId],['Role','Trainer'],['Plan',user?.membership?.plan]].map(([l,v])=>(
              <div key={String(l)} style={{ display:'flex', justifyContent:'space-between', padding:'0.55rem 0', borderBottom:`1px solid ${BORDER}`, fontSize:'0.875rem' }}>
                <span style={{ color:'#888880' }}>{l}</span>
                <span style={{ fontWeight:500, color: l==='Member ID'?ACCENT:'#f0ede8' }}>{v as string || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
