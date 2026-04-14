// ─────────────────────────────────────────────────────────────────
// DATA – seed employees
// ─────────────────────────────────────────────────────────────────

const SEED_EMPLOYEES = [
  {
    id: 1,
    name: 'Ana García López',
    email: 'ana.garcia@empresa.com',
    phone: '+52 55 1234 5678',
    position: 'Desarrolladora Senior',
    department: 'Ingeniería',
    startDate: '2020-03-15',
    location: 'Ciudad de México',
    active: true,
  },
  {
    id: 2,
    name: 'Carlos Méndez Torres',
    email: 'carlos.mendez@empresa.com',
    phone: '+52 33 9876 5432',
    position: 'Diseñador UX',
    department: 'Diseño',
    startDate: '2019-07-01',
    location: 'Guadalajara',
    active: true,
  },
  {
    id: 3,
    name: 'Sofía Ramírez Cruz',
    email: 'sofia.ramirez@empresa.com',
    phone: '+52 81 5555 0001',
    position: 'Gerente de Marketing',
    department: 'Marketing',
    startDate: '2018-01-10',
    location: 'Monterrey',
    active: false,
  },
  {
    id: 4,
    name: 'Luis Hernández Vega',
    email: 'luis.hernandez@empresa.com',
    phone: '+52 55 4321 8765',
    position: 'Analista de Ventas',
    department: 'Ventas',
    startDate: '2021-09-20',
    location: 'Ciudad de México',
    active: true,
  },
  {
    id: 5,
    name: 'María Torres Flores',
    email: 'maria.torres@empresa.com',
    phone: '+52 55 2222 3333',
    position: 'Coordinadora de RRHH',
    department: 'Recursos Humanos',
    startDate: '2017-05-30',
    location: 'Puebla',
    active: true,
  },
  {
    id: 6,
    name: 'Jorge Castillo Reyes',
    email: 'jorge.castillo@empresa.com',
    phone: '+52 33 7777 8888',
    position: 'Contador Senior',
    department: 'Finanzas',
    startDate: '2022-02-14',
    location: 'Guadalajara',
    active: false,
  },
]

// ─────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────

