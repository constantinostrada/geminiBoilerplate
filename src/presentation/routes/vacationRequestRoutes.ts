import { Router, Request, Response, NextFunction } from 'express'
import { VacationRequestRepository } from '../../infrastructure/repositories/VacationRequestRepository'
import { CreateVacationRequestUseCase } from '../../application/use-cases/vacationRequest/CreateVacationRequestUseCase'
import {
  GetAllVacationRequestsUseCase,
  GetVacationRequestsByEmployeeUseCase,
} from '../../application/use-cases/vacationRequest/GetVacationRequestUseCase'

const router = Router()
const vacationRequestRepository = new VacationRequestRepository()

// GET /api/vacation-requests
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const useCase = new GetAllVacationRequestsUseCase(vacationRequestRepository)
    const requests = await useCase.execute()
    res.json({ success: true, data: requests })
  } catch (err) {
    next(err)
  }
})

// GET /api/vacation-requests/employee/:employeeId
router.get(
  '/employee/:employeeId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const useCase = new GetVacationRequestsByEmployeeUseCase(
        vacationRequestRepository
      )
      const requests = await useCase.execute(req.params.employeeId as string)
      res.json({ success: true, data: requests })
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/vacation-requests
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const useCase = new CreateVacationRequestUseCase(vacationRequestRepository)
    const request = await useCase.execute(req.body)
    res.status(201).json({ success: true, data: request })
  } catch (err) {
    next(err)
  }
})

export default router
