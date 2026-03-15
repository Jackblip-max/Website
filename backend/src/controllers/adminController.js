import { User, Organization, Opportunity, Application, AdminLog } from '../models/index.js'
import { logAdminAction } from '../middleware/adminAuth.js'
import { sendOrganizationApprovalEmail, sendOrganizationRejectionEmail, sendOrganizationDeletionEmail } from '../services/emailService.js'
import { Op } from 'sequelize'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// ── Helper: safe log — never crashes the calling action ──────────────
const safeLog = async (adminId, action, targetType, targetId, details, ip) => {
  try {
    await logAdminAction(adminId, action, targetType, targetId, details, ip)
  } catch (logError) {
    console.error(`⚠️ Admin log failed (action still completed): ${action}`, logError.message)
  }
}

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    console.log('\n🔐 ===== ADMIN LOGIN ATTEMPT =====')
    console.log('📧 Email:', email)

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    const admin = await User.findOne({
      where: { email: email.trim().toLowerCase(), role: 'admin' }
    })

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const isValidPassword = await bcrypt.compare(password, admin.password)
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    console.log('✅ ADMIN LOGIN SUCCESSFUL!')

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isVerified: admin.isVerified
      }
    })
  } catch (error) {
    console.error('❌ Admin login error:', error)
    res.status(500).json({ success: false, message: 'Login failed', error: error.message })
  }
}

// Get admin dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalOrganizations,
      pendingOrganizations,
      approvedOrganizations,
      totalOpportunities,
      totalApplications
    ] = await Promise.all([
      User.count({ where: { role: { [Op.ne]: 'admin' } } }),
      Organization.count(),
      Organization.count({ where: { verificationStatus: 'pending' } }),
      Organization.count({ where: { verificationStatus: 'approved' } }),
      Opportunity.count(),
      Application.count()
    ])

    res.json({
      success: true,
      totalUsers,
      totalOrganizations,
      pendingOrganizations,
      approvedOrganizations,
      totalOpportunities,
      totalApplications
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    res.status(500).json({ success: false, message: 'Failed to get dashboard stats', error: error.message })
  }
}

// Get pending organizations
export const getPendingOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.findAll({
      where: { verificationStatus: 'pending' },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone', 'createdAt']
      }],
      order: [['createdAt', 'ASC']]
    })

    res.json(organizations)
  } catch (error) {
    console.error('Get pending organizations error:', error)
    res.status(500).json({ success: false, message: 'Failed to get pending organizations', error: error.message })
  }
}

// Get all organizations with filters
export const getAllOrganizations = async (req, res) => {
  try {
    const { status } = req.query
    const where = {}

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      where.verificationStatus = status
    }

    const organizations = await Organization.findAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone', 'createdAt']
      }],
      order: [['createdAt', 'DESC']]
    })

    res.json({ success: true, data: organizations })
  } catch (error) {
    console.error('Get all organizations error:', error)
    res.status(500).json({ success: false, message: 'Failed to get organizations', error: error.message })
  }
}

// Approve organization
export const approveOrganization = async (req, res) => {
  try {
    const { id } = req.params
    const { message } = req.body

    const organization = await Organization.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    })

    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' })
    }

    await organization.update({
      verificationStatus: 'approved',
      isVerified: true,
      verifiedAt: new Date(),
      verifiedBy: req.adminId,
      verificationReason: message || 'Organization verified and approved'
    })

    // ✅ Safe — logging failure will never crash the approval
    await safeLog(req.adminId, 'APPROVE_ORGANIZATION', 'organization', organization.id,
      { organizationName: organization.name, message }, req.ip)

    try {
      await sendOrganizationApprovalEmail(organization.user.email, organization.user.name, organization.name)
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError)
    }

    res.json({ success: true, message: 'Organization approved successfully', data: organization })
  } catch (error) {
    console.error('Approve organization error:', error)
    res.status(500).json({ success: false, message: 'Failed to approve organization', error: error.message })
  }
}

// Reject organization
export const rejectOrganization = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required (minimum 10 characters)' })
    }

    const organization = await Organization.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    })

    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' })
    }

    await organization.update({
      verificationStatus: 'rejected',
      isVerified: false,
      verifiedAt: new Date(),
      verifiedBy: req.adminId,
      verificationReason: reason
    })

    // ✅ Safe — logging failure will never crash the rejection
    await safeLog(req.adminId, 'REJECT_ORGANIZATION', 'organization', organization.id,
      { organizationName: organization.name, reason }, req.ip)

    try {
      await sendOrganizationRejectionEmail(organization.user.email, organization.user.name, organization.name, reason)
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError)
    }

    res.json({ success: true, message: 'Organization rejected', data: organization })
  } catch (error) {
    console.error('Reject organization error:', error)
    res.status(500).json({ success: false, message: 'Failed to reject organization', error: error.message })
  }
}

// Delete organization (keep user account intact)
export const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Deletion reason is required (minimum 10 characters)' })
    }

    const organization = await Organization.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    })

    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' })
    }

    const orgName = organization.name
    const userName = organization.user?.name
    const userEmail = organization.user?.email

    // ✅ Log BEFORE destroy so we still have the org id
    await safeLog(req.adminId, 'DELETE_ORGANIZATION', 'organization', organization.id,
      { organizationName: orgName, userName, userId: organization.userId, reason }, req.ip)

    await organization.destroy()

    try {
      await sendOrganizationDeletionEmail(userEmail, userName, orgName, reason)
    } catch (emailError) {
      console.error('Failed to send deletion email:', emailError)
    }

    res.json({ success: true, message: 'Organization deleted successfully. User account remains active and can still volunteer.' })
  } catch (error) {
    console.error('❌ Delete organization error:', error)
    res.status(500).json({ success: false, message: 'Failed to delete organization', error: error.message })
  }
}

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query
    const where = {}

    if (role && ['volunteer', 'organization', 'admin'].includes(role)) {
      where.role = role
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ]
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      include: [{
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name', 'verificationStatus', 'isVerified']
      }],
      order: [['createdAt', 'DESC']]
    })

    res.json(users)
  } catch (error) {
    console.error('Get all users error:', error)
    res.status(500).json({ success: false, message: 'Failed to get users', error: error.message })
  }
}

// Delete user (cascade deletes their organization too)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    if (parseInt(id) === req.adminId) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own admin account' })
    }

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Organization, as: 'organization' }]
    })

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin users' })
    }

    // ✅ Log BEFORE destroy so we still have the user id
    await safeLog(req.adminId, 'DELETE_USER', 'user', user.id,
      { userName: user.name, userEmail: user.email, hadOrganization: !!user.organization,
        organizationName: user.organization?.name, reason }, req.ip)

    if (user.organization) {
      try {
        await sendOrganizationDeletionEmail(user.email, user.name, user.organization.name,
          reason || 'Your account has been removed by administrator')
      } catch (emailError) {
        console.error('Failed to send organization deletion email:', emailError)
      }
      await user.organization.destroy()
    }

    await user.destroy()

    res.json({
      success: true,
      message: 'User deleted successfully' + (user.organization ? ' (including their organization)' : '')
    })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message })
  }
}

// Get admin activity logs
export const getAdminLogs = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query
    const offset = (page - 1) * limit

    const { rows: logs, count } = await AdminLog.findAndCountAll({
      include: [{ model: User, as: 'admin', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

    res.json({
      success: true,
      data: logs,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) }
    })
  } catch (error) {
    console.error('Get admin logs error:', error)
    res.status(500).json({ success: false, message: 'Failed to get admin logs', error: error.message })
  }
}
