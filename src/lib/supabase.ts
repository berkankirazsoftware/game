import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

console.log('Environment variables:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
})

// Check if we have valid Supabase configuration
const isValidConfig = supabaseUrl && 
  supabaseKey && 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseKey !== 'placeholder-key' &&
  !supabaseKey.includes('placeholder') &&
  supabaseUrl.includes('.supabase.co') &&
  supabaseKey.startsWith('eyJ')

console.log('Supabase config:', { 
  url: supabaseUrl, 
  hasKey: !!supabaseKey, 
  isValid: isValidConfig,
  urlValid: supabaseUrl.includes('.supabase.co'),
  keyValid: supabaseKey.startsWith('eyJ')
})
// Create Supabase client with proper configuration
export const supabase = isValidConfig
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : createClient('https://placeholder.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })

export const isSupabaseConfigured = isValidConfig
export type Database = {
  public: {
    Tables: {
      coupons: {
        Row: {
          id: string
          user_id: string
          code: string
          description: string
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          level: number
          quantity: number
          used_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          code: string
          description: string
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          level: number
          quantity: number
          used_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          code?: string
          description?: string
          discount_type?: 'percentage' | 'fixed'
          discount_value?: number
          level?: number
          quantity?: number
          used_count?: number
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          business_name: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          business_name?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          business_name?: string
          created_at?: string
        }
      }
    }
  }
}