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
      // ВАЖНО: Сначала проверяем существует ли пользователь
      const { data: existing, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .maybeSingle()
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }
      
      // Если пользователь существует — просто логиним его
      if (existing) {
        console.log('User already exists, logging in...')
        set({ user: existing, loading: false })
        return existing
      }
      
      // Если не существует — создаём нового
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
      
      if (error) {
        // Если всё равно ошибка дубликата — загружаем существующего
        if (error.code === '23505') {
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', telegramId)
            .single()
          
          if (existingUser) {
            set({ user: existingUser, loading: false })
            return existingUser
          }
        }
        throw error
      }
      
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