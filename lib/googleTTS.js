// lib/googleTTS.js

// Кэш для аудио (чтобы не запрашивать одни и те же слова)
const audioCache = new Map()

// Проверка доступности Google TTS API
let googleTTSAvailable = null

export const checkGoogleTTSAvailability = async () => {
  if (googleTTSAvailable !== null) {
    return googleTTSAvailable
  }

  try {
    const response = await fetch('/api/tts')
    const data = await response.json()
    googleTTSAvailable = data.status === 'configured'
    console.log('🔊 Google TTS status:', googleTTSAvailable ? '✅ Available' : '⚠️ Not configured, using fallback')
    return googleTTSAvailable
  } catch (error) {
    console.error('❌ Error checking TTS availability:', error)
    googleTTSAvailable = false
    return false
  }
}

// Глобальная переменная для отслеживания текущего аудио
let currentAudio = null;

// Озвучка текста через Google TTS
export const speakWithGoogleTTS = async (text, language = 'fi-FI') => {
  try {
    // Останавливаем предыдущее аудио
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }

    const cacheKey = `${text}_${language}`
    let audioContent = null;

    // Проверяем кэш
    if (audioCache.has(cacheKey)) {
      console.log('🔊 Playing from cache:', text)
      audioContent = audioCache.get(cacheKey)
    } else {
      console.log('🔊 Requesting Google TTS for:', text)
      // Запрос к нашему API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language
        })
      })

      const data = await response.json()

      // Если API вернул флаг fallback - используем Web Speech API
      if (data.useFallback || !data.audioContent) {
        console.warn('⚠️ Google TTS unavailable, using Web Speech API fallback')
        return speakWithWebSpeechAPI(text, language)
      }

      audioContent = data.audioContent;
      // Сохраняем в кэш base64 строку
      audioCache.set(cacheKey, audioContent)
    }

    // Создаём НОВЫЙ Audio объект из base64 каждый раз
    const audio = new Audio(`data:audio/mp3;base64,${audioContent}`)
    currentAudio = audio; // Сохраняем ссылку

    // Воспроизводим
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        if (error.name === 'AbortError') {
          console.warn('🔊 Playback interrupted (AbortError):', text);
        } else {
          console.error('❌ Playback error:', error);
        }
      });
    }

    // Очищаем ссылку по завершении
    audio.onended = () => {
      if (currentAudio === audio) {
        currentAudio = null;
      }
    };

    console.log('✅ Google TTS played successfully')
    return true

  } catch (error) {
    console.error('❌ Google TTS error:', error)
    // Fallback на Web Speech API
    return speakWithWebSpeechAPI(text, language)
  }
}

// Fallback: Web Speech API (встроенный в браузер)
export const speakWithWebSpeechAPI = (text, language = 'fi-FI') => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.error('❌ Speech Synthesis not supported in this browser')
      resolve(false)
      return
    }

    try {
      // Останавливаем предыдущую озвучку
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language
      utterance.rate = 0.8 // Медленнее для обучения
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onend = () => {
        console.log('✅ Web Speech API completed')
        resolve(true)
      }

      utterance.onerror = (error) => {
        console.error('❌ Web Speech API error:', error)
        resolve(false)
      }

      window.speechSynthesis.speak(utterance)
      console.log('🔊 Using Web Speech API fallback for:', text)
    } catch (error) {
      console.error('❌ Web Speech API error:', error)
      resolve(false)
    }
  })
}

// Универсальная функция озвучки (автоматически выбирает лучший метод)
export const speak = async (text, language = 'fi-FI') => {
  // Проверяем доступность Google TTS
  const isGoogleAvailable = await checkGoogleTTSAvailability()

  if (isGoogleAvailable) {
    return await speakWithGoogleTTS(text, language)
  } else {
    console.log('🔊 Google TTS not available, using Web Speech API')
    return await speakWithWebSpeechAPI(text, language)
  }
}

// Очистка кэша (если нужно освободить память)
export const clearAudioCache = () => {
  audioCache.clear()
  console.log('🗑️ Audio cache cleared')
}

// Предзагрузка озвучки для списка слов
export const preloadAudio = async (words, language = 'fi-FI') => {
  const isGoogleAvailable = await checkGoogleTTSAvailability()

  if (!isGoogleAvailable) {
    console.log('⚠️ Google TTS not available, skipping preload')
    return
  }

  console.log('📥 Preloading audio for', words.length, 'words...')

  for (const word of words) {
    const cacheKey = `${word}_${language}`

    // Пропускаем, если уже в кэше
    if (audioCache.has(cacheKey)) {
      continue
    }

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: word,
          language
        })
      })

      const data = await response.json()

      if (data.audioContent && !data.useFallback) {
        // Кэшируем base64 строку
        audioCache.set(cacheKey, data.audioContent)
      }
    } catch (error) {
      console.error('❌ Error preloading:', word, error)
    }
  }

  console.log('✅ Preload completed. Cache size:', audioCache.size)
}