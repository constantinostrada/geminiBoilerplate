import request from 'supertest'
import app from '../../app.js'
import { store } from '../../db/store.js'
import { seed } from '../../db/seed.js'
import { stopPruning } from '../../db/tokenBlacklist.js'

let token

const loginAsAdmin = async () => {
  const res = await request(app).post('/api/auth/login').send({
    username: 'admin',
    password: 'admin1234',
  })
  return res.body.token
}

beforeAll(async () => {
  await seed()
  token = await loginAsAdmin()
})

beforeEach(() => {
  store.equipment.clear()
  store.equipmentAssignments.clear()
})

afterAll(() => {
  stopPruning()
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

const auth = () => ({ Authorization: `Bearer ${token}` })

const createLaptop = (overrides = {}) =>
  request(app)
    .post('/api/equipment')
    .set(auth())
    .send({
      type: 'laptop',
      brand: 'Dell',
      model: 'XPS 15',
      serialNumber: 'SN-001',
      ...overrides,
    })

// ─── POST /api/equipment ─────────────────────────────────────────────────────

describe('POST /api/equipment', () => {
  it('creates equipment with all fields and returns 201', async () => {
    const res = await createLaptop()

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      type: 'laptop',
      brand: 'Dell',
      model: 'XPS 15',
      serialNumber: 'SN-001',
      status: 'available',
    })
    expect(res.body.id).toBeDefined()
    expect(res.body.createdAt).toBeDefined()
    expect(res.body.updatedAt).toBeDefined()
  })

  it('accepts an explicit status on creation', async () => {
    const res = await createLaptop({ serialNumber: 'SN-002', status: 'maintenance' })

    expect(res.status).toBe(201)
    expect(res.body.status).toBe('maintenance')
  })

  it('defaults status to available when not provided', async () => {
    const res = await createLaptop()
    expect(res.status).toBe(201)
    expect(res.body.status).toBe('available')
  })

  it('returns 400 when type is missing', async () => {
    const res = await createLaptop({ type: undefined })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/type/)
  })

  it('returns 400 when brand is missing', async () => {
    const res = await createLaptop({ brand: undefined })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/brand/)
  })

  it('returns 400 when model is missing', async () => {
    const res = await createLaptop({ model: undefined })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/model/)
  })

  it('returns 400 when serialNumber is missing', async () => {
    const res = await createLaptop({ serialNumber: undefined })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/serialNumber/)
  })

  it('returns 400 for invalid status', async () => {
    const res = await createLaptop({ status: 'broken' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/status/)
  })

  it('returns 409 for duplicate serialNumber', async () => {
    await createLaptop()
    const res = await createLaptop()
    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/serialNumber/)
  })

  it('returns 401 without auth token', async () => {
    const res = await request(app).post('/api/equipment').send({
      type: 'laptop',
      brand: 'Dell',
      model: 'XPS 15',
      serialNumber: 'SN-001',
    })
    expect(res.status).toBe(401)
  })
})

// ─── GET /api/equipment ──────────────────────────────────────────────────────

describe('GET /api/equipment', () => {
  beforeEach(async () => {
    await createLaptop({ serialNumber: 'SN-A', status: 'available' })
    await createLaptop({ serialNumber: 'SN-B', status: 'maintenance' })
    await createLaptop({ serialNumber: 'SN-C', status: 'available' })
  })

  it('lists all equipment when no filter provided', async () => {
    const res = await request(app).get('/api/equipment').set(auth())
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(3)
  })

  it('filters by status=available', async () => {
    const res = await request(app).get('/api/equipment?status=available').set(auth())
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    res.body.forEach((e) => expect(e.status).toBe('available'))
  })

  it('filters by status=maintenance', async () => {
    const res = await request(app).get('/api/equipment?status=maintenance').set(auth())
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].status).toBe('maintenance')
  })

  it('filters by status=assigned (empty result)', async () => {
    const res = await request(app).get('/api/equipment?status=assigned').set(auth())
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(0)
  })

  it('returns 400 for invalid status filter', async () => {
    const res = await request(app).get('/api/equipment?status=broken').set(auth())
    expect(res.status).toBe(400)
  })

  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/equipment')
    expect(res.status).toBe(401)
  })
})

// ─── PUT /api/equipment/:id ──────────────────────────────────────────────────

