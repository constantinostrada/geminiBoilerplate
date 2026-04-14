import { Router, Request, Response, NextFunction } from 'express'
import { EquipmentRepository } from '../../infrastructure/repositories/EquipmentRepository'
import { CreateEquipmentUseCase } from '../../application/use-cases/equipment/CreateEquipmentUseCase'
import {
  GetAllEquipmentUseCase,
  GetEquipmentByIdUseCase,
} from '../../application/use-cases/equipment/GetEquipmentUseCase'

const router = Router()
const equipmentRepository = new EquipmentRepository()

// GET /api/equipment
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const useCase = new GetAllEquipmentUseCase(equipmentRepository)
    const items = await useCase.execute()
    res.json({ success: true, data: items })
  } catch (err) {
    next(err)
  }
})

// GET /api/equipment/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const useCase = new GetEquipmentByIdUseCase(equipmentRepository)
    const item = await useCase.execute(req.params.id as string)
    res.json({ success: true, data: item })
  } catch (err) {
    next(err)
  }
})

// POST /api/equipment
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const useCase = new CreateEquipmentUseCase(equipmentRepository)
    const item = await useCase.execute(req.body)
    res.status(201).json({ success: true, data: item })
  } catch (err) {
    next(err)
  }
})

export default router
