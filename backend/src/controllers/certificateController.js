import { Certificate, Application, Opportunity, Volunteer, Organization, User } from '../models/index.js'
import CertificateService from '../services/certificateService.js'
import { sendCertificateEmail } from '../services/emailService.js'
import { Op } from 'sequelize'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ── Resolve a stored logo URL/path → absolute filesystem path ────────────────
// organization.logo is stored as e.g. "/uploads/logos/logo-123456.jpg"
// Canvas's loadImage() needs the real disk path, not a URL path.
const resolveLogoPath = (logoValue) => {
  if (!logoValue) return null

  // Already absolute and exists
  if (path.isAbsolute(logoValue) && fs.existsSync(logoValue)) return logoValue

  // Strip leading /uploads/ and resolve from project root
  const relative = logoValue.replace(/^\/uploads\//, '')
  const candidates = [
    path.join(__dirname, '../../uploads', relative),   // src/controllers → backend/uploads
    path.join(process.cwd(), 'uploads', relative),      // cwd/uploads
    path.join(__dirname, '../../../uploads', relative),  // deeper nesting fallback
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }

  console.warn('⚠️  Could not resolve logo path:', logoValue)
  return null
}

// @desc    Generate certificate for accepted volunteer
// @route   POST /api/certificates/generate/:applicationId
// @access  Private (Organization only)
export const generateCertificate = async (req, res) => {
  try {
    const { applicationId } = req.params
    const { hoursContributed, completionDate, customMessage } = req.body

    // Get organization ID
    let organizationId = req.user.organizationId
    if (!organizationId) {
      const org = await Organization.findOne({ where: { userId: req.user.id } })
      if (!org) {
        return res.status(403).json({ success: false, message: 'No organization found for this user' })
      }
      organizationId = org.id
    }

    console.log('📋 Generating certificate request:')
    console.log('Application ID:', applicationId)
    console.log('User ID:', req.user.id)
    console.log('Organization ID:', organizationId)
    console.log('Hours:', hoursContributed)
    console.log('Date:', completionDate)

    if (!hoursContributed || !completionDate) {
      return res.status(400).json({
        success: false,
        message: 'Hours contributed and completion date are required',
      })
    }

    // Fetch application with all related data
    const application = await Application.findByPk(applicationId, {
      include: [
        {
          model: Opportunity,
          as: 'opportunity',
          include: [{ model: Organization, as: 'organization' }],
        },
        {
          model: Volunteer,
          as: 'volunteer',
          include: [{ model: User, as: 'user' }],
        },
      ],
    })

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' })
    }

    // Authorization check
    if (application.opportunity.organization.id !== organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to issue certificate for this application',
      })
    }

    if (application.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Certificate can only be generated for accepted applications',
      })
    }

    // Check for existing certificate
    const existingCertificate = await Certificate.findOne({ where: { applicationId } })
    if (existingCertificate) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already exists for this application',
        certificate: existingCertificate,
      })
    }

    const organization = application.opportunity.organization

    // Generate unique identifiers
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    const verificationCode = `${Math.random().toString(36).substr(2, 8).toUpperCase()}`

    // ── KEY FIX: resolve logo to absolute path before passing to service ──────
    const resolvedLogoPath = resolveLogoPath(organization.logo)
    console.log('🖼️  Logo stored value :', organization.logo)
    console.log('🖼️  Logo resolved path:', resolvedLogoPath)

    // Build certificate data
    const certificateData = {
      volunteerName:    application.volunteer.user.name,
      organizationName: organization.name,
      organizationLogo: resolvedLogoPath,          // ← absolute path or null
      opportunityTitle: application.opportunity.title,
      hoursContributed,
      completionDate,
      location:         application.opportunity.location || 'Remote',
      customMessage,
      certificateNumber,
      verificationCode,
      signatoryName:    organization.signatoryName  || null,
      signatoryTitle:   organization.signatoryTitle || null,
      signatureUrl:     organization.signatureUrl   ? resolveLogoPath(organization.signatureUrl) : null,
    }

    console.log('🎨 Generating certificate for:', certificateData.volunteerName)

    // Generate the certificate image
    const certificateResult = await CertificateService.generateCertificate(certificateData)

    const qrCode = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-certificate/${verificationCode}`

    // Persist to DB
    const certificate = await Certificate.create({
      certificateNumber,
      verificationCode,
      issuedBy:       req.user.id,
      applicationId,
      volunteerId:    application.volunteerId,
      opportunityId:  application.opportunityId,
      organizationId,
      hoursContributed,
      completionDate,
      customMessage,
      qrCode,
      issuedDate:     new Date(),
      certificateUrl: certificateResult.url,
    })

    console.log('✅ Certificate saved to database:', certificate.id)

    // Send email with attachment
    try {
      await sendCertificateEmail(
        application.volunteer.user.email,
        application.volunteer.user.name,
        {
          opportunityTitle:  application.opportunity.title,
          organizationName:  organization.name,
          certificateNumber,
          verificationCode,
          certificateUrl:    `${process.env.BACKEND_URL || 'http://localhost:5000'}${certificateResult.url}`,
          certificateFilePath: certificateResult.filepath,
        }
      )
      console.log('✅ Certificate email sent')
    } catch (emailError) {
      console.error('❌ Certificate email failed (non-fatal):', emailError.message)
    }

    res.status(201).json({
      success: true,
      message: 'Certificate generated and sent successfully',
      certificate: {
        id:               certificate.id,
        certificateNumber: certificate.certificateNumber,
        verificationCode:  certificate.verificationCode,
        qrCode:            certificate.qrCode,
        certificateUrl:    certificate.certificateUrl,
        issuedDate:        certificate.issuedDate,
      },
    })
  } catch (error) {
    console.error('❌ Error generating certificate:', error)
    res.status(500).json({ success: false, message: 'Error generating certificate', error: error.message })
  }
}

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
// @access  Public
export const getCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findByPk(req.params.id, {
      include: [
        { model: Volunteer,    as: 'volunteer',    include: [{ model: User, as: 'user' }] },
        { model: Opportunity,  as: 'opportunity' },
        { model: Organization, as: 'organization' },
      ],
    })
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' })
    }
    res.json({ success: true, certificate })
  } catch (error) {
    console.error('Error fetching certificate:', error)
    res.status(500).json({ success: false, message: 'Error fetching certificate' })
  }
}

// @desc    Verify certificate by QR / verification code
// @route   GET /api/certificates/verify/:qrCode
// @access  Public
export const verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      where: { qrCode: { [Op.like]: `%${req.params.qrCode}%` } },
      include: [
        { model: Volunteer,    as: 'volunteer',    include: [{ model: User, as: 'user' }] },
        { model: Opportunity,  as: 'opportunity' },
        { model: Organization, as: 'organization' },
      ],
    })
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found or invalid' })
    }
    res.json({
      success: true,
      valid: true,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        volunteerName:     certificate.volunteer.user.name,
        organizationName:  certificate.organization.name,
        opportunityTitle:  certificate.opportunity.title,
        hoursContributed:  certificate.hoursContributed,
        completionDate:    certificate.completionDate,
        issuedDate:        certificate.issuedDate,
      },
    })
  } catch (error) {
    console.error('Error verifying certificate:', error)
    res.status(500).json({ success: false, message: 'Error verifying certificate' })
  }
}

// @desc    Get all certificates for a volunteer
// @route   GET /api/certificates/volunteer/my-certificates
// @access  Private (Volunteer only)
export const getCertificatesByVolunteer = async (req, res) => {
  try {
    const certificates = await Certificate.findAll({
      where:   { volunteerId: req.user.volunteerId },
      include: [
        { model: Opportunity,  as: 'opportunity' },
        { model: Organization, as: 'organization' },
      ],
      order: [['issuedDate', 'DESC']],
    })
    res.json({ success: true, count: certificates.length, certificates })
  } catch (error) {
    console.error('Error fetching volunteer certificates:', error)
    res.status(500).json({ success: false, message: 'Error fetching certificates' })
  }
}

// @desc    Get all certificates issued by an organization
// @route   GET /api/certificates/organization/issued
// @access  Private (Organization only)
export const getCertificatesByOrganization = async (req, res) => {
  try {
    const certificates = await Certificate.findAll({
      where:   { organizationId: req.user.organizationId },
      include: [
        { model: Volunteer, as: 'volunteer', include: [{ model: User, as: 'user' }] },
        { model: Opportunity, as: 'opportunity' },
      ],
      order: [['issuedDate', 'DESC']],
    })
    res.json({ success: true, count: certificates.length, certificates })
  } catch (error) {
    console.error('Error fetching organization certificates:', error)
    res.status(500).json({ success: false, message: 'Error fetching certificates' })
  }
}
