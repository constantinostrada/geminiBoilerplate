// ============================================================
// DATA — seed data
// ============================================================

const EMPLOYEES = [
  { id: 'emp-1', name: 'Ana García',      dept: 'Ingeniería',   initials: 'AG', color: '#4f6ef7' },
  { id: 'emp-2', name: 'Carlos López',    dept: 'Marketing',    initials: 'CL', color: '#22c55e' },
  { id: 'emp-3', name: 'María Fernández', dept: 'RRHH',         initials: 'MF', color: '#f59e0b' },
  { id: 'emp-4', name: 'Pedro Sánchez',   dept: 'Finanzas',     initials: 'PS', color: '#ef4444' },
  { id: 'emp-5', name: 'Laura Martínez',  dept: 'Diseño',       initials: 'LM', color: '#6366f1' },
  { id: 'emp-6', name: 'David Ruiz',      dept: 'Ingeniería',   initials: 'DR', color: '#0ea5e9' },
  { id: 'emp-7', name: 'Sofía Torres',    dept: 'Producto',     initials: 'ST', color: '#ec4899' },
  { id: 'emp-8', name: 'Miguel Díaz',     dept: 'Ventas',       initials: 'MD', color: '#14b8a6' },
]

/** @type {Equipment[]} */
let equipment = [
  {
    id: 'eq-1',
    type: 'Laptop',
    brand: 'Apple',
    model: 'MacBook Pro 14',
    serial: 'SN-MBP-0001',
    status: 'asignado',
    assignedTo: 'emp-1',
    notes: '',
  },
  {
    id: 'eq-2',
    type: 'Monitor',
    brand: 'Dell',
    model: 'UltraSharp 27"',
    serial: 'SN-DEL-0042',
    status: 'asignado',
    assignedTo: 'emp-1',
    notes: 'Resolución 4K',
  },
  {
    id: 'eq-3',
    type: 'Laptop',
    brand: 'Lenovo',
    model: 'ThinkPad X1 Carbon',
    serial: 'SN-LEN-0017',
    status: 'disponible',
    assignedTo: null,
    notes: '',
  },
  {
    id: 'eq-4',
    type: 'Teclado',
    brand: 'Logitech',
    model: 'MX Keys',
    serial: 'SN-LOG-0088',
    status: 'asignado',
    assignedTo: 'emp-2',
    notes: '',
  },
  {
    id: 'eq-5',
    type: 'Ratón',
    brand: 'Logitech',
    model: 'MX Master 3',
    serial: 'SN-LOG-0089',
    status: 'disponible',
    assignedTo: null,
    notes: '',
  },
  {
    id: 'eq-6',
    type: 'Desktop',
    brand: 'Apple',
    model: 'Mac Mini M2',
    serial: 'SN-MCM-0005',
    status: 'mantenimiento',
    assignedTo: null,
    notes: 'Revisión de memoria RAM',
  },
  {
    id: 'eq-7',
    type: 'Auriculares',
    brand: 'Sony',
    model: 'WH-1000XM5',
    serial: 'SN-SNY-0033',
    status: 'asignado',
    assignedTo: 'emp-5',
    notes: '',
  },
  {
    id: 'eq-8',
    type: 'Tablet',
    brand: 'Apple',
    model: 'iPad Pro 12.9"',
    serial: 'SN-IPD-0014',
    status: 'disponible',
    assignedTo: null,
    notes: '',
  },
]

/**
 * @typedef {{ id:string, equipmentId:string, employeeId:string|null,
 *             action:'assign'|'unassign', date:string }} HistoryEntry
 * @type {HistoryEntry[]}
 */
