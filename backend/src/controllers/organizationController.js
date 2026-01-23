import { Organization, Opportunity, Application, User } from '../models/index.js'

export const createOrganization = async (req, res) => {
  try {
    const { name, description, contactDetails } = req.body

    console.log('📝 Creating organization for user:', req.user.id)

    // Check if user already has an organization
    const existing = await Organization.findOne({ where: { userId: req.user.id } })
    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: 'User already has an organization' 
      })
    }

    // Update user role to organization
    await User.update({ role: 'organization' }, { where: { id: req.user.id } })
    console.log('✅ User role updated to organization')

    // Create organization
    const organization = await Organization.create({
      userId: req.user.id,
      name,
      description,
      contactDetails
    })

    console.log('✅ Organization created:', organization.id)

    // Return the created organization with full details
    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: {
        id: organization.id,
        name: organization.name,
        description: organization.description,
        contactDetails: organization.contactDetails,
        logo: organization.logo,
        isVerified: organization.isVerified,
        verificationStatus: organization.verificationStatus,
        userId: organization.userId
      }
    })
  } catch (error) {
    console.error('❌ Create organization error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to create organization', 
      error: error.message 
    })
  }
}

export const getMyOrganization = async (req, res) => {
  try {
    const organization = await Organization.findOne({
      where: { userId: req.user.id },
      include: [{
        model: Opportunity,
        as: 'opportunities'
      }]
    })

    if (!organization) {
      return res.status(404).json({ 
        success: false,
        message: 'Organization not found' 
      })
    }

    res.json({
      success: true,
      data: organization
    })
  } catch (error) {
    console.error('Get organization error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to get organization', 
      error: error.message 
    })
  }
}

export const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, contactDetails } = req.body

    console.log('📝 Updating organization:', id, 'for user:', req.user.id)

    // Find organization
    const organization = await Organization.findByPk(id)
    
    if (!organization) {
      console.log('❌ Organization not found:', id)
      return res.status(404).json({ 
        success: false,
        message: 'Organization not found' 
      })
    }

    // Check ownership
    if (organization.userId !== req.user.id) {
      console.log('❌ User not authorized:', req.user.id)
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this organization' 
      })
    }

    // Update organization
    await organization.update({ 
      name: name || organization.name,
      description: description || organization.description,
      contactDetails: contactDetails || organization.contactDetails
    })

    console.log('✅ Organization updated:', organization.id)

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: organization
    })
  } catch (error) {
    console.error('❌ Update organization error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to update organization', 
      error: error.message 
    })
  }
}

export const uploadLogo = async (req, res) => {
  try {
    console.log('📤 Logo upload request received')
    console.log('File:', req.file)

    if (!req.file) {
      console.log('❌ No file uploaded')
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      })
    }

    // Find organization
    const organization = await Organization.findOne({ 
      where: { userId: req.user.id } 
    })
    
    if (!organization) {
      console.log('❌ Organization not found for user:', req.user.id)
      return res.status(404).json({ 
        success: false,
        message: 'Organization not found' 
      })
    }

    // Update logo path
    const logoPath = `/uploads/logos/${req.file.filename}`
    await organization.update({ logo: logoPath })

    console.log('✅ Logo uploaded successfully:', logoPath)

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: {
        logoUrl: logoPath,
        filename: req.file.filename
      }
    })
  } catch (error) {
    console.error('❌ Upload logo error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to upload logo', 
      error: error.message 
    })
  }
}

export const getOrganizationStats = async (req, res) => {
  try {
    const organization = await Organization.findOne({ 
      where: { userId: req.user.id } 
    })
    
    if (!organization) {
      return res.status(404).json({ 
        success: false,
        message: 'Organization not found' 
      })
    }

    const opportunities = await Opportunity.findAll({
      where: { organizationId: organization.id, status: 'active' }
    })

    const applications = await Application.findAll({
      where: {
        opportunityId: opportunities.map(o => o.id)
      }
    })

    const stats = {
      activeJobs: opportunities.length,
      totalApplicants: applications.length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      pending: applications.filter(a => a.status === 'pending').length
    }

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to get stats', 
      error: error.message 
    })
  }
}

export const getOrganizationOpportunities = async (req, res) => {
  try {
    const organization = await Organization.findOne({ 
      where: { userId: req.user.id } 
    })
    
    if (!organization) {
      return res.status(404).json({ 
        success: false,
        message: 'Organization not found' 
      })
    }

    const opportunities = await Opportunity.findAll({
      where: { organizationId: organization.id },
      order: [['createdAt', 'DESC']]
    })

    res.json({
      success: true,
      data: opportunities
    })
  } catch (error) {
    console.error('Get opportunities error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to get opportunities', 
      error: error.message 
    })
  }
}
