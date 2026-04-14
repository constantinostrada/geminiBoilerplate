'use strict'

const jwt = require('jsonwebtoken')
const config = require('../config')
const blacklist = require('../db/tokenBlacklist')

/**
 * Express middleware that protects API routes.
 *
 * Expects the client to send the JWT in the Authorization header:
 *   Authorization: Bearer <token>
 *
 * Returns 401 if:
 *   - The header is missing or malformed
 *   - The token is invalid / expired
 *   - The token has been revoked (logged out)
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'] || ''
  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res
      .status(401)
      .json({ error: 'Authorization header missing or malformed' })
  }

  if (blacklist.has(token)) {
    return res.status(401).json({ error: 'Token has been revoked' })
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret)
    req.user = payload
    req.token = token
    return next()
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
    return res.status(401).json({ error: message })
  }
}

module.exports = authenticate