describe('PUT /api/equipment/:id', () => {
  let equipmentId

  beforeEach(async () => {
    const res = await createLaptop()
    equipmentId = res.body.id
  })

  it('updates brand and model', async () => {
    const res = await request(app)
      .put(`/api/equipment/${equipmentId}`)
      .set(auth())
      .send({ brand: 'Apple', model: 'MacBook Pro' })

    expect(res.status).toBe(200)
    expect(res.body.brand).toBe('Apple')
    expect(res.body.model).toBe('MacBook Pro')
    expect(res.body.type).toBe('laptop') // unchanged
  })

  it('updates status to maintenance', async () => {
    const res = await request(app)
      .put(`/api/equipment/${equipmentId}`)
      .set(auth())
      .send({ status: 'maintenance' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('maintenance')
  })

  it('updates updatedAt timestamp', async () => {
    const before = store.equipment.get(equipmentId).updatedAt
    await new Promise((r) => setTimeout(r, 5))

    const res = await request(app)
      .put(`/api/equipment/${equipmentId}`)
      .set(auth())
      .send({ brand: 'HP' })

    expect(res.status).toBe(200)
    expect(res.body.updatedAt).not.toBe(before)
  })

  it('returns 404 for unknown id', async () => {
    const res = await request(app)
      .put('/api/equipment/non-existent-id')
      .set(auth())
      .send({ brand: 'HP' })

    expect(res.status).toBe(404)
  })

  it('returns 400 for invalid status value', async () => {
    const res = await request(app)
      .put(`/api/equipment/${equipmentId}`)
      .set(auth())
      .send({ status: 'retired' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/status/)
  })

  it('returns 409 when updating to a duplicate serialNumber', async () => {
    await createLaptop({ serialNumber: 'SN-OTHER' })

    const res = await request(app)
      .put(`/api/equipment/${equipmentId}`)
      .set(auth())
      .send({ serialNumber: 'SN-OTHER' })

    expect(res.status).toBe(409)
  })

  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .put(`/api/equipment/${equipmentId}`)
      .send({ brand: 'HP' })

    expect(res.status).toBe(401)
  })
})

// ─── POST /api/equipment/:id/assign ─────────────────────────────────────────

describe('POST /api/equipment/:id/assign', () => {
  let equipmentId

  beforeEach(async () => {
    const res = await createLaptop()
    equipmentId = res.body.id
  })

  it('assigns available equipment to an employee', async () => {
    const res = await request(app)
      .post(`/api/equipment/${equipmentId}/assign`)
      .set(auth())
      .send({ employeeId: 'emp-123' })

    expect(res.status).toBe(200)
    expect(res.body.equipment.status).toBe('assigned')
    expect(res.body.assignment.employeeId).toBe('emp-123')
    expect(res.body.assignment.equipmentId).toBe(equipmentId)
    expect(res.body.assignment.assignedAt).toBeDefined()
    expect(res.body.assignment.unassignedAt).toBeNull()
  })

  it('returns 409 when equipment is already assigned', async () => {
    await request(app)
      .post(`/api/equipment/${equipmentId}/assign`)
      .set(auth())
      .send({ employeeId: 'emp-123' })

    const res = await request(app)
      .post(`/api/equipment/${equipmentId}/assign`)
      .set(auth())
      .send({ employeeId: 'emp-456' })

    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/already assigned/)
  })

  it('returns 409 when equipment is under maintenance', async () => {
    await request(app)
      .put(`/api/equipment/${equipmentId}`)
      .set(auth())
      .send({ status: 'maintenance' })

    const res = await request(app)
      .post(`/api/equipment/${equipmentId}/assign`)
      .set(auth())
      .send({ employeeId: 'emp-123' })

    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/maintenance/)
  })

  it('returns 400 when employeeId is missing', async () => {
    const res = await request(app)
      .post(`/api/equipment/${equipmentId}/assign`)
      .set(auth())
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/employeeId/)
  })

  it('returns 404 for unknown equipment id', async () => {
    const res = await request(app)
      .post('/api/equipment/non-existent-id/assign')
      .set(auth())
      .send({ employeeId: 'emp-123' })

    expect(res.status).toBe(404)
  })

  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post(`/api/equipment/${equipmentId}/assign`)
      .send({ employeeId: 'emp-123' })

    expect(res.status).toBe(401)
  })
})

// ─── POST /api/equipment/:id/unassign ────────────────────────────────────────

