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
      console.log('Creating user with telegram_id:', telegramId)
      
      // Сначала пытаемся загрузить существующего пользователя
      const { data: existing, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .maybeSingle()
      
      console.log('Check existing user:', { existing, checkError })
      
      // Если пользователь найден, возвращаем его
      if (existing) {
        console.log('User already exists, returning existing user')
        set({ user: existing, loading: false })
        return existing
      }
      
      // Если есть ошибка при проверке (кроме "не найден"), выбрасываем её
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }
      
      // Создаём нового пользователя
      console.log('Creating new user...')
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
        console.error('Insert error:', error)
        
        // Если ошибка дубликата (23505) - значит пользователь был создан между проверкой и вставкой
        // Загружаем его снова
        if (error.code === '23505') {
          console.log('Duplicate key error, fetching existing user...')
          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', telegramId)
            .single()
          
          if (fetchError) {
            throw fetchError
          }
          
          if (existingUser) {
            console.log('Found existing user after duplicate error')
            set({ user: existingUser, loading: false })
            return existingUser
          }
        }
        
        throw error
      }
      
      console.log('User created successfully:', data)
      set({ user: data, loading: false })
      return data
    } catch (error) {
      console.error('Error in createUser:', error)
      set({ loading: false })
      throw error // Пробрасываем ошибку дальше
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