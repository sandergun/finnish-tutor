<<<<<<< HEAD
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts'
import { TrendingUp, Award, BookOpen, Target } from 'lucide-react'

export default function StatsCharts({ progressData, user, darkMode }) {
  // Обработка данных для графика прогресса по дням
  const getDailyProgress = () => {
    if (!progressData || progressData.length === 0) return []
    
    const dailyData = {}
    progressData.forEach(item => {
      const date = new Date(item.completed_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
      if (!dailyData[date]) {
        dailyData[date] = { date, lessons: 0, avgScore: 0, totalScore: 0, count: 0 }
      }
      dailyData[date].lessons += 1
      dailyData[date].totalScore += item.score
      dailyData[date].count += 1
      dailyData[date].avgScore = Math.round(dailyData[date].totalScore / dailyData[date].count)
    })
    
    return Object.values(dailyData).slice(-7) // Последние 7 дней
  }

  // Данные по уровням
  const getLevelStats = () => {
    if (!progressData || progressData.length === 0) {
      return [
        { level: 'A0', lessons: 0, avgScore: 0 },
        { level: 'A1', lessons: 0, avgScore: 0 },
        { level: 'A2', lessons: 0, avgScore: 0 }
      ]
    }
    
    const levelData = { A0: [], A1: [], A2: [] }
    progressData.forEach(item => {
      const level = item.lesson_id.split('_')[0] // Предполагаем формат "A0_1"
      if (levelData[level]) {
        levelData[level].push(item.score)
      }
    })
    
    return Object.keys(levelData).map(level => ({
      level,
      lessons: levelData[level].length,
      avgScore: levelData[level].length > 0 
        ? Math.round(levelData[level].reduce((a, b) => a + b, 0) / levelData[level].length)
        : 0
    }))
  }

  // Данные для радиального графика целей
  const getGoalProgress = () => {
    const totalLessons = user?.total_lessons || 0
    const totalWords = user?.total_words || 0
    const streak = user?.streak || 0
    
    return [
      { 
        name: 'Уроки', 
        value: Math.min((totalLessons / 20) * 100, 100), 
        fill: '#3b82f6',
        target: 20 
      },
      { 
        name: 'Слова', 
        value: Math.min((totalWords / 100) * 100, 100), 
        fill: '#8b5cf6',
        target: 100 
      },
      { 
        name: 'Стрик', 
        value: Math.min((streak / 30) * 100, 100), 
        fill: '#ec4899',
        target: 30 
      }
    ]
  }

  // Данные распределения очков
  const getScoreDistribution = () => {
    if (!progressData || progressData.length === 0) {
      return [
        { range: '0-50', count: 0 },
        { range: '51-70', count: 0 },
        { range: '71-85', count: 0 },
        { range: '86-100', count: 0 }
      ]
    }
    
    const distribution = { '0-50': 0, '51-70': 0, '71-85': 0, '86-100': 0 }
    progressData.forEach(item => {
      if (item.score <= 50) distribution['0-50']++
      else if (item.score <= 70) distribution['51-70']++
      else if (item.score <= 85) distribution['71-85']++
      else distribution['86-100']++
    })
    
    return Object.keys(distribution).map(range => ({
      range,
      count: distribution[range]
    }))
  }

  const dailyProgress = getDailyProgress()
  const levelStats = getLevelStats()
  const goalProgress = getGoalProgress()
  const scoreDistribution = getScoreDistribution()

  const cardClass = darkMode ? 'bg-gray-800' : 'bg-white'
  const textClass = darkMode ? 'text-white' : 'text-gray-800'
  const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-600'
  const gridColor = darkMode ? '#374151' : '#e5e7eb'
  const tooltipBg = darkMode ? '#1f2937' : '#ffffff'
  const tooltipBorder = darkMode ? '#4b5563' : '#e5e7eb'

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']

  return (
    <div className="space-y-6">
      {/* Заголовок с общей статистикой */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={BookOpen}
          label="Всего уроков"
          value={user?.total_lessons || 0}
          darkMode={darkMode}
        />
        <StatCard
          icon={TrendingUp}
          label="Средний балл"
          value={progressData && progressData.length > 0 
            ? Math.round(progressData.reduce((sum, item) => sum + item.score, 0) / progressData.length)
            : 0}
          darkMode={darkMode}
        />
        <StatCard
          icon={Award}
          label="Лучший балл"
          value={progressData && progressData.length > 0
            ? Math.max(...progressData.map(item => item.score))
            : 0}
          darkMode={darkMode}
        />
      </div>

      {/* График прогресса по дням */}
      <div className={`${cardClass} rounded-2xl p-6 shadow-xl`}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h3 className={`text-lg font-bold ${textClass}`}>Прогресс за неделю</h3>
        </div>
        
        {dailyProgress.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dailyProgress}>
              <defs>
                <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="date" 
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: tooltipBg, 
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: darkMode ? '#fff' : '#000'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="lessons" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorLessons)"
                name="Уроков"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className={`text-center py-12 ${textSecondaryClass}`}>
            <p>Начните проходить уроки, чтобы увидеть статистику</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* График по уровням */}
        <div className={`${cardClass} rounded-2xl p-6 shadow-xl`}>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-500" />
            <h3 className={`text-lg font-bold ${textClass}`}>Прогресс по уровням</h3>
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={levelStats}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="level" 
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: tooltipBg, 
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: darkMode ? '#fff' : '#000'
                }}
              />
              <Bar dataKey="lessons" fill="#8b5cf6" name="Уроков" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Распределение баллов */}
        <div className={`${cardClass} rounded-2xl p-6 shadow-xl`}>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-pink-500" />
            <h3 className={`text-lg font-bold ${textClass}`}>Распределение баллов</h3>
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={scoreDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ range, percent }) => 
                  percent > 0 ? `${range}: ${(percent * 100).toFixed(0)}%` : null
                }
                outerRadius={70}
                fill="#8884d8"
                dataKey="count"
              >
                {scoreDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: tooltipBg, 
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: darkMode ? '#fff' : '#000'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Радиальный график целей */}
      <div className={`${cardClass} rounded-2xl p-6 shadow-xl`}>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-500" />
          <h3 className={`text-lg font-bold ${textClass}`}>Достижение целей</h3>
        </div>
        
        <ResponsiveContainer width="100%" height={250}>
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="10%" 
            outerRadius="80%" 
            data={goalProgress}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              minAngle={15}
              label={{ position: 'insideStart', fill: '#fff', fontSize: 14 }}
              background
              clockWise
              dataKey="value"
            />
            <Legend 
              iconSize={10} 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ paddingTop: '20px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: tooltipBg, 
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '8px',
                color: darkMode ? '#fff' : '#000'
              }}
              formatter={(value, name, props) => [
                `${Math.round(value)}% (Цель: ${props.payload.target})`,
                name
              ]}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, darkMode }) {
  const cardClass = darkMode 
    ? 'bg-gradient-to-br from-gray-800 to-gray-700' 
    : 'bg-gradient-to-br from-white to-gray-50'
  const textClass = darkMode ? 'text-gray-300' : 'text-gray-600'
  const valueClass = darkMode ? 'text-white' : 'text-gray-800'

  return (
    <div className={`${cardClass} rounded-xl p-4 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
          <Icon className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <div className={`text-sm ${textClass}`}>{label}</div>
          <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
        </div>
      </div>
    </div>
  )
=======
import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Award,
  Calendar,
  Clock,
  Star,
  Trophy
} from 'lucide-react';

const COLORS = {
  purple: '#a855f7',
  pink: '#ec4899',
  blue: '#3b82f6',
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
};

const CHART_COLORS = ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function StatsCharts({ progress = [] }) {
  // Обработка данных
  const stats = useMemo(() => {
    if (!progress || progress.length === 0) {
      return {
        totalLessons: 0,
        completedLessons: 0,
        totalScore: 0,
        avgScore: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalTimeMinutes: 0,
        levelProgress: [],
        recentActivity: [],
        scoreDistribution: [],
        weeklyActivity: [],
      };
    }

    const completed = progress.filter(p => p.completed);
    const totalScore = completed.reduce((sum, p) => sum + (p.score || 0), 0);
    const avgScore = completed.length > 0 ? totalScore / completed.length : 0;

    // Прогресс по уровням
    const levelMap = {};
    progress.forEach(p => {
      if (!levelMap[p.level]) {
        levelMap[p.level] = { total: 0, completed: 0 };
      }
      levelMap[p.level].total++;
      if (p.completed) levelMap[p.level].completed++;
    });

    const levelProgress = Object.keys(levelMap).map(level => ({
      level,
      progress: levelMap[level].total > 0 
        ? Math.round((levelMap[level].completed / levelMap[level].total) * 100)
        : 0,
      completed: levelMap[level].completed,
      total: levelMap[level].total,
    }));

    // Последние 7 дней активности
    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
      const dayProgress = progress.filter(p => {
        const pDate = new Date(p.completed_at || p.updated_at);
        return pDate.toDateString() === date.toDateString();
      });
      return {
        day: dateStr,
        lessons: dayProgress.filter(p => p.completed).length,
        score: dayProgress.reduce((sum, p) => sum + (p.score || 0), 0),
      };
    });

    // Распределение оценок
    const scoreRanges = [
      { range: '0-20%', min: 0, max: 20, count: 0 },
      { range: '21-40%', min: 21, max: 40, count: 0 },
      { range: '41-60%', min: 41, max: 60, count: 0 },
      { range: '61-80%', min: 61, max: 80, count: 0 },
      { range: '81-100%', min: 81, max: 100, count: 0 },
    ];

    completed.forEach(p => {
      const score = p.score || 0;
      const range = scoreRanges.find(r => score >= r.min && score <= r.max);
      if (range) range.count++;
    });

    // Streak calculation
    const sortedDates = [...new Set(
      completed
        .map(p => new Date(p.completed_at || p.updated_at).toDateString())
    )].sort((a, b) => new Date(b) - new Date(a));

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    let prevDate = new Date();

    sortedDates.forEach((dateStr, i) => {
      const date = new Date(dateStr);
      const daysDiff = Math.floor((prevDate - date) / (1000 * 60 * 60 * 24));

      if (i === 0 || daysDiff === 1) {
        tempStreak++;
        if (i === 0) currentStreak = tempStreak;
      } else if (daysDiff > 1) {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 1;
      }

      prevDate = date;
    });

    bestStreak = Math.max(bestStreak, tempStreak);

    return {
      totalLessons: progress.length,
      completedLessons: completed.length,
      totalScore,
      avgScore: Math.round(avgScore),
      currentStreak,
      bestStreak,
      totalTimeMinutes: completed.length * 8, // Примерно 8 минут на урок
      levelProgress,
      weeklyActivity,
      scoreDistribution: scoreRanges.filter(r => r.count > 0),
      recentActivity: progress
        .filter(p => p.completed)
        .sort((a, b) => new Date(b.completed_at || b.updated_at) - new Date(a.completed_at || a.updated_at))
        .slice(0, 5),
    };
  }, [progress]);

  const StatCard = ({ icon: Icon, label, value, color, subtitle }) => (
    <div className={`bg-gradient-to-br from-${color}-500/10 to-${color}-600/5 rounded-2xl p-6 border border-${color}-500/20`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 bg-${color}-500/20 rounded-xl`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{value}</div>
          {subtitle && <div className="text-sm text-gray-400 mt-1">{subtitle}</div>}
        </div>
      </div>
      <div className="text-gray-400 text-sm font-medium">{label}</div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-400" />
          Ваша статистика
        </h2>
        <p className="text-gray-400">Отслеживайте свой прогресс в изучении финского языка</p>
      </div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="Уроков завершено"
          value={stats.completedLessons}
          color="purple"
          subtitle={`из ${stats.totalLessons}`}
        />
        <StatCard
          icon={Star}
          label="Средний балл"
          value={`${stats.avgScore}%`}
          color="pink"
        />
        <StatCard
          icon={Zap}
          label="Текущая серия"
          value={`${stats.currentStreak} ${stats.currentStreak === 1 ? 'день' : 'дней'}`}
          color="blue"
          subtitle={`Лучшая: ${stats.bestStreak}`}
        />
        <StatCard
          icon={Clock}
          label="Время обучения"
          value={`${Math.floor(stats.totalTimeMinutes / 60)}ч ${stats.totalTimeMinutes % 60}м`}
          color="green"
        />
      </div>

      {/* Активность за неделю */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Активность за неделю</h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={stats.weeklyActivity}>
            <defs>
              <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.8} />
                <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#f9fafb' }}
            />
            <Area
              type="monotone"
              dataKey="lessons"
              stroke={COLORS.purple}
              fillOpacity={1}
              fill="url(#colorLessons)"
              name="Уроков"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Прогресс по уровням */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Прогресс по уровням</h3>
        </div>
        {stats.levelProgress.length > 0 ? (
          <div className="space-y-4">
            {stats.levelProgress.map((level, idx) => (
              <div key={level.level}>
                <div className="flex justify-between mb-2">
                  <span className="text-white font-medium">{level.level}</span>
                  <span className="text-gray-400 text-sm">
                    {level.completed}/{level.total} ({level.progress}%)
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${level.progress}%`,
                      background: `linear-gradient(90deg, ${CHART_COLORS[idx % CHART_COLORS.length]}, ${CHART_COLORS[(idx + 1) % CHART_COLORS.length]})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">Начните изучать уроки, чтобы увидеть прогресс</p>
        )}
      </div>

      {/* Распределение оценок */}
      {stats.scoreDistribution.length > 0 && (
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">Распределение оценок</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="range" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#f9fafb' }}
              />
              <Bar dataKey="count" name="Уроков" radius={[8, 8, 0, 0]}>
                {stats.scoreDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Последние достижения */}
      {stats.recentActivity.length > 0 && (
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-green-400" />
            <h3 className="text-xl font-bold text-white">Последние достижения</h3>
          </div>
          <div className="space-y-3">
            {stats.recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-600/50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Trophy className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {activity.lesson_title || `Урок ${activity.lesson_number}`}
                    </div>
                    <div className="text-gray-400 text-sm">{activity.level}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">{activity.score}%</div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.completed_at || activity.updated_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Мотивационное сообщение */}
      {stats.completedLessons === 0 && (
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-8 text-center border border-purple-500/20">
          <Zap className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Начните свой путь!</h3>
          <p className="text-gray-400">
            Пройдите первый урок, чтобы увидеть вашу статистику и отслеживать прогресс
          </p>
        </div>
      )}
    </div>
  );
>>>>>>> cf50603 (MWP Working)
}