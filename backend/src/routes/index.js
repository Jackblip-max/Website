import express from 'express'
import authRoutes from './authRoutes.js'
import opportunityRoutes from './opportunityRoutes.js'
import organizationRoutes from './organizationRoutes.js'
import applicationRoutes from './applicationRoutes.js'
import savedRoutes from './savedRoutes.js'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/opportunities', opportunityRoutes)
router.use('/organizations', organizationRoutes)
router.use('/applications', applicationRoutes)
router.use('/saved', savedRoutes)

export default router