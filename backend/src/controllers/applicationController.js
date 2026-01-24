import { Application, Volunteer, Opportunity, Organization, User } from '../models/index.js'

export const createApplication = async (req, res) => {
  try {
    const { opportunityId } = req.body

    console.log('📝 Creating application for opportunity:', opportunityId, 'user:', req.user.id)

    // Find or create volunteer profile
    let volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    
    if (!volunteer) {
      console.log('📝 Creating volunteer profile for user:', req.user.id)
      volunteer = await Volunteer.create({
        userId: req.user.id,
        education: 'undergraduate',
        skills: '',
        preferredCategories: [],
        preferredModes: [],
        notificationsEnabled: true
      })
    }

    // Check if opportunity exists and is active
    const opportunity = await Opportunity.findByPk(opportunityId)
    if (!opportunity) {
      return res.status(404).json({ 
        success: false,
        message: 'Opportunity not found' 
      })
    }
    if (opportunity.status !== 'active') {
      return res.status(400).json({ 
        success: false,
        message: 'This opportunity is no longer active' 
      })
    }

    // Check if already applied
    const existing = await Application.findOne({
      where: { opportunityId, volunteerId: volunteer.id }
    })
    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: 'Already applied to this opportunity' 
      })
    }

    // Create application
    const application = await Application.create({
      opportunityId,
      volunteerId: volunteer.id
    })

    console.log('✅ Application created:', application.id)

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    })
  } catch (error) {
    console.error('❌ Create application error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit application', 
      error: error.message 
    })
  }
}

export const getMyApplications = async (req, res) => {
  try {
    console.log('📋 Fetching applications for user:', req.user.id)

    // Find or create volunteer profile
    let volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    
    if (!volunteer) {
      console.log('📝 Creating volunteer profile for user:', req.user.id)
      volunteer = await Volunteer.create({
        userId: req.user.id,
        education: 'undergraduate',
        skills: '',
        preferredCategories: [],
        preferredModes: [],
        notificationsEnabled: true
      })
    }

    console.log('✅ Found volunteer profile:', volunteer.id)

    // Fetch applications with full details
    const applications = await Application.findAll({
      where: { volunteerId: volunteer.id },
      include: [{
        model: Opportunity,
        as: 'opportunity',
        include: [{
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'logo', 'description']
        }],
        attributes: ['id', 'title', 'description', 'category', 'location', 'mode', 'timeCommitment', 'requirements', 'benefits', 'deadline', 'status']
      }],
      order: [['createdAt', 'DESC']]
    })

    console.log('✅ Found', applications.length, 'applications')
    console.log('📦 Applications data:', JSON.stringify(applications, null, 2))

    res.json({
      success: true,
      data: applications,
      count: applications.length
    })
  } catch (error) {
    console.error('❌ Get applications error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to get applications', 
      error: error.message 
    })
  }
}

export const acceptApplication = async (req, res) => {
  try {
    const { id } = req.params

    console.log('✅ Accepting application:', id)

    const application = await Application.findByPk(id, {
      include: [{
        model: Opportunity,
        as: 'opportunity',
        include: [{
          model: Organization,
          as: 'organization'
        }]
      }]
    })

    if (!application) {
      return res.status(404).json({ 
        success: false,
        message: 'Application not found' 
      })
    }

    // Check if user owns the organization
    if (application.opportunity.organization.userId !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      })
    }

    await application.update({ status: 'accepted' })

    console.log('✅ Application accepted')

    res.json({
      success: true,
      message: 'Application accepted successfully',
      data: application
    })
  } catch (error) {
    console.error('❌ Accept application error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to accept application', 
      error: error.message 
    })
  }
}

export const declineApplication = async (req, res) => {
  try {
    const { id } = req.params

    console.log('❌ Declining application:', id)

    const application = await Application.findByPk(id, {
      include: [{
        model: Opportunity,
        as: 'opportunity',
        include: [{
          model: Organization,
          as: 'organization'
        }]
      }]
    })

    if (!application) {
      return res.status(404).json({ 
        success: false,
        message: 'Application not found' 
      })
    }

    // Check if user owns the organization
    if (application.opportunity.organization.userId !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      })
    }

    await application.update({ status: 'rejected' })

    console.log('✅ Application declined')

    res.json({
      success: true,
      message: 'Application declined successfully',
      data: application
    })
  } catch (error) {
    console.error('❌ Decline application error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to decline application', 
      error: error.message 
    })
  }
}

export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params

    console.log('🗑️ Withdrawing application:', id, 'for user:', req.user.id)

    // Find volunteer profile
    const volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    
    if (!volunteer) {
      return res.status(403).json({ 
        success: false,
        message: 'Volunteer profile not found' 
      })
    }

    // Find application
    const application = await Application.findOne({
      where: { id, volunteerId: volunteer.id }
    })

    if (!application) {
      return res.status(404).json({ 
        success: false,
        message: 'Application not found' 
      })
    }

    // Only allow deletion of pending applications
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only withdraw pending applications'
      })
    }

    await application.destroy()

    console.log('✅ Application withdrawn')

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    })
  } catch (error) {
    console.error('❌ Delete application error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to withdraw application', 
      error: error.message 
    })
  }
}
