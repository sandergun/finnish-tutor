// lib/lessonsData.js

import { supabase } from './supabase'

export const lessons = {
  A0: [],
  A1: [],
  A2: [],
};

// ──────────────────────────────────────────────
// Вспомогательные функции для статических уроков
// ──────────────────────────────────────────────

export const getLessonsByLevel = (level) => {
  return lessons[level] || []
}

export const getLessonById = (lessonId) => {
  for (const level in lessons) {
    const lesson = lessons[level].find(l => l.id === lessonId)
    if (lesson) return lesson
  }
  return null
}

// ──────────────────────────────────────────────
// 🆕 НОРМАЛИЗАЦИЯ AI УРОКОВ
// ──────────────────────────────────────────────

const normalizeAILesson = (row) => {
  const aiLesson = row.lesson_data || {};
  const cards = Array.isArray(aiLesson.cards) ? aiLesson.cards : [];

  const newWords = cards.map(card => {
    let example = null;
    if (card.example_sentence) {
      if (typeof card.example_sentence === 'object' && card.example_sentence.finnish) {
        example = card.example_sentence;
      } else if (typeof card.example_sentence === 'string') {
        example = { finnish: card.example_sentence, russian: '' };
      }
    }
    return {
      finnish: card.finnish || card.front || '',
      russian: card.russian || card.back || '',
      example_sentence: example,
      colloquial_form: card.colloquial_form || null,
      grammar_pattern: card.grammar_pattern || null,
    };
  });

  const newExamples = newWords.map(word => word.example_sentence).filter(Boolean);

  const normalizedDialogues = (aiLesson.mini_dialogues || []).map(dialogue => ({
    title: dialogue.title || 'Диалог',
    lines: Array.isArray(dialogue.lines) ? dialogue.lines : [],
  }));

  return {
    id: row.id,
    level: row.level,
    number: row.number,
    title: row.title,
    type: 'standard',
    topic: row.topic,
    description: aiLesson.description || '',
    words: newWords,
    examples: aiLesson.examples || newExamples,
    questions: (aiLesson.quiz || []).map(q => ({
      type: q.type || 'choice',
      question: q.question,
      options: q.options || [],
      correct: q.correct !== undefined ? q.correct : q.correctAnswer || 0,
      audio: q.audio,
    })),
    theory: aiLesson.theory || '',
    mini_dialogues: normalizedDialogues,
    generated_by: row.generated_by,
    generated_at: row.generated_at,
    tokens_used: row.tokens_used,
    cost: row.cost,
  };
};

// ──────────────────────────────────────────────
// Загрузка AI-уроков из Supabase
// ──────────────────────────────────────────────

export const loadAILessons = async () => {
  try {
    console.log('📚 Loading AI lessons from Supabase...')
    
    // ⬇️ ВАЖНО: Указываем конкретные колонки
    const { data, error } = await supabase
      .from('ai_lessons')
      .select('id, level, number, title, topic, lesson_data, generated_by, generated_at, tokens_used, cost, status')
      .eq('status', 'active')
      .order('level', { ascending: true })
      .order('number', { ascending: true })

    if (error) {
      console.error('❌ Error loading AI lessons:', error)
      return []
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No AI lessons found in database')
      return []
    }

    console.log(`✅ Loaded ${data.length} AI lessons from Supabase`)

    // 🔄 Нормализуем все AI уроки
    const normalized = data.map(normalizeAILesson)
    
    console.log(`🔄 Normalized ${normalized.length} AI lessons`)
    
    return normalized

  } catch (error) {
    console.error('❌ Error loading AI lessons:', error)
    return []
  }
}

// ──────────────────────────────────────────────
// Получение ВСЕХ уроков (статические + AI)
// ──────────────────────────────────────────────

export const getAllLessons = async () => {
  const aiLessons = await loadAILessons()
  
  // Собираем все статические уроки в один плоский массив
  const allStatic = Object.values(lessons).flat()
  
  console.log(`📚 Total lessons: ${allStatic.length} static + ${aiLessons.length} AI = ${allStatic.length + aiLessons.length}`)
  
  // Объединяем и возвращаем
  return [...allStatic, ...aiLessons]
}

// Опционально: только статические уроки (синхронно)
export const getAllManualLessons = () => {
  return Object.values(lessons).flat()
}