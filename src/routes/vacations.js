import { Router } from 'express'
import {
  createVacationRequest,
  listVacationRequests,
  approveVacationRequest,
  rejectVacationRequest,
} from '../vacations/vacationService.js'

const router = Router()

// POST /api/vacations
router.post('/', (req, res) => {
  const { employeeId, startDate, endDate, reason } = req.body
  const result = createVacationRequest({ employeeId, startDate, endDate, reason })
  return res.status(result.status).json(result.error ? { error: result.error } : result.data)
})

// GET /api/vacations
router.get('/', (req, res) => {
  const { status, employeeId } = req.query
  const result = listVacationRequests({ status, employeeId })
  return res.status(result.status).json(result.data)
})

// PATCH /api/vacations/:id/approve
router.patch('/:id/approve', (req, res) => {
  const result = approveVacationRequest(req.params.id)
  return res.status(result.status).json(result.error ? { error: result.error } : result.data)
})

// PATCH /api/vacations/:id/reject
router.patch('/:id/reject', (req, res) => {
  const { reason } = req.body
  const result = rejectVacationRequest(req.params.id, reason)
  return res.status(result.status).json(result.error ? { error: result.error } : result.data)
})

export default router
