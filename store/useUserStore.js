import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useUserStore = create((set, get) => ({
  user: null,
  loading: true,
  completedLessons: [],
  progressData: [], // ⬅️ НОВОЕ: полные данные прогресса для графиков
  
  loadUser: async (telegramId) => {
    set({ loading: true })
    
    try {
      console.log('🔍 Loading user with telegram_id:', telegramId)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .maybeSingle()
      
      console.log('📦 LoadUser result:', { data, error })
      
      if (error) {
        console.error('❌ Error loading user:', error)
        set({ user: null, loading: false })
        return null
      }
      
      // Загружаем прогресс уроков
      if (data) {
        console.log('✅ User loaded successfully:', data)
        console.log('🆔 Telegram ID:', data.telegram_id)
        
        // ⬇️ ОБНОВЛЕНО: загружаем ВСЕ данные прогресса
        const { data: progress, error: progressError } = await supabase
          .from('progress')
          .select('*') // ⬅️ Получаем все поля: lesson_id, score, completed, completed_at
          .eq('telegram_id', data.telegram_id)
          .order('completed_at', { ascending: true }) // Сортируем по дате
        
        if (progressError) {
          console.error('❌ Error loading progress:', progressError)
        } else {
          console.log('📊 Progress loaded:', progress)
        }
        
        set({ 
          user: data, 
          loading: false,
          completedLessons: progress 
            ? progress.filter(p => p.completed).map(p => p.lesson_id) 
            : [],
          progressData: progress || [] // ⬅️ НОВОЕ: сохраняем полные данные
        })
      } else {
        console.log('⚠️ No user found')
        set({ user: null, loading: false })
      }
      
      return data
    } catch (error) {
      console.error('💥 Error in loadUser:', error)
      set({ user: null, loading: false })
      return null
    }
  },
  
  createUser: async (telegramId, name = 'Пользователь') => {
    try {
      console.log('👤 Creating user with telegram_id:', telegramId)
      
      const { data: existing, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .maybeSingle()
      
      console.log('🔎 Check existing user:', { existing, checkError })
      
      if (existing) {
        console.log('✅ User already exists, returning existing user')
        set({ user: existing, loading: false })
        return existing
      }
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }
      
      console.log('➕ Creating new user...')
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
        console.error('❌ Insert error:', error)
        
        if (error.code === '23505') {
          console.log('🔄 Duplicate key error, fetching existing user...')
          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', telegramId)
            .single()
          
          if (fetchError) {
            throw fetchError
          }
          
          if (existingUser) {
            console.log('✅ Found existing user after duplicate error')
            set({ user: existingUser, loading: false })
            return existingUser
          }
        }
        
        throw error
      }
      
      console.log('✅ User created successfully:', data)
      set({ user: data, loading: false })
      return data
    } catch (error) {
      console.error('💥 Error in createUser:', error)
      set({ loading: false })
      throw error
    }
  },
  
  updateProfile: async (updates) => {
    const user = get().user
    if (!user) {
      console.error('❌ No user to update')
      return null
    }
    
    try {
      console.log('🔄 Updating profile:', updates)
      
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('telegram_id', user.telegram_id)
        .select()
        .single()
      
      if (error) throw error
      
      console.log('✅ Profile updated:', data)
      set({ user: data })
      return data
    } catch (error) {
      console.error('❌ Error updating profile:', error)
      return null
    }
  },
  
  // Сохранение прогресса урока
  saveProgress: async (lessonData) => {
    const user = get().user
    if (!user) {
      console.error('❌ No user to save progress')
      return null
    }
    
    if (!user.telegram_id) {
      console.error('❌ User telegram_id is missing!')
      return null
    }
    
    try {
      console.log('💾 Saving progress:', lessonData)
      
      // Проверяем, был ли урок уже пройден
      const { data: existing } = await supabase
        .from('progress')
        .select('*')
        .eq('telegram_id', user.telegram_id)
        .eq('lesson_id', lessonData.lessonId)
        .maybeSingle()
      
      const progressData = {
        telegram_id: user.telegram_id,
        lesson_id: lessonData.lessonId,
        score: lessonData.score,
        completed: lessonData.score >= 70,
        completed_at: new Date().toISOString()
      }
      
      // Если урок уже был пройден, обновляем запись
      if (existing) {
        const { error } = await supabase
          .from('progress')
          .update(progressData)
          .eq('telegram_id', user.telegram_id)
          .eq('lesson_id', lessonData.lessonId)
        
        if (error) throw error
        console.log('✅ Progress updated')
      } else {
        // Создаём новую запись
        const { error } = await supabase
          .from('progress')
          .insert([progressData])
        
        if (error) throw error
        console.log('✅ Progress created')
      }
      
      // Обновляем статистику пользователя
      const newTotalLessons = lessonData.score >= 70 
        ? user.total_lessons + (existing ? 0 : 1) 
        : user.total_lessons
      
      const newTotalWords = user.total_words + (lessonData.newWords || 0)
      
      await get().updateProfile({
        total_lessons: newTotalLessons,
        total_words: newTotalWords,
        last_active: new Date().toISOString()
      })
      
      // ⬇️ ОБНОВЛЕНО: перезагружаем данные прогресса для графиков
      const { data: updatedProgress } = await supabase
        .from('progress')
        .select('*')
        .eq('telegram_id', user.telegram_id)
        .order('completed_at', { ascending: true })
      
      // Обновляем список пройденных уроков и данные прогресса
      if (lessonData.score >= 70) {
        const completedLessons = get().completedLessons
        if (!completedLessons.includes(lessonData.lessonId)) {
          set({ 
            completedLessons: [...completedLessons, lessonData.lessonId],
            progressData: updatedProgress || [] // ⬅️ НОВОЕ
          })
        }
      } else {
        set({ progressData: updatedProgress || [] }) // ⬅️ НОВОЕ
      }
      
      console.log('✅ Progress saved successfully!')
      return true
    } catch (error) {
      console.error('💥 Error saving progress:', error)
      return false
    }
  },
  
  // Проверка, пройден ли урок
  isLessonCompleted: (lessonId) => {
    const completedLessons = get().completedLessons
    return completedLessons.includes(lessonId)
  }
}))