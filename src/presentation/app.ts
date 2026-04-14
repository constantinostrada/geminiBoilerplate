import express, { Application, Request, Response } from 'express'
import apiRoutes from './routes/index'
import { errorHandler } from './middlewares/errorHandler'
import { notFound } from './middlewares/notFound'

const app: Application = express()

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Service is up and running.' })
})

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api', apiRoutes)

// ── 404 & error handling ──────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

export default app
