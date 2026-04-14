// In-memory token blacklist with expiry-based pruning
const blacklist = new Map()

const PRUNE_INTERVAL_MS = 60 * 60 * 1000 // 1 hour

export function addToBlacklist(token, expiresAt) {
  blacklist.set(token, expiresAt)
}

export function isBlacklisted(token) {
  return blacklist.has(token)
}

function pruneExpired() {
  const now = Date.now()
  for (const [token, expiresAt] of blacklist.entries()) {
    if (expiresAt <= now) {
      blacklist.delete(token)
    }
  }
}

// Prune every hour
const pruneInterval = setInterval(pruneExpired, PRUNE_INTERVAL_MS)

// Allow tests to clean up
export function stopPruning() {
  clearInterval(pruneInterval)
}
