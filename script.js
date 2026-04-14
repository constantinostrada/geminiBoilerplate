// ─── Auth mock ───────────────────────────────────────────────
// Simulates an async auth call (replace with real API later)
const DEMO_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'password123',
}

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{name: string, email: string}>}
 */
function mockLogin(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (
        email.toLowerCase() === DEMO_CREDENTIALS.email &&
        password === DEMO_CREDENTIALS.password
      ) {
        resolve({ name: 'Admin User', email })
      } else {
        reject(new Error('Invalid email or password. Please try again.'))
      }
    }, 900)
  })
}

// ─── State ───────────────────────────────────────────────────
const state = {
  /** @type {{name: string, email: string} | null} */
  user: null,
  activeSection: 'dashboard',
}

// ─── DOM refs ────────────────────────────────────────────────
const loginScreen   = /** @type {HTMLElement} */ (document.getElementById('login-screen'))
const appShell      = /** @type {HTMLElement} */ (document.getElementById('app-shell'))
const loginForm     = /** @type {HTMLFormElement} */ (document.getElementById('login-form'))
const emailInput    = /** @type {HTMLInputElement} */ (document.getElementById('email'))
const passwordInput = /** @type {HTMLInputElement} */ (document.getElementById('password'))
const emailError    = /** @type {HTMLElement} */ (document.getElementById('email-error'))
const passwordError = /** @type {HTMLElement} */ (document.getElementById('password-error'))
const authError     = /** @type {HTMLElement} */ (document.getElementById('auth-error'))
const authErrorMsg  = /** @type {HTMLElement} */ (document.getElementById('auth-error-message'))
const loginBtn      = /** @type {HTMLButtonElement} */ (document.getElementById('login-btn'))
const loginBtnLabel = /** @type {HTMLElement} */ (document.getElementById('login-btn-label'))
const loginBtnSpinner = /** @type {HTMLElement} */ (document.getElementById('login-btn-spinner'))
const togglePasswordBtn = /** @type {HTMLButtonElement} */ (document.getElementById('toggle-password'))

const logoutBtn     = /** @type {HTMLButtonElement} */ (document.getElementById('logout-btn'))
const userNameEl    = /** @type {HTMLElement} */ (document.getElementById('user-name'))
const userAvatarEl  = /** @type {HTMLElement} */ (document.getElementById('user-avatar'))
const topbarAvatar  = /** @type {HTMLElement} */ (document.getElementById('topbar-avatar'))
const topbarTitle   = /** @type {HTMLElement} */ (document.getElementById('topbar-title'))
const navItems      = /** @type {NodeListOf<HTMLAnchorElement>} */ (document.querySelectorAll('.nav-item'))
const sections      = /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.section'))
const sidebar       = /** @type {HTMLElement} */ (document.getElementById('sidebar'))
const sidebarOverlay = /** @type {HTMLElement} */ (document.getElementById('sidebar-overlay'))
const menuToggle    = /** @type {HTMLButtonElement} */ (document.getElementById('menu-toggle'))

// ─── Helpers ─────────────────────────────────────────────────
function getInitials(name) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function setLoading(loading) {
  loginBtn.disabled = loading
  loginBtnLabel.textContent = loading ? 'Signing in…' : 'Sign in'
  loginBtnSpinner.hidden = !loading
}

function clearFieldError(input, errorEl) {
  input.classList.remove('is-invalid')
  errorEl.textContent = ''
}

function setFieldError(input, errorEl, message) {
  input.classList.add('is-invalid')
  errorEl.textContent = message
}

function showAuthError(message) {
  authErrorMsg.textContent = message
  authError.hidden = false
}

function hideAuthError() {
  authError.hidden = true
  authErrorMsg.textContent = ''
}

