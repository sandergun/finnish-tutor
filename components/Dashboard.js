'use client'

import AchievementPopup from './AchievementPopup'
import AdminPanel from './AdminPanel'
import Achievements from './Achievements'
import StatsCharts from './StatsCharts'
import { BookOpen, Trophy, BarChart3, User, Sparkles, CheckCircle, Play, Moon, Sun, Volume2, VolumeX, Star, Loader2 } from 'lucide-react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useUserStore } from '@/store/useUserStore'
import LessonPlayer from './LessonPlayer'
import { getAllLessons } from '@/lib/lessonsData'
import { sounds } from '@/lib/sounds'

export default function Dashboard() {
  const { user, isLessonCompleted, saveProgress, fullProgress } = useUserStore()
  const [activeTab, setActiveTab] = useState('lessons')
  const [currentLesson, setCurrentLesson] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)

  const loadLessons = useCallback(async () => {
    setLoading(true);
    console.log('🔄 Loading all lessons...');
    try {
      const allLessons = await getAllLessons();
      const sortedLessons = [...allLessons].sort((a, b) => {
        const levelCompare = a.level.localeCompare(b.level);
        if (levelCompare !== 0) return levelCompare;
        return a.number - b.number;
      });
      setLessons(sortedLessons);
      console.log(`✅ Loaded and sorted ${sortedLessons.length} lessons.`);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);
  
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme')
    setDarkMode(savedTheme === 'dark')
    
    const savedSound = localStorage.getItem('sound')
    const enabled = savedSound !== 'false'
    setSoundEnabled(enabled)
    sounds.setEnabled(enabled)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader2 className="w-16 h-16 animate-spin text-blue-500" />
      </div>
    );
  }

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    sounds.playClick();
  }

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    sounds.setEnabled(newState);
    localStorage.setItem('sound', newState.toString());
    if (newState) sounds.playClick();
  }

  const handleLessonComplete = async (lessonData) => {
    await saveProgress(lessonData);
    setCurrentLesson(null);
    loadLessons();
  }

  const handleTabChange = (tab) => {
    sounds.playClick();
    setActiveTab(tab);
  }

  if (currentLesson) {
    return (
      <LessonPlayer 
        lesson={currentLesson}
        onComplete={handleLessonComplete}
        onClose={() => { sounds.playClick(); setCurrentLesson(null); }}
      />
    )
  }

  const bgClass = darkMode 
    ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' 
    : 'bg-gradient-to-br from-blue-50 via-white to-purple-50';

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-10 ${darkMode ? 'bg-blue-500' : 'bg-purple-300'}`}></div>
        <div className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-10 ${darkMode ? 'bg-purple-500' : 'bg-blue-300'}`}></div>
      </div>

      <div className={`relative z-10 ${darkMode ? 'bg-gradient-to-r from-gray-800 to-blue-900' : 'bg-gradient-to-r from-blue-600 to-purple-600'} text-white p-6 shadow-xl`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Привет, {user?.name}! 👋</h1>
              <p className="text-blue-100 mt-1">Уровень: {user?.level}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSound}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all hover:scale-110 relative z-50"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all hover:scale-110 relative z-50"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="text-right">
                <div className="text-3xl font-bold">{user?.streak || 0} 🔥</div>
                <div className="text-xs text-blue-100">дней подряд</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center hover:bg-white/20 transition-all hover:scale-105">
              <div className="text-2xl font-bold">{user?.total_lessons || 0}</div>
              <div className="text-xs text-blue-100">Уроков</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center hover:bg-white/20 transition-all hover:scale-105">
              <div className="text-2xl font-bold">{user?.total_words || 0}</div>
              <div className="text-xs text-blue-100">Слов</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center hover:bg-white/20 transition-all hover:scale-105">
              <div className="text-2xl font-bold">{user?.achievements?.length || 0}</div>
              <div className="text-xs text-blue-100">Наград</div>
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-0 max-w-4xl mx-auto pb-24 px-4">
        {activeTab === 'lessons' && (
          <LessonsTab 
            lessons={lessons}
            loading={loading}
            userLevel={user?.level} 
            onStartLesson={(lesson) => { sounds.playClick(); setCurrentLesson(lesson); }}
            isLessonCompleted={isLessonCompleted}
            darkMode={darkMode}
          />
        )}
        {activeTab === 'achievements' && <Achievements darkMode={darkMode} />}
        {activeTab === 'stats' && <StatsTab fullProgress={fullProgress} darkMode={darkMode} />}
        {activeTab === 'profile' && <ProfileTab user={user} darkMode={darkMode} />}
        {activeTab === 'admin' && (
          <AdminPanel 
            user={user}
            darkMode={darkMode}
            onLessonGenerated={loadLessons}
          />
        )}
      </main>

      <footer className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border-t shadow-2xl z-50`}>
        <div className="max-w-4xl mx-auto flex">
          <TabButton icon={BookOpen} label="Уроки" active={activeTab === 'lessons'} onClick={() => handleTabChange('lessons')} darkMode={darkMode} />
          <TabButton icon={Trophy} label="Награды" active={activeTab === 'achievements'} onClick={() => handleTabChange('achievements')} darkMode={darkMode} />
          <TabButton icon={BarChart3} label="Статистика" active={activeTab === 'stats'} onClick={() => handleTabChange('stats')} darkMode={darkMode} />
          <TabButton icon={User} label="Профиль" active={activeTab === 'profile'} onClick={() => handleTabChange('profile')} darkMode={darkMode} />
          <TabButton icon={Sparkles} label="Admin" active={activeTab === 'admin'} onClick={() => handleTabChange('admin')} darkMode={darkMode} />
        </div>
      </footer>
      <AchievementPopup />
    </div>
  )
}

function TabButton({ icon: Icon, label, active, onClick, darkMode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center py-3 transition-all cursor-pointer select-none ${
        active ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600')
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      <Icon className={`w-6 h-6 mb-1 ${active ? 'stroke-2' : ''} transition-transform ${active ? 'scale-110' : ''}`} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

function LessonsTab({ lessons, loading, userLevel, onStartLesson, isLessonCompleted, darkMode }) {
  const cardClass = darkMode
    ? 'bg-gray-800/50 border-gray-700 hover:border-purple-500'
    : 'bg-white/70 border-gray-200 hover:shadow-xl hover:border-purple-300'
 
  const textClass = darkMode ? 'text-white' : 'text-gray-800'
  const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-600'
 
  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
        <p className={`mt-4 ${textSecondaryClass}`}>Загрузка уроков...</p>
      </div>
    )
  }
 
  return (
    <div className="pt-6">
      <h2 className={`text-3xl font-bold ${textClass} mb-6 px-6`}>📚 Все уроки</h2>
      <div className="space-y-4">
        {lessons.length === 0 ? (
          <div className={`text-center py-16 px-6 rounded-2xl ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
            <div className="text-6xl mb-4">🧐</div>
            <h3 className={`text-xl font-bold ${textClass}`}>Уроков пока нет</h3>
            <p className={`mt-2 ${textSecondaryClass}`}>Перейдите во вкладку 'Admin', чтобы создать свой первый AI-урок!</p>
          </div>
        ) : lessons.map((lesson) => {
          const completed = isLessonCompleted(lesson.id)
          const isRecommended = lesson.level === userLevel;
          return (
            <div key={lesson.id} className={`${cardClass} backdrop-blur-sm rounded-2xl p-5 mx-4 border-2 transition-all hover:scale-[1.01] ${isRecommended ? 'border-purple-500/50' : 'border-transparent'}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-sm font-semibold px-2 py-1 rounded ${isRecommended ? (darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700') : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500')}`}>{lesson.level}</span>
                    {isRecommended && <Star className="w-5 h-5 text-yellow-400 fill-current" />}
                  </div>
                  <h3 className={`text-lg font-bold ${textClass}`}>{lesson.title}</h3>
                  <p className={`text-sm ${textSecondaryClass} mt-1`}>{lesson.words?.length || 0} слов • {lesson.questions?.length || 0} вопросов</p>
                </div>
                <div className="flex items-center gap-4">
                  {completed && <CheckCircle className="w-6 h-6 text-green-500" />}
                  <button onClick={() => onStartLesson(lesson)} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg"><Play className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {lessons.length === 0 && (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className="text-6xl mb-4">🔒</div>
          <p>Уроки для уровня {userLevel} скоро появятся!</p>
        </div>
      )}
    </div>
  )
}