let history = [
  { id: 'h-1', equipmentId: 'eq-1', employeeId: 'emp-3', action: 'assign',   date: '2024-01-10T09:00:00' },
  { id: 'h-2', equipmentId: 'eq-1', employeeId: 'emp-3', action: 'unassign', date: '2024-02-28T17:30:00' },
  { id: 'h-3', equipmentId: 'eq-1', employeeId: 'emp-1', action: 'assign',   date: '2024-03-01T10:00:00' },
  { id: 'h-4', equipmentId: 'eq-4', employeeId: 'emp-6', action: 'assign',   date: '2024-01-15T11:00:00' },
  { id: 'h-5', equipmentId: 'eq-4', employeeId: 'emp-6', action: 'unassign', date: '2024-03-10T16:00:00' },
  { id: 'h-6', equipmentId: 'eq-4', employeeId: 'emp-2', action: 'assign',   date: '2024-03-11T09:30:00' },
  { id: 'h-7', equipmentId: 'eq-7', employeeId: 'emp-5', action: 'assign',   date: '2024-02-20T14:00:00' },
]

// ============================================================
// STATE
// ============================================================

let activeFilter = 'all'
let searchQuery = ''
let pendingUnassignId = null
let pendingAssignId = null

// ============================================================
// HELPERS
// ============================================================

function uid() {
  return 'id-' + Math.random().toString(36).slice(2, 9)
}

function getEmployee(id) {
  return EMPLOYEES.find((e) => e.id === id) || null
}

function getEquipment(id) {
  return equipment.find((e) => e.id === id) || null
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

const TYPE_ICONS = {
  Laptop:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
  Desktop:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
  Monitor:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
  Teclado:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M6 16h12"/></svg>`,
  Ratón:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2a6 6 0 0 0-6 6v8a6 6 0 0 0 12 0V8a6 6 0 0 0-6-6z"/><line x1="12" y1="2" x2="12" y2="10"/></svg>`,
  Auriculares: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`,
  Teléfono:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1"/></svg>`,
  Tablet:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="17" r="1"/></svg>`,
  Impresora:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
  Otro:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>`,
}

function getTypeIcon(type) {
  return TYPE_ICONS[type] || TYPE_ICONS['Otro']
}

const STATUS_LABELS = {
  disponible:    'Disponible',
  asignado:      'Asignado',
  mantenimiento: 'Mantenimiento',
}

const STATUS_CLASSES = {
  disponible:    'badge-available',
  asignado:      'badge-assigned',
  mantenimiento: 'badge-maintenance',
}

// ============================================================
// RENDER TABLE
// ============================================================

function filteredEquipment() {
  return equipment.filter((eq) => {
    const matchFilter =
      activeFilter === 'all' || eq.status === activeFilter

    const q = searchQuery.toLowerCase()
    const matchSearch =
      !q ||
      eq.type.toLowerCase().includes(q) ||
      eq.brand.toLowerCase().includes(q) ||
      eq.model.toLowerCase().includes(q) ||
      eq.serial.toLowerCase().includes(q) ||
      (eq.assignedTo
        ? (getEmployee(eq.assignedTo)?.name || '').toLowerCase().includes(q)
        : false)

    return matchFilter && matchSearch
  })
}

function renderTable() {
  const tbody = document.getElementById('equipment-tbody')
  const emptyState = document.getElementById('empty-state')
  const table = document.getElementById('equipment-table')

  const rows = filteredEquipment()

  if (rows.length === 0) {
    tbody.innerHTML = ''
    table.style.display = 'none'
    emptyState.hidden = false
  } else {
    table.style.display = ''
    emptyState.hidden = true
    tbody.innerHTML = rows.map(rowHTML).join('')
    attachRowEvents()
  }

  renderStats()
}

function rowHTML(eq) {
  const employee = eq.assignedTo ? getEmployee(eq.assignedTo) : null

  const typeCell = `
    <div class="cell-type">
      <div class="type-icon">${getTypeIcon(eq.type)}</div>
      <span class="cell-type-label">${esc(eq.type)}</span>
    </div>`

  const brandCell = `
    <div>
      <div class="cell-brand">${esc(eq.brand)}</div>
      <div class="cell-model">${esc(eq.model)}</div>
    </div>`

  const serialCell = `<span class="cell-serial">${esc(eq.serial)}</span>`

  const statusCell = `<span class="badge ${STATUS_CLASSES[eq.status]}">${STATUS_LABELS[eq.status]}</span>`

  const assigneeCell = employee
    ? `<div class="cell-assignee">
        <div class="assignee-avatar" style="background:${employee.color}">${esc(employee.initials)}</div>
        <div>
          <div class="assignee-name">${esc(employee.name)}</div>
          <div class="assignee-dept">${esc(employee.dept)}</div>
        </div>
      </div>`
    : `<span class="no-assignee">Sin asignar</span>`

  const assignBtn =
    eq.status !== 'mantenimiento' && !eq.assignedTo
      ? `<button class="btn-icon btn-icon--assign" data-action="assign" data-id="${eq.id}" data-tooltip="Asignar empleado">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </button>`
      : ''

  const unassignBtn = eq.assignedTo
    ? `<button class="btn-icon btn-icon--unassign" data-action="unassign" data-id="${eq.id}" data-tooltip="Desasignar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
      </button>`
    : ''

  const historyBtn = `
    <button class="btn-icon btn-icon--history" data-action="history" data-id="${eq.id}" data-tooltip="Historial">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    </button>`

  const editBtn = `
    <button class="btn-icon btn-icon--edit" data-action="edit" data-id="${eq.id}" data-tooltip="Editar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    </button>`

  return `
    <tr data-eq-id="${eq.id}">
      <td>${typeCell}</td>
      <td>${brandCell}</td>
      <td>${serialCell}</td>
      <td>${statusCell}</td>
      <td>${assigneeCell}</td>
      <td class="col-actions">
        <div class="actions-cell">
          ${assignBtn}
          ${unassignBtn}
          ${historyBtn}
          ${editBtn}
        </div>
      </td>
    </tr>`
}

function attachRowEvents() {
  document.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action
      const id = btn.dataset.id
      if (action === 'assign')   openAssignModal(id)
      if (action === 'unassign') openConfirmUnassign(id)
      if (action === 'history')  openHistoryModal(id)
      if (action === 'edit')     openEditModal(id)
    })
  })
}

