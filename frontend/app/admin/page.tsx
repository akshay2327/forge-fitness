'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, getUser, clearSession } from '@/lib/api'
const A='#e8c547',C='#1a1a1a',D='rgba(255,255,255,0.08)'
const API_BASE=process.env.NEXT_PUBLIC_API_URL||'http://localhost:5001/api/v1'

function Badge({type}:{type:string}){
  const m:any={active:['rgba(76,175,125,0.15)','#4caf7d'],suspended:['rgba(232,92,58,0.15)','#e85c3a'],inactive:['rgba(136,136,128,0.15)','#888880'],admin:['rgba(74,158,255,0.15)','#4a9eff'],member:['rgba(76,175,125,0.12)','#4caf7d'],trainer:['rgba(232,197,71,0.12)',A],free:['rgba(136,136,128,0.1)','#888880'],standard:['rgba(76,175,125,0.15)','#4caf7d'],pro:['rgba(232,197,71,0.15)',A],elite:['rgba(74,158,255,0.15)','#4a9eff']}
  const [bg,c]=m[type?.toLowerCase()]||['rgba(136,136,128,0.1)','#888880']
  return <span style={{background:bg,color:c,fontSize:'0.7rem',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'0.06em',padding:'0.2rem 0.6rem',borderRadius:'100px'}}>{type}</span>
}

function SLink({icon,label,active,onClick}:any){
  return <div onClick={onClick} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.7rem 0.9rem',borderRadius:'8px',cursor:'pointer',background:active?'rgba(232,197,71,0.1)':'transparent',color:active?'#f0ede8':'#888880',fontSize:'0.875rem',fontWeight:500,transition:'all 0.2s',marginBottom:'2px'}}
    onMouseEnter={e=>{if(!active)(e.currentTarget as any).style.background='rgba(255,255,255,0.04)'}}
    onMouseLeave={e=>{if(!active)(e.currentTarget as any).style.background='transparent'}}>
    <span style={{fontSize:'1rem',width:'1.2rem',textAlign:'center' as const}}>{icon}</span>{label}
  </div>
}

