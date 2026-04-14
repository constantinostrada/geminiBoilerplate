'use strict'

const express = require('express')
const authenticate = require('../middleware/authenticate')
const authRouter = require('./auth')

const router = express.Router()

// Public routes — no authentication required
router.use('/auth', authRouter)

// Everything below this line is protected
router.use(authenticate)

/**
 * GET /api/ping
 * Simple health-check for authenticated clients.
 */
router.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong', user: req.user.username })
})

module.exports = router
