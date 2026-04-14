import { Router } from 'express'
import userRoutes from './userRoutes'
import employeeRoutes from './employeeRoutes'
import vacationRequestRoutes from './vacationRequestRoutes'
import equipmentRoutes from './equipmentRoutes'
import equipmentAssignmentRoutes from './equipmentAssignmentRoutes'

const router = Router()

router.use('/users', userRoutes)
router.use('/employees', employeeRoutes)
router.use('/vacation-requests', vacationRequestRoutes)
router.use('/equipment', equipmentRoutes)
router.use('/equipment-assignments', equipmentAssignmentRoutes)

export default router
