import express from 'express'
import { protect, authorizeRoles } from '../middleware/authMiddleware.js'
import { 
  generateCertificate,
  getCertificate,
  verifyCertificate,
  getCertificatesByVolunteer,
  getCertificatesByOrganization
} from '../controllers/certificateController.js'

const router = express.Router()

// Generate certificate (Organization only)
router.post(
  '/generate/:applicationId',
  protect,
  authorizeRoles('organization'),
  generateCertificate
)

// Get specific certificate
router.get('/:id', getCertificate)

// Verify certificate by QR code
router.get('/verify/:qrCode', verifyCertificate)

// Get all certificates for a volunteer
router.get(
  '/volunteer/my-certificates',
  protect,
  authorizeRoles('volunteer'),
  getCertificatesByVolunteer
)

// Get all certificates issued by an organization
router.get(
  '/organization/issued',
  protect,
  authorizeRoles('organization'),
  getCertificatesByOrganization
)

export default router
