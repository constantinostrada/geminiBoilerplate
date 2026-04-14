import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { store } from '../db/store.js'
import { config } from '../config.js'
import { addToBlacklist } from '../db/tokenBlacklist.js'
import { authenticate } from '../middleware/authenticate.js'

const router = Router()

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' })
  }

  const user = store.users.get(username)
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign({ sub: user.id, username: user.username }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  })

  return res.status(200).json({ token })
})

// POST /api/auth/logout
router.post('/logout', authenticate, (req, res) => {
  const token = req.headers['authorization'].slice(7)
  const decoded = jwt.decode(token)
  const expiresAt = decoded.exp ? decoded.exp * 1000 : Date.now() + 8 * 60 * 60 * 1000
  addToBlacklist(token, expiresAt)
  return res.status(200).json({ message: 'Logged out successfully' })
})

export default router
