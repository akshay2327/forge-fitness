'use client'
import { useState, useEffect } from 'react'
import AuthModal from './components/AuthModal'
declare global { interface Window { Razorpay: any } }
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'

const Athlete = () => (
  <svg viewBox="0 0 500 600" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%',display:'block'}}>
    <defs>
      <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d4956a"/><stop offset="100%" stopColor="#a0683c"/></linearGradient>
      <radialGradient id="sp" cx="50%" cy="35%" r="60%"><stop offset="0%" stopColor="#e8c547" stopOpacity="0.1"/><stop offset="100%" stopColor="#e8c547" stopOpacity="0"/></radialGradient>
    </defs>
    <rect width="500" height="600" fill="#0d0d0d"/><rect width="500" height="600" fill="url(#sp)"/>
    {[0,1,2,3,4,5].map(i=><line key={`v${i}`} x1={i*100} y1="0" x2={i*100} y2="600" stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>)}
    {[0,1,2,3,4,5,6].map(i=><line key={`h${i}`} x1="0" y1={i*86} x2="500" y2={i*86} stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>)}
    <rect x="0" y="490" width="500" height="110" fill="#111"/>
    <line x1="0" y1="490" x2="500" y2="490" stroke="rgba(232,197,71,0.2)" strokeWidth="1"/>
    <ellipse cx="250" cy="496" rx="75" ry="10" fill="rgba(0,0,0,0.35)"/>
    <rect x="90" y="208" width="320" height="9" rx="4" fill="#777"/>
    <rect x="90" y="199" width="30" height="27" rx="6" fill="#e8c547"/><rect x="99" y="195" width="14" height="35" rx="4" fill="#c8942a"/>
    <rect x="380" y="199" width="30" height="27" rx="6" fill="#e8c547"/><rect x="387" y="195" width="14" height="35" rx="4" fill="#c8942a"/>
    <rect x="208" y="390" width="32" height="102" rx="16" fill="url(#sk)"/>
    <rect x="260" y="390" width="32" height="102" rx="16" fill="url(#sk)"/>
    <rect x="198" y="362" width="104" height="50" rx="12" fill="#1a1a3e"/>
    <rect x="200" y="232" width="100" height="145" rx="16" fill="url(#sk)"/>
    <rect x="198" y="237" width="104" height="138" rx="14" fill="#0f172a"/>
    <text x="250" y="322" textAnchor="middle" fill="#e8c547" fontSize="10" fontWeight="bold" letterSpacing="3">FORGE</text>
    <rect x="140" y="208" width="26" height="90" rx="13" fill="url(#sk)" transform="rotate(-20,153,208)"/>
    <rect x="334" y="208" width="26" height="90" rx="13" fill="url(#sk)" transform="rotate(20,347,208)"/>
    <rect x="232" y="198" width="36" height="38" rx="14" fill="url(#sk)"/>
    <ellipse cx="250" cy="170" rx="38" ry="42" fill="url(#sk)"/>
    <ellipse cx="250" cy="138" rx="38" ry="20" fill="#1a0a00"/>
    <ellipse cx="237" cy="168" rx="6" ry="7" fill="#1a0800"/><ellipse cx="263" cy="168" rx="6" ry="7" fill="#1a0800"/>
    <ellipse cx="238" cy="166" rx="2.5" ry="2.5" fill="rgba(255,255,255,0.6)"/><ellipse cx="264" cy="166" rx="2.5" ry="2.5" fill="rgba(255,255,255,0.6)"/>
    <path d="M237 185 Q250 192 263 185" stroke="#8a4a2a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <circle cx="250" cy="170" r="50" fill="none" stroke="rgba(232,197,71,0.07)" strokeWidth="1.5"/>
  </svg>
)

