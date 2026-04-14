import { Router, Request, Response, NextFunction } from 'express'
import { UserRepository } from '../../infrastructure/repositories/UserRepository'
import { CreateUserUseCase } from '../../application/use-cases/user/CreateUserUseCase'
import {
  GetAllUsersUseCase,
  GetUserByIdUseCase,
} from '../../application/use-cases/user/GetUserUseCase'

const router = Router()
const userRepository = new UserRepository()

// GET /api/users
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const useCase = new GetAllUsersUseCase(userRepository)
    const users = await useCase.execute()
    res.json({ success: true, data: users })
  } catch (err) {
    next(err)
  }
})

// GET /api/users/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const useCase = new GetUserByIdUseCase(userRepository)
    const user = await useCase.execute(req.params.id as string)
    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
})

// POST /api/users
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const useCase = new CreateUserUseCase(userRepository)
    const user = await useCase.execute(req.body)
    res.status(201).json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
})

export default router
