import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { isBlacklisted } from '../db/tokenBlacklist.js'

export function authenticate(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.slice(7)

  if (isBlacklisted(token)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret)
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}
