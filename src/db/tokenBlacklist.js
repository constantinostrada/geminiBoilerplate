'use strict'

/**
 * In-memory token blacklist used to invalidate JWTs on logout.
 * Tokens are stored with their expiry timestamp so the set can
 * be pruned periodically and never grows unbounded.
 */

/** @type {Map<string, number>} token → expiry epoch (ms) */
const blacklist = new Map()

/**
 * Add a token to the blacklist until it naturally expires.
 * @param {string} token - Raw JWT string
 * @param {number} exp   - Token expiry as a Unix timestamp (seconds)
 */
const add = (token, exp) => {
  blacklist.set(token, exp * 1000)
}

/**
 * Check whether a token has been revoked.
 * @param {string} token
 * @returns {boolean}
 */
const has = (token) => blacklist.has(token)

/**
 * Remove all tokens that have already expired naturally.
 * Call this on a schedule to prevent unbounded memory growth.
 */
const prune = () => {
  const now = Date.now()
  for (const [token, expiryMs] of blacklist) {
    if (now >= expiryMs) blacklist.delete(token)
  }
}

/**
 * Remove every entry from the blacklist.
 * Intended for use in tests only — do not call in production code.
 */
const _clearAll = () => blacklist.clear()

module.exports = { add, has, prune, _clearAll }
