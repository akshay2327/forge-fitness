'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, getUser, clearSession } from '@/lib/api'
declare global { interface Window { Razorpay: any } }
const B=process.env.NEXT_PUBLIC_API_URL||'http://localhost:5001/api/v1', A='#e8c547', C='#1a1a1a', D='rgba(255,255,255,0.08)'

function Skeleton({w='100%',h='20px',r='6px'}:any){
  return <div style={{width:w,height:h,borderRadius:r,background:'rgba(255,255,255,0.06)',position:'relative',overflow:'hidden'}}>
    <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.07) 50%,transparent 100%)',animation:'shimmer 1.4s infinite'}}/>
    <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`}</style>
  </div>
}

function SLink({icon,label,active,onClick,badge}:any){
  return <div onClick={onClick} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.7rem 0.9rem',borderRadius:'8px',cursor:'pointer',background:active?'rgba(232,197,71,0.1)':'transparent',color:active?'#f0ede8':'#888880',fontSize:'0.875rem',fontWeight:500,transition:'all 0.2s',marginBottom:'2px'}}
    onMouseEnter={e=>{if(!active)(e.currentTarget as any).style.background='rgba(255,255,255,0.04)'}}
    onMouseLeave={e=>{if(!active)(e.currentTarget as any).style.background='transparent'}}>
    <span style={{fontSize:'1rem',width:'1.2rem',textAlign:'center' as const}}>{icon}</span>
    <span style={{flex:1}}>{label}</span>
    {badge&&<span style={{background:A,color:'#0a0a0a',fontSize:'0.62rem',fontWeight:700,padding:'0.1rem 0.45rem',borderRadius:'100px'}}>{badge}</span>}
    {active&&!badge&&<span style={{width:'4px',height:'4px',borderRadius:'50%',background:A}}/>}
  </div>
}

function StatCard({label,value,unit='',delta='',up=true,loading=false}:any){
  return <div style={{background:C,border:`1px solid ${D}`,borderRadius:'12px',padding:'1.2rem 1.4rem'}}>
    <div style={{fontSize:'0.72rem',color:'#888880',textTransform:'uppercase' as const,letterSpacing:'0.08em',marginBottom:'0.5rem'}}>{label}</div>
    {loading?<Skeleton h="36px" r="4px"/>:<>
      <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'2.2rem',lineHeight:1,color:'#f0ede8'}}>{value}<span style={{fontSize:'1rem',color:'#888880',fontFamily:'inherit'}}>{unit}</span></div>
      {delta&&<div style={{fontSize:'0.78rem',marginTop:'0.4rem',color:up?'#4caf7d':'#e85c3a'}}>{delta}</div>}
    </>}
  </div>
}

function WeightChart({data}:{data:{label:string;weight:number}[]}){
  if(!data.length) return <div style={{padding:'2rem',textAlign:'center' as const,color:'#888880',fontSize:'0.875rem'}}>No data yet. Log your first weight entry!</div>
  const vals=data.map(d=>d.weight), mn=Math.min(...vals)-2, mx=Math.max(...vals)+2
  const W=580,H=160,P=40,xS=(W-P*2)/Math.max(data.length-1,1),yS=(v:number)=>H-P-((v-mn)/(mx-mn))*(H-P*2)
  const pts=data.map((d,i)=>({x:P+i*xS,y:yS(d.weight),...d}))
  const path=pts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  return <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
    {[0,1,2,3].map(i=><line key={i} x1={P} y1={P+i*(H-P*2)/3} x2={W-P} y2={P+i*(H-P*2)/3} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>)}
    <path d={path+` L${pts[pts.length-1].x},${H-P} L${P},${H-P} Z`} fill="rgba(232,197,71,0.06)"/>
    <path d={path} fill="none" stroke={A} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    {pts.map((p,i)=><g key={i}>
      <circle cx={p.x} cy={p.y} r="4" fill={A}/>
      <text x={p.x} y={H-8} textAnchor="middle" fill="#888880" fontSize="10">{p.label}</text>
      <text x={p.x} y={p.y-10} textAnchor="middle" fill="#f0ede8" fontSize="10" fontWeight="600">{p.weight}</text>
    </g>)}
  </svg>
}

function ProgressBar({value,max,color}:any){
  return <div style={{height:'6px',background:'rgba(255,255,255,0.07)',borderRadius:'3px',overflow:'hidden'}}>
    <div style={{height:'100%',width:`${Math.min(100,Math.round((value/max)*100))}%`,background:color||A,borderRadius:'3px',transition:'width 0.6s'}}/>
  </div>
}

export default function DashboardPage(){
  const router=useRouter()
  const [user,setUser]=useState<any>(null), [tab,setTab]=useState('overview')
  const [assess,setAssess]=useState<any>(null), [progress,setProgress]=useState<any[]>([])
  const [diet,setDiet]=useState<any>(null), [workout,setWorkout]=useState<any>(null)
  const [loading,setLoading]=useState(true), [saving,setSaving]=useState(false)
  const [toast,setToast]=useState(''), [toastOk,setToastOk]=useState(true)
  const [payLoading,setPayLoading]=useState(''), [sidebarOpen,setSidebarOpen]=useState(false)
  const [trainer,setTrainer]=useState<any>(null)
  const [logWeight,setLogWeight]=useState(''), [logNotes,setLogNotes]=useState(''), [logMood,setLogMood]=useState(3)
  const [photoUploading,setPhotoUploading]=useState(false)
  const [af,setAf]=useState({age:'',gender:'male',weight:'',height:'',fitnessGoal:'muscle-gain',activityLevel:'active',dietPreference:'non-veg',sleepHours:'7',waterIntakeLiters:'3',medicalConditions:''})

  useEffect(()=>{
    const u=getUser(); if(!u){router.push('/');return}
    if(u.role==='admin'){router.push('/admin');return}
    if(u.role==='trainer'){router.push('/trainer');return}
    setUser(u)
    if(u.membership?.endDate&&new Date(u.membership.endDate)<new Date()) showToast('⚠️ Membership expired. Please renew.','err')
    loadData()
    const s=document.createElement('script'); s.src='https://checkout.razorpay.com/v1/checkout.js'; document.body.appendChild(s)
  },[])

  const loadData=async()=>{
    setLoading(true)
    try {
      const [a,p,d,w,pr]=await Promise.allSettled([api.get('/assessments'),api.get('/progress?days=60'),api.get('/diet'),api.get('/workouts'),api.get('/users/profile')])
      if(a.status==='fulfilled') setAssess(a.value.latest)
      if(p.status==='fulfilled') setProgress(p.value.logs||[])
      if(d.status==='fulfilled') setDiet(d.value.plan)
      if(w.status==='fulfilled') setWorkout(w.value.plan)
      if(pr.status==='fulfilled'&&pr.value.user?.assignedTrainer) setTrainer(pr.value.user.assignedTrainer)
    } catch(e){console.error(e)}
    setLoading(false)
  }
  const showToast=(msg:string,type:'ok'|'err'='ok')=>{setToast(msg);setToastOk(type==='ok');setTimeout(()=>setToast(''),4000)}
  const handleLogout=()=>{clearSession();router.push('/')}

  const handleLogProgress=async()=>{
    if(!logWeight) return showToast('Please enter weight','err')
    try { await api.post('/progress',{weight:parseFloat(logWeight),notes:logNotes,mood:logMood}); setLogWeight('');setLogNotes('');setLogMood(3); showToast('✅ Progress logged!'); loadData() }
    catch(e:any){showToast('❌ '+e.message,'err')}
  }

  const handleSaveAssessment=async()=>{
    if(!af.age||!af.weight||!af.height) return showToast('Age, weight and height required','err')
    setSaving(true)
    try { await api.post('/assessments',{age:parseInt(af.age),gender:af.gender,weight:parseFloat(af.weight),height:parseFloat(af.height),fitnessGoal:af.fitnessGoal,activityLevel:af.activityLevel,dietPreference:af.dietPreference,sleepHours:parseFloat(af.sleepHours)||7,waterIntakeLiters:parseFloat(af.waterIntakeLiters)||3,medicalConditions:af.medicalConditions}); showToast('✅ Assessment saved!'); loadData() }
    catch(e:any){showToast('❌ '+e.message,'err')}
    setSaving(false)
  }

  const handlePhotoUpload=async(e:React.ChangeEvent<HTMLInputElement>,type:string)=>{
    const file=e.target.files?.[0]; if(!file) return
    if(file.size>5*1024*1024) return showToast('❌ Max 5MB','err')
    setPhotoUploading(true)
    try {
      const token=localStorage.getItem('forge_token')
      const fd=new FormData(); fd.append('file',file); fd.append('type','progress')
      const res=await fetch(`${B}/upload`,{method:'POST',headers:{Authorization:`Bearer ${token}`},body:fd})
      const data=await res.json(); if(!res.ok) throw new Error(data.error)
      showToast(`✅ ${type} photo uploaded!`)
    } catch(e:any){showToast('❌ '+e.message,'err')}
    setPhotoUploading(false)
  }

  const handleDownloadPDF=async()=>{
    showToast('⏳ Generating report...')
    try {
      const token=localStorage.getItem('forge_token')
      const res=await fetch(`${B}/users/report-data`,{headers:{Authorization:`Bearer ${token}`}})
      const data=await res.json(); if(!res.ok) throw new Error(data.error)
      const lines=['FORGE FITNESS — MEMBER REPORT','================================',`Generated: ${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}`,'','MEMBER DETAILS','──────────────',`Name:      ${data.member?.name}`,`Member ID: ${data.member?.memberId}`,`Email:     ${data.member?.email}`,`Plan:      ${data.member?.plan?.toUpperCase()}`,'']
      if(data.current) lines.push('FITNESS DATA','────────────',`Weight: ${data.current.weight} kg`,`BMI: ${data.current.bmi} (${data.current.bmiCategory})`,`Goal: ${data.current.goal?.replace('-',' ')}`,`Target: ${data.current.targetCalories} kcal/day`,'')
      if(data.progress) lines.push('PROGRESS','─────────',`Start: ${data.progress.startWeight} kg`,`Current: ${data.progress.currentWeight} kg`,`Change: ${data.progress.weightChange>0?'+':''}${data.progress.weightChange} kg`,`Logs: ${data.progress.totalLogs}`,'')
      lines.push('── Generated by FORGE Fitness ──')
      const blob=new Blob([lines.join('\n')],{type:'text/plain'})
      const url=URL.createObjectURL(blob), a=document.createElement('a')
      a.href=url; a.download=`FORGE_Report_${data.member?.memberId||'member'}.txt`
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
      showToast('✅ Report downloaded!')
    } catch(e:any){showToast('❌ '+e.message,'err')}
  }

  const handleBuyPlan=async(plan:string)=>{
    const token=localStorage.getItem('forge_token'); if(!token) return
    setPayLoading(plan)
    try {
      const res=await fetch(`${B}/payments/create-order`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({plan})})
      const order=await res.json(); if(!res.ok) throw new Error(order.error)
      new window.Razorpay({key:order.keyId,amount:order.amount,currency:order.currency,name:'FORGE Fitness',description:order.planName,order_id:order.orderId,prefill:{name:user?.fullName,email:user?.email},theme:{color:A},
        handler:async(resp:any)=>{const vRes=await fetch(`${B}/payments/verify`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({...resp,plan})});const vData=await vRes.json();showToast('🎉 '+(vData.message||'Plan activated!'));const u=getUser();if(u){u.membership=vData.membership;localStorage.setItem('forge_user',JSON.stringify(u));setUser({...u})}},
        modal:{ondismiss:()=>setPayLoading('')}}).open()
    } catch(e:any){showToast('❌ '+e.message,'err')}
    finally{setPayLoading('')}
  }

  const cW=progress[0]?.weight||assess?.weight||0, sW=progress[progress.length-1]?.weight||assess?.weight||0
  const delta=parseFloat((cW-sW).toFixed(1))
  const chartData=progress.slice().reverse().map(p=>({label:new Date(p.loggedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short'}),weight:p.weight}))
  const initials=user?.fullName?.split(' ').map((n:string)=>n[0]).join('').toUpperCase()||'ME'
  const expired=user?.membership?.endDate&&new Date(user.membership.endDate)<new Date()

  const card:any={background:C,border:`1px solid ${D}`,borderRadius:'12px',padding:'1.5rem',marginBottom:'1rem'}
  const inp:any={width:'100%',background:'#111',border:`1px solid ${D}`,color:'#f0ede8',padding:'0.75rem 1rem',borderRadius:'8px',fontSize:'0.875rem',outline:'none',fontFamily:'inherit'}
  const sel:any={width:'100%',background:'#111',border:`1px solid ${D}`,color:'#f0ede8',padding:'0.75rem 1rem',borderRadius:'8px',fontSize:'0.875rem',outline:'none',fontFamily:'inherit'}
  const lbl:any={fontSize:'0.72rem',color:'#888880',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:'0.3rem'}
  const btn:any={padding:'0.75rem 1.5rem',background:A,border:'none',color:'#0a0a0a',borderRadius:'8px',cursor:'pointer',fontSize:'0.875rem',fontWeight:700,fontFamily:'inherit'}
  const ghost:any={padding:'0.75rem 1.5rem',background:'transparent',border:`1px solid ${D}`,color:'#f0ede8',borderRadius:'8px',cursor:'pointer',fontSize:'0.875rem',fontFamily:'inherit'}

  if(loading) return <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'DM Sans,sans-serif',color:'#f0ede8'}}>
    <div style={{textAlign:'center' as const,width:'min(420px,90vw)'}}>
      <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'2.5rem',letterSpacing:'0.08em',marginBottom:'1.5rem'}}>FORGE<span style={{color:A}}>.</span></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'0.75rem'}}>
        <Skeleton h="80px" r="12px"/><Skeleton h="80px" r="12px"/>
        <Skeleton h="80px" r="12px"/><Skeleton h="80px" r="12px"/>
      </div>
      <Skeleton h="200px" r="12px"/>
    </div>
  </div>

  const tabs=[{icon:'◼',label:'Overview',key:'overview'},{icon:'📋',label:'Assessment',key:'assessment'},{icon:'⚡',label:'Workout',key:'workout'},{icon:'🥗',label:'Diet',key:'diet'},{icon:'📈',label:'Progress',key:'progress',badge:progress.length||undefined},{icon:'📷',label:'Photos',key:'photos'},{icon:'👤',label:'Profile',key:'profile'},{icon:'💳',label:'Upgrade',key:'upgrade'}]

  return <div className="forge-dash">
    <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    {toast&&<div style={{position:'fixed',bottom:'1.5rem',right:'1rem',zIndex:9999,background:'#1e1e1e',border:`1px solid ${toastOk?'rgba(76,175,125,0.5)':'rgba(232,92,58,0.5)'}`,borderRadius:'10px',padding:'0.9rem 1.4rem',color:'#f0ede8',fontSize:'0.875rem',maxWidth:'320px',animation:'slideUp 0.3s ease'}}>{toast}</div>}
    {expired&&<div style={{position:'fixed',top:0,left:0,right:0,zIndex:500,background:'#e85c3a',color:'white',padding:'0.6rem',textAlign:'center' as const,fontSize:'0.82rem',fontWeight:600}}>⚠️ Membership expired · <span style={{textDecoration:'underline',cursor:'pointer'}} onClick={()=>setTab('upgrade')}>Renew Now →</span></div>}
    {sidebarOpen&&<div className="forge-overlay show" onClick={()=>setSidebarOpen(false)}/>}
    <button className="forge-mob-btn" onClick={()=>setSidebarOpen(!sidebarOpen)} style={{top:expired?'2.5rem':'0.75rem'}}>☰</button>

    {/* Sidebar */}
    <aside className={`forge-sidebar${sidebarOpen?' open':''}`} style={{top:expired?'40px':0}}>
      <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'1.8rem',letterSpacing:'0.08em',marginBottom:'2rem',cursor:'pointer'}} onClick={()=>router.push('/')}>FORGE<span style={{color:A}}>.</span></div>
      <nav style={{flex:1}}>
        <div style={{fontSize:'0.62rem',color:'#555',textTransform:'uppercase' as const,letterSpacing:'0.12em',padding:'0 0.9rem 0.5rem'}}>Main</div>
        {tabs.slice(0,6).map(l=><SLink key={l.key} icon={l.icon} label={l.label} active={tab===l.key} badge={l.badge} onClick={()=>{setTab(l.key);setSidebarOpen(false)}}/>)}
        <div style={{fontSize:'0.62rem',color:'#555',textTransform:'uppercase' as const,letterSpacing:'0.12em',padding:'1rem 0.9rem 0.5rem'}}>Account</div>
        {tabs.slice(6).map(l=><SLink key={l.key} icon={l.icon} label={l.label} active={tab===l.key} onClick={()=>{setTab(l.key);setSidebarOpen(false)}}/>)}
      </nav>
      <div style={{borderTop:`1px solid ${D}`,paddingTop:'1rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.75rem'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#e8c547,#c8942a)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.8rem',color:'#0a0a0a',flexShrink:0}}>{initials}</div>
          <div>
            <div style={{fontSize:'0.875rem',fontWeight:500}}>{user?.fullName?.split(' ')[0]}</div>
            <div style={{fontSize:'0.72rem',color:expired?'#e85c3a':A}}>{expired?'Expired':user?.membership?.plan||'free'}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{...ghost,width:'100%',fontSize:'0.8rem',padding:'0.5rem',textAlign:'center' as const}}>Logout</button>
      </div>
    </aside>

    {/* Main */}
    <main className="forge-main" style={{paddingTop:expired?'3.5rem':'2rem'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'2rem',flexWrap:'wrap' as const,gap:'1rem'}}>
        <div>
          <h1 style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'1.9rem',letterSpacing:'0.04em',margin:0}}>{tabs.find(t=>t.key===tab)?.label||'Dashboard'}</h1>
          <div style={{fontSize:'0.78rem',color:'#888880',marginTop:'0.2rem'}}>{user?.fullName} · <span style={{color:A}}>{user?.memberId}</span></div>
        </div>
        <div style={{display:'flex',gap:'0.6rem',flexWrap:'wrap' as const}}>
          <button onClick={handleDownloadPDF} style={{...ghost,fontSize:'0.78rem',padding:'0.5rem 0.9rem'}}>⬇ PDF</button>
          <button onClick={()=>router.push('/')} style={{...ghost,fontSize:'0.78rem',padding:'0.5rem 0.9rem'}}>← Home</button>
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      {tab==='overview'&&<div>
        <div className="g-stats4" style={{marginBottom:'1.5rem'}}>
          <StatCard label="Current Weight" value={cW||'—'} unit=" kg" delta={delta?`${delta>0?'+':''}${delta}kg from start`:''} up={delta<=0} loading={loading}/>
          <StatCard label="BMI" value={assess?.bmi||'—'} delta={assess?.bmiCategory} up={assess?.bmiCategory==='Normal'} loading={loading}/>
          <StatCard label="Progress Logs" value={progress.length} delta={progress[0]?`Last: ${new Date(progress[0].loggedAt).toLocaleDateString('en-IN')}`:''} up loading={loading}/>
          <StatCard label="Goal" value={assess?.fitnessGoal?.replace('-',' ')||'Not set'} delta={assess?.targetCalories?`${assess.targetCalories} kcal`:''} up loading={loading}/>
        </div>
        <div className="g-chart" style={{gap:'1rem',marginBottom:'1rem'}}>
          <div style={card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
              <div style={{fontWeight:500}}>Weight Progress</div>
              <span style={{fontSize:'0.75rem',color:'#888880'}}>{progress.length} entries</span>
            </div>
            {loading?<Skeleton h="160px" r="8px"/>:<WeightChart data={chartData}/>}
          </div>
          <div style={card}>
            <div style={{fontWeight:500,marginBottom:'1rem'}}>Macros Today</div>
            {assess?[{l:'Calories',v:assess.targetCalories,m:3000,c:A,u:'kcal'},{l:'Protein',v:assess.proteinTarget,m:200,c:'#4a9eff',u:'g'},{l:'Carbs',v:assess.carbTarget,m:400,c:'#f0a845',u:'g'},{l:'Fat',v:assess.fatTarget,m:150,c:'#e85c3a',u:'g'}].map(m=>(
              <div key={m.l} style={{marginBottom:'0.75rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.8rem',marginBottom:'0.3rem'}}><span style={{color:'#888880'}}>{m.l}</span><span style={{color:'#f0ede8',fontWeight:500}}>{m.v}{m.u}</span></div>
                <ProgressBar value={m.v} max={m.m} color={m.c}/>
              </div>
            )):<div style={{color:'#888880',fontSize:'0.85rem'}}>Complete assessment to see targets</div>}
          </div>
        </div>
        <div style={card}>
          <div style={{fontWeight:500,marginBottom:'1rem'}}>📊 Quick Log Progress</div>
          <div className="g-log">
            <div><label style={lbl}>Weight (kg) *</label><input style={inp} type="number" placeholder="72.5" step="0.1" value={logWeight} onChange={e=>setLogWeight(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogProgress()}/></div>
            <div><label style={lbl}>Notes</label><input style={inp} type="text" placeholder="How are you feeling?" value={logNotes} onChange={e=>setLogNotes(e.target.value)}/></div>
            <div><label style={lbl}>Mood</label><select style={sel} value={logMood} onChange={e=>setLogMood(parseInt(e.target.value))}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n} {n===1?'😞':n===2?'😐':n===3?'🙂':n===4?'😊':'🔥'}</option>)}</select></div>
            <button style={btn} onClick={handleLogProgress}>Log →</button>
          </div>
        </div>
        {(diet||workout)&&<div className="g-2" style={{gap:'1rem'}}>
          {workout&&<div style={card}>
            <div style={{fontWeight:500,marginBottom:'0.8rem'}}>⚡ Today's Workout</div>
            <div style={{fontSize:'0.8rem',color:'#888880',marginBottom:'0.8rem'}}>{workout.title}</div>
            {(workout.days?.find((d:any)=>d.dayOfWeek===new Date().getDay())||workout.days?.[0])?.exercises?.slice(0,3).map((ex:any,i:number)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:'0.82rem',padding:'0.35rem 0',borderBottom:`1px solid ${D}`}}><span>{ex.name}</span><span style={{color:'#888880'}}>{ex.sets}×{ex.reps}</span></div>
            ))}
          </div>}
          {diet&&<div style={card}>
            <div style={{fontWeight:500,marginBottom:'0.8rem'}}>🥗 Diet Plan</div>
            <div style={{fontSize:'0.8rem',color:'#888880',marginBottom:'0.8rem'}}>{diet.title}</div>
            {[['Cal',diet.targetCalories,'kcal',A],['Pro',diet.targetProtein,'g','#4a9eff'],['Carb',diet.targetCarbs,'g','#f0a845']].map(([l,v,u,c])=>(
              <div key={String(l)} style={{display:'flex',justifyContent:'space-between',fontSize:'0.82rem',padding:'0.25rem 0'}}><span style={{color:'#888880'}}>{l}</span><span style={{color:String(c),fontWeight:500}}>{v}{u}</span></div>
            ))}
          </div>}
        </div>}
      </div>}

      {/* ── ASSESSMENT ── */}
      {tab==='assessment'&&<div style={card}>
        <div style={{fontWeight:500,marginBottom:'1.5rem'}}>{assess?'✏️ Update Assessment':'📋 Complete Assessment'}</div>
        {assess&&<div style={{background:'rgba(232,197,71,0.07)',border:'1px solid rgba(232,197,71,0.18)',borderRadius:'8px',padding:'0.8rem 1rem',marginBottom:'1.5rem',fontSize:'0.82rem',color:'#c8a82a'}}>Last: {new Date(assess.takenAt).toLocaleDateString('en-IN')} · BMI: {assess.bmi} ({assess.bmiCategory}) · {assess.targetCalories} kcal/day</div>}
        <div className="g-assess">
          {[{label:'Age *',key:'age',ph:'25'},{label:'Weight (kg) *',key:'weight',ph:'70.0'},{label:'Height (cm) *',key:'height',ph:'175'},{label:'Sleep (hrs)',key:'sleepHours',ph:'7'},{label:'Water (L/day)',key:'waterIntakeLiters',ph:'3'}].map(f=>(
            <div key={f.key}><label style={lbl}>{f.label}</label><input style={inp} type="number" placeholder={f.ph} value={(af as any)[f.key]} onChange={e=>setAf({...af,[f.key]:e.target.value})}/></div>
          ))}
          <div><label style={lbl}>Gender *</label><select style={sel} value={af.gender} onChange={e=>setAf({...af,gender:e.target.value})}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
          <div><label style={lbl}>Goal *</label><select style={sel} value={af.fitnessGoal} onChange={e=>setAf({...af,fitnessGoal:e.target.value})}><option value="fat-loss">Fat Loss</option><option value="muscle-gain">Muscle Gain</option><option value="maintenance">Maintenance</option><option value="strength">Strength</option><option value="endurance">Endurance</option></select></div>
          <div><label style={lbl}>Activity *</label><select style={sel} value={af.activityLevel} onChange={e=>setAf({...af,activityLevel:e.target.value})}><option value="sedentary">Sedentary</option><option value="light">Light</option><option value="moderate">Moderate</option><option value="active">Active</option><option value="very-active">Very Active</option></select></div>
          <div><label style={lbl}>Diet *</label><select style={sel} value={af.dietPreference} onChange={e=>setAf({...af,dietPreference:e.target.value})}><option value="veg">Vegetarian</option><option value="non-veg">Non-Veg</option><option value="vegan">Vegan</option><option value="eggetarian">Eggetarian</option></select></div>
          <div style={{gridColumn:'1/-1'}}><label style={lbl}>Medical Conditions (optional)</label><input style={inp} placeholder="e.g. knee pain..." value={af.medicalConditions} onChange={e=>setAf({...af,medicalConditions:e.target.value})}/></div>
        </div>
        {af.weight&&af.height&&<div style={{background:'rgba(232,197,71,0.06)',border:'1px solid rgba(232,197,71,0.15)',borderRadius:'8px',padding:'0.8rem 1.2rem',marginTop:'1rem',fontSize:'0.875rem'}}>📊 BMI: <strong style={{color:A}}>{(parseFloat(af.weight)/Math.pow(parseFloat(af.height)/100,2)).toFixed(1)}</strong></div>}
        <div style={{marginTop:'1.5rem',display:'flex',gap:'1rem',flexWrap:'wrap' as const}}>
          <button style={{...btn,opacity:saving?0.7:1}} onClick={handleSaveAssessment} disabled={saving}>{saving?'Saving...':'Save Assessment →'}</button>
          {assess&&<button style={ghost} onClick={()=>setAf({age:String(assess.age),gender:assess.gender,weight:String(assess.weight),height:String(assess.height),fitnessGoal:assess.fitnessGoal,activityLevel:assess.activityLevel,dietPreference:assess.dietPreference,sleepHours:String(assess.sleepHours||7),waterIntakeLiters:String(assess.waterIntakeLiters||3),medicalConditions:assess.medicalConditions||''})}>↩ Load Previous</button>}
        </div>
      </div>}

      {/* ── WORKOUT ── */}
      {tab==='workout'&&(workout?<>
        <div style={card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.2rem',flexWrap:'wrap' as const,gap:'0.5rem'}}>
            <div><div style={{fontWeight:500}}>{workout.title}</div><div style={{fontSize:'0.8rem',color:'#888880',marginTop:'0.2rem'}}>Week {workout.currentWeek} of {workout.durationWeeks} · {workout.level}</div></div>
            <span style={{background:'rgba(232,197,71,0.12)',color:A,padding:'0.3rem 0.8rem',borderRadius:'100px',fontSize:'0.75rem',fontWeight:600}}>{workout.goal?.replace('-',' ')}</span>
          </div>
          <div className="g-week">
            {workout.days?.map((d:any,i:number)=>{const isToday=d.dayOfWeek===new Date().getDay();return(
              <div key={i} style={{background:isToday?'rgba(232,197,71,0.1)':C,border:`1px solid ${isToday?'rgba(232,197,71,0.4)':D}`,borderRadius:'8px',padding:'0.6rem 0.4rem',textAlign:'center' as const,opacity:d.type==='rest'?0.5:1}}>
                <div style={{fontSize:'0.6rem',color:'#888880',textTransform:'uppercase' as const,letterSpacing:'0.06em'}}>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.dayOfWeek]}</div>
                <div style={{fontSize:'0.75rem',fontWeight:600,color:isToday?A:'#f0ede8',margin:'0.25rem 0'}}>{d.name}</div>
                <div style={{fontSize:'0.65rem',color:'#888880'}}>{d.durationMinutes}m</div>
              </div>
            )})}
          </div>
        </div>
        {workout.days?.find((d:any)=>d.dayOfWeek===new Date().getDay())&&<div style={card}>
          <div style={{fontWeight:500,marginBottom:'1rem'}}>Today's Exercises</div>
          <div className="t-scroll">
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.875rem',minWidth:'400px'}}>
              <thead><tr style={{borderBottom:`1px solid ${D}`}}>{['Exercise','Sets','Reps','Rest'].map(h=><th key={h} style={{textAlign:'left' as const,padding:'0.5rem 0.75rem',color:'#888880',fontSize:'0.7rem',textTransform:'uppercase' as const,fontWeight:400}}>{h}</th>)}</tr></thead>
              <tbody>{workout.days.find((d:any)=>d.dayOfWeek===new Date().getDay()).exercises?.map((ex:any,i:number)=>(
                <tr key={i} style={{borderBottom:`1px solid ${D}`}}>
                  <td style={{padding:'0.65rem 0.75rem',fontWeight:500}}>{ex.name}</td>
                  <td style={{padding:'0.65rem 0.75rem',color:A,textAlign:'center' as const}}>{ex.sets}</td>
                  <td style={{padding:'0.65rem 0.75rem',textAlign:'center' as const}}>{ex.reps}</td>
                  <td style={{padding:'0.65rem 0.75rem',color:'#888880',textAlign:'center' as const,fontSize:'0.8rem'}}>{ex.restSeconds}s</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>}
      </>:<div style={{...card,textAlign:'center' as const,padding:'3rem'}}>
        <div style={{fontSize:'3rem',marginBottom:'1rem'}}>⚡</div>
        <div style={{fontWeight:500,marginBottom:'0.5rem'}}>No workout plan assigned yet</div>
        <div style={{color:'#888880',fontSize:'0.875rem',marginBottom:'1.5rem'}}>Your trainer will assign a plan after reviewing your assessment.</div>
        <button style={btn} onClick={()=>setTab('assessment')}>Complete Assessment →</button>
      </div>)}

      {/* ── DIET ── */}
      {tab==='diet'&&(diet?<>
        <div style={{...card,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap' as const,gap:'1rem',marginBottom:'1rem'}}>
          <div><div style={{fontWeight:500}}>{diet.title}</div><div style={{fontSize:'0.8rem',color:'#888880',marginTop:'0.2rem'}}>{diet.goal?.replace('-',' ')} · {diet.dietPreference}</div></div>
          <div style={{display:'flex',gap:'1.5rem',fontSize:'0.82rem',flexWrap:'wrap' as const}}>
            {[['Cal',diet.targetCalories,'kcal',A],['Pro',diet.targetProtein,'g','#4a9eff'],['Carb',diet.targetCarbs,'g','#f0a845'],['Fat',diet.targetFat,'g','#e85c3a']].map(([l,v,u,c])=>(
              <div key={String(l)} style={{textAlign:'center' as const}}><div style={{color:String(c),fontWeight:700,fontSize:'1.1rem'}}>{v}{u}</div><div style={{color:'#888880',fontSize:'0.75rem'}}>{l}</div></div>
            ))}
          </div>
        </div>
        {diet.meals?.map((meal:any)=>(
          <div key={meal.type} style={{...card,marginBottom:'0.75rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.8rem',flexWrap:'wrap' as const,gap:'0.5rem'}}>
              <div style={{fontWeight:500,textTransform:'capitalize' as const}}>{meal.type.replace('-',' ')}</div>
              <div style={{display:'flex',gap:'1.5rem',fontSize:'0.8rem'}}><span style={{color:'#888880'}}>{meal.time}</span><span style={{color:A,fontWeight:600}}>{meal.totalCalories} kcal</span></div>
            </div>
            <div className="t-scroll">
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.8rem',minWidth:'360px'}}>
                <thead><tr style={{borderBottom:`1px solid ${D}`}}>{['Food','Qty','Prot','Carb','Fat','Kcal'].map(h=><th key={h} style={{textAlign:'left' as const,padding:'0.3rem 0.5rem',color:'#888880',fontSize:'0.7rem',fontWeight:400}}>{h}</th>)}</tr></thead>
                <tbody>{meal.items?.map((item:any,i:number)=>(
                  <tr key={i} style={{borderBottom:`1px solid ${D}`}}>
                    <td style={{padding:'0.45rem 0.5rem',fontWeight:500}}>{item.name}</td>
                    <td style={{padding:'0.45rem 0.5rem',color:'#888880',fontSize:'0.78rem'}}>{item.quantity}</td>
                    <td style={{padding:'0.45rem 0.5rem',color:'#4a9eff'}}>{item.protein}g</td>
                    <td style={{padding:'0.45rem 0.5rem',color:'#f0a845'}}>{item.carbs}g</td>
                    <td style={{padding:'0.45rem 0.5rem',color:'#e85c3a'}}>{item.fat}g</td>
                    <td style={{padding:'0.45rem 0.5rem',color:'#888880'}}>{item.calories}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        ))}
      </>:<div style={{...card,textAlign:'center' as const,padding:'3rem'}}>
        <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🥗</div>
        <div style={{fontWeight:500,marginBottom:'0.5rem'}}>No diet plan yet</div>
        <div style={{color:'#888880',fontSize:'0.875rem',marginBottom:'1.5rem'}}>Complete assessment and your trainer will create a personalised plan.</div>
        <button style={btn} onClick={()=>setTab('assessment')}>Complete Assessment →</button>
      </div>)}

      {/* ── PROGRESS ── */}
      {tab==='progress'&&<div>
        <div className="g-2" style={{gap:'1rem',marginBottom:'1rem'}}>
          <div style={card}>
            <div style={{fontWeight:500,marginBottom:'1rem'}}>Before vs Now</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
              <div style={{background:'#111',borderRadius:'8px',padding:'1rem'}}><div style={{fontSize:'0.7rem',color:'#888880',textTransform:'uppercase' as const,letterSpacing:'0.08em',marginBottom:'0.4rem'}}>Start</div><div style={{fontSize:'0.875rem'}}>Weight: <strong>{sW||'—'} kg</strong></div></div>
              <div style={{background:'rgba(232,197,71,0.08)',border:'1px solid rgba(232,197,71,0.2)',borderRadius:'8px',padding:'1rem'}}><div style={{fontSize:'0.7rem',color:A,textTransform:'uppercase' as const,letterSpacing:'0.08em',marginBottom:'0.4rem'}}>Current</div><div style={{fontSize:'0.875rem'}}>Weight: <strong style={{color:A}}>{cW||'—'} kg</strong></div>{delta!==0&&<div style={{fontSize:'0.8rem',color:delta<=0?'#4caf7d':'#e85c3a',marginTop:'0.3rem'}}>{delta>0?'+':''}{delta} kg</div>}</div>
            </div>
          </div>
          <div style={card}>
            <div style={{fontWeight:500,marginBottom:'1rem'}}>📊 Log New Entry</div>
            <div style={{display:'flex',flexDirection:'column' as const,gap:'0.75rem'}}>
              <div><label style={lbl}>Weight (kg) *</label><input style={inp} type="number" step="0.1" placeholder="72.5" value={logWeight} onChange={e=>setLogWeight(e.target.value)}/></div>
              <div><label style={lbl}>Notes</label><input style={inp} type="text" placeholder="How are you feeling?" value={logNotes} onChange={e=>setLogNotes(e.target.value)}/></div>
              <button style={btn} onClick={handleLogProgress}>Log Progress →</button>
            </div>
          </div>
        </div>
        <div style={card}><div style={{fontWeight:500,marginBottom:'1rem'}}>Weight Chart</div><WeightChart data={chartData}/></div>
        <div style={card}>
          <div style={{fontWeight:500,marginBottom:'1rem'}}>History ({progress.length} entries)</div>
          {progress.length===0?<div style={{color:'#888880',fontSize:'0.875rem',textAlign:'center' as const,padding:'2rem'}}>No progress logged yet!</div>:(
            <div className="t-scroll">
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.875rem',minWidth:'420px'}}>
                <thead><tr style={{borderBottom:`1px solid ${D}`}}>{['Date','Weight','Change','Mood','Notes'].map(h=><th key={h} style={{textAlign:'left' as const,padding:'0.5rem 0.75rem',color:'#888880',fontSize:'0.72rem',textTransform:'uppercase' as const,fontWeight:400}}>{h}</th>)}</tr></thead>
                <tbody>{progress.map((p,i)=>{const prev=progress[i+1],d=prev?parseFloat((p.weight-prev.weight).toFixed(1)):null;return(
                  <tr key={p._id} style={{borderBottom:`1px solid ${D}`}}>
                    <td style={{padding:'0.6rem 0.75rem'}}>{new Date(p.loggedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
                    <td style={{padding:'0.6rem 0.75rem',fontWeight:600}}>{p.weight} kg</td>
                    <td style={{padding:'0.6rem 0.75rem',color:d===null?'#888880':d<=0?'#4caf7d':'#e85c3a'}}>{d!==null?`${d>0?'+':''}${d} kg`:'—'}</td>
                    <td style={{padding:'0.6rem 0.75rem'}}>{p.mood?['','😞','😐','🙂','😊','🔥'][p.mood]:'—'}</td>
                    <td style={{padding:'0.6rem 0.75rem',color:'#888880',fontSize:'0.82rem'}}>{p.notes||'—'}</td>
                  </tr>
                )})}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>}

      {/* ── PHOTOS ── */}
      {tab==='photos'&&<div style={card}>
        <div style={{fontWeight:500,marginBottom:'0.5rem'}}>📷 Progress Photos</div>
        <div style={{fontSize:'0.85rem',color:'#888880',marginBottom:'1.5rem',lineHeight:1.6}}>Upload progress photos to visually track your transformation. Stored securely.</div>
        <div className="g-photos">
          {['Front View','Side View','Back View'].map(label=>(
            <div key={label}>
              <div style={{fontWeight:500,fontSize:'0.875rem',marginBottom:'0.75rem'}}>{label}</div>
              <label style={{display:'block',cursor:'pointer'}}>
                <div style={{height:'190px',background:'#111',border:`2px dashed ${D}`,borderRadius:'12px',display:'flex',flexDirection:'column' as const,alignItems:'center',justifyContent:'center',gap:'0.75rem',transition:'border-color 0.2s'}}
                  onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(232,197,71,0.4)')}
                  onMouseLeave={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.08)')}>
                  <div style={{fontSize:'2.5rem',opacity:0.4}}>📷</div>
                  <div style={{fontSize:'0.82rem',color:'#888880',textAlign:'center' as const}}>{photoUploading?'Uploading...':'Click to upload'}<br/><span style={{fontSize:'0.72rem'}}>JPEG/PNG · Max 5MB</span></div>
                </div>
                <input type="file" accept="image/jpeg,image/png,image/webp" style={{display:'none'}} onChange={e=>handlePhotoUpload(e,label)}/>
              </label>
            </div>
          ))}
        </div>
      </div>}

      {/* ── PROFILE ── */}
      {tab==='profile'&&<div>
        {/* Assigned Trainer Card */}
        {trainer ? (
          <div style={{...card, marginBottom:'1rem', display:'flex', alignItems:'center', gap:'1.25rem', background:'rgba(232,197,71,0.05)', border:'1px solid rgba(232,197,71,0.2)'}}>
            <div style={{width:'52px', height:'52px', borderRadius:'50%', background:'linear-gradient(135deg,#e8c547,#c8942a)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bebas Neue,sans-serif', fontSize:'1.3rem', color:'#0a0a0a', flexShrink:0}}>
              {trainer.fullName?.split(' ').map((n:string)=>n[0]).join('')}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:'0.68rem', color:A, textTransform:'uppercase' as const, letterSpacing:'0.1em', marginBottom:'0.2rem', fontWeight:700}}>Your Assigned Trainer</div>
              <div style={{fontWeight:600, fontSize:'1rem', color:'#f0ede8'}}>{trainer.fullName}</div>
              {trainer.email && <div style={{fontSize:'0.8rem', color:'#888880', marginTop:'0.2rem'}}>{trainer.email}</div>}
            </div>
            <div style={{background:'rgba(232,197,71,0.12)', border:'1px solid rgba(232,197,71,0.25)', color:A, padding:'0.3rem 0.8rem', borderRadius:'100px', fontSize:'0.72rem', fontWeight:700}}>Active</div>
          </div>
        ) : (
          <div style={{...card, marginBottom:'1rem', display:'flex', alignItems:'center', gap:'1rem', opacity:0.7}}>
            <div style={{width:'48px', height:'48px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', border:'1px dashed rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0}}>🏋️</div>
            <div>
              <div style={{fontSize:'0.68rem', color:'#888880', textTransform:'uppercase' as const, letterSpacing:'0.1em', marginBottom:'0.2rem'}}>Your Assigned Trainer</div>
              <div style={{color:'#888880', fontSize:'0.875rem'}}>No trainer assigned yet. Contact admin to get a trainer assigned to you.</div>
            </div>
          </div>
        )}
        <div className="g-2" style={{gap:'1rem',marginBottom:'1rem'}}>
          {[{title:'Personal Details',rows:[['Full Name',user?.fullName],['Email',user?.email],['Member ID',user?.memberId],['Role',user?.role],['Since',user?.createdAt?new Date(user.createdAt).toLocaleDateString('en-IN'):'—']]},
            {title:'Membership',rows:[['Plan',user?.membership?.plan?.toUpperCase()],['Status',user?.membership?.status||'—'],['Expires',user?.membership?.endDate?new Date(user.membership.endDate).toLocaleDateString('en-IN'):'—']]},
            {title:'Fitness Profile',rows:[['Goal',assess?.fitnessGoal?.replace('-',' ')||'Not set'],['Activity',assess?.activityLevel||'Not set'],['Diet',assess?.dietPreference||'Not set'],['BMI',assess?`${assess.bmi} (${assess.bmiCategory})`:'—']]},
            {title:'Body Metrics',rows:[['Current',`${cW||'—'} kg`],['Start',`${sW||'—'} kg`],['Height',assess?`${assess.height} cm`:'—'],['Change',`${delta>0?'+':''}${delta||0} kg`],['Logs',String(progress.length)]]},
          ].map(sec=>(
            <div key={sec.title} style={card}>
              <div style={{fontSize:'0.72rem',color:'#888880',textTransform:'uppercase' as const,letterSpacing:'0.08em',marginBottom:'1rem',fontWeight:500}}>{sec.title}</div>
              {sec.rows.map(([l,v])=>(
                <div key={String(l)} style={{display:'flex',justifyContent:'space-between',padding:'0.55rem 0',borderBottom:`1px solid ${D}`,fontSize:'0.875rem'}}>
                  <span style={{color:'#888880'}}>{l}</span>
                  <span style={{fontWeight:500,color:l==='Member ID'?A:'#f0ede8'}}>{v as string||'—'}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:'1rem',flexWrap:'wrap' as const}}>
          <button style={btn} onClick={handleDownloadPDF}>⬇ PDF Report</button>
          <button style={ghost} onClick={()=>setTab('assessment')}>✏️ Update Assessment</button>
          <button style={ghost} onClick={()=>setTab('upgrade')}>💳 Upgrade Plan</button>
        </div>
      </div>}

      {/* ── UPGRADE ── */}
      {tab==='upgrade'&&<div>
        {expired&&<div style={{background:'rgba(232,92,58,0.1)',border:'1px solid rgba(232,92,58,0.3)',borderRadius:'10px',padding:'1rem 1.4rem',marginBottom:'1.5rem',fontSize:'0.875rem'}}>⚠️ Expired on <strong style={{color:'#e85c3a'}}>{new Date(user.membership.endDate).toLocaleDateString('en-IN')}</strong>. Renew below.</div>}
        <div style={{background:'rgba(232,197,71,0.06)',border:'1px solid rgba(232,197,71,0.15)',borderRadius:'10px',padding:'1rem 1.4rem',marginBottom:'1.5rem',fontSize:'0.875rem'}}>
          💳 Current: <strong style={{color:A}}>{user?.membership?.plan?.toUpperCase()||'FREE'}</strong>
          {user?.membership?.endDate&&!expired&&<span style={{color:'#888880'}}> · Expires {new Date(user.membership.endDate).toLocaleDateString('en-IN')}</span>}
        </div>
        <div className="g-3" style={{gap:'1rem'}}>
          {[{plan:'standard',name:'Standard',price:'1,999',features:['Full gym access','Basic workout plans','Diet chart','Progress tracking','Email support'],c:'#4caf7d',popular:false},
            {plan:'pro',name:'Pro',price:'3,499',features:['Everything in Standard','Personalised coach','Custom diet plans','Weekly check-ins','Priority support','Workout library'],c:A,popular:true},
            {plan:'elite',name:'Elite',price:'5,999',features:['Everything in Pro','1-on-1 coach sessions','Meal prep guidance','Body scans','Supplement guidance','24/7 WhatsApp'],c:'#4a9eff',popular:false},
          ].map(p=>(
            <div key={p.plan} style={{background:p.popular?'rgba(232,197,71,0.05)':C,border:`1px solid ${p.popular?'rgba(232,197,71,0.3)':D}`,borderRadius:'14px',padding:'2rem',position:'relative' as const,display:'flex',flexDirection:'column' as const}}>
              {p.popular&&<div style={{position:'absolute' as const,top:'-12px',left:'50%',transform:'translateX(-50%)',background:A,color:'#0a0a0a',fontSize:'0.65rem',fontWeight:700,textTransform:'uppercase' as const,letterSpacing:'0.1em',padding:'0.25rem 0.9rem',borderRadius:'100px',whiteSpace:'nowrap' as const}}>Most Popular</div>}
              <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'1.3rem',letterSpacing:'0.08em',color:p.c,marginBottom:'0.4rem'}}>{p.name}</div>
              <div style={{display:'flex',alignItems:'baseline',gap:'0.2rem',marginBottom:'1.5rem'}}>
                <span style={{fontSize:'0.85rem',color:'#888880'}}>₹</span>
                <span style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'3rem',color:'#f0ede8',lineHeight:1}}>{p.price}</span>
                <span style={{fontSize:'0.8rem',color:'#888880'}}>/mo</span>
              </div>
              <div style={{display:'flex',flexDirection:'column' as const,gap:'0.6rem',marginBottom:'1.5rem',flex:1}}>
                {p.features.map(f=><div key={f} style={{display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'0.82rem',color:'#c0bcb5'}}><span style={{color:p.c,fontSize:'0.85rem'}}>✓</span>{f}</div>)}
              </div>
              <button onClick={()=>handleBuyPlan(p.plan)} disabled={payLoading===p.plan||user?.membership?.plan===p.plan}
                style={{width:'100%',padding:'0.8rem',background:p.popular?A:'transparent',border:`1px solid ${p.popular?A:p.c}`,color:p.popular?'#0a0a0a':p.c,borderRadius:'8px',cursor:user?.membership?.plan===p.plan?'default':'pointer',fontSize:'0.875rem',fontWeight:700,fontFamily:'inherit',opacity:user?.membership?.plan===p.plan?0.5:1,transition:'all 0.2s'}}>
                {user?.membership?.plan===p.plan?'✓ Current':payLoading===p.plan?'Processing...':`Buy ${p.name} →`}
              </button>
            </div>
          ))}
        </div>
        <div style={{marginTop:'1.5rem',display:'flex',justifyContent:'center',gap:'1.5rem',flexWrap:'wrap' as const,fontSize:'0.78rem',color:'#555550'}}>
          <span>🔒 SSL</span><span>💳 UPI · Cards · EMI</span><span>↩️ 7-day refund</span><span style={{color:A}}>⚡ Razorpay</span>
        </div>
      </div>}

    </main>
  </div>
}
