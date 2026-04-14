import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import {
  validateCreateEmployee,
  validateUpdateEmployee,
} from '../employees/employeeValidators.js'
import {
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../employees/employeeService.js'

const router = Router()

// All employee routes require authentication
router.use(authenticate)

// GET /api/employees - list with pagination and optional search
router.get('/', (req, res) => {
  const { search, page, limit } = req.query
  const result = listEmployees({ search, page, limit })
  return res.status(200).json(result)
})

// POST /api/employees - create a new employee
router.post('/', (req, res) => {
  const errors = validateCreateEmployee(req.body)
  if (errors.length > 0) {
    return res.status(400).json({ errors })
  }

  try {
    const employee = createEmployee(req.body)
    return res.status(201).json(employee)
  } catch (err) {
    const status = err.status || 500
    return res.status(status).json({ error: err.message })
  }
})

// GET /api/employees/:id - get employee by id
router.get('/:id', (req, res) => {
  const employee = getEmployeeById(req.params.id)
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' })
  }
  return res.status(200).json(employee)
})

// PUT /api/employees/:id - update employee
router.put('/:id', (req, res) => {
  const errors = validateUpdateEmployee(req.body)
  if (errors.length > 0) {
    return res.status(400).json({ errors })
  }

  try {
    const employee = updateEmployee(req.params.id, req.body)
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' })
    }
    return res.status(200).json(employee)
  } catch (err) {
    const status = err.status || 500
    return res.status(status).json({ error: err.message })
  }
})

// DELETE /api/employees/:id - soft delete (set status to inactive)
router.delete('/:id', (req, res) => {
  const employee = deleteEmployee(req.params.id)
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' })
  }
  return res.status(200).json(employee)
})

export default router
