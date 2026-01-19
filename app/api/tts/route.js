// app/api/tts/route.js

import { NextResponse } from 'next/server';

// In-memory cache for audio content
const audioCache = new Map();

// API key is sourced from environment variables
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

    // Check cache first
    if (audioCache.has(cacheKey)) {
      console.log('🔊 Serving from cache:', trimmedText);
      return NextResponse.json({ audioContent: audioCache.get(cacheKey) });
    }

    if (!API_KEY) {
      throw new Error('API key not configured');
    }

    // Direct request to Google TTS REST API
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
            name: 'fi-FI-Wavenet-A', // Premium female voice
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.9, // Slightly slower for learning
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

    // Save to cache
    audioCache.set(cacheKey, data.audioContent);

    return NextResponse.json({ audioContent: data.audioContent });

  } catch (error) {
    console.error('❌ TTS route error:', error.message || error);

    // Return a flag to use fallback on the client
    return NextResponse.json(
      { useFallback: true },
      { status: 500 }
    );
  }
}

// GET request to check API availability
export async function GET() {
  return NextResponse.json({
    status: API_KEY ? 'configured' : 'not_configured',
  });
}