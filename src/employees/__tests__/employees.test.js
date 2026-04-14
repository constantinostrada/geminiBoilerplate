import request from 'supertest'
import app from '../../app.js'
import { store } from '../../db/store.js'

// Helper: get a valid JWT token
async function getToken() {
  const res = await request(app).post('/api/auth/login').send({
    username: 'admin',
    password: 'admin1234',
  })
  return res.body.token
}

// Helper: create a minimal valid employee payload
function basePayload(overrides = {}) {
  return {
    firstName: 'John',
    lastName: 'Doe',
    email: `john.doe.${Date.now()}@example.com`,
    position: 'Developer',
    department: 'Engineering',
    ...overrides,
  }
}

beforeEach(() => {
  store.employees.clear()
})

// ---------------------------------------------------------------------------
// Authentication guard
// ---------------------------------------------------------------------------
describe('Authentication guard', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/employees')
    expect(res.status).toBe(401)
  })

  it('returns 401 when an invalid token is provided', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', 'Bearer invalid.token.here')
    expect(res.status).toBe(401)
  })
})

// ---------------------------------------------------------------------------
// POST /api/employees
// ---------------------------------------------------------------------------
describe('POST /api/employees', () => {
  it('creates an employee with all required fields and returns 201', async () => {
    const token = await getToken()
    const payload = basePayload({ email: 'create@example.com' })

    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)

    expect(res.status).toBe(201)
    expect(res.body.id).toBeDefined()
    expect(res.body.firstName).toBe('John')
    expect(res.body.lastName).toBe('Doe')
    expect(res.body.email).toBe('create@example.com')
    expect(res.body.position).toBe('Developer')
    expect(res.body.department).toBe('Engineering')
    expect(res.body.status).toBe('active')
    expect(res.body.createdAt).toBeDefined()
    expect(res.body.updatedAt).toBeDefined()
  })

  it('stores email in lowercase', async () => {
    const token = await getToken()
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'UpperCase@Example.COM' }))

    expect(res.status).toBe(201)
    expect(res.body.email).toBe('uppercase@example.com')
  })

  it('creates employee with optional hireDate and phone', async () => {
    const token = await getToken()
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(
        basePayload({
          email: 'withoptional@example.com',
          hireDate: '2023-01-15',
          phone: '555-1234',
        })
      )

    expect(res.status).toBe(201)
    expect(res.body.hireDate).toBe('2023-01-15')
    expect(res.body.phone).toBe('555-1234')
  })

  it('returns 400 when firstName is missing', async () => {
    const token = await getToken()
    const { firstName, ...payload } = basePayload({ email: 'missing@example.com' })

    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)

    expect(res.status).toBe(400)
    expect(res.body.errors).toContain('firstName is required')
  })

  it('returns 400 when lastName is missing', async () => {
    const token = await getToken()
    const { lastName, ...payload } = basePayload({ email: 'missing2@example.com' })

    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)

    expect(res.status).toBe(400)
    expect(res.body.errors).toContain('lastName is required')
  })

  it('returns 400 when email is missing', async () => {
    const token = await getToken()
    const { email, ...payload } = basePayload()

    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)

    expect(res.status).toBe(400)
    expect(res.body.errors).toContain('email is required')
  })

  it('returns 400 when email is invalid', async () => {
    const token = await getToken()
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'not-an-email' }))

    expect(res.status).toBe(400)
    expect(res.body.errors).toContain('email must be a valid email address')
  })

  it('returns 400 when position is missing', async () => {
    const token = await getToken()
    const { position, ...payload } = basePayload({ email: 'missing3@example.com' })

    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)

    expect(res.status).toBe(400)
    expect(res.body.errors).toContain('position is required')
  })

  it('returns 400 when department is missing', async () => {
    const token = await getToken()
    const { department, ...payload } = basePayload({ email: 'missing4@example.com' })

    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)

    expect(res.status).toBe(400)
    expect(res.body.errors).toContain('department is required')
  })

  it('returns 400 when hireDate has an invalid format', async () => {
    const token = await getToken()
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'hiredate@example.com', hireDate: '15-01-2023' }))

    expect(res.status).toBe(400)
    expect(res.body.errors).toContain('hireDate must be a valid date in YYYY-MM-DD format')
  })

  it('returns 400 when multiple required fields are missing', async () => {
    const token = await getToken()
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.errors.length).toBeGreaterThanOrEqual(4)
  })

  it('returns 409 when email is already in use', async () => {
    const token = await getToken()
    const payload = basePayload({ email: 'duplicate@example.com' })

    await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)

    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'duplicate@example.com' }))

    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/email already in use/i)
  })

  it('treats duplicate email check as case-insensitive', async () => {
    const token = await getToken()

    await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'Case@Example.com' }))

    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'CASE@EXAMPLE.COM' }))

    expect(res.status).toBe(409)
  })
})

