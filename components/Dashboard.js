'use client'

import AchievementPopup from './AchievementPopup'
import AdminPanel from './AdminPanel'
import Achievements from './Achievements'
import StatsCharts from './StatsCharts'
import { BookOpen, Trophy, BarChart3, User, Sparkles, CheckCircle, Play, Moon, Sun, Volume2, VolumeX, Star, Loader2, Zap, Brain, Pencil, Headphones, LogOut, ChevronUp, ChevronDown } from 'lucide-react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useUserStore } from '@/store/useUserStore'
import LessonPlayer from './LessonPlayer'
import { getAllLessons, getRandomWordsLesson, getIntensiveLesson, getListeningLesson } from '@/lib/lessonsData'
import { sounds } from '@/lib/sounds'

export default function Dashboard() {
  const { user, isLessonCompleted, saveProgress, fullProgress, logout } = useUserStore()
  const [activeTab, setActiveTab] = useState('lessons')
  const [currentLesson, setCurrentLesson] = useState(null)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [randomWordsLoading, setRandomWordsLoading] = useState(false)
  const [intensiveLoading, setIntensiveLoading] = useState(false)
  const [listeningLoading, setListeningLoading] = useState(false)

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

  const handleStartRandomWords = async () => {
    sounds.playClick()
    setRandomWordsLoading(true)
    try {
      const randomLesson = await getRandomWordsLesson()
      if (randomLesson && randomLesson.words.length > 0) {
        setCurrentLesson(randomLesson)
      } else {
        // TODO: Show an error message to the user
        console.error("Could not generate a random words lesson.")
      }
    } catch (error) {
      console.error("Failed to start random words lesson:", error)
    } finally {
      setRandomWordsLoading(false)
    }
  }

  const handleStartIntensiveLesson = async () => {
    sounds.playClick()
    setIntensiveLoading(true)
    try {
      const intensiveLesson = await getIntensiveLesson()
      if (intensiveLesson) {
        setCurrentLesson(intensiveLesson)
      } else {
        console.error("Could not generate an intensive lesson.")
      }
    } catch (error) {
      console.error("Failed to start intensive lesson:", error)
    } finally {
      setIntensiveLoading(false)
    }
  }

  const handleStartListeningLesson = async () => {
    sounds.playClick()
    setListeningLoading(true)
    try {
      const listeningLesson = await getListeningLesson()
      if (listeningLesson) {
        setCurrentLesson(listeningLesson)
      } else {
        console.error("Could not generate a listening lesson.")
      }
    } catch (error) {
      console.error("Failed to start listening lesson:", error)
    } finally {
      setListeningLoading(false)
    }
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

  const bgClass = 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900';

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-10 bg-blue-500`}></div>
        <div className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-10 bg-purple-500`}></div>
      </div>

      <div className={`relative z-10 bg-gradient-to-r from-gray-800 to-blue-900 text-white p-6 shadow-xl`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Привет, {user?.name}! 👋</h1>
              <p className="text-blue-100 mt-1">Уровень: {user?.level}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={logout}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all hover:scale-110 relative z-50"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button
                onClick={toggleSound}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all hover:scale-110 relative z-50"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
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
            darkMode={true}
            onStartRandomWords={handleStartRandomWords}
            randomWordsLoading={randomWordsLoading}
            onStartIntensive={handleStartIntensiveLesson}
            intensiveLoading={intensiveLoading}
            onStartListening={handleStartListeningLesson}
            listeningLoading={listeningLoading}
          />
        )}
        {activeTab === 'achievements' && <Achievements darkMode={true} />}
        {activeTab === 'profile' && <ProfileTab user={user} darkMode={true} />}
        {activeTab === 'admin' && (
          <AdminPanel
            user={user}
            darkMode={true}
            onLessonGenerated={loadLessons}
            fullProgress={fullProgress}
          />
        )}
      </main>

      <footer className={`fixed bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-sm border-gray-700 border-t shadow-2xl z-50`}>
        <div className="max-w-4xl mx-auto flex">
          <TabButton icon={BookOpen} label="Уроки" active={activeTab === 'lessons'} onClick={() => handleTabChange('lessons')} darkMode={true} />
          <TabButton icon={Trophy} label="Награды" active={activeTab === 'achievements'} onClick={() => handleTabChange('achievements')} darkMode={true} />
          <TabButton icon={User} label="Профиль" active={activeTab === 'profile'} onClick={() => handleTabChange('profile')} darkMode={true} />
          <TabButton icon={Sparkles} label="Admin" active={activeTab === 'admin'} onClick={() => handleTabChange('admin')} darkMode={true} />
        </div>
      </footer>

      {/* Floating scroll buttons */}
      <div className="fixed left-[calc(50%-36rem)] top-1/2 transform -translate-y-1/2 z-40 flex flex-col gap-16 hidden xl:flex">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-4 bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 text-white rounded-full shadow-lg transition-all hover:scale-110 border border-gray-700"
          aria-label="В начало"
        >
          <ChevronUp className="w-8 h-8" />
        </button>
        <button
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          className="p-4 bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 text-white rounded-full shadow-lg transition-all hover:scale-110 border border-gray-700"
          aria-label="В конец"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </div>

      <AchievementPopup />
    </div>
  )
}

