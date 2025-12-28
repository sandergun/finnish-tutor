'use client'

import { useState, useEffect } from 'react'
import { Volume2, ArrowRight, ArrowLeft, Moon, Sun, CheckCircle, XCircle, Sparkles, Zap, Book } from 'lucide-react'
import { sounds } from '@/lib/sounds'

export default function LessonPlayer({ lesson, onComplete, onClose }) {
  // Определяем начальный этап в зависимости от типа урока
  const getInitialStage = () => {
    switch(lesson.type) {
      case 'practical': return 'words' // Сразу к словам
      case 'intensive': return 'theory' // Короткая теория
      default: return 'theory' // Стандартный
    }
  }

  const [stage, setStage] = useState(getInitialStage())
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [darkMode, setDarkMode] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme')
    setDarkMode(savedTheme === 'dark')
  }, [])

  if (!mounted) {
    return null
  }

  const toggleTheme = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
    sounds.playClick()
  }

  const speakWord = (text) => {
    sounds.playClick()
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'fi-FI'
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleAnswer = (questionIndex, answer) => {
    if (showFeedback) return
    sounds.playClick()
    setAnswers({ ...answers, [questionIndex]: answer })
  }

  const checkAnswers = () => {
    let correct = 0
    lesson.questions.forEach((q, index) => {
      if (answers[index] === q.correct) {
        correct++
      }
    })
    setScore(correct)
    setShowResults(true)
    
    const percentage = Math.round((correct / lesson.questions.length) * 100)
    if (percentage >= 70) {
      sounds.playSuccess()
    } else {
      sounds.playFailure()
    }
  }

  const handleFinish = () => {
    sounds.playClick()
    const percentage = Math.round((score / lesson.questions.length) * 100)
    onComplete({
      lessonId: lesson.id,
      score: percentage,
      correctAnswers: score,
      totalQuestions: lesson.questions.length,
      newWords: lesson.words.length
    })
  }

  const goNext = () => {
    sounds.playNext()
    
    // С теории переходим к словам или сразу к тесту (для intensive)
    if (stage === 'theory') {
      if (lesson.type === 'intensive') {
        setStage('quiz') // Интенсивный урок пропускает карточки
        setCurrentQuestionIndex(0)
      } else {
        setStage('words')
        setCurrentWordIndex(0)
      }
      return
    }
    
    // Пролистываем карточки слов
    if (stage === 'words') {
      if (currentWordIndex < lesson.words.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1)
      } else {
        setStage('quiz')
        setCurrentQuestionIndex(0)
      }
      return
    }
    
    // Логика квиза
    if (stage === 'quiz') {
      if (showFeedback) {
        setShowFeedback(false)
        
        if (currentQuestionIndex < lesson.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
        } else {
          checkAnswers()
        }
        return
      }
      
      const question = lesson.questions[currentQuestionIndex]
      const userAnswer = answers[currentQuestionIndex]
      const correct = userAnswer === question.correct
      
      setIsCorrect(correct)
      setShowFeedback(true)
      
      if (correct) {
        sounds.playCorrect()
      } else {
        sounds.playWrong()
      }
    }
  }

  const goBack = () => {
    sounds.playClick()
    
    if (stage === 'words' && currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1)
    } else if (stage === 'words' && currentWordIndex === 0) {
      if (lesson.type === 'practical') {
        onClose() // Практический урок начинается с карточек
      } else {
        setStage('theory')
      }
    } else if (stage === 'quiz' && !showFeedback) {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1)
      } else {
        if (lesson.type === 'intensive') {
          setStage('theory')
        } else {
          setStage('words')
          setCurrentWordIndex(lesson.words.length - 1)
        }
      }
    }
  }

  const bgClass = darkMode 
    ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' 
    : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
  
  const cardClass = darkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-100'
  
  const textClass = darkMode ? 'text-white' : 'text-gray-800'
  const textSecondaryClass = darkMode ? 'text-gray-300' : 'text-gray-600'

  // Бейджик типа урока
  const getLessonTypeBadge = () => {
    const types = {
      'standard': { icon: Book, label: 'Стандартный', color: 'blue' },
      'practical': { icon: Sparkles, label: 'Практика', color: 'purple' },
      'intensive': { icon: Zap, label: 'Интенсив', color: 'orange' }
    }
    
    const type = types[lesson.type] || types.standard
    const Icon = type.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
        darkMode 
          ? `bg-${type.color}-900/50 text-${type.color}-300 border border-${type.color}-700` 
          : `bg-${type.color}-100 text-${type.color}-700 border border-${type.color}-300`
      }`}>
        <Icon className="w-3 h-3" />
        {type.label}
      </span>
    )
  }

  // ТЕОРИЯ
  if (stage === 'theory') {
    return (
      <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-blue-500' : 'bg-purple-300'}`}></div>
          <div className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-purple-500' : 'bg-blue-300'}`}></div>
        </div>

        <div className="relative z-10 p-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => { sounds.playClick(); onClose(); }}
              className={`${textClass} hover:underline transition`}
            >
              ← Назад к урокам
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-700'} hover:scale-110 transition-transform`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <div className={`${cardClass} rounded-2xl p-6 shadow-2xl border backdrop-blur-sm`}>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  {lesson.level} • Урок {lesson.number}
                </span>
                {getLessonTypeBadge()}
              </div>
              <h1 className={`text-2xl font-bold ${textClass} mt-1`}>
                {lesson.title}
              </h1>
            </div>

            <div className="mb-6">
              <h3 className={`text-lg font-semibold ${textClass} mb-2 flex items-center gap-2`}>
                📖 Теория
              </h3>
              <p className={`${textSecondaryClass} whitespace-pre-line leading-relaxed`}>
                {lesson.theory}
              </p>
            </div>

            {lesson.examples && (
              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${textClass} mb-3 flex items-center gap-2`}>
                  💬 Примеры
                </h3>
                <div className="space-y-2">
                  {lesson.examples.map((example, index) => (
                    <div key={index} className={`p-4 rounded-xl ${
                      darkMode 
                        ? 'bg-blue-900/30 border border-blue-700' 
                        : 'bg-blue-50 border border-blue-100'
                    }`}>
                      <div className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                        {example.finnish}
                      </div>
                      <div className={`text-sm ${textSecondaryClass} mt-1`}>
                        {example.russian}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={goNext}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg"
            >
              {lesson.type === 'intensive' ? 'Начать тест' : 'Изучить слова'}
              {lesson.type === 'intensive' ? <Zap className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // КАРТОЧКИ СЛОВ
  if (stage === 'words') {
    const word = lesson.words[currentWordIndex]
    const progress = ((currentWordIndex + 1) / lesson.words.length) * 100
    
    return (
      <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-blue-500' : 'bg-purple-300'}`}></div>
          <div className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-purple-500' : 'bg-blue-300'}`}></div>
        </div>

        <div className="relative z-10 p-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={goBack} className={`${textClass} hover:underline transition`}>
              ← Назад
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-700'} hover:scale-110 transition-transform`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <div className={`${cardClass} rounded-2xl p-6 shadow-2xl border`}>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-lg font-semibold ${textClass}`}>📝 Новые слова</h3>
                <span className={`text-sm ${textSecondaryClass}`}>
                  {currentWordIndex + 1} / {lesson.words.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className={`rounded-3xl p-12 text-center mb-6 min-h-[350px] flex flex-col justify-center ${
              darkMode 
                ? 'bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-blue-700' 
                : 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200'
            }`}>
              <div className="text-7xl mb-8 animate-bounce">🇫🇮</div>
              <h2 className={`text-5xl font-bold mb-6 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                {word.finnish}
              </h2>
              <p className={`text-3xl ${textSecondaryClass} mb-8`}>
                {word.russian}
              </p>
              <button
                onClick={() => speakWord(word.finnish)}
                className="mx-auto p-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg"
              >
                <Volume2 className="w-7 h-7" />
              </button>
            </div>

            <button
              onClick={goNext}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg"
            >
              {currentWordIndex < lesson.words.length - 1 ? 'Следующее слово' : 'Начать тест'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // РЕЗУЛЬТАТЫ
  if (showResults) {
    const percentage = Math.round((score / lesson.questions.length) * 100)
    const passed = percentage >= 70

    return (
      <div className={`min-h-screen ${bgClass} transition-colors duration-300 p-6 flex items-center justify-center`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl opacity-20 ${passed ? (darkMode ? 'bg-green-500' : 'bg-green-300') : (darkMode ? 'bg-orange-500' : 'bg-orange-300')}`}></div>
          <div className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${passed ? (darkMode ? 'bg-blue-500' : 'bg-blue-300') : (darkMode ? 'bg-red-500' : 'bg-red-300')}`}></div>
        </div>

        <div className="relative z-10 flex items-center justify-between mb-4 absolute top-6 right-6">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-white text-gray-700'} hover:scale-110 transition-transform shadow-lg`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className={`relative z-10 max-w-md w-full ${cardClass} rounded-2xl p-8 text-center shadow-2xl border`}>
          <div className={`text-6xl mb-4 animate-bounce`}>
            {passed ? '🎉' : '💪'}
          </div>
          
          <h2 className={`text-3xl font-bold ${textClass} mb-2`}>
            {passed ? 'Отлично!' : 'Неплохо!'}
          </h2>
          
          <p className={`${textSecondaryClass} mb-6`}>
            {passed 
              ? 'Ты прошёл урок! Продолжай в том же духе.'
              : 'Рекомендуем повторить урок для лучшего результата.'
            }
          </p>

          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-50 to-purple-50'} rounded-xl p-6 mb-6`}>
            <div className={`text-5xl font-bold mb-2 ${passed ? 'text-green-500' : 'text-orange-500'}`}>
              {percentage}%
            </div>
            <div className={textSecondaryClass}>
              {score} из {lesson.questions.length} правильных ответов
            </div>
            <div className={`mt-3 text-sm ${textSecondaryClass}`}>
              📚 Выучено слов: {lesson.words.length}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleFinish}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
            >
              Завершить урок
            </button>
            
            {!passed && (
              <button
                onClick={() => {
                  sounds.playClick()
                  setStage(getInitialStage())
                  setCurrentWordIndex(0)
                  setCurrentQuestionIndex(0)
                  setAnswers({})
                  setShowResults(false)
                  setScore(0)
                  setShowFeedback(false)
                }}
                className={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} ${textClass} font-semibold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95`}
              >
                Пройти заново
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // КВИЗ
  const question = lesson.questions[currentQuestionIndex]
  const userAnswer = answers[currentQuestionIndex]

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-purple-500' : 'bg-purple-300'}`}></div>
        <div className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-blue-500' : 'bg-blue-300'}`}></div>
      </div>

      <div className="relative z-10 p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={goBack} className={`${textClass} hover:underline transition`}>
            ← Назад
          </button>
          <span className={`font-semibold ${textClass}`}>
            Вопрос {currentQuestionIndex + 1} из {lesson.questions.length}
          </span>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-700'} hover:scale-110 transition-transform`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className={`${cardClass} rounded-2xl p-6 shadow-2xl border`}>
          <div className="mb-6">
            <div className="flex gap-1 mb-6">
              {lesson.questions.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    index < currentQuestionIndex
                      ? 'bg-green-500'
                      : index === currentQuestionIndex
                      ? 'bg-blue-500'
                      : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            <h3 className={`text-xl font-semibold ${textClass} mb-6`}>
              {question.question}
            </h3>

            {question.type === 'choice' && (
              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const isSelected = userAnswer === index
                  const isCorrectOption = index === question.correct
                  const showCorrect = showFeedback && isCorrectOption
                  const showWrong = showFeedback && isSelected && !isCorrectOption
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(currentQuestionIndex, index)}
                      disabled={showFeedback}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium flex items-center justify-between ${
                        showCorrect
                          ? darkMode
                            ? 'border-green-500 bg-green-900/50 text-white shadow-lg'
                            : 'border-green-500 bg-green-50 text-green-900 shadow-lg'
                          : showWrong
                          ? darkMode
                            ? 'border-red-500 bg-red-900/50 text-white shadow-lg'
                            : 'border-red-500 bg-red-50 text-red-900 shadow-lg'
                          : isSelected
                          ? darkMode
                            ? 'border-blue-500 bg-blue-900/50 text-white shadow-lg scale-[1.02]'
                            : 'border-blue-500 bg-blue-50 text-blue-900 shadow-lg scale-[1.02]'
                          : darkMode
                          ? 'border-gray-600 bg-gray-700 text-gray-200 hover:border-blue-400 hover:bg-gray-600'
                          : 'border-gray-300 bg-white text-gray-800 hover:border-blue-400 hover:bg-gray-50 hover:shadow-md'
                      } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span>{option}</span>
                      {showCorrect && <CheckCircle className="w-6 h-6 text-green-500" />}
                      {showWrong && <XCircle className="w-6 h-6 text-red-500" />}
                    </button>
                  )
                })}
              </div>
            )}

            {question.type === 'translate' && (
              <div>
                {/* Инпут */}
                <input
                  type="text"
                  placeholder="Введи перевод..."
                  disabled={showFeedback}
                  className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-all font-medium ${
                    showFeedback
                      ? isCorrect
                        ? darkMode
                          ? 'border-green-500 bg-green-900/50 text-white'
                          : 'border-green-500 bg-green-50 text-green-900'
                        : darkMode
                          ? 'border-red-500 bg-red-900/50 text-white'
                          : 'border-red-500 bg-red-50 text-red-900'
                      : darkMode
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:shadow-lg'
                  }`}
                  value={userAnswer || ''}
                  onChange={(e) => handleAnswer(currentQuestionIndex, e.target.value.toLowerCase().trim())}
                />
               
                {/* Показываем правильный ответ если ошибся */}
                {showFeedback && !isCorrect && (
                  <div className={`mt-2 text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    Правильный ответ: <strong>{question.correct}</strong>
                  </div>
                )}
               
                {/* Кнопки помощи (только если НЕ показан feedback) */}
                {!showFeedback && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {/* Кнопка озвучки */}
                    {question.audio && (
                      <button
                        onClick={() => speakWord(question.audio)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          darkMode
                            ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-800/50 border border-blue-700'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                        }`}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Прослушать</span>
                      </button>
                    )}
                   
                    {/* Кнопка подсказки (первая буква) */}
                    <button
                      onClick={() => {
                        sounds.playClick()
                        const firstLetter = question.correct.charAt(0)
                        handleAnswer(currentQuestionIndex, firstLetter)
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        darkMode
                          ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50 border border-purple-700'
                          : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                      }`}
                    >
                      <span className="text-sm font-medium">💡 Подсказка</span>
                    </button>
                   
                    {/* Кнопка "Не знаю" */}
                    <button
                      onClick={() => {
                        sounds.playClick()
                        handleAnswer(currentQuestionIndex, '___skip___') // Специальное значение
                        // Принудительно показываем правильный ответ
                        setIsCorrect(false)
                        setShowFeedback(true)
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        darkMode
                          ? 'bg-orange-900/50 text-orange-300 hover:bg-orange-800/50 border border-orange-700'
                          : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
                      }`}
                    >
                      <span className="text-sm font-medium">❓ Не знаю</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {showFeedback && (
            <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
              isCorrect
                ? darkMode
                  ? 'bg-green-900/30 border-2 border-green-500'
                  : 'bg-green-50 border-2 border-green-500'
                : darkMode
                  ? 'bg-red-900/30 border-2 border-red-500'
                  : 'bg-red-50 border-2 border-red-500'
            }`}>
              {isCorrect ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                  <div>
                    <div className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                      Правильно! 🎉
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                      Отличная работа!
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                  <div>
                    <div className={`font-bold ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                      Неправильно
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                      Ничего страшного, попробуй ещё раз!
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            onClick={goNext}
            disabled={!showFeedback && (userAnswer === undefined || userAnswer === '' || userAnswer === '___skip___')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
          >
            {showFeedback ? (
              currentQuestionIndex === lesson.questions.length - 1 ? 'Посмотреть результаты' : 'Продолжить'
              ) : (
              'Проверить'
            )}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}