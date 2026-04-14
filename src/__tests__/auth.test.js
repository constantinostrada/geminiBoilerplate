'use strict'

const request = require('supertest')
const app = require('../app')
const blacklist = require('../db/tokenBlacklist')

const VALID_CREDENTIALS = { username: 'admin', password: 'admin1234' }

// Reset the token blacklist before every test so revoked tokens
// from one test do not bleed into the next.
beforeEach(() => {
  blacklist.prune()
  // Clear all entries regardless of expiry to ensure a clean slate.
  // We access the internal map via the module's own prune, but since
  // pruning only removes expired tokens we force-clear via a helper.
  blacklist._clearAll && blacklist._clearAll()
})

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
describe('POST /api/auth/login', () => {
  it('returns 200 and a token with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send(VALID_CREDENTIALS)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(typeof res.body.token).toBe('string')
  })

  it('returns 401 with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrongpassword' })

    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('error')
  })

  it('returns 401 with unknown username', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'unknown', password: 'whatever' })

    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('error')
  })

  it('returns 400 when body fields are missing', async () => {
    const res = await request(app).post('/api/auth/login').send({})

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin' })

    expect(res.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------
describe('POST /api/auth/logout', () => {
  const getToken = async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send(VALID_CREDENTIALS)
    return res.body.token
  }

  it('returns 200 with a valid token', async () => {
    const token = await getToken()

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('message')
  })

  it('returns 401 without a token', async () => {
    const res = await request(app).post('/api/auth/logout')

    expect(res.status).toBe(401)
  })

  it('returns 401 when using a revoked token after logout', async () => {
    const token = await getToken()

    // First logout — should succeed
    await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)

    // Second request with the same token — should be rejected
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(401)
  })
})

// ---------------------------------------------------------------------------
// Protected routes — middleware
// ---------------------------------------------------------------------------
describe('Protected routes middleware', () => {
  it('returns 401 accessing a protected route without token', async () => {
    const res = await request(app).get('/api/ping')

    expect(res.status).toBe(401)
  })

  it('returns 401 with a malformed Authorization header', async () => {
    const res = await request(app)
      .get('/api/ping')
      .set('Authorization', 'Token abc123')

    expect(res.status).toBe(401)
  })

  it('returns 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/api/ping')
      .set('Authorization', 'Bearer this.is.not.valid')

    expect(res.status).toBe(401)
  })

  it('returns 200 accessing a protected route with a valid token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send(VALID_CREDENTIALS)

    const { token } = loginRes.body

    const res = await request(app)
      .get('/api/ping')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('user', 'admin')
  })

  it('returns 401 accessing a protected route with a revoked token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send(VALID_CREDENTIALS)

    const { token } = loginRes.body

    await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)

    const res = await request(app)
      .get('/api/ping')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(401)
  })
})
