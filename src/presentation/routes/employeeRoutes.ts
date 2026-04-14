import { Router, Request, Response, NextFunction } from 'express'
import { EmployeeRepository } from '../../infrastructure/repositories/EmployeeRepository'
import { CreateEmployeeUseCase } from '../../application/use-cases/employee/CreateEmployeeUseCase'
import {
  GetAllEmployeesUseCase,
  GetEmployeeByIdUseCase,
} from '../../application/use-cases/employee/GetEmployeeUseCase'

const router = Router()
const employeeRepository = new EmployeeRepository()

// GET /api/employees
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const useCase = new GetAllEmployeesUseCase(employeeRepository)
    const employees = await useCase.execute()
    res.json({ success: true, data: employees })
  } catch (err) {
    next(err)
  }
})

// GET /api/employees/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const useCase = new GetEmployeeByIdUseCase(employeeRepository)
    const employee = await useCase.execute(req.params.id as string)
    res.json({ success: true, data: employee })
  } catch (err) {
    next(err)
  }
})

// POST /api/employees
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const useCase = new CreateEmployeeUseCase(employeeRepository)
    const employee = await useCase.execute(req.body)
    res.status(201).json({ success: true, data: employee })
  } catch (err) {
    next(err)
  }
})

export default router
