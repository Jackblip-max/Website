import express from 'express'
import {
  getDashboardStats,
  getPendingOrganizations,
  getAllOrganizations,
  approveOrganization,
  rejectOrganization,
  getAllUsers,
  deleteUser,
  getAdminLogs
} from '../controllers/adminController.js'
import { requireAdmin } from '../middleware/adminAuth.js'

const router = express.Router()

// All routes require admin authentication
router.use(requireAdmin)

// Dashboard stats
router.get('/stats', getDashboardStats)

// Organization management
router.get('/organizations/pending', getPendingOrganizations)
router.get('/organizations', getAllOrganizations)
router.put('/organizations/:id/approve', approveOrganization)
router.put('/organizations/:id/reject', rejectOrganization)

// User management
router.get('/users', getAllUsers)
router.delete('/users/:id', deleteUser)

// Activity logs
router.get('/logs', getAdminLogs)

export default router
