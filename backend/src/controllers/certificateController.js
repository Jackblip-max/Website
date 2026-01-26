import { Certificate, Application, Opportunity, Volunteer, Organization, User } from '../models/index.js'
import certificateService from '../services/certificateService.js'
import { sendCertificateEmail } from '../services/emailService.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * @desc    Generate and issue certificate
 * @route   POST /api/certificates/generate/:applicationId
 * @access  Private (Organization)
 */
export const generateCertificate = async (req, res) => {
  try {
    const { applicationId } = req.params
    const { completionDate, hoursContributed, customMessage } = req.body

    console.log('🎓 Generate certificate request:', { applicationId, completionDate, hoursContributed })

    // Validation
    if (!completionDate || !hoursContributed) {
      return res.status(400).json({
        success: false,
        message: 'Completion date and hours contributed are required'
      })
    }

    if (hoursContributed < 1 || hoursContributed > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Hours contributed must be between 1 and 1000'
      })
    }

    // Find application with all related data
    const application = await Application.findByPk(applicationId, {
      include: [
        {
          model: Volunteer,
          as: 'volunteer',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }]
        },
        {
          model: Opportunity,
          as: 'opportunity',
          include: [{
            model: Organization,
            as: 'organization',
            attributes: ['id', 'name', 'logo', 'signatoryName', 'signatoryTitle', 'signatureUrl']
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

    // Verify application is accepted
    if (application.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Can only issue certificates for accepted applications'
      })
    }

    // Verify organization ownership
    if (application.opportunity.organization.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to issue certificate for this application'
      })
    }

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({
      where: { applicationId }
    })

    if (existingCert) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already issued for this application',
        certificateId: existingCert.id
      })
    }

    // Generate certificate number and verification code
    const certificateNumber = certificateService.generateCertificateNumber()
    const verificationCode = certificateService.generateVerificationCode()

    console.log('📋 Certificate details:', { certificateNumber, verificationCode })

    // Prepare certificate data
    const organization = application.opportunity.organization
    const logoPath = organization.logo 
      ? path.join(__dirname, '../../', organization.logo)
      : null

    const certificateData = {
      volunteerName: application.volunteer.user.name,
      opportunityTitle: application.opportunity.title,
      organizationName: organization.name,
      organizationLogo: logoPath,
      completionDate,
      hoursContributed,
      location: application.opportunity.location,
      certificateNumber,
      verificationCode,
      signatoryName: organization.signatoryName || 'Organization Representative',
      signatoryTitle: organization.signatoryTitle || 'Director',
      signatureUrl: organization.signatureUrl 
        ? path.join(__dirname, '../../', organization.signatureUrl)
        : null
    }

    console.log('🎨 Generating certificate image...')

    // Generate certificate image
    const certificateFile = await certificateService.generateCertificate(certificateData)

    console.log('✅ Certificate image generated:', certificateFile.url)

    // Save certificate record to database
    const certificate = await Certificate.create({
      applicationId,
      opportunityId: application.opportunityId,
      volunteerId: application.volunteerId,
      organizationId: organization.id,
      certificateUrl: certificateFile.url,
      certificateNumber,
      verificationCode,
      completionDate,
      hoursContributed,
      customMessage: customMessage || null,
      issuedBy: req.user.id
    })

    console.log('💾 Certificate record saved to database')

    // Send certificate via email
    try {
      const fullCertificateUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}${certificateFile.url}`
      const certificateFilePath = certificateFile.filepath

      await sendCertificateEmail(
        application.volunteer.user.email,
        application.volunteer.user.name,
        {
          opportunityTitle: application.opportunity.title,
          organizationName: organization.name,
          certificateNumber,
          verificationCode,
          certificateUrl: fullCertificateUrl,
          certificateFilePath
        }
      )

      console.log('📧 Certificate email sent successfully')
    } catch (emailError) {
      console.error('⚠️ Failed to send certificate email:', emailError)
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Certificate generated and sent successfully!',
      data: {
        id: certificate.id,
        certificateNumber: certificate.certificateNumber,
        certificateUrl: certificate.certificateUrl,
        verificationCode: certificate.verificationCode
      }
    })
  } catch (error) {
    console.error('❌ Generate certificate error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate certificate',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * @desc    Get certificate by ID
 * @route   GET /api/certificates/:id
 * @access  Private
 */
export const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params

    const certificate = await Certificate.findByPk(id, {
      include: [
        {
          model: Volunteer,
          as: 'volunteer',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }]
        },
        {
          model: Opportunity,
          as: 'opportunity',
          attributes: ['id', 'title']
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'logo']
        }
      ]
    })

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      })
    }

    // Check authorization
    const isVolunteer = certificate.volunteer.userId === req.user.id
    const isOrganization = certificate.organization.userId === req.user.id

    if (!isVolunteer && !isOrganization && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this certificate'
      })
    }

    res.json({
      success: true,
      data: certificate
    })
  } catch (error) {
    console.error('Get certificate error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get certificate',
      error: error.message
    })
  }
}

/**
 * @desc    Get certificates for a volunteer
 * @route   GET /api/certificates/volunteer/my
 * @access  Private (Volunteer)
 */
export const getMyVolunteerCertificates = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })

    if (!volunteer) {
      return res.json({
        success: true,
        data: [],
        count: 0
      })
    }

    const certificates = await Certificate.findAll({
      where: { volunteerId: volunteer.id },
      include: [
        {
          model: Opportunity,
          as: 'opportunity',
          attributes: ['id', 'title', 'category']
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'logo']
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    res.json({
      success: true,
      data: certificates,
      count: certificates.length
    })
  } catch (error) {
    console.error('Get volunteer certificates error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get certificates',
      error: error.message
    })
  }
}

/**
 * @desc    Get certificates issued by organization
 * @route   GET /api/certificates/organization/my
 * @access  Private (Organization)
 */
export const getMyOrganizationCertificates = async (req, res) => {
  try {
    const organization = await Organization.findOne({ where: { userId: req.user.id } })

    if (!organization) {
      return res.json({
        success: true,
        data: [],
        count: 0
      })
    }

    const certificates = await Certificate.findAll({
      where: { organizationId: organization.id },
      include: [
        {
          model: Volunteer,
          as: 'volunteer',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }]
        },
        {
          model: Opportunity,
          as: 'opportunity',
          attributes: ['id', 'title']
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    res.json({
      success: true,
      data: certificates,
      count: certificates.length
    })
  } catch (error) {
    console.error('Get organization certificates error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get certificates',
      error: error.message
    })
  }
}

/**
 * @desc    Verify certificate by verification code
 * @route   GET /api/certificates/verify/:verificationCode
 * @access  Public
 */
export const verifyCertificate = async (req, res) => {
  try {
    const { verificationCode } = req.params

    const certificate = await Certificate.findOne({
      where: { verificationCode },
      include: [
        {
          model: Volunteer,
          as: 'volunteer',
          include: [{
            model: User,
            as: 'user',
            attributes: ['name']
          }]
        },
        {
          model: Opportunity,
          as: 'opportunity',
          attributes: ['title']
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['name', 'logo']
        }
      ]
    })

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid verification code'
      })
    }

    res.json({
      success: true,
      valid: true,
      data: {
        certificateNumber: certificate.certificateNumber,
        volunteerName: certificate.volunteer.user.name,
        opportunityTitle: certificate.opportunity.title,
        organizationName: certificate.organization.name,
        organizationLogo: certificate.organization.logo,
        completionDate: certificate.completionDate,
        hoursContributed: certificate.hoursContributed,
        issuedDate: certificate.createdAt
      }
    })
  } catch (error) {
    console.error('Verify certificate error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate',
      error: error.message
    })
  }
}

/**
 * @desc    Resend certificate email
 * @route   POST /api/certificates/:id/resend
 * @access  Private (Organization)
 */
export const resendCertificateEmail = async (req, res) => {
  try {
    const { id } = req.params

    const certificate = await Certificate.findByPk(id, {
      include: [
        {
          model: Volunteer,
          as: 'volunteer',
          include: [{
            model: User,
            as: 'user',
            attributes: ['name', 'email']
          }]
        },
        {
          model: Opportunity,
          as: 'opportunity',
          attributes: ['title']
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'userId', 'name']
        }
      ]
    })

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      })
    }

    // Verify organization ownership
    if (certificate.organization.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      })
    }

    // Resend email
    const fullCertificateUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}${certificate.certificateUrl}`
    const certificateFilePath = path.join(__dirname, '../../', certificate.certificateUrl)

    await sendCertificateEmail(
      certificate.volunteer.user.email,
      certificate.volunteer.user.name,
      {
        opportunityTitle: certificate.opportunity.title,
        organizationName: certificate.organization.name,
        certificateNumber: certificate.certificateNumber,
        verificationCode: certificate.verificationCode,
        certificateUrl: fullCertificateUrl,
        certificateFilePath
      }
    )

    res.json({
      success: true,
      message: 'Certificate email resent successfully'
    })
  } catch (error) {
    console.error('Resend certificate email error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to resend certificate email',
      error: error.message
    })
  }
}

/**
 * @desc    Check if certificate exists for application
 * @route   GET /api/certificates/check/:applicationId
 * @access  Private (Organization)
 */
export const checkCertificateExists = async (req, res) => {
  try {
    const { applicationId } = req.params

    const certificate = await Certificate.findOne({
      where: { applicationId },
      attributes: ['id', 'certificateNumber', 'createdAt']
    })

    res.json({
      success: true,
      exists: !!certificate,
      certificate: certificate || null
    })
  } catch (error) {
    console.error('Check certificate error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to check certificate',
      error: error.message
    })
  }
}
