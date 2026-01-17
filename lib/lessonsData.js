// lib/lessonsData.js

<<<<<<< HEAD
export const lessons = {
  A0: [
    {
      id: 'a0-1',
      level: 'A0',
      number: 1,
      title: 'Приветствия',
      type: 'standard', // Стандартный урок
      theory: `В финском языке ударение всегда падает на первый слог слова.

Финны используют несколько способов поздороваться:
- Hei (хей) - универсальное "привет"
- Moi (мой) - неформальное "привет"
- Terve (тэрве) - дружеское "здорово"

Вопрос "Как дела?" звучит как "Mitä kuuluu?" (митя куулуу)
Ответить можно: "Hyvää, kiitos" (хювяя, киитос) - "Хорошо, спасибо"`,
      
      words: [
        { finnish: 'Hei', russian: 'Привет' },
        { finnish: 'Moi', russian: 'Привет (неформ.)' },
        { finnish: 'Terve', russian: 'Здорово' },
        { finnish: 'Mitä kuuluu?', russian: 'Как дела?' },
        { finnish: 'Hyvää', russian: 'Хорошо' },
        { finnish: 'Kiitos', russian: 'Спасибо' },
        { finnish: 'Näkemiin', russian: 'До свидания' }
      ],
      
      examples: [
        { finnish: 'Hei! Mitä kuuluu?', russian: 'Привет! Как дела?' },
        { finnish: 'Hyvää, kiitos!', russian: 'Хорошо, спасибо!' },
        { finnish: 'Moi moi!', russian: 'Пока-пока!' }
      ],
      
      questions: [
        {
          type: 'choice',
          question: 'Как сказать "Привет" по-фински?',
          options: ['Hei', 'Kiitos', 'Hyvää', 'Terve'],
          correct: 0
        },
        {
          type: 'choice',
          question: 'Что означает "Mitä kuuluu?"',
          options: ['Как дела?', 'Спасибо', 'До свидания', 'Привет'],
          correct: 0
        },
        {
          type: 'choice',
          question: 'Выбери правильный ответ на "Mitä kuuluu?"',
          options: ['Hyvää, kiitos', 'Hei', 'Näkemiin', 'Moi'],
          correct: 0
        },
        {
          type: 'translate',
          question: 'Переведи на финский: "Спасибо"',
          correct: 'kiitos',
          audio: 'Kiitos'
        },
        {
          type: 'choice',
          question: 'Как попрощаться по-фински?',
          options: ['Näkemiin', 'Hei', 'Mitä kuuluu', 'Hyvää'],
          correct: 0
        }
      ]
    },
    
    {
      id: 'a0-2',
      level: 'A0',
      number: 2,
      title: 'Знакомство',
      type: 'standard',
      theory: `При знакомстве важно уметь представиться и спросить имя собеседника.

"Как тебя зовут?" = "Mikä sinun nimesi on?" (микя синун нимеси он)
Можно короче: "Mikä sinun nimi?" (микя синун ними)

Представиться: "Minun nimeni on..." (минун нимени он...)
Или проще: "Minä olen..." (миня олен...)

"Приятно познакомиться" = "Hauska tavata" (хауска тавата)`,
      
      words: [
        { finnish: 'Mikä sinun nimi?', russian: 'Как тебя зовут?' },
        { finnish: 'Minun nimeni on...', russian: 'Меня зовут...' },
        { finnish: 'Minä olen...', russian: 'Я...' },
        { finnish: 'Hauska tavata', russian: 'Приятно познакомиться' },
        { finnish: 'Sinä', russian: 'Ты' },
        { finnish: 'Kuka', russian: 'Кто' }
      ],
      
      examples: [
        { finnish: 'Mikä sinun nimi?', russian: 'Как тебя зовут?' },
        { finnish: 'Minun nimeni on Mikko', russian: 'Меня зовут Микко' },
        { finnish: 'Hauska tavata!', russian: 'Приятно познакомиться!' }
      ],
      
      questions: [
        {
          type: 'choice',
          question: 'Как спросить "Как тебя зовут?"',
          options: ['Mikä sinun nimi?', 'Mitä kuuluu?', 'Minä olen', 'Hei'],
          correct: 0
        },
        {
          type: 'choice',
          question: 'Что означает "Hauska tavata"?',
          options: ['Приятно познакомиться', 'До свидания', 'Как дела?', 'Спасибо'],
          correct: 0
        },
        {
          type: 'translate',
          question: 'Переведи: "Меня зовут..." (начало фразы)',
          correct: 'minun nimeni on',
          audio: 'Minun nimeni on'
        },
        {
          type: 'choice',
          question: 'Выбери правильный перевод "Minä olen Anna"',
          options: ['Я Анна', 'Меня зовут Анна', 'Как тебя зовут?', 'Ты Анна'],
          correct: 0
        },
        {
          type: 'choice',
          question: 'Что означает "Sinä"?',
          options: ['Ты', 'Я', 'Он', 'Мы'],
          correct: 0
        }
      ]
    },
    
    {
      id: 'a0-3',
      level: 'A0',
      number: 3,
      title: 'Вежливые слова',
      type: 'practical', // 🆕 Практический урок (без длинной теории)
      theory: `Вежливость очень важна в финской культуре!

Kiitos (киитос) - Спасибо
Ole hyvä (оле хювя) - Пожалуйста
Anteeksi (антээкси) - Извините`,
      
      words: [
        { finnish: 'Kiitos', russian: 'Спасибо' },
        { finnish: 'Ole hyvä', russian: 'Пожалуйста' },
        { finnish: 'Anteeksi', russian: 'Извините' },
        { finnish: 'Ei se mitään', russian: 'Ничего страшного' },
        { finnish: 'Kyllä', russian: 'Да' },
        { finnish: 'Ei', russian: 'Нет' },
        { finnish: 'Ehkä', russian: 'Может быть' }
      ],
      
      examples: [
        { finnish: 'Kiitos paljon!', russian: 'Большое спасибо!' },
        { finnish: 'Anteeksi, en ymmärrä', russian: 'Извините, я не понимаю' },
        { finnish: 'Ole hyvä!', russian: 'Пожалуйста! (когда даёшь)' }
      ],
      
      questions: [
        {
          type: 'choice',
          question: 'Как сказать "Спасибо" по-фински?',
          options: ['Kiitos', 'Ole hyvä', 'Anteeksi', 'Hei'],
          correct: 0
        },
        {
          type: 'choice',
          question: 'Что означает "Anteeksi"?',
          options: ['Извините', 'Спасибо', 'Пожалуйста', 'Да'],
          correct: 0
        },
        {
          type: 'translate',
          question: 'Переведи: "Пожалуйста" (когда даёшь)',
          correct: 'ole hyvä',
          audio: 'Ole hyvä'
        },
        {
          type: 'choice',
          question: 'Как сказать "Да" по-фински?',
          options: ['Kyllä', 'Ei', 'Ehkä', 'Kiitos'],
          correct: 0
        },
        {
          type: 'choice',
          question: 'Что означает "Ei se mitään"?',
          options: ['Ничего страшного', 'Извините', 'Спасибо', 'До свидания'],
          correct: 0
        }
      ]
    },

    {
      id: 'a0-4',
      level: 'A0',
      number: 4,
      title: 'Семья',
      type: 'standard',
      theory: `Семья по-фински — "perhe" (пэрхе).

Члены семьи:
- äiti (яити) - мама
- isä (иса) - папа
- lapsi (лапси) - ребёнок
- veli (вели) - брат
- sisko (сиско) - сестра

Интересный факт: в финском нет отдельных слов для "брат" и "сестра" в обращении — все используют имена!`,
      
      words: [
        { finnish: 'perhe', russian: 'семья' },
        { finnish: 'äiti', russian: 'мама' },
        { finnish: 'isä', russian: 'папа' },
        { finnish: 'veli', russian: 'брат' },
        { finnish: 'sisko', russian: 'сестра' },
        { finnish: 'lapsi', russian: 'ребёнок' },
        { finnish: 'isoäiti', russian: 'бабушка' },
        { finnish: 'isoisä', russian: 'дедушка' }
      ],
      
      examples: [
        { finnish: 'Minulla on iso perhe', russian: 'У меня большая семья' },
        { finnish: 'Minulla on veli ja sisko', russian: 'У меня есть брат и сестра' },
        { finnish: 'Äiti ja isä', russian: 'Мама и папа' }
      ],
      
      questions: [
        {
          type: 'choice',
          question: 'Как будет "мама" по-фински?',
          options: ['äiti', 'isä', 'sisko', 'veli'],
          correct: 0
        },
        {
          type: 'choice',
          question: 'Что означает "veli"?',
          options: ['брат', 'сестра', 'папа', 'ребёнок'],
          correct: 0
        },
        {
          type: 'translate',
          question: 'Переведи: "семья"',
          correct: 'perhe',
          audio: 'perhe'
        },
        {
          type: 'choice',
          question: 'Как сказать "бабушка"?',
          options: ['isoäiti', 'isoisä', 'äiti', 'sisko'],
          correct: 0
        },
        {
          type: 'choice',
          question: 'Что означает "lapsi"?',
          options: ['ребёнок', 'брат', 'семья', 'мама'],
          correct: 0
        }
      ]
    },

    {
      id: 'a0-5',
      level: 'A0',
      number: 5,
      title: 'Повседневные фразы',
      type: 'intensive', // 🆕 Интенсивный (короткая теория, быстрый тест)
      theory: `Эти фразы ты будешь использовать каждый день!

- Hyvää huomenta (хювяя хуомента) - Доброе утро
- Hyvää päivää (хювяя пяйвяя) - Добрый день
- Hyvää iltaa (хювяя илтаа) - Добрый вечер
- Hyvää yötä (хювяя юётя) - Спокойной ночи`,
      
      words: [
        { finnish: 'Hyvää huomenta', russian: 'Доброе утро' },
        { finnish: 'Hyvää päivää', russian: 'Добрый день' },
        { finnish: 'Hyvää iltaa', russian: 'Добрый вечер' },
        { finnish: 'Hyvää yötä', russian: 'Спокойной ночи' },
        { finnish: 'Kippis!', russian: 'За здоровье! (тост)' },
        { finnish: 'Hyvää ruokahalua', russian: 'Приятного аппетита' }
      ],
      
      examples: [
        { finnish: 'Hyvää huomenta! Mitä kuuluu?', russian: 'Доброе утро! Как дела?' },
        { finnish: 'Hyvää yötä!', russian: 'Спокойной ночи!' },
        { finnish: 'Kippis!', russian: 'За здоровье!' }
      ],
      
      questions: [
        {
          type: 'choice',
          question: 'Как сказать "Доброе утро"?',
          options: ['Hyvää huomenta', 'Hyvää päivää', 'Hyvää iltaa', 'Hei'],
          correct: 0
        },
        {
          type: 'choice',
          question: 'Что означает "Hyvää yötä"?',
          options: ['Спокойной ночи', 'Добрый вечер', 'Доброе утро', 'До свидания'],
          correct: 0
        },
        {
          type: 'translate',
          question: 'Переведи: "Приятного аппетита"',
          correct: 'hyvää ruokahalua',
          audio: 'Hyvää ruokahalua'
        },
        {
          type: 'choice',
          question: 'Как сказать "За здоровье!" (тост)?',
          options: ['Kippis', 'Kiitos', 'Hyvää', 'Terve'],
          correct: 0
        }
      ]
    }
  ],
  
  A1: [
    {
      id: 'a1-1',
      level: 'A1',
      number: 1,
      title: 'Числа 1-10',
      type: 'standard',
      theory: `Числа в финском языке имеют свои особенности произношения.

Обрати внимание на буквы:
- yksi (ükси) - буква 'y' читается как 'ü'
- kahdeksan (кахдексан) - 'h' смягчает звук

Финны используют числа в повседневной жизни для:
- Называния времени
- Цен в магазине
- Номеров телефонов`,
      
      words: [
        { finnish: 'yksi', russian: '1 (один)' },
        { finnish: 'kaksi', russian: '2 (два)' },
        { finnish: 'kolme', russian: '3 (три)' },
        { finnish: 'neljä', russian: '4 (четыре)' },
        { finnish: 'viisi', russian: '5 (пять)' },
        { finnish: 'kuusi', russian: '6 (шесть)' },
        { finnish: 'seitsemän', russian: '7 (семь)' },
        { finnish: 'kahdeksan', russian: '8 (восемь)' },
        { finnish: 'yhdeksän', russian: '9 (девять)' },
        { finnish: 'kymmenen', russian: '10 (десять)' }
      ],
      
      examples: [
        { finnish: 'Yksi kahvi, kiitos', russian: 'Один кофе, пожалуйста' },
        { finnish: 'Kaksi lippua', russian: 'Два билета' },
        { finnish: 'Kolme euroa', russian: 'Три евро' }
      ],
      
      questions: [
        {
          type: 'choice',
          question: 'Как будет цифра "5" по-фински?',
          options: ['viisi', 'kuusi', 'neljä', 'kolme'],
          correct: 0
        },
        {
          type: 'choice',
          question: 'Что означает "kahdeksan"?',
          options: ['8', '7', '9', '6'],
          correct: 0
        },
        {
          type: 'translate',
          question: 'Переведи число "три"',
          correct: 'kolme',
          audio: 'kolme'
        },
        {
          type: 'choice',
          question: 'Выбери правильный перевод "kymmenen"',
          options: ['10', '9', '8', '11'],
          correct: 0
        },
        {
          type: 'choice',
          question: 'Как сказать "два билета"?',
          options: ['kaksi lippua', 'yksi lippu', 'kolme lippua', 'viisi lippua'],
          correct: 0
        }
      ]
    },
    
    {
      id: 'a1-2',
      level: 'A1',
      number: 2,
      title: 'Цвета',
      type: 'practical',
      theory: `Цвета в финском языке довольно легко запомнить.

Многие цвета заканчиваются на -inen`,
      
      words: [
        { finnish: 'punainen', russian: 'красный' },
        { finnish: 'sininen', russian: 'синий' },
        { finnish: 'keltainen', russian: 'жёлтый' },
        { finnish: 'vihreä', russian: 'зелёный' },
        { finnish: 'valkoinen', russian: 'белый' },
        { finnish: 'musta', russian: 'чёрный' },
        { finnish: 'harmaa', russian: 'серый' },
        { finnish: 'oranssi', russian: 'оранжевый' }
      ],
      
      examples: [
        { finnish: 'Punainen auto', russian: 'Красная машина' },
        { finnish: 'Sininen taivas', russian: 'Синее небо' },
        { finnish: 'Vihreä omena', russian: 'Зелёное яблоко' }
      ],
      
      questions: [
        {
          type: 'choice',
          question: 'Как будет "красный" по-фински?',
          options: ['punainen', 'sininen', 'keltainen', 'vihreä'],
          correct: 0
        },
        {
          type: 'choice',
          question: 'Что означает "sininen"?',
          options: ['синий', 'красный', 'жёлтый', 'зелёный'],
          correct: 0
        },
        {
          type: 'translate',
          question: 'Переведи: "зелёный"',
          correct: 'vihreä',
          audio: 'vihreä'
        },
        {
          type: 'choice',
          question: 'Как сказать "белый"?',
          options: ['valkoinen', 'musta', 'harmaa', 'oranssi'],
          correct: 0
        },
        {
          type: 'choice',
          question: 'Что означает "musta"?',
          options: ['чёрный', 'белый', 'серый', 'коричневый'],
          correct: 0
        }
      ]
    }
  ],
  
  A2: [
    {
      id: 'a2-1',
      level: 'A2',
      number: 1,
      title: 'В магазине',
      type: 'standard',
      theory: `При походе в магазин полезно знать базовые фразы.

"Paljonko maksaa?" (пальёнко максаа) = Сколько стоит?
"Missä on...?" (мисся он) = Где находится...?

Финская валюта - евро (euro, euroa)`,
      
      words: [
        { finnish: 'Kauppa', russian: 'Магазин' },
        { finnish: 'Paljonko maksaa?', russian: 'Сколько стоит?' },
        { finnish: 'Euro/euroa', russian: 'Евро' },
        { finnish: 'Haluan', russian: 'Я хочу' },
        { finnish: 'Tämä', russian: 'Это/этот' },
        { finnish: 'Missä on?', russian: 'Где находится?' },
        { finnish: 'Anteeksi', russian: 'Извините' }
      ],
      
      examples: [
        { finnish: 'Paljonko tämä maksaa?', russian: 'Сколько это стоит?' },
        { finnish: 'Viisi euroa', russian: 'Пять евро' },
        { finnish: 'Missä on kahvi?', russian: 'Где кофе?' },
        { finnish: 'Haluan tämän, kiitos', russian: 'Я хочу это, спасибо' }
      ],
      
      questions: [
        {
          type: 'choice',
          question: 'Как спросить "Сколько стоит?"',
          options: ['Paljonko maksaa?', 'Missä on?', 'Mitä kuuluu?', 'Hauska tavata'],
          correct: 0
        },
        {
          type: 'choice',
          question: 'Что означает "Haluan tämän"?',
          options: ['Я хочу это', 'Это стоит', 'Где это?', 'Сколько это?'],
          correct: 0
        },
        {
          type: 'translate',
          question: 'Переведи: "Где находится?" (начало вопроса)',
          correct: 'missä on',
          audio: 'Missä on'
        },
        {
          type: 'choice',
          question: 'Как извиниться по-фински?',
          options: ['Anteeksi', 'Kiitos', 'Ole hyvä', 'Hei'],
          correct: 0
        },
        {
          type: 'choice',
          question: 'Выбери правильный перевод "Kauppa"',
          options: ['Магазин', 'Кофе', 'Евро', 'Цена'],
          correct: 0
        }
      ]
    }
  ]
}

// Функция для получения всех уроков по уровню
=======
import { supabase } from './supabase'

export const lessons = {
  A0: [],
  A1: [],
  A2: [],
};

// ──────────────────────────────────────────────
// Вспомогательные функции для статических уроков
// ──────────────────────────────────────────────

>>>>>>> cf50603 (MWP Working)
export const getLessonsByLevel = (level) => {
  return lessons[level] || []
}

<<<<<<< HEAD
// Функция для получения урока по ID
=======
>>>>>>> cf50603 (MWP Working)
export const getLessonById = (lessonId) => {
  for (const level in lessons) {
    const lesson = lessons[level].find(l => l.id === lessonId)
    if (lesson) return lesson
  }
  return null
<<<<<<< HEAD
=======
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
>>>>>>> cf50603 (MWP Working)
}