const state = {
  employees: JSON.parse(localStorage.getItem('employees')) || SEED_EMPLOYEES,
  nextId: 0,         // computed on init
  searchQuery: '',
  currentView: 'list',  // 'list' | 'detail' | 'form'
  selectedId: null,     // employee being viewed/edited
  pendingDeleteId: null, // employee pending delete confirmation
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

/** Save employees array to localStorage */
function persist() {
  localStorage.setItem('employees', JSON.stringify(state.employees))
}

/** Compute the next available id */
function computeNextId() {
  state.nextId = state.employees.length
    ? Math.max(...state.employees.map(e => e.id)) + 1
    : 1
}

/** Avatar background colours based on name */
const AVATAR_COLORS = [
  '#4f46e5', '#0891b2', '#059669', '#d97706',
  '#dc2626', '#7c3aed', '#db2777', '#65a30d',
]
function avatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

/** Get initials (up to 2 chars) */
function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

/** Format ISO date string to locale (es-MX) */
function formatDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return new Date(+y, +m - 1, +d).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Escape HTML entities */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ─────────────────────────────────────────────────────────────────
// DOM REFS
// ─────────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id)

const views = {
  list:   $('view-list'),
  detail: $('view-detail'),
  form:   $('view-form'),
}

// List
const searchInput    = $('search-input')
const btnNewEmployee = $('btn-new-employee')
const employeeTbody  = $('employee-tbody')
const emptyState     = $('empty-state')

// Detail
const btnBackDetail    = $('btn-back-detail')
const btnEditDetail    = $('btn-edit-detail')
const btnDeleteDetail  = $('btn-delete-detail')
const detailAvatar     = $('detail-avatar')
const detailName       = $('detail-name')
const detailRole       = $('detail-role')
const detailStatusBadge = $('detail-status-badge')
const detailEmail      = $('detail-email')
const detailPhone      = $('detail-phone')
const detailDepartment = $('detail-department')
const detailPosition   = $('detail-position')
const detailStartDate  = $('detail-start-date')
const detailLocation   = $('detail-location')

// Form
const btnBackForm    = $('btn-back-form')
const formTitle      = $('form-title')
const employeeForm   = $('employee-form')
const fieldId        = $('field-id')
const fieldName      = $('field-name')
const fieldEmail     = $('field-email')
const fieldPhone     = $('field-phone')
const fieldPosition  = $('field-position')
const fieldDepartment = $('field-department')
const fieldStartDate = $('field-start-date')
const fieldLocation  = $('field-location')
const fieldStatus    = $('field-status')
const toggleLabel    = $('toggle-label')
const btnCancelForm  = $('btn-cancel-form')
const btnSubmitForm  = $('btn-submit-form')

// Modal
const modalConfirm      = $('modal-confirm')
const modalMessage      = $('modal-message')
const btnCancelDelete   = $('btn-cancel-delete')
const btnConfirmDelete  = $('btn-confirm-delete')

// Toast
const toastContainer = $('toast-container')

// ─────────────────────────────────────────────────────────────────
// VIEW NAVIGATION
// ─────────────────────────────────────────────────────────────────

function showView(name) {
  Object.entries(views).forEach(([key, el]) => {
    el.classList.toggle('view--active', key === name)
  })
  state.currentView = name
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ─────────────────────────────────────────────────────────────────
// RENDER: TABLE
// ─────────────────────────────────────────────────────────────────

function filteredEmployees() {
  const q = state.searchQuery.toLowerCase().trim()
  if (!q) return state.employees
  return state.employees.filter(e => e.name.toLowerCase().includes(q))
}

function renderTable() {
  const rows = filteredEmployees()

  if (rows.length === 0) {
    employeeTbody.innerHTML = ''
    emptyState.classList.remove('hidden')
    return
  }

  emptyState.classList.add('hidden')

  employeeTbody.innerHTML = rows.map(emp => {
    const color = avatarColor(emp.name)
    const ini   = initials(emp.name)
    const badgeClass = emp.active ? 'badge--active' : 'badge--inactive'
    const badgeLabel = emp.active ? 'Activo' : 'Inactivo'

    return `
      <tr data-id="${emp.id}">
        <td class="row-name-cell">
          <span class="employee-name" role="button" tabindex="0" aria-label="Ver detalle de ${esc(emp.name)}">
            <span class="avatar-mini" style="background:${color}">${esc(ini)}</span>
            ${esc(emp.name)}
          </span>
        </td>
        <td>${esc(emp.email)}</td>
        <td>${esc(emp.position)}</td>
        <td>${esc(emp.department)}</td>
        <td><span class="badge ${badgeClass}">${badgeLabel}</span></td>
        <td class="col-actions">
          <div class="row-actions">
            <button
              class="btn-icon btn-icon--edit"
              data-action="edit"
              data-id="${emp.id}"
              title="Editar ${esc(emp.name)}"
              aria-label="Editar ${esc(emp.name)}"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button
              class="btn-icon btn-icon--delete"
              data-action="delete"
              data-id="${emp.id}"
              title="Eliminar ${esc(emp.name)}"
              aria-label="Eliminar ${esc(emp.name)}"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `
  }).join('')
}

// ─────────────────────────────────────────────────────────────────
// RENDER: DETAIL
// ─────────────────────────────────────────────────────────────────

function renderDetail(emp) {
  const color = avatarColor(emp.name)
  detailAvatar.textContent = initials(emp.name)
  detailAvatar.style.background = color
  detailName.textContent = emp.name
  detailRole.textContent = emp.position
  detailStatusBadge.textContent = emp.active ? 'Activo' : 'Inactivo'
  detailStatusBadge.className = `badge ${emp.active ? 'badge--active' : 'badge--inactive'}`
  detailEmail.textContent      = emp.email      || '—'
  detailPhone.textContent      = emp.phone      || '—'
  detailDepartment.textContent = emp.department || '—'
  detailPosition.textContent   = emp.position   || '—'
  detailStartDate.textContent  = formatDate(emp.startDate)
  detailLocation.textContent   = emp.location   || '—'
}

// ─────────────────────────────────────────────────────────────────
// FORM – populate / clear
// ─────────────────────────────────────────────────────────────────

function clearFormErrors() {
  const formErrorFields = ['name', 'email', 'position', 'department']
  formErrorFields.forEach(field => {
    const input = $(`field-${field}`)
    const err   = $(`err-${field}`)
    if (input) input.classList.remove('is-invalid')
    if (err)   err.textContent = ''
  })
}

function openFormCreate() {
  state.selectedId = null
  formTitle.textContent = 'Nuevo Empleado'
  btnSubmitForm.textContent = 'Guardar empleado'
  employeeForm.reset()
  fieldId.value = ''
  toggleLabel.textContent = 'Activo'
  clearFormErrors()
  showView('form')
}

function openFormEdit(emp) {
  state.selectedId = emp.id
  formTitle.textContent = 'Editar Empleado'
  btnSubmitForm.textContent = 'Actualizar empleado'
  fieldId.value        = emp.id
  fieldName.value      = emp.name
  fieldEmail.value     = emp.email
  fieldPhone.value     = emp.phone      || ''
  fieldPosition.value  = emp.position
  fieldDepartment.value = emp.department
  fieldStartDate.value = emp.startDate  || ''
  fieldLocation.value  = emp.location   || ''
  fieldStatus.checked  = emp.active
  toggleLabel.textContent = emp.active ? 'Activo' : 'Inactivo'
  clearFormErrors()
  showView('form')
}

// ─────────────────────────────────────────────────────────────────
// FORM – validation
// ─────────────────────────────────────────────────────────────────

function validateForm() {
  let valid = true

  const rules = [
    { field: 'name',       label: 'El nombre es obligatorio' },
    { field: 'email',      label: 'El email es obligatorio',      extra: validateEmail },
    { field: 'position',   label: 'El cargo es obligatorio' },
    { field: 'department', label: 'Selecciona un departamento' },
  ]

  rules.forEach(({ field, label, extra }) => {
    const input = $(`field-${field}`)
    const err   = $(`err-${field}`)
    const val   = input.value.trim()

    if (!val) {
      input.classList.add('is-invalid')
      err.textContent = label
      valid = false
    } else if (extra && !extra(val)) {
      input.classList.add('is-invalid')
      err.textContent = 'Introduce un email válido'
      valid = false
    } else {
      input.classList.remove('is-invalid')
      err.textContent = ''
    }
  })

  return valid
}

function validateEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
}

// ─────────────────────────────────────────────────────────────────
// CRUD OPERATIONS
// ─────────────────────────────────────────────────────────────────

function createEmployee(data) {
  const emp = { ...data, id: state.nextId++ }
  state.employees.push(emp)
  persist()
  return emp
}

function updateEmployee(id, data) {
  const idx = state.employees.findIndex(e => e.id === id)
  if (idx === -1) return null
  state.employees[idx] = { ...state.employees[idx], ...data }
  persist()
  return state.employees[idx]
}

function deleteEmployee(id) {
  state.employees = state.employees.filter(e => e.id !== id)
  persist()
}

function getEmployee(id) {
  return state.employees.find(e => e.id === id) ?? null
}

// ─────────────────────────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────────────────────────

function openDeleteModal(id) {
  const emp = getEmployee(id)
  if (!emp) return
  state.pendingDeleteId = id
  modalMessage.textContent =
    `¿Estás seguro de que deseas eliminar a "${emp.name}"? Esta acción no se puede deshacer.`
  modalConfirm.removeAttribute('hidden')
  btnConfirmDelete.focus()
}

function closeDeleteModal() {
  modalConfirm.setAttribute('hidden', '')
  state.pendingDeleteId = null
}

// ─────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────

const TOAST_ICONS = {
  success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  error:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  info:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
}

function showToast(message, type = 'success', duration = 3500) {
  const el = document.createElement('div')
  el.className = `toast toast--${type}`
  el.innerHTML = `${TOAST_ICONS[type] ?? ''}<span>${esc(message)}</span>`
  toastContainer.appendChild(el)

  setTimeout(() => {
    el.classList.add('toast--hide')
    el.addEventListener('animationend', () => el.remove(), { once: true })
  }, duration)
}

// ─────────────────────────────────────────────────────────────────
// EVENT HANDLERS
// ─────────────────────────────────────────────────────────────────

// — Search (real-time filter) —
searchInput.addEventListener('input', () => {
  state.searchQuery = searchInput.value
  renderTable()
})

// — New employee button —
btnNewEmployee.addEventListener('click', openFormCreate)

// — Table: row click / button clicks —
employeeTbody.addEventListener('click', e => {
  // Detail: click on name
  const nameEl = e.target.closest('.employee-name')
  if (nameEl) {
    const row = nameEl.closest('tr')
    const id  = Number(row.dataset.id)
    const emp = getEmployee(id)
    if (!emp) return
    state.selectedId = id
    renderDetail(emp)
    showView('detail')
    return
  }

  // Action buttons
  const btn = e.target.closest('[data-action]')
  if (!btn) return
  const id  = Number(btn.dataset.id)
  const action = btn.dataset.action

  if (action === 'edit') {
    const emp = getEmployee(id)
    if (emp) openFormEdit(emp)
  } else if (action === 'delete') {
    openDeleteModal(id)
  }
})

// Keyboard support for name cells
employeeTbody.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return
  const nameEl = e.target.closest('.employee-name')
  if (!nameEl) return
  e.preventDefault()
  nameEl.click()
})

