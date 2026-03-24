import { createCanvas, loadImage } from 'canvas'
import QRCode from 'qrcode'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ── Resolve logo URL/path → absolute filesystem path ─────────────────────────
const resolveLogoPath = (logoValue) => {
  if (!logoValue) return null

  // Already an absolute path
  if (path.isAbsolute(logoValue) && fs.existsSync(logoValue)) return logoValue

  // Relative URL like "/uploads/logos/logo-123.jpg"
  const cleaned = logoValue.replace(/^\/uploads\//, '')
  const candidates = [
    path.join(__dirname, '../../uploads', cleaned),
    path.join(process.cwd(), 'uploads', cleaned),
    path.join(__dirname, '../../../uploads', cleaned),
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }

  console.warn('⚠️  Could not resolve logo path:', logoValue, '→ tried:', candidates)
  return null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const hex2rgb = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

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
    this.H = 1414   // A4 landscape ratio ×2 for hi-res
    this.certificatesDir = path.join(__dirname, '../../uploads/certificates')
    if (!fs.existsSync(this.certificatesDir)) {
      fs.mkdirSync(this.certificatesDir, { recursive: true })
    }
  }

  // ── Public entry point ──────────────────────────────────────────────────────
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
      signatoryName,
      signatoryTitle,
      signatureUrl,
    } = data

    const W = this.W
    const H = this.H
    const canvas = createCanvas(W, H)
    const ctx = canvas.getContext('2d')

    // ── 1. Background ─────────────────────────────────────────────────────────
    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0.00, '#0f1c2e')
    bg.addColorStop(0.40, '#0d2340')
    bg.addColorStop(1.00, '#081626')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Subtle noise overlay (drawn as a grid of tiny semi-transparent rects)
    ctx.fillStyle = 'rgba(255,255,255,0.012)'
    for (let i = 0; i < 6000; i++) {
      ctx.fillRect(
        Math.random() * W,
        Math.random() * H,
        Math.random() * 2 + 1,
        Math.random() * 2 + 1
      )
    }

    // ── 2. Gold corner ornaments ──────────────────────────────────────────────
    this.drawCornerOrnaments(ctx, W, H)

    // ── 3. Outer gold border ──────────────────────────────────────────────────
    const margin = 48
    ctx.strokeStyle = '#b8972a'
    ctx.lineWidth = 3
    roundRect(ctx, margin, margin, W - margin * 2, H - margin * 2, 12)
    ctx.stroke()

    // Inner border (thinner, lighter gold)
    const m2 = margin + 16
    ctx.strokeStyle = 'rgba(212,175,55,0.35)'
    ctx.lineWidth = 1
    roundRect(ctx, m2, m2, W - m2 * 2, H - m2 * 2, 8)
    ctx.stroke()

    // ── 4. Left accent bar ────────────────────────────────────────────────────
    const barGrad = ctx.createLinearGradient(0, 0, 0, H)
    barGrad.addColorStop(0.00, 'transparent')
    barGrad.addColorStop(0.30, '#d4af37')
    barGrad.addColorStop(0.70, '#d4af37')
    barGrad.addColorStop(1.00, 'transparent')
    ctx.fillStyle = barGrad
    ctx.fillRect(margin + 24, margin + 24, 6, H - (margin + 24) * 2)

    // ── 5. Logo / placeholder ─────────────────────────────────────────────────
    const logoSize = 130
    const logoX = W / 2 - logoSize / 2
    const logoY = 112

    const resolvedLogo = resolveLogoPath(organizationLogo)

    if (resolvedLogo) {
      try {
        const img = await loadImage(resolvedLogo)
        // Circular clip
        ctx.save()
        ctx.beginPath()
        ctx.arc(W / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(img, logoX, logoY, logoSize, logoSize)
        ctx.restore()
        // Gold ring around logo
        ctx.strokeStyle = '#d4af37'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.arc(W / 2, logoY + logoSize / 2, logoSize / 2 + 6, 0, Math.PI * 2)
        ctx.stroke()
      } catch (err) {
        console.warn('⚠️  loadImage failed, using placeholder:', err.message)
        this.drawLogoPlaceholder(ctx, organizationName, W / 2, logoY + logoSize / 2, logoSize / 2)
      }
    } else {
      this.drawLogoPlaceholder(ctx, organizationName, W / 2, logoY + logoSize / 2, logoSize / 2)
    }

    // ── 6. Header ─────────────────────────────────────────────────────────────
    let curY = logoY + logoSize + 52

    ctx.textAlign = 'center'
    ctx.font = `bold 62px Georgia, serif`
    ctx.fillStyle = '#d4af37'
    ctx.letterSpacing = '8px'
    ctx.fillText('CERTIFICATE OF APPRECIATION', W / 2, curY)
    ctx.letterSpacing = '0px'

    // Gold underline
    curY += 18
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
    curY += 52
    ctx.font = `italic 26px Georgia, serif`
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.fillText('This is to certify that', W / 2, curY)

    // ── 8. Volunteer name box ─────────────────────────────────────────────────
    curY += 26
    curY = this.drawNameBox(ctx, volunteerName, W, curY)

    // ── 9. Body text ──────────────────────────────────────────────────────────
    curY += 44
    ctx.font = `28px Georgia, serif`
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.fillText('has successfully completed volunteer service for', W / 2, curY)

    curY += 54
    ctx.font = `bold 40px Georgia, serif`
    ctx.fillStyle = '#ffffff'
    const titleLines = this.wrapText(ctx, opportunityTitle, 1500)
    for (const line of titleLines) {
      ctx.fillText(line, W / 2, curY)
      curY += 52
    }

    curY += 4
    ctx.font = `32px Georgia, serif`
    ctx.fillStyle = '#10b981'
    ctx.fillText(`organized by ${organizationName}`, W / 2, curY)

    // ── 10. Details row ───────────────────────────────────────────────────────
    curY += 56
    curY = this.drawDetailsRow(ctx, {
      completionDate: new Date(completionDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      }),
      hoursContributed,
      location: location || 'Remote',
    }, W, curY)

    // ── 11. Footer (QR + cert number) ─────────────────────────────────────────
    await this.drawFooter(ctx, {
      certificateNumber,
      verificationCode,
      W,
      H,
      bottomMargin: margin + 28,
    })

    // ── 12. Save ──────────────────────────────────────────────────────────────
    const filename = `${certificateNumber}_${Date.now()}.jpg`
    const filepath = path.join(this.certificatesDir, filename)
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.96 })
    fs.writeFileSync(filepath, buffer)

    console.log('✅ Certificate generated:', filename)
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

    // Gold ring
    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2)
    ctx.stroke()

    const initials = (orgName || 'ORG')
      .split(' ')
      .map(w => w[0] || '')
      .join('')
      .substring(0, 2)
      .toUpperCase()

    ctx.font = `bold ${Math.round(radius * 0.72)}px Georgia, serif`
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initials, cx, cy)
    ctx.textBaseline = 'alphabetic'
  }

  // ── Name box ────────────────────────────────────────────────────────────────
  drawNameBox(ctx, name, W, startY) {
    const boxW = 900
    const boxH = 110
    const boxX = W / 2 - boxW / 2
    const boxY = startY

    // Dark inset background
    ctx.fillStyle = 'rgba(0,0,0,0.30)'
    roundRect(ctx, boxX, boxY, boxW, boxH, 8)
    ctx.fill()

    // Gold border
    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 3
    roundRect(ctx, boxX, boxY, boxW, boxH, 8)
    ctx.stroke()

    // Inner thin border
    ctx.strokeStyle = 'rgba(212,175,55,0.4)'
    ctx.lineWidth = 1
    roundRect(ctx, boxX + 8, boxY + 8, boxW - 16, boxH - 16, 4)
    ctx.stroke()

    ctx.font = `bold 58px Georgia, serif`
    ctx.fillStyle = '#d4af37'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(name.toUpperCase(), W / 2, boxY + boxH / 2)
    ctx.textBaseline = 'alphabetic'

    return boxY + boxH
  }

  // ── Details row ─────────────────────────────────────────────────────────────
  drawDetailsRow(ctx, details, W, startY) {
    const rowH = 100
    const rowW = 1400
    const rowX = W / 2 - rowW / 2

    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    roundRect(ctx, rowX, startY, rowW, rowH, 8)
    ctx.fill()
    ctx.strokeStyle = 'rgba(212,175,55,0.3)'
    ctx.lineWidth = 1
    roundRect(ctx, rowX, startY, rowW, rowH, 8)
    ctx.stroke()

    // Three columns
    const cols = [
      { label: 'COMPLETION DATE', value: details.completionDate },
      { label: 'HOURS CONTRIBUTED', value: `${details.hoursContributed} hours` },
      { label: 'LOCATION', value: details.location },
    ]
    const colW = rowW / 3

    cols.forEach((col, i) => {
      const cx = rowX + colW * i + colW / 2

      // Divider (not after last)
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

  // ── Footer ──────────────────────────────────────────────────────────────────
  async drawFooter(ctx, { certificateNumber, verificationCode, W, H, bottomMargin }) {
    const footerY = H - bottomMargin - 160

    // Separator
    const sepGrad = ctx.createLinearGradient(200, 0, W - 200, 0)
    sepGrad.addColorStop(0, 'transparent')
    sepGrad.addColorStop(0.15, 'rgba(212,175,55,0.5)')
    sepGrad.addColorStop(0.85, 'rgba(212,175,55,0.5)')
    sepGrad.addColorStop(1, 'transparent')
    ctx.strokeStyle = sepGrad
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(200, footerY)
    ctx.lineTo(W - 200, footerY)
    ctx.stroke()

    // Issued on + cert number centred
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
    ctx.textAlign = 'center'
    ctx.font = `18px Arial`
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.fillText(`Issued on: ${today}`, W / 2, footerY + 40)

    ctx.font = `bold 16px 'Courier New', monospace`
    ctx.fillStyle = '#d4af37'
    ctx.fillText(`Certificate No: ${certificateNumber}`, W / 2, footerY + 70)

    // QR code
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-certificate/${verificationCode}`
    try {
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 110,
        margin: 1,
        color: { dark: '#ffffff', light: '#0d2340' },
      })
      const qrImg = await loadImage(qrDataUrl)
      const qrSize = 110
      ctx.drawImage(qrImg, W / 2 - qrSize / 2, footerY + 84, qrSize, qrSize)
    } catch (err) {
      console.warn('QR code generation failed:', err.message)
    }

    // "Scan to verify"
    ctx.font = `14px Arial`
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fillText('Scan to verify authenticity', W / 2, footerY + 210)
  }

  // ── Corner ornaments ────────────────────────────────────────────────────────
  drawCornerOrnaments(ctx, W, H) {
    const size = 80
    const pad = 58
    const positions = [
      [pad, pad],
      [W - pad, pad],
      [pad, H - pad],
      [W - pad, H - pad],
    ]

    positions.forEach(([cx, cy]) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size)
      g.addColorStop(0, 'rgba(212,175,55,0.5)')
      g.addColorStop(1, 'transparent')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, size, 0, Math.PI * 2)
      ctx.fill()

      // Two concentric arcs
      ;[22, 36].forEach(r => {
        ctx.strokeStyle = 'rgba(212,175,55,0.6)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.stroke()
      })

      // Cross lines
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
    const words = text.split(' ')
    const lines = []
    let current = words[0]
    for (let i = 1; i < words.length; i++) {
      const test = current + ' ' + words[i]
      if (ctx.measureText(test).width > maxWidth) {
        lines.push(current)
        current = words[i]
      } else {
        current = test
      }
    }
    lines.push(current)
    return lines
  }

  generateCertificateNumber() {
    const year = new Date().getFullYear()
    const rand = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    return `CERT-${year}-${rand}`
  }

  generateVerificationCode() {
    return crypto.randomBytes(32).toString('hex')
  }
}

export default new CertificateService()
