import { Router } from 'express'
import authRouter from './auth.js'
import employeesRouter from './employees.js'

const router = Router()

router.use('/auth', authRouter)
router.use('/employees', employeesRouter)

export default router