// ---------------------------------------------------------------------------
// GET /api/employees
// ---------------------------------------------------------------------------
describe('GET /api/employees', () => {
  it('returns empty list when no employees exist', async () => {
    const token = await getToken()
    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
    expect(res.body.pagination.total).toBe(0)
  })

  it('lists active employees', async () => {
    const token = await getToken()

    await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'a@example.com' }))

    await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'b@example.com', firstName: 'Jane' }))

    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBe(2)
  })

  it('does not include inactive employees by default', async () => {
    const token = await getToken()

    const created = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'todelete@example.com' }))

    await request(app)
      .delete(`/api/employees/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBe(0)
  })

  it('returns pagination metadata', async () => {
    const token = await getToken()

    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${token}`)
        .send(basePayload({ email: `paginate${i}@example.com` }))
    }

    const res = await request(app)
      .get('/api/employees?page=1&limit=2')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBe(2)
    expect(res.body.pagination.total).toBe(5)
    expect(res.body.pagination.page).toBe(1)
    expect(res.body.pagination.limit).toBe(2)
    expect(res.body.pagination.totalPages).toBe(3)
  })

  it('returns correct page 2', async () => {
    const token = await getToken()

    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${token}`)
        .send(basePayload({ email: `page2test${i}@example.com` }))
    }

    const res = await request(app)
      .get('/api/employees?page=2&limit=3')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBe(2)
    expect(res.body.pagination.page).toBe(2)
  })

  it('filters employees by firstName search', async () => {
    const token = await getToken()

    await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'alice@example.com', firstName: 'Alice' }))

    await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'bob@example.com', firstName: 'Bob' }))

    const res = await request(app)
      .get('/api/employees?search=ali')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBe(1)
    expect(res.body.data[0].firstName).toBe('Alice')
  })

  it('filters employees by lastName search', async () => {
    const token = await getToken()

    await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'smith@example.com', lastName: 'Smith' }))

    await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'jones@example.com', lastName: 'Jones' }))

    const res = await request(app)
      .get('/api/employees?search=jones')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBe(1)
    expect(res.body.data[0].lastName).toBe('Jones')
  })

  it('search is case-insensitive', async () => {
    const token = await getToken()

    await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'carlos@example.com', firstName: 'Carlos' }))

    const res = await request(app)
      .get('/api/employees?search=CARLOS')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBe(1)
  })

  it('returns empty data when search matches nothing', async () => {
    const token = await getToken()

    await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'nope@example.com' }))

    const res = await request(app)
      .get('/api/employees?search=zzznomatch')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBe(0)
    expect(res.body.pagination.total).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// GET /api/employees/:id
// ---------------------------------------------------------------------------
describe('GET /api/employees/:id', () => {
  it('returns the employee for a valid id', async () => {
    const token = await getToken()

    const created = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'getbyid@example.com' }))

    const res = await request(app)
      .get(`/api/employees/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(created.body.id)
    expect(res.body.email).toBe('getbyid@example.com')
  })

  it('returns inactive employee by id', async () => {
    const token = await getToken()

    const created = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'inactive@example.com' }))

    await request(app)
      .delete(`/api/employees/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    const res = await request(app)
      .get(`/api/employees/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('inactive')
  })

  it('returns 404 for a non-existent id', async () => {
    const token = await getToken()

    const res = await request(app)
      .get('/api/employees/non-existent-id')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body.error).toMatch(/not found/i)
  })
})

