// ─── Config ────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:3000/api'

// ─── State ─────────────────────────────────────────────────────────────────
const state = {
  token: null,
  vacations: [],
  employees: [],
  currentFilter: 'all',
  pendingRejectId: null,
}

// ─── API helpers ───────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  let body = null
  try {
    body = await res.json()
  } catch (_) {
    // no body
  }
  if (!res.ok) {
    const msg =
      (body && (body.error || body.message)) ||
      `Error ${res.status}: ${res.statusText}`
    throw new Error(msg)
  }
  return body
}

// ─── Auth ───────────────────────────────────────────────────────────────────
function saveToken(token) {
  state.token = token
  sessionStorage.setItem('vacation_token', token)
}

function loadToken() {
  const t = sessionStorage.getItem('vacation_token')
  if (t) state.token = t
  return !!t
}

function clearToken() {
  state.token = null
  sessionStorage.removeItem('vacation_token')
}

// ─── Toast ──────────────────────────────────────────────────────────────────
function showToast(message, type = 'success', duration = 3500) {
  const container = document.getElementById('toast-container')
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`

  const icon = {
    success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    error: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
    info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
  }[type] || ''

  toast.innerHTML = `${icon}<span>${message}</span>`
  container.appendChild(toast)

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease'
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(20px)'
    setTimeout(() => toast.remove(), 300)
  }, duration)
}

// ─── Loading helpers ────────────────────────────────────────────────────────
function setButtonLoading(btn, loading) {
  const text = btn.querySelector('.btn-text')
  const spinner = btn.querySelector('.btn-spinner')
  if (loading) {
    btn.disabled = true
    if (text) text.style.display = 'none'
    if (spinner) spinner.classList.remove('hidden')
  } else {
    btn.disabled = false
    if (text) text.style.display = ''
    if (spinner) spinner.classList.add('hidden')
  }
}

// ─── Date Utilities ─────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—'
  // dateStr is YYYY-MM-DD from the API
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function todayISO() {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

// ─── Status helpers ─────────────────────────────────────────────────────────
const STATUS_LABELS = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
}

const STATUS_BADGE = {
  pending: 'badge-pending',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
}

function statusBadgeHTML(status) {
  const cls = STATUS_BADGE[status] || ''
  const label = STATUS_LABELS[status] || status
  return `<span class="badge ${cls}">${label}</span>`
}

// ─── Employee lookup helpers ────────────────────────────────────────────────
function findEmployee(id) {
  return state.employees.find((e) => e.id === id) || null
}

function employeeFullName(emp) {
  if (!emp) return 'Empleado desconocido'
  return `${emp.firstName} ${emp.lastName}`
}

function employeeInitials(emp) {
  if (!emp) return '?'
  return `${(emp.firstName || '')[0] || ''}${(emp.lastName || '')[0] || ''}`.toUpperCase()
}

// ─── Stats ──────────────────────────────────────────────────────────────────
function updateStats(vacations) {
  document.getElementById('stat-total').textContent = vacations.length
  document.getElementById('stat-pending').textContent = vacations.filter(
    (v) => v.status === 'pending'
  ).length
  document.getElementById('stat-approved').textContent = vacations.filter(
    (v) => v.status === 'approved'
  ).length
  document.getElementById('stat-rejected').textContent = vacations.filter(
    (v) => v.status === 'rejected'
  ).length
}

// ─── Table Rendering ────────────────────────────────────────────────────────
function renderTable(vacations) {
  const loading = document.getElementById('table-loading')
  const empty = document.getElementById('table-empty')
  const table = document.getElementById('vacations-table')
  const tbody = document.getElementById('vacations-tbody')
  const emptyText = document.getElementById('table-empty-text')

  loading.classList.add('hidden')

  if (vacations.length === 0) {
    table.classList.add('hidden')
    empty.classList.remove('hidden')
    const filterLabel = {
      all: 'No hay solicitudes registradas',
      pending: 'No hay solicitudes pendientes',
      approved: 'No hay solicitudes aprobadas',
      rejected: 'No hay solicitudes rechazadas',
    }[state.currentFilter] || 'No hay solicitudes'
    emptyText.textContent = filterLabel
    return
  }

  empty.classList.add('hidden')
  table.classList.remove('hidden')

  tbody.innerHTML = vacations
    .map((v) => {
      const emp = findEmployee(v.employeeId)
      const name = employeeFullName(emp)
      const initials = employeeInitials(emp)
      const position = emp ? emp.position || '' : ''

      const actionsHTML =
        v.status === 'pending'
          ? `
          <button
            class="action-btn action-btn-approve"
            data-action="approve"
            data-id="${v.id}"
            title="Aprobar solicitud"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Aprobar
          </button>
          <button
            class="action-btn action-btn-reject"
            data-action="reject"
            data-id="${v.id}"
            title="Rechazar solicitud"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Rechazar
          </button>`
          : `<span class="no-actions">—</span>`

      return `
        <tr>
          <td data-label="Empleado">
            <div class="employee-cell">
              <div class="employee-avatar">${initials}</div>
              <div>
                <div class="employee-name">${escapeHTML(name)}</div>
                ${position ? `<div class="employee-position">${escapeHTML(position)}</div>` : ''}
              </div>
            </div>
          </td>
          <td class="date-cell" data-label="Fecha inicio">${formatDate(v.startDate)}</td>
          <td class="date-cell" data-label="Fecha fin">${formatDate(v.endDate)}</td>
          <td class="text-center" data-label="Días">
            <span class="days-badge">${v.daysRequested ?? '—'}</span>
          </td>
          <td class="text-center" data-label="Estado">${statusBadgeHTML(v.status)}</td>
          <td data-label="Acciones">
            <div class="actions-cell">${actionsHTML}</div>
          </td>
        </tr>`
    })
    .join('')
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ─── Data Loading ────────────────────────────────────────────────────────────
async function loadEmployees() {
  try {
    const data = await apiFetch('/employees?limit=200')
    state.employees = data.employees || data || []
    populateEmployeeSelect()
  } catch (err) {
    console.warn('Could not load employees:', err.message)
    state.employees = []
  }
}

function populateEmployeeSelect() {
  const select = document.getElementById('employee-select')
  // Keep placeholder option
  select.innerHTML = '<option value="">— Seleccionar empleado —</option>'
  state.employees
    .filter((e) => e.status !== 'inactive')
    .sort((a, b) => employeeFullName(a).localeCompare(employeeFullName(b)))
    .forEach((emp) => {
      const opt = document.createElement('option')
      opt.value = emp.id
      opt.textContent = `${employeeFullName(emp)}${emp.position ? ` — ${emp.position}` : ''}`
      select.appendChild(opt)
    })
}

async function loadVacations(filter = 'all') {
  const loading = document.getElementById('table-loading')
  const empty = document.getElementById('table-empty')
  const table = document.getElementById('vacations-table')

  loading.classList.remove('hidden')
  empty.classList.add('hidden')
  table.classList.add('hidden')

  try {
    const qs = filter !== 'all' ? `?status=${filter}` : ''
    const data = await apiFetch(`/vacations${qs}`)
    // API may return array or { vacations: [] }
    state.vacations = Array.isArray(data) ? data : data.vacations || data.requests || []
    updateStats(
      // Always compute stats over all vacations (fetch all for stats when filtering)
      filter === 'all' ? state.vacations : await fetchAllVacationsForStats()
    )
    renderTable(state.vacations)
  } catch (err) {
    loading.classList.add('hidden')
    showToast(`No se pudieron cargar las solicitudes: ${err.message}`, 'error')
  }
}

async function fetchAllVacationsForStats() {
  try {
    const data = await apiFetch('/vacations')
    return Array.isArray(data) ? data : data.vacations || data.requests || []
  } catch (_) {
    return state.vacations
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────
async function approveVacation(id) {
  const btn = document.querySelector(
    `.action-btn[data-action="approve"][data-id="${id}"]`
  )
  const rejectBtn = document.querySelector(
    `.action-btn[data-action="reject"][data-id="${id}"]`
  )
  if (btn) {
    btn.disabled = true
    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg> …`
  }
  if (rejectBtn) rejectBtn.disabled = true

  try {
    await apiFetch(`/vacations/${id}/approve`, { method: 'PATCH' })
    showToast('Solicitud aprobada correctamente', 'success')
    await loadVacations(state.currentFilter)
  } catch (err) {
    showToast(`No se pudo aprobar: ${err.message}`, 'error')
    if (btn) {
      btn.disabled = false
      btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Aprobar`
    }
    if (rejectBtn) rejectBtn.disabled = false
  }
}

async function rejectVacation(id, reason) {
  const confirmBtn = document.getElementById('confirm-reject-btn')
  setButtonLoading(confirmBtn, true)

  try {
    const body = {}
    if (reason && reason.trim()) body.reason = reason.trim()
    await apiFetch(`/vacations/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
    showToast('Solicitud rechazada', 'info')
    closeRejectModal()
    await loadVacations(state.currentFilter)
  } catch (err) {
    showToast(`No se pudo rechazar: ${err.message}`, 'error')
    const errorEl = document.getElementById('reject-error')
    const errorText = document.getElementById('reject-error-text')
    errorText.textContent = err.message
    errorEl.classList.remove('hidden')
  } finally {
    setButtonLoading(confirmBtn, false)
  }
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────
function openRejectModal(id) {
  state.pendingRejectId = id
  document.getElementById('reject-reason').value = ''
  document.getElementById('reject-error').classList.add('hidden')
  document.getElementById('reject-modal').classList.remove('hidden')
  setTimeout(() => document.getElementById('reject-reason').focus(), 50)
}

function closeRejectModal() {
  state.pendingRejectId = null
  document.getElementById('reject-modal').classList.add('hidden')
}

// ─── New Request Form ─────────────────────────────────────────────────────────
function openFormModal() {
  resetForm()
  document.getElementById('form-modal').classList.remove('hidden')
  setTimeout(() => document.getElementById('employee-select').focus(), 50)
}

function closeFormModal() {
  document.getElementById('form-modal').classList.add('hidden')
  resetForm()
}

function resetForm() {
  const form = document.getElementById('vacation-form')
  form.reset()
  // Set min date to today for date pickers
  const today = todayISO()
  document.getElementById('start-date').min = today
  document.getElementById('end-date').min = today
  // Clear validation errors
  ;['employee-error', 'start-date-error', 'end-date-error'].forEach((id) => {
    document.getElementById(id).classList.add('hidden')
  })
  ;['employee-select', 'start-date', 'end-date'].forEach((id) => {
    document.getElementById(id).classList.remove('is-invalid')
  })
  document.getElementById('form-error').classList.add('hidden')
}

function validateForm() {
  let valid = true

  const employeeSelect = document.getElementById('employee-select')
  const startDate = document.getElementById('start-date')
  const endDate = document.getElementById('end-date')
  const employeeError = document.getElementById('employee-error')
  const startError = document.getElementById('start-date-error')
  const endError = document.getElementById('end-date-error')

  // Reset
  ;[employeeSelect, startDate, endDate].forEach((el) =>
    el.classList.remove('is-invalid')
  )
  ;[employeeError, startError, endError].forEach((el) =>
    el.classList.add('hidden')
  )

  if (!employeeSelect.value) {
    employeeSelect.classList.add('is-invalid')
    employeeError.classList.remove('hidden')
    valid = false
  }

  if (!startDate.value) {
    startDate.classList.add('is-invalid')
    startError.textContent = 'La fecha de inicio es requerida'
    startError.classList.remove('hidden')
    valid = false
  }

  if (!endDate.value) {
    endDate.classList.add('is-invalid')
    endError.textContent = 'La fecha de fin es requerida'
    endError.classList.remove('hidden')
    valid = false
  }

  if (startDate.value && endDate.value) {
    if (endDate.value < startDate.value) {
      endDate.classList.add('is-invalid')
      endError.textContent = 'La fecha de fin debe ser igual o posterior a la de inicio'
      endError.classList.remove('hidden')
      valid = false
    }
  }

  return valid
}

async function submitForm(e) {
  e.preventDefault()
  document.getElementById('form-error').classList.add('hidden')

  if (!validateForm()) return

  const submitBtn = document.getElementById('submit-form-btn')
  setButtonLoading(submitBtn, true)

  const payload = {
    employeeId: document.getElementById('employee-select').value,
    startDate: document.getElementById('start-date').value,
    endDate: document.getElementById('end-date').value,
  }
  const reason = document.getElementById('reason-input').value.trim()
  if (reason) payload.reason = reason

  try {
    await apiFetch('/vacations', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    showToast('Solicitud creada correctamente', 'success')
    closeFormModal()
    // Switch to all filter and reload
    setFilter('all')
  } catch (err) {
    const errorEl = document.getElementById('form-error')
    const errorText = document.getElementById('form-error-text')
    errorText.textContent = err.message
    errorEl.classList.remove('hidden')
  } finally {
    setButtonLoading(submitBtn, false)
  }
}

// ─── Filter ───────────────────────────────────────────────────────────────────
function setFilter(filter) {
  state.currentFilter = filter
  document.querySelectorAll('.filter-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.filter === filter)
  })
  loadVacations(filter)
}

// ─── Login / Logout ───────────────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault()
  const loginBtn = document.getElementById('login-btn')
  const errorEl = document.getElementById('login-error')
  errorEl.classList.add('hidden')

  const username = document.getElementById('username').value.trim()
  const password = document.getElementById('password').value

  if (!username || !password) {
    document.getElementById('login-error-text').textContent =
      'Por favor completa todos los campos'
    errorEl.classList.remove('hidden')
    return
  }

  setButtonLoading(loginBtn, true)

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    saveToken(data.token)
    showApp()
  } catch (err) {
    document.getElementById('login-error-text').textContent =
      err.message || 'Credenciales incorrectas'
    errorEl.classList.remove('hidden')
  } finally {
    setButtonLoading(loginBtn, false)
  }
}

