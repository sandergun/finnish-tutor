import Groq from 'groq-sdk';
import { supabase } from './supabase';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getNextTopic(level, recentTopics) {
  const metaPrompt = `
      Ты - методист курсов финского языка. Твоя задача - предложить следующую тему для урока.
      
      Текущий уровень студента: ${level}.
      Последние изученные темы:
      ${recentTopics}

      Предложи ОДНУ новую, логически связанную тему, которая станет хорошим продолжением обучения.
      Избегай повторения. Усложняй материал постепенно.
      Например, после "Еда в магазине" можно предложить "Заказ еды в ресторане".
      После "Семья" можно предложить "Рассказ о себе и своих увлечениях".

      Ответь ТОЛЬКО валидным JSON-объектом формата:
      {
        "topic": "Название новой темы на русском",
        "level": "Подходящий уровень для этой темы (например, A1, A2)"
      }
    `;

  const topicCompletion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: metaPrompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.8,
    max_tokens: 100,
  });

  const topicResponseText = topicCompletion.choices[0]?.message?.content || '{}';

  // Clean the raw data to remove markdown fences
  const jsonMatch = topicResponseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const cleanedData = jsonMatch ? jsonMatch[1].trim() : topicResponseText.trim();

  return JSON.parse(cleanedData);
}

export async function generateLesson(level, topic) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Server configuration error: GROQ_API_KEY is not set.');
  }

  if (topic === 'auto') {
    const { data: recentLessons, error: fetchError } = await supabase
      .from('ai_lessons')
      .select('topic, level')
      .order('created_at', { ascending: false })
      .limit(5);

    if (fetchError) {
      console.error("Could not fetch recent lessons for auto-topic generation", fetchError);
      topic = 'Основные фразы для знакомства';
      level = level || 'A1';
    } else {
      const recentTopics = recentLessons.map(l => `- ${l.topic} (${l.level})`).join('\n');
      const suggestedTopic = await getNextTopic(level, recentTopics);

      if (suggestedTopic.topic && suggestedTopic.level) {
        topic = suggestedTopic.topic;
        level = suggestedTopic.level;
      } else {
        topic = 'Основные фразы для знакомства'; // Fallback
      }
    }
  }

  const { data: existingLessons, error: countError } = await supabase
    .from('ai_lessons')
    .select('number', { count: 'exact' })
    .eq('level', level);

  if (countError) throw countError;
  const nextNumber = (existingLessons?.length || 0) + 1;

  const prompt = `Ты - профессиональный преподаватель финского языка. Создай образовательный урок для уровня ${level} на тему "${topic}".

    ВАЖНО: Ответ ТОЛЬКО валидный JSON без markdown и комментариев.
    
    Структура урока:
    {
      "level": "${level}",
      "number": ${nextNumber},
      "title": "Название урока на русском",
      "topic": "${topic}",
      "description": "Краткое описание урока (1-2 предложения)",
      "theory": "Подробная теория на русском языке с объяснениями грамматики, произношения и правил использования. Используй markdown для форматирования.",
      "cards": [
        {
          "finnish": "слово на финском",
          "russian": "перевод на русский",
          "emoji": "подходящий эмодзи",
          "example_sentence": { "finnish": "пример на финском", "russian": "перевод примера" },
          "colloquial_form": "разговорная форма если есть"
        }
      ],
      "quiz": [ ... ],
      "mini_dialogues": [
        {
          "title": "Название диалога на русском",
          "lines": [
            { "speaker": "A", "line": "Реплика на финском", "translation": "Перевод реплики на русский" },
            { "speaker": "B", "line": "Реплика на финском", "translation": "Перевод реплики на русский" }
          ]
        }
      ]
    }
    
    ТРЕБОВАНИЯ К КОНТЕНТУ:
    - Используй частотную, употребимую лексику, соответствующую уровню ${level}.
    - Создай 15-20 карточек. Для КАЖДОЙ карточки ОБЯЗАТЕЛЬНО заполни все поля: "finnish", "russian", "emoji" и "example_sentence".
    - Для поля "emoji" подбери ОДИН наиболее подходящий по смыслу эмодзи.
    - Поле "example_sentence" ДОЛЖНО быть объектом вида { "finnish": "Пример на финском", "russian": "Перевод примера" }.
    - Включи 2 коротких, живых \`mini_dialogues\` по теме урока "${topic}".
    - Инструкция к диалогам:
      - Сделай диалоги МАКСИМАЛЬНО естественными и ЖИВЫМИ. Избегай стиля "допрос робота" (Вопрос-Ответ-Вопрос-Ответ).
      - Люди реагируют на слова друг друга! Добавь эмоции и контр-вопросы.
      - Если А говорит "У меня синее пальто", В должен ответить "О, классный цвет! А у меня черное." (а не просто "Мое пальто черное.")
      - Если А задает вопрос, В должен ответить и, возможно, добавить комментарий или задать встречный вопрос.
      - Используй разговорные частицы и реакции (Aijaa? Oho! Tosi kiva! Vai niin.), чтобы связать реплики.
      - Пример ЛОГИКИ (не копируй текст, копируй структуру общения):
        - Плохо: "Кто ты?" -> "Я Анна." -> "Где живешь?" -> "В Хельсинки."
        - Хорошо: "Кто ты?" -> "Я Анна, а тебя как зовут?" -> "Я Пекка. Приятно познакомиться!" -> "И мне! Ты здесь живешь?"
      - Перевод на русский должен быть литературным, передавать смысл и эмоции, а не быть машинным.
    - ВАЖНО: Следи за правильной грамматикой русского языка. Проверяй согласование родов, чисел и падежей (например, "одна собака", а не "один собака").
    - КРИТИЧЕСКИ ВАЖНО: Каждая строка диалога ДОЛЖНА содержать поле "translation" с переводом на русский.
    
    ТРЕБОВАНИЯ К ТЕСТАМ (quiz):
    - Создай 15-20 вопросов.
    - Используй ТОЛЬКО тип вопросов "choice".
    - КРИТИЧЕСКИ ВАЖНО: Каждый вопрос типа "choice" ОБЯЗАТЕЛЬНО должен содержать поле "translation" с переводом правильного ответа.
    
    СТРУКТУРА ВОПРОСОВ ПО ТИПАМ:
    - choice: Вопрос на перевод слова.
      - "type": "choice"
      - "question": "Как по-фински 'слово на русском'?"
      - "options": ["финский1", "финский2", "финский3", "финский4"] (массив из 4 финских слов)
      - "correct": "правильное финское слово"
      - "translation": "перевод правильного ответа (само слово на русском)"
    
    Обязательно верни ПОЛНЫЙ JSON.`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are a professional Finnish language teacher. Always respond with valid JSON only, no markdown, no explanations. Focus on language learning.' },
      { role: 'user', content: prompt },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 4500,
  });

  let responseText = completion.choices[0]?.message?.content || '';
  responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  const lessonData = JSON.parse(responseText);

  if (!lessonData.title || !lessonData.cards || !lessonData.quiz) {
    throw new Error('Invalid lesson structure from AI');
  }

  const { data: insertedLesson, error: dbError } = await supabase
    .from('ai_lessons')
    .insert([{
      level: level,
      number: nextNumber,
      title: lessonData.title,
      topic: topic,
      lesson_data: lessonData,
      generated_by: 'groq-llama-3.3-70b',
      tokens_used: completion.usage?.total_tokens || 0,
      cost: 0,
      status: 'active'
    }])
    .select()
    .single();

  if (dbError) throw dbError;

  return insertedLesson;
}