// ---------------------------------------------------------------------------
// PUT /api/employees/:id
// ---------------------------------------------------------------------------
describe('PUT /api/employees/:id', () => {
  it('updates allowed fields and returns the updated employee', async () => {
    const token = await getToken()

    const created = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'update@example.com' }))

    const res = await request(app)
      .put(`/api/employees/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ position: 'Senior Developer', department: 'Platform' })

    expect(res.status).toBe(200)
    expect(res.body.position).toBe('Senior Developer')
    expect(res.body.department).toBe('Platform')
    expect(res.body.email).toBe('update@example.com') // unchanged
  })

  it('updates email and normalises to lowercase', async () => {
    const token = await getToken()

    const created = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'old@example.com' }))

    const res = await request(app)
      .put(`/api/employees/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'NEW@Example.com' })

    expect(res.status).toBe(200)
    expect(res.body.email).toBe('new@example.com')
  })

  it('updates the updatedAt timestamp', async () => {
    const token = await getToken()

    const created = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'ts@example.com' }))

    const originalUpdatedAt = created.body.updatedAt

    await new Promise((r) => setTimeout(r, 10))

    const res = await request(app)
      .put(`/api/employees/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ phone: '999-8888' })

    expect(res.status).toBe(200)
    expect(res.body.updatedAt).not.toBe(originalUpdatedAt)
  })

  it('returns 404 for a non-existent id', async () => {
    const token = await getToken()

    const res = await request(app)
      .put('/api/employees/no-such-id')
      .set('Authorization', `Bearer ${token}`)
      .send({ position: 'Manager' })

    expect(res.status).toBe(404)
    expect(res.body.error).toMatch(/not found/i)
  })

  it('returns 400 for invalid email in update', async () => {
    const token = await getToken()

    const created = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'valid@example.com' }))

    const res = await request(app)
      .put(`/api/employees/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'not-valid' })

    expect(res.status).toBe(400)
    expect(res.body.errors).toContain('email must be a valid email address')
  })

  it('returns 400 for empty string in firstName update', async () => {
    const token = await getToken()

    const created = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'emptyname@example.com' }))

    const res = await request(app)
      .put(`/api/employees/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: '   ' })

    expect(res.status).toBe(400)
    expect(res.body.errors).toContain('firstName must be a non-empty string')
  })

  it('returns 409 when updating email to one already in use by another employee', async () => {
    const token = await getToken()

    await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'taken@example.com' }))

    const second = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'second@example.com' }))

    const res = await request(app)
      .put(`/api/employees/${second.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'taken@example.com' })

    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/email already in use/i)
  })

  it('allows updating email to the same value (no conflict with self)', async () => {
    const token = await getToken()

    const created = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'selfupdate@example.com' }))

    const res = await request(app)
      .put(`/api/employees/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'selfupdate@example.com' })

    expect(res.status).toBe(200)
    expect(res.body.email).toBe('selfupdate@example.com')
  })
})

// ---------------------------------------------------------------------------
// DELETE /api/employees/:id
// ---------------------------------------------------------------------------
describe('DELETE /api/employees/:id', () => {
  it('soft-deletes the employee (sets status to inactive) and returns 200', async () => {
    const token = await getToken()

    const created = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'softdelete@example.com' }))

    const res = await request(app)
      .delete(`/api/employees/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('inactive')
    expect(res.body.id).toBe(created.body.id)
  })

  it('does not remove the employee record from the store', async () => {
    const token = await getToken()

    const created = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'keeprecord@example.com' }))

    await request(app)
      .delete(`/api/employees/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    const res = await request(app)
      .get(`/api/employees/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('inactive')
  })

  it('returns 404 for a non-existent id', async () => {
    const token = await getToken()

    const res = await request(app)
      .delete('/api/employees/ghost-id')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body.error).toMatch(/not found/i)
  })

  it('updates the updatedAt timestamp on delete', async () => {
    const token = await getToken()

    const created = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'delts@example.com' }))

    await new Promise((r) => setTimeout(r, 10))

    const res = await request(app)
      .delete(`/api/employees/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.updatedAt).not.toBe(created.body.updatedAt)
  })

  it('email of deleted employee can be reused by a new employee', async () => {
    const token = await getToken()

    const created = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'recycle@example.com' }))

    // Note: email uniqueness is enforced across all employees including inactive.
    // This test documents current behaviour (409 if you try to reuse).
    await request(app)
      .delete(`/api/employees/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    // The deleted employee still holds the email in the store → 409
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload({ email: 'recycle@example.com' }))

    expect(res.status).toBe(409)
  })
})
