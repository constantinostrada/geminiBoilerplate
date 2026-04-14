import bcrypt from 'bcryptjs'
import { config } from '../config.js'

const hashedPassword = bcrypt.hashSync(config.adminPassword, 10)

export const adminUser = {
  id: 'admin-001',
  username: config.adminUsername,
  password: hashedPassword,
}
