'use strict'

require('dotenv').config()

const config = {
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_to_a_long_random_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin1234',
  },
}

module.exports = config
