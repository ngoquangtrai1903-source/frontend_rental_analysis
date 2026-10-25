import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vfvulyiabgfwujmjunva.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_b5FYMZo4Z0bKHQT4ZCkDKA_E65rMNfN'

// Supabase client explicitly targeted at the 'gold' Data Warehouse schema
export const supabaseGold = createClient<Database, 'gold'>(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'gold'
  },
  auth: {
    persistSession: true
  }
})

// Supabase client instance (allows dynamic schema selection via .schema('gold'))
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true
  }
})

export default supabaseGold
