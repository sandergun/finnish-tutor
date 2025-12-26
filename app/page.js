'use client'

import { useEffect, useState } from 'react'
import { useUserStore } from '@/store/useUserStore'
import WelcomeScreen from '@/components/WelcomeScreen'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const [telegramId, setTelegramId] = useState(null)
  const [mounted, setMounted] = useState(false)
  const { user, loading, loadUser } = useUserStore()

  useEffect(() => {
    setMounted(true)
    
    const initUser = async () => {
      // Получаем данные из Telegram WebApp
      const tg = window.Telegram?.WebApp
      
      let userId = null
      
      if (tg) {
        tg.ready()
        tg.expand()
        
        const tgUser = tg.initDataUnsafe?.user
        
        if (tgUser?.id) {
          console.log('✅ Telegram ID найден:', tgUser.id)
          userId = tgUser.id
          // Сохраняем в localStorage
          localStorage.setItem('test_telegram_id', userId.toString())
        }
      }
      
      // Если нет Telegram ID, проверяем localStorage
      if (!userId) {
        const savedId = localStorage.getItem('test_telegram_id')
        
        if (savedId) {
          console.log('💾 ID найден в localStorage:', savedId)
          userId = parseInt(savedId)
        } else {
          console.log('⚠️ Создаём новый тестовый ID')
          userId = Date.now()
          localStorage.setItem('test_telegram_id', userId.toString())
        }
      }
      
      setTelegramId(userId)
      await loadUser(userId)
    }
    
    initUser()
  }, [loadUser])

  // Показываем загрузку
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-600">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">🇫🇮</div>
          <div className="text-xl">Загрузка...</div>
        </div>
      </div>
    )
  }

  // Показываем Welcome Screen если пользователя нет
  if (!user || !user.name || user.name === 'Пользователь') {
    return <WelcomeScreen telegramId={telegramId} />
  }

  // Показываем Dashboard если пользователь есть
  return <Dashboard />
}