function AssignPlanModal({member,onClose,onSuccess,token}:any){
  const [planType,setPlanType]=useState<'diet'|'workout'>('workout')
  const [saving,setSaving]=useState(false), [msg,setMsg]=useState('')
  const [wf,setWf]=useState({title:'PPL Hypertrophy 12-Week',goal:'muscle-gain',level:'intermediate',durationWeeks:12,days:[
    {dayOfWeek:1,name:'Push A',type:'strength',durationMinutes:70,exercises:[{name:'Bench Press',sets:4,reps:'6-8',restSeconds:180},{name:'Overhead Press',sets:4,reps:'8-10',restSeconds:150},{name:'Lateral Raises',sets:4,reps:'15-20',restSeconds:90},{name:'Tricep Pushdown',sets:3,reps:'12-15',restSeconds:90}]},
    {dayOfWeek:2,name:'Pull A',type:'strength',durationMinutes:65,exercises:[{name:'Deadlift',sets:4,reps:'5',restSeconds:240},{name:'Barbell Row',sets:4,reps:'8-10',restSeconds:150},{name:'Pull-ups',sets:3,reps:'8-12',restSeconds:120},{name:'Bicep Curls',sets:3,reps:'12-15',restSeconds:90}]},
    {dayOfWeek:3,name:'Legs A',type:'strength',durationMinutes:80,exercises:[{name:'Back Squat',sets:4,reps:'6-8',restSeconds:240},{name:'Romanian Deadlift',sets:3,reps:'10-12',restSeconds:150},{name:'Leg Press',sets:3,reps:'12-15',restSeconds:120},{name:'Calf Raises',sets:4,reps:'15-20',restSeconds:60}]},
    {dayOfWeek:5,name:'Rest',type:'rest',durationMinutes:0,exercises:[]},
  ]})
  const [df,setDf]=useState({title:'Muscle Gain Diet',goal:'muscle-gain',dietPreference:'non-veg',targetCalories:3000,targetProtein:160,targetCarbs:320,targetFat:80,hydrationLiters:4,supplements:['Whey Protein 30g post-workout','Creatine 5g daily'],notes:'Eat within 30 min post-workout.',meals:[
    {type:'breakfast',time:'7:30 AM',totalCalories:560,items:[{name:'Oats with Milk',quantity:'80g+200ml',calories:320,protein:18,carbs:58,fat:9},{name:'Boiled Eggs',quantity:'3 whole',calories:210,protein:19,carbs:2,fat:14}]},
    {type:'lunch',time:'1:00 PM',totalCalories:660,items:[{name:'Chicken Breast',quantity:'200g',calories:330,protein:62,carbs:0,fat:7},{name:'Brown Rice',quantity:'150g',calories:200,protein:4,carbs:44,fat:1}]},
    {type:'dinner',time:'8:00 PM',totalCalories:686,items:[{name:'Salmon',quantity:'180g',calories:374,protein:46,carbs:0,fat:20},{name:'Sweet Potato',quantity:'200g',calories:172,protein:3,carbs:40,fat:0}]},
  ]})

  const inp:any={width:'100%',background:'#111',border:`1px solid ${D}`,color:'#f0ede8',padding:'0.7rem 1rem',borderRadius:'8px',fontSize:'0.875rem',outline:'none',fontFamily:'inherit'}
  const lbl:any={fontSize:'0.72rem',color:'#888880',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:'0.3rem'}

  const handleAssign=async()=>{
    setSaving(true)
    try {
      const body=planType==='workout'?{...wf,userId:member._id}:{...df,userId:member._id}
      const res=await fetch(`${API_BASE}/${planType==='workout'?'workouts':'diet'}`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(body)})
      const data=await res.json(); if(!res.ok) throw new Error(data.error)
      setMsg(`✅ ${planType==='workout'?'Workout':'Diet'} plan assigned to ${member.fullName}!`)
      setTimeout(()=>{onSuccess();onClose()},1500)
    } catch(e:any){setMsg('❌ '+e.message)}
    setSaving(false)
  }

  return <div style={{position:'fixed' as const,inset:0,zIndex:1000,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
    <div style={{background:'#181818',border:`1px solid ${D}`,borderRadius:'16px',width:'100%',maxWidth:'560px',maxHeight:'90vh',overflowY:'auto' as const,position:'relative' as const}}>
      <button onClick={onClose} style={{position:'absolute' as const,top:'1rem',right:'1rem',background:'rgba(255,255,255,0.07)',border:'none',color:'#888880',width:'30px',height:'30px',borderRadius:'50%',cursor:'pointer',fontSize:'1rem'}}>✕</button>
      <div style={{padding:'2rem'}}>
        {msg&&<div style={{background:msg.startsWith('✅')?'rgba(76,175,125,0.1)':'rgba(232,92,58,0.1)',border:`1px solid ${msg.startsWith('✅')?'rgba(76,175,125,0.3)':'rgba(232,92,58,0.3)'}`,color:msg.startsWith('✅')?'#4caf7d':'#e85c3a',padding:'0.7rem 1rem',borderRadius:'8px',marginBottom:'1rem',fontSize:'0.85rem'}}>{msg}</div>}
        <h3 style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'1.6rem',letterSpacing:'0.04em',marginBottom:'0.4rem'}}>Assign Plan</h3>
        <div style={{fontSize:'0.85rem',color:'#888880',marginBottom:'1.5rem'}}>Member: <strong style={{color:'#f0ede8'}}>{member.fullName}</strong> · {member.memberId}</div>
        <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.5rem'}}>
          {(['workout','diet'] as const).map(t=>(
            <button key={t} onClick={()=>setPlanType(t)} style={{padding:'0.5rem 1.2rem',background:planType===t?A:C,border:`1px solid ${planType===t?A:D}`,color:planType===t?'#0a0a0a':'#888880',borderRadius:'100px',cursor:'pointer',fontSize:'0.8rem',fontWeight:planType===t?700:400,fontFamily:'inherit'}}>
              {t==='workout'?'⚡ Workout':'🥗 Diet'} Plan
            </button>
          ))}
        </div>
        {planType==='workout'&&<div style={{display:'flex',flexDirection:'column' as const,gap:'0.75rem'}}>
          <div><label style={lbl}>Plan Title</label><input style={inp} value={wf.title} onChange={e=>setWf({...wf,title:e.target.value})}/></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.75rem'}}>
            <div><label style={lbl}>Goal</label><select style={{...inp}} value={wf.goal} onChange={e=>setWf({...wf,goal:e.target.value})}><option value="fat-loss">Fat Loss</option><option value="muscle-gain">Muscle Gain</option><option value="strength">Strength</option><option value="endurance">Endurance</option></select></div>
            <div><label style={lbl}>Level</label><select style={{...inp}} value={wf.level} onChange={e=>setWf({...wf,level:e.target.value})}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
            <div><label style={lbl}>Weeks</label><input style={inp} type="number" value={wf.durationWeeks} onChange={e=>setWf({...wf,durationWeeks:parseInt(e.target.value)})}/></div>
          </div>
          <div style={{background:'#111',borderRadius:'8px',padding:'0.8rem 1rem',fontSize:'0.82rem',color:'#888880'}}>✅ Pre-loaded PPL template · {wf.days.filter(d=>d.type!=='rest').length} workout days</div>
        </div>}
        {planType==='diet'&&<div style={{display:'flex',flexDirection:'column' as const,gap:'0.75rem'}}>
          <div><label style={lbl}>Plan Title</label><input style={inp} value={df.title} onChange={e=>setDf({...df,title:e.target.value})}/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
            {[['targetCalories','Calories'],['targetProtein','Protein (g)'],['targetCarbs','Carbs (g)'],['targetFat','Fat (g)']].map(([k,l])=>(
              <div key={k}><label style={lbl}>{l}</label><input style={inp} type="number" value={(df as any)[k]} onChange={e=>setDf({...df,[k]:parseInt(e.target.value)})}/></div>
            ))}
          </div>
          <div><label style={lbl}>Notes</label><input style={inp} value={df.notes} onChange={e=>setDf({...df,notes:e.target.value})}/></div>
          <div style={{background:'#111',borderRadius:'8px',padding:'0.8rem 1rem',fontSize:'0.82rem',color:'#888880'}}>✅ Pre-loaded 3-meal template · {df.meals.length} meals</div>
        </div>}
        <div style={{display:'flex',gap:'1rem',marginTop:'1.5rem',flexWrap:'wrap' as const}}>
          <button onClick={handleAssign} disabled={saving} style={{padding:'0.85rem 1.8rem',background:A,border:'none',color:'#0a0a0a',borderRadius:'8px',cursor:'pointer',fontSize:'0.9rem',fontWeight:700,fontFamily:'inherit',opacity:saving?0.7:1}}>
            {saving?'Assigning...':`Assign ${planType==='workout'?'Workout':'Diet'} Plan →`}
          </button>
          <button onClick={onClose} style={{padding:'0.85rem 1.8rem',background:'transparent',border:`1px solid ${D}`,color:'#f0ede8',borderRadius:'8px',cursor:'pointer',fontSize:'0.9rem',fontFamily:'inherit'}}>Cancel</button>
        </div>
      </div>
    </div>
  </div>
}

