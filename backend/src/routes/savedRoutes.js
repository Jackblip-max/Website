import express from 'express'
import { SavedOpportunity, Opportunity, Organization, Volunteer, User } from '../models/index.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Get saved opportunities
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('📚 Fetching saved opportunities for user:', req.user.id)
    
    // Find or create volunteer profile (users can be both volunteer AND organization owner)
    let volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    
    if (!volunteer) {
      // Auto-create volunteer profile if it doesn't exist
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

    console.log('✅ Found/Created volunteer:', volunteer.id)

    // Fetch saved opportunities with full details
    const savedOpportunities = await SavedOpportunity.findAll({
      where: { volunteerId: volunteer.id },
      include: [{
        model: Opportunity,
        as: 'opportunity',
        include: [{
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'logo', 'description']
        }],
        attributes: ['id', 'title', 'description', 'category', 'location', 'mode', 'timeCommitment', 'requirements', 'benefits', 'deadline', 'status', 'createdAt']
      }],
      order: [['createdAt', 'DESC']]
    })

    console.log('✅ Found', savedOpportunities.length, 'saved opportunities')

    // Transform data to include organization details at the top level
    const formattedData = savedOpportunities.map(saved => {
      const opp = saved.opportunity
      return {
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
        status: opp.status,
        organizationName: opp.organization?.name || 'Unknown Organization',
        organizationLogo: opp.organization?.logo || null,
        organizationId: opp.organization?.id || null,
        savedAt: saved.createdAt,
        isSaved: true
      }
    })

    res.json({
      success: true,
      data: formattedData,
      count: formattedData.length
    })
  } catch (error) {
    console.error('❌ Get saved opportunities error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to get saved opportunities', 
      error: error.message 
    })
  }
})

// Save opportunity
router.post('/', authenticate, async (req, res) => {
  try {
    const { opportunityId } = req.body

    if (!opportunityId) {
      return res.status(400).json({ 
        success: false,
        message: 'Opportunity ID is required' 
      })
    }

    console.log('💾 Saving opportunity:', opportunityId, 'for user:', req.user.id)

    // Find or create volunteer profile (users can be both volunteer AND organization owner)
    let volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    
    if (!volunteer) {
      // Auto-create volunteer profile if it doesn't exist
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

    // Check if opportunity exists and get its organization
    const opportunity = await Opportunity.findByPk(opportunityId, {
      include: [{
        model: Organization,
        as: 'organization',
        attributes: ['id', 'userId']
      }]
    })

    if (!opportunity) {
      return res.status(404).json({ 
        success: false,
        message: 'Opportunity not found' 
      })
    }

    // Check if user is trying to save their own organization's opportunity
    if (opportunity.organization && opportunity.organization.userId === req.user.id) {
      return res.status(400).json({ 
        success: false,
        message: 'You cannot save opportunities from your own organization' 
      })
    }

    // Check if already saved
    const existingSave = await SavedOpportunity.findOne({
      where: { 
        opportunityId, 
        volunteerId: volunteer.id 
      }
    })

    if (existingSave) {
      console.log('⚠️ Already saved')
      return res.status(400).json({ 
        success: false,
        message: 'Opportunity already saved' 
      })
    }

    // Create saved opportunity
    const saved = await SavedOpportunity.create({
      opportunityId,
      volunteerId: volunteer.id
    })

    console.log('✅ Opportunity saved successfully')

    res.status(201).json({
      success: true,
      message: 'Opportunity saved successfully',
      data: saved
    })
  } catch (error) {
    console.error('❌ Save opportunity error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to save opportunity', 
      error: error.message 
    })
  }
})

// Unsave opportunity
router.delete('/:opportunityId', authenticate, async (req, res) => {
  try {
    const { opportunityId } = req.params

    console.log('🗑️ Unsaving opportunity:', opportunityId, 'for user:', req.user.id)

    // Find volunteer profile
    const volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    
    if (!volunteer) {
      console.log('❌ Volunteer profile not found')
      return res.status(404).json({ 
        success: false,
        message: 'Volunteer profile not found' 
      })
    }

    // Find saved opportunity
    const saved = await SavedOpportunity.findOne({
      where: { 
        opportunityId, 
        volunteerId: volunteer.id 
      }
    })

    if (!saved) {
      console.log('❌ Saved opportunity not found')
      return res.status(404).json({ 
        success: false,
        message: 'Saved opportunity not found' 
      })
    }

    // Delete saved opportunity
    await saved.destroy()

    console.log('✅ Opportunity unsaved successfully')

    res.json({
      success: true,
      message: 'Opportunity removed from saved list'
    })
  } catch (error) {
    console.error('❌ Unsave opportunity error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to unsave opportunity', 
      error: error.message 
    })
  }
})

// Check if opportunity is saved
router.get('/check/:opportunityId', authenticate, async (req, res) => {
  try {
    const { opportunityId } = req.params

    // Find or create volunteer profile
    let volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    
    if (!volunteer) {
      // Auto-create volunteer profile
      volunteer = await Volunteer.create({
        userId: req.user.id,
        education: 'undergraduate',
        skills: '',
        preferredCategories: [],
        preferredModes: [],
        notificationsEnabled: true
      })
    }

    const saved = await SavedOpportunity.findOne({
      where: { 
        opportunityId, 
        volunteerId: volunteer.id 
      }
    })

    res.json({
      success: true,
      isSaved: !!saved
    })
  } catch (error) {
    console.error('Check saved error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to check saved status', 
      error: error.message 
    })
  }
})

export default router
