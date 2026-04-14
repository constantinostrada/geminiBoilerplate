'use strict'

const app = require('./app')
const config = require('./config')
const blacklist = require('./db/tokenBlacklist')

const { port } = config

// Prune expired tokens from the blacklist every hour
setInterval(blacklist.prune, 60 * 60 * 1000)

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})
