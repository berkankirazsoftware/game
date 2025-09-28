import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
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
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

export type Database = {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: 'basic' | 'advanced'
          is_active: boolean
          start_date: string
          expiration_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: 'basic' | 'advanced'
          is_active?: boolean
          start_date?: string
          expiration_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: 'basic' | 'advanced'
          is_active?: boolean
          start_date?: string
          expiration_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
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