// — Detail: back —
btnBackDetail.addEventListener('click', () => {
  renderTable()
  showView('list')
})

// — Detail: edit —
btnEditDetail.addEventListener('click', () => {
  const emp = getEmployee(state.selectedId)
  if (emp) openFormEdit(emp)
})

// — Detail: delete —
btnDeleteDetail.addEventListener('click', () => {
  openDeleteModal(state.selectedId)
})

// — Form: back / cancel —
btnBackForm.addEventListener('click', () => {
  renderTable()
  showView('list')
})
btnCancelForm.addEventListener('click', () => {
  renderTable()
  showView('list')
})

// — Form: toggle label sync —
fieldStatus.addEventListener('change', () => {
  toggleLabel.textContent = fieldStatus.checked ? 'Activo' : 'Inactivo'
})

// — Form: inline error clear on input —
const errorFields = ['field-name', 'field-email', 'field-position', 'field-department']
errorFields.forEach(id => {
  const el = $(id)
  if (!el) return
  el.addEventListener('input', () => {
    el.classList.remove('is-invalid')
    const errKey = id.replace('field-', '')
    const err = $(`err-${errKey}`)
    if (err) err.textContent = ''
  })
})

// — Form: submit —
employeeForm.addEventListener('submit', e => {
  e.preventDefault()
  if (!validateForm()) return

  const data = {
    name:       fieldName.value.trim(),
    email:      fieldEmail.value.trim(),
    phone:      fieldPhone.value.trim(),
    position:   fieldPosition.value.trim(),
    department: fieldDepartment.value,
    startDate:  fieldStartDate.value,
    location:   fieldLocation.value.trim(),
    active:     fieldStatus.checked,
  }

  const isEdit = Boolean(fieldId.value)

  if (isEdit) {
    const updated = updateEmployee(Number(fieldId.value), data)
    if (updated) {
      showToast(`${updated.name} actualizado correctamente.`, 'success')
      renderDetail(updated)
      state.selectedId = updated.id
      renderTable()
      showView('detail')
    }
  } else {
    const emp = createEmployee(data)
    showToast(`${emp.name} agregado al directorio.`, 'success')
    renderTable()
    showView('list')
  }
})

// — Modal: cancel —
btnCancelDelete.addEventListener('click', closeDeleteModal)

// — Modal: close on overlay click —
modalConfirm.addEventListener('click', e => {
  if (e.target === modalConfirm) closeDeleteModal()
})

// — Modal: close on Escape —
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modalConfirm.hasAttribute('hidden')) closeDeleteModal()
})

// — Modal: confirm delete —
btnConfirmDelete.addEventListener('click', () => {
  const id  = state.pendingDeleteId
  const emp = getEmployee(id)
  if (!emp) { closeDeleteModal(); return }

  const name = emp.name
  deleteEmployee(id)
  closeDeleteModal()
  showToast(`${name} eliminado del directorio.`, 'info')

  // If we were on the detail view, go back to list
  if (state.currentView === 'detail') {
    state.selectedId = null
  }

  renderTable()
  showView('list')
})

// ─────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────

function init() {
  computeNextId()
  renderTable()
  showView('list')
}

init()
