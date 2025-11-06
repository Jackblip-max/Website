import { Application, Volunteer, Opportunity, Organization, User } from '../models/index.js'

export const createApplication = async (req, res) => {
  try {
    const { opportunityId } = req.body

    const volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    if (!volunteer) {
      return res.status(403).json({ message: 'Only volunteers can apply' })
    }

    // Check if opportunity exists and is active
    const opportunity = await Opportunity.findByPk(opportunityId)
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' })
    }
    if (opportunity.status !== 'active') {
      return res.status(400).json({ message: 'This opportunity is no longer active' })
    }

    // Check if already applied
    const existing = await Application.findOne({
      where: { opportunityId, volunteerId: volunteer.id }
    })
    if (existing) {
      return res.status(400).json({ message: 'Already applied to this opportunity' })
    }

    const application = await Application.create({
      opportunityId,
      volunteerId: volunteer.id
    })

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    })
  } catch (error) {
    console.error('Create application error:', error)
    res.status(500).json({ message: 'Failed to submit application', error: error.message })
  }
}

export const getMyApplications = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    if (!volunteer) {
      return res.status(403).json({ message: 'Volunteer profile not found' })
    }

    const applications = await Application.findAll({
      where: { volunteerId: volunteer.id },
      include: [{
        model: Opportunity,
        as: 'opportunity',
        include: [{
          model: Organization,
          as: 'organization',
          attributes: ['name', 'logo']
        }]
      }],
      order: [['createdAt', 'DESC']]
    })

    res.json({
      success: true,
      data: applications
    })
  } catch (error) {
    console.error('Get applications error:', error)
    res.status(500).json({ message: 'Failed to get applications', error: error.message })
  }
}

export const acceptApplication = async (req, res) => {
  try {
    const { id } = req.params

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
      return res.status(404).json({ message: 'Application not found' })
    }

    // Check if user owns the organization
    if (application.opportunity.organization.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await application.update({ status: 'accepted' })

    res.json({
      success: true,
      message: 'Application accepted successfully'
    })
  } catch (error) {
    console.error('Accept application error:', error)
    res.status(500).json({ message: 'Failed to accept application', error: error.message })
  }
}

export const declineApplication = async (req, res) => {
  try {
    const { id } = req.params

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
      return res.status(404).json({ message: 'Application not found' })
    }

    // Check if user owns the organization
    if (application.opportunity.organization.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await application.update({ status: 'rejected' })

    res.json({
      success: true,
      message: 'Application declined successfully'
    })
  } catch (error) {
    console.error('Decline application error:', error)
    res.status(500).json({ message: 'Failed to decline application', error: error.message })
  }
}

export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params

    const volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    if (!volunteer) {
      return res.status(403).json({ message: 'Volunteer profile not found' })
    }

    const application = await Application.findOne({
      where: { id, volunteerId: volunteer.id }
    })

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    await application.destroy()

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    })
  } catch (error) {
    console.error('Delete application error:', error)
    res.status(500).json({ message: 'Failed to withdraw application', error: error.message })
  }
}