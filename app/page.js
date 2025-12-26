'use client'

import { useEffect, useState } from 'react'
import { useUserStore } from '@/store/useUserStore'
import WelcomeScreen from '@/components/WelcomeScreen'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const [telegramId, setTelegramId] = useState(null)
  const { user, loading, loadUser } = useUserStore()

  useEffect(() => {
    // Получаем данные из Telegram WebApp
    const tg = window.Telegram?.WebApp
    
    if (tg) {
      tg.ready()
      tg.expand()
      
      const user = tg.initDataUnsafe?.user
      
      if (user?.id) {
        setTelegramId(user.id)
        loadUser(user.id)
      }
    } else {
      // Для тестирования локально
      const testId = Math.floor(Math.random() * 1000000000)
      setTelegramId(testId)
      loadUser(testId)
    }
  }, [loadUser])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-600">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">🇫🇮</div>
          <div className="text-xl">Загрузка...</div>
        </div>
      </div>
    )
  }

  if (!user || !user.name || user.name === 'Пользователь') {
    return <WelcomeScreen telegramId={telegramId} />
  }

  return <Dashboard />
}