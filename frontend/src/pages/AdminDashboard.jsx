import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Shield, Users, Building2, FileCheck, Activity,
  CheckCircle, XCircle, Trash2, Search,
  AlertTriangle, Clock, LogOut, X
} from 'lucide-react'
import { adminAuthService } from '../services/adminAuthService'
import api from '../services/api'

// ── 3D Canvas (same as AdminLogin) ──────────────────────────────────
const AdminBackground = () => {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const dots = Array.from({ length: 80 }, () => ({ x:(Math.random()-.5)*1800, y:(Math.random()-.5)*1800, z:Math.random()*1200, r:Math.random()*2+.5, speed:.25+Math.random()*.4 }))
    const cubes = Array.from({ length: 5 }, () => ({ x:(Math.random()-.5)*1200, y:(Math.random()-.5)*800, size:25+Math.random()*55, rx:Math.random()*Math.PI*2, ry:Math.random()*Math.PI*2, drx:(Math.random()-.5)*.005, dry:(Math.random()-.5)*.005, alpha:.04+Math.random()*.05 }))
    function project(x,y,z,cx,cy){const s=600/(600+z);return{px:x*s+cx,py:y*s+cy,scale:s}}
    function drawCube(cube,cx,cy){const s=cube.size/2,verts=[[-s,-s,-s],[s,-s,-s],[s,s,-s],[-s,s,-s],[-s,-s,s],[s,-s,s],[s,s,s],[-s,s,s]];const crx=Math.cos(cube.rx),srx=Math.sin(cube.rx),cry=Math.cos(cube.ry),sry=Math.sin(cube.ry);const proj=verts.map(([vx,vy,vz])=>{const tx=vx*cry-vz*sry,tz=vx*sry+vz*cry,ty2=vy*crx-tz*srx,tz2=vy*srx+tz*crx,sc=400/(400+tz2+200);return[tx*sc+cx+cube.x,ty2*sc+cy+cube.y]});const edges=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];ctx.strokeStyle=`rgba(99,102,241,${cube.alpha})`;ctx.lineWidth=.8;ctx.beginPath();edges.forEach(([a,b])=>{ctx.moveTo(proj[a][0],proj[a][1]);ctx.lineTo(proj[b][0],proj[b][1])});ctx.stroke()}
    let animId
    function animate(){ctx.clearRect(0,0,canvas.width,canvas.height);const cx=canvas.width/2,cy=canvas.height/2;ctx.strokeStyle='rgba(99,102,241,.025)';ctx.lineWidth=.5;for(let i=0;i<dots.length;i++){const a=project(dots[i].x,dots[i].y,dots[i].z,cx,cy);for(let j=i+1;j<dots.length;j++){const b=project(dots[j].x,dots[j].y,dots[j].z,cx,cy);if(Math.hypot(a.px-b.px,a.py-b.py)<90){ctx.beginPath();ctx.moveTo(a.px,a.py);ctx.lineTo(b.px,b.py);ctx.stroke()}}}dots.forEach(d=>{d.z-=d.speed;if(d.z<0)d.z=1200;const{px,py,scale}=project(d.x,d.y,d.z,cx,cy);if(px<0||px>canvas.width||py<0||py>canvas.height)return;ctx.beginPath();ctx.arc(px,py,d.r*scale,0,Math.PI*2);ctx.fillStyle=`rgba(148,163,255,${.4*scale})`;ctx.fill()});cubes.forEach(c=>{c.rx+=c.drx;c.ry+=c.dry;drawCube(c,cx,cy)});animId=requestAnimationFrame(animate)}
    animate()
    return()=>{window.removeEventListener('resize',resize);cancelAnimationFrame(animId)}
  },[])
  return <canvas ref={canvasRef} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>
}

