import sequelize from './connection'
// Import models so associations are registered before sync
import './models/index'

/**
 * Connects to the database and optionally syncs the schema.
 * In production use migrations instead of sync.
 */
export async function initDatabase(): Promise<void> {
  await sequelize.authenticate()
  console.log('✅  Database connection established.')

  if (process.env.NODE_ENV !== 'production') {
    await sequelize.sync({ alter: true })
    console.log('✅  Database schema synchronised.')
  }
}

export { sequelize }
