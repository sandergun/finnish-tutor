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
}