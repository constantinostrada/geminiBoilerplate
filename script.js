// ── Gaston stats ───────────────────────────────────────────────────────────────

const STATS = [
  { value: '5 dozen', label: 'Eggs every morning' },
  { value: '4', label: 'Dozen big brother-sized meals' },
  { value: '#1', label: 'Best in the village' },
  { value: '∞', label: 'Pride in himself' },
  { value: '6', label: 'Dozen eggs on a good day' },
  { value: '0', label: 'Rivals to speak of' },
]

const QUOTES = [
  'No one hits like Gaston, matches wits like Gaston!',
  "Every last inch of me's covered in hair!",
  'I use antlers in all of my decorating!',
  'I need six eggs — no, make it seven!',
  "As a specimen, yes, I'm intimidating!",
  'Gaston is the best and the rest is all drips!',
  'No one fights like Gaston, douses lights like Gaston!',
  'My what a guy — Gaston!',
  'I'm especially good at expectorating!',
  'Here in town there's only she who is beautiful as me!',
]

const GOAL_MESSAGES = [
  { threshold: 0, message: '' },
  { threshold: 1, message: 'A fine start. Keep going.' },
  { threshold: 30, message: 'Getting there... Gaston would not be impressed yet.' },
  { threshold: 60, message: "Five dozen! Gaston's morning minimum — well done!" },
  { threshold: 72, message: "Six dozen! Now THAT is a good day." },
  { threshold: 84, message: "Seven dozen?! You might be Gaston himself!" },
]

// ── Render stat cards ──────────────────────────────────────────────────────────

function renderStats() {
  const grid = document.getElementById('statsGrid')
  if (!grid) return

  grid.innerHTML = STATS.map(
    ({ value, label }) => `
    <div class="stat-card">
      <span class="stat-card__value">${value}</span>
      <span class="stat-card__label">${label}</span>
    </div>`
  ).join('')
}

// ── Egg counter ────────────────────────────────────────────────────────────────

function getGoalMessage(count) {
  let message = ''
  for (const entry of GOAL_MESSAGES) {
    if (count >= entry.threshold) {
      message = entry.message
    }
  }
  return message
}

function initCounter() {
  const countEl = document.getElementById('eggCount')
  const goalEl = document.getElementById('eggGoal')
  const btnPlus = document.getElementById('btnPlus')
  const btnMinus = document.getElementById('btnMinus')

  if (!countEl || !goalEl || !btnPlus || !btnMinus) return

  let count = 0

  function updateDisplay() {
    countEl.textContent = count
    goalEl.textContent = getGoalMessage(count)
  }

  btnPlus.addEventListener('click', () => {
    count += 1
    updateDisplay()
  })

  btnMinus.addEventListener('click', () => {
    if (count > 0) {
      count -= 1
      updateDisplay()
    }
  })

  updateDisplay()
}

// ── Random quote ───────────────────────────────────────────────────────────────

function getRandomQuote(currentText) {
  const available = QUOTES.filter((q) => q !== currentText)
  const pool = available.length > 0 ? available : QUOTES
  return pool[Math.floor(Math.random() * pool.length)]
}

function initQuotes() {
  const quoteBlock = document.getElementById('quoteBlock')
  const quoteText = document.getElementById('quoteText')
  const newQuoteBtn = document.getElementById('newQuoteBtn')

  if (!quoteBlock || !quoteText || !newQuoteBtn) return

  function showQuote(text) {
    quoteBlock.style.opacity = '0'
    setTimeout(() => {
      quoteText.textContent = `"${text}"`
      quoteBlock.style.opacity = '1'
    }, 150)
  }

  showQuote(getRandomQuote(''))

  newQuoteBtn.addEventListener('click', () => {
    showQuote(getRandomQuote(quoteText.textContent.replace(/^"|"$/g, '')))
  })
}

// ── Footer year ────────────────────────────────────────────────────────────────

function setYear() {
  const yearEl = document.getElementById('year')
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear()
  }
}

// ── Init ───────────────────────────────────────────────────────────────────────

renderStats()
initCounter()
initQuotes()
setYear()
