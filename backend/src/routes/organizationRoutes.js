import express from 'express'
import { 
  createOrganization, 
  getMyOrganization, 
  updateOrganization, 
  uploadLogo,
  getOrganizationStats,
  getOrganizationOpportunities
} from '../controllers/organizationController.js'
import { authenticate } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

// Create organization
router.post('/', authenticate, createOrganization)

// Get my organization
router.get('/my', authenticate, getMyOrganization)

// Get organization stats
router.get('/stats', authenticate, getOrganizationStats)

// Get organization opportunities
router.get('/opportunities', authenticate, getOrganizationOpportunities)

// Update organization - FIXED: ID parameter
router.put('/:id', authenticate, updateOrganization)

// Upload logo
router.post('/logo', authenticate, upload.single('logo'), uploadLogo)

export default router
