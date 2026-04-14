const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export function validateVacationInput({ employeeId, startDate, endDate }) {
  if (!employeeId) {
    return 'employeeId is required'
  }
  if (!startDate) {
    return 'startDate is required'
  }
  if (!endDate) {
    return 'endDate is required'
  }
  if (!DATE_REGEX.test(startDate)) {
    return 'startDate must be in YYYY-MM-DD format'
  }
  if (!DATE_REGEX.test(endDate)) {
    return 'endDate must be in YYYY-MM-DD format'
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start < today) {
    return 'startDate cannot be in the past'
  }
  if (end < today) {
    return 'endDate cannot be in the past'
  }
  if (start >= end) {
    return 'startDate must be before endDate'
  }

  return null
}

export function calculateDaysRequested(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMs = end - start
  return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1
}
