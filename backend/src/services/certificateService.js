import { createCanvas, loadImage } from 'canvas'
import QRCode from 'qrcode'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ── Load image safely from a file path (fixes "Unsupported image type" on Windows) ──
const safeLoadImage = async (filePath) => {
  // Read raw bytes and pass as Buffer — avoids canvas file-read issues on Windows
  const buffer = fs.readFileSync(filePath)
  return await loadImage(buffer)
}

// ── Find frontend/public/logo.png by walking up from __dirname ────────────────
const resolvePlatformLogo = () => {
  let dir = __dirname
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, 'frontend', 'public', 'logo.png')
    if (fs.existsSync(candidate)) return candidate
    dir = path.dirname(dir)
  }
  const cwdCandidates = [
    path.join(process.cwd(), 'frontend', 'public', 'logo.png'),
    path.join(process.cwd(), '..', 'frontend', 'public', 'logo.png'),
  ]
  for (const p of cwdCandidates) {
    if (fs.existsSync(p)) return p
  }
  return null
}

// ── Resolve org uploaded logo URL/path → absolute filesystem path ─────────────
const resolveOrgLogoPath = (logoValue) => {
  if (!logoValue) return null

  // Handle full URLs
  if (logoValue.startsWith('http://') || logoValue.startsWith('https://')) {
    try {
      logoValue = new URL(logoValue).pathname
    } catch {
      return null
    }
  }

  // Already absolute
  if (path.isAbsolute(logoValue) && fs.existsSync(logoValue)) return logoValue

  // Relative like "/uploads/logos/logo-xxx.png"
  const cleaned = logoValue.replace(/^\/uploads\//, '')
  const candidates = [
    path.join(__dirname, '../../uploads', cleaned),
    path.join(process.cwd(), 'uploads', cleaned),
    path.join(__dirname, '../../../uploads', cleaned),
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  return null
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// ── CertificateService ────────────────────────────────────────────────────────
export class CertificateService {
  constructor() {
    this.W = 2000
    this.H = 1414
    this.certificatesDir = path.join(__dirname, '../../uploads/certificates')
    if (!fs.existsSync(this.certificatesDir)) {
      fs.mkdirSync(this.certificatesDir, { recursive: true })
    }
  }

  async generateCertificate(data) {
    const {
      volunteerName,
      opportunityTitle,
      organizationName,
      organizationLogo,
      completionDate,
      hoursContributed,
      location,
      certificateNumber,
      verificationCode,
    } = data

    const W = this.W
    const H = this.H
    const canvas = createCanvas(W, H)
    const ctx = canvas.getContext('2d')

    // ── 1. Background ─────────────────────────────────────────────────────────
    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0.0, '#0f1c2e')
    bg.addColorStop(0.4, '#0d2340')
    bg.addColorStop(1.0, '#081626')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    ctx.fillStyle = 'rgba(255,255,255,0.012)'
    for (let i = 0; i < 6000; i++) {
      ctx.fillRect(Math.random() * W, Math.random() * H, Math.random() * 2 + 1, Math.random() * 2 + 1)
    }

    // ── 2. Corner ornaments ───────────────────────────────────────────────────
    this.drawCornerOrnaments(ctx, W, H)

    // ── 3. Borders ────────────────────────────────────────────────────────────
    const margin = 48
    ctx.strokeStyle = '#b8972a'
    ctx.lineWidth = 3
    roundRect(ctx, margin, margin, W - margin * 2, H - margin * 2, 12)
    ctx.stroke()

    const m2 = margin + 16
    ctx.strokeStyle = 'rgba(212,175,55,0.35)'
    ctx.lineWidth = 1
    roundRect(ctx, m2, m2, W - m2 * 2, H - m2 * 2, 8)
    ctx.stroke()

    // ── 4. Left accent bar ────────────────────────────────────────────────────
    const barGrad = ctx.createLinearGradient(0, 0, 0, H)
    barGrad.addColorStop(0.0, 'transparent')
    barGrad.addColorStop(0.3, '#d4af37')
    barGrad.addColorStop(0.7, '#d4af37')
    barGrad.addColorStop(1.0, 'transparent')
    ctx.fillStyle = barGrad
    ctx.fillRect(margin + 24, margin + 24, 6, H - (margin + 24) * 2)

    // ── 5. Logo ───────────────────────────────────────────────────────────────
    const logoSize = 140
    const logoY = 90
    const logoCX = W / 2
    const logoCY = logoY + logoSize / 2

    const orgLogoPath = resolveOrgLogoPath(organizationLogo)
    const platformLogoPath = resolvePlatformLogo()
    const logoToUse = orgLogoPath || platformLogoPath

    let logoLoaded = false
    if (logoToUse) {
      try {
        // ✅ KEY FIX: read as Buffer first to avoid Windows "Unsupported image type"
        const img = await safeLoadImage(logoToUse)
        ctx.save()
        ctx.beginPath()
        ctx.arc(logoCX, logoCY, logoSize / 2, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(img, logoCX - logoSize / 2, logoY, logoSize, logoSize)
        ctx.restore()
        ctx.strokeStyle = '#d4af37'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.arc(logoCX, logoCY, logoSize / 2 + 6, 0, Math.PI * 2)
        ctx.stroke()
        logoLoaded = true
        console.log('✅ Logo rendered from:', logoToUse)
      } catch (err) {
        console.warn('⚠️  Logo load failed:', err.message, '— trying platform logo fallback')
        // If org logo failed, try platform logo separately
        if (orgLogoPath && platformLogoPath) {
          try {
            const img = await safeLoadImage(platformLogoPath)
            ctx.save()
            ctx.beginPath()
            ctx.arc(logoCX, logoCY, logoSize / 2, 0, Math.PI * 2)
            ctx.clip()
            ctx.drawImage(img, logoCX - logoSize / 2, logoY, logoSize, logoSize)
            ctx.restore()
            ctx.strokeStyle = '#d4af37'
            ctx.lineWidth = 4
            ctx.beginPath()
            ctx.arc(logoCX, logoCY, logoSize / 2 + 6, 0, Math.PI * 2)
            ctx.stroke()
            logoLoaded = true
            console.log('✅ Platform logo used as fallback')
          } catch (err2) {
            console.warn('⚠️  Platform logo also failed:', err2.message)
          }
        }
      }
    }

    if (!logoLoaded) {
      console.warn('⚠️  No logo loaded — showing text placeholder')
      this.drawLogoPlaceholder(ctx, organizationName, logoCX, logoCY, logoSize / 2)
    }

    // ── 6. Title ──────────────────────────────────────────────────────────────
    let curY = logoY + logoSize + 80

    ctx.textAlign = 'center'
    ctx.font = `bold 62px Georgia, serif`
    ctx.fillStyle = '#d4af37'
    ctx.letterSpacing = '8px'
    ctx.fillText('CERTIFICATE OF APPRECIATION', W / 2, curY)
    ctx.letterSpacing = '0px'

    curY += 24
    const ulW = 540
    const ulGrad = ctx.createLinearGradient(W / 2 - ulW / 2, 0, W / 2 + ulW / 2, 0)
    ulGrad.addColorStop(0, 'transparent')
    ulGrad.addColorStop(0.2, '#d4af37')
    ulGrad.addColorStop(0.8, '#d4af37')
    ulGrad.addColorStop(1, 'transparent')
    ctx.strokeStyle = ulGrad
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(W / 2 - ulW / 2, curY)
    ctx.lineTo(W / 2 + ulW / 2, curY)
    ctx.stroke()

    // ── 7. Sub-heading ────────────────────────────────────────────────────────
    curY += 48
    ctx.font = `italic 26px Georgia, serif`
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.fillText('This is to certify that', W / 2, curY)

    // ── 8. Name box ───────────────────────────────────────────────────────────
    curY += 28
    curY = this.drawNameBox(ctx, volunteerName, W, curY)

    // ── 9. Body text ──────────────────────────────────────────────────────────
    curY += 40
    ctx.font = `28px Georgia, serif`
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.fillText('has successfully completed volunteer service for', W / 2, curY)

    curY += 50
    ctx.font = `bold 40px Georgia, serif`
    ctx.fillStyle = '#ffffff'
    const titleLines = this.wrapText(ctx, opportunityTitle, 1500)
    for (const line of titleLines) {
      ctx.fillText(line, W / 2, curY)
      curY += 50
    }

    curY += 4
    ctx.font = `30px Georgia, serif`
    ctx.fillStyle = '#10b981'
    ctx.fillText(`organized by ${organizationName}`, W / 2, curY)

    // ── 10. Details row ───────────────────────────────────────────────────────
    curY += 50
    curY = this.drawDetailsRow(ctx, {
      completionDate: new Date(completionDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      }),
      hoursContributed,
      location: location || 'Remote',
    }, W, curY)

    // ── 11. Footer — inside frame ─────────────────────────────────────────────
    await this.drawFooter(ctx, { certificateNumber, verificationCode, W, H, margin })

    // ── 12. Save ──────────────────────────────────────────────────────────────
    const filename = `${certificateNumber}_${Date.now()}.jpg`
    const filepath = path.join(this.certificatesDir, filename)
    fs.writeFileSync(filepath, canvas.toBuffer('image/jpeg', { quality: 0.96 }))
    console.log('✅ Certificate saved:', filename)
    return { filename, filepath, url: `/uploads/certificates/${filename}` }
  }

  // ── Logo placeholder ────────────────────────────────────────────────────────
  drawLogoPlaceholder(ctx, orgName, cx, cy, radius) {
    const g = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius)
    g.addColorStop(0, '#10b981')
    g.addColorStop(1, '#059669')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2)
    ctx.stroke()

    const initials = (orgName || 'ORG')
      .split(' ').map(w => w[0] || '').join('').substring(0, 2).toUpperCase()

    ctx.font = `bold ${Math.round(radius * 0.72)}px Georgia, serif`
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initials, cx, cy)
    ctx.textBaseline = 'alphabetic'
  }

  // ── Name box ────────────────────────────────────────────────────────────────
  drawNameBox(ctx, name, W, startY) {
    const boxW = 900, boxH = 110
    const boxX = W / 2 - boxW / 2

    ctx.fillStyle = 'rgba(0,0,0,0.30)'
    roundRect(ctx, boxX, startY, boxW, boxH, 8)
    ctx.fill()

    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 3
    roundRect(ctx, boxX, startY, boxW, boxH, 8)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(212,175,55,0.4)'
    ctx.lineWidth = 1
    roundRect(ctx, boxX + 8, startY + 8, boxW - 16, boxH - 16, 4)
    ctx.stroke()

    ctx.font = `bold 58px Georgia, serif`
    ctx.fillStyle = '#d4af37'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText((name || '').toUpperCase(), W / 2, startY + boxH / 2)
    ctx.textBaseline = 'alphabetic'

    return startY + boxH
  }

  // ── Details row ─────────────────────────────────────────────────────────────
  drawDetailsRow(ctx, details, W, startY) {
    const rowH = 100, rowW = 1400
    const rowX = W / 2 - rowW / 2

    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    roundRect(ctx, rowX, startY, rowW, rowH, 8)
    ctx.fill()
    ctx.strokeStyle = 'rgba(212,175,55,0.3)'
    ctx.lineWidth = 1
    roundRect(ctx, rowX, startY, rowW, rowH, 8)
    ctx.stroke()

    const cols = [
      { label: 'COMPLETION DATE',   value: details.completionDate },
      { label: 'HOURS CONTRIBUTED', value: `${details.hoursContributed} hours` },
      { label: 'LOCATION',          value: details.location },
    ]
    const colW = rowW / 3

    cols.forEach((col, i) => {
      const cx = rowX + colW * i + colW / 2
      if (i > 0) {
        ctx.strokeStyle = 'rgba(212,175,55,0.2)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(cx - colW / 2, startY + 16)
        ctx.lineTo(cx - colW / 2, startY + rowH - 16)
        ctx.stroke()
      }
      ctx.textAlign = 'center'
      ctx.font = `bold 15px Arial`
      ctx.fillStyle = '#d4af37'
      ctx.letterSpacing = '2px'
      ctx.fillText(col.label, cx, startY + 34)
      ctx.letterSpacing = '0px'
      ctx.font = `bold 24px Georgia, serif`
      ctx.fillStyle = '#ffffff'
      ctx.fillText(col.value, cx, startY + 72)
    })

    return startY + rowH
  }

  // ── Footer — QR + text fully inside gold border ───────────────────────────────
  async drawFooter(ctx, { certificateNumber, verificationCode, W, H, margin }) {
    const bottomEdge = H - margin - 20
    const qrSize = 100
    const qrY = bottomEdge - qrSize - 20
    const scanTextY = qrY + qrSize + 16
    const certNumY = qrY - 16
    const issuedY = certNumY - 26
    const sepY = issuedY - 26

    // Separator
    const sepGrad = ctx.createLinearGradient(200, 0, W - 200, 0)
    sepGrad.addColorStop(0, 'transparent')
    sepGrad.addColorStop(0.15, 'rgba(212,175,55,0.5)')
    sepGrad.addColorStop(0.85, 'rgba(212,175,55,0.5)')
    sepGrad.addColorStop(1, 'transparent')
    ctx.strokeStyle = sepGrad
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(200, sepY)
    ctx.lineTo(W - 200, sepY)
    ctx.stroke()

    // Issued on
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
    ctx.textAlign = 'center'
    ctx.font = `18px Arial`
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.fillText(`Issued on: ${today}`, W / 2, issuedY)

    // Cert number
    ctx.font = `bold 16px 'Courier New', monospace`
    ctx.fillStyle = '#d4af37'
    ctx.fillText(`Certificate No: ${certificateNumber}`, W / 2, certNumY)

    // QR code
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-certificate/${verificationCode}`
    try {
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: qrSize, margin: 1,
        color: { dark: '#ffffff', light: '#0d2340' },
      })
      const qrImg = await loadImage(qrDataUrl)
      ctx.drawImage(qrImg, W / 2 - qrSize / 2, qrY, qrSize, qrSize)
    } catch (err) {
      console.warn('QR generation failed:', err.message)
    }

    // Scan to verify
    ctx.font = `14px Arial`
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fillText('Scan to verify authenticity', W / 2, Math.min(scanTextY, bottomEdge - 4))
  }

  // ── Corner ornaments ────────────────────────────────────────────────────────
  drawCornerOrnaments(ctx, W, H) {
    const size = 80, pad = 58
    const positions = [[pad, pad], [W - pad, pad], [pad, H - pad], [W - pad, H - pad]]

    positions.forEach(([cx, cy]) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size)
      g.addColorStop(0, 'rgba(212,175,55,0.5)')
      g.addColorStop(1, 'transparent')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, size, 0, Math.PI * 2)
      ctx.fill()

      ;[22, 36].forEach(r => {
        ctx.strokeStyle = 'rgba(212,175,55,0.6)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.stroke()
      })

      ctx.strokeStyle = 'rgba(212,175,55,0.4)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(cx - 50, cy); ctx.lineTo(cx + 50, cy)
      ctx.moveTo(cx, cy - 50); ctx.lineTo(cx, cy + 50)
      ctx.stroke()
    })
  }

  // ── Utility ─────────────────────────────────────────────────────────────────
  wrapText(ctx, text, maxWidth) {
    const words = (text || '').split(' ')
    const lines = []
    let current = words[0]
    for (let i = 1; i < words.length; i++) {
      const test = current + ' ' + words[i]
      if (ctx.measureText(test).width > maxWidth) { lines.push(current); current = words[i] }
      else current = test
    }
    lines.push(current)
    return lines
  }

  generateCertificateNumber() {
    const ts = Date.now().toString(36).toUpperCase()
    const rand = crypto.randomBytes(3).toString('hex').toUpperCase()
    return `CERT-${ts}-${rand}`
  }

  generateVerificationCode() {
    return crypto.randomBytes(32).toString('hex')
  }
}

export default new CertificateService()