export default function AdminPage(){
  const router=useRouter()
  const [user,setUser]=useState<any>(null), [tab,setTab]=useState('dashboard')
  const [stats,setStats]=useState<any>(null), [members,setMembers]=useState<any[]>([])
  const [trainers,setTrainers]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [searchInput,setSearchInput]=useState(''), [search,setSearch]=useState('')
  const [selected,setSelected]=useState<any>(null), [selectedDetail,setSelectedDetail]=useState<any>(null)
  const [assignModal,setAssignModal]=useState<any>(null)
  const [toast,setToast]=useState(''), [toastOk,setToastOk]=useState(true)
  const [sidebarOpen,setSidebarOpen]=useState(false)
  const [settingsSaving,setSettingsSaving]=useState(false)
  const [gymSettings,setGymSettings]=useState({gymName:'FORGE Fitness',location:'Jaipur, Rajasthan',email:'admin@forgefitness.com',phone:'+91 98765 43210',gst:'27AABCU9603R1Z1',pricingStandard:'1999',pricingPro:'3499',pricingElite:'5999',trialDays:'7',refundDays:'7'})
  const token=typeof window!=='undefined'?localStorage.getItem('forge_token')||'':''

  useEffect(()=>{
    const u=getUser(); if(!u){router.push('/');return}
    if(u.role!=='admin'){router.push(u.role==='trainer'?'/trainer':'/dashboard');return}
    setUser(u); loadAll()
  },[])

  useEffect(()=>{const t=setTimeout(()=>setSearch(searchInput),400);return()=>clearTimeout(t)},[searchInput])

  const loadAll=async()=>{
    setLoading(true)
    try {
      const [s,m,t,gs]=await Promise.allSettled([api.get('/admin/dashboard'),api.get('/admin/members?limit=100'),api.get('/admin/trainers'),api.get('/admin/settings')])
      if(s.status==='fulfilled') setStats(s.value.stats)
      if(m.status==='fulfilled') setMembers(m.value.members||[])
      if(t.status==='fulfilled') setTrainers(t.value.trainers||[])
      if(gs.status==='fulfilled'&&gs.value.settings) setGymSettings(prev=>({...prev,...gs.value.settings}))
    } catch(e){console.error(e)}
    setLoading(false)
  }

  const showToast=(msg:string,type:'ok'|'err'='ok')=>{setToast(msg);setToastOk(type==='ok');setTimeout(()=>setToast(''),4000)}
  const handleLogout=()=>{clearSession();router.push('/')}

  const handleSuspend=async(id:string,isActive:boolean)=>{
    try{const res=await api.post(`/admin/members/${id}/suspend`,{});showToast(res.message);loadAll();if(selected?._id===id) setSelected({...selected,isActive:!isActive})}
    catch(e:any){showToast('❌ '+e.message,'err')}
  }
  const handleAssignTrainer=async(memberId:string,trainerId:string)=>{
    try{await api.post(`/admin/members/${memberId}/assign-trainer`,{trainerId});showToast('✅ Trainer assigned!')}
    catch(e:any){showToast('❌ '+e.message,'err')}
  }
  const loadMemberDetail=async(id:string)=>{
    try{const d=await api.get(`/admin/members/${id}`);setSelectedDetail(d)}
    catch(e:any){showToast('❌ '+e.message,'err')}
  }

  const handleSaveSettings=async(section:'gym'|'pricing')=>{
    setSettingsSaving(true)
    try {
      const body = section==='gym'
        ? {gymName:gymSettings.gymName,location:gymSettings.location,email:gymSettings.email,phone:gymSettings.phone,gst:gymSettings.gst}
        : {pricingStandard:gymSettings.pricingStandard,pricingPro:gymSettings.pricingPro,pricingElite:gymSettings.pricingElite,trialDays:gymSettings.trialDays,refundDays:gymSettings.refundDays}
      const res = await api.patch('/admin/settings', body)
      showToast(res.message || '✅ Settings saved!')
    } catch(e:any){showToast('❌ '+e.message,'err')}
    setSettingsSaving(false)
  }

  const filtered=members.filter(m=>!search||m.fullName?.toLowerCase().includes(search.toLowerCase())||m.email?.toLowerCase().includes(search.toLowerCase())||m.memberId?.toLowerCase().includes(search.toLowerCase()))

  const card:any={background:C,border:`1px solid ${D}`,borderRadius:'12px',padding:'1.5rem',marginBottom:'1rem'}
  const inp:any={width:'100%',background:'#111',border:`1px solid ${D}`,color:'#f0ede8',padding:'0.75rem 1rem',borderRadius:'8px',fontSize:'0.875rem',outline:'none',fontFamily:'inherit'}
  const sel:any={width:'100%',background:'#111',border:`1px solid ${D}`,color:'#f0ede8',padding:'0.75rem 1rem',borderRadius:'8px',fontSize:'0.875rem',outline:'none',fontFamily:'inherit'}
  const btn:any={padding:'0.65rem 1.3rem',background:A,border:'none',color:'#0a0a0a',borderRadius:'7px',cursor:'pointer',fontSize:'0.82rem',fontWeight:700,fontFamily:'inherit'}
  const ghost:any={padding:'0.65rem 1.3rem',background:'transparent',border:`1px solid ${D}`,color:'#f0ede8',borderRadius:'7px',cursor:'pointer',fontSize:'0.82rem',fontFamily:'inherit'}
  const danger:any={padding:'0.65rem 1.3rem',background:'rgba(232,92,58,0.15)',border:'1px solid rgba(232,92,58,0.3)',color:'#e85c3a',borderRadius:'7px',cursor:'pointer',fontSize:'0.82rem',fontFamily:'inherit'}

  if(loading) return <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'DM Sans,sans-serif',color:'#f0ede8',flexDirection:'column' as const,gap:'1rem'}}>
    <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'2.5rem',letterSpacing:'0.08em'}}>FORGE<span style={{color:A}}>.</span></div>
    <div style={{color:'#888880',fontSize:'0.875rem'}}>Loading admin panel...</div>
    <div style={{width:'36px',height:'36px',border:'3px solid rgba(255,255,255,0.1)',borderTopColor:A,borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
  </div>

  return <div className="forge-dash">
    <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    {toast&&<div style={{position:'fixed',bottom:'1.5rem',right:'1rem',zIndex:9999,background:'#1e1e1e',border:`1px solid ${toastOk?'rgba(76,175,125,0.5)':'rgba(232,92,58,0.5)'}`,borderRadius:'10px',padding:'0.9rem 1.4rem',color:'#f0ede8',fontSize:'0.875rem',maxWidth:'320px',animation:'slideUp 0.3s ease'}}>{toast}</div>}
    {assignModal&&<AssignPlanModal member={assignModal} token={token} onClose={()=>setAssignModal(null)} onSuccess={()=>{showToast('✅ Plan assigned!');loadAll()}}/>}
    {sidebarOpen&&<div className="forge-overlay show" onClick={()=>setSidebarOpen(false)}/>}
    <button className="forge-mob-btn" onClick={()=>setSidebarOpen(!sidebarOpen)}>☰</button>

    {/* Sidebar */}
    <aside className={`forge-sidebar${sidebarOpen?' open':''}`}>
      <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'1.8rem',letterSpacing:'0.08em',marginBottom:'0.3rem',cursor:'pointer'}} onClick={()=>router.push('/')}>FORGE<span style={{color:A}}>.</span></div>
      <div style={{fontSize:'0.7rem',color:'#e85c3a',textTransform:'uppercase' as const,letterSpacing:'0.12em',marginBottom:'2rem',fontWeight:700}}>Admin Panel</div>
      <nav style={{flex:1}}>
        {[{icon:'📊',label:'Dashboard',key:'dashboard'},{icon:'👥',label:'Members',key:'members'},{icon:'🏋️',label:'Trainers',key:'trainers'},{icon:'📋',label:'Assign Plans',key:'plans'},{icon:'⚙️',label:'Settings',key:'settings'}].map(l=>(
          <SLink key={l.key} icon={l.icon} label={l.label} active={tab===l.key} onClick={()=>{setTab(l.key);setSelected(null);setSelectedDetail(null);setSidebarOpen(false)}}/>
        ))}
      </nav>
      <div style={{borderTop:`1px solid ${D}`,paddingTop:'1rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.75rem'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#e85c3a,#c8342a)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.75rem',color:'#fff',flexShrink:0}}>AD</div>
          <div><div style={{fontSize:'0.875rem',fontWeight:500}}>Admin</div><div style={{fontSize:'0.72rem',color:'#e85c3a'}}>Super Admin</div></div>
        </div>
        <button onClick={handleLogout} style={{...ghost,width:'100%',fontSize:'0.8rem',padding:'0.5rem',textAlign:'center' as const}}>Logout</button>
      </div>
    </aside>

    {/* Main */}
    <main className="forge-main">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'2rem',flexWrap:'wrap' as const,gap:'1rem'}}>
        <div>
          <h1 style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'1.9rem',letterSpacing:'0.04em',margin:0}}>
            {tab==='dashboard'?'Dashboard':tab==='members'?'Members':tab==='trainers'?'Trainers':tab==='plans'?'Assign Plans':'Settings'}
          </h1>
          <div style={{fontSize:'0.78rem',color:'#888880',marginTop:'0.2rem'}}>FORGE Fitness Admin · {new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
        </div>
        <div style={{display:'flex',gap:'0.6rem'}}>
          <button onClick={loadAll} style={{...ghost,fontSize:'0.78rem',padding:'0.5rem 0.9rem'}}>↺ Refresh</button>
          <button onClick={()=>router.push('/')} style={{...ghost,fontSize:'0.78rem',padding:'0.5rem 0.9rem'}}>← Site</button>
        </div>
      </div>

      {/* ── DASHBOARD ── */}
      {tab==='dashboard'&&<div>
        <div className="g-stats4" style={{marginBottom:'1.5rem'}}>
          {[{label:'Total Members',value:stats?.total||0,icon:'👥',c:'#4a9eff'},{label:'Active Members',value:stats?.active||0,icon:'✅',c:'#4caf7d'},{label:'New This Month',value:stats?.newMonth||0,icon:'🆕',c:A},{label:'Trainers',value:stats?.trainers||trainers.length,icon:'🏋️',c:'#e85c3a'}].map(s=>(
            <div key={s.label} style={{background:C,border:`1px solid ${D}`,borderRadius:'12px',padding:'1.2rem 1.4rem'}}>
              <div style={{fontSize:'0.72rem',color:'#888880',textTransform:'uppercase' as const,letterSpacing:'0.08em',marginBottom:'0.5rem'}}>{s.label}</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'2.6rem',lineHeight:1,color:s.c}}>{s.value}</div>
                <div style={{fontSize:'2rem',opacity:0.7}}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="g-2" style={{gap:'1rem'}}>
          <div style={card}>
            <div style={{fontWeight:500,marginBottom:'1rem'}}>Membership Breakdown</div>
            {[['free','#888880'],['standard','#4caf7d'],['pro',A],['elite','#4a9eff']].map(([plan,c])=>{
              const count=members.filter(m=>m.membership?.plan===plan||(!m.membership?.plan&&plan==='free')).length
              const pct=members.length?Math.round((count/members.length)*100):0
              return <div key={plan} style={{marginBottom:'0.8rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.8rem',marginBottom:'0.3rem'}}>
                  <span style={{textTransform:'capitalize' as const,color:'#f0ede8'}}>{plan}</span>
                  <span style={{color:'#888880'}}>{count} ({pct}%)</span>
                </div>
                <div style={{height:'5px',background:'rgba(255,255,255,0.07)',borderRadius:'3px',overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${pct}%`,background:c,borderRadius:'3px',transition:'width 0.6s'}}/>
                </div>
              </div>
            })}
          </div>
          <div style={card}>
            <div style={{fontWeight:500,marginBottom:'1rem'}}>Recent Members</div>
            {members.slice(0,5).map(m=>(
              <div key={m._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.5rem 0',borderBottom:`1px solid ${D}`,cursor:'pointer'}}
                onClick={()=>{setSelected(m);loadMemberDetail(m._id);setTab('members')}}>
                <div><div style={{fontSize:'0.875rem',fontWeight:500}}>{m.fullName}</div><div style={{fontSize:'0.75rem',color:'#888880'}}>{m.memberId}</div></div>
                <Badge type={m.membership?.plan||'free'}/>
              </div>
            ))}
          </div>
        </div>
      </div>}

      {/* ── MEMBERS LIST ── */}
      {tab==='members'&&!selected&&<div>
        <div style={{display:'flex',gap:'1rem',marginBottom:'1.5rem',flexWrap:'wrap' as const}}>
          <input style={{...inp,flex:'1 1 200px'}} type="text" placeholder="🔍 Search name, email or ID..." value={searchInput} onChange={e=>setSearchInput(e.target.value)}/>
          <button style={btn} onClick={loadAll}>↺ Refresh</button>
        </div>
        <div style={card}>
          <div className="t-scroll">
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.875rem',minWidth:'600px'}}>
              <thead><tr style={{borderBottom:`1px solid ${D}`}}>{['ID','Name','Email','Plan','Status','Role','Actions'].map(h=><th key={h} style={{textAlign:'left' as const,padding:'0.5rem 0.75rem',color:'#888880',fontSize:'0.7rem',textTransform:'uppercase' as const,letterSpacing:'0.04em',fontWeight:500}}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.length===0?<tr><td colSpan={7} style={{padding:'3rem',textAlign:'center' as const,color:'#888880'}}>{search?`No results for "${search}"`:'No members found'}</td></tr>:filtered.map(m=>(
                  <tr key={m._id} style={{borderBottom:`1px solid ${D}`}}>
                    <td style={{padding:'0.65rem 0.75rem',color:A,fontSize:'0.8rem',fontWeight:600}}>{m.memberId}</td>
                    <td style={{padding:'0.65rem 0.75rem',fontWeight:500}}>{m.fullName}</td>
                    <td style={{padding:'0.65rem 0.75rem',color:'#888880',fontSize:'0.82rem'}}>{m.email}</td>
                    <td style={{padding:'0.65rem 0.75rem'}}><Badge type={m.membership?.plan||'free'}/></td>
                    <td style={{padding:'0.65rem 0.75rem'}}><Badge type={m.isActive?'active':'suspended'}/></td>
                    <td style={{padding:'0.65rem 0.75rem'}}><Badge type={m.role}/></td>
                    <td style={{padding:'0.65rem 0.75rem'}}>
                      <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap' as const}}>
                        <button style={{...btn,padding:'0.35rem 0.7rem',fontSize:'0.75rem'}} onClick={()=>{setSelected(m);loadMemberDetail(m._id)}}>View</button>
                        <button style={{padding:'0.35rem 0.7rem',fontSize:'0.75rem',background:'rgba(74,158,255,0.15)',border:'1px solid rgba(74,158,255,0.3)',color:'#4a9eff',borderRadius:'6px',cursor:'pointer',fontFamily:'inherit'}} onClick={()=>setAssignModal(m)}>Plan</button>
                        <button style={{...danger,padding:'0.35rem 0.7rem',fontSize:'0.75rem'}} onClick={()=>handleSuspend(m._id,m.isActive)}>{m.isActive?'Suspend':'Activate'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{marginTop:'1rem',fontSize:'0.8rem',color:'#888880',display:'flex',justifyContent:'space-between',flexWrap:'wrap' as const,gap:'0.5rem'}}>
            <span>Showing {filtered.length} of {members.length}</span>
            {search&&<button style={{background:'none',border:'none',color:A,cursor:'pointer',fontSize:'0.8rem',fontFamily:'inherit'}} onClick={()=>{setSearchInput('');setSearch('')}}>Clear ✕</button>}
          </div>
        </div>
      </div>}

      {/* ── MEMBER DETAIL ── */}
      {tab==='members'&&selected&&<div>
        <button style={{...ghost,marginBottom:'1.5rem',fontSize:'0.82rem'}} onClick={()=>{setSelected(null);setSelectedDetail(null)}}>← Back to Members</button>
        <div className="g-2" style={{gap:'1rem'}}>
          <div style={card}>
            <div style={{fontSize:'0.72rem',color:'#888880',textTransform:'uppercase' as const,letterSpacing:'0.08em',marginBottom:'1rem',fontWeight:600}}>Personal Info</div>
            {[['Full Name',selected.fullName],['Email',selected.email],['Member ID',selected.memberId],['Role',selected.role],['Status',selected.isActive?'Active':'Suspended'],['Joined',new Date(selected.createdAt).toLocaleDateString('en-IN')]].map(([l,v])=>(
              <div key={String(l)} style={{display:'flex',justifyContent:'space-between',padding:'0.5rem 0',borderBottom:`1px solid ${D}`,fontSize:'0.875rem'}}>
                <span style={{color:'#888880'}}>{l}</span>
                <span style={{fontWeight:500,color:l==='Member ID'?A:l==='Status'&&v==='Active'?'#4caf7d':l==='Status'?'#e85c3a':'#f0ede8'}}>{v as string||'—'}</span>
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={{fontSize:'0.72rem',color:'#888880',textTransform:'uppercase' as const,letterSpacing:'0.08em',marginBottom:'1rem',fontWeight:600}}>Membership & Actions</div>
            {[['Plan',selected.membership?.plan||'free'],['Status',selected.membership?.status||'—'],['Expires',selected.membership?.endDate?new Date(selected.membership.endDate).toLocaleDateString('en-IN'):'—']].map(([l,v])=>(
              <div key={String(l)} style={{display:'flex',justifyContent:'space-between',padding:'0.5rem 0',borderBottom:`1px solid ${D}`,fontSize:'0.875rem'}}>
                <span style={{color:'#888880'}}>{l}</span><span style={{fontWeight:500,color:'#f0ede8'}}>{v as string||'—'}</span>
              </div>
            ))}
            <div style={{marginTop:'1rem'}}><div style={{fontSize:'0.72rem',color:'#888880',textTransform:'uppercase' as const,letterSpacing:'0.08em',marginBottom:'0.5rem'}}>Assign Trainer</div>
              <select style={sel} onChange={e=>handleAssignTrainer(selected._id,e.target.value)} defaultValue="">
                <option value="" disabled>Select trainer...</option>
                {trainers.map(t=><option key={t._id} value={t._id}>{t.fullName}</option>)}
              </select>
            </div>
            <div style={{display:'flex',gap:'0.5rem',marginTop:'1rem',flexWrap:'wrap' as const}}>
              <button style={btn} onClick={()=>setAssignModal(selected)}>📋 Assign Plan</button>
              <button style={danger} onClick={()=>handleSuspend(selected._id,selected.isActive)}>{selected.isActive?'Suspend':'Activate'}</button>
            </div>
          </div>
          {selectedDetail?.assessments?.[0]&&<div style={card}>
            <div style={{fontSize:'0.72rem',color:'#888880',textTransform:'uppercase' as const,letterSpacing:'0.08em',marginBottom:'1rem',fontWeight:600}}>Latest Assessment</div>
            {[['Weight',`${selectedDetail.assessments[0].weight} kg`],['BMI',`${selectedDetail.assessments[0].bmi} (${selectedDetail.assessments[0].bmiCategory})`],['Goal',selectedDetail.assessments[0].fitnessGoal?.replace('-',' ')],['Target',`${selectedDetail.assessments[0].targetCalories} kcal`]].map(([l,v])=>(
              <div key={String(l)} style={{display:'flex',justifyContent:'space-between',padding:'0.4rem 0',borderBottom:`1px solid ${D}`,fontSize:'0.82rem'}}>
                <span style={{color:'#888880'}}>{l}</span><span style={{fontWeight:500}}>{v as string||'—'}</span>
              </div>
            ))}
          </div>}
          {selectedDetail?.progress?.length>0&&<div style={card}>
            <div style={{fontSize:'0.72rem',color:'#888880',textTransform:'uppercase' as const,letterSpacing:'0.08em',marginBottom:'1rem',fontWeight:600}}>Progress ({selectedDetail.progress.length} logs)</div>
            {selectedDetail.progress.slice(0,5).map((p:any)=>(
              <div key={p._id} style={{display:'flex',justifyContent:'space-between',padding:'0.4rem 0',borderBottom:`1px solid ${D}`,fontSize:'0.82rem'}}>
                <span style={{color:'#888880'}}>{new Date(p.loggedAt).toLocaleDateString('en-IN')}</span>
                <span style={{fontWeight:600,color:A}}>{p.weight} kg</span>
              </div>
            ))}
          </div>}
        </div>
      </div>}

      {/* ── TRAINERS ── */}
      {tab==='trainers'&&<div className="g-3" style={{gap:'1.5rem'}}>
        {trainers.length===0?<div style={{...card,gridColumn:'1/-1',textAlign:'center' as const,padding:'3rem',color:'#888880'}}>No trainers found</div>:trainers.map(t=>(
          <div key={t._id} style={{background:'#141414',border:`1px solid ${D}`,borderRadius:'14px',overflow:'hidden'}}>
            <div style={{height:'120px',background:`linear-gradient(135deg,rgba(232,197,71,0.15),#111)`,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'linear-gradient(135deg,#e8c547,#c8942a)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Bebas Neue,sans-serif',fontSize:'1.6rem',color:'#0a0a0a'}}>
                {t.fullName?.split(' ').map((n:string)=>n[0]).join('')}
              </div>
            </div>
            <div style={{padding:'1.2rem'}}>
              <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'1.3rem',letterSpacing:'0.04em'}}>{t.fullName}</div>
              <div style={{fontSize:'0.75rem',color:A,marginBottom:'0.5rem'}}>{t.memberId}</div>
              <div style={{fontSize:'0.82rem',color:'#888880'}}>{t.email}</div>
              <div style={{marginTop:'0.75rem',fontSize:'0.8rem',color:'#888880'}}>Assigned: <strong style={{color:'#f0ede8'}}>{members.filter(m=>m.assignedTrainer?._id===t._id||m.assignedTrainer===t._id).length} members</strong></div>
            </div>
          </div>
        ))}
      </div>}

      {/* ── ASSIGN PLANS ── */}
      {tab==='plans'&&<div style={card}>
        <div style={{fontWeight:500,marginBottom:'0.8rem'}}>📋 Assign Workout & Diet Plans</div>
        <p style={{color:'#888880',fontSize:'0.875rem',lineHeight:1.7,marginBottom:'1.5rem'}}>Go to the Members tab, select a member, and click "Plan" to assign a personalised workout or diet plan with pre-loaded templates.</p>
        <button style={btn} onClick={()=>setTab('members')}>Go to Members →</button>
      </div>}

      {/* ── SETTINGS ── */}
      {tab==='settings'&&<div className="g-2" style={{gap:'1rem'}}>
        {/* Gym Details */}
        <div style={card}>
          <div style={{fontWeight:500,marginBottom:'1.2rem'}}>🏋️ Gym Details</div>
          {[
            {label:'Gym Name',    key:'gymName'},
            {label:'Location',    key:'location'},
            {label:'Contact Email',key:'email'},
            {label:'Phone',       key:'phone'},
            {label:'GST No.',     key:'gst'},
          ].map(f=>(
            <div key={f.key} style={{marginBottom:'0.75rem'}}>
              <label style={{fontSize:'0.72rem',color:'#888880',textTransform:'uppercase' as const,letterSpacing:'0.06em',display:'block',marginBottom:'0.3rem'}}>{f.label}</label>
              <input style={inp} type="text" value={(gymSettings as any)[f.key]}
                onChange={e=>setGymSettings(prev=>({...prev,[f.key]:e.target.value}))}/>
            </div>
          ))}
          <button style={{...btn,marginTop:'0.5rem',opacity:settingsSaving?0.7:1}} disabled={settingsSaving} onClick={()=>handleSaveSettings('gym')}>
            {settingsSaving?'Saving...':'Save Gym Details ✓'}
          </button>
        </div>
        {/* Pricing */}
        <div style={card}>
          <div style={{fontWeight:500,marginBottom:'1.2rem'}}>💰 Membership Pricing (₹/mo)</div>
          {[
            {label:'Standard Plan',key:'pricingStandard'},
            {label:'Pro Plan',     key:'pricingPro'},
            {label:'Elite Plan',   key:'pricingElite'},
            {label:'Trial (days)', key:'trialDays'},
            {label:'Refund (days)',key:'refundDays'},
          ].map(f=>(
            <div key={f.key} style={{marginBottom:'0.75rem'}}>
              <label style={{fontSize:'0.72rem',color:'#888880',textTransform:'uppercase' as const,letterSpacing:'0.06em',display:'block',marginBottom:'0.3rem'}}>{f.label}</label>
              <input style={inp} type="text" value={(gymSettings as any)[f.key]}
                onChange={e=>setGymSettings(prev=>({...prev,[f.key]:e.target.value}))}/>
            </div>
          ))}
          <button style={{...btn,marginTop:'0.5rem',opacity:settingsSaving?0.7:1}} disabled={settingsSaving} onClick={()=>handleSaveSettings('pricing')}>
            {settingsSaving?'Saving...':'Save Pricing ✓'}
          </button>
        </div>
      </div>}

    </main>
  </div>
}
