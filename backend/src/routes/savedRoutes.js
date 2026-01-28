import express from 'express'
import { SavedOpportunity, Opportunity, Organization, Volunteer, User } from '../models/index.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Get saved opportunities
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('📚 ========== GET SAVED OPPORTUNITIES ==========')
    console.log('📚 User ID:', req.user.id)
    console.log('📚 User Email:', req.user.email)

    // User MUST have volunteer profile from registration
    const volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    
    if (!volunteer) {
      console.log('❌ No volunteer profile found for user:', req.user.id)
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'No volunteer profile found. Please complete your registration.'
      })
    }

    console.log('✅ Found volunteer profile - Volunteer ID:', volunteer.id)

    // Fetch saved opportunities with full details
    const savedOpportunities = await SavedOpportunity.findAll({
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

    console.log('📦 Database query completed')
    console.log('📦 Found saved opportunities count:', savedOpportunities.length)
    
    if (savedOpportunities.length > 0) {
      console.log('📦 Saved opportunity IDs:', savedOpportunities.map(s => ({
        savedId: s.id,
        opportunityId: s.opportunityId,
        title: s.opportunity?.title
      })))
    } else {
      console.log('📦 No saved opportunities in database for volunteer:', volunteer.id)
    }

    // Transform data to include organization details at the top level
    const formattedData = savedOpportunities.map(saved => {
      const opp = saved.opportunity
      
      if (!opp) {
        console.warn('⚠️ SavedOpportunity has no opportunity data:', saved.id)
        return null
      }
      
      return {
        id: opp.id,  // This is the OPPORTUNITY ID, not the saved_opportunity ID
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
    }).filter(Boolean) // Remove any null entries

    console.log('📤 Sending response with', formattedData.length, 'opportunities')
    console.log('📚 ========== END GET SAVED OPPORTUNITIES ==========\n')

    res.json({
      success: true,
      data: formattedData,
      count: formattedData.length
    })
  } catch (error) {
    console.error('❌ Get saved opportunities error:', error)
    console.error('Error stack:', error.stack)
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

    console.log('💾 ========== SAVE OPPORTUNITY ==========')
    console.log('💾 User ID:', req.user.id)
    console.log('💾 Opportunity ID:', opportunityId)

    // User MUST have volunteer profile from registration
    const volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    
    if (!volunteer) {
      console.log('❌ No volunteer profile found')
      return res.status(400).json({ 
        success: false,
        message: 'Volunteer profile not found. Please complete your profile.' 
      })
    }

    console.log('✅ Volunteer profile found - Volunteer ID:', volunteer.id)

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
    console.log('📋 Opportunity Organization ID:', opportunity.organizationId)
    console.log('📋 Opportunity Organization User ID:', opportunity.organization?.userId)

    // ⭐ CRITICAL FIX: Check if user owns the organization that posted this opportunity
    const userOrganization = await Organization.findOne({
      where: { userId: req.user.id }
    })

    if (userOrganization) {
      console.log('🏢 User has organization:', userOrganization.name, '(id:', userOrganization.id, ')')
      
      // Check if this opportunity belongs to the user's organization
      if (opportunity.organizationId === userOrganization.id) {
        console.log('❌ BLOCKED: User trying to save their own organization\'s opportunity')
        return res.status(403).json({ 
          success: false,
          message: 'You cannot save opportunities from your own organization' 
        })
      }
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
      console.log('⚠️ Already saved - SavedOpportunity ID:', existingSave.id)
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
    console.log('📦 Created SavedOpportunity ID:', saved.id)
    console.log('💾 ========== END SAVE OPPORTUNITY ==========\n')

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

    console.log('🗑️ ========== UNSAVE OPPORTUNITY ==========')
    console.log('🗑️ User ID:', req.user.id)
    console.log('🗑️ Opportunity ID to unsave:', opportunityId)

    // Find volunteer profile
    const volunteer = await Volunteer.findOne({ where: { userId: req.user.id } })
    
    if (!volunteer) {
      console.log('❌ Volunteer profile not found')
      return res.status(400).json({ 
        success: false,
        message: 'Volunteer profile not found' 
      })
    }

    console.log('✅ Volunteer profile found - Volunteer ID:', volunteer.id)

    // Find saved opportunity
    const saved = await SavedOpportunity.findOne({
      where: { 
        opportunityId, 
        volunteerId: volunteer.id 
      }
    })

    if (!saved) {
      console.log('❌ SavedOpportunity NOT FOUND in database')
      console.log('❌ Looking for: opportunityId =', opportunityId, ', volunteerId =', volunteer.id)
      
      // Check if this opportunity exists at all for this volunteer
      const allSaved = await SavedOpportunity.findAll({
        where: { volunteerId: volunteer.id }
      })
      console.log('📊 All saved opportunities for this volunteer:', allSaved.map(s => ({
        id: s.id,
        opportunityId: s.opportunityId
      })))
      
      return res.status(404).json({ 
        success: false,
        message: 'Saved opportunity not found' 
      })
    }

    console.log('✅ Found SavedOpportunity ID:', saved.id)

    // Delete saved opportunity
    await saved.destroy()

    console.log('✅ Opportunity unsaved successfully')
    console.log('🗑️ ========== END UNSAVE OPPORTUNITY ==========\n')

    res.json({
      success: true,
      message: 'Opportunity removed from saved list'
    })
  } catch (error) {
    console.error('❌ Unsave opportunity error:', error)
    console.error('Error stack:', error.stack)
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
