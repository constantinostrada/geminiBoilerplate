import { Router } from 'express'
import authRouter from './auth.js'
import vacationsRouter from './vacations.js'
import { authenticate } from '../middleware/authenticate.js'

const router = Router()

// Public routes
router.use('/auth', authRouter)

// Protected routes
router.use('/vacations', authenticate, vacationsRouter)

export default router
