'use client'

import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/useUserStore'
import { BookOpen, Trophy, User, Award } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ACHIEVEMENTS } from '@/lib/achievements'

export default function Dashboard() {
  const { user } = useUserStore()
  const [activeTab, setActiveTab] = useState('lesson')
  const [achievements, setAchievements] = useState([])
  const [todayCompleted, setTodayCompleted] = useState(false)
  const [showAchievement, setShowAchievement] = useState(null)

  useEffect(() => {
    if (user) {
      loadAchievements()
      checkTodayLesson()
    }
  }, [user])

  const loadAchievements = async () => {
    const { data } = await supabase
      .from('achievements')
      .select('*')
      .eq('telegram_id', user.telegram_id)
      .order('unlocked_at', { ascending: false })
    
    setAchievements(data || [])
  }

  const checkTodayLesson = async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('progress')
      .select('id')
      .eq('telegram_id', user.telegram_id)
      .gte('completed_at', today)
      .limit(1)
    
    setTodayCompleted(data && data.length > 0)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Хедер */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Hei, {user?.name}! 👋</h1>
              <p className="text-sm opacity-90">Уровень: {user?.level}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{user?.streak || 0} 🔥</div>
              <p className="text-xs opacity-80">дней подряд</p>
            </div>
          </div>

          {/* Прогресс */}
          <div className="bg-white/20 backdrop-blur rounded-full h-3 overflow-hidden mb-2">
            <div 
              className="bg-white h-full transition-all duration-500"
              style={{ width: todayCompleted ? '100%' : '0%' }}
            />
          </div>
          <p className="text-xs opacity-80 text-center mb-4">
            {todayCompleted ? '✓ Урок на сегодня выполнен!' : 'Выполни урок сегодня'}
          </p>

          {/* Статистика */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{user?.total_lessons || 0}</div>
              <p className="text-xs opacity-80">уроков</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{user?.total_words || 0}</div>
              <p className="text-xs opacity-80">слов</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{achievements.length}</div>
              <p className="text-xs opacity-80">наград</p>
            </div>
          </div>

          {/* Последние достижения */}
          {achievements.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {achievements.slice(0, 5).map((ach) => {
                const achievementData = ACHIEVEMENTS[ach.achievement_type]
                return (
                  <button
                    key={ach.id}
                    onClick={() => setShowAchievement(achievementData)}
                    className="bg-white/20 backdrop-blur rounded-lg p-3 flex-shrink-0 hover:bg-white/30 transition"
                  >
                    <div className="text-2xl mb-1">{achievementData?.icon}</div>
                    <p className="text-xs font-semibold">{achievementData?.name}</p>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Контент */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'lesson' && <LessonTab />}
        {activeTab === 'leaderboard' && <LeaderboardTab />}
        {activeTab === 'achievements' && <AchievementsTab achievements={achievements} />}
        {activeTab === 'profile' && <ProfileTab />}
      </div>

      {/* Модалка достижения */}
      {showAchievement && (
        <AchievementModal
          achievement={showAchievement}
          onClose={() => setShowAchievement(null)}
        />
      )}

      {/* Нижнее меню */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto flex justify-around items-center h-16">
          <NavButton
            icon={<BookOpen size={24} />}
            label="Урок"
            active={activeTab === 'lesson'}
            onClick={() => setActiveTab('lesson')}
          />
          <NavButton
            icon={<Trophy size={24} />}
            label="Рейтинг"
            active={activeTab === 'leaderboard'}
            onClick={() => setActiveTab('leaderboard')}
          />
          <NavButton
            icon={<Award size={24} />}
            label="Награды"
            active={activeTab === 'achievements'}
            onClick={() => setActiveTab('achievements')}
          />
          <NavButton
            icon={<User size={24} />}
            label="Профиль"
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          />
        </div>
      </div>
    </div>
  )
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition ${
        active ? 'text-blue-600' : 'text-gray-400'
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

function LessonTab() {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📚</div>
      <h2 className="text-2xl font-bold mb-2">Скоро здесь появятся уроки</h2>
      <p className="text-gray-600">Мы работаем над контентом</p>
    </div>
  )
}

function LeaderboardTab() {
  const [leaders, setLeaders] = useState([])
  const [timeframe, setTimeframe] = useState('week')
  const { user } = useUserStore()

  useEffect(() => {
    loadLeaderboard()
  }, [timeframe])

  const loadLeaderboard = async () => {
    const field = timeframe === 'week' ? 'week_points' : 'total_points'
    
    const { data } = await supabase
      .from('leaderboard')
      .select(`
        telegram_id,
        ${field},
        users (name, level)
      `)
      .order(field, { ascending: false })
      .limit(50)

    setLeaders(data || [])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Рейтинг</h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => setTimeframe('week')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
              timeframe === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Неделя
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
              timeframe === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Всё время
          </button>
        </div>
      </div>

      {leaders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-gray-600">Будь первым в рейтинге!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaders.map((entry, index) => {
            const isCurrentUser = entry.telegram_id === user?.telegram_id
            const points = entry[timeframe === 'week' ? 'week_points' : 'total_points']
            
            return (
              <div
                key={entry.telegram_id}
                className={`p-4 rounded-xl flex items-center justify-between ${
                  isCurrentUser
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : index < 3
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50'
                      : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                  </div>
                  <div>
                    <p className="font-bold">{entry.users.name}</p>
                    <p className="text-sm text-gray-500">{entry.users.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{points}</p>
                  <p className="text-xs text-gray-500">очков</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AchievementsTab({ achievements }) {
  const allAchievements = Object.values(ACHIEVEMENTS)
  const unlockedIds = achievements.map(a => a.achievement_type)
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Твои награды</h2>
      
      <div className="grid grid-cols-2 gap-3">
        {allAchievements.map((ach) => {
          const isUnlocked = unlockedIds.includes(ach.id)
          
          return (
            <div
              key={ach.id}
              className={`p-4 rounded-xl ${
                isUnlocked
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400'
                  : 'bg-gray-100 opacity-50'
              }`}
            >
              <div className="text-4xl mb-2">{ach.icon}</div>
              <h3 className="font-bold text-sm mb-1">{ach.name}</h3>
              <p className="text-xs text-gray-600 mb-2">{ach.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-600">
                  +{ach.points} очков
                </span>
                {isUnlocked && (
                  <span className="text-xs text-green-600 font-semibold">✓</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProfileTab() {
  const { user } = useUserStore()
  
  return (
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
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Уроков пройдено</span>
          <span className="font-semibold">{user?.total_lessons || 0}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Слов изучено</span>
          <span className="font-semibold">{user?.total_words || 0}</span>
        </div>
      </div>
    </div>
  )
}

function AchievementModal({ achievement, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
        <div className="text-6xl mb-4">{achievement.icon}</div>
        <h2 className="text-2xl font-bold mb-2">{achievement.name}</h2>
        <p className="text-gray-600 mb-4">{achievement.description}</p>
        <div className="bg-blue-50 rounded-xl p-3 mb-6">
          <p className="text-blue-600 font-bold">+{achievement.points} очков</p>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
        >
          Закрыть
        </button>
      </div>
    </div>
  )
}