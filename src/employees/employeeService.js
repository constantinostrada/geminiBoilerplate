import { v4 as uuidv4 } from 'uuid'
import { store } from '../db/store.js'

// Returns a sanitised copy (strips internal fields if needed)
function format(employee) {
  return { ...employee }
}

/**
 * List employees with pagination and optional name search.
 * @param {object} options
 * @param {string} [options.search]   - Partial match on firstName or lastName (case-insensitive)
 * @param {number} [options.page]     - 1-based page number (default: 1)
 * @param {number} [options.limit]    - Page size (default: 10)
 * @param {boolean} [options.includeInactive] - Include inactive employees (default: false)
 */
export function listEmployees({ search, page = 1, limit = 10, includeInactive = false } = {}) {
  let employees = Array.from(store.employees.values())

  // By default only show active employees
  if (!includeInactive) {
    employees = employees.filter((e) => e.status === 'active')
  }

  // Search by name (firstName, lastName, or full name)
  if (search && search.trim()) {
    const q = search.trim().toLowerCase()
    employees = employees.filter(
      (e) =>
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q) ||
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q)
    )
  }

  const total = employees.length
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const pageSize = Math.max(1, parseInt(limit, 10) || 10)
  const totalPages = Math.ceil(total / pageSize)
  const offset = (pageNum - 1) * pageSize
  const data = employees.slice(offset, offset + pageSize).map(format)

  return {
    data,
    pagination: {
      total,
      page: pageNum,
      limit: pageSize,
      totalPages,
    },
  }
}

/**
 * Get a single employee by ID (regardless of status).
 * Returns null if not found.
 */
export function getEmployeeById(id) {
  const employee = store.employees.get(id)
  if (!employee) return null
  return format(employee)
}

/**
 * Create a new employee.
 * Throws an error with { status, message } if email already exists.
 */
export function createEmployee(data) {
  const email = data.email.trim().toLowerCase()

  // Unique email check (across all employees including inactive)
  for (const emp of store.employees.values()) {
    if (emp.email === email) {
      const err = new Error('Email already in use')
      err.status = 409
      throw err
    }
  }

  const now = new Date().toISOString()
  const employee = {
    id: uuidv4(),
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email,
    position: data.position.trim(),
    department: data.department.trim(),
    hireDate: data.hireDate ? data.hireDate.trim() : null,
    phone: data.phone ? data.phone.trim() : null,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  }

  store.employees.set(employee.id, employee)
  return format(employee)
}

/**
 * Update an existing employee.
 * Returns the updated employee or null if not found.
 * Throws an error with { status, message } if email already taken by another employee.
 */
export function updateEmployee(id, data) {
  const employee = store.employees.get(id)
  if (!employee) return null

  // If email is being changed, check uniqueness
  if (data.email !== undefined) {
    const newEmail = data.email.trim().toLowerCase()
    for (const emp of store.employees.values()) {
      if (emp.email === newEmail && emp.id !== id) {
        const err = new Error('Email already in use')
        err.status = 409
        throw err
      }
    }
    data = { ...data, email: newEmail }
  }

  const allowedFields = ['firstName', 'lastName', 'email', 'position', 'department', 'hireDate', 'phone']
  const updates = {}
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = typeof data[field] === 'string' ? data[field].trim() : data[field]
    }
  }

  const updated = {
    ...employee,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  store.employees.set(id, updated)
  return format(updated)
}

/**
 * Soft-delete an employee by setting status to 'inactive'.
 * Returns the updated employee or null if not found.
 */
export function deleteEmployee(id) {
  const employee = store.employees.get(id)
  if (!employee) return null

  const updated = {
    ...employee,
    status: 'inactive',
    updatedAt: new Date().toISOString(),
  }

  store.employees.set(id, updated)
  return format(updated)
}
