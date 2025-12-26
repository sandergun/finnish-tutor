// Система достижений
export const ACHIEVEMENTS = {
  first_lesson: {
    id: 'first_lesson',
    name: 'Первый шаг',
    description: 'Пройди свой первый урок',
    icon: '🎓',
    points: 10
  },
  three_days_streak: {
    id: 'three_days_streak',
    name: 'Упорный',
    description: 'Занимайся 3 дня подряд',
    icon: '🔥',
    points: 25
  },
  week_streak: {
    id: 'week_streak',
    name: 'Неделя успеха',
    description: 'Занимайся 7 дней подряд',
    icon: '⭐',
    points: 50
  },
  month_streak: {
    id: 'month_streak',
    name: 'Месяц силы',
    description: 'Занимайся 30 дней подряд',
    icon: '💎',
    points: 200
  },
  word_master_50: {
    id: 'word_master_50',
    name: 'Словарный запас',
    description: 'Изучи 50 слов',
    icon: '📚',
    points: 30
  },
  word_master_100: {
    id: 'word_master_100',
    name: 'Полиглот',
    description: 'Изучи 100 слов',
    icon: '🧠',
    points: 75
  },
  perfect_score: {
    id: 'perfect_score',
    name: 'Идеально!',
    description: 'Получи 100% на уроке',
    icon: '🌟',
    points: 15
  },
  five_perfect: {
    id: 'five_perfect',
    name: 'Мастер',
    description: 'Получи 100% на 5 уроках',
    icon: '👑',
    points: 100
  },
  early_bird: {
    id: 'early_bird',
    name: 'Ранняя птичка',
    description: 'Пройди урок до 9 утра',
    icon: '🌅',
    points: 20
  },
  night_owl: {
    id: 'night_owl',
    name: 'Сова',
    description: 'Пройди урок после 23:00',
    icon: '🦉',
    points: 20
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Скоростной режим',
    description: 'Пройди урок за 5 минут',
    icon: '⚡',
    points: 25
  },
  level_up_a1: {
    id: 'level_up_a1',
    name: 'Переход на A1',
    description: 'Достигни уровня A1',
    icon: '🎯',
    points: 50
  },
  level_up_a2: {
    id: 'level_up_a2',
    name: 'Переход на A2',
    description: 'Достигни уровня A2',
    icon: '🏆',
    points: 100
  }
}

// Функция проверки достижений
export async function checkAchievements(supabase, telegramId, context) {
  const newAchievements = []
  
  // Проверяем какие достижения уже есть
  const { data: existing } = await supabase
    .from('achievements')
    .select('achievement_type')
    .eq('telegram_id', telegramId)
  
  const existingIds = existing?.map(a => a.achievement_type) || []
  
  // Первый урок
  if (context.lessonsCompleted === 1 && !existingIds.includes('first_lesson')) {
    newAchievements.push(ACHIEVEMENTS.first_lesson)
  }
  
  // Стрики
  if (context.streak === 3 && !existingIds.includes('three_days_streak')) {
    newAchievements.push(ACHIEVEMENTS.three_days_streak)
  }
  if (context.streak === 7 && !existingIds.includes('week_streak')) {
    newAchievements.push(ACHIEVEMENTS.week_streak)
  }
  if (context.streak === 30 && !existingIds.includes('month_streak')) {
    newAchievements.push(ACHIEVEMENTS.month_streak)
  }
  
  // Слова
  if (context.totalWords >= 50 && !existingIds.includes('word_master_50')) {
    newAchievements.push(ACHIEVEMENTS.word_master_50)
  }
  if (context.totalWords >= 100 && !existingIds.includes('word_master_100')) {
    newAchievements.push(ACHIEVEMENTS.word_master_100)
  }
  
  // Идеальные результаты
  if (context.perfectScore && !existingIds.includes('perfect_score')) {
    newAchievements.push(ACHIEVEMENTS.perfect_score)
  }
  if (context.perfectScoresCount === 5 && !existingIds.includes('five_perfect')) {
    newAchievements.push(ACHIEVEMENTS.five_perfect)
  }
  
  // Время дня
  const hour = new Date().getHours()
  if (hour < 9 && !existingIds.includes('early_bird')) {
    newAchievements.push(ACHIEVEMENTS.early_bird)
  }
  if (hour >= 23 && !existingIds.includes('night_owl')) {
    newAchievements.push(ACHIEVEMENTS.night_owl)
  }
  
  // Скорость
  if (context.lessonDuration && context.lessonDuration < 300 && !existingIds.includes('speed_demon')) {
    newAchievements.push(ACHIEVEMENTS.speed_demon)
  }
  
  // Уровни
  if (context.level === 'A1' && !existingIds.includes('level_up_a1')) {
    newAchievements.push(ACHIEVEMENTS.level_up_a1)
  }
  if (context.level === 'A2' && !existingIds.includes('level_up_a2')) {
    newAchievements.push(ACHIEVEMENTS.level_up_a2)
  }
  
  // Сохраняем новые достижения
  if (newAchievements.length > 0) {
    const achievementsToInsert = newAchievements.map(ach => ({
      telegram_id: telegramId,
      achievement_type: ach.id,
      achievement_name: ach.name
    }))
    
    await supabase
      .from('achievements')
      .insert(achievementsToInsert)
    
    // Обновляем очки в лидерборде
    const totalPoints = newAchievements.reduce((sum, ach) => sum + ach.points, 0)
    
    await supabase.rpc('increment_leaderboard_points', {
      user_id: telegramId,
      points_to_add: totalPoints
    })
  }
  
  return newAchievements
}