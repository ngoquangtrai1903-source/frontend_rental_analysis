const { test } = require('node:test')
const assert = require('node:assert/strict')
const loadTs = require('./load-ts.cjs')

test('auth and data operations share one Supabase client', () => {
  const { supabase, supabaseGold } = loadTs('lib/supabase.ts')
  assert.strictEqual(supabase, supabaseGold)
})
