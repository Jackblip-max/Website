import express from 'express'
import { SavedOpportunity, Opportunity, Organization, Volunteer, User } from '../models/index.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Get saved opportunities
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('📚 Fetching saved opportunities for user:', req.user.id)
    
    // User MUST have volunteer profile from registration
    const volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    
    if (!volunteer) {
      console.log('❌ No volunteer profile found for user:', req.user.id)
      return res.status(400).json({ 
        success: false,
        message: 'Volunteer profile not found. Please complete your profile.' 
      })
    }

    console.log('✅ Found volunteer:', volunteer.id)

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

    console.log('💾 Save request - User:', req.user.id, 'Opportunity:', opportunityId)

    // User MUST have volunteer profile from registration
    const volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    
    if (!volunteer) {
      console.log('❌ No volunteer profile found')
      return res.status(400).json({ 
        success: false,
        message: 'Volunteer profile not found. Please complete your profile.' 
      })
    }

    console.log('✅ Volunteer profile found:', volunteer.id)

    // Check if opportunity exists and get its organization
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
    console.log('📋 Opportunity belongs to org:', opportunity.organization?.name, '(orgId:', opportunity.organizationId, ')')

    // CRITICAL: Check if user owns an organization
    const userOrganization = await Organization.findOne({
      where: { userId: req.user.id }
    })

    if (userOrganization) {
      console.log('🏢 User has organization:', userOrganization.name, '(id:', userOrganization.id, ')')
    } else {
      console.log('👤 User has NO organization')
    }

    // ONLY prevent saving if:
    // 1. User HAS an organization (userOrganization exists)
    // AND
    // 2. The opportunity belongs to THEIR organization
    if (userOrganization && opportunity.organizationId === userOrganization.id) {
      console.log('❌ BLOCKED: User trying to save their own organization\'s opportunity')
      return res.status(400).json({ 
        success: false,
        message: 'You cannot save opportunities from your own organization' 
      })
    }

    console.log('✅ Ownership check passed - user can save this opportunity')

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

    console.log('✅ Opportunity saved successfully - SavedOpportunity ID:', saved.id)

    res.status(201).json({
      success: true,
      message: 'Opportunity saved successfully',
      data: saved
    })
  } catch (error) {
    console.error('❌ Save opportunity error:', error)
    console.error('Error stack:', error.stack)
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
      return res.status(400).json({ 
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

    const volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    
    if (!volunteer) {
      return res.json({
        success: true,
        isSaved: false
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
