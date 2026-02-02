import Application from '../models/Application.js';
import Volunteer from '../models/Volunteer.js';
import Opportunity from '../models/Opportunity.js';
import Organization from '../models/Organization.js';
import User from '../models/User.js';

// POST /api/applications - Create a new application
export const createApplication = async (req, res) => {
  try {
    const { opportunityId, coverLetter } = req.body;
    console.log('📝 ========== CREATE APPLICATION ==========');
    console.log('📝 User ID:', req.user.id);
    console.log('📝 Opportunity ID:', opportunityId);

    // Validation
    if (!opportunityId) {
      return res.status(400).json({ message: 'Opportunity ID is required' });
    }

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
          as: 'organization'
        }
      ]
    });

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // Check if opportunity is active
    if (opportunity.status !== 'active') {
      return res.status(400).json({ 
        message: 'This opportunity is no longer accepting applications' 
      });
    }

    // 🔥 CRITICAL CHECK: Users cannot apply to their own organization's opportunities
    const userOrganization = await Organization.findOne({
      where: { userId: req.user.id }
    });

    if (userOrganization && opportunity.organizationId === userOrganization.id) {
      console.log('❌ User trying to apply to their own organization opportunity');
      return res.status(403).json({ 
        message: 'You cannot apply to opportunities from your own organization' 
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      where: {
        volunteerId: volunteer.id,
        opportunityId: opportunityId
      }
    });

    if (existingApplication) {
      return res.status(400).json({ 
        message: 'You have already applied to this opportunity' 
      });
    }

    // Create application
    const application = await Application.create({
      volunteerId: volunteer.id,
      opportunityId: opportunityId,
      coverLetter: coverLetter || '',
      status: 'pending'
    });

    console.log('✅ Application created successfully');

    // Fetch complete application with includes
    const completeApplication = await Application.findByPk(application.id, {
      include: [
        {
          model: Volunteer,
          as: 'volunteer',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone']
            }
          ]
        },
        {
          model: Opportunity,
          as: 'opportunity',
          include: [
            {
              model: Organization,
              as: 'organization'
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: completeApplication
    });

  } catch (error) {
    console.error('❌ Create application error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to submit application',
      error: error.message 
    });
  }
};

// GET /api/applications - Get all applications for the current user
export const getMyApplications = async (req, res) => {
  try {
    console.log('📋 ========== GET USER APPLICATIONS ==========');
    console.log('📋 User ID:', req.user.id);

    // Check if user is requesting as volunteer or organization
    const volunteer = await Volunteer.findOne({
      where: { userId: req.user.id }
    });

    const organization = await Organization.findOne({
      where: { userId: req.user.id }
    });

    let applications = [];

    if (volunteer) {
      // Get applications submitted BY this volunteer
      applications = await Application.findAll({
        where: { volunteerId: volunteer.id },
        include: [
          {
            model: Opportunity,
            as: 'opportunity',
            include: [
              {
                model: Organization,
                as: 'organization'
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      console.log('✅ Found', applications.length, 'applications as volunteer');
    } else if (organization) {
      // Get applications TO this organization's opportunities
      const opportunities = await Opportunity.findAll({
        where: { organizationId: organization.id },
        attributes: ['id']
      });

      const opportunityIds = opportunities.map(opp => opp.id);

      applications = await Application.findAll({
        where: { opportunityId: opportunityIds },
        include: [
          {
            model: Volunteer,
            as: 'volunteer',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'phone']
              }
            ]
          },
          {
            model: Opportunity,
            as: 'opportunity',
            include: [
              {
                model: Organization,
                as: 'organization'
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      console.log('✅ Found', applications.length, 'applications for organization');
    }

    res.json({
      success: true,
      data: applications
    });

  } catch (error) {
    console.error('❌ Get applications error:', error.message);
    res.status(500).json({ 
      message: 'Failed to fetch applications',
      error: error.message 
    });
  }
};

// PUT /api/applications/:id/accept - Accept an application (Organization only)
export const acceptApplication = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('✅ ========== ACCEPT APPLICATION ==========');
    console.log('✅ User ID:', req.user.id);
    console.log('✅ Application ID:', id);

    // Find organization
    const organization = await Organization.findOne({
      where: { userId: req.user.id }
    });

    if (!organization) {
      return res.status(403).json({ 
        message: 'Only organizations can accept applications' 
      });
    }

    // Find application
    const application = await Application.findByPk(id, {
      include: [
        {
          model: Opportunity,
          as: 'opportunity'
        },
        {
          model: Volunteer,
          as: 'volunteer',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone']
            }
          ]
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify the application is for this organization's opportunity
    if (application.opportunity.organizationId !== organization.id) {
      return res.status(403).json({ 
        message: 'You can only accept applications for your own opportunities' 
      });
    }

    // Update application status
    application.status = 'accepted';
    await application.save();

    console.log('✅ Application accepted successfully');

    res.json({
      success: true,
      message: 'Application accepted successfully',
      data: application
    });

  } catch (error) {
    console.error('❌ Accept application error:', error.message);
    res.status(500).json({ 
      message: 'Failed to accept application',
      error: error.message 
    });
  }
};

// PUT /api/applications/:id/decline - Decline an application (Organization only)
export const declineApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    console.log('❌ ========== DECLINE APPLICATION ==========');
    console.log('❌ User ID:', req.user.id);
    console.log('❌ Application ID:', id);

    // Find organization
    const organization = await Organization.findOne({
      where: { userId: req.user.id }
    });

    if (!organization) {
      return res.status(403).json({ 
        message: 'Only organizations can decline applications' 
      });
    }

    // Find application
    const application = await Application.findByPk(id, {
      include: [
        {
          model: Opportunity,
          as: 'opportunity'
        },
        {
          model: Volunteer,
          as: 'volunteer',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone']
            }
          ]
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify the application is for this organization's opportunity
    if (application.opportunity.organizationId !== organization.id) {
      return res.status(403).json({ 
        message: 'You can only decline applications for your own opportunities' 
      });
    }

    // Update application status
    application.status = 'rejected';
    if (reason) {
      application.rejectionReason = reason;
    }
    await application.save();

    console.log('✅ Application declined successfully');

    res.json({
      success: true,
      message: 'Application declined successfully',
      data: application
    });

  } catch (error) {
    console.error('❌ Decline application error:', error.message);
    res.status(500).json({ 
      message: 'Failed to decline application',
      error: error.message 
    });
  }
};

// DELETE /api/applications/:id - Delete/withdraw an application
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ ========== DELETE APPLICATION ==========');
    console.log('🗑️ User ID:', req.user.id);
    console.log('🗑️ Application ID:', id);

    // Find volunteer profile
    const volunteer = await Volunteer.findOne({
      where: { userId: req.user.id }
    });

    if (!volunteer) {
      return res.status(403).json({ 
        message: 'Only volunteers can delete their applications' 
      });
    }

    // Find application
    const application = await Application.findOne({
      where: {
        id: id,
        volunteerId: volunteer.id
      }
    });

    if (!application) {
      return res.status(404).json({ 
        message: 'Application not found' 
      });
    }

    // Only allow deletion of pending applications
    if (application.status !== 'pending') {
      return res.status(400).json({ 
        message: `Cannot withdraw application with status: ${application.status}` 
      });
    }

    await application.destroy();

    console.log('✅ Application deleted successfully');

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });

  } catch (error) {
    console.error('❌ Delete application error:', error.message);
    res.status(500).json({ 
      message: 'Failed to delete application',
      error: error.message 
    });
  }
};
