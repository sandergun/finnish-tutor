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

export default function StatsCharts({ progress = [], lessons = [] }) {
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
      const lesson = lessons.find(l => String(l.id) === String(p.lesson_id));
      const level = lesson?.level || 'Unknown';

      if (!levelMap[level]) {
        levelMap[level] = { total: 0, completed: 0 };
      }
      levelMap[level].total++;
      if (p.completed) levelMap[level].completed++;
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
        .slice(0, 5)
        .map(p => {
          const lesson = lessons.find(l => String(l.id) === String(p.lesson_id));
          let title = lesson?.title;

          if (!title) {
            const lessonId = String(p.lesson_id);
            if (lessonId.startsWith('random-words-')) title = 'Случайные слова';
            else if (lessonId.startsWith('intensive-')) title = 'Интенсивная тренировка';
            else if (lessonId.startsWith('listening-')) title = 'Аудирование';
            else if (lessonId.length > 20) {
              // Heuristic: it's likely a UUID for an AI lesson
              title = `AI Урок #${lessonId.substring(0, 5)}`;
            } else {
              title = `Урок ${lessonId}`;
            }
          }

          return {
            ...p,
            lesson_title: title,
            lesson_number: lesson?.number || p.lesson_id
          };
        }),
    };
  }, [progress, lessons]);

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
}