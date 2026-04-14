import request from 'supertest'
import app from '../../app.js'
import { employees, vacationRequests } from '../../db/store.js'
import { v4 as uuidv4 } from 'uuid'

// ─── helpers ────────────────────────────────────────────────────────────────

async function getToken() {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'admin1234' })
  return res.body.token
}

function futureDate(offsetDays) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

function pastDate(offsetDays) {
  const d = new Date()
  d.setDate(d.getDate() - offsetDays)
  return d.toISOString().slice(0, 10)
}

// ─── seed ────────────────────────────────────────────────────────────────────

const EMPLOYEE_ID = '11111111-1111-1111-1111-111111111111' // seeded in store.js
const EMPLOYEE_ID_2 = '22222222-2222-2222-2222-222222222222' // seeded in store.js
const UNKNOWN_EMPLOYEE = uuidv4()

// ─── tests ───────────────────────────────────────────────────────────────────

describe('Vacations API', () => {
  let token

  beforeAll(async () => {
    token = await getToken()
  })

  beforeEach(() => {
    // Clear vacation requests between tests for isolation
    vacationRequests.clear()
  })

  // ── Authentication guard ──────────────────────────────────────────────────

  describe('Authentication', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).post('/api/vacations').send({})
      expect(res.status).toBe(401)
    })

    it('returns 401 with invalid token', async () => {
      const res = await request(app)
        .post('/api/vacations')
        .set('Authorization', 'Bearer badtoken')
        .send({})
      expect(res.status).toBe(401)
    })
  })

  // ── POST /api/vacations ───────────────────────────────────────────────────

  describe('POST /api/vacations', () => {
    it('creates a vacation request with all fields', async () => {
      const start = futureDate(5)
      const end = futureDate(10)

      const res = await request(app)
        .post('/api/vacations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          employeeId: EMPLOYEE_ID,
          startDate: start,
          endDate: end,
          reason: 'Summer holiday',
        })

      expect(res.status).toBe(201)
      expect(res.body.data).toMatchObject({
        employeeId: EMPLOYEE_ID,
        startDate: start,
        endDate: end,
        reason: 'Summer holiday',
        status: 'pending',
      })
      expect(res.body.data.id).toBeDefined()
      expect(res.body.data.daysRequested).toBe(6)
      expect(res.body.data.createdAt).toBeDefined()
      expect(res.body.data.updatedAt).toBeDefined()
      expect(res.body.data.rejectionReason).toBeNull()
    })

    it('creates a vacation request without reason', async () => {
      const res = await request(app)
        .post('/api/vacations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          employeeId: EMPLOYEE_ID,
          startDate: futureDate(1),
          endDate: futureDate(3),
        })

      expect(res.status).toBe(201)
      expect(res.body.data.reason).toBeNull()
      expect(res.body.data.daysRequested).toBe(3)
    })

    it('calculates daysRequested correctly for same-day request', async () => {
      const today = futureDate(0)
      const res = await request(app)
        .post('/api/vacations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          employeeId: EMPLOYEE_ID,
          startDate: today,
          endDate: today,
        })

      expect(res.status).toBe(201)
      expect(res.body.data.daysRequested).toBe(1)
    })

    it('returns 400 when employeeId is missing', async () => {
      const res = await request(app)
        .post('/api/vacations')
        .set('Authorization', `Bearer ${token}`)
        .send({ startDate: futureDate(5), endDate: futureDate(10) })

      expect(res.status).toBe(400)
      expect(res.body.errors).toContain('employeeId is required')
    })

    it('returns 400 when startDate is missing', async () => {
      const res = await request(app)
        .post('/api/vacations')
        .set('Authorization', `Bearer ${token}`)
        .send({ employeeId: EMPLOYEE_ID, endDate: futureDate(10) })

      expect(res.status).toBe(400)
      expect(res.body.errors).toContain('startDate is required')
    })

    it('returns 400 when endDate is missing', async () => {
      const res = await request(app)
        .post('/api/vacations')
        .set('Authorization', `Bearer ${token}`)
        .send({ employeeId: EMPLOYEE_ID, startDate: futureDate(5) })

      expect(res.status).toBe(400)
      expect(res.body.errors).toContain('endDate is required')
    })

    it('returns 400 when startDate is in the past', async () => {
      const res = await request(app)
        .post('/api/vacations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          employeeId: EMPLOYEE_ID,
          startDate: pastDate(3),
          endDate: futureDate(5),
        })

      expect(res.status).toBe(400)
      expect(res.body.errors).toContain('startDate cannot be in the past')
    })

    it('returns 400 when endDate is in the past', async () => {
      const res = await request(app)
        .post('/api/vacations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          employeeId: EMPLOYEE_ID,
          startDate: pastDate(5),
          endDate: pastDate(1),
        })

      expect(res.status).toBe(400)
      // Both past errors may appear; endDate is the one we assert
      expect(res.body.errors.some((e) => e.includes('past'))).toBe(true)
    })

    it('returns 400 when startDate is after endDate', async () => {
      const res = await request(app)
        .post('/api/vacations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          employeeId: EMPLOYEE_ID,
          startDate: futureDate(10),
          endDate: futureDate(5),
        })

      expect(res.status).toBe(400)
      expect(res.body.errors).toContain('startDate must be before or equal to endDate')
    })

    it('returns 400 when startDate format is invalid', async () => {
      const res = await request(app)
        .post('/api/vacations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          employeeId: EMPLOYEE_ID,
          startDate: '31/12/2099',
          endDate: futureDate(10),
        })

      expect(res.status).toBe(400)
      expect(res.body.errors).toContain('startDate must be in YYYY-MM-DD format')
    })

    it('returns 400 when employee does not exist', async () => {
      const res = await request(app)
        .post('/api/vacations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          employeeId: UNKNOWN_EMPLOYEE,
          startDate: futureDate(5),
          endDate: futureDate(10),
        })

      expect(res.status).toBe(400)
      expect(res.body.errors).toContain('Employee not found')
    })
  })

  // ── GET /api/vacations ────────────────────────────────────────────────────

  describe('GET /api/vacations', () => {
    async function createRequest(employeeId, offsetStart, offsetEnd) {
      const res = await request(app)
        .post('/api/vacations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          employeeId,
          startDate: futureDate(offsetStart),
          endDate: futureDate(offsetEnd),
        })
      return res.body.data
    }

    it('returns empty array when no requests exist', async () => {
      const res = await request(app)
        .get('/api/vacations')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toEqual([])
    })

    it('lists all vacation requests', async () => {
      await createRequest(EMPLOYEE_ID, 5, 10)
      await createRequest(EMPLOYEE_ID_2, 15, 20)

      const res = await request(app)
        .get('/api/vacations')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2)
    })

    it('filters by status=pending', async () => {
      const req1 = await createRequest(EMPLOYEE_ID, 5, 10)

      // Approve one request directly via endpoint
      await request(app)
        .patch(`/api/vacations/${req1.id}/approve`)
        .set('Authorization', `Bearer ${token}`)

      await createRequest(EMPLOYEE_ID, 15, 20) // still pending

      const res = await request(app)
        .get('/api/vacations?status=pending')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].status).toBe('pending')
    })

    it('filters by status=approved', async () => {
      const req1 = await createRequest(EMPLOYEE_ID, 5, 10)
      await request(app)
        .patch(`/api/vacations/${req1.id}/approve`)
        .set('Authorization', `Bearer ${token}`)

      const res = await request(app)
        .get('/api/vacations?status=approved')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].status).toBe('approved')
    })

    it('filters by status=rejected', async () => {
      const req1 = await createRequest(EMPLOYEE_ID, 5, 10)
      await request(app)
        .patch(`/api/vacations/${req1.id}/reject`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'Not enough coverage' })

      const res = await request(app)
        .get('/api/vacations?status=rejected')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].status).toBe('rejected')
    })

    it('filters by employeeId', async () => {
      await createRequest(EMPLOYEE_ID, 5, 10)
      await createRequest(EMPLOYEE_ID_2, 15, 20)

      const res = await request(app)
        .get(`/api/vacations?employeeId=${EMPLOYEE_ID}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].employeeId).toBe(EMPLOYEE_ID)
    })

    it('combines status and employeeId filters', async () => {
      const req1 = await createRequest(EMPLOYEE_ID, 5, 10)
      await createRequest(EMPLOYEE_ID, 15, 20)
      await createRequest(EMPLOYEE_ID_2, 5, 10)

      await request(app)
        .patch(`/api/vacations/${req1.id}/approve`)
        .set('Authorization', `Bearer ${token}`)

      const res = await request(app)
        .get(`/api/vacations?status=pending&employeeId=${EMPLOYEE_ID}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].employeeId).toBe(EMPLOYEE_ID)
      expect(res.body.data[0].status).toBe('pending')
    })

    it('returns 400 for invalid status filter', async () => {
      const res = await request(app)
        .get('/api/vacations?status=unknown')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(400)
      expect(res.body.errors).toBeDefined()
    })
  })

  // ── PATCH /api/vacations/:id/approve ─────────────────────────────────────

  describe('PATCH /api/vacations/:id/approve', () => {
    it('approves a pending request', async () => {
      const createRes = await request(app)
        .post('/api/vacations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          employeeId: EMPLOYEE_ID,
          startDate: futureDate(5),
          endDate: futureDate(10),
        })

      const { id } = createRes.body.data

      const res = await request(app)
        .patch(`/api/vacations/${id}/approve`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('approved')
      expect(res.body.data.id).toBe(id)
      expect(res.body.data.updatedAt).toBeDefined()
    })

    it('returns 404 for non-existent request', async () => {
      const res = await request(app)
        .patch(`/api/vacations/${uuidv4()}/approve`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('Vacation request not found')
    })

    it('returns 409 when trying to approve a non-pending request', async () => {
      const createRes = await request(app)
        .post('/api/vacations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          employeeId: EMPLOYEE_ID,
          startDate: futureDate(5),
          endDate: futureDate(10),
        })

      const { id } = createRes.body.data

      // First approve
      await request(app)
        .patch(`/api/vacations/${id}/approve`)
        .set('Authorization', `Bearer ${token}`)

      // Second approve attempt
      const res = await request(app)
        .patch(`/api/vacations/${id}/approve`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(409)
    })

    it('returns 409 when trying to approve a rejected request', async () => {
      const createRes = await request(app)
        .post('/api/vacations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          employeeId: EMPLOYEE_ID,
          startDate: futureDate(5),
          endDate: futureDate(10),
        })

      const { id } = createRes.body.data

      await request(app)
        .patch(`/api/vacations/${id}/reject`)
        .set('Authorization', `Bearer ${token}`)

      const res = await request(app)
        .patch(`/api/vacations/${id}/approve`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(409)
    })
  })

  // ── PATCH /api/vacations/:id/reject ──────────────────────────────────────

  describe('PATCH /api/vacations/:id/reject', () => {
    it('rejects a pending request without reason', async () => {
      const createRes = await request(app)
        .post('/api/vacations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          employeeId: EMPLOYEE_ID,
          startDate: futureDate(5),
          endDate: futureDate(10),
        })

      const { id } = createRes.body.data

      const res = await request(app)
        .patch(`/api/vacations/${id}/reject`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('rejected')
      expect(res.body.data.rejectionReason).toBeNull()
    })

    it('rejects a pending request with a reason', async () => {
      const createRes = await request(app)
        .post('/api/vacations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          employeeId: EMPLOYEE_ID,
          startDate: futureDate(5),
          endDate: futureDate(10),
        })

      const { id } = createRes.body.data

      const res = await request(app)
        .patch(`/api/vacations/${id}/reject`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'Peak season — team at minimum coverage' })

      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('rejected')
      expect(res.body.data.rejectionReason).toBe('Peak season — team at minimum coverage')
    })

    it('returns 404 for non-existent request', async () => {
      const res = await request(app)
        .patch(`/api/vacations/${uuidv4()}/reject`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('Vacation request not found')
    })

    it('returns 409 when trying to reject an already-rejected request', async () => {
      const createRes = await request(app)
        .post('/api/vacations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          employeeId: EMPLOYEE_ID,
          startDate: futureDate(5),
          endDate: futureDate(10),
        })

      const { id } = createRes.body.data

      await request(app)
        .patch(`/api/vacations/${id}/reject`)
        .set('Authorization', `Bearer ${token}`)

      const res = await request(app)
        .patch(`/api/vacations/${id}/reject`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(409)
    })

    it('returns 409 when trying to reject an approved request', async () => {
      const createRes = await request(app)
        .post('/api/vacations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          employeeId: EMPLOYEE_ID,
          startDate: futureDate(5),
          endDate: futureDate(10),
        })

      const { id } = createRes.body.data

      await request(app)
        .patch(`/api/vacations/${id}/approve`)
        .set('Authorization', `Bearer ${token}`)

      const res = await request(app)
        .patch(`/api/vacations/${id}/reject`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(409)
    })
  })
})