function StatsTab({ fullProgress, darkMode }) {
  return <StatsCharts progress={fullProgress} />
}

function ProfileTab({ user, darkMode }) {
  const cardClass = darkMode ? 'bg-gray-800' : 'bg-white'
  const textClass = darkMode ? 'text-white' : 'text-gray-800'
  const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-500'
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-100'
  
  return (
    <div className="p-6">
      <h2 className={`text-2xl font-bold ${textClass} mb-6`}>👤 Профиль</h2>
      <div className={`${cardClass} rounded-2xl p-6 shadow-xl`}>
        <div className="text-center mb-6">
          <div className={`w-24 h-24 ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-full mx-auto flex items-center justify-center mb-3`}>
            <span className="text-4xl">👤</span>
          </div>
          <h3 className={`text-xl font-bold ${textClass}`}>{user?.name}</h3>
          <p className={`${textSecondaryClass} mt-1`}>Уровень: {user?.level}</p>
        </div>

        <div className="space-y-3">
          <ProfileItem label="Telegram ID" value={user?.telegram_id} darkMode={darkMode} borderClass={borderClass} />
          <ProfileItem label="Цель обучения" value={user?.goal || 'Не указана'} darkMode={darkMode} borderClass={borderClass} />
          <ProfileItem 
            label="Дата регистрации" 
            value={user?.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : '-'} 
            darkMode={darkMode}
            borderClass={borderClass}
          />
        </div>
      </div>
    </div>
  )
}

function ProfileItem({ label, value, darkMode, borderClass }) {
  const textClass = darkMode ? 'text-gray-300' : 'text-gray-600'
  const valueClass = darkMode ? 'text-white' : 'text-gray-800'
  
  return (
    <div className={`flex items-center justify-between py-3 border-b ${borderClass} last:border-0`}>
      <span className={textClass}>{label}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  )
}
