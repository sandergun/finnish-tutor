'use client'

import { useState } from 'react'
import { useUserStore } from '@/store/useUserStore'
import { BookOpen, Trophy, User } from 'lucide-react'

export default function Dashboard() {
  const { user } = useUserStore()
  const [activeTab, setActiveTab] = useState('lesson')

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Hei, {user?.name}! 👋</h1>
          <p className="text-sm opacity-90">Уровень: {user?.level}</p>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-center">
              <div className="text-3xl font-bold">{user?.streak || 0} 🔥</div>
              <p className="text-xs opacity-80">дней подряд</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{user?.total_lessons || 0}</div>
              <p className="text-xs opacity-80">уроков пройдено</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{user?.total_words || 0}</div>
              <p className="text-xs opacity-80">слов изучено</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'lesson' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold mb-2">Скоро здесь появятся уроки</h2>
            <p className="text-gray-600">Мы работаем над контентом</p>
          </div>
        )}
        
        {activeTab === 'leaderboard' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold mb-2">Рейтинг</h2>
            <p className="text-gray-600">Соревнуйся с другими учениками</p>
          </div>
        )}
        
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">Твой профиль</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Имя</span>
                <span className="font-semibold">{user?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Уровень</span>
                <span className="font-semibold">{user?.level}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Цель</span>
                <span className="font-semibold">{user?.goal || 'Не указана'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Стрик</span>
                <span className="font-semibold">{user?.streak || 0} дней 🔥</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto flex justify-around items-center h-16">
          <button
            onClick={() => setActiveTab('lesson')}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition ${
              activeTab === 'lesson' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <BookOpen size={24} />
            <span className="text-xs font-medium">Урок</span>
          </button>
          
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition ${
              activeTab === 'leaderboard' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <Trophy size={24} />
            <span className="text-xs font-medium">Рейтинг</span>
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition ${
              activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <User size={24} />
            <span className="text-xs font-medium">Профиль</span>
          </button>
        </div>
      </div>
    </div>
  )
}