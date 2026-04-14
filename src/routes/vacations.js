import { Router } from 'express'
import {
  createVacationRequest,
  listVacationRequests,
  approveVacationRequest,
  rejectVacationRequest,
} from '../vacations/vacationService.js'

const router = Router()

const VALID_STATUSES = ['pending', 'approved', 'rejected']

// POST /api/vacations
router.post('/', (req, res) => {
  const { employeeId, startDate, endDate, reason } = req.body

  const result = createVacationRequest({ employeeId, startDate, endDate, reason })

  if (result.errors) {
    return res.status(400).json({ errors: result.errors })
  }

  return res.status(201).json({ data: result.request })
})

// GET /api/vacations
router.get('/', (req, res) => {
  const { status, employeeId } = req.query

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      errors: [`Invalid status filter. Must be one of: ${VALID_STATUSES.join(', ')}`],
    })
  }

  const requests = listVacationRequests({ status, employeeId })
  return res.status(200).json({ data: requests })
})

// PATCH /api/vacations/:id/approve
router.patch('/:id/approve', (req, res) => {
  const { id } = req.params

  const result = approveVacationRequest(id)

  if (result.error) {
    const status = result.error === 'Vacation request not found' ? 404 : 409
    return res.status(status).json({ error: result.error })
  }

  return res.status(200).json({ data: result.request })
})

// PATCH /api/vacations/:id/reject
router.patch('/:id/reject', (req, res) => {
  const { id } = req.params
  const { reason } = req.body || {}

  const result = rejectVacationRequest(id, reason)

  if (result.error) {
    const status = result.error === 'Vacation request not found' ? 404 : 409
    return res.status(status).json({ error: result.error })
  }

  return res.status(200).json({ data: result.request })
})

export default router
