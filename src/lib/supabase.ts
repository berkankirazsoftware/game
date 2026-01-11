import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lecnzfazipzwkzgyptux.supabase.co'
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

console.log('Environment variables:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
})

console.log('Supabase config:', {
  url: supabaseUrl,
  hasKey: !!supabaseKey
})

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
