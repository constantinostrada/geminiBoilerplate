console.log('geminiBoiler is running!')

// ── Counter ────────────────────────────────────────────────────────────────

const counterValueEl = document.getElementById('counter-value')
const btnDecrement   = document.getElementById('btn-decrement')
const btnReset       = document.getElementById('btn-reset')
const btnIncrement   = document.getElementById('btn-increment')

let count = 0

function renderCount() {
  counterValueEl.textContent = count
  counterValueEl.classList.toggle('counter__value--negative', count < 0)
}

function increment() {
  count += 1
  renderCount()
}

function decrement() {
  count -= 1
  renderCount()
}

function reset() {
  count = 0
  renderCount()
}

btnIncrement.addEventListener('click', increment)
btnDecrement.addEventListener('click', decrement)
btnReset.addEventListener('click', reset)