// ─── Login form validation ────────────────────────────────────
function validateForm() {
  let valid = true

  const email = emailInput.value.trim()
  const password = passwordInput.value

  clearFieldError(emailInput, emailError)
  clearFieldError(passwordInput, passwordError)

  if (!email) {
    setFieldError(emailInput, emailError, 'Email is required.')
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError(emailInput, emailError, 'Please enter a valid email address.')
    valid = false
  }

  if (!password) {
    setFieldError(passwordInput, passwordError, 'Password is required.')
    valid = false
  } else if (password.length < 6) {
    setFieldError(passwordInput, passwordError, 'Password must be at least 6 characters.')
    valid = false
  }

  return valid
}

// ─── Show / hide screens ──────────────────────────────────────
function showApp(user) {
  // Populate user info
  userNameEl.textContent = user.name
  const initials = getInitials(user.name)
  userAvatarEl.textContent = initials
  topbarAvatar.textContent = initials

  loginScreen.hidden = true
  appShell.hidden = false

  navigateTo('dashboard')
}

function showLogin() {
  appShell.hidden = true
  loginScreen.hidden = false
  loginForm.reset()
  hideAuthError()
  clearFieldError(emailInput, emailError)
  clearFieldError(passwordInput, passwordError)
  emailInput.focus()
}

// ─── Navigation ───────────────────────────────────────────────
function navigateTo(sectionId) {
  state.activeSection = sectionId

  // Update nav items
  navItems.forEach(item => {
    const isActive = item.dataset.section === sectionId
    item.classList.toggle('active', isActive)
  })

  // Update sections
  sections.forEach(section => {
    section.classList.toggle('active', section.id === `section-${sectionId}`)
  })

  // Update topbar title
  const activeItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`)
  if (activeItem) {
    topbarTitle.textContent = activeItem.textContent.trim()
  }

  // Close sidebar on mobile
  closeSidebar()
}

// ─── Sidebar (mobile) ─────────────────────────────────────────
function openSidebar() {
  sidebar.classList.add('open')
  sidebarOverlay.classList.add('visible')
  sidebarOverlay.style.display = 'block'
  document.body.style.overflow = 'hidden'
}

function closeSidebar() {
  sidebar.classList.remove('open')
  sidebarOverlay.classList.remove('visible')
  document.body.style.overflow = ''
  // Hide overlay after transition
  setTimeout(() => {
    if (!sidebar.classList.contains('open')) {
      sidebarOverlay.style.display = ''
    }
  }, 200)
}

// ─── Event listeners ──────────────────────────────────────────

// Clear field errors on input
emailInput.addEventListener('input', () => {
  clearFieldError(emailInput, emailError)
  hideAuthError()
})
passwordInput.addEventListener('input', () => {
  clearFieldError(passwordInput, passwordError)
  hideAuthError()
})

// Toggle password visibility
togglePasswordBtn.addEventListener('click', () => {
  const isText = passwordInput.type === 'text'
  passwordInput.type = isText ? 'password' : 'text'
  togglePasswordBtn.setAttribute('aria-label', isText ? 'Show password' : 'Hide password')
})

// Login form submit
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  hideAuthError()

  if (!validateForm()) return

  const email = emailInput.value.trim()
  const password = passwordInput.value

  setLoading(true)
  try {
    const user = await mockLogin(email, password)
    state.user = user
    showApp(user)
  } catch (err) {
    showAuthError(err.message)
    passwordInput.value = ''
    passwordInput.focus()
  } finally {
    setLoading(false)
  }
})

// Navigation items
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault()
    const section = item.dataset.section
    if (section) navigateTo(section)
  })
})

// Logout
logoutBtn.addEventListener('click', () => {
  state.user = null
  showLogin()
})

// Mobile sidebar toggle
menuToggle.addEventListener('click', () => {
  if (sidebar.classList.contains('open')) {
    closeSidebar()
  } else {
    openSidebar()
  }
})

// Close sidebar via overlay
sidebarOverlay.addEventListener('click', closeSidebar)

// Keyboard: close sidebar with Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sidebar.classList.contains('open')) {
    closeSidebar()
  }
})

// ─── Init ─────────────────────────────────────────────────────
// Start at login screen (app-shell is hidden via HTML attribute)
emailInput.focus()
