import Groq from 'groq-sdk';
import { supabase } from './supabase';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getNextTopic(level, recentTopics) {
  const metaPrompt = `
      Ты - методист курсов финского языка. Твоя задача - предложить следующую тему для урока.
      
      Текущий уровень студента: ${level}.
      Последние изученные темы:
      ${recentTopics}

      ПРЕДОСТЕРЕЖЕНИЕ: Темы не должны повторять вышеуказанный список!

      Предложи ОДНУ новую, интересную и логически обоснованную тему для урока. 
      Фокусируйся на прогрессивности: если темы были базовыми, предложи что-то более продвинутое или специфическое (быт, работа, культура).
      
      Ответь ТОЛЬКО валидным JSON-объектом формата:
      {
        "topic": "Название новой темы на русском",
        "level": "Подходящий уровень (A1, A2, B1, B2)"
      }
    `;

  const topicCompletion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: metaPrompt }],
    model: 'llama-3.3-70b-versatile',
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 150,
  });

  let topicResponseText = topicCompletion.choices[0]?.message?.content || '{}';

  // Robust extraction: find the first { and last }
  const firstBraceTopic = topicResponseText.indexOf('{');
  const lastBraceTopic = topicResponseText.lastIndexOf('}');
  if (firstBraceTopic !== -1 && lastBraceTopic !== -1) {
    topicResponseText = topicResponseText.substring(firstBraceTopic, lastBraceTopic + 1);
  }

  return JSON.parse(topicResponseText.trim());
}

export async function generateLesson(level, topic) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Server configuration error: GROQ_API_KEY is not set.');
  }

  // 1. Fetch recent lessons (Memory expansion to 50)
  const { data: recentLessons, error: fetchError } = await supabase
    .from('ai_lessons')
    .select('topic, level, title')
    .order('created_at', { ascending: false })
    .limit(50);

  const recentTopicsList = recentLessons?.map(l => l.topic) || [];
  const recentTitlesList = recentLessons?.map(l => l.title) || [];
  const combinedExclusionList = [...new Set([...recentTopicsList, ...recentTitlesList])];

  // 2. Duplicate Check for Manual Mode
  if (topic !== 'auto' && topic.trim() !== '') {
    const isDuplicate = combinedExclusionList.some(existing =>
      existing.toLowerCase().includes(topic.toLowerCase()) ||
      topic.toLowerCase().includes(existing.toLowerCase())
    );

    if (isDuplicate) {
      console.log(`⚠️ Potential duplicate topic detected: "${topic}". Proceeding with strict uniqueness instructions.`);
    }
  }

  // 3. Handle Auto Topic Suggestion
  if (topic === 'auto') {
    if (fetchError) {
      console.error("Could not fetch recent lessons for auto-topic generation", fetchError);
      topic = 'Основные фразы для знакомства';
      level = level || 'A1';
    } else {
      const recentTopicsSummary = (recentLessons || []).slice(0, 15).map(l => `- ${l.topic} (${l.level})`).join('\n');
      const suggestedTopic = await getNextTopic(level, recentTopicsSummary);

      if (suggestedTopic.topic) {
        topic = suggestedTopic.topic;
        level = suggestedTopic.level || level;
      } else {
        topic = 'Повседневная жизнь в Финляндии'; // Fallback
      }
    }
  }

  // Check lesson numbering for the specific level
  const { data: existingLessons, error: countError } = await supabase
    .from('ai_lessons')
    .select('number', { count: 'exact' })
    .eq('level', level);

  if (countError) throw countError;
  const nextNumber = (existingLessons?.length || 0) + 1;

  const exclusionText = combinedExclusionList.length > 0
    ? `\nКРИТИЧЕСКИ ВАЖНО: Не повторяй темы или названия из этого списка: ${combinedExclusionList.join(', ')}.`
    : "";

  const prompt = `Ты - эксперт-преподаватель финского языка с глубоким пониманием финской культуры. 
    Создай качественный учебный урок для уровня ${level} на тему "${topic}".

    ИНСТРУКЦИИ ПО СТИЛЮ И ЯЗЫКУ:
    - Используй ТОЛЬКО кириллицу (русский) для теории/инструкций и латиницу (финский) для примеров/слов.
    - КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО использовать любые другие алфавиты (хинди, арабский, азиатские знаки и т.д.).
    - ИЗБЕГАЙ использования обратных кавычек (\`) для выделения слов в разделах "theory" и "finnish_fact". Вместо них используй жирный (**текст**) или курсив (*текст*).
    - Избегай банальностей из учебников. Сделай урок жизненным.
    - ФОКУС: ${topic}. ${exclusionText}
    - Используй современный контекст: приложения, экология, социальное дистанцирование, удаленная работа, финские привычки (sauna, sisu, talkoot).

    ВАЖНО: Ответ ТОЛЬКО валидный JSON без markdown и комментариев.
    
    Структура урока:
    {
      "level": "${level}",
      "number": ${nextNumber},
      "title": "Уникальное и интересное название урока на русском",
      "topic": "${topic}",
      "description": "Краткое описание урока (1-2 предложения)",
      "theory": "Подробная грамматическая теория на русском языке. Объясни нюансы, приведи примеры. Используй markdown.",
      "finnish_fact": "Уникальный, проверенный и НЕБАНАЛЬНЫЙ факт о Финляндии (на русском). Должен быть новым и интересным.",
      "cards": [
        {
          "finnish": "слово на финском",
          "russian": "перевод на русский",
          "emoji": "подходящий эмодзи",
          "example_sentence": { "finnish": "пример на финском", "russian": "перевод примера" },
          "colloquial_form": "разговорная форма (puhekieli), если актуально"
        }
      ],
      "quiz": [ ... ],
      "mini_dialogues": [
        {
          "title": "Название диалога",
          "lines": [
            { "speaker": "A", "line": "Реплика на финском", "translation": "Литературный перевод на русский" }
          ]
        }
      ]
    }
    
    ТРЕБОВАНИЯ:
    - Создай 15-20 карточек с примерами предложений.
    - Создай 15-20 вопросов для теста (тип choice).
    - Включи 2 живых, естественных диалога (без роботоподобных фраз). 
    - Используй puhekieli (mä/sä, ootsä, particles) там, где это уместно для живой речи.
    - В поле "finnish_fact" обязательно напиши что-то, чего обычно нет в стандартных путеводителях.

    Обязательно верни ПОЛНЫЙ JSON.`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are a professional Finnish language teacher and curriculum expert. You MUST use ONLY Cyrillic and Latin alphabets and respond in raw, valid JSON format.' },
      { role: 'user', content: prompt },
    ],
    model: 'llama-3.3-70b-versatile',
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 4500,
  });

  let responseText = completion.choices[0]?.message?.content || '';

  // Robust extraction: find the first { and last }
  const firstBrace = responseText.indexOf('{');
  const lastBrace = responseText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    responseText = responseText.substring(firstBrace, lastBrace + 1);
  }

  const lessonData = JSON.parse(responseText.trim());

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
