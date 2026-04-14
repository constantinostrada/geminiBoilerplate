/**
 * Calculates the number of calendar days between two date strings (inclusive).
 * @param {string} startDate - ISO date string YYYY-MM-DD
 * @param {string} endDate   - ISO date string YYYY-MM-DD
 * @returns {number}
 */
export function calculateDaysRequested(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMs = end.getTime() - start.getTime()
  return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1
}

/**
 * Validates vacation request input fields.
 * Returns an array of error messages (empty if valid).
 * @param {object} data
 * @param {string} data.employeeId
 * @param {string} data.startDate  - YYYY-MM-DD
 * @param {string} data.endDate    - YYYY-MM-DD
 * @param {string} [data.reason]
 * @returns {string[]}
 */
export function validateVacationInput({ employeeId, startDate, endDate, reason }) {
  const errors = []

  if (!employeeId || typeof employeeId !== 'string' || employeeId.trim() === '') {
    errors.push('employeeId is required')
  }

  if (!startDate) {
    errors.push('startDate is required')
  }

  if (!endDate) {
    errors.push('endDate is required')
  }

  if (!startDate || !endDate) {
    return errors
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/

  if (!dateRegex.test(startDate)) {
    errors.push('startDate must be in YYYY-MM-DD format')
  }

  if (!dateRegex.test(endDate)) {
    errors.push('endDate must be in YYYY-MM-DD format')
  }

  if (errors.length > 0) {
    return errors
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime())) {
    errors.push('startDate is not a valid date')
  }

  if (isNaN(end.getTime())) {
    errors.push('endDate is not a valid date')
  }

  if (errors.length > 0) {
    return errors
  }

  // Normalize today to midnight UTC for comparison
  const todayStr = new Date().toISOString().slice(0, 10)
  const today = new Date(todayStr)

  if (start < today) {
    errors.push('startDate cannot be in the past')
  }

  if (end < today) {
    errors.push('endDate cannot be in the past')
  }

  if (start >= end && start.toDateString() !== end.toDateString()) {
    // allow same-day requests; only error when start is strictly after end
  }

  if (start > end) {
    errors.push('startDate must be before or equal to endDate')
  }

  return errors
}
