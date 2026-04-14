import { v4 as uuidv4 } from 'uuid'
import { employees, vacationRequests } from '../db/store.js'
import { validateVacationInput, calculateDaysRequested } from './vacationValidators.js'

/**
 * Creates a new vacation request.
 * @param {object} data
 * @returns {{ request?: object, errors?: string[] }}
 */
export function createVacationRequest({ employeeId, startDate, endDate, reason }) {
  const errors = validateVacationInput({ employeeId, startDate, endDate, reason })
  if (errors.length > 0) {
    return { errors }
  }

  if (!employees.has(employeeId)) {
    return { errors: ['Employee not found'] }
  }

  const request = {
    id: uuidv4(),
    employeeId,
    startDate,
    endDate,
    reason: reason || null,
    status: 'pending',
    daysRequested: calculateDaysRequested(startDate, endDate),
    rejectionReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  vacationRequests.set(request.id, request)
  return { request }
}

/**
 * Lists vacation requests with optional filters.
 * @param {object} filters
 * @param {string} [filters.status]     - pending | approved | rejected
 * @param {string} [filters.employeeId]
 * @returns {object[]}
 */
export function listVacationRequests({ status, employeeId } = {}) {
  let results = Array.from(vacationRequests.values())

  if (status) {
    results = results.filter((r) => r.status === status)
  }

  if (employeeId) {
    results = results.filter((r) => r.employeeId === employeeId)
  }

  return results
}

/**
 * Approves a pending vacation request.
 * @param {string} id
 * @returns {{ request?: object, error?: string }}
 */
export function approveVacationRequest(id) {
  const request = vacationRequests.get(id)

  if (!request) {
    return { error: 'Vacation request not found' }
  }

  if (request.status !== 'pending') {
    return { error: `Cannot approve a request with status '${request.status}'` }
  }

  const updated = {
    ...request,
    status: 'approved',
    updatedAt: new Date().toISOString(),
  }

  vacationRequests.set(id, updated)
  return { request: updated }
}

/**
 * Rejects a pending vacation request.
 * @param {string} id
 * @param {string} [rejectionReason]
 * @returns {{ request?: object, error?: string }}
 */
export function rejectVacationRequest(id, rejectionReason) {
  const request = vacationRequests.get(id)

  if (!request) {
    return { error: 'Vacation request not found' }
  }

  if (request.status !== 'pending') {
    return { error: `Cannot reject a request with status '${request.status}'` }
  }

  const updated = {
    ...request,
    status: 'rejected',
    rejectionReason: rejectionReason || null,
    updatedAt: new Date().toISOString(),
  }

  vacationRequests.set(id, updated)
  return { request: updated }
}
