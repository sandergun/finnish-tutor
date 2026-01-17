import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

    ВАЖНО: Ответь ТОЛЬКО валидным JSON без markdown и комментариев.
    
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
          "finnish": "...",
          "russian": "...",
          "example_sentence": { "finnish": "...", "russian": "..." },
          "colloquial_form": "..."
        }
      ],
      "quiz": [ /* ... */ ],
      "mini_dialogues": [
        {
          "title": "Название диалога",
          "lines": [
            { "speaker": "A", "line": "..." },
            { "speaker": "B", "line": "..." }
          ]
        }
      ]
    }
    
    ТРЕБОВАНИЯ К КОНТЕНТУ:
    - Используй частотную, употребимую лексику, соответствующую уровню ${level}.
    - Создай 15-20 карточек. Для КАЖДОЙ карточки ОБЯЗАТЕЛЬНО заполни все поля: "finnish", "russian", и "example_sentence".
    - Поле "example_sentence" ДОЛЖНО быть объектом вида { "finnish": "Пример на финском", "russian": "Перевод примера" }.
    - Включи 1-2 коротких \`mini_dialogues\` по теме урока. Название диалога ("title") - на русском. Реплики в диалогах ("line") - на финском.
    
    ТРЕБОВАНИЯ К ТЕСТАМ:
    - Создай 15-20 вопросов в тесте.
    - Текст самих вопросов ("question") должен быть на РУССКОМ. Вопросы должны проверять знание ФИНСКОГО языка, а не быть вопросами на общую эрудицию.
    - Используй ТОЛЬКО типы вопросов 'choice' и 'fill-in-choice'.
    
    СТРУКТУРА ВОПРОСОВ ПО ТИПАМ:
    - choice: Вопрос на перевод слова.
      - "question": "Как по-фински 'кошка'?"
      - "options": ["kissa", "koira", "pupu"] (массив из 3-4 финских слов: 1 правильный, остальные - похожие или из той же темы)
      - "correct": "kissa" (строка, правильный вариант)
    - fill-in-choice: Вопрос на вставку слова в предложение.
      - "question": "Вставьте слово: 'Minä ___ Suomesta.'"
      - "options": ["olen", "olet", "on"] (массив из 3-4 финских слов/форм)
      - "correct": 0 (ИНДЕКС правильного варианта в массиве)
    
    Обязательно верни ПОЛНЫЙ JSON, как в примере.`;

    const completion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'You are a professional Finnish language teacher. Always respond with valid JSON only, no markdown, no explanations. Focus on language learning.' },
            { role: 'user', content: prompt.replace('/* ... */', '...') },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 3500,
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
