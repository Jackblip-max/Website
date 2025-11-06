import express from 'express'
import { 
  getOpportunities, 
  getOpportunityById, 
  createOpportunity, 
  updateOpportunity, 
  deleteOpportunity,
  getApplicants 
} from '../controllers/opportunityController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getOpportunities)
router.get('/:id', getOpportunityById)
router.post('/', authenticate, createOpportunity)
router.put('/:id', authenticate, updateOpportunity)
router.delete('/:id', authenticate, deleteOpportunity)
router.get('/:id/applicants', authenticate, getApplicants)

export default router