// ============================================================
// STATS
// ============================================================

function renderStats() {
  document.getElementById('stat-total').textContent       = equipment.length
  document.getElementById('stat-available').textContent   = equipment.filter((e) => e.status === 'disponible').length
  document.getElementById('stat-assigned').textContent    = equipment.filter((e) => e.status === 'asignado').length
  document.getElementById('stat-maintenance').textContent = equipment.filter((e) => e.status === 'mantenimiento').length

  document.querySelectorAll('.stat-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.filter === activeFilter)
  })
}

// ============================================================
// FILTER TABS
// ============================================================

function initFilterTabs() {
  document.getElementById('filter-tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab')
    if (!tab) return
    activeFilter = tab.dataset.filter
    document.querySelectorAll('.filter-tab').forEach((t) => t.classList.remove('active'))
    tab.classList.add('active')
    renderTable()
  })

  document.getElementById('stats-bar').addEventListener('click', (e) => {
    const card = e.target.closest('.stat-card')
    if (!card) return
    activeFilter = card.dataset.filter
    document.querySelectorAll('.filter-tab').forEach((t) =>
      t.classList.toggle('active', t.dataset.filter === activeFilter)
    )
    renderTable()
  })
}

// ============================================================
// SEARCH
// ============================================================

function initSearch() {
  document.getElementById('search-input').addEventListener('input', (e) => {
    searchQuery = e.target.value.trim()
    renderTable()
  })
}

// ============================================================
// MODAL HELPERS
// ============================================================

function openModal(id) {
  const el = document.getElementById(id)
  el.hidden = false
  // Focus first focusable element
  const focusable = el.querySelector('button, input, select, textarea')
  if (focusable) setTimeout(() => focusable.focus(), 60)
}

function closeModal(id) {
  const el = document.getElementById(id)
  el.hidden = true
}

function initModalClose() {
  document.addEventListener('click', (e) => {
    // Close button
    const closeBtn = e.target.closest('[data-close]')
    if (closeBtn) {
      closeModal(closeBtn.dataset.close)
      return
    }
    // Backdrop click
    if (e.target.classList.contains('modal-backdrop')) {
      closeModal(e.target.id)
    }
  })

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return
    document.querySelectorAll('.modal-backdrop:not([hidden])').forEach((m) =>
      closeModal(m.id)
    )
  })
}

// ============================================================
// EQUIPMENT FORM — New / Edit
// ============================================================

function openNewModal() {
  document.getElementById('modal-equipment-title').textContent = 'Nuevo equipo'
  document.getElementById('btn-save-equipment').textContent = 'Guardar equipo'
  document.getElementById('form-equipment').reset()
  document.getElementById('eq-id').value = ''
  clearFormErrors()
  openModal('modal-equipment')
}

function openEditModal(id) {
  const eq = getEquipment(id)
  if (!eq) return

  document.getElementById('modal-equipment-title').textContent = 'Editar equipo'
  document.getElementById('btn-save-equipment').textContent = 'Guardar cambios'
  document.getElementById('eq-id').value = eq.id
  document.getElementById('eq-type').value = eq.type
  document.getElementById('eq-brand').value = eq.brand
  document.getElementById('eq-model').value = eq.model
  document.getElementById('eq-serial').value = eq.serial
  document.getElementById('eq-status').value =
    eq.status === 'asignado' ? 'disponible' : eq.status  // can't set to "asignado" via form
  document.getElementById('eq-notes').value = eq.notes || ''
  clearFormErrors()
  openModal('modal-equipment')
}

function clearFormErrors() {
  document.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''))
  document.querySelectorAll('#form-equipment .invalid').forEach((el) =>
    el.classList.remove('invalid')
  )
}

function validateEquipmentForm() {
  let valid = true

  const fields = [
    { id: 'eq-type',   errId: 'err-eq-type',   label: 'El tipo es obligatorio' },
    { id: 'eq-brand',  errId: 'err-eq-brand',  label: 'La marca es obligatoria' },
    { id: 'eq-model',  errId: 'err-eq-model',  label: 'El modelo es obligatorio' },
    { id: 'eq-serial', errId: 'err-eq-serial', label: 'El número de serie es obligatorio' },
    { id: 'eq-status', errId: 'err-eq-status', label: 'El estado es obligatorio' },
  ]

  fields.forEach(({ id, errId, label }) => {
    const el = document.getElementById(id)
    const err = document.getElementById(errId)
    if (!el.value.trim()) {
      el.classList.add('invalid')
      err.textContent = label
      valid = false
    } else {
      el.classList.remove('invalid')
      err.textContent = ''
    }
  })

  // Unique serial check
  const serialEl = document.getElementById('eq-serial')
  const editId   = document.getElementById('eq-id').value
  const serial   = serialEl.value.trim()
  const duplicate = equipment.find(
    (e) => e.serial.toLowerCase() === serial.toLowerCase() && e.id !== editId
  )
  if (duplicate) {
    serialEl.classList.add('invalid')
    document.getElementById('err-eq-serial').textContent = 'El número de serie ya existe'
    valid = false
  }

  return valid
}

function initEquipmentForm() {
  document.getElementById('btn-new-equipment').addEventListener('click', openNewModal)

  document.getElementById('form-equipment').addEventListener('submit', (e) => {
    e.preventDefault()
    if (!validateEquipmentForm()) return

    const editId = document.getElementById('eq-id').value
    const data = {
      type:   document.getElementById('eq-type').value,
      brand:  document.getElementById('eq-brand').value.trim(),
      model:  document.getElementById('eq-model').value.trim(),
      serial: document.getElementById('eq-serial').value.trim(),
      status: document.getElementById('eq-status').value,
      notes:  document.getElementById('eq-notes').value.trim(),
    }

    if (editId) {
      const idx = equipment.findIndex((e) => e.id === editId)
      if (idx !== -1) {
        // Preserve assignment if equipment had one and new status is compatible
        const prev = equipment[idx]
        const keepAssignment = prev.assignedTo && data.status !== 'mantenimiento'
        equipment[idx] = {
          ...prev,
          ...data,
          status:     keepAssignment ? 'asignado' : data.status,
          assignedTo: keepAssignment ? prev.assignedTo : null,
        }
        if (!keepAssignment && prev.assignedTo) {
          recordHistory(editId, prev.assignedTo, 'unassign')
        }
        showToast('Equipo actualizado correctamente', 'success')
      }
    } else {
      const newEq = { id: uid(), ...data, assignedTo: null }
      equipment.push(newEq)
      showToast('Equipo añadido correctamente', 'success')
    }

    closeModal('modal-equipment')
    renderTable()
  })

  // Live validation clearing
  document.querySelectorAll('#form-equipment input, #form-equipment select').forEach((el) => {
    el.addEventListener('input', () => {
      el.classList.remove('invalid')
      const errEl = document.getElementById('err-' + el.id)
      if (errEl) errEl.textContent = ''
    })
  })
}

// ============================================================
// ASSIGN MODAL
// ============================================================

function openAssignModal(equipmentId) {
  pendingAssignId = equipmentId
  const eq = getEquipment(equipmentId)
  document.getElementById('assign-subtitle').textContent =
    `Selecciona el empleado para asignar: ${eq.brand} ${eq.model}`
  document.getElementById('employee-search').value = ''
  renderEmployeeList('')
  openModal('modal-assign')
}

function renderEmployeeList(query) {
  const list = document.getElementById('employee-list')
  const noEmp = document.getElementById('no-employees')
  const q = query.toLowerCase()

  const filtered = EMPLOYEES.filter(
    (emp) =>
      !q ||
      emp.name.toLowerCase().includes(q) ||
      emp.dept.toLowerCase().includes(q)
  )

  if (filtered.length === 0) {
    list.innerHTML = ''
    noEmp.hidden = false
    return
  }

  noEmp.hidden = true
  list.innerHTML = filtered
    .map(
      (emp) => `
      <li class="employee-item" data-emp-id="${emp.id}" role="button" tabindex="0">
        <div class="assignee-avatar" style="background:${emp.color}">${esc(emp.initials)}</div>
        <div class="employee-item-info">
          <div class="employee-item-name">${esc(emp.name)}</div>
          <div class="employee-item-dept">${esc(emp.dept)}</div>
        </div>
        <div class="employee-item-check"></div>
      </li>`
    )
    .join('')

  list.querySelectorAll('.employee-item').forEach((item) => {
    const select = () => doAssign(item.dataset.empId)
    item.addEventListener('click', select)
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select() }
    })
  })
}

function doAssign(employeeId) {
  const eq = getEquipment(pendingAssignId)
  if (!eq) return

  eq.status = 'asignado'
  eq.assignedTo = employeeId
  recordHistory(eq.id, employeeId, 'assign')

  closeModal('modal-assign')
  renderTable()

  const emp = getEmployee(employeeId)
  showToast(`${eq.brand} ${eq.model} asignado a ${emp.name}`, 'success')
  pendingAssignId = null
}

function initAssignSearch() {
  document.getElementById('employee-search').addEventListener('input', (e) => {
    renderEmployeeList(e.target.value.trim())
  })
}

// ============================================================
// UNASSIGN CONFIRM
// ============================================================

function openConfirmUnassign(equipmentId) {
  const eq = getEquipment(equipmentId)
  if (!eq) return
  const emp = getEmployee(eq.assignedTo)
  pendingUnassignId = equipmentId

  document.getElementById('confirm-message').innerHTML =
    `¿Seguro que quieres desasignar <strong>${esc(eq.brand)} ${esc(eq.model)}</strong>` +
    (emp ? ` de <strong>${esc(emp.name)}</strong>` : '') +
    `? El equipo pasará a estado <em>disponible</em>.`

  openModal('modal-confirm')
}