async function handleLogout() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' })
  } catch (_) {
    // ignore logout errors
  }
  clearToken()
  showLogin()
}

// ─── Screen Transitions ────────────────────────────────────────────────────────
function showApp() {
  document.getElementById('login-screen').classList.add('hidden')
  document.getElementById('app').classList.remove('hidden')
  // Reset stats to dashes while loading
  ;['stat-total', 'stat-pending', 'stat-approved', 'stat-rejected'].forEach(
    (id) => (document.getElementById(id).textContent = '—')
  )
  // Show loading state
  document.getElementById('table-loading').classList.remove('hidden')
  document.getElementById('vacations-table').classList.add('hidden')
  document.getElementById('table-empty').classList.add('hidden')

  Promise.all([loadEmployees(), loadVacations('all')])
}

function showLogin() {
  document.getElementById('app').classList.add('hidden')
  document.getElementById('login-screen').classList.remove('hidden')
  document.getElementById('login-form').reset()
  document.getElementById('login-error').classList.add('hidden')
  state.vacations = []
  state.employees = []
  state.currentFilter = 'all'
  // Reset filter tabs
  document.querySelectorAll('.filter-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.filter === 'all')
  })
}

// ─── Event Wiring ──────────────────────────────────────────────────────────────
function bindEvents() {
  // Login
  document.getElementById('login-form').addEventListener('submit', handleLogin)

  // Logout
  document.getElementById('logout-btn').addEventListener('click', handleLogout)

  // Open / close new request modal
  document.getElementById('open-form-btn').addEventListener('click', openFormModal)
  document.getElementById('close-form-btn').addEventListener('click', closeFormModal)
  document.getElementById('cancel-form-btn').addEventListener('click', closeFormModal)

  // New request form submit
  document.getElementById('vacation-form').addEventListener('submit', submitForm)

  // Close reject modal
  document.getElementById('close-reject-btn').addEventListener('click', closeRejectModal)
  document.getElementById('cancel-reject-btn').addEventListener('click', closeRejectModal)

  // Confirm reject
  document.getElementById('confirm-reject-btn').addEventListener('click', () => {
    if (!state.pendingRejectId) return
    const reason = document.getElementById('reject-reason').value
    rejectVacation(state.pendingRejectId, reason)
  })

  // Close modals on overlay click
  document.getElementById('form-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeFormModal()
  })
  document.getElementById('reject-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeRejectModal()
  })

  // Filter tabs
  document.querySelectorAll('.filter-tab').forEach((tab) => {
    tab.addEventListener('click', () => setFilter(tab.dataset.filter))
  })

  // Table action buttons (event delegation)
  document.getElementById('vacations-tbody').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]')
    if (!btn || btn.disabled) return
    const { action, id } = btn.dataset
    if (action === 'approve') approveVacation(id)
    if (action === 'reject') openRejectModal(id)
  })

  // Update end-date min when start-date changes
  document.getElementById('start-date').addEventListener('change', (e) => {
    const endDateInput = document.getElementById('end-date')
    if (e.target.value) {
      endDateInput.min = e.target.value
      if (endDateInput.value && endDateInput.value < e.target.value) {
        endDateInput.value = ''
      }
    }
  })

  // Keyboard: close modals with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!document.getElementById('reject-modal').classList.contains('hidden')) {
        closeRejectModal()
      } else if (!document.getElementById('form-modal').classList.contains('hidden')) {
        closeFormModal()
      }
    }
  })
}

// ─── Bootstrap ─────────────────────────────────────────────────────────────────
function init() {
  bindEvents()
  if (loadToken()) {
    showApp()
  } else {
    document.getElementById('login-screen').classList.remove('hidden')
    document.getElementById('app').classList.add('hidden')
  }
}

document.addEventListener('DOMContentLoaded', init)