export default function HomePage() {
  const [showAuth, setShowAuth] = useState(false)
  const [authTab, setAuthTab]   = useState<'login'|'signup'>('login')
  const [user, setUser]         = useState<any>(null)
  const [payLoading, setPayLoading] = useState('')
  const [toast, setToast]       = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const u = localStorage.getItem('forge_user')
    if (u) setUser(JSON.parse(u))
    const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    document.body.appendChild(s)
  }, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(''), 4000) }
  const openLogin  = () => { setAuthTab('login');  setShowAuth(true); setMenuOpen(false) }
  const openSignup = () => { setAuthTab('signup'); setShowAuth(true); setMenuOpen(false) }

  const handleAuthSuccess = (u: any) => {
    setUser(u); setShowAuth(false)
    window.location.href = u.role==='admin' ? '/admin' : u.role==='trainer' ? '/trainer' : '/dashboard'
  }
  const handleLogout = () => {
    localStorage.removeItem('forge_token'); localStorage.removeItem('forge_user'); setUser(null)
  }
  const handleBuyPlan = async (plan: string) => {
    const token = localStorage.getItem('forge_token')
    if (!token) { openLogin(); showToast('Please login first!'); return }
    setPayLoading(plan)
    try {
      const res = await fetch(`${API}/payments/create-order`, {
        method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
        body: JSON.stringify({plan})
      })
      const order = await res.json()
      if (!res.ok) throw new Error(order.error)
      new window.Razorpay({
        key:order.keyId, amount:order.amount, currency:order.currency,
        name:'FORGE Fitness', description:order.planName, order_id:order.orderId,
        prefill:{name:user?.fullName, email:user?.email}, theme:{color:'#e8c547'},
        handler: async (resp: any) => {
          const vRes  = await fetch(`${API}/payments/verify`, {
            method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
            body: JSON.stringify({...resp,plan})
          })
          const vData = await vRes.json()
          showToast('🎉 ' + (vData.message || 'Plan activated!'))
          const u = JSON.parse(localStorage.getItem('forge_user')||'{}')
          u.membership = vData.membership; localStorage.setItem('forge_user',JSON.stringify(u)); setUser({...u})
        },
        modal:{ondismiss:()=>setPayLoading('')},
      }).open()
    } catch(e:any) { showToast('❌ ' + e.message) }
    finally { setPayLoading('') }
  }

  const dash = user ? (user.role==='admin' ? '/admin' : user.role==='trainer' ? '/trainer' : '/dashboard') : '/'
  const Tag = ({label}:{label:string}) => (
    <div style={{display:'inline-block',background:'rgba(232,197,71,0.1)',border:'1px solid rgba(232,197,71,0.22)',color:'#e8c547',fontSize:'0.68rem',fontWeight:700,textTransform:'uppercase' as const,letterSpacing:'0.14em',padding:'0.38rem 1rem',borderRadius:'100px',marginBottom:'1.2rem'}}>● {label}</div>
  )

  return (
    <div style={{width:'100%',background:'#0a0a0a',color:'#f0ede8',overflowX:'hidden'}}>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {toast && <div style={{position:'fixed',bottom:'1.5rem',right:'1rem',zIndex:9999,background:'#1e1e1e',border:'1px solid rgba(232,197,71,0.5)',borderRadius:'10px',padding:'0.85rem 1.3rem',fontSize:'0.875rem',maxWidth:'300px',animation:'slideUp 0.3s ease'}}>{toast}</div>}
      {showAuth && <AuthModal defaultTab={authTab} onClose={()=>setShowAuth(false)} onSuccess={handleAuthSuccess}/>}
      {menuOpen && <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:150}} onClick={()=>setMenuOpen(false)}/>}

      {/* ── NAV ── */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:200,height:'68px',background:'rgba(10,10,10,0.96)',backdropFilter:'blur(18px)',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
        <div className="forge-wrap" style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',maxWidth:'1380px',margin:'0 auto',padding:'0 1.5rem'}}>
          <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'1.9rem',letterSpacing:'0.1em',cursor:'pointer',flexShrink:0}} onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>
            FORGE<span style={{color:'#e8c547'}}>.</span>
          </div>
          <div className="forge-nav-links">
            {[['Programs','#programs'],['Trainers','#trainers'],['Pricing','#pricing'],['Results','#results']].map(([l,h])=>(
              <a key={l} href={h} style={{color:'#888880',fontSize:'0.8rem',fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'0.08em',transition:'color 0.2s'}}
                onMouseEnter={e=>(e.target as any).style.color='#f0ede8'} onMouseLeave={e=>(e.target as any).style.color='#888880'}>{l}</a>
            ))}
          </div>
          <div className="forge-nav-btns">
            {user ? (<>
              <span className="nav-greeting" style={{fontSize:'0.8rem',color:'#888880'}}>Hi, {user.fullName?.split(' ')[0]} 👊</span>
              <a href={dash} style={{padding:'0.5rem 1.2rem',background:'#e8c547',borderRadius:'6px',color:'#0a0a0a',fontWeight:700,fontSize:'0.8rem',whiteSpace:'nowrap' as const}}>Dashboard</a>
              <button onClick={handleLogout} style={{padding:'0.5rem 0.9rem',background:'transparent',border:'1px solid rgba(255,255,255,0.15)',color:'#888880',borderRadius:'6px',cursor:'pointer',fontSize:'0.8rem'}}>Logout</button>
            </>) : (<>
              <button onClick={openLogin} className="hide-xs" style={{padding:'0.5rem 1.2rem',background:'transparent',border:'1px solid rgba(255,255,255,0.18)',color:'#f0ede8',borderRadius:'6px',cursor:'pointer',fontSize:'0.8rem'}}>Login</button>
              <button onClick={openSignup} style={{padding:'0.5rem 1.2rem',background:'#e8c547',border:'none',color:'#0a0a0a',borderRadius:'6px',cursor:'pointer',fontSize:'0.8rem',fontWeight:700,whiteSpace:'nowrap' as const}}>Join Now</button>
            </>)}
          </div>
          <button className="forge-hamburger" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?'✕':'☰'}</button>
        </div>
        {menuOpen && (
          <div style={{position:'absolute',top:'68px',left:0,right:0,background:'#111',borderBottom:'1px solid rgba(255,255,255,0.1)',padding:'1rem 1.5rem',zIndex:200,animation:'slideUp 0.2s ease'}}>
            {[['Programs','#programs'],['Trainers','#trainers'],['Pricing','#pricing'],['Results','#results']].map(([l,h])=>(
              <a key={l} href={h} onClick={()=>setMenuOpen(false)} style={{display:'block',padding:'0.75rem 0',color:'#888880',fontSize:'0.9rem',fontWeight:500,borderBottom:'1px solid rgba(255,255,255,0.06)'}}>{l}</a>
            ))}
            <div style={{display:'flex',gap:'0.75rem',marginTop:'1rem'}}>
              {user ? (<>
                <a href={dash} style={{flex:1,padding:'0.7rem',background:'#e8c547',borderRadius:'6px',color:'#0a0a0a',fontWeight:700,fontSize:'0.85rem',textAlign:'center' as const}}>Dashboard</a>
                <button onClick={handleLogout} style={{flex:1,padding:'0.7rem',background:'transparent',border:'1px solid rgba(255,255,255,0.15)',color:'#f0ede8',borderRadius:'6px',cursor:'pointer',fontSize:'0.85rem'}}>Logout</button>
              </>) : (<>
                <button onClick={openLogin} style={{flex:1,padding:'0.7rem',background:'transparent',border:'1px solid rgba(255,255,255,0.18)',color:'#f0ede8',borderRadius:'6px',cursor:'pointer',fontSize:'0.85rem'}}>Login</button>
                <button onClick={openSignup} style={{flex:1,padding:'0.7rem',background:'#e8c547',border:'none',color:'#0a0a0a',borderRadius:'6px',cursor:'pointer',fontSize:'0.85rem',fontWeight:700}}>Join Now</button>
              </>)}
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="forge-hero">
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px)',backgroundSize:'70px 70px',pointerEvents:'none'}}/>
        <div style={{position:'absolute',width:'600px',height:'600px',borderRadius:'50%',top:'-80px',right:'5%',background:'radial-gradient(circle,rgba(232,197,71,0.07) 0%,transparent 68%)',pointerEvents:'none'}}/>
        <div className="forge-hero-left">
          <div style={{display:'flex',alignItems:'center',gap:'0.8rem',marginBottom:'1.4rem'}}>
            <span style={{width:'34px',height:'1px',background:'#e8c547',display:'inline-block',flexShrink:0}}/>
            <span style={{fontSize:'0.68rem',fontWeight:700,textTransform:'uppercase' as const,letterSpacing:'0.22em',color:'#e8c547'}}>Elite Fitness · Jaipur</span>
          </div>
          <h1 style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'clamp(3.5rem,8vw,8.5rem)',lineHeight:0.88,letterSpacing:'0.02em',margin:'0 0 1.5rem',color:'#f0ede8'}}>
            FORGE<br/>YOUR<br/><em style={{color:'#e8c547',fontStyle:'italic',fontFamily:'Georgia,serif'}}>Limits.</em>
          </h1>
          <p style={{fontSize:'clamp(0.9rem,2vw,1.05rem)',color:'#888880',maxWidth:'440px',lineHeight:1.75,marginBottom:'2rem'}}>
            Premium fitness programs, expert coaches, and AI-powered diet plans — engineered around <em style={{color:'#c0b898'}}>your</em> body and goals.
          </p>
          <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap' as const}}>
            <button onClick={openSignup} style={{padding:'0.85rem 2rem',background:'#e8c547',border:'none',color:'#0a0a0a',borderRadius:'8px',cursor:'pointer',fontSize:'0.95rem',fontWeight:700}}>Get Free Plan →</button>
            <button onClick={openLogin} style={{padding:'0.85rem 2rem',background:'transparent',border:'1px solid rgba(255,255,255,0.2)',color:'#f0ede8',borderRadius:'8px',cursor:'pointer',fontSize:'0.95rem'}}>Member Login</button>
          </div>
          <div style={{display:'flex',gap:'2.5rem',marginTop:'3.5rem',paddingTop:'2.5rem',borderTop:'1px solid rgba(255,255,255,0.07)',flexWrap:'wrap' as const}}>
            {[['12K+','Active Members'],['48+','Expert Coaches'],['94%','Goal Achievement']].map(([n,l])=>(
              <div key={l}>
                <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'clamp(1.8rem,4vw,2.8rem)',lineHeight:1,color:'#f0ede8'}}>{n}</div>
                <div style={{fontSize:'0.7rem',color:'#888880',textTransform:'uppercase' as const,letterSpacing:'0.1em',marginTop:'0.3rem'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="forge-hero-right"><div style={{position:'absolute',inset:0}}><Athlete/></div></div>
      </section>

      {/* ── STATS ── */}
      <div style={{width:'100%',background:'#e8c547'}}>
        <div className="forge-wrap" style={{maxWidth:'1380px',margin:'0 auto',padding:'2.2rem 1.5rem',display:'flex',justifyContent:'space-between',flexWrap:'wrap' as const,gap:'1.2rem'}}>
          {[['12,400+','Transformations'],['3M+','Workouts Logged'],['48','Certified Trainers'],['4.9★','Avg Rating'],['₹0','Joining Fee']].map(([n,l])=>(
            <div key={l} style={{textAlign:'center' as const}}>
              <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'clamp(1.8rem,4vw,2.8rem)',color:'#0a0a0a',lineHeight:1}}>{n}</div>
              <div style={{fontSize:'0.68rem',fontWeight:700,textTransform:'uppercase' as const,letterSpacing:'0.12em',color:'rgba(0,0,0,0.48)',marginTop:'0.2rem'}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PROGRAMS ── */}
      <section id="programs" className="forge-sec" style={{background:'#0f0f0f'}}>
        <div className="forge-wrap">
          <div style={{textAlign:'center' as const,marginBottom:'3rem'}}><Tag label="Programs"/>
            <h2 style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'clamp(2rem,5vw,4.5rem)',lineHeight:0.95,color:'#f0ede8',margin:0}}>TRAIN WITH <em style={{color:'#e8c547',fontStyle:'italic',fontFamily:'Georgia,serif'}}>Purpose</em></h2>
            <p style={{color:'#888880',fontSize:'0.95rem',marginTop:'0.6rem'}}>Science-backed programs for every goal — beginner to elite.</p>
          </div>
          <div className="g-programs" style={{background:'rgba(255,255,255,0.06)',borderRadius:'14px',overflow:'hidden'}}>
            {[
              {icon:'🔥',name:'Fat Loss',   dur:'8–12 Wks',lvl:'All Levels',   c:'#e85c3a',desc:'High-intensity HIIT & metabolic conditioning to torch fat fast.'},
              {icon:'💪',name:'Muscle Gain',dur:'12–16 Wks',lvl:'Intermediate',c:'#4a9eff',desc:'Progressive overload hypertrophy with periodized strength blocks.'},
              {icon:'⚡',name:'Strength',   dur:'16 Weeks', lvl:'Advanced',    c:'#e8c547',desc:'Powerlifting-inspired programming to maximize your big 3 lifts.'},
              {icon:'🏃',name:'Endurance',  dur:'10 Weeks', lvl:'All Levels',  c:'#4caf7d',desc:'Build cardiovascular capacity through progressive aerobic blocks.'},
            ].map(p=>(
              <div key={p.name} style={{background:'#141414',padding:'2rem 1.5rem',cursor:'pointer',transition:'background 0.2s'}}
                onMouseEnter={e=>(e.currentTarget.style.background='#1c1c1c')}
                onMouseLeave={e=>(e.currentTarget.style.background='#141414')}>
                <div style={{width:'48px',height:'48px',borderRadius:'12px',background:`${p.c}18`,border:`1px solid ${p.c}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',marginBottom:'1.2rem'}}>{p.icon}</div>
                <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'1.6rem',letterSpacing:'0.04em',marginBottom:'0.5rem'}}>{p.name}</div>
                <div style={{fontSize:'0.85rem',color:'#888880',lineHeight:1.65,marginBottom:'1.2rem'}}>{p.desc}</div>
                <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:'1rem',fontSize:'0.78rem',color:'#888880'}}>
                  <div>Duration: <strong style={{color:'#f0ede8'}}>{p.dur}</strong></div>
                  <div style={{marginTop:'0.25rem'}}>Level: <strong style={{color:p.c}}>{p.lvl}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRAINERS ── */}
      <section id="trainers" className="forge-sec" style={{background:'#0a0a0a'}}>
        <div className="forge-wrap">
          <div style={{marginBottom:'3rem'}}><Tag label="Expert Coaches"/>
            <h2 style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'clamp(2rem,5vw,4.5rem)',lineHeight:0.95,color:'#f0ede8',margin:0}}>COACHED BY <em style={{color:'#e8c547',fontStyle:'italic',fontFamily:'Georgia,serif'}}>The Best</em></h2>
            <p style={{color:'#888880',fontSize:'0.95rem',marginTop:'0.6rem',maxWidth:'480px'}}>Certified professionals with proven track records transforming bodies.</p>
          </div>
          <div className="g-3">
            {[
              {name:'Marcus Webb', spec:'Strength & Conditioning',bio:'Former Olympic powerlifter with 12 years coaching elite athletes across 4 continents.',clients:'340+',exp:'12 Yrs',badge:'Head Coach',  c:'#e8c547',icon:'🏋️'},
              {name:'Priya Sharma',spec:'Diet & Wellness',         bio:'Certified sports nutritionist specializing in body recomposition and metabolic health.',  clients:'520+',exp:'8 Yrs', badge:'Nutrition',    c:'#4caf7d',icon:'🥗'},
              {name:'Jordan Lee',  spec:'HIIT & Endurance',        bio:'Ultra-marathon finisher who helped 400+ clients achieve peak cardiovascular fitness.',      clients:'400+',exp:'9 Yrs', badge:'Cardio Expert',c:'#4a9eff',icon:'🏃'},
            ].map(t=>(
              <div key={t.name} style={{background:'#141414',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',overflow:'hidden',transition:'transform 0.25s,border-color 0.25s',cursor:'pointer'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.borderColor='rgba(255,255,255,0.14)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'}}>
                <div style={{height:'180px',background:`linear-gradient(135deg,${t.c}20,#111 80%)`,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                  <div style={{fontSize:'4rem'}}>{t.icon}</div>
                  <div style={{position:'absolute',top:'1rem',left:'1rem',background:t.c,color:'#0a0a0a',fontSize:'0.65rem',fontWeight:700,textTransform:'uppercase' as const,letterSpacing:'0.08em',padding:'0.25rem 0.7rem',borderRadius:'100px'}}>{t.badge}</div>
                </div>
                <div style={{padding:'1.3rem'}}>
                  <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'1.4rem',letterSpacing:'0.04em'}}>{t.name}</div>
                  <div style={{fontSize:'0.73rem',color:t.c,textTransform:'uppercase' as const,letterSpacing:'0.1em',margin:'0.2rem 0 0.75rem'}}>{t.spec}</div>
                  <div style={{fontSize:'0.84rem',color:'#888880',lineHeight:1.65}}>{t.bio}</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1px',background:'rgba(255,255,255,0.06)',marginTop:'1rem',borderRadius:'7px',overflow:'hidden'}}>
                    {[[t.clients,'Clients'],[t.exp,'Experience']].map(([v,l])=>(
                      <div key={String(l)} style={{background:'#141414',padding:'0.75rem 0.9rem'}}>
                        <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'1.3rem',color:'#f0ede8'}}>{v}</div>
                        <div style={{fontSize:'0.68rem',color:'#888880',textTransform:'uppercase' as const,letterSpacing:'0.06em'}}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="forge-sec" style={{background:'#0d0d0d'}}>
        <div className="forge-wrap">
          <div style={{textAlign:'center' as const,marginBottom:'3rem'}}><Tag label="Membership Plans"/>
            <h2 style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'clamp(2rem,5vw,4.5rem)',lineHeight:0.95,color:'#f0ede8',margin:0}}>SIMPLE <em style={{color:'#e8c547',fontStyle:'italic',fontFamily:'Georgia,serif'}}>Pricing</em></h2>
            <p style={{color:'#888880',fontSize:'0.95rem',marginTop:'0.6rem'}}>No hidden fees. Cancel anytime. Full platform access.</p>
          </div>
          <div className="g-pricing">
            {[
              {plan:'standard',name:'Standard',price:'1,999',features:['Full gym access','Basic workout plans','Diet chart','Progress tracking','Email support'],c:'#4caf7d',popular:false},
              {plan:'pro',name:'Pro',price:'3,499',features:['Everything in Standard','Personalised coach','Custom diet plans','Weekly check-ins','Priority support','Workout library'],c:'#e8c547',popular:true},
              {plan:'elite',name:'Elite',price:'5,999',features:['Everything in Pro','1-on-1 coach sessions','Meal prep service','Body composition scans','Supplement guidance','24/7 WhatsApp'],c:'#4a9eff',popular:false},
            ].map(p=>(
              <div key={p.plan} style={{background:p.popular?'rgba(232,197,71,0.05)':'#141414',border:`1px solid ${p.popular?'rgba(232,197,71,0.32)':'rgba(255,255,255,0.07)'}`,borderRadius:'16px',padding:'2.2rem 1.75rem',position:'relative' as const,display:'flex',flexDirection:'column' as const}}>
                {p.popular && <div style={{position:'absolute' as const,top:'-13px',left:'50%',transform:'translateX(-50%)',background:'#e8c547',color:'#0a0a0a',fontSize:'0.65rem',fontWeight:700,textTransform:'uppercase' as const,letterSpacing:'0.1em',padding:'0.28rem 1rem',borderRadius:'100px',whiteSpace:'nowrap' as const}}>Most Popular</div>}
                <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'1.4rem',letterSpacing:'0.08em',color:p.c,marginBottom:'0.4rem'}}>{p.name}</div>
                <div style={{display:'flex',alignItems:'baseline',gap:'0.2rem',marginBottom:'1.6rem'}}>
                  <span style={{fontSize:'0.9rem',color:'#888880'}}>₹</span>
                  <span style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'3.2rem',color:'#f0ede8',lineHeight:1}}>{p.price}</span>
                  <span style={{fontSize:'0.82rem',color:'#888880'}}>/mo</span>
                </div>
                <div style={{display:'flex',flexDirection:'column' as const,gap:'0.6rem',marginBottom:'1.8rem',flex:1}}>
                  {p.features.map(f=><div key={f} style={{display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'0.84rem',color:'#c0bcb5'}}><span style={{color:p.c,flexShrink:0}}>✓</span>{f}</div>)}
                </div>
                <button onClick={()=>handleBuyPlan(p.plan)} disabled={payLoading===p.plan}
                  style={{width:'100%',padding:'0.88rem',background:p.popular?'#e8c547':'transparent',border:`1px solid ${p.popular?'#e8c547':p.c}`,color:p.popular?'#0a0a0a':p.c,borderRadius:'8px',cursor:'pointer',fontSize:'0.9rem',fontWeight:700,transition:'all 0.2s',opacity:payLoading===p.plan?0.7:1}}
                  onMouseEnter={e=>{if(!p.popular){(e.currentTarget as any).style.background=p.c;(e.currentTarget as any).style.color='#0a0a0a'}}}
                  onMouseLeave={e=>{if(!p.popular){(e.currentTarget as any).style.background='transparent';(e.currentTarget as any).style.color=p.c}}}>
                  {payLoading===p.plan?'Processing...':user?`Buy ${p.name} →`:'Login to Purchase →'}
                </button>
              </div>
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'center',gap:'1.5rem',marginTop:'2rem',flexWrap:'wrap' as const}}>
            {[['🔒','256-bit SSL'],['💳','UPI · Cards · EMI'],['↩️','7-day refund'],['⚡','Razorpay']].map(([i,l])=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.78rem',color:'#888880'}}><span>{i}</span>{l}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="results" className="forge-sec" style={{background:'#0a0a0a'}}>
        <div className="forge-wrap">
          <div style={{textAlign:'center' as const,marginBottom:'3rem'}}><Tag label="Results"/>
            <h2 style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'clamp(2rem,5vw,4.5rem)',lineHeight:0.95,color:'#f0ede8',margin:0}}>REAL <em style={{color:'#e8c547',fontStyle:'italic',fontFamily:'Georgia,serif'}}>Transformations</em></h2>
          </div>
          <div className="g-3">
            {[
              {text:"Lost 18kg in 4 months. The personalized diet chart and weekly check-ins made all the difference. FORGE actually worked.",name:'Rahul Kapoor',goal:'Fat Loss · -18kg',av:'RK',ac:'#e8c547',chg:'-18 kg',cc:'#4caf7d',feat:false},
              {text:"Gained 6kg of lean muscle in 5 months. Coach Marcus is a genius — the PPL programming is unlike anything I've seen.",name:'Aditya Singh',goal:'Muscle Gain · +6kg',av:'AS',ac:'#4a9eff',chg:'+6 kg',cc:'#4a9eff',feat:false},
              {text:"The vegan diet plan was incredible. As someone who struggled with plant-based options, FORGE completely solved my nutrition.",name:'Neha Patel',goal:'Strength · Vegan',av:'NP',ac:'#4caf7d',chg:'+15 kg',cc:'#e8c547',feat:false},
            ].map(t=>(
              <div key={t.name} style={{background:t.feat?'rgba(232,197,71,0.05)':'#141414',border:`1px solid ${t.feat?'rgba(232,197,71,0.2)':'rgba(255,255,255,0.07)'}`,borderRadius:'14px',padding:'1.8rem',position:'relative' as const,overflow:'hidden'}}>
                <div style={{position:'absolute' as const,top:'0.5rem',right:'1rem',fontSize:'4rem',color:'rgba(255,255,255,0.025)',fontFamily:'Georgia,serif',lineHeight:1,userSelect:'none' as const}}>"</div>
                <div style={{color:'#e8c547',letterSpacing:'3px',marginBottom:'0.75rem',fontSize:'0.85rem'}}>★★★★★</div>
                <p style={{fontSize:'0.9rem',lineHeight:1.8,color:'#d0ccc5',marginBottom:'1.2rem'}}>"{t.text}"</p>
                <div style={{display:'inline-block',background:'rgba(76,175,125,0.1)',border:'1px solid rgba(76,175,125,0.2)',color:t.cc,fontSize:'0.72rem',fontWeight:700,padding:'0.25rem 0.75rem',borderRadius:'100px',marginBottom:'1rem'}}>Result: {t.chg}</div>
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem',paddingTop:'0.9rem',borderTop:'1px solid rgba(255,255,255,0.07)'}}>
                  <div style={{width:'38px',height:'38px',borderRadius:'50%',background:`${t.ac}22`,border:`2px solid ${t.ac}55`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.8rem',color:t.ac,flexShrink:0}}>{t.av}</div>
                  <div>
                    <div style={{fontWeight:600,fontSize:'0.875rem',color:'#f0ede8'}}>{t.name}</div>
                    <div style={{fontSize:'0.74rem',color:'#888880',marginTop:'0.1rem'}}>{t.goal}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{width:'100%',background:'#e8c547'}}>
        <div className="cta-row forge-wrap" style={{maxWidth:'1380px',margin:'0 auto',padding:'4rem 1.5rem'}}>
          <div>
            <h2 style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'clamp(1.8rem,4.5vw,3.5rem)',color:'#0a0a0a',margin:0,lineHeight:0.95}}>READY TO TRANSFORM<br/>YOUR BODY?</h2>
            <p style={{color:'rgba(0,0,0,0.52)',fontSize:'0.95rem',marginTop:'0.8rem'}}>Join 12,000+ members. Get your free plan today.</p>
          </div>
          <div style={{display:'flex',gap:'1rem',flexWrap:'wrap' as const}}>
            <button onClick={openSignup} style={{padding:'0.95rem 2.2rem',background:'#0a0a0a',border:'none',color:'#e8c547',borderRadius:'8px',cursor:'pointer',fontSize:'0.95rem',fontWeight:700,whiteSpace:'nowrap' as const}}>Start Free →</button>
            <a href="#pricing" style={{padding:'0.95rem 2.2rem',background:'transparent',border:'2px solid rgba(0,0,0,0.22)',color:'#0a0a0a',borderRadius:'8px',fontSize:'0.95rem',fontWeight:600,textDecoration:'none',whiteSpace:'nowrap' as const,display:'inline-block'}}>View Plans</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{width:'100%',background:'#080808',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
        <div className="forge-wrap" style={{maxWidth:'1380px',margin:'0 auto',padding:'4.5rem 1.5rem 2.5rem'}}>
          <div className="g-footer">
            <div>
              <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'2rem',letterSpacing:'0.1em',marginBottom:'0.8rem'}}>FORGE<span style={{color:'#e8c547'}}>.</span></div>
              <p style={{fontSize:'0.875rem',color:'#555550',lineHeight:1.75,maxWidth:'270px'}}>Elite fitness programs, expert coaching, and AI-powered nutrition — engineered for results. Jaipur, India.</p>
              <div style={{display:'flex',gap:'0.6rem',marginTop:'1.4rem'}}>
                {['📘','📸','🐦','▶️'].map((ico,i)=>(
                  <div key={i} style={{width:'34px',height:'34px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'0.9rem'}}>{ico}</div>
                ))}
              </div>
            </div>
            {[
              {title:'Programs', links:['Fat Loss','Muscle Gain','Strength Training','Endurance','Body Recomp']},
              {title:'Platform',  links:['Member Login','Free Assessment','Pricing Plans','Admin Panel','Trainer Panel']},
              {title:'Company',   links:['About FORGE','Our Trainers','Success Stories','Contact Us','Privacy Policy']},
            ].map(col=>(
              <div key={col.title}>
                <div style={{fontSize:'0.68rem',textTransform:'uppercase' as const,letterSpacing:'0.14em',color:'#444440',marginBottom:'1.1rem',fontWeight:700}}>{col.title}</div>
                {col.links.map(l=>(
                  <div key={l} style={{color:'#555550',fontSize:'0.875rem',padding:'0.28rem 0',cursor:'pointer',transition:'color 0.2s'}}
                    onMouseEnter={e=>(e.target as any).style.color='#f0ede8'} onMouseLeave={e=>(e.target as any).style.color='#555550'}>{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div className="footer-bottom" style={{paddingTop:'1.8rem',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
            <span style={{fontSize:'0.78rem',color:'#333330'}}>© 2026 FORGE Fitness Pvt. Ltd. · All rights reserved</span>
            <div style={{display:'flex',gap:'1.5rem',flexWrap:'wrap' as const}}>
              {['Terms','Privacy','Refund Policy'].map(l=>(
                <span key={l} style={{fontSize:'0.78rem',color:'#333330',cursor:'pointer'}}
                  onMouseEnter={e=>(e.target as any).style.color='#888880'} onMouseLeave={e=>(e.target as any).style.color='#333330'}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
