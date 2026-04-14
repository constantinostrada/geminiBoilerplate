// In-memory data stores

export const employees = new Map()
export const vacationRequests = new Map()

// Seed some employees for development/testing
import { v4 as uuidv4 } from 'uuid'

const seedEmployees = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    department: 'Engineering',
    createdAt: new Date('2023-01-15').toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Bob Smith',
    email: 'bob@example.com',
    department: 'Marketing',
    createdAt: new Date('2023-03-10').toISOString(),
  },
]

for (const emp of seedEmployees) {
  employees.set(emp.id, emp)
}

export { uuidv4 }
