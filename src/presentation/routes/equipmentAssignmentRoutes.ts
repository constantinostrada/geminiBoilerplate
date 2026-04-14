import { Router, Request, Response, NextFunction } from 'express'
import { EquipmentAssignmentRepository } from '../../infrastructure/repositories/EquipmentAssignmentRepository'
import { EquipmentRepository } from '../../infrastructure/repositories/EquipmentRepository'
import { CreateEquipmentAssignmentUseCase } from '../../application/use-cases/equipmentAssignment/CreateEquipmentAssignmentUseCase'

const router = Router()
const assignmentRepository = new EquipmentAssignmentRepository()
const equipmentRepository = new EquipmentRepository()

// GET /api/equipment-assignments
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const assignments = await assignmentRepository.findAll()
    res.json({ success: true, data: assignments })
  } catch (err) {
    next(err)
  }
})

// GET /api/equipment-assignments/employee/:employeeId
router.get(
  '/employee/:employeeId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assignments = await assignmentRepository.findByEmployeeId(
        req.params.employeeId as string
      )
      res.json({ success: true, data: assignments })
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/equipment-assignments
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const useCase = new CreateEquipmentAssignmentUseCase(
      assignmentRepository,
      equipmentRepository
    )
    const assignment = await useCase.execute(req.body)
    res.status(201).json({ success: true, data: assignment })
  } catch (err) {
    next(err)
  }
})

export default router