function initConfirmUnassign() {
  document.getElementById('btn-confirm-unassign').addEventListener('click', () => {
    const eq = getEquipment(pendingUnassignId)
    if (!eq) return

    const prevEmployee = eq.assignedTo
    recordHistory(eq.id, prevEmployee, 'unassign')
    eq.assignedTo = null
    eq.status = 'disponible'

    closeModal('modal-confirm')
    renderTable()

    const emp = getEmployee(prevEmployee)
    showToast(
      `${eq.brand} ${eq.model} desasignado` + (emp ? ` de ${emp.name}` : ''),
      'info'
    )
    pendingUnassignId = null
  })
}

// ============================================================
// HISTORY MODAL
// ============================================================

function openHistoryModal(equipmentId) {
  const eq = getEquipment(equipmentId)
  if (!eq) return

  document.getElementById('modal-history-title').textContent = 'Historial de asignaciones'
  document.getElementById('history-device-name').textContent =
    `${eq.type} · ${eq.brand} ${eq.model} · ${eq.serial}`

  const entries = history
    .filter((h) => h.equipmentId === equipmentId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const timeline = document.getElementById('history-timeline')
  const noHistory = document.getElementById('no-history')

  if (entries.length === 0) {
    timeline.innerHTML = ''
    noHistory.hidden = false
  } else {
    noHistory.hidden = true
    timeline.innerHTML = entries
      .map((entry, idx) => {
        const emp = entry.employeeId ? getEmployee(entry.employeeId) : null
        const isCurrent = idx === 0 && entry.action === 'assign' && eq.assignedTo
        const dotClass  = isCurrent ? 'timeline-dot--current' : entry.action === 'assign' ? 'timeline-dot--assign' : 'timeline-dot--unassign'
        const acClass   = isCurrent ? 'timeline-action--current' : entry.action === 'assign' ? 'timeline-action--assign' : 'timeline-action--unassign'
        const acLabel   = isCurrent ? 'Asignado (actual)' : entry.action === 'assign' ? 'Asignado' : 'Desasignado'

        return `
          <div class="timeline-item">
            <div class="timeline-dot ${dotClass}"></div>
            <div class="timeline-header">
              <span class="timeline-action ${acClass}">${acLabel}</span>
              <span class="timeline-date">${formatDate(entry.date)}</span>
            </div>
            ${emp ? `
              <div class="timeline-employee">${esc(emp.name)}</div>
              <div class="timeline-dept">${esc(emp.dept)}</div>` : '<div class="timeline-employee">—</div>'}
          </div>`
      })
      .join('')
  }

  openModal('modal-history')
}

// ============================================================
// HISTORY RECORDING
// ============================================================

function recordHistory(equipmentId, employeeId, action) {
  history.push({
    id: uid(),
    equipmentId,
    employeeId,
    action,
    date: new Date().toISOString(),
  })
}

// ============================================================
// TOAST
// ============================================================

function showToast(message, type = 'info') {
  const icons = {
    success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info:    `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  }

  const toast = document.createElement('div')
  toast.className = `toast toast--${type}`
  toast.innerHTML = (icons[type] || icons.info) + `<span>${esc(message)}</span>`

  const container = document.getElementById('toast-container')
  container.appendChild(toast)

  setTimeout(() => {
    toast.classList.add('toast-fade')
    toast.addEventListener('animationend', () => toast.remove())
  }, 3400)
}

// ============================================================
// ESCAPE HTML
// ============================================================

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// ============================================================
// INIT
// ============================================================

function init() {
  initFilterTabs()
  initSearch()
  initModalClose()
  initEquipmentForm()
  initAssignSearch()
  initConfirmUnassign()
  renderTable()
}

document.addEventListener('DOMContentLoaded', init)
