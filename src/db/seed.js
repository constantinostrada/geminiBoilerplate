import bcrypt from 'bcryptjs'
import { store } from './store.js'
import { config } from '../config.js'

export async function seed() {
  const hashedPassword = await bcrypt.hash(config.adminPassword, 10)
  store.users.set('admin', {
    id: 'admin',
    username: config.adminUsername,
    password: hashedPassword,
  })
}
