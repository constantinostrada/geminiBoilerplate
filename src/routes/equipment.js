import { Router } from 'express'
import {
  createEquipment,
  listEquipment,
  updateEquipment,
  assignEquipment,
  unassignEquipment,
  getEquipmentHistory,
} from '../equipment/equipmentService.js'

const router = Router()

// POST /api/equipment
router.post('/', (req, res) => {
  const { type, brand, model, serialNumber, status } = req.body
  const result = createEquipment({ type, brand, model, serialNumber, status })
  return res.status(result.status).json(result.error ? { error: result.error } : result.data)
})

// GET /api/equipment
router.get('/', (req, res) => {
  const { status } = req.query
  const result = listEquipment({ status })
  return res.status(result.status).json(result.error ? { error: result.error } : result.data)
})

// PUT /api/equipment/:id
router.put('/:id', (req, res) => {
  const result = updateEquipment(req.params.id, req.body)
  return res.status(result.status).json(result.error ? { error: result.error } : result.data)
})

// POST /api/equipment/:id/assign
router.post('/:id/assign', (req, res) => {
  const result = assignEquipment(req.params.id, req.body)
  return res.status(result.status).json(result.error ? { error: result.error } : result.data)
})

// POST /api/equipment/:id/unassign
router.post('/:id/unassign', (req, res) => {
  const result = unassignEquipment(req.params.id)
  return res.status(result.status).json(result.error ? { error: result.error } : result.data)
})

// GET /api/equipment/:id/history
router.get('/:id/history', (req, res) => {
  const result = getEquipmentHistory(req.params.id)
  return res.status(result.status).json(result.error ? { error: result.error } : result.data)
})

export default router
