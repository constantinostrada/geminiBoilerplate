// Validates fields for creating an employee
export function validateCreateEmployee(body) {
  const errors = []

  if (!body.firstName || typeof body.firstName !== 'string' || !body.firstName.trim()) {
    errors.push('firstName is required')
  }

  if (!body.lastName || typeof body.lastName !== 'string' || !body.lastName.trim()) {
    errors.push('lastName is required')
  }

  if (!body.email || typeof body.email !== 'string' || !body.email.trim()) {
    errors.push('email is required')
  } else if (!isValidEmail(body.email.trim())) {
    errors.push('email must be a valid email address')
  }

  if (!body.position || typeof body.position !== 'string' || !body.position.trim()) {
    errors.push('position is required')
  }

  if (!body.department || typeof body.department !== 'string' || !body.department.trim()) {
    errors.push('department is required')
  }

  if (body.hireDate !== undefined) {
    if (!isValidDate(body.hireDate)) {
      errors.push('hireDate must be a valid date in YYYY-MM-DD format')
    }
  }

  return errors
}

// Validates fields for updating an employee (all optional but must be valid if present)
export function validateUpdateEmployee(body) {
  const errors = []

  if (body.firstName !== undefined) {
    if (typeof body.firstName !== 'string' || !body.firstName.trim()) {
      errors.push('firstName must be a non-empty string')
    }
  }

  if (body.lastName !== undefined) {
    if (typeof body.lastName !== 'string' || !body.lastName.trim()) {
      errors.push('lastName must be a non-empty string')
    }
  }

  if (body.email !== undefined) {
    if (typeof body.email !== 'string' || !body.email.trim()) {
      errors.push('email must be a non-empty string')
    } else if (!isValidEmail(body.email.trim())) {
      errors.push('email must be a valid email address')
    }
  }

  if (body.position !== undefined) {
    if (typeof body.position !== 'string' || !body.position.trim()) {
      errors.push('position must be a non-empty string')
    }
  }

  if (body.department !== undefined) {
    if (typeof body.department !== 'string' || !body.department.trim()) {
      errors.push('department must be a non-empty string')
    }
  }

  if (body.hireDate !== undefined) {
    if (!isValidDate(body.hireDate)) {
      errors.push('hireDate must be a valid date in YYYY-MM-DD format')
    }
  }

  return errors
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidDate(value) {
  if (typeof value !== 'string') return false
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = new Date(value)
  return !isNaN(d.getTime())
}
