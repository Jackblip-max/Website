import express from 'express';
import { authenticate } from '../middleware/auth.js';
import SavedOpportunity from '../models/SavedOpportunity.js';
import Volunteer from '../models/Volunteer.js';
import Opportunity from '../models/Opportunity.js';
import Organization from '../models/Organization.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/saved - Get all saved opportunities for the current user
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('📚 ========== GET SAVED OPPORTUNITIES ==========');
    console.log('📚 User ID:', req.user.id);
    console.log('📚 User Email:', req.user.email);

    // Find volunteer profile
    const volunteer = await Volunteer.findOne({
      where: { userId: req.user.id }
    });

    if (!volunteer) {
      console.log('❌ No volunteer profile found');
      return res.status(404).json({ 
        message: 'Volunteer profile not found. Please complete your profile first.' 
      });
    }

    console.log('✅ Found volunteer profile - Volunteer ID:', volunteer.id);

    // Get all saved opportunities with proper includes
    const savedOpportunities = await SavedOpportunity.findAll({
      where: { volunteerId: volunteer.id },
      include: [
        {
          model: Opportunity,
          as: 'opportunity',
          include: [
            {
              model: Organization,
              as: 'organization',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'name', 'email']
                }
              ]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log('✅ Found', savedOpportunities.length, 'saved opportunities');

    res.json({
      success: true,
      data: savedOpportunities
    });

  } catch (error) {
    console.error('❌ Get saved opportunities error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to fetch saved opportunities',
      error: error.message 
    });
  }
});

// POST /api/saved/:opportunityId - Save an opportunity
router.post('/:opportunityId', authenticate, async (req, res) => {
  try {
    const { opportunityId } = req.params;
    console.log('💾 ========== SAVE OPPORTUNITY ==========');
    console.log('💾 User ID:', req.user.id);
    console.log('💾 Opportunity ID:', opportunityId);

    // Find volunteer profile
    const volunteer = await Volunteer.findOne({
      where: { userId: req.user.id }
    });

    if (!volunteer) {
      return res.status(404).json({ 
        message: 'Volunteer profile not found. Please complete your profile first.' 
      });
    }

    // Check if opportunity exists
    const opportunity = await Opportunity.findByPk(opportunityId, {
      include: [
        {
          model: Organization,
          as: 'organization',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id']
            }
          ]
        }
      ]
    });

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // 🔥 CRITICAL CHECK: Users cannot save their own organization's opportunities
    const userOrganization = await Organization.findOne({
      where: { userId: req.user.id }
    });

    if (userOrganization && opportunity.organizationId === userOrganization.id) {
      console.log('❌ User trying to save their own organization opportunity');
      return res.status(403).json({ 
        message: 'You cannot save opportunities from your own organization' 
      });
    }

    // Check if already saved
    const existingSave = await SavedOpportunity.findOne({
      where: {
        volunteerId: volunteer.id,
        opportunityId: opportunityId
      }
    });

    if (existingSave) {
      console.log('⚠️ Opportunity already saved');
      return res.status(400).json({ message: 'Opportunity already saved' });
    }

    // Create saved opportunity
    const savedOpportunity = await SavedOpportunity.create({
      volunteerId: volunteer.id,
      opportunityId: opportunityId
    });

    console.log('✅ Opportunity saved successfully');

    // Fetch the complete saved opportunity with includes
    const completeSavedOpportunity = await SavedOpportunity.findByPk(savedOpportunity.id, {
      include: [
        {
          model: Opportunity,
          as: 'opportunity',
          include: [
            {
              model: Organization,
              as: 'organization',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'name', 'email']
                }
              ]
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Opportunity saved successfully',
      data: completeSavedOpportunity
    });

  } catch (error) {
    console.error('❌ Save opportunity error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to save opportunity',
      error: error.message 
    });
  }
});

// DELETE /api/saved/:opportunityId - Remove saved opportunity
router.delete('/:opportunityId', authenticate, async (req, res) => {
  try {
    const { opportunityId } = req.params;
    console.log('🗑️ ========== REMOVE SAVED OPPORTUNITY ==========');
    console.log('🗑️ User ID:', req.user.id);
    console.log('🗑️ Opportunity ID:', opportunityId);

    // Find volunteer profile
    const volunteer = await Volunteer.findOne({
      where: { userId: req.user.id }
    });

    if (!volunteer) {
      return res.status(404).json({ 
        message: 'Volunteer profile not found' 
      });
    }

    // Find and delete the saved opportunity
    const deleted = await SavedOpportunity.destroy({
      where: {
        volunteerId: volunteer.id,
        opportunityId: opportunityId
      }
    });

    if (deleted === 0) {
      console.log('❌ Saved opportunity not found');
      return res.status(404).json({ message: 'Saved opportunity not found' });
    }

    console.log('✅ Saved opportunity removed successfully');

    res.json({
      success: true,
      message: 'Saved opportunity removed successfully'
    });

  } catch (error) {
    console.error('❌ Remove saved opportunity error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to remove saved opportunity',
      error: error.message 
    });
  }
});

// GET /api/saved/check/:opportunityId - Check if opportunity is saved
router.get('/check/:opportunityId', authenticate, async (req, res) => {
  try {
    const { opportunityId } = req.params;

    // Find volunteer profile
    const volunteer = await Volunteer.findOne({
      where: { userId: req.user.id }
    });

    if (!volunteer) {
      return res.json({ isSaved: false });
    }

    // Check if saved
    const savedOpportunity = await SavedOpportunity.findOne({
      where: {
        volunteerId: volunteer.id,
        opportunityId: opportunityId
      }
    });

    res.json({
      isSaved: !!savedOpportunity
    });

  } catch (error) {
    console.error('❌ Check saved opportunity error:', error.message);
    res.status(500).json({ 
      message: 'Failed to check saved status',
      error: error.message 
    });
  }
});

export default router;
