import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { adminAuthService } from '../services/adminAuthService'

const AdminLogin = () => {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── 3D Canvas Animation ──────────────────────────────────────────
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

    // Depth dots (star-tunnel effect)
    const dots = Array.from({ length: 130 }, () => ({
      x: (Math.random() - 0.5) * 1800,
      y: (Math.random() - 0.5) * 1800,
      z: Math.random() * 1200,
      r: Math.random() * 2 + 0.5,
      speed: 0.4 + Math.random() * 0.6
    }))

    // Wireframe cubes
    const cubes = Array.from({ length: 7 }, () => ({
      x: (Math.random() - 0.5) * window.innerWidth,
      y: (Math.random() - 0.5) * window.innerHeight,
      size: 25 + Math.random() * 55,
      rx: Math.random() * Math.PI * 2,
      ry: Math.random() * Math.PI * 2,
      drx: (Math.random() - 0.5) * 0.007,
      dry: (Math.random() - 0.5) * 0.007,
      alpha: 0.05 + Math.random() * 0.07
    }))

    function project(x, y, z, cx, cy, fov = 600) {
      const scale = fov / (fov + z)
      return { px: x * scale + cx, py: y * scale + cy, scale }
    }

    function drawCube(cube, cx, cy) {
      const s = cube.size / 2
      const verts = [
        [-s,-s,-s],[s,-s,-s],[s,s,-s],[-s,s,-s],
        [-s,-s, s],[s,-s, s],[s,s, s],[-s,s, s]
      ]
      const crx = Math.cos(cube.rx), srx = Math.sin(cube.rx)
      const cry = Math.cos(cube.ry), sry = Math.sin(cube.ry)

      const proj = verts.map(([vx, vy, vz]) => {
        const tx = vx * cry - vz * sry
        const tz = vx * sry + vz * cry
        const ty2 = vy * crx - tz * srx
        const tz2 = vy * srx + tz * crx
        const fov = 400
        const sc = fov / (fov + tz2 + 200)
        return [tx * sc + cx + cube.x, ty2 * sc + cy + cube.y]
      })

      const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]
      ctx.strokeStyle = `rgba(99,102,241,${cube.alpha})`
      ctx.lineWidth = 0.8
      ctx.beginPath()
      edges.forEach(([a, b]) => {
        ctx.moveTo(proj[a][0], proj[a][1])
        ctx.lineTo(proj[b][0], proj[b][1])
      })
      ctx.stroke()
    }

    let animId
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2
      const cy = canvas.height / 2

      // Connection lines
      ctx.strokeStyle = 'rgba(99,102,241,0.035)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < dots.length; i++) {
        const a = project(dots[i].x, dots[i].y, dots[i].z, cx, cy)
        for (let j = i + 1; j < dots.length; j++) {
          const b = project(dots[j].x, dots[j].y, dots[j].z, cx, cy)
          if (Math.hypot(a.px - b.px, a.py - b.py) < 100) {
            ctx.beginPath()
            ctx.moveTo(a.px, a.py)
            ctx.lineTo(b.px, b.py)
            ctx.stroke()
          }
        }
      }

      // Dots
      dots.forEach(d => {
        d.z -= d.speed * 1.4
        if (d.z < 0) d.z = 1200
        const { px, py, scale } = project(d.x, d.y, d.z, cx, cy)
        if (px < 0 || px > canvas.width || py < 0 || py > canvas.height) return
        ctx.beginPath()
        ctx.arc(px, py, d.r * scale, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(148,163,255,${0.5 * scale})`
        ctx.fill()
      })

      // Cubes
      cubes.forEach(cube => {
        cube.rx += cube.drx
        cube.ry += cube.dry
        drawCube(cube, cx, cy)
      })

      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  // ── Login handler ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    setError('')
    try {
      await adminAuthService.login(formData)
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center"
      style={{ background: '#080d1a' }}>

      {/* 3D canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Ambient glows */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '24px',
          padding: '48px 40px',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)'
        }}>

        {/* Shield icon */}
        <div className="flex justify-center mb-6">
          <div style={{
            width: 72, height: 72,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(99,102,241,0.45)',
            animation: 'iconFloat 3s ease-in-out infinite'
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        </div>

        <h1 className="text-center text-3xl font-bold text-white mb-1 tracking-tight">
          Admin Portal
        </h1>
        <p className="text-center text-xs font-semibold mb-6 tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.35)' }}>
          MyanVolunteer · Secure Access
        </p>

        {/* Secure badge */}
        <div className="flex items-center justify-center gap-2 mb-8 px-4 py-2.5 rounded-xl"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', background: '#4ade80',
            animation: 'blink 2s infinite', flexShrink: 0
          }} />
          <span className="text-xs font-medium" style={{ color: '#4ade80' }}>
            Secure connection established
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium text-red-300"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold mb-2 tracking-widest uppercase"
              style={{ color: 'rgba(255,255,255,0.45)' }}>
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
              placeholder="admin@myanvolunteer.org"
              autoComplete="email"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '14px 16px',
                color: '#fff',
                fontSize: 15,
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(99,102,241,0.7)'
                e.target.style.background = 'rgba(255,255,255,0.09)'
                e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.1)'
                e.target.style.background = 'rgba(255,255,255,0.06)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2 tracking-widest uppercase"
              style={{ color: 'rgba(255,255,255,0.45)' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••••••"
                autoComplete="current-password"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: '14px 48px 14px 16px',
                  color: '#fff',
                  fontSize: 15,
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(99,102,241,0.7)'
                  e.target.style.background = 'rgba(255,255,255,0.09)'
                  e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.target.style.background = 'rgba(255,255,255,0.06)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <button type="button" tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: 8,
              padding: '15px',
              background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.3px'
            }}
            onMouseEnter={e => { if (!loading) e.target.style.boxShadow = '0 8px 24px rgba(99,102,241,0.5)' }}
            onMouseLeave={e => { e.target.style.boxShadow = 'none' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg style={{ animation: 'spin 1s linear infinite' }} width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                  <path style={{ opacity: 0.75 }} fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </span>
            ) : 'Sign In to Dashboard'}
          </button>
        </form>

        <p className="text-center mt-8 text-xs leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.18)' }}>
          Restricted to authorized administrators only.<br />
          Unauthorized access attempts are logged.
        </p>
      </div>

      <style>{`
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        input::placeholder { color: rgba(255,255,255,0.22); }
      `}</style>
    </div>
  )
}

export default AdminLogin
