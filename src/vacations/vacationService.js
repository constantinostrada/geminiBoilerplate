import { v4 as uuidv4 } from 'uuid'
import { store } from '../db/store.js'
import { validateVacationInput, calculateDaysRequested } from './vacationValidators.js'

export function createVacationRequest({ employeeId, startDate, endDate, reason }) {
  const validationError = validateVacationInput({ employeeId, startDate, endDate })
  if (validationError) {
    return { error: validationError, status: 400 }
  }

  const id = uuidv4()
  const request = {
    id,
    employeeId,
    startDate,
    endDate,
    reason: reason || null,
    status: 'pending',
    daysRequested: calculateDaysRequested(startDate, endDate),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  store.vacationRequests.set(id, request)
  return { data: request, status: 201 }
}

export function listVacationRequests({ status, employeeId } = {}) {
  let requests = Array.from(store.vacationRequests.values())

  if (status) {
    requests = requests.filter((r) => r.status === status)
  }
  if (employeeId) {
    requests = requests.filter((r) => r.employeeId === employeeId)
  }

  return { data: requests, status: 200 }
}

export function approveVacationRequest(id) {
  const request = store.vacationRequests.get(id)
  if (!request) {
    return { error: 'Vacation request not found', status: 404 }
  }
  if (request.status !== 'pending') {
    return { error: 'Only pending requests can be approved', status: 409 }
  }

  const updated = { ...request, status: 'approved', updatedAt: new Date().toISOString() }
  store.vacationRequests.set(id, updated)
  return { data: updated, status: 200 }
}

export function rejectVacationRequest(id, reason) {
  const request = store.vacationRequests.get(id)
  if (!request) {
    return { error: 'Vacation request not found', status: 404 }
  }
  if (request.status !== 'pending') {
    return { error: 'Only pending requests can be rejected', status: 409 }
  }

  const updated = {
    ...request,
    status: 'rejected',
    rejectionReason: reason || null,
    updatedAt: new Date().toISOString(),
  }
  store.vacationRequests.set(id, updated)
  return { data: updated, status: 200 }
}
