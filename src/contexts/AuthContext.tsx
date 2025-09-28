import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabaseError, setSupabaseError] = useState<string | null>(null)

  useEffect(() => {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured) {
      setSupabaseError('Supabase yapılandırması eksik. Lütfen sağ üst köşedeki "Connect to Supabase" butonuna tıklayın.')
      setLoading(false)
      return
    }

    // Get initial session only if properly configured
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error)
        // Clear any invalid session data
        localStorage.removeItem('supabase.auth.token')
        setSession(null)
        setUser(null)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
      }
      setLoading(false)
    }).catch((error) => {
      console.error('Auth initialization error:', error)
      setLoading(false)
    })

    // Listen for auth changes only if properly configured
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured || supabaseError) {
      return { data: null, error: { message: supabaseError } }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (!error && data.user) {
      try {
        // Create profile
        await supabase.from('profiles').insert([
          {
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
          },
        ])

        // Create default subscription (inactive)
        await supabase.from('subscriptions').insert([
          {
            user_id: data.user.id,
            plan_type: 'basic',
            is_active: false,
            start_date: new Date().toISOString(),
            expiration_date: null
          },
        ])
      } catch (profileError) {
        console.error('Error creating user profile/subscription:', profileError)
      }
    }

    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured || supabaseError) {
      return { data: null, error: { message: supabaseError } }
    }

    return await supabase.auth.signInWithPassword({ email, password })
  }

  const signOut = async () => {
    if (!isSupabaseConfigured || supabaseError) return
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured || supabaseError) {
      return { data: null, error: { message: supabaseError } }
    }

    return await supabase.auth.resetPasswordForEmail(email)
  }

  // Show configuration error if Supabase is not set up
  if (supabaseError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Yapılandırma Gerekli
          </h2>
          <p className="text-gray-600 mb-6">
            {supabaseError}
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left mb-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Debug Bilgisi:</h3>
            <div className="text-yellow-700 text-sm space-y-1">
              <p>URL: {import.meta.env.VITE_SUPABASE_URL || 'Tanımlı değil'}</p>
              <p>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Tanımlı' : 'Tanımlı değil'}</p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">Nasıl Yapılandırılır:</h3>
            <ol className="text-blue-800 text-sm space-y-1">
              <li>1. Tarayıcı konsolunu açın (F12)</li>
              <li>2. Console sekmesinde hata mesajlarını kontrol edin</li>
              <li>3. "Go to Supabase" butonuna tıklayın</li>
              <li>4. Proje ayarlarını kontrol edin</li>
              <li>5. Environment variables'ların doğru olduğundan emin olun</li>
            </ol>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    )
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}