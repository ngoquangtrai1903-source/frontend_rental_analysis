const { test } = require('node:test')
const assert = require('node:assert/strict')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const loadTs = require('./load-ts.cjs')

const googleUser = { id: 'google-user', app_metadata: { provider: 'google' }, is_anonymous: false }
const session = {
  access_token: 'test-access-token',
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: googleUser
}
const { hasPredictionSession, PREDICTION_LOGIN_MESSAGE } = loadTs('lib/predictionAccess.ts')

test('prediction access rejects guests, expired tokens, anonymous users and editable provider claims', () => {
  assert.equal(hasPredictionSession(null), false)
  assert.equal(hasPredictionSession(session), true)
  assert.equal(hasPredictionSession({ ...session, expires_at: 1 }), false)
  assert.equal(hasPredictionSession({ ...session, access_token: '' }), false)
  assert.equal(hasPredictionSession({ ...session, user: { ...googleUser, is_anonymous: true } }), false)
  assert.equal(hasPredictionSession({ ...session, user: {
    ...googleUser, app_metadata: { provider: 'email' }, user_metadata: { provider: 'google' }
  } }), false)
})

function loadRoute(authResult) {
  const calls = []
  const { POST } = loadTs('app/api/predict/route.ts', {
    '@supabase/supabase-js': {
      createClient(_url, _key, options) {
        assert.equal(options.auth.persistSession, false)
        return { auth: { async getUser(token) { calls.push(token); return authResult } } }
      }
    }
  })
  return { POST, calls }
}

function request(token, body = { size_m2: 25, property_type: 'room', allow_simulation: true }) {
  return new Request('http://localhost/api/predict', {
    method: 'POST',
    headers: token ? { Authorization: token } : {},
    body: typeof body === 'string' ? body : JSON.stringify(body)
  })
}

test('API rejects guests before reading inputs or calling the model, including simulation requests', async (t) => {
  t.mock.method(global, 'fetch', () => { throw new Error('Model must not be called') })
  const { POST, calls } = loadRoute({ data: { user: googleUser }, error: null })
  for (const token of [undefined, 'Basic abc', 'Bearer ', 'Bearer a b']) {
    const response = await POST(request(token, '{malformed-json'))
    assert.equal(response.status, 401)
    assert.equal((await response.json()).error, PREDICTION_LOGIN_MESSAGE)
  }
  assert.equal((await POST(request(undefined))).status, 401)
  assert.equal(calls.length, 0)
  assert.equal(fetch.mock.callCount(), 0)
})

test('API rejects invalid, expired and revoked access tokens without simulation fallback', async (t) => {
  t.mock.method(global, 'fetch', () => { throw new Error('Model must not be called') })
  for (const token of ['invalid-token', 'expired-token', 'revoked-token']) {
    const { POST, calls } = loadRoute({ data: { user: null }, error: { status: 401 } })
    assert.equal((await POST(request(`Bearer ${token}`))).status, 401)
    assert.deepEqual(calls, [token])
  }
  assert.equal(fetch.mock.callCount(), 0)
})

test('API requires a verified Google user and fails closed if verification is unavailable', async (t) => {
  t.mock.method(global, 'fetch', () => { throw new Error('Model must not be called') })
  const { POST } = loadRoute({ data: { user: {
    id: 'email-user', app_metadata: { provider: 'email' }, user_metadata: { provider: 'google' }
  } }, error: null })
  assert.equal((await POST(request('Bearer token'))).status, 403)
  const unavailable = loadRoute({ data: { user: null }, error: { status: 503 } })
  assert.equal((await unavailable.POST(request('Bearer token'))).status, 503)
  assert.equal(fetch.mock.callCount(), 0)
})

test('verified Google requests reach the model with authentication and preserve the prediction', async (t) => {
  t.mock.method(global, 'fetch', async (_url, options) => {
    assert.equal(options.headers.Authorization, 'Bearer valid-token')
    assert.equal(JSON.parse(options.body).property_type, 'room')
    return Response.json({ price_million_vnd: 4.2 })
  })
  const { POST } = loadRoute({ data: { user: googleUser }, error: null })
  const response = await POST(request('Bearer valid-token'))
  assert.equal(response.status, 200)
  const data = await response.json()
  assert.equal(data.predicted_price_vnd, 4_200_000)
  assert.equal(data.is_simulation, false)
})

test('a backend authentication rejection cannot turn into a successful simulation', async (t) => {
  t.mock.method(global, 'fetch', async () => Response.json({}, { status: 401 }))
  const { POST } = loadRoute({ data: { user: googleUser }, error: null })
  const response = await POST(request('Bearer valid-token'))
  assert.equal(response.status, 401)
  assert.equal((await response.json()).success, false)
  assert.equal(fetch.mock.callCount(), 1)
})

test('simulation remains available to verified Google users when the model is offline', async (t) => {
  t.mock.method(global, 'fetch', async () => Response.json({}, { status: 503 }))
  const { POST } = loadRoute({ data: { user: googleUser }, error: null })
  const response = await POST(request('Bearer valid-token', {
    property_type: 'room', size_m2: 25, dist_to_cbd: 3, dist_to_beach: 2,
    dist_to_nearest_uni: 1, furnishing_status: 'Đầy đủ nội thất',
    ward_name: 'Hải Châu', allow_simulation: true
  }))
  assert.equal(response.status, 200)
  const data = await response.json()
  assert.equal(data.is_simulation, true)
  assert.ok(data.predicted_price_vnd > 0)
})

test('locked prediction view displays the requested message and Google sign-in action', () => {
  const { default: View } = loadTs('app/components/ProtectedPricePrediction.tsx', {
    '../hooks/usePredictionSession': { usePredictionSession: () => ({ session: null, checking: false, lock() {} }) },
    './PricePredictionView': { __esModule: true, default: () => React.createElement('form', { id: 'prediction-form' }) }
  })
  const html = renderToStaticMarkup(React.createElement(View, { lang: 'vi', onSignIn() {}, authLoading: false }))
  assert.ok(html.includes(PREDICTION_LOGIN_MESSAGE))
  assert.ok(html.includes('Đăng nhập bằng Google'))
  assert.ok(!html.includes('prediction-form'))
})

test('verified session renders the model; checking and signed-out states do not', () => {
  let state = { session, checking: false, lock() {} }
  const { default: View } = loadTs('app/components/ProtectedPricePrediction.tsx', {
    '../hooks/usePredictionSession': { usePredictionSession: () => state },
    './PricePredictionView': { __esModule: true, default: () => React.createElement('form', { id: 'prediction-form' }) }
  })
  const render = () => renderToStaticMarkup(React.createElement(View, { lang: 'en', onSignIn() {}, authLoading: false }))
  assert.ok(render().includes('prediction-form'))
  state = { ...state, session: null }
  assert.ok(!render().includes('prediction-form'))
  assert.ok(render().includes('Sign in with Google'))
  state = { ...state, checking: true }
  assert.ok(render().includes('Checking your sign-in status'))
  assert.ok(!render().includes('prediction-form'))
})
