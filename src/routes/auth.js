'use strict'

const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const { findByUsername } = require('../db/seed')
const blacklist = require('../db/tokenBlacklist')
const authenticate = require('../middleware/authenticate')

const router = express.Router()

/**
 * POST /api/auth/login
 *
 * Body: { username, password }
 * Returns 200 + { token } on success.
 * Returns 400 for missing fields, 401 for wrong credentials.
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {}

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: 'username and password are required' })
  }

  const user = findByUsername(username)
  if (!user) {
    // Use the same message to avoid username enumeration
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const payload = { sub: user.id, username: user.username, role: user.role }
  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  })

  return res.status(200).json({ token })
})

/**
 * POST /api/auth/logout
 *
 * Requires a valid Bearer token.
 * Revokes the token by adding it to the blacklist.
 * Returns 200 on success.
 */
router.post('/logout', authenticate, (req, res) => {
  blacklist.add(req.token, req.user.exp)
  return res.status(200).json({ message: 'Logged out successfully' })
})

module.exports = router
