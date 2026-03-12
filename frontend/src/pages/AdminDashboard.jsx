import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Shield, Users, Building2, FileCheck, Activity,
  CheckCircle, XCircle, Trash2, Search,
  AlertTriangle, Clock, Mail, Phone, LogOut, X
} from 'lucide-react'
import { adminAuthService } from '../services/adminAuthService'
import api from '../services/api'

// ── 3D Canvas Background (shared with AdminLogin) ─────────────────
const AdminBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const dots = Array.from({ length: 100 }, () => ({
      x: (Math.random() - 0.5) * 1800,
      y: (Math.random() - 0.5) * 1800,
      z: Math.random() * 1200,
      r: Math.random() * 2 + 0.5,
      speed: 0.25 + Math.random() * 0.4
    }))

    const cubes = Array.from({ length: 6 }, () => ({
      x: (Math.random() - 0.5) * window.innerWidth,
      y: (Math.random() - 0.5) * window.innerHeight,
      size: 25 + Math.random() * 55,
      rx: Math.random() * Math.PI * 2,
      ry: Math.random() * Math.PI * 2,
      drx: (Math.random() - 0.5) * 0.005,
      dry: (Math.random() - 0.5) * 0.005,
      alpha: 0.04 + Math.random() * 0.05
    }))

    function project(x, y, z, cx, cy, fov = 600) {
      const scale = fov / (fov + z)
      return { px: x * scale + cx, py: y * scale + cy, scale }
    }

    function drawCube(cube, cx, cy) {
      const s = cube.size / 2
      const verts = [[-s,-s,-s],[s,-s,-s],[s,s,-s],[-s,s,-s],[-s,-s,s],[s,-s,s],[s,s,s],[-s,s,s]]
      const crx = Math.cos(cube.rx), srx = Math.sin(cube.rx)
      const cry = Math.cos(cube.ry), sry = Math.sin(cube.ry)
      const proj = verts.map(([vx, vy, vz]) => {
        const tx = vx * cry - vz * sry
        const tz = vx * sry + vz * cry
        const ty2 = vy * crx - tz * srx
        const tz2 = vy * srx + tz * crx
        const sc = 400 / (400 + tz2 + 200)
        return [tx * sc + cx + cube.x, ty2 * sc + cy + cube.y]
      })
      const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]
      ctx.strokeStyle = `rgba(99,102,241,${cube.alpha})`
      ctx.lineWidth = 0.8
      ctx.beginPath()
      edges.forEach(([a, b]) => { ctx.moveTo(proj[a][0], proj[a][1]); ctx.lineTo(proj[b][0], proj[b][1]) })
      ctx.stroke()
    }

    let animId
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2, cy = canvas.height / 2

      ctx.strokeStyle = 'rgba(99,102,241,0.025)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < dots.length; i++) {
        const a = project(dots[i].x, dots[i].y, dots[i].z, cx, cy)
        for (let j = i + 1; j < dots.length; j++) {
          const b = project(dots[j].x, dots[j].y, dots[j].z, cx, cy)
          if (Math.hypot(a.px - b.px, a.py - b.py) < 90) {
            ctx.beginPath(); ctx.moveTo(a.px, a.py); ctx.lineTo(b.px, b.py); ctx.stroke()
          }
        }
      }

      dots.forEach(d => {
        d.z -= d.speed
        if (d.z < 0) d.z = 1200
        const { px, py, scale } = project(d.x, d.y, d.z, cx, cy)
        if (px < 0 || px > canvas.width || py < 0 || py > canvas.height) return
        ctx.beginPath()
        ctx.arc(px, py, d.r * scale, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(148,163,255,${0.4 * scale})`
        ctx.fill()
      })

      cubes.forEach(cube => { cube.rx += cube.drx; cube.ry += cube.dry; drawCube(cube, cx, cy) })
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId) }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', top: 0, left: 0, width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', transform: 'translate(-30%,-30%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: 0, right: 0, width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', transform: 'translate(30%,30%)', pointerEvents: 'none', zIndex: 0 }} />
    </>
  )
}

// ── Glass panel style helper ───────────────────────────────────────
const glass = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
}

const glassCard = {
  ...glass,
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
}

// ── Main Component ─────────────────────────────────────────────────
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

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => { const r = await api.get('/admin/stats'); return r || {} },
    enabled: !!adminUser, staleTime: 0, cacheTime: 0, refetchOnMount: true
  })

  const { data: pendingOrgs, isLoading: orgsLoading } = useQuery({
    queryKey: ['pendingOrganizations'],
    queryFn: async () => { const r = await api.get('/admin/organizations/pending'); return Array.isArray(r) ? r : (r?.data || []) },
    enabled: !!adminUser, staleTime: 0, cacheTime: 0, refetchOnMount: true
  })

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers', searchQuery],
    queryFn: async () => { const r = await api.get(`/admin/users${searchQuery ? `?search=${searchQuery}` : ''}`); return Array.isArray(r) ? r : (r?.data || []) },
    enabled: !!adminUser && activeTab === 'users', staleTime: 0, cacheTime: 0, refetchOnMount: true
  })

  const closeModal = () => { setActionModal(null); setSelectedOrg(null); setSelectedUser(null); setActionReason('') }

  const approveMutation = useMutation({
    mutationFn: ({ id, message }) => api.post(`/admin/organizations/${id}/approve`, { message }),
    onSuccess: () => { queryClient.invalidateQueries(['pendingOrganizations']); queryClient.invalidateQueries(['adminStats']); closeModal(); toast.success('Organization approved!') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to approve')
  })
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => api.post(`/admin/organizations/${id}/reject`, { reason }),
    onSuccess: () => { queryClient.invalidateQueries(['pendingOrganizations']); queryClient.invalidateQueries(['adminStats']); closeModal(); toast.success('Organization rejected') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to reject')
  })
  const deleteUserMutation = useMutation({
    mutationFn: ({ id, reason }) => api.delete(`/admin/users/${id}`, { data: { reason } }),
    onSuccess: () => { queryClient.invalidateQueries(['allUsers']); queryClient.invalidateQueries(['adminStats']); closeModal(); toast.success('User deleted') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete user')
  })
  const deleteOrgMutation = useMutation({
    mutationFn: ({ id, reason }) => api.delete(`/admin/organizations/${id}`, { data: { reason } }),
    onSuccess: () => { queryClient.invalidateQueries(['allUsers']); queryClient.invalidateQueries(['adminStats']); closeModal(); toast.success('Organization removed') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to remove organization')
  })

  const isLoading = approveMutation.isPending || rejectMutation.isPending || deleteUserMutation.isPending || deleteOrgMutation.isPending

  const confirmAction = () => {
    if (actionModal === 'approve') approveMutation.mutate({ id: selectedOrg.id, message: actionReason || 'Organization verified and approved' })
    else if (actionModal === 'reject') rejectMutation.mutate({ id: selectedOrg.id, reason: actionReason })
    else if (actionModal === 'deleteUser') deleteUserMutation.mutate({ id: selectedUser.id, reason: actionReason })
    else if (actionModal === 'deleteOrg') deleteOrgMutation.mutate({ id: selectedUser.organization.id, reason: actionReason })
  }

  const modalConfig = actionModal ? {
    approve: { title: 'Approve Organization', icon: <CheckCircle className="w-5 h-5 text-green-400" />, label: 'Confirm Approval', btnColor: 'rgba(34,197,94,0.9)', required: false, desc: `Allow "${selectedOrg?.name}" to post volunteer opportunities.`, descColor: 'rgba(34,197,94,0.15)', descBorder: 'rgba(34,197,94,0.25)', descText: '#86efac' },
    reject: { title: 'Reject Application', icon: <XCircle className="w-5 h-5 text-red-400" />, label: 'Confirm Rejection', btnColor: 'rgba(239,68,68,0.9)', required: true, desc: `Rejecting "${selectedOrg?.name}". They will be notified with your reason.`, descColor: 'rgba(239,68,68,0.12)', descBorder: 'rgba(239,68,68,0.25)', descText: '#fca5a5' },
    deleteUser: { title: 'Delete User Account', icon: <Trash2 className="w-5 h-5 text-red-400" />, label: 'Delete User', btnColor: 'rgba(239,68,68,0.9)', required: true, desc: `Permanently deleting "${selectedUser?.name}"${selectedUser?.organization ? ` and their org "${selectedUser.organization.name}"` : ''}. Cannot be undone.`, descColor: 'rgba(239,68,68,0.12)', descBorder: 'rgba(239,68,68,0.25)', descText: '#fca5a5' },
    deleteOrg: { title: 'Remove Organization Only', icon: <Building2 className="w-5 h-5 text-orange-400" />, label: 'Remove Organization', btnColor: 'rgba(249,115,22,0.9)', required: true, desc: `Removing "${selectedUser?.organization?.name}". User account "${selectedUser?.name}" stays active.`, descColor: 'rgba(249,115,22,0.12)', descBorder: 'rgba(249,115,22,0.25)', descText: '#fdba74' },
  }[actionModal] : null

  const statCards = [
    { icon: <Users className="w-7 h-7" />, label: 'Total Users', value: stats?.totalUsers ?? 0, accent: '#3b82f6' },
    { icon: <Building2 className="w-7 h-7" />, label: 'Total Organizations', value: stats?.totalOrganizations ?? 0, accent: '#22c55e' },
    { icon: <Clock className="w-7 h-7" />, label: 'Pending Reviews', value: stats?.pendingOrganizations ?? 0, accent: '#f97316', pulse: stats?.pendingOrganizations > 0 },
    { icon: <CheckCircle className="w-7 h-7" />, label: 'Approved Orgs', value: stats?.approvedOrganizations ?? 0, accent: '#10b981' },
  ]

  const tabs = [
    { id: 'overview', icon: <Activity className="w-4 h-4" />, label: 'Overview' },
    { id: 'pending', icon: <FileCheck className="w-4 h-4" />, label: `Pending (${stats?.pendingOrganizations ?? 0})`, badge: stats?.pendingOrganizations > 0 },
    { id: 'users', icon: <Users className="w-4 h-4" />, label: 'Users' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#080d1a', position: 'relative', fontFamily: 'system-ui, sans-serif' }}>
      <AdminBackground />

      {/* Content wrapper above canvas */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <div style={{ ...glass, borderBottom: '1px solid rgba(255,255,255,0.06)', borderRadius: 0 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, letterSpacing: '-0.3px' }}>Admin Dashboard</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase' }}>MyanVolunteer · Secure</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{adminUser?.name || 'Admin'}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{adminUser?.email}</div>
              </div>
              <button onClick={() => { adminAuthService.logout(); navigate('/admin/login') }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}>
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

          {/* ── Stat Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
            {statCards.map((s) => (
              <div key={s.label} style={{ ...glassCard, padding: 24, position: 'relative', overflow: 'hidden' }}>
                {s.pulse && <div style={{ position: 'absolute', inset: 0, borderRadius: 16, border: `1px solid ${s.accent}`, opacity: 0.4, animation: 'pulseRing 2s ease-in-out infinite' }} />}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ color: s.accent, opacity: 0.9 }}>{s.icon}</div>
                  {s.pulse && <AlertTriangle className="w-4 h-4" style={{ color: s.accent }} />}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, letterSpacing: '0.5px', marginBottom: 6 }}>{s.label}</div>
                <div style={{ color: '#fff', fontSize: 36, fontWeight: 800, lineHeight: 1, letterSpacing: '-1px' }}>{s.value}</div>
                <div style={{ position: 'absolute', bottom: -20, right: -10, width: 80, height: 80, borderRadius: '50%', background: s.accent, opacity: 0.07, filter: 'blur(20px)' }} />
              </div>
            ))}
          </div>

          {/* ── Tabs ── */}
          <div style={{ ...glassCard, marginBottom: 20, padding: '4px', display: 'flex', gap: 4 }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                  background: activeTab === tab.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                  color: activeTab === tab.id ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
                  borderBottom: activeTab === tab.id ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent'
                }}>
                {tab.icon}{tab.label}
                {tab.badge && <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#f97316', animation: 'blink 2s infinite' }} />}
              </button>
            ))}
          </div>

          {/* ── Content ── */}
          <div style={{ ...glassCard, padding: 28 }}>
            {activeTab === 'overview' && <OverviewTab stats={stats} />}
            {activeTab === 'pending' && (
              <PendingTab orgs={pendingOrgs || []} loading={orgsLoading}
                onApprove={org => { setSelectedOrg(org); setActionModal('approve') }}
                onReject={org => { setSelectedOrg(org); setActionModal('reject') }} />
            )}
            {activeTab === 'users' && (
              <UsersTab users={users || []} loading={usersLoading} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                onDeleteUser={u => { setSelectedUser(u); setActionModal('deleteUser') }}
                onDeleteOrg={u => { setSelectedUser(u); setActionModal('deleteOrg') }} />
            )}
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {actionModal && modalConfig && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
          onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={{ ...glassCard, width: '100%', maxWidth: 440, background: 'rgba(10,15,30,0.95)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {modalConfig.icon}
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{modalConfig.title}</span>
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '12px 16px', borderRadius: 10, background: modalConfig.descColor, border: `1px solid ${modalConfig.descBorder}`, color: modalConfig.descText, fontSize: 13, lineHeight: 1.5 }}>
                {modalConfig.desc}
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
                  {modalConfig.required ? 'Reason *' : 'Message (optional)'}
                </label>
                <textarea value={actionReason} onChange={e => setActionReason(e.target.value)}
                  placeholder={modalConfig.required ? 'Minimum 10 characters required...' : 'Add a message (optional)...'}
                  rows={4} autoFocus
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                {modalConfig.required && (
                  <div style={{ fontSize: 11, marginTop: 4, color: actionReason.trim().length >= 10 ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>
                    {actionReason.trim().length}/10 minimum
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, padding: '0 24px 24px' }}>
              <button onClick={closeModal} disabled={isLoading}
                style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={confirmAction} disabled={isLoading || (modalConfig.required && actionReason.trim().length < 10)}
                style={{ flex: 1, padding: '12px', borderRadius: 10, background: modalConfig.btnColor, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: (isLoading || (modalConfig.required && actionReason.trim().length < 10)) ? 0.4 : 1 }}>
                {isLoading ? 'Processing...' : modalConfig.label}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulseRing { 0%,100%{opacity:0.3;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.01)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>
    </div>
  )
}

// ── Overview Tab ───────────────────────────────────────────────────
const OverviewTab = ({ stats }) => {
  const rows = [
    { section: 'Organizations', items: [
      { label: 'Total Organizations', value: stats?.totalOrganizations ?? 0 },
      { label: 'Approved', value: stats?.approvedOrganizations ?? 0, color: '#4ade80' },
      { label: 'Pending Review', value: stats?.pendingOrganizations ?? 0, color: '#fb923c' },
    ]},
    { section: 'Platform Activity', items: [
      { label: 'Total Users', value: stats?.totalUsers ?? 0 },
      { label: 'Active Opportunities', value: stats?.totalOpportunities ?? 0 },
      { label: 'Total Applications', value: stats?.totalApplications ?? 0 },
    ]},
  ]
  return (
    <div>
      <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 24, letterSpacing: '-0.3px' }}>System Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {rows.map(({ section, items }) => (
          <div key={section} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 16 }}>{section}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{label}</span>
                  <span style={{ color: color || '#fff', fontWeight: 700, fontSize: 15 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Pending Tab ────────────────────────────────────────────────────
const PendingTab = ({ orgs, loading, onApprove, onReject }) => {
  if (loading) return <div style={{ textAlign: 'center', padding: 48, color: 'rgba(255,255,255,0.3)' }}>Loading...</div>
  if (!orgs?.length) return (
    <div style={{ textAlign: 'center', padding: 64 }}>
      <CheckCircle style={{ width: 48, height: 48, color: '#4ade80', margin: '0 auto 16px' }} />
      <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>All caught up!</div>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 6 }}>No pending organization verifications</div>
    </div>
  )
  return (
    <div>
      <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Pending Organizations ({orgs.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {orgs.map(org => (
          <div key={org.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                {org.name?.charAt(0) || 'O'}
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700 }}>{org.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>Applied {new Date(org.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14, fontSize: 13 }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</div>
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>{org.contactDetails}</div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Submitted by</div>
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>{org.user?.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{org.user?.email}</div>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>{org.description}</p>
            <div style={{ display: 'flex', gap: 10, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
              <button onClick={() => onApprove(org)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
              <button onClick={() => onReject(org)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Users Tab ──────────────────────────────────────────────────────
const UsersTab = ({ users, loading, searchQuery, setSearchQuery, onDeleteUser, onDeleteOrg }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>User Management</h2>
      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'rgba(255,255,255,0.3)' }} />
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search users..."
          style={{ paddingLeft: 36, paddingRight: 16, paddingTop: 9, paddingBottom: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', width: 220 }} />
      </div>
    </div>
    {loading ? (
      <div style={{ textAlign: 'center', padding: 48, color: 'rgba(255,255,255,0.3)' }}>Loading users...</div>
    ) : users?.length > 0 ? (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['User', 'Email', 'Phone', 'Role', 'Verified', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{user.name}</div>
                  {user.organization && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>Org: {user.organization.name}</div>}
                </td>
                <td style={{ padding: '12px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{user.email}</td>
                <td style={{ padding: '12px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{user.phone || '—'}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: user.role === 'admin' ? 'rgba(59,130,246,0.15)' : user.role === 'organization' ? 'rgba(168,85,247,0.15)' : 'rgba(34,197,94,0.15)',
                    color: user.role === 'admin' ? '#93c5fd' : user.role === 'organization' ? '#d8b4fe' : '#86efac',
                    border: `1px solid ${user.role === 'admin' ? 'rgba(59,130,246,0.3)' : user.role === 'organization' ? 'rgba(168,85,247,0.3)' : 'rgba(34,197,94,0.3)'}`
                  }}>{user.role}</span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  {user.isVerified ? <CheckCircle style={{ width: 18, height: 18, color: '#4ade80' }} /> : <XCircle style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.2)' }} />}
                </td>
                <td style={{ padding: '12px 14px', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '12px 14px' }}>
                  {user.role !== 'admin' && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      {user.organization && (
                        <button onClick={() => onDeleteOrg(user)} title="Remove organization only"
                          style={{ padding: '6px', borderRadius: 8, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: '#fb923c', cursor: 'pointer' }}>
                          <Building2 style={{ width: 14, height: 14 }} />
                        </button>
                      )}
                      <button onClick={() => onDeleteUser(user)} title="Delete user account"
                        style={{ padding: '6px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer' }}>
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div style={{ textAlign: 'center', padding: 48, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No users found</div>
    )}
  </div>
)

export default AdminDashboard
