import { Opportunity, Organization, Application, SavedOpportunity, Volunteer } from '../models/index.js'
import { Op } from 'sequelize'

export const getOpportunities = async (req, res) => {
  try {
    const { mode, category, search } = req.query
    const where = { status: 'active' }

    if (mode) where.mode = mode
    if (category) where.category = category
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ]
    }

    const opportunities = await Opportunity.findAll({
      where,
      include: [{
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name', 'logo']
      }],
      order: [['createdAt', 'DESC']]
    })

    const formattedOpportunities = opportunities.map(opp => ({
      id: opp.id,
      title: opp.title,
      description: opp.description,
      category: opp.category,
      location: opp.location,
      mode: opp.mode,
      timeCommitment: opp.timeCommitment,
      requirements: opp.requirements,
      benefits: opp.benefits,
      deadline: opp.deadline,
      organizationName: opp.organization.name,
      organizationLogo: opp.organization.logo
    }))

    res.json({
      success: true,
      data: formattedOpportunities
    })
  } catch (error) {
    console.error('Get opportunities error:', error)
    res.status(500).json({ message: 'Failed to get opportunities', error: error.message })
  }
}

export const getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params

    const opportunity = await Opportunity.findByPk(id, {
      include: [{
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name', 'description', 'logo', 'contactDetails']
      }]
    })

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' })
    }

    res.json({
      success: true,
      data: opportunity
    })
  } catch (error) {
    console.error('Get opportunity error:', error)
    res.status(500).json({ message: 'Failed to get opportunity', error: error.message })
  }
}

export const createOpportunity = async (req, res) => {
  try {
    const { title, description, category, location, mode, timeCommitment, requirements, benefits, deadline } = req.body

    // Get organization
    const organization = await Organization.findOne({ where: { userId: req.user.id } })
    if (!organization) {
      return res.status(403).json({ message: 'Only organizations can create opportunities' })
    }

    // ⭐ NEW: Check if organization is approved
    if (organization.verificationStatus !== 'approved') {
      return res.status(403).json({ 
        success: false,
        message: 'Your organization must be verified and approved before posting opportunities. Please wait for admin approval.' 
      })
    }

    const opportunity = await Opportunity.create({
      organizationId: organization.id,
      title,
      description,
      category,
      location,
      mode,
      timeCommitment,
      requirements,
      benefits,
      deadline
    })

    res.status(201).json({
      success: true,
      message: 'Opportunity created successfully',
      data: opportunity
    })
  } catch (error) {
    console.error('Create opportunity error:', error)
    res.status(500).json({ message: 'Failed to create opportunity', error: error.message })
  }
}

export const updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const opportunity = await Opportunity.findByPk(id, {
      include: [{ model: Organization, as: 'organization' }]
    })

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' })
    }

    if (opportunity.organization.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this opportunity' })
    }

    await opportunity.update(updates)

    res.json({
      success: true,
      message: 'Opportunity updated successfully',
      data: opportunity
    })
  } catch (error) {
    console.error('Update opportunity error:', error)
    res.status(500).json({ message: 'Failed to update opportunity', error: error.message })
  }
}

export const deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params

    const opportunity = await Opportunity.findByPk(id, {
      include: [{ model: Organization, as: 'organization' }]
    })

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' })
    }

    if (opportunity.organization.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this opportunity' })
    }

    await opportunity.destroy()

    res.json({
      success: true,
      message: 'Opportunity deleted successfully'
    })
  } catch (error) {
    console.error('Delete opportunity error:', error)
    res.status(500).json({ message: 'Failed to delete opportunity', error: error.message })
  }
}

export const getApplicants = async (req, res) => {
  try {
    const { id } = req.params

    const opportunity = await Opportunity.findByPk(id, {
      include: [{
        model: Organization,
        as: 'organization'
      }]
    })

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' })
    }

    if (opportunity.organization.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const applications = await Application.findAll({
      where: { opportunityId: id },
      include: [{
        model: Volunteer,
        as: 'volunteer',
        include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone'] }]
      }]
    })

    const formattedApplicants = applications.map(app => ({
      id: app.id,
      status: app.status,
      appliedAt: app.appliedAt,
      volunteerName: app.volunteer.user.name,
      email: app.volunteer.user.email,
      phone: app.volunteer.user.phone,
      education: app.volunteer.education,
      skills: app.volunteer.skills,
      opportunityTitle: opportunity.title
    }))

    res.json({
      success: true,
      data: formattedApplicants
    })
  } catch (error) {
    console.error('Get applicants error:', error)
    res.status(500).json({ message: 'Failed to get applicants', error: error.message })
  }
}
