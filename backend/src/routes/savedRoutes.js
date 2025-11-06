import express from 'express'
import { SavedOpportunity, Opportunity, Organization, Volunteer } from '../models/index.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Get saved opportunities
router.get('/', authenticate, async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    if (!volunteer) {
      return res.status(403).json({ message: 'Volunteer profile not found' })
    }

    const saved = await SavedOpportunity.findAll({
      where: { volunteerId: volunteer.id },
      include: [{
        model: Opportunity,
        as: 'opportunity',
        include: [{
          model: Organization,
          as: 'organization',
          attributes: ['name', 'logo']
        }]
      }]
    })

    res.json({
      success: true,
      data: saved.map(s => s.opportunity)
    })
  } catch (error) {
    console.error('Get saved error:', error)
    res.status(500).json({ message: 'Failed to get saved opportunities', error: error.message })
  }
})

// Save opportunity
router.post('/', authenticate, async (req, res) => {
  try {
    const { opportunityId } = req.body

    const volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    if (!volunteer) {
      return res.status(403).json({ message: 'Volunteer profile not found' })
    }

    // Check if already saved
    const existing = await SavedOpportunity.findOne({
      where: { opportunityId, volunteerId: volunteer.id }
    })

    if (existing) {
      return res.status(400).json({ message: 'Already saved' })
    }

    await SavedOpportunity.create({
      opportunityId,
      volunteerId: volunteer.id
    })

    res.status(201).json({
      success: true,
      message: 'Opportunity saved successfully'
    })
  } catch (error) {
    console.error('Save opportunity error:', error)
    res.status(500).json({ message: 'Failed to save opportunity', error: error.message })
  }
})

// Unsave opportunity
router.delete('/:opportunityId', authenticate, async (req, res) => {
  try {
    const { opportunityId } = req.params

    const volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    if (!volunteer) {
      return res.status(403).json({ message: 'Volunteer profile not found' })
    }

    const saved = await SavedOpportunity.findOne({
      where: { opportunityId, volunteerId: volunteer.id }
    })

    if (!saved) {
      return res.status(404).json({ message: 'Saved opportunity not found' })
    }

    await saved.destroy()

    res.json({
      success: true,
      message: 'Opportunity unsaved successfully'
    })
  } catch (error) {
    console.error('Unsave opportunity error:', error)
    res.status(500).json({ message: 'Failed to unsave opportunity', error: error.message })
  }
})

export default router