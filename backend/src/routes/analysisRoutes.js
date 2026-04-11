// backend/src/routes/analysisRoutes.js
// Mount in server.js: app.use('/api/analysis', analysisRoutes)

import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const ANALYZER_URL = process.env.ANALYZER_URL || 'http://localhost:5001'

// ── Resolve uploaded document path ───────────────────────────────────────────
const resolveUploadPath = (fileValue) => {
  if (!fileValue) return null

  // Full URL → strip to pathname
  if (fileValue.startsWith('http://') || fileValue.startsWith('https://')) {
    try { fileValue = new URL(fileValue).pathname }
    catch { return null }
  }

  if (path.isAbsolute(fileValue) && fs.existsSync(fileValue)) return fileValue

  const cleaned = fileValue.replace(/^\/uploads\//, '')
  const candidates = [
    path.join(__dirname, '../../uploads', cleaned),
    path.join(process.cwd(), 'uploads', cleaned),
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  return null
}

// POST /api/analysis/document
// Body: { filePath: "/uploads/documents/doc-xxx.png" }
router.post('/document', async (req, res) => {
  try {
    const { filePath } = req.body
    if (!filePath) return res.status(400).json({ error: 'filePath required' })

    const resolved = resolveUploadPath(filePath)
    if (!resolved) {
      return res.status(404).json({ error: 'File not found', filePath })
    }

    const response = await fetch(`${ANALYZER_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath: resolved }),
      timeout: 30000,
    })

    if (!response.ok) {
      const err = await response.json()
      return res.status(response.status).json(err)
    }

    const result = await response.json()
    return res.json(result)
  } catch (err) {
    console.error('Analysis error:', err.message)
    // If analyzer is down, return a neutral "unavailable" result
    return res.status(503).json({
      error: 'Analyzer service unavailable',
      riskScore: null,
      riskLevel: 'UNAVAILABLE',
      recommendation: 'AI analysis unavailable — review manually',
      color: '#6b7280',
      breakdown: null,
      flags: ['AI analyzer service is not running'],
    })
  }
})

export default router