function TabButton({ icon: Icon, label, active, onClick, darkMode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center py-3 transition-all cursor-pointer select-none ${active ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600')
        }`}
      style={{ touchAction: 'manipulation' }}
    >
      <Icon className={`w-6 h-6 mb-1 ${active ? 'stroke-2' : ''} transition-transform ${active ? 'scale-110' : ''}`} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

function ModeButton({ icon: Icon, label, description, onClick, loading, darkMode, disabled }) {
  const cardClass = darkMode
    ? 'bg-gray-800/50 border-gray-700'
    : 'bg-white/70 border-gray-200'

  const textClass = darkMode ? 'text-white' : 'text-gray-800'
  const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-500'

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-5 w-full
        ${disabled
          ? `${cardClass} opacity-50 cursor-not-allowed`
          : `${cardClass} hover:border-purple-400 hover:scale-[1.02] active:scale-100`
        }`
      }
    >
      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${disabled ? 'bg-gray-500/10' : 'bg-purple-500/20'}`}>
        <Icon className={`w-6 h-6 ${disabled ? 'text-gray-500' : 'text-purple-400'}`} />
      </div>
      <div className="flex-1">
        <h3 className={`font-bold ${textClass} text-lg`}>{label}</h3>
        <p className={`text-sm ${textSecondaryClass}`}>{loading ? 'Загрузка...' : description}</p>
      </div>
      {loading && <Loader2 className="w-6 h-6 animate-spin text-purple-400" />}
    </button>
  )
}

function LessonsTab({ lessons, loading, userLevel, onStartLesson, isLessonCompleted, darkMode, onStartRandomWords, randomWordsLoading, onStartIntensive, intensiveLoading, onStartListening, listeningLoading }) {
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
      <div className="px-6 mb-8">
        <h2 className={`text-3xl font-bold ${textClass} mb-4`}>Режимы тренировки</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModeButton
            icon={Zap}
            label="Случайные слова"
            description="Тренировка на случайных словах из последних уроков"
            onClick={onStartRandomWords}
            loading={randomWordsLoading}
            darkMode={darkMode}
          />
          <ModeButton
            icon={Brain}
            label="Интенсивная тренировка"
            description="Быстрое повторение материала одного из недавних уроков"
            onClick={onStartIntensive}
            loading={intensiveLoading}
            darkMode={darkMode}
          />
        </div>
      </div>

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

function ProfileTab({ user, darkMode }) {
  const cardClass = darkMode ? 'bg-gray-800' : 'bg-white'
  const textClass = darkMode ? 'text-white' : 'text-gray-800'
  const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-500'
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-100'

  const [isEditingName, setIsEditingName] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const updateProfile = useUserStore((state) => state.updateProfile)

  const handleNameUpdate = async () => {
    if (name.trim() === '') return;
    await updateProfile({ name: name.trim() });
    setIsEditingName(false);
    sounds.playSuccess();
  }

  const daysSinceRegistration = user?.created_at ? Math.max(1, Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))) : 1;
  const averageWordsPerDay = Math.round((user?.total_words || 0) / daysSinceRegistration);

  return (
    <div className="p-6">
      <h2 className={`text-2xl font-bold ${textClass} mb-6`}>👤 Профиль</h2>
      <div className={`${cardClass} rounded-2xl p-6 shadow-xl`}>
        <div className="text-center mb-6">
          <div className={`w-24 h-24 ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-full mx-auto flex items-center justify-center mb-4`}>
            <span className="text-4xl">👤</span>
          </div>
          {isEditingName ? (
            <div className="flex items-center gap-2 max-w-xs mx-auto">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'} border ${borderClass}`}
              />
              <button onClick={handleNameUpdate} className="p-2 bg-green-500 text-white rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <h3 className={`text-xl font-bold ${textClass}`}>{user?.name}</h3>
              <button onClick={() => setIsEditingName(true)} className={`${textSecondaryClass} hover:text-blue-400`}>
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className={`${textSecondaryClass} mt-1`}>Уровень: {user?.level}</p>
        </div>

        <div className="space-y-4">
          <h4 className={`text-lg font-semibold ${textClass} mb-2`}>Статистика</h4>
          <ProfileItem label="Всего слов изучено" value={user?.total_words || 0} darkMode={darkMode} borderClass={borderClass} />
          <ProfileItem label="Слов в день (в среднем)" value={averageWordsPerDay} darkMode={darkMode} borderClass={borderClass} />
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
