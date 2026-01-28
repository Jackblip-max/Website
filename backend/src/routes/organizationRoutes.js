import express from 'express'
import { 
  createOrganization, 
  getMyOrganization, 
  updateOrganization, 
  uploadLogo,
  getOrganizationStats,
  getOrganizationOpportunities,
  uploadSignature,     
  updateSignatory,      
  removeSignature       
} from '../controllers/organizationController.js'
import { authenticate } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

// ⚠️ IMPORTANT: Order matters! Specific routes MUST come before parameterized routes like /:id
// Otherwise /my, /stats, /opportunities will be interpreted as IDs

// Get my organization - MUST be before /:id routes
router.get('/my', authenticate, getMyOrganization)

// Get organization stats
router.get('/stats', authenticate, getOrganizationStats)

// Get organization opportunities
router.get('/opportunities', authenticate, getOrganizationOpportunities)

// Create organization
router.post('/', authenticate, createOrganization)

// Update organization - uses ID parameter
router.put('/:id', authenticate, updateOrganization)

// Upload logo
router.post('/logo', authenticate, upload.single('logo'), uploadLogo)

// Signature management routes
router.post('/signature', authenticate, upload.single('signature'), uploadSignature)
router.put('/signatory', authenticate, updateSignatory)
router.delete('/signature', authenticate, removeSignature)

export default router
