import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { config } from '../config.js'
import { adminUser } from '../db/seed.js'
import { addToken } from '../db/tokenBlacklist.js'
import { authenticate } from '../middleware/authenticate.js'

const router = Router()

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  if (username !== adminUser.username) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const valid = bcrypt.compareSync(password, adminUser.password)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign(
    { id: adminUser.id, username: adminUser.username },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  )

  return res.status(200).json({ token })
})

// POST /api/auth/logout
router.post('/logout', authenticate, (req, res) => {
  const decoded = jwt.decode(req.token)
  const expiresAt = decoded.exp ? decoded.exp * 1000 : Date.now() + 8 * 60 * 60 * 1000
  addToken(req.token, expiresAt)
  return res.status(200).json({ message: 'Logged out successfully' })
})

export default router
