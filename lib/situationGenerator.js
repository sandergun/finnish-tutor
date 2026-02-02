import Groq from 'groq-sdk';

export async function generateSituation(mode, topic = "", userLevel = 'A1', recentTitles = []) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing in server environment variables");
  }

  const groq = new Groq({ apiKey });
  const salt = Math.random().toString(36).substring(7);

  try {
    const level = userLevel || 'A1';

    // Format exclusion list for the prompt
    const exclusionListText = recentTitles.length > 0
      ? `\nCRITICAL: Do NOT generate a situation regarding any of these recent topics: ${recentTitles.join(', ')}.`
      : "";

    const jsonSchema = `
    {
      "title": "Название ситуации на русском",
      "description_ru": "Краткое описание на русском",
      "theory": "Полезные фразы и культурный контекст для этой ситуации (на русском). Список фраз с переводом (минимум 5).",
      "finnish_fact": "Уникальный и проверенный факт или совет о жизни в Финляндии (на русском).",
      "level": "${level}",
      "steps": [
        {
          "step": 1,
          "interlocutor_fi": "Фраза собеседника на финском (приветствие/вопрос)",
          "interlocutor_ru": "Перевод фразы собеседника на русский",
          "prompt_ru": "Инструкция для пользователя (например: 'Поздоровайся и спроси который час')",
          "expected_fi": ["Hyvää päivää", "Hei"],
          "expected_ru": ["Добрый день", "Привет"],
          "hint_ru": "Подсказка: используйте 'Päivää'..."
        }
      ]
    }`;

    const instructionGuidelines = `
      - LANGUAGE: Use ONLY Cyrillic (Russian) for instructions/descriptions and Latin (Finnish) for dialogues. 
      - SCRIPT CONSTRAINT: DO NOT use any other alphabets (e.g., no Hindi, Arabic, or Asian characters).
      - NO UNNECESSARY BACKTICKS: Avoid using backticks (\`) for emphasis in "theory" or "finnish_fact" sections unless absolutely necessary. Use bold (**text**) or italics (*text*) instead.
      - THEME SELECTION: Prioritize realistic, modern, and varied Finnish scenarios. 
      - THEMATIC INSPIRATION: Think of bureaucracy (Kela, Vero), workplace etiquette, neighborly relations, hobby clubs (sähly, knitting), seasonal traditions (Vappu, Juhannus), winter survival (parking heaters, gritty roads), recycling habits, or specific public transport scenarios.
      - AVOID REPETITION: ${exclusionListText}
      - NO CLICHÉS: Avoid "buying an apple" or "ordering a beer" unless there is a specific realistic complication (e.g., dietary restriction, price dispute).
      - SPOKEN FINNISH (PUHEKIELI): Use natural spoken Finnish in dialogues where appropriate (e.g., "mä" instead of "minä", "ootsä" instead of "oletko sinä", particles like "nii", "kyl", "no").
      - VERIFIED FINNISH FACT: Research a specific, non-obvious fact about Finland (law, habit, history). It MUST be relevant or at least high-quality and unique.
      - VARIETY SALT: ${salt} (Use this to diverge from common LLM biases).
    `;

    let prompt = "";
    if (mode === 'manual') {
      prompt = `Create a Finnish learning simulation for level ${level}.
      TOPIC PROVIDED BY USER: "${topic}".
      ${instructionGuidelines}
      
      Requirements:
      1. Output ONLY VALID JSON.
      2. Match schema: ${jsonSchema}
      3. Steps: 3 to 6 logical steps of dialogue.
      `;
    } else {
      prompt = `Generate a unique, realistic daily life situation in Finland for a student at level ${level}.
      ${instructionGuidelines}
      
      Requirements:
      1. Output ONLY VALID JSON.
      2. Match schema: ${jsonSchema}
      3. Steps: 3 to 6 steps.
      `;
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional Finnish language curriculum designer specializing in high-quality, realistic simulations. You MUST use ONLY Cyrillic and Latin alphabets."
        },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    let jsonStr = completion.choices[0]?.message?.content || "";

    // Robust extraction: find the first { and last }
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }

    try {
      // Basic cleaning for common LLM issues (though JSON mode should handle most)
      // Remove potential leading/trailing junk
      jsonStr = jsonStr.trim();

      const situationData = JSON.parse(jsonStr);
      return situationData;
    } catch (parseError) {
      console.error("JSON Parse Error. Raw text snippet:", jsonStr.substring(0, 200));
      throw new Error("AI returned invalid JSON: " + parseError.message);
    }

  } catch (error) {
    console.error("Error generating situation:", JSON.stringify(error, null, 2));
    throw new Error(error.message || "Failed to generate situation");
  }
}
