// In-memory token blacklist with expiry-based pruning
const blacklist = new Map()

export function addToBlacklist(token, expiresAt) {
  blacklist.set(token, expiresAt)
}

export function isBlacklisted(token) {
  return blacklist.has(token)
}

// Prune expired tokens every hour
setInterval(() => {
  const now = Date.now()
  for (const [token, expiresAt] of blacklist.entries()) {
    if (expiresAt < now) {
      blacklist.delete(token)
    }
  }
}, 60 * 60 * 1000)
