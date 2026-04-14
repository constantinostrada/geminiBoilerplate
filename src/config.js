import dotenv from 'dotenv'
dotenv.config()

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'supersecret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin1234',
}
