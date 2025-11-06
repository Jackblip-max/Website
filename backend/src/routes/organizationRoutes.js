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

router.post('/', authenticate, createOrganization)
router.get('/my', authenticate, getMyOrganization)
router.put('/:id', authenticate, updateOrganization)
router.post('/logo', authenticate, upload.single('logo'), uploadLogo)
router.get('/stats', authenticate, getOrganizationStats)
router.get('/opportunities', authenticate, getOrganizationOpportunities)

export default router