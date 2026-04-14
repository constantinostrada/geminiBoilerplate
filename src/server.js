import app from './app.js'
import { config } from './config.js'
import { seed } from './db/seed.js'

seed().then(() => {
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`)
  })
})
