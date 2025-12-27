import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useUserStore = create((set, get) => ({
  user: null,
  loading: true,
  
  loadUser: async (telegramId) => {
    set({ loading: true })
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .maybeSingle()
      
      if (error) {
        console.error('Error loading user:', error)
        set({ user: null, loading: false })
        return null
      }
      
      set({ user: data, loading: false })
      return data
    } catch (error) {
      console.error('Error in loadUser:', error)
      set({ user: null, loading: false })
      return null
    }
  },
  
  createUser: async (telegramId, name = 'Пользователь') => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{ 
          telegram_id: telegramId, 
          name: name,
          level: 'A0',
          streak: 0,
          total_lessons: 0,
          total_words: 0
        }])
        .select()
        .single()
      
      if (error) throw error
      
      set({ user: data, loading: false })
      return data
    } catch (error) {
      console.error('Error creating user:', error)
      set({ loading: false })
      return null
    }
  },
  
  updateProfile: async (updates) => {
    const user = get().user
    if (!user) return null
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('telegram_id', user.telegram_id)
        .select()
        .single()
      
      if (error) throw error
      
      set({ user: data })
      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      return null
    }
  }
}))