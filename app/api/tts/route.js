// app/api/tts/route.js

import { NextResponse } from 'next/server';

// Кэш в памяти (как было раньше)
const audioCache = new Map();

// Твой API ключ берётся из env (оставь GOOGLE_TTS_API_KEY)
const API_KEY = process.env.GOOGLE_TTS_API_KEY;

if (!API_KEY) {
  console.error('❌ GOOGLE_TTS_API_KEY not set in environment');
}

export async function POST(request) {
  try {
    const { text, language = 'fi-FI' } = await request.json();

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();
    const cacheKey = `${trimmedText}_${language}`;

    // Проверяем кэш
    if (audioCache.has(cacheKey)) {
      console.log('🔊 Playing from cache:', trimmedText);
      return NextResponse.json({ audioContent: audioCache.get(cacheKey) });
    }

    if (!API_KEY) {
      throw new Error('API key not configured');
    }

    // Прямой запрос к Google TTS REST API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text: trimmedText },
          voice: {
            languageCode: 'fi-FI',
            name: 'fi-FI-Wavenet-A', // Тот самый премиум женский голос
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.9, // Как ты хотел
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google TTS API error:', response.status, errorText);
      throw new Error(`TTS API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.audioContent) {
      throw new Error('No audio content in response');
    }

    // Сохраняем в кэш
    audioCache.set(cacheKey, data.audioContent);

    return NextResponse.json({ audioContent: data.audioContent });

  } catch (error) {
    console.error('❌ TTS route error:', error.message || error);

    // Флаг для fallback
    return NextResponse.json(
      { useFallback: true },
      { status: 500 }
    );
  }
}

// Для проверки доступности
export async function GET() {
  return NextResponse.json({
    status: API_KEY ? 'configured' : 'not_configured',
  });
}