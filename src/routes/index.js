import { Router } from 'express'
import authRouter from './auth.js'
import vacationsRouter from './vacations.js'
import equipmentRouter from './equipment.js'
import { authenticate } from '../middleware/authenticate.js'

const router = Router()

router.use('/auth', authRouter)
router.use('/vacations', authenticate, vacationsRouter)
router.use('/equipment', authenticate, equipmentRouter)

export default router