const glass = {background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',backdropFilter:'blur(20px)'}
const glassCard = {...glass,borderRadius:16,boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}

const AdminDashboard = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [actionModal, setActionModal] = useState(null)
  const [actionReason, setActionReason] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const adminUser = adminAuthService.getCurrentAdmin()

  const {data:stats} = useQuery({queryKey:['adminStats'],queryFn:async()=>{const r=await api.get('/admin/stats');return r||{}},enabled:!!adminUser,staleTime:0,refetchOnMount:true})
  const {data:pendingOrgs,isLoading:orgsLoading} = useQuery({queryKey:['pendingOrganizations'],queryFn:async()=>{const r=await api.get('/admin/organizations/pending');return Array.isArray(r)?r:(r?.data||[])},enabled:!!adminUser,staleTime:0,refetchOnMount:true})
  const {data:users,isLoading:usersLoading} = useQuery({queryKey:['allUsers',searchQuery],queryFn:async()=>{const r=await api.get(`/admin/users${searchQuery?`?search=${searchQuery}`:''}`);return Array.isArray(r)?r:(r?.data||[])},enabled:!!adminUser&&activeTab==='users',staleTime:0,refetchOnMount:true})

  const closeModal = () => {setActionModal(null);setSelectedOrg(null);setSelectedUser(null);setActionReason('')}

  const approveMutation = useMutation({mutationFn:({id,message})=>api.post(`/admin/organizations/${id}/approve`,{message}),onSuccess:()=>{queryClient.invalidateQueries(['pendingOrganizations']);queryClient.invalidateQueries(['adminStats']);closeModal();toast.success('Approved!')},onError:(e)=>toast.error(e.response?.data?.message||'Failed')})
  const rejectMutation = useMutation({mutationFn:({id,reason})=>api.post(`/admin/organizations/${id}/reject`,{reason}),onSuccess:()=>{queryClient.invalidateQueries(['pendingOrganizations']);queryClient.invalidateQueries(['adminStats']);closeModal();toast.success('Rejected')},onError:(e)=>toast.error(e.response?.data?.message||'Failed')})
  const deleteUserMutation = useMutation({mutationFn:({id,reason})=>api.delete(`/admin/users/${id}`,{data:{reason}}),onSuccess:()=>{queryClient.invalidateQueries(['allUsers']);queryClient.invalidateQueries(['adminStats']);closeModal();toast.success('User deleted')},onError:(e)=>toast.error(e.response?.data?.message||'Failed')})
  const deleteOrgMutation = useMutation({mutationFn:({id,reason})=>api.delete(`/admin/organizations/${id}`,{data:{reason}}),onSuccess:()=>{queryClient.invalidateQueries(['allUsers']);queryClient.invalidateQueries(['adminStats']);closeModal();toast.success('Org removed')},onError:(e)=>toast.error(e.response?.data?.message||'Failed')})

  const isLoading = approveMutation.isPending||rejectMutation.isPending||deleteUserMutation.isPending||deleteOrgMutation.isPending

  const confirmAction = () => {
    if(actionModal==='approve')approveMutation.mutate({id:selectedOrg.id,message:actionReason||'Approved'})
    else if(actionModal==='reject')rejectMutation.mutate({id:selectedOrg.id,reason:actionReason})
    else if(actionModal==='deleteUser')deleteUserMutation.mutate({id:selectedUser.id,reason:actionReason})
    else if(actionModal==='deleteOrg')deleteOrgMutation.mutate({id:selectedUser.organization.id,reason:actionReason})
  }

  const modals = {
    approve:{title:'Approve Org',label:'Approve',btnColor:'rgba(34,197,94,.9)',required:false,desc:`Allow "${selectedOrg?.name}" to post.`,descBg:'rgba(34,197,94,.15)',descBorder:'rgba(34,197,94,.25)',descText:'#86efac'},
    reject:{title:'Reject Application',label:'Reject',btnColor:'rgba(239,68,68,.9)',required:true,desc:`Rejecting "${selectedOrg?.name}".`,descBg:'rgba(239,68,68,.12)',descBorder:'rgba(239,68,68,.25)',descText:'#fca5a5'},
    deleteUser:{title:'Delete User',label:'Delete',btnColor:'rgba(239,68,68,.9)',required:true,desc:`Delete "${selectedUser?.name}". Irreversible.`,descBg:'rgba(239,68,68,.12)',descBorder:'rgba(239,68,68,.25)',descText:'#fca5a5'},
    deleteOrg:{title:'Remove Org Only',label:'Remove',btnColor:'rgba(249,115,22,.9)',required:true,desc:`Remove "${selectedUser?.organization?.name}". User stays.`,descBg:'rgba(249,115,22,.12)',descBorder:'rgba(249,115,22,.25)',descText:'#fdba74'},
  }
  const mc = actionModal ? modals[actionModal] : null

  return (
    <div style={{minHeight:'100vh',background:'#080d1a',position:'relative',fontFamily:'system-ui,sans-serif'}}>
      <AdminBackground/>
      <div style={{position:'relative',zIndex:1}}>

        {/* Header */}
        <div style={{...glass,borderBottom:'1px solid rgba(255,255,255,0.06)',borderRadius:0}}>
          <div style={{maxWidth:1200,margin:'0 auto',padding:'0 16px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#3b82f6,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(99,102,241,0.4)',flexShrink:0}}>
                <Shield className="w-4 h-4 text-white"/>
              </div>
              <div>
                <div style={{color:'#fff',fontWeight:700,fontSize:15}}>Admin Dashboard</div>
                <div style={{color:'rgba(255,255,255,0.3)',fontSize:10,letterSpacing:'1.5px',textTransform:'uppercase'}}>MyanVolunteer</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div className="hidden sm:block" style={{textAlign:'right'}}>
                <div style={{color:'#fff',fontSize:13,fontWeight:600}}>{adminUser?.name}</div>
                <div style={{color:'rgba(255,255,255,0.3)',fontSize:11}}>{adminUser?.email}</div>
              </div>
              <button onClick={()=>{adminAuthService.logout();navigate('/admin/login')}}
                style={{display:'flex',alignItems:'center',gap:6,padding:'8px 12px',borderRadius:10,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.7)',fontSize:12,cursor:'pointer'}}>
                <LogOut className="w-4 h-4"/><span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div style={{maxWidth:1200,margin:'0 auto',padding:'20px 16px'}}>

          {/* Stat Cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:20}}>
            {[
              {icon:<Users className="w-6 h-6"/>,label:'Total Users',value:stats?.totalUsers??0,accent:'#3b82f6'},
              {icon:<Building2 className="w-6 h-6"/>,label:'Organizations',value:stats?.totalOrganizations??0,accent:'#22c55e'},
              {icon:<Clock className="w-6 h-6"/>,label:'Pending',value:stats?.pendingOrganizations??0,accent:'#f97316',pulse:stats?.pendingOrganizations>0},
              {icon:<CheckCircle className="w-6 h-6"/>,label:'Approved',value:stats?.approvedOrganizations??0,accent:'#10b981'},
            ].map(s=>(
              <div key={s.label} style={{...glassCard,padding:'16px',position:'relative',overflow:'hidden'}}>
                {s.pulse&&<div style={{position:'absolute',inset:0,borderRadius:16,border:`1px solid ${s.accent}`,opacity:.4,animation:'pulseRing 2s ease-in-out infinite'}}/>}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                  <div style={{color:s.accent}}>{s.icon}</div>
                  {s.pulse&&<AlertTriangle className="w-4 h-4" style={{color:s.accent}}/>}
                </div>
                <div style={{color:'rgba(255,255,255,0.4)',fontSize:11,fontWeight:600,letterSpacing:'.5px',marginBottom:4}}>{s.label}</div>
                <div style={{color:'#fff',fontSize:28,fontWeight:800,lineHeight:1}}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{...glassCard,marginBottom:16,padding:'4px',display:'flex',gap:4,overflowX:'auto'}}>
            {[
              {id:'overview',label:'Overview'},
              {id:'pending',label:`Pending (${stats?.pendingOrganizations??0})`,badge:stats?.pendingOrganizations>0},
              {id:'users',label:'Users'},
            ].map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                style={{position:'relative',display:'flex',alignItems:'center',gap:6,padding:'10px 14px',borderRadius:12,border:'none',cursor:'pointer',fontSize:12,fontWeight:600,transition:'all .2s',whiteSpace:'nowrap',
                  background:activeTab===tab.id?'rgba(99,102,241,0.2)':'transparent',
                  color:activeTab===tab.id?'#a5b4fc':'rgba(255,255,255,0.4)',
                  borderBottom:activeTab===tab.id?'1px solid rgba(99,102,241,0.4)':'1px solid transparent'}}>
                {tab.label}
                {tab.badge&&<span style={{position:'absolute',top:8,right:8,width:6,height:6,borderRadius:'50%',background:'#f97316',animation:'blink 2s infinite'}}/>}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{...glassCard,padding:'20px 16px'}}>

            {activeTab==='overview'&&(
              <div>
                <h2 style={{color:'#fff',fontSize:18,fontWeight:700,marginBottom:20}}>System Overview</h2>
                <div style={{display:'grid',gridTemplateColumns:'1fr',gap:12}}>
                  {[
                    {section:'Organizations',items:[{label:'Total',value:stats?.totalOrganizations??0},{label:'Approved',value:stats?.approvedOrganizations??0,color:'#4ade80'},{label:'Pending',value:stats?.pendingOrganizations??0,color:'#fb923c'}]},
                    {section:'Platform Activity',items:[{label:'Users',value:stats?.totalUsers??0},{label:'Opportunities',value:stats?.totalOpportunities??0},{label:'Applications',value:stats?.totalApplications??0}]},
                  ].map(({section,items})=>(
                    <div key={section} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:12,padding:'16px'}}>
                      <div style={{color:'rgba(255,255,255,0.35)',fontSize:10,fontWeight:600,letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:14}}>{section}</div>
                      {items.map(({label,value,color})=>(
                        <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                          <span style={{color:'rgba(255,255,255,0.5)',fontSize:13}}>{label}</span>
                          <span style={{color:color||'#fff',fontWeight:700,fontSize:15}}>{value}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab==='pending'&&(
              <div>
                <h2 style={{color:'#fff',fontSize:18,fontWeight:700,marginBottom:18}}>Pending ({(pendingOrgs||[]).length})</h2>
                {orgsLoading?<div style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.3)'}}>Loading...</div>
                :!(pendingOrgs||[]).length?(
                  <div style={{textAlign:'center',padding:40}}>
                    <CheckCircle style={{width:40,height:40,color:'#4ade80',margin:'0 auto 12px'}}/>
                    <div style={{color:'#fff',fontSize:16,fontWeight:600}}>All caught up!</div>
                    <div style={{color:'rgba(255,255,255,0.35)',fontSize:13,marginTop:4}}>No pending verifications</div>
                  </div>
                ):(pendingOrgs||[]).map(org=>(
                  <div key={org.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,padding:'16px',marginBottom:14}}>
                    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                      <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#3b82f6,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:16,flexShrink:0}}>
                        {org.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{color:'#fff',fontWeight:700,fontSize:14}}>{org.name}</div>
                        <div style={{color:'rgba(255,255,255,0.35)',fontSize:11}}>{org.user?.email}</div>
                      </div>
                    </div>
                    <p style={{color:'rgba(255,255,255,0.45)',fontSize:12,lineHeight:1.5,marginBottom:12}}>{org.description?.slice(0,120)}...</p>
                    <div style={{display:'flex',gap:8,borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:12}}>
                      <button onClick={()=>{setSelectedOrg(org);setActionModal('approve')}}
                        style={{flex:1,padding:'10px',borderRadius:10,background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.3)',color:'#4ade80',fontSize:12,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                        <CheckCircle className="w-4 h-4"/>Approve
                      </button>
                      <button onClick={()=>{setSelectedOrg(org);setActionModal('reject')}}
                        style={{flex:1,padding:'10px',borderRadius:10,background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.25)',color:'#f87171',fontSize:12,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                        <XCircle className="w-4 h-4"/>Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab==='users'&&(
              <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
                  <h2 style={{color:'#fff',fontSize:18,fontWeight:700}}>Users</h2>
                  <div style={{position:'relative'}}>
                    <Search style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',width:14,height:14,color:'rgba(255,255,255,0.3)'}}/>
                    <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search users..."
                      style={{paddingLeft:32,paddingRight:12,paddingTop:8,paddingBottom:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'#fff',fontSize:13,outline:'none',width:200}}/>
                  </div>
                </div>
                {usersLoading?<div style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.3)'}}>Loading...</div>
                :(users||[]).length>0?(
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {(users||[]).map(user=>(
                      <div key={user.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{color:'#fff',fontSize:13,fontWeight:600,marginBottom:2}}>{user.name}</div>
                          <div style={{color:'rgba(255,255,255,0.35)',fontSize:11,marginBottom:4}}>{user.email}</div>
                          <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                            <span style={{padding:'2px 8px',borderRadius:20,fontSize:10,fontWeight:600,
                              background:user.role==='admin'?'rgba(59,130,246,0.15)':user.role==='organization'?'rgba(168,85,247,0.15)':'rgba(34,197,94,0.15)',
                              color:user.role==='admin'?'#93c5fd':user.role==='organization'?'#d8b4fe':'#86efac'}}>
                              {user.role}
                            </span>
                            {user.isVerified?<CheckCircle style={{width:12,height:12,color:'#4ade80'}}/>:<XCircle style={{width:12,height:12,color:'rgba(255,255,255,0.2)'}}/>}
                          </div>
                        </div>
                        {user.role!=='admin'&&(
                          <div style={{display:'flex',gap:6,flexShrink:0}}>
                            {user.organization&&(
                              <button onClick={()=>{setSelectedUser(user);setActionModal('deleteOrg')}} title="Remove org only"
                                style={{padding:'7px',borderRadius:8,background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.2)',color:'#fb923c',cursor:'pointer'}}>
                                <Building2 style={{width:14,height:14}}/>
                              </button>
                            )}
                            <button onClick={()=>{setSelectedUser(user);setActionModal('deleteUser')}} title="Delete user"
                              style={{padding:'7px',borderRadius:8,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171',cursor:'pointer'}}>
                              <Trash2 style={{width:14,height:14}}/>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ):(
                  <div style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.3)',fontSize:13}}>No users found</div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {actionModal&&mc&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,padding:16}}
          onClick={e=>e.target===e.currentTarget&&closeModal()}>
          <div style={{...glassCard,width:'100%',maxWidth:420,background:'rgba(10,15,30,0.95)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
              <span style={{color:'#fff',fontWeight:700,fontSize:15}}>{mc.title}</span>
              <button onClick={closeModal} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.4)'}}><X className="w-5 h-5"/></button>
            </div>
            <div style={{padding:'16px 20px',display:'flex',flexDirection:'column',gap:14}}>
              <div style={{padding:'12px 14px',borderRadius:10,background:mc.descBg,border:`1px solid ${mc.descBorder}`,color:mc.descText,fontSize:13,lineHeight:1.5}}>{mc.desc}</div>
              <div>
                <label style={{display:'block',color:'rgba(255,255,255,0.4)',fontSize:11,fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',marginBottom:6}}>
                  {mc.required?'Reason *':'Message (optional)'}
                </label>
                <textarea value={actionReason} onChange={e=>setActionReason(e.target.value)}
                  placeholder={mc.required?'Minimum 10 characters...':'Optional...'}
                  rows={3} autoFocus
                  style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'10px 12px',color:'#fff',fontSize:13,outline:'none',resize:'none',fontFamily:'inherit',boxSizing:'border-box'}}/>
                {mc.required&&<div style={{fontSize:11,marginTop:4,color:actionReason.trim().length>=10?'#4ade80':'rgba(255,255,255,0.3)'}}>{actionReason.trim().length}/10 min</div>}
              </div>
            </div>
            <div style={{display:'flex',gap:10,padding:'0 20px 20px'}}>
              <button onClick={closeModal} disabled={isLoading}
                style={{flex:1,padding:'11px',borderRadius:10,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.6)',fontSize:13,fontWeight:600,cursor:'pointer'}}>
                Cancel
              </button>
              <button onClick={confirmAction} disabled={isLoading||(mc.required&&actionReason.trim().length<10)}
                style={{flex:1,padding:'11px',borderRadius:10,background:mc.btnColor,border:'none',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',opacity:(isLoading||(mc.required&&actionReason.trim().length<10))?.4:1}}>
                {isLoading?'Processing...':mc.label}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulseRing{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.6;transform:scale(1.01)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        .hidden{display:none}
        @media(min-width:640px){.sm\\:block{display:block!important}.sm\\:inline{display:inline!important}}
      `}</style>
    </div>
  )
}

export default AdminDashboard
