import express from 'express'
import { requireAdmin } from '../middleware/adminAuth.js'  // ✅ CORRECT NAME
import {
  adminLogin,
  getDashboardStats,
  getPendingOrganizations,
  getAllOrganizations,
  approveOrganization,
  rejectOrganization,
  deleteOrganization,
  getAllUsers,
  deleteUser,
  getAdminLogs
} from '../controllers/adminController.js'

const router = express.Router()

// ⭐ Public route - no auth needed
router.post('/login', adminLogin)

// ⭐ Protected routes - need admin auth
router.get('/stats', requireAdmin, getDashboardStats)
router.get('/organizations/pending', requireAdmin, getPendingOrganizations)
router.get('/organizations', requireAdmin, getAllOrganizations)
router.post('/organizations/:id/approve', requireAdmin, approveOrganization)
router.post('/organizations/:id/reject', requireAdmin, rejectOrganization)
router.delete('/organizations/:id', requireAdmin, deleteOrganization)
router.get('/users', requireAdmin, getAllUsers)
router.delete('/users/:id', requireAdmin, deleteUser)
router.get('/logs', requireAdmin, getAdminLogs)

export default router
