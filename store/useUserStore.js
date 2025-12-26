import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useUserStore = create((set, get) => ({
  user: null,
  loading: true,
  
  // Загрузка пользователя
  loadUser: async (telegramId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single()
      
      if (error && error.code === 'PGRST116') {
        // Пользователь не найден - создадим нового
        return get().createUser(telegramId)
      }
      
      if (error) throw error
      set({ user: data, loading: false })
      return data
    } catch (error) {
      console.error('Error loading user:', error)
      set({ loading: false })
      return null
    }
  },
  
  // Создание пользователя
  createUser: async (telegramId, name = 'Пользователь') => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{ telegram_id: telegramId, name }])
        .select()
        .single()
      
      if (error) throw error
      set({ user: data, loading: false })
      return data
    } catch (error) {
      console.error('Error creating user:', error)
      return null
    }
  },
  
  // Обновление профиля
  updateProfile: async (updates) => {
    const user = get().user
    if (!user) return
    
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