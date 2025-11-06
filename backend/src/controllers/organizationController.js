import { Organization, Opportunity, Application, User } from '../models/index.js'

export const createOrganization = async (req, res) => {
  try {
    const { name, description, contactDetails } = req.body

    // Check if user already has an organization
    const existing = await Organization.findOne({ where: { userId: req.user.id } })
    if (existing) {
      return res.status(400).json({ message: 'User already has an organization' })
    }

    // Update user role to organization
    await User.update({ role: 'organization' }, { where: { id: req.user.id } })

    const organization = await Organization.create({
      userId: req.user.id,
      name,
      description,
      contactDetails
    })

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: organization
    })
  } catch (error) {
    console.error('Create organization error:', error)
    res.status(500).json({ message: 'Failed to create organization', error: error.message })
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
      return res.status(404).json({ message: 'Organization not found' })
    }

    res.json({
      success: true,
      data: organization
    })
  } catch (error) {
    console.error('Get organization error:', error)
    res.status(500).json({ message: 'Failed to get organization', error: error.message })
  }
}

export const updateOrganization = async (req, res) => {
  try {
    const { name, description, contactDetails } = req.body

    const organization = await Organization.findOne({ where: { userId: req.user.id } })
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' })
    }

    await organization.update({ name, description, contactDetails })

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: organization
    })
  } catch (error) {
    console.error('Update organization error:', error)
    res.status(500).json({ message: 'Failed to update organization', error: error.message })
  }
}

export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const organization = await Organization.findOne({ where: { userId: req.user.id } })
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' })
    }

    const logoPath = `/uploads/logos/${req.file.filename}`
    await organization.update({ logo: logoPath })

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      logoUrl: logoPath
    })
  } catch (error) {
    console.error('Upload logo error:', error)
    res.status(500).json({ message: 'Failed to upload logo', error: error.message })
  }
}

export const getOrganizationStats = async (req, res) => {
  try {
    const organization = await Organization.findOne({ where: { userId: req.user.id } })
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' })
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
    res.status(500).json({ message: 'Failed to get stats', error: error.message })
  }
}

export const getOrganizationOpportunities = async (req, res) => {
  try {
    const organization = await Organization.findOne({ where: { userId: req.user.id } })
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' })
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
    res.status(500).json({ message: 'Failed to get opportunities', error: error.message })
  }
}