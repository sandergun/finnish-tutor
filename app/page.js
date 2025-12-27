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
      const tg = window.Telegram?.WebApp
      
      let userId = null
      
      if (tg) {
        tg.ready()
        tg.expand()
        
        const tgUser = tg.initDataUnsafe?.user
        
        if (tgUser?.id) {
          userId = tgUser.id
          localStorage.setItem('test_telegram_id', userId.toString())
        }
      }
      
      if (!userId) {
        const savedId = localStorage.getItem('test_telegram_id')
        
        if (savedId) {
          userId = parseInt(savedId)
        } else {
          userId = Date.now()
          localStorage.setItem('test_telegram_id', userId.toString())
        }
      }
      
      setTelegramId(userId)
      await loadUser(userId)
    }
    
    initUser()
  }, [loadUser])

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

  if (!user || !user.name || user.name === 'Пользователь') {
    return <WelcomeScreen telegramId={telegramId} />
  }

  return <Dashboard />
}