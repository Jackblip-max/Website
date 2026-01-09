import jwt from 'jsonwebtoken'
import { User, AdminLog } from '../models/index.js'

export const requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.id)

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      })
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      })
    }

    req.user = user
    req.adminId = user.id
    next()
  } catch (error) {
    console.error('Admin authorization error:', error)
    return res.status(401).json({ 
      success: false,
      message: 'Invalid or expired token' 
    })
  }
}

// Helper to log admin actions
export const logAdminAction = async (adminId, action, targetType, targetId, details = null, ipAddress = null) => {
  try {
    await AdminLog.create({
      adminId,
      action,
      targetType,
      targetId,
      details,
      ipAddress
    })
  } catch (error) {
    console.error('Failed to log admin action:', error)
  }
}
