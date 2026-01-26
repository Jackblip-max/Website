import express from 'express'
import {
  generateCertificate,
  getCertificateById,
  getMyVolunteerCertificates,
  getMyOrganizationCertificates,
  verifyCertificate,
  resendCertificateEmail,
  checkCertificateExists
} from '../controllers/certificateController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/verify/:verificationCode', verifyCertificate)

// Protected routes (require authentication)
router.use(authenticate)

// Generate certificate (Organization only)
router.post('/generate/:applicationId', generateCertificate)

// Get single certificate
router.get('/:id', getCertificateById)

// Get my certificates (Volunteer)
router.get('/volunteer/my', getMyVolunteerCertificates)

// Get certificates issued by my organization (Organization)
router.get('/organization/my', getMyOrganizationCertificates)

// Resend certificate email (Organization)
router.post('/:id/resend', resendCertificateEmail)

// Check if certificate exists for application (Organization)
router.get('/check/:applicationId', checkCertificateExists)

export default router
