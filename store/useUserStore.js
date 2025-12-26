import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,

  // Загрузка пользователя
  loadUser: async (telegramId) => {
    set({ loading: true })

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        // пользователь не существует — создаём БЕЗ имени
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({ telegram_id: telegramId })
          .select()
          .single()

        if (insertError) throw insertError

        set({ user: newUser, loading: false })
        return newUser
      }

      set({ user: data, loading: false })
      return data
    } catch (error) {
      console.error('Error loading user:', error)
      set({ loading: false })
      return null
    }
  },

  // Обновление профиля (имя, уровень и т.д.)
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
