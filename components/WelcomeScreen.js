'use client'

import { useState } from 'react'
import { useUserStore } from '@/store/useUserStore'

export default function WelcomeScreen({ telegramId }) {
  const [name, setName] = useState('')
  const [level, setLevel] = useState('A0')
  const [goal, setGoal] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { createUser, updateProfile } = useUserStore()

  const handleStart = async () => {
    if (!name.trim() || isLoading) return
    
    setIsLoading(true)

    try {
      const newUser = await createUser(telegramId, name)
      
      if (newUser) {
        await updateProfile({ level, goal })
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Ошибка регистрации. Попробуйте ещё раз.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">🇫🇮</div>
          <h1 className="text-4xl font-bold mb-2">Oppaan</h1>
          <p className="text-lg opacity-90">Твой персональный репетитор финского</p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6">
          <input
            type="text"
            placeholder="Как тебя зовут?"
            className="w-full bg-white/20 backdrop-blur rounded-xl px-4 py-3 text-white placeholder-white/60 border-2 border-white/30 focus:border-white/60 focus:outline-none mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />

          <p className="text-sm mb-2 opacity-80">Твой уровень финского:</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {['A0', 'A1', 'A2'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                disabled={isLoading}
                className={`py-3 rounded-xl font-semibold transition ${
                  level === lvl
                    ? 'bg-white text-blue-600'
                    : 'bg-white/20 hover:bg-white/30'
                } disabled:opacity-50`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <select
            className="w-full bg-white/20 backdrop-blur rounded-xl px-4 py-3 text-white border-2 border-white/30 focus:border-white/60 focus:outline-none"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={isLoading}
          >
            <option value="" className="text-gray-800">Выбери цель обучения</option>
            <option value="work" className="text-gray-800">Работа в Финляндии</option>
            <option value="study" className="text-gray-800">Учёба в Финляндии</option>
            <option value="travel" className="text-gray-800">Путешествия</option>
            <option value="hobby" className="text-gray-800">Для себя</option>
          </select>
        </div>

        <button
          onClick={handleStart}
          disabled={!name.trim() || isLoading}
          className="w-full bg-white text-blue-600 font-bold py-4 rounded-xl hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Загрузка...' : 'Начать обучение'}
        </button>

        <p className="text-center text-sm opacity-70 mt-4">
          Всего 10-30 минут в день для результата
        </p>
      </div>
    </div>
  )
}