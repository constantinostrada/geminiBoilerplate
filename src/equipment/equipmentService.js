import { v4 as uuidv4 } from 'uuid'
import { store } from '../db/store.js'
import { validateEquipmentInput, validateUpdateInput, VALID_STATUSES } from './equipmentValidators.js'

// ─── Equipment CRUD ──────────────────────────────────────────────────────────

export function createEquipment({ type, brand, model, serialNumber, status }) {
  const validationError = validateEquipmentInput({ type, brand, model, serialNumber, status })
  if (validationError) {
    return { error: validationError, status: 400 }
  }

  // Enforce unique serial number
  const duplicate = Array.from(store.equipment.values()).find(
    (e) => e.serialNumber === serialNumber
  )
  if (duplicate) {
    return { error: 'serialNumber already exists', status: 409 }
  }

  const id = uuidv4()
  const equipment = {
    id,
    type,
    brand,
    model,
    serialNumber,
    status: status || 'available',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  store.equipment.set(id, equipment)
  return { data: equipment, status: 201 }
}

export function listEquipment({ status } = {}) {
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return { error: `status must be one of: ${VALID_STATUSES.join(', ')}`, status: 400 }
  }

  let items = Array.from(store.equipment.values())
  if (status) {
    items = items.filter((e) => e.status === status)
  }

  return { data: items, status: 200 }
}

export function updateEquipment(id, fields) {
  const equipment = store.equipment.get(id)
  if (!equipment) {
    return { error: 'Equipment not found', status: 404 }
  }

  const validationError = validateUpdateInput(fields)
  if (validationError) {
    return { error: validationError, status: 400 }
  }

  // Enforce unique serial number if being changed
  if (fields.serialNumber && fields.serialNumber !== equipment.serialNumber) {
    const duplicate = Array.from(store.equipment.values()).find(
      (e) => e.serialNumber === fields.serialNumber && e.id !== id
    )
    if (duplicate) {
      return { error: 'serialNumber already exists', status: 409 }
    }
  }

  const updated = {
    ...equipment,
    ...fields,
    updatedAt: new Date().toISOString(),
  }

  store.equipment.set(id, updated)
  return { data: updated, status: 200 }
}

// ─── Assignment ──────────────────────────────────────────────────────────────

export function assignEquipment(id, { employeeId }) {
  if (!employeeId) {
    return { error: 'employeeId is required', status: 400 }
  }

  const equipment = store.equipment.get(id)
  if (!equipment) {
    return { error: 'Equipment not found', status: 404 }
  }

  if (equipment.status === 'assigned') {
    return { error: 'Equipment is already assigned', status: 409 }
  }

  if (equipment.status === 'maintenance') {
    return { error: 'Equipment is under maintenance and cannot be assigned', status: 409 }
  }

  const assignmentId = uuidv4()
  const now = new Date().toISOString()

  const assignment = {
    id: assignmentId,
    equipmentId: id,
    employeeId,
    assignedAt: now,
    unassignedAt: null,
  }

  store.equipmentAssignments.set(assignmentId, assignment)

  const updatedEquipment = {
    ...equipment,
    status: 'assigned',
    currentAssignmentId: assignmentId,
    updatedAt: now,
  }

  store.equipment.set(id, updatedEquipment)

  return { data: { equipment: updatedEquipment, assignment }, status: 200 }
}

export function unassignEquipment(id) {
  const equipment = store.equipment.get(id)
  if (!equipment) {
    return { error: 'Equipment not found', status: 404 }
  }

  if (equipment.status !== 'assigned') {
    return { error: 'Equipment is not currently assigned', status: 409 }
  }

  const now = new Date().toISOString()

  // Close the active assignment record
  if (equipment.currentAssignmentId) {
    const assignment = store.equipmentAssignments.get(equipment.currentAssignmentId)
    if (assignment) {
      store.equipmentAssignments.set(equipment.currentAssignmentId, {
        ...assignment,
        unassignedAt: now,
      })
    }
  }

  const updatedEquipment = {
    ...equipment,
    status: 'available',
    currentAssignmentId: null,
    updatedAt: now,
  }

  store.equipment.set(id, updatedEquipment)

  return { data: updatedEquipment, status: 200 }
}

// ─── History ─────────────────────────────────────────────────────────────────

export function getEquipmentHistory(id) {
  const equipment = store.equipment.get(id)
  if (!equipment) {
    return { error: 'Equipment not found', status: 404 }
  }

  const history = Array.from(store.equipmentAssignments.values())
    .filter((a) => a.equipmentId === id)
    .sort((a, b) => new Date(a.assignedAt) - new Date(b.assignedAt))

  return { data: history, status: 200 }
}
