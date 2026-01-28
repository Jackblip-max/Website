import { Application, Volunteer, Opportunity, Organization, User } from '../models/index.js'

export const createApplication = async (req, res) => {
  try {
    const { opportunityId } = req.body

    console.log('📝 Create application request')
    console.log('   User ID:', req.user.id)
    console.log('   Opportunity ID:', opportunityId)

    // User MUST have volunteer profile from registration
    const volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    
    if (!volunteer) {
      console.log('❌ No volunteer profile found for user:', req.user.id)
      return res.status(400).json({ 
        success: false,
        message: 'Volunteer profile not found. Please complete your registration.' 
      })
    }

    console.log('✅ Volunteer profile found:', volunteer.id)

    // Check if opportunity exists and is active - INCLUDE ORGANIZATION
    const opportunity = await Opportunity.findByPk(opportunityId, {
      include: [{
        model: Organization,
        as: 'organization',
        attributes: ['id', 'userId', 'name']
      }]
    })
    
    if (!opportunity) {
      console.log('❌ Opportunity not found:', opportunityId)
      return res.status(404).json({ 
        success: false,
        message: 'Opportunity not found' 
      })
    }

    console.log('✅ Opportunity found:', opportunity.title)
    console.log('📋 Opportunity Organization:', {
      id: opportunity.organization?.id,
      userId: opportunity.organization?.userId,
      name: opportunity.organization?.name
    })
    
    // ⭐ CRITICAL FIX: Check if user owns the organization that posted this opportunity
    const userOrganization = await Organization.findOne({
      where: { userId: req.user.id }
    })

    if (userOrganization) {
      console.log('🏢 User has organization:', userOrganization.name, '(id:', userOrganization.id, ')')
      
      // Check if this opportunity belongs to the user's organization
      if (opportunity.organizationId === userOrganization.id) {
        console.log('❌ BLOCKED: User trying to apply to their own organization\'s opportunity')
        return res.status(403).json({ 
          success: false,
          message: 'You cannot apply to opportunities from your own organization' 
        })
      }
    }

    console.log('✅ Ownership check passed - user can apply to this opportunity')
    
    if (opportunity.status !== 'active') {
      console.log('❌ Opportunity is not active. Status:', opportunity.status)
      return res.status(400).json({ 
        success: false,
        message: 'This opportunity is no longer active' 
      })
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      where: { 
        opportunityId, 
        volunteerId: volunteer.id 
      }
    })
    
    if (existingApplication) {
      console.log('⚠️ Already applied. Application ID:', existingApplication.id)
      return res.status(400).json({ 
        success: false,
        message: 'Already applied to this opportunity' 
      })
    }

    // Create application
    const application = await Application.create({
      opportunityId,
      volunteerId: volunteer.id,
      status: 'pending'
    })

    console.log('✅ Application created successfully')
    console.log('   Application ID:', application.id)
    console.log('   Status:', application.status)
    console.log('   Applied at:', application.appliedAt || application.createdAt)

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    })
  } catch (error) {
    console.error('❌ Create application error:', error)
    console.error('Error stack:', error.stack)
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

    // User MUST have volunteer profile from registration
    const volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    
    if (!volunteer) {
      // Return empty array instead of error (better UX)
      console.log('⚠️ No volunteer profile found for user:', req.user.id)
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'No volunteer profile found. Please complete your registration.'
      })
    }

    console.log('✅ Volunteer profile found:', volunteer.id)

    // Fetch applications with full details
    const applications = await Application.findAll({
      where: { volunteerId: volunteer.id },
      include: [{
        model: Opportunity,
        as: 'opportunity',
        include: [{
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'logo', 'description', 'contactDetails']
        }],
        attributes: ['id', 'title', 'description', 'category', 'location', 'mode', 'timeCommitment', 'requirements', 'benefits', 'deadline', 'status']
      }],
      order: [['createdAt', 'DESC']]
    })

    console.log('✅ Found', applications.length, 'applications')
    
    if (applications.length > 0) {
      console.log('📋 Applications summary:')
      applications.forEach((app, index) => {
        console.log(`   ${index + 1}. ${app.opportunity?.title || 'Unknown'} - Status: ${app.status}`)
      })
    }

    res.json({
      success: true,
      data: applications,
      count: applications.length
    })
  } catch (error) {
    console.error('❌ Get applications error:', error)
    console.error('Error stack:', error.stack)
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

    console.log('✅ Accept application request')
    console.log('   Application ID:', id)
    console.log('   User ID:', req.user.id)

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
      console.log('❌ Application not found')
      return res.status(404).json({ 
        success: false,
        message: 'Application not found' 
      })
    }

    console.log('✅ Application found')
    console.log('   Opportunity:', application.opportunity?.title)
    console.log('   Organization:', application.opportunity?.organization?.name)
    console.log('   Organization owner:', application.opportunity?.organization?.userId)

    // Check if user owns the organization
    if (application.opportunity.organization.userId !== req.user.id) {
      console.log('❌ Not authorized - User does not own this organization')
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      })
    }

    console.log('✅ Authorization check passed')

    // Update application status
    await application.update({ status: 'accepted' })

    console.log('✅ Application accepted successfully')

    res.json({
      success: true,
      message: 'Application accepted successfully',
      data: application
    })
  } catch (error) {
    console.error('❌ Accept application error:', error)
    console.error('Error stack:', error.stack)
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

    console.log('❌ Decline application request')
    console.log('   Application ID:', id)
    console.log('   User ID:', req.user.id)

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
      console.log('❌ Application not found')
      return res.status(404).json({ 
        success: false,
        message: 'Application not found' 
      })
    }

    console.log('✅ Application found')
    console.log('   Opportunity:', application.opportunity?.title)
    console.log('   Organization:', application.opportunity?.organization?.name)

    // Check if user owns the organization
    if (application.opportunity.organization.userId !== req.user.id) {
      console.log('❌ Not authorized - User does not own this organization')
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      })
    }

    console.log('✅ Authorization check passed')

    // Update application status
    await application.update({ status: 'rejected' })

    console.log('✅ Application declined successfully')

    res.json({
      success: true,
      message: 'Application declined successfully',
      data: application
    })
  } catch (error) {
    console.error('❌ Decline application error:', error)
    console.error('Error stack:', error.stack)
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

    console.log('🗑️ Withdraw application request')
    console.log('   Application ID:', id)
    console.log('   User ID:', req.user.id)

    // Find volunteer profile
    const volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    
    if (!volunteer) {
      console.log('❌ Volunteer profile not found')
      return res.status(400).json({ 
        success: false,
        message: 'Volunteer profile not found' 
      })
    }

    console.log('✅ Volunteer profile found:', volunteer.id)

    // Find application
    const application = await Application.findOne({
      where: { 
        id, 
        volunteerId: volunteer.id 
      }
    })

    if (!application) {
      console.log('❌ Application not found or does not belong to user')
      return res.status(404).json({ 
        success: false,
        message: 'Application not found' 
      })
    }

    console.log('✅ Application found - Status:', application.status)

    // Only allow deletion of pending applications
    if (application.status !== 'pending') {
      console.log('❌ Cannot withdraw - Application status is:', application.status)
      return res.status(400).json({
        success: false,
        message: 'Can only withdraw pending applications'
      })
    }

    // Delete application
    await application.destroy()

    console.log('✅ Application withdrawn successfully')

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    })
  } catch (error) {
    console.error('❌ Delete application error:', error)
    console.error('Error stack:', error.stack)
    res.status(500).json({ 
      success: false,
      message: 'Failed to withdraw application', 
      error: error.message 
    })
  }
}
