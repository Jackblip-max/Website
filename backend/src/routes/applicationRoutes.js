import express from 'express'
import { 
  createApplication, 
  getMyApplications, 
  acceptApplication, 
  declineApplication,
  deleteApplication
} from '../controllers/applicationController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.post('/', authenticate, createApplication)
router.get('/', authenticate, getMyApplications)
router.put('/:id/accept', authenticate, acceptApplication)
router.put('/:id/decline', authenticate, declineApplication)
router.delete('/:id', authenticate, deleteApplication)

export default router