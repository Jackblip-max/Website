import { Certificate, Application, Opportunity, Volunteer, Organization, User } from '../models/index.js'
import CertificateService from '../services/certificateService.js'
import emailService from '../services/emailService.js'
import { Op } from 'sequelize'

// @desc    Generate certificate for accepted volunteer
// @route   POST /api/certificates/generate/:applicationId
// @access  Private (Organization only)
export const generateCertificate = async (req, res) => {
  try {
    const { applicationId } = req.params
    const { hoursContributed, completionDate, customMessage } = req.body
    const organizationId = req.user.organizationId

    console.log('📋 Generating certificate request:')
    console.log('Application ID:', applicationId)
    console.log('Organization ID:', organizationId)
    console.log('Hours:', hoursContributed)
    console.log('Date:', completionDate)

    // Validate required fields
    if (!hoursContributed || !completionDate) {
      return res.status(400).json({
        success: false,
        message: 'Hours contributed and completion date are required'
      })
    }

    // Get application with all related data
    const application = await Application.findByPk(applicationId, {
      include: [
        {
          model: Opportunity,
          as: 'opportunity',
          include: [{
            model: Organization,
            as: 'organization'
          }]
        },
        {
          model: Volunteer,
          as: 'volunteer',
          include: [{
            model: User,
            as: 'user'
          }]
        }
      ]
    })

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      })
    }

    console.log('✅ Application found:', {
      id: application.id,
      status: application.status,
      opportunityOrgId: application.opportunity?.organization?.id,
      requestingOrgId: organizationId
    })

    // CRITICAL: Check if the organization owns this opportunity/application
    if (application.opportunity.organization.id !== organizationId) {
      console.log('❌ Authorization failed: Organization does not own this application')
      return res.status(403).json({
        success: false,
        message: 'Not authorized to issue certificate for this application'
      })
    }

    // Check if application is accepted
    if (application.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Certificate can only be generated for accepted applications'
      })
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      where: { applicationId }
    })

    if (existingCertificate) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already exists for this application',
        certificate: existingCertificate
      })
    }

    // Get organization details for certificate
    const organization = application.opportunity.organization

    // Generate certificate using service
    const certificateData = {
      volunteerName: application.volunteer.user.name,
      organizationName: organization.name,
      organizationLogo: organization.logo,
      opportunityTitle: application.opportunity.title,
      hoursContributed,
      completionDate,
      customMessage,
      signatoryName: organization.signatoryName,
      signatoryTitle: organization.signatoryTitle,
      signatureUrl: organization.signatureUrl
    }

    console.log('🎨 Generating certificate with data:', certificateData)

    const certificateBuffer = await CertificateService.generateCertificate(certificateData)
    
    // Generate unique certificate number
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    // Generate QR code data
    const qrCode = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-certificate/${certificateNumber}`

    // Save certificate to database
    const certificate = await Certificate.create({
      certificateNumber,
      applicationId,
      volunteerId: application.volunteerId,
      opportunityId: application.opportunityId,
      organizationId,
      hoursContributed,
      completionDate,
      customMessage,
      qrCode,
      issuedDate: new Date(),
      certificateUrl: `/uploads/certificates/${certificateNumber}.pdf`
    })

    console.log('✅ Certificate saved to database:', certificate.id)

    // Save certificate file
    const fs = await import('fs')
    const path = await import('path')
    
    const uploadsDir = path.join(process.cwd(), 'uploads', 'certificates')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    
    const filePath = path.join(uploadsDir, `${certificateNumber}.pdf`)
    fs.writeFileSync(filePath, certificateBuffer)

    console.log('✅ Certificate file saved:', filePath)

    // Send certificate via email
    try {
      await emailService.sendCertificateEmail({
        to: application.volunteer.user.email,
        volunteerName: application.volunteer.user.name,
        certificateNumber,
        organizationName: organization.name,
        opportunityTitle: application.opportunity.title,
        certificateBuffer
      })
      console.log('✅ Certificate email sent')
    } catch (emailError) {
      console.error('❌ Error sending certificate email:', emailError)
      // Don't fail the whole request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Certificate generated and sent successfully',
      certificate: {
        id: certificate.id,
        certificateNumber: certificate.certificateNumber,
        qrCode: certificate.qrCode,
        certificateUrl: certificate.certificateUrl,
        issuedDate: certificate.issuedDate
      }
    })

  } catch (error) {
    console.error('❌ Error generating certificate:', error)
    res.status(500).json({
      success: false,
      message: 'Error generating certificate',
      error: error.message
    })
  }
}

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
// @access  Public
export const getCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findByPk(req.params.id, {
      include: [
        {
          model: Volunteer,
          as: 'volunteer',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Opportunity,
          as: 'opportunity'
        },
        {
          model: Organization,
          as: 'organization'
        }
      ]
    })

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      })
    }

    res.json({
      success: true,
      certificate
    })
  } catch (error) {
    console.error('Error fetching certificate:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching certificate'
    })
  }
}

// @desc    Verify certificate by QR code
// @route   GET /api/certificates/verify/:qrCode
// @access  Public
export const verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      where: { qrCode: { [Op.like]: `%${req.params.qrCode}%` } },
      include: [
        {
          model: Volunteer,
          as: 'volunteer',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Opportunity,
          as: 'opportunity'
        },
        {
          model: Organization,
          as: 'organization'
        }
      ]
    })

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid'
      })
    }

    res.json({
      success: true,
      valid: true,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        volunteerName: certificate.volunteer.user.name,
        organizationName: certificate.organization.name,
        opportunityTitle: certificate.opportunity.title,
        hoursContributed: certificate.hoursContributed,
        completionDate: certificate.completionDate,
        issuedDate: certificate.issuedDate
      }
    })
  } catch (error) {
    console.error('Error verifying certificate:', error)
    res.status(500).json({
      success: false,
      message: 'Error verifying certificate'
    })
  }
}

// @desc    Get all certificates for a volunteer
// @route   GET /api/certificates/volunteer/my-certificates
// @access  Private (Volunteer only)
export const getCertificatesByVolunteer = async (req, res) => {
  try {
    const volunteerId = req.user.volunteerId

    const certificates = await Certificate.findAll({
      where: { volunteerId },
      include: [
        {
          model: Opportunity,
          as: 'opportunity'
        },
        {
          model: Organization,
          as: 'organization'
        }
      ],
      order: [['issuedDate', 'DESC']]
    })

    res.json({
      success: true,
      count: certificates.length,
      certificates
    })
  } catch (error) {
    console.error('Error fetching volunteer certificates:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching certificates'
    })
  }
}

// @desc    Get all certificates issued by an organization
// @route   GET /api/certificates/organization/issued
// @access  Private (Organization only)
export const getCertificatesByOrganization = async (req, res) => {
  try {
    const organizationId = req.user.organizationId

    const certificates = await Certificate.findAll({
      where: { organizationId },
      include: [
        {
          model: Volunteer,
          as: 'volunteer',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Opportunity,
          as: 'opportunity'
        }
      ],
      order: [['issuedDate', 'DESC']]
    })

    res.json({
      success: true,
      count: certificates.length,
      certificates
    })
  } catch (error) {
    console.error('Error fetching organization certificates:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching certificates'
    })
  }
}
