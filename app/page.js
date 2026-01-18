'use client'

import { useEffect, useState } from 'react'
import { useUserStore } from '@/store/useUserStore'
import { useAchievementsStore } from '@/store/useAchievementsStore'
import WelcomeScreen from '@/components/WelcomeScreen'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const [telegramId, setTelegramId] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const user = useUserStore((state) => state.user)
  const loading = useUserStore((state) => state.loading)
  const loadUser = useUserStore((state) => state.loadUser)
  const loadAchievements = useAchievementsStore((state) => state.loadAchievements)

  useEffect(() => {
    setMounted(true)
    
    const savedTheme = localStorage.getItem('theme')
    setDarkMode(savedTheme === 'dark')
    
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
      await loadAchievements(userId)
    }
    
    initUser()
  }, [loadUser, loadAchievements])

  if (!mounted || loading) {
    const bgClass = darkMode 
      ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' 
      : 'bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700'
    
    return (
      <div className={`flex items-center justify-center min-h-screen ${bgClass} transition-colors duration-300`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-blue-600' : 'bg-purple-400'}`}></div>
          <div className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-purple-600' : 'bg-blue-400'}`}></div>
        </div>
        
        <div className="text-white text-center relative z-10">
          <div className="text-8xl mb-6 animate-bounce">🇫🇮</div>
          <div className="text-2xl font-semibold mb-4">Oppaan</div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !user.name || user.name === 'Пользователь') {
    return <WelcomeScreen telegramId={telegramId} />
  }

  return <Dashboard />
}