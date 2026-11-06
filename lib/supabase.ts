import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'
import { supabaseUrl, supabaseAnonKey } from './supabaseConfig'

// Supabase client explicitly targeted at the 'gold' Data Warehouse schema
export const supabaseGold = createClient<Database, 'gold'>(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'gold'
  },
  auth: {
    persistSession: true,
    flowType: 'pkce',
    // The callback page explicitly exchanges the code once.
    detectSessionInUrl: false
  }
})

export const supabase = supabaseGold

export default supabaseGold