describe('POST /api/equipment/:id/unassign', () => {
  let equipmentId

  beforeEach(async () => {
    const res = await createLaptop()
    equipmentId = res.body.id
    await request(app)
      .post(`/api/equipment/${equipmentId}/assign`)
      .set(auth())
      .send({ employeeId: 'emp-123' })
  })

  it('unassigns equipment and changes status to available', async () => {
    const res = await request(app)
      .post(`/api/equipment/${equipmentId}/unassign`)
      .set(auth())

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('available')
  })

  it('closes assignment record with unassignedAt timestamp', async () => {
    await request(app).post(`/api/equipment/${equipmentId}/unassign`).set(auth())

    const historyRes = await request(app)
      .get(`/api/equipment/${equipmentId}/history`)
      .set(auth())

    expect(historyRes.body[0].unassignedAt).not.toBeNull()
  })

  it('returns 409 when equipment is not assigned', async () => {
    await request(app).post(`/api/equipment/${equipmentId}/unassign`).set(auth())

    const res = await request(app)
      .post(`/api/equipment/${equipmentId}/unassign`)
      .set(auth())

    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/not currently assigned/)
  })

  it('returns 404 for unknown equipment id', async () => {
    const res = await request(app)
      .post('/api/equipment/non-existent-id/unassign')
      .set(auth())

    expect(res.status).toBe(404)
  })

  it('returns 401 without auth token', async () => {
    const res = await request(app).post(`/api/equipment/${equipmentId}/unassign`)
    expect(res.status).toBe(401)
  })
})

// ─── GET /api/equipment/:id/history ─────────────────────────────────────────

describe('GET /api/equipment/:id/history', () => {
  let equipmentId

  beforeEach(async () => {
    const res = await createLaptop()
    equipmentId = res.body.id
  })

  it('returns empty history for equipment with no assignments', async () => {
    const res = await request(app)
      .get(`/api/equipment/${equipmentId}/history`)
      .set(auth())

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns one record after assignment', async () => {
    await request(app)
      .post(`/api/equipment/${equipmentId}/assign`)
      .set(auth())
      .send({ employeeId: 'emp-1' })

    const res = await request(app)
      .get(`/api/equipment/${equipmentId}/history`)
      .set(auth())

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].employeeId).toBe('emp-1')
    expect(res.body[0].unassignedAt).toBeNull()
  })

  it('accumulates records across multiple assign/unassign cycles', async () => {
    // First cycle
    await request(app)
      .post(`/api/equipment/${equipmentId}/assign`)
      .set(auth())
      .send({ employeeId: 'emp-1' })
    await request(app).post(`/api/equipment/${equipmentId}/unassign`).set(auth())

    // Second cycle
    await request(app)
      .post(`/api/equipment/${equipmentId}/assign`)
      .set(auth())
      .send({ employeeId: 'emp-2' })

    const res = await request(app)
      .get(`/api/equipment/${equipmentId}/history`)
      .set(auth())

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)

    const [first, second] = res.body
    expect(first.employeeId).toBe('emp-1')
    expect(first.unassignedAt).not.toBeNull()
    expect(second.employeeId).toBe('emp-2')
    expect(second.unassignedAt).toBeNull()
  })

  it('only returns history for the requested equipment', async () => {
    const otherRes = await createLaptop({ serialNumber: 'SN-OTHER' })
    const otherId = otherRes.body.id

    await request(app)
      .post(`/api/equipment/${otherId}/assign`)
      .set(auth())
      .send({ employeeId: 'emp-99' })

    const res = await request(app)
      .get(`/api/equipment/${equipmentId}/history`)
      .set(auth())

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(0)
  })

  it('returns 404 for unknown equipment id', async () => {
    const res = await request(app)
      .get('/api/equipment/non-existent-id/history')
      .set(auth())

    expect(res.status).toBe(404)
  })

  it('returns 401 without auth token', async () => {
    const res = await request(app).get(`/api/equipment/${equipmentId}/history`)
    expect(res.status).toBe(401)
  })
})

// ─── Full assignment lifecycle ────────────────────────────────────────────────

describe('Full assignment lifecycle', () => {
  it('status reflects all transitions correctly', async () => {
    // Create
    const createRes = await createLaptop()
    const id = createRes.body.id
    expect(createRes.body.status).toBe('available')

    // Assign
    const assignRes = await request(app)
      .post(`/api/equipment/${id}/assign`)
      .set(auth())
      .send({ employeeId: 'emp-1' })
    expect(assignRes.body.equipment.status).toBe('assigned')

    // Confirm list shows assigned
    const listAssigned = await request(app)
      .get('/api/equipment?status=assigned')
      .set(auth())
    expect(listAssigned.body.find((e) => e.id === id)).toBeDefined()

    // Unassign
    const unassignRes = await request(app)
      .post(`/api/equipment/${id}/unassign`)
      .set(auth())
    expect(unassignRes.body.status).toBe('available')

    // Confirm list shows available again
    const listAvailable = await request(app)
      .get('/api/equipment?status=available')
      .set(auth())
    expect(listAvailable.body.find((e) => e.id === id)).toBeDefined()

    // Full history has one closed record
    const historyRes = await request(app)
      .get(`/api/equipment/${id}/history`)
      .set(auth())
    expect(historyRes.body).toHaveLength(1)
    expect(historyRes.body[0].unassignedAt).not.toBeNull()
  })
})
