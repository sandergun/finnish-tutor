'use client'

import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/useUserStore'
import { Moon, Sun } from 'lucide-react'
import { sounds } from '@/lib/sounds'

export default function WelcomeScreen({ telegramId }) {
  const [name, setName] = useState('')
  const [level, setLevel] = useState('A0')
  const [goal, setGoal] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
<<<<<<< HEAD
  const [mounted, setMounted] = useState(false) // ДОБАВЬ
  const { createUser, updateProfile } = useUserStore()

  useEffect(() => {
    setMounted(true) // ДОБАВЬ
=======
  const [mounted, setMounted] = useState(false)
  const { createUser, updateProfile } = useUserStore()

  useEffect(() => {
    setMounted(true)
>>>>>>> cf50603 (MWP Working)
    const savedTheme = localStorage.getItem('theme')
    setDarkMode(savedTheme === 'dark')
  }, [])

<<<<<<< HEAD
  // ДОБАВЬ ЭТУ ПРОВЕРКУ
=======
>>>>>>> cf50603 (MWP Working)
  if (!mounted) {
    return null
  }

<<<<<<< HEAD
  // ... остальной код

=======
>>>>>>> cf50603 (MWP Working)
  const toggleTheme = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
    sounds.playClick()
  }

  const handleStart = async () => {
    if (!name.trim() || isLoading) return
    
    sounds.playClick()
    setIsLoading(true)

    const user = await createUser(telegramId, name)
    
    if (user) {
      const needsUpdate = 
        user.name === 'Пользователь' || 
        user.name !== name ||
        user.level !== level ||
        !user.goal
      
<<<<<<< HEAD
      const user = await createUser(telegramId, name)
      
      console.log('User created/loaded:', user)
      
      if (user) {
        const needsUpdate = 
          user.name === 'Пользователь' || 
          user.name !== name ||
          user.level !== level ||
          !user.goal
        
        if (needsUpdate) {
          console.log('Updating profile...')
          await updateProfile({ 
            name: name,
            level: level, 
            goal: goal 
          })
        }
        
        sounds.playSuccess()
        console.log('Registration successful!')
      } else {
        throw new Error('Failed to create/load user')
      }
    } catch (error) {
      console.error('Error in handleStart:', error)
      sounds.playWrong()
      
      if (error.code === '23505') {
        alert('Этот аккаунт уже зарегистрирован. Попробуйте перезагрузить страницу.')
      } else {
        alert('Ошибка регистрации. Попробуйте ещё раз.')
      }
    } finally {
      setIsLoading(false)
=======
      if (needsUpdate) {
        await updateProfile({ 
          name: name,
          level: level, 
          goal: goal 
        })
      }
      
      sounds.playSuccess()
>>>>>>> cf50603 (MWP Working)
    }
    
    setIsLoading(false)
  }

  const bgClass = darkMode 
    ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' 
    : 'bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700'
  
  const cardClass = darkMode
    ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700'
    : 'bg-white/10 backdrop-blur-xl border border-white/20'

  return (
    <div className={`min-h-screen ${bgClass} text-white p-6 flex items-center justify-center transition-colors duration-300`}>
      {/* Декоративные элементы фона */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-blue-600' : 'bg-purple-400'}`}></div>
        <div className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-purple-600' : 'bg-blue-400'}`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 ${darkMode ? 'bg-pink-600' : 'bg-pink-400'}`}></div>
      </div>

      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all hover:scale-110 z-10 backdrop-blur-sm"
      >
        {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="text-8xl mb-4 animate-bounce">🇫🇮</div>
          <h1 className="text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
            Oppaan
          </h1>
          <p className="text-xl opacity-90">Твой персональный репетитор финского</p>
        </div>

        <div className={`${cardClass} rounded-2xl p-6 mb-6 shadow-2xl`}>
          <input
            type="text"
            placeholder="Как тебя зовут?"
            className={`w-full ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-white/20'} backdrop-blur rounded-xl px-4 py-3 text-white placeholder-white/60 border-2 ${darkMode ? '' : 'border-white/30'} focus:border-white/60 focus:outline-none mb-4 transition-all focus:scale-[1.02]`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />

          <p className="text-sm mb-2 opacity-80">Твой уровень финского:</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {['A0', 'A1', 'A2'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => { sounds.playClick(); setLevel(lvl); }}
                disabled={isLoading}
                className={`py-3 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 ${
                  level === lvl
                    ? darkMode
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-white text-blue-600 shadow-lg'
                    : darkMode
                      ? 'bg-gray-700/50 hover:bg-gray-600/50'
                      : 'bg-white/20 hover:bg-white/30'
                } disabled:opacity-50`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <select
            className={`w-full ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-white/20'} backdrop-blur rounded-xl px-4 py-3 text-white border-2 ${darkMode ? '' : 'border-white/30'} focus:border-white/60 focus:outline-none transition-all`}
            value={goal}
            onChange={(e) => { sounds.playClick(); setGoal(e.target.value); }}
            disabled={isLoading}
          >
            <option value="" className="text-gray-800 bg-white">Выбери цель обучения</option>
            <option value="work" className="text-gray-800 bg-white">Работа в Финляндии</option>
            <option value="study" className="text-gray-800 bg-white">Учёба в Финляндии</option>
            <option value="travel" className="text-gray-800 bg-white">Путешествия</option>
            <option value="hobby" className="text-gray-800 bg-white">Для себя</option>
          </select>
        </div>

        <button
          onClick={handleStart}
          disabled={!name.trim() || isLoading}
          className="w-full bg-white text-blue-600 font-bold py-4 rounded-xl hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 shadow-2xl disabled:hover:scale-100"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Загрузка...
            </span>
          ) : (
            'Начать обучение'
          )}
        </button>

        <p className="text-center text-sm opacity-70 mt-4">
          ⏰ Всего 10-30 минут в день для результата
        </p>
      </div>
    </div>
  )
}