import express from 'express'
import { adminAuth } from '../middleware/adminAuth.js'
import {
  adminLogin,  // ⭐ NEW
  getDashboardStats,
  getPendingOrganizations,
  getAllOrganizations,
  approveOrganization,
  rejectOrganization,
  deleteOrganization,  // ⭐ NEW
  getAllUsers,
  deleteUser,
  getAdminLogs
} from '../controllers/adminController.js'

const router = express.Router()

// ⭐ Public route - no auth needed
router.post('/login', adminLogin)

// ⭐ Protected routes - need admin auth
router.get('/stats', adminAuth, getDashboardStats)
router.get('/organizations/pending', adminAuth, getPendingOrganizations)
router.get('/organizations', adminAuth, getAllOrganizations)
router.post('/organizations/:id/approve', adminAuth, approveOrganization)
router.post('/organizations/:id/reject', adminAuth, rejectOrganization)
router.delete('/organizations/:id', adminAuth, deleteOrganization)  // ⭐ NEW
router.get('/users', adminAuth, getAllUsers)
router.delete('/users/:id', adminAuth, deleteUser)
router.get('/logs', adminAuth, getAdminLogs)

export default router
