import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { text, language = 'fi-FI' } = await request.json()
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Google Cloud TTS API Key (из переменной окружения)
    const apiKey = process.env.GOOGLE_TTS_API_KEY
    
    if (!apiKey) {
      console.error('❌ GOOGLE_TTS_API_KEY not found, using fallback')
      return NextResponse.json(
        { error: 'API key not configured', useFallback: true },
        { status: 503 }
      )
    }

    // Запрос к Google Cloud Text-to-Speech API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: language,
            // Голоса для финского: fi-FI-Standard-A (женский), fi-FI-Wavenet-A (улучшенный женский)
            name: 'fi-FI-Wavenet-A',
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: 0,
            speakingRate: 0.9 // Немного медленнее для обучения
          }
        })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Google TTS API error:', error)
      
      return NextResponse.json(
        { error: 'TTS service error', useFallback: true },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // audioContent - это base64 закодированный MP3
    return NextResponse.json({
      success: true,
      audioContent: data.audioContent,
      language
    })

  } catch (error) {
    console.error('💥 TTS API error:', error)
    return NextResponse.json(
      { error: error.message, useFallback: true },
      { status: 500 }
    )
  }
}

// Для GET запроса - возвращаем информацию об API
export async function GET() {
  const apiKey = process.env.GOOGLE_TTS_API_KEY
  
  return NextResponse.json({
    status: apiKey ? 'configured' : 'not_configured',
    availableVoices: [
      { name: 'fi-FI-Standard-A', gender: 'FEMALE', type: 'Standard' },
      { name: 'fi-FI-Wavenet-A', gender: 'FEMALE', type: 'WaveNet (Premium)' }
    ]
  })
}