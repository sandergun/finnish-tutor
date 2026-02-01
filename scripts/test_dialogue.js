
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testDialogue() {
    const level = 'A1';
    const topic = 'Знакомство на вечеринке';

    const prompt = `Ты - профессиональный преподаватель финского языка. 
  Создай 2 коротких, живых мини-диалога (mini_dialogues) для уровня ${level} на тему "${topic}".
  
  Ответь ТОЛЬКО валидным JSON формата:
  {
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

  Инструкция к диалогам:
    - Сделай диалоги МАКСИМАЛЬНО естественными. Избегай стиля "допрос" (Вопрос-Ответ-Вопрос-Ответ).
    - Если А задает вопрос, В должен ответить и, возможно, добавить комментарий или задать встречный вопрос.
    - Используй разговорные частицы и реакции (Aijaa? Oho! Tosi kiva! Vai niin.), чтобы связать реплики.
    - Пример ЛОГИКИ (не копируй текст, копируй структуру общения):
      - Плохо: "Кто ты?" -> "Я Анна." -> "Где живешь?" -> "В Хельсинки."
      - Хорошо: "Кто ты?" -> "Я Анна, а тебя как зовут?" -> "Я Пекка. Приятно познакомиться!" -> "И мне! Ты здесь живешь?"
    - Перевод на русский должен быть литературным, передавать смысл и эмоции, а не быть машинным.
  `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a professional Finnish language teacher. Always respond with valid JSON only, no markdown.' },
                { role: 'user', content: prompt },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 1000,
        });

        console.log(completion.choices[0]?.message?.content);
    } catch (e) {
        console.error(e);
    }
}

testDialogue();
