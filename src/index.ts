import dotenv from 'dotenv'
dotenv.config()

import app from './presentation/app'
import { initDatabase } from './infrastructure/database/index'

const PORT = Number(process.env.PORT) || 3000

async function bootstrap(): Promise<void> {
  try {
    await initDatabase()

    app.listen(PORT, () => {
      console.log(`🚀  Server running on http://localhost:${PORT}`)
      console.log(`   Environment : ${process.env.NODE_ENV ?? 'development'}`)
      console.log(`   Health check: http://localhost:${PORT}/health`)
    })
  } catch (error) {
    console.error('❌  Failed to start the application:', error)
    process.exit(1)
  }
}

bootstrap()
