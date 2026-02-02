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
    // Manual overrides for commonly repetitive or missing emojis
    const fixedEmojis = {
      'tuoli': '🪑',
      'pöytä': '🍽️',
      'lattia': '🪵',
      'latti': '🧱',
      'seinä': '🧱',
      'katto': '🏠',
      'ikkuna': '🪟',
      'ovi': '🚪',
      'wc': '🚽',
      'sänky': '🛏️',
      'lamppu': '💡',
      'televisio': '📺',
      'matto': '🧶',
      'kaappi': '🚪',
      'hylly': '📚',
      'talo': '🏠',
      'koti': '🏡',
      'keittiö': '👨‍🍳',
      'olohuone': '🛋️',
      'makuuhuone': '🛏️',
      'kylpyhuone': '🛁',
      'eteinen': '🧥',
      'kahvi': '☕',
      'tee': '🍵',
      'vesi': '💧',
      'maito': '🥛',
      'olut': '🍺',
      'viini': '🍷',
      'leipä': '🍞',
      'juusto': '🧀',
      'voi': '🧈',
      'kana': '🍗',
      'kala': '🐟',
      'liha': '🥩',
      'salaatti': '🥗',
      'keitto': '🍲',
      'jälkiruoka': '🍰',
    };

    const lowerFin = (card.finnish || card.front || '').toLowerCase().trim();
    // Try exact match or stem match (remove last char)
    const mappedEmoji = fixedEmojis[lowerFin] || fixedEmojis[lowerFin.slice(0, -1)];

    return {
      finnish: card.finnish || card.front || '',
      russian: card.russian || card.back || '',
      emoji: mappedEmoji || card.emoji || '✨',
      example_sentence: example,
      colloquial_form: card.colloquial_form || null,
      grammar_pattern: card.grammar_pattern || null,
    };
  });

  const newExamples = newWords.map(word => word.example_sentence).filter(Boolean);

  const normalizedDialogues = (aiLesson.mini_dialogues || []).map(dialogue => ({
    title: dialogue.title || 'Диалог',
    lines: Array.isArray(dialogue.lines) ? dialogue.lines.map(line => ({
      speaker: line.speaker,
      line: line.line,
      translation: line.translation || null
    })) : [],
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
    finnish_fact: aiLesson.finnish_fact || null,
    mini_dialogues: normalizedDialogues,
    lesson_data: aiLesson, // Preserve original data
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

// ──────────────────────────────────────────────

// 🆕 РЕЖИМ "СЛУЧАЙНЫЕ СЛОВА"

// ──────────────────────────────────────────────

export const getRandomWordsLesson = async () => {

  console.log('🔄 Creating a random words lesson...');

  try {

    const { data: recentLessons, error } = await supabase

      .from('ai_lessons')

      .select('lesson_data')

      .eq('status', 'active')

      .order('created_at', { ascending: false })

      .limit(50);



    if (error) {

      console.error('❌ Error loading lessons for random mode:', error);

      return null;

    }

    if (!recentLessons || recentLessons.length === 0) {

      console.warn('⚠️ No lessons found for random mode.');

      return null;

    }



    const wordPool = recentLessons.flatMap(lesson => lesson.lesson_data?.cards || []);



    if (wordPool.length === 0) {

      console.warn('⚠️ No words found in recent lessons for random mode.');

      return null;

    }



    // Shuffle array and take first 20

    const shuffledWords = wordPool.sort(() => 0.5 - Math.random());

    const selectedWords = shuffledWords.slice(0, 10);



    console.log(`✅ Created random lesson with ${selectedWords.length} words.`);



    return {

      id: `random-words-${Date.now()}`,

      title: 'Случайные слова',

      type: 'practical', // This type should skip the theory part

      level: 'Mix',

      number: 1,

      isRandomMode: true,

      words: selectedWords,

      questions: [],

      examples: [],

      mini_dialogues: [],

      theory: '',

    };



  } catch (err) {

    console.error('❌ Failed to create random words lesson:', err);

    return null;

  }

}



// ──────────────────────────────────────────────







// 🆕 РЕЖИМ "ИНТЕНСИВНАЯ ТРЕНИРОВКА"







// ──────────────────────────────────────────────







export const getIntensiveLesson = async () => {
  console.log('🔄 Creating an intensive lesson...');

  try {
    const { data: recentLessons, error } = await supabase
      .from('ai_lessons')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error loading lessons for intensive mode:', error);
      return null;
    }

    if (!recentLessons || recentLessons.length === 0) {
      console.warn('⚠️ No lessons found for intensive mode.');
      return null;
    }

    // Collect all questions from recent lessons and filter valid ones
    const allQuestions = recentLessons.flatMap(lesson => {
      const quiz = lesson.lesson_data?.quiz || [];
      return quiz.filter(q => {
        // Filter out broken questions - must have valid question, correct, and options
        if (!q.question || q.question.includes('Ошибка генерации')) return false;
        if (!q.type) return false;
        if (q.type === 'audio-choice') return false; // Skip audio questions

        // For choice questions, must have options and valid correct answer
        if (q.type === 'choice') {
          if (!q.options || q.options.length < 2) return false;
          if (typeof q.correct === 'number' && q.correct >= q.options.length) return false;
          if (!q.correct && q.correct !== 0) return false;
        }

        return true;
      });
    });

    if (allQuestions.length === 0) {
      console.warn('⚠️ No valid questions found for intensive mode.');
      return null;
    }

    // Shuffle and select up to 25 questions
    const shuffledQuestions = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffledQuestions.slice(0, 25);

    // Collect words from lessons for distractor generation
    const allWords = recentLessons.flatMap(lesson => {
      const cards = lesson.lesson_data?.cards || [];
      return cards.map(card => ({
        finnish: card.finnish || card.front || '',
        russian: card.russian || card.back || '',
        emoji: card.emoji || '✨',
        example_sentence: card.example_sentence || null,
      }));
    });

    console.log(`✅ Created intensive lesson with ${selectedQuestions.length} questions from ${recentLessons.length} lessons.`);

    return {
      id: `intensive-${Date.now()}`,
      title: 'Интенсивная тренировка',
      type: 'practical',
      level: 'Mix',
      number: 1,
      words: allWords.slice(0, 20), // Take some words for reference
      questions: selectedQuestions,
      examples: [],
      mini_dialogues: [],
      theory: '',
    };

  } catch (err) {
    console.error('❌ Failed to create intensive lesson:', err);
    return null;
  }
}

// ──────────────────────────────────────────────
// 🆕 РЕЖИМ "АУДИРОВАНИЕ"
// ──────────────────────────────────────────────

export const getListeningLesson = async () => {
  console.log('🔄 Creating a listening lesson...');

  try {
    const { data: recentLessons, error } = await supabase
      .from('ai_lessons')
      .select('lesson_data')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error loading lessons for listening mode:', error);
      return null;
    }
    if (!recentLessons || recentLessons.length === 0) {
      console.warn('⚠️ No lessons found for listening mode.');
      return null;
    }

    // Collect all words from recent lessons
    const allWords = recentLessons.flatMap(lesson => {
      const cards = lesson.lesson_data?.cards || [];
      return cards.filter(card => card.finnish && card.russian);
    });

    if (allWords.length < 4) {
      console.warn('⚠️ Not enough words found for listening mode.');
      return null;
    }

    // Shuffle and take up to 15 words
    const shuffledWords = allWords.sort(() => 0.5 - Math.random());
    const selectedWords = shuffledWords.slice(0, 15);

    // Generate listening questions from words
    const questions = selectedWords.map(word => {
      // Get 3 random distractors from other words
      const distractors = allWords
        .filter(w => w.finnish !== word.finnish)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.finnish);

      const options = [word.finnish, ...distractors].sort(() => 0.5 - Math.random());

      return {
        type: 'audio-choice',
        question: 'Что вы слышите?',
        text_to_speak: word.finnish, // This is what TTS will speak
        correct: word.finnish,
        options: options,
        translation: word.russian,
      };
    });

    console.log(`✅ Created listening lesson with ${questions.length} questions.`);

    return {
      id: `listening-${Date.now()}`,
      title: 'Аудирование',
      type: 'practical',
      level: 'Mix',
      number: 1,
      isListeningMode: true,
      words: [],
      questions: questions,
      examples: [],
      mini_dialogues: [],
      theory: '',
    };

  } catch (err) {
    console.error('❌ Failed to create listening lesson:', err);
    return null;
  }
}
































// Опционально: только статические уроки (синхронно)







export const getAllManualLessons = () => {







  return Object.values(lessons).flat()







}


