import { create } from 'zustand'
import { supabase } from '../utils/supabaseClient'
import { authApi } from '../utils/api'

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isAdmin: false,
  loading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        set({ session, user: session.user })
        await get().fetchProfile()
      }
    } catch (error) {
      console.error('Auth init error:', error)
    } finally {
      set({ loading: false })
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      set({ session, user: session?.user || null })
      if (session) {
        await get().fetchProfile()
      } else {
        set({ profile: null, isAdmin: false })
      }
    })
  },

  fetchProfile: async () => {
    try {
      const [profileRes, adminRes] = await Promise.all([
        authApi.getProfile(),
        authApi.checkAdmin()
      ])
      set({ 
        profile: profileRes.data,
        isAdmin: adminRes.data.is_admin 
      })
    } catch (error) {
      console.error('Profile fetch error:', error)
    }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  signUp: async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    })
    if (error) throw error
    return data
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, profile: null, isAdmin: false })
  },
}))
