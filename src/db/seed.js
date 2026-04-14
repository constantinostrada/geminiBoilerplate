'use strict'

const bcrypt = require('bcryptjs')
const config = require('../config')

/**
 * In-memory user store seeded with a default admin account.
 * The password is hashed at startup so the plain-text value
 * is never kept in memory after the module is loaded.
 */
const SALT_ROUNDS = 10

const users = [
  {
    id: 1,
    username: config.admin.username,
    // Synchronous hash is acceptable here because it runs once at startup.
    passwordHash: bcrypt.hashSync(config.admin.password, SALT_ROUNDS),
    role: 'admin',
  },
]

/**
 * Find a user by username.
 * @param {string} username
 * @returns {object|undefined}
 */
const findByUsername = (username) =>
  users.find((u) => u.username === username)

module.exports = { users, findByUsername }
