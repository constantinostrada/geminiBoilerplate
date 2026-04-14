import express from 'express'
import apiRouter from './routes/index.js'

const app = express()

app.use(express.json())

app.use('/api', apiRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
