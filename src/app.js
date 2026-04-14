'use strict'

const express = require('express')
const apiRouter = require('./routes')

const app = express()

app.use(express.json())

// Mount all API routes under /api
app.use('/api', apiRouter)

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Generic error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

module.exports = app
