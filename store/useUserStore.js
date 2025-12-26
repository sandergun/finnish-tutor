import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useUserStore = create((set, get) => ({
  user: null,
  loading: true,
  
  // Загрузка пользователя
loadUser: async (telegramId) => {
  console.log('📥 Загружаем пользователя с ID:', telegramId)
  
  set({ loading: true })
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .maybeSingle() // Используем maybeSingle вместо single
    
    if (error) {
      console.error('❌ Ошибка загрузки:', error)
      set({ user: null, loading: false })
      return null
    }
    
    if (!data) {
      console.log('👤 Пользователь не найден')
      set({ user: null, loading: false })
      return null
    }
    
    console.log('✅ Пользователь загружен:', data)
    set({ user: data, loading: false })
    return data
  } catch (error) {
    console.error('💥 Ошибка в loadUser:', error)
    set({ user: null, loading: false })
    return null
  }
},
  
  // Создание пользователя
  createUser: async (telegramId, name = 'Пользователь') => {
    console.log('➕ Создаём пользователя:', { telegramId, name })
    
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
      
      if (error) {
        console.error('❌ Ошибка создания пользователя:', error)
        throw error
      }
      
      console.log('✅ Пользователь создан:', data)
      set({ user: data, loading: false })
      return data
    } catch (error) {
      console.error('💥 Ошибка в createUser:', error)
      set({ loading: false })
      return null
    }
  },
  
  // Обновление профиля
  updateProfile: async (updates) => {
    const user = get().user
    if (!user) {
      console.error('❌ Пользователь не найден для обновления')
      return null
    }
    
    console.log('🔄 Обновляем профиль:', updates)
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('telegram_id', user.telegram_id)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Ошибка обновления профиля:', error)
        throw error
      }
      
      console.log('✅ Профиль обновлён:', data)
      set({ user: data })
      return data
    } catch (error) {
      console.error('💥 Ошибка в updateProfile:', error)
      return null
    }
  }
}))