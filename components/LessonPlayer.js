'use client'

<<<<<<< HEAD
import { useState, useEffect } from 'react'
import { Volume2, ArrowRight, ArrowLeft, Moon, Sun, CheckCircle, XCircle, Sparkles, Zap, Book } from 'lucide-react'
import { sounds } from '@/lib/sounds'
import { speak, preloadAudio } from '@/lib/googleTTS'

export default function LessonPlayer({ lesson, onComplete, onClose }) {
  // Определяем начальный этап в зависимости от типа урока
  const getInitialStage = () => {
    switch (lesson.type) {
      case 'practical':
        return 'words' // Сразу к словам
      case 'intensive':
        return 'theory' // Короткая теория
      default:
        return 'theory' // Стандартный
    }
  }

  const [stage, setStage] = useState(getInitialStage())
=======
import { useState, useEffect, useMemo } from 'react'
import { Volume2, ArrowRight, ArrowLeft, Moon, Sun, CheckCircle, XCircle, Sparkles, Zap, Book, X, HelpCircle, RotateCcw, SkipForward, Eye, MessageSquare, GraduationCap, Brain, Globe } from 'lucide-react'
import { speak } from '@/lib/googleTTS'
import { sounds } from '@/lib/sounds'

// Helper function to shuffle an array
const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function LessonPlayer({ lesson: rawLesson, onComplete, onClose }) {
  // Memoize the initial lesson processing
  const lesson = useMemo(() => ({
    ...(rawLesson || {}),
    questions: (rawLesson?.questions || []).map(q => ({ ...q, options: q.options || [] })),
    words: rawLesson?.words || [],
    examples: rawLesson?.examples || [],
    mini_dialogues: (rawLesson?.mini_dialogues || []).map(d => ({ ...d, lines: d.lines || [] })),
  }), [rawLesson]);

  // Add new state for shuffled questions
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  useEffect(() => {
    // This effect will run once when the lesson is loaded.
    // It shuffles the options for choice questions and normalizes the data structure.
    const processedQuestions = lesson.questions.map(q => {
      if (q.type === 'choice' || q.type === 'fill-in-choice') {
        if (!q.options || q.options.length === 0) {
          return { ...q, isBroken: true }; // Mark question as broken
        }

        let correctAnswerValue;
        // Handle both index and string value for correct answer
        if (typeof q.correct === 'number') {
          correctAnswerValue = q.options[q.correct];
        } else {
          correctAnswerValue = q.correct;
        }

        if (correctAnswerValue === undefined) {
          return { ...q, isBroken: true };
        }

        const shuffled = shuffleArray(q.options);
        const newCorrectIndex = shuffled.indexOf(correctAnswerValue);

        return {
          ...q,
          options: shuffled,
          correct: newCorrectIndex, // Always use index for consistency
        };
      }
      return q;
    });
    setShuffledQuestions(processedQuestions);

  }, [lesson.questions]);

  const [stage, setStage] = useState('theory')
>>>>>>> cf50603 (MWP Working)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [darkMode, setDarkMode] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [mounted, setMounted] = useState(false)
<<<<<<< HEAD
  const [isSpeaking, setIsSpeaking] = useState(false)

=======
  
  // States for 'translate' question type
  const [userWords, setUserWords] = useState([])
  const [wordOptions, setWordOptions] = useState([])
  
  // New states for interactive word cards
  const [showExample, setShowExample] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)

  const [translationClicks, setTranslationClicks] = useState(0)
  const [cardsWithoutTranslation, setCardsWithoutTranslation] = useState(0)
  const [translationShownForCurrentCard, setTranslationShownForCurrentCard] = useState(false)


  const userInput = useMemo(() => userWords.join(' '), [userWords]);
  
>>>>>>> cf50603 (MWP Working)
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme')
    setDarkMode(savedTheme === 'dark')
<<<<<<< HEAD
  }, [])

  // Предзагрузка аудио для слов (только для standard и practical)
  useEffect(() => {
    if (lesson.type === 'standard' || lesson.type === 'practical') {
      const words = lesson.words.map((w) => w.finnish)
      preloadAudio(words, 'fi-FI')
    }
  }, [lesson])

  if (!mounted) {
    return null
=======
    // Set initial stage based on lesson type
    setStage(lesson.type === 'practical' ? 'words' : 'theory');
  }, [lesson.type])
  
  // Use the shuffled questions for the quiz
  const question = useMemo(() => shuffledQuestions[currentQuestionIndex], [shuffledQuestions, currentQuestionIndex]);

  useEffect(() => {
    // This effect now populates the word bank for the 'translate' question type
    if (stage === 'quiz' && question?.type === 'translate') {
      const correctWords = (question.correct || '').split(' ').filter(Boolean);
      
      if (correctWords.length === 0) {
        setWordOptions([]);
        return;
      }

      const distractorPool = [
        ...lesson.words.map(w => w.finnish).filter(w => !correctWords.includes(w)),
        'ja', 'on', 'ei', 'mutta', 'myös', 'sinä', 'minä', 'hän'
      ];
      const shuffledPool = shuffleArray([...new Set(distractorPool)]);
      const numDistractors = Math.min(Math.max(4, correctWords.length), 6);
      const distractors = shuffledPool.slice(0, numDistractors);
      setWordOptions(shuffleArray([...correctWords, ...distractors]));
      setUserWords([]);
    }
  }, [currentQuestionIndex, stage, question, lesson.words]);


  if (!mounted || shuffledQuestions.length === 0) {
    // Show a loading state until questions are shuffled and ready
    return null;
>>>>>>> cf50603 (MWP Working)
  }

  const toggleTheme = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
    sounds.playClick()
  }

<<<<<<< HEAD
  const handleSpeak = async (text, language = 'fi-FI') => {
    if (isSpeaking) return

    setIsSpeaking(true)
    try {
      await speak(text, language)
    } finally {
      setIsSpeaking(false)
=======
  const speakWord = async (text) => {
    sounds.playClick()
    try {
      await speak(text, 'fi-FI')
    } catch (error) {
      console.error('TTS error:', error)
>>>>>>> cf50603 (MWP Working)
    }
  }

  const handleAnswer = (questionIndex, answer) => {
    if (showFeedback) return
    sounds.playClick()
    setAnswers({ ...answers, [questionIndex]: answer })
  }

  const checkAnswers = () => {
<<<<<<< HEAD
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
=======
    let correctCount = 0
    shuffledQuestions.forEach((q, index) => {
      const userAnswer = answers[index];
      if (userAnswer === undefined || userAnswer === '___skip___') return;

      if (q.type === 'translate') {
        if (userAnswer.toLowerCase().trim() === (q.correct || '').toLowerCase().trim()) {
          correctCount++;
        }
      } else if (q.options && userAnswer === q.options[q.correct]) {
        correctCount++;
      }
    });
    
    setScore(correctCount)
    setShowResults(true)
    const percentage = Math.round((correctCount / shuffledQuestions.length) * 100)
    if (percentage >= 70) sounds.playSuccess()
    else sounds.playFailure()
>>>>>>> cf50603 (MWP Working)
  }

  const handleFinish = () => {
    sounds.playClick()
<<<<<<< HEAD
    const percentage = Math.round((score / lesson.questions.length) * 100)
    onComplete({
      lessonId: lesson.id,
      score: percentage,
      correctAnswers: score,
      totalQuestions: lesson.questions.length,
      newWords: lesson.words.length,
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
=======
    onComplete({
      lessonId: lesson.id,
      score: Math.round((score / shuffledQuestions.length) * 100),
      correctAnswers: score,
      totalQuestions: shuffledQuestions.length,
      newWords: lesson.words.length,
      translationClicks,
      cardsWithoutTranslation
    })
  }

  const resetWordCard = () => {
    setShowExample(false)
    setShowTranslation(false)
    setTranslationShownForCurrentCard(false)
  }

  const goNext = () => {
    sounds.playNext()
    
    if (stage === 'theory') {
      resetWordCard()
      setStage(lesson.type === 'intensive' ? 'quiz' : 'words')
      return
    }
    
    if (stage === 'words') {
      if (!translationShownForCurrentCard) {
        setCardsWithoutTranslation(prev => prev + 1)
      }
      
      resetWordCard()

>>>>>>> cf50603 (MWP Working)
      if (currentWordIndex < lesson.words.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1)
      } else {
        setStage('quiz')
<<<<<<< HEAD
        setCurrentQuestionIndex(0)
      }
      return
    }

    // Логика квиза
    if (stage === 'quiz') {
      if (showFeedback) {
        setShowFeedback(false)

        if (currentQuestionIndex < lesson.questions.length - 1) {
=======
      }
      return
    }
    
    if (stage === 'quiz') {
      if (showFeedback) {
        setShowFeedback(false)
        if (currentQuestionIndex < shuffledQuestions.length - 1) {
>>>>>>> cf50603 (MWP Working)
          setCurrentQuestionIndex(currentQuestionIndex + 1)
        } else {
          checkAnswers()
        }
        return
      }
<<<<<<< HEAD

      const question = lesson.questions[currentQuestionIndex]
      const userAnswer = answers[currentQuestionIndex]
      const correct = userAnswer === question.correct

      setIsCorrect(correct)
      setShowFeedback(true)

      if (correct) {
        sounds.playCorrect()
      } else {
        sounds.playWrong()
=======
      
      const userAnswer = question.type === 'translate' ? userInput : answers[currentQuestionIndex];
      
      let isAnswerCorrect = false;
      if (question.type === 'translate') {
        isAnswerCorrect = userAnswer.toLowerCase().trim() === (question.correct || '').toLowerCase().trim();
      } else if (question.type === 'choice' || question.type === 'fill-in-choice') {
        // Now 'correct' is always an index
        isAnswerCorrect = userAnswer === question.options[question.correct];
      }

      setIsCorrect(isAnswerCorrect)
      setShowFeedback(true)
      
      if (isAnswerCorrect) sounds.playCorrect()
      else sounds.playWrong()
      
      // Save the raw user answer for checking at the end
      if (userAnswer !== undefined) {
        handleAnswer(currentQuestionIndex, userAnswer);
>>>>>>> cf50603 (MWP Working)
      }
    }
  }

  const goBack = () => {
    sounds.playClick()
<<<<<<< HEAD

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
=======
    resetWordCard()
    
    if (stage === 'words') {
      if (currentWordIndex > 0) {
        setCurrentWordIndex(currentWordIndex - 1)
      } else {
        if (lesson.type !== 'practical') setStage('theory')
        else onClose();
      }
      return
    }
    
    if (stage === 'quiz' && !showFeedback) {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1)
      } else {
        setStage(lesson.type === 'intensive' ? 'theory' : 'words')
>>>>>>> cf50603 (MWP Working)
      }
    }
  }

<<<<<<< HEAD
  const bgClass = darkMode
    ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900'
    : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'

  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'

  const textClass = darkMode ? 'text-white' : 'text-gray-800'
  const textSecondaryClass = darkMode ? 'text-gray-300' : 'text-gray-600'

  // Бейджик типа урока
  const getLessonTypeBadge = () => {
    const types = {
      standard: { icon: Book, label: 'Стандартный', color: 'blue' },
      practical: { icon: Sparkles, label: 'Практика', color: 'purple' },
      intensive: { icon: Zap, label: 'Интенсив', color: 'orange' },
    }

    const type = types[lesson.type] || types.standard
    const Icon = type.icon

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
          darkMode
            ? `bg-${type.color}-900/50 text-${type.color}-300 border border-${type.color}-700`
            : `bg-${type.color}-100 text-${type.color}-700 border border-${type.color}-300`
        }`}
      >
=======
  // Word card specific toggles
  const toggleExample = () => {
    sounds.playClick()
    setShowExample(!showExample)
  }

  const toggleTranslation = () => {
    sounds.playClick()
    setShowTranslation(!showTranslation)
    if (!showTranslation) { // if we are about to show it
      setTranslationClicks(prev => prev + 1)
      setTranslationShownForCurrentCard(true)
    }
  }

  const addWord = (word) => {
    if (showFeedback) return;
    sounds.playClick();
    setUserWords(prev => [...prev, word]);
  }

  const removeWord = (index) => {
    if (showFeedback) return;
    sounds.playClick();
    setUserWords(prev => prev.filter((_, i) => i !== index));
  }

  const skipQuestion = () => {
    if (showFeedback) return
    sounds.playClick()
    handleAnswer(currentQuestionIndex, '___skip___')
    setIsCorrect(false)
    setShowFeedback(true)
    setUserWords([])
    sounds.playWrong()
  }

  const bgClass = darkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
  const textClass = darkMode ? 'text-white' : 'text-gray-800'
  const textSecondaryClass = darkMode ? 'text-gray-300' : 'text-gray-600'

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
>>>>>>> cf50603 (MWP Working)
        <Icon className="w-3 h-3" />
        {type.label}
      </span>
    )
  }

<<<<<<< HEAD
  // ТЕОРИЯ
  if (stage === 'theory') {
    return (
      <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl opacity-20 ${
              darkMode ? 'bg-blue-500' : 'bg-purple-300'
            }`}
          ></div>
          <div
            className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${
              darkMode ? 'bg-purple-500' : 'bg-blue-300'
            }`}
          ></div>
        </div>

        <div className="relative z-10 p-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                sounds.playClick()
                onClose()
              }}
              className={`${textClass} hover:underline transition`}
            >
              ← Назад к урокам
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-700'
              } hover:scale-110 transition-transform`}
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
=======
  if (stage === 'theory') {
    return (
        <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-blue-500' : 'bg-purple-300'}`}></div>
          <div className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-purple-500' : 'bg-blue-300'}`}></div>
        </div>
        <div className="relative z-10 p-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className={`flex items-center gap-2 ${textClass} hover:underline transition`}>
              <ArrowLeft className="w-4 h-4" /> Назад к урокам
            </button>
            <button onClick={toggleTheme} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-700'} hover:scale-110 transition-transform`}>
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          <div className={`${cardClass} rounded-2xl p-6 shadow-2xl border backdrop-blur-sm`}>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">{lesson.level} • Урок {lesson.number}</span>
>>>>>>> cf50603 (MWP Working)
                {getLessonTypeBadge()}
              </div>
              <h1 className={`text-2xl font-bold ${textClass} mt-1`}>{lesson.title}</h1>
            </div>
<<<<<<< HEAD

            <div className="mb-6">
              <h3 className={`text-lg font-semibold ${textClass} mb-2 flex items-center gap-2`}>
                📖 Теория
              </h3>
              <p className={`${textSecondaryClass} whitespace-pre-line leading-relaxed`}>{lesson.theory}</p>
            </div>

            {lesson.examples && (
              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${textClass} mb-3 flex items-center gap-2`}>
                  💬 Примеры
                </h3>
                <div className="space-y-2">
                  {lesson.examples.map((example, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl ${
                        darkMode
                          ? 'bg-blue-900/30 border border-blue-700'
                          : 'bg-blue-50 border border-blue-100'
                      }`}
                    >
                      <div className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                        {example.finnish}
                      </div>
=======
            <div className="mb-6">
              <h3 className={`text-lg font-semibold ${textClass} mb-2 flex items-center gap-2`}>📖 Теория</h3>
              <p className={`${textSecondaryClass} whitespace-pre-line leading-relaxed`}>{lesson.theory}</p>
            </div>
            {lesson.examples && lesson.examples.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${textClass} mb-3 flex items-center gap-2`}>💬 Примеры</h3>
                <div className="space-y-2">
                  {lesson.examples.map((example, index) => (
                    <div key={index} className={`p-4 rounded-xl ${darkMode ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-100'}`}>
                      <div className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>{example.finnish}</div>
>>>>>>> cf50603 (MWP Working)
                      <div className={`text-sm ${textSecondaryClass} mt-1`}>{example.russian}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
<<<<<<< HEAD

            <button
              onClick={goNext}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg"
            >
              {lesson.type === 'intensive' ? 'Начать тест' : 'Изучить слова'}
              {lesson.type === 'intensive' ? <Zap className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
=======
            {lesson.mini_dialogues && lesson.mini_dialogues.length > 0 && (
                <div className="mb-6">
                <h3 className={`text-lg font-semibold ${textClass} mb-3 flex items-center gap-2`}>
                  <MessageSquare className="w-5 h-5 text-purple-500"/> Мини-диалоги
                </h3>
                <div className="space-y-4">
                  {lesson.mini_dialogues.map((dialogue, index) => (
                    <div key={index} className={`p-4 rounded-xl ${darkMode ? 'bg-purple-900/30 border border-purple-700' : 'bg-purple-50 border border-purple-100'}`}>
                      <h4 className={`font-semibold mb-2 ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>{dialogue.title}</h4>
                      <div className="space-y-2">
                        {dialogue.lines.map((line, lineIndex) => (
                          <div key={lineIndex} className="flex gap-2">
                            <span className={`font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{line.speaker}:</span>
                            <span className={textSecondaryClass}>{line.line}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={goNext} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg">
              {lesson.words.length > 0 ? 'Изучить слова' : 'Начать тест'}
              {lesson.words.length > 0 ? <Sparkles className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
>>>>>>> cf50603 (MWP Working)
            </button>
          </div>
        </div>
      </div>
<<<<<<< HEAD
    )
  }

  // КАРТОЧКИ СЛОВ
  if (stage === 'words') {
    const word = lesson.words[currentWordIndex]
    const progress = ((currentWordIndex + 1) / lesson.words.length) * 100

    return (
      <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl opacity-20 ${
              darkMode ? 'bg-blue-500' : 'bg-purple-300'
            }`}
          ></div>
          <div
            className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${
              darkMode ? 'bg-purple-500' : 'bg-blue-300'
            }`}
          ></div>
        </div>

        <div className="relative z-10 p-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={goBack} className={`${textClass} hover:underline transition`}>
              ← Назад
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-700'
              } hover:scale-110 transition-transform`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

=======
    );
  }
  
  if (stage === 'words') {
    const word = lesson.words[currentWordIndex];
    const progress = ((currentWordIndex + 1) / lesson.words.length) * 100;

    return (
      <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
        <div className="relative z-10 p-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={goBack} className={`flex items-center gap-2 ${textClass} hover:underline transition`}>
              <ArrowLeft className="w-4 h-4" /> Назад
            </button>
            <button onClick={onClose} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-red-400' : 'bg-gray-100 text-red-600'} hover:scale-110 transition-transform`}>
              <X className="w-5 h-5" />
            </button>
          </div>
>>>>>>> cf50603 (MWP Working)
          <div className={`${cardClass} rounded-2xl p-6 shadow-2xl border`}>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-lg font-semibold ${textClass}`}>📝 Новые слова</h3>
<<<<<<< HEAD
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

            <div
              className={`rounded-3xl p-12 text-center mb-6 min-h-[350px] flex flex-col justify-center ${
                darkMode
                  ? 'bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-blue-700'
                  : 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200'
              }`}
            >
              <div className="text-7xl mb-8 animate-bounce">🇫🇮</div>
              <h2 className={`text-5xl font-bold mb-6 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                {word.finnish}
              </h2>
              <p className={`text-3xl ${textSecondaryClass} mb-8`}>{word.russian}</p>

              {/* НОВАЯ КНОПКА ОЗВУЧКИ */}
              <button
                onClick={() => handleSpeak(word.finnish)}
                disabled={isSpeaking}
                className={`
                  w-full py-4 rounded-xl font-semibold text-lg transition-all
                  ${isSpeaking
                    ? 'bg-gray-400 cursor-wait'
                    : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'}
                  text-white shadow-lg flex items-center justify-center gap-2
                `}
              >
                {isSpeaking ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Озвучивание...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-6 h-6" />
                    <span>Послушать произношение</span>
                  </>
                )}
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
      <div
        className={`min-h-screen ${bgClass} transition-colors duration-300 p-6 flex items-center justify-center`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl opacity-20 ${
              passed ? (darkMode ? 'bg-green-500' : 'bg-green-300') : darkMode ? 'bg-orange-500' : 'bg-orange-300'
            }`}
          ></div>
          <div
            className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${
              passed ? (darkMode ? 'bg-blue-500' : 'bg-blue-300') : darkMode ? 'bg-red-500' : 'bg-red-300'
            }`}
          ></div>
        </div>

        <div className="relative z-10 flex items-center justify-between mb-4 absolute top-6 right-6">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg ${
              darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-white text-gray-700'
            } hover:scale-110 transition-transform shadow-lg`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div
          className={`relative z-10 max-w-md w-full ${cardClass} rounded-2xl p-8 text-center shadow-2xl border`}
        >
          <div className={`text-6xl mb-4 animate-bounce`}>{passed ? '🎉' : '💪'}</div>

          <h2 className={`text-3xl font-bold ${textClass} mb-2`}>{passed ? 'Отлично!' : 'Неплохо!'}</h2>

          <p className={`${textSecondaryClass} mb-6`}>
            {passed
              ? 'Ты прошёл урок! Продолжай в том же духе.'
              : 'Рекомендуем повторить урок для лучшего результата.'}
          </p>

          <div
            className={`${
              darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-50 to-purple-50'
            } rounded-xl p-6 mb-6`}
          >
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
                className={`w-full ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                } ${textClass} font-semibold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95`}
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
        <div
          className={`absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl opacity-20 ${
            darkMode ? 'bg-purple-500' : 'bg-purple-300'
          }`}
        ></div>
        <div
          className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            darkMode ? 'bg-blue-500' : 'bg-blue-300'
          }`}
        ></div>
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
            className={`p-2 rounded-lg ${
              darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-700'
            } hover:scale-110 transition-transform`}
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
                      : darkMode
                      ? 'bg-gray-700'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            <h3 className={`text-xl font-semibold ${textClass} mb-6`}>{question.question}</h3>

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
=======
                <span className={`text-sm ${textSecondaryClass}`}>{currentWordIndex + 1} / {lesson.words.length}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className={`rounded-3xl p-8 text-center mb-6 min-h-[350px] flex flex-col justify-center items-center`}>
              <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>{word.finnish}</h2>
              {showTranslation && <p className={`text-2xl md:text-3xl ${textSecondaryClass}`}>{word.russian}</p>}
              {showExample && word.example_sentence && (
                <div className={`mt-6 pt-6 border-t-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'} w-full`}>
                  <div className="flex items-center justify-center gap-3">
                    <p className={`text-xl md:text-2xl font-medium ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>{word.example_sentence.finnish}</p>
                    <button onClick={() => speakWord(word.example_sentence.finnish)} className="p-2 bg-purple-500/20 text-purple-500 rounded-full hover:bg-purple-500/30 transition-all">
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  {showTranslation && <p className={`text-base md:text-lg ${textSecondaryClass} mt-2`}>{word.example_sentence.russian}</p>}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <button onClick={() => speakWord(word.finnish)} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg ${darkMode ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-800' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                <Volume2 className="w-5 h-5" />
              </button>
              <button onClick={toggleExample} disabled={!word.example_sentence} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg disabled:opacity-30 ${darkMode ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-800' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}>
                <Brain className="w-5 h-5" /> Пример
              </button>
              <button onClick={toggleTranslation} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg ${darkMode ? 'bg-green-900/50 text-green-300 hover:bg-green-800' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                <Globe className="w-5 h-5" /> Перевод
              </button>
              <button onClick={goNext} className="md:col-start-4 flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                 {currentWordIndex === lesson.words.length - 1 ? 'К тесту' : 'Далее'} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / shuffledQuestions.length) * 100)
    const passed = percentage >= 70
    return (
      <div className={`min-h-screen ${bgClass} p-6 flex items-center justify-center`}>
        <div className={`relative z-10 max-w-md w-full ${cardClass} rounded-2xl p-8 text-center shadow-2xl`}>
          <div className={`text-6xl mb-4`}>{passed ? '🎉' : '💪'}</div>
          <h2 className={`text-3xl font-bold ${textClass} mb-2`}>{passed ? 'Отлично!' : 'Неплохо!'}</h2>
          <p className={`${textSecondaryClass} mb-6`}>{passed ? 'Ты прошёл урок!' : 'Попробуй еще раз.'}</p>
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl p-6 mb-6`}>
            <div className={`text-5xl font-bold mb-2 ${passed ? 'text-green-500' : 'text-orange-500'}`}>{percentage}%</div>
            <div className={textSecondaryClass}>{score} из {shuffledQuestions.length} правильных ответов</div>
          </div>
          <div className="space-y-3">
            <button onClick={handleFinish} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-xl">Завершить</button>
            <button onClick={() => {
                setStage(getInitialStage());
                setCurrentQuestionIndex(0);
                setAnswers({});
                setShowResults(false);
                setScore(0);
            }} className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-600'} ${textClass} font-semibold py-4 rounded-xl`}>
              Пройти заново
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz stage JSX
  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      <div className="relative z-10 p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={goBack} className={`flex items-center gap-2 ${textClass} hover:underline`}><ArrowLeft className="w-4 h-4" /> Назад</button>
          <span className={`font-semibold ${textClass}`}>Вопрос {currentQuestionIndex + 1} из {shuffledQuestions.length}</span>
          <button onClick={onClose} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-red-600'} `}><X className="w-5 h-5" /></button>
        </div>
        <div className={`${cardClass} rounded-2xl p-6 shadow-2xl`}>
          <div className="mb-6">
            <div className="flex gap-1 mb-6">
              {shuffledQuestions.map((_, index) => (<div key={index} className={`flex-1 h-2 rounded-full ${index < currentQuestionIndex ? 'bg-green-500' : index === currentQuestionIndex ? 'bg-blue-500' : 'bg-gray-700'}`} />))}
            </div>
            <h3 className={`text-xl font-semibold ${textClass} mb-6`}>{question.question}</h3>
          </div>
          
          {(question.isBroken) && (
            <div className="text-center text-red-500 p-4">
              (Ошибка генерации этого вопроса. Пожалуйста, пропустите его)
            </div>
          )}

          {['choice', 'fill-in-choice'].includes(question.type) && !question.isBroken && (
            <>
              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const isSelected = answers[currentQuestionIndex] === option
                  const isCorrectOption = index === question.correct
                  const showCorrect = showFeedback && isCorrectOption
                  const showWrong = showFeedback && isSelected && !isCorrectOption
                  return (
                    <button key={index} onClick={() => handleAnswer(currentQuestionIndex, option)} disabled={showFeedback} className={`w-full text-left p-4 rounded-xl border-2 font-medium ${showCorrect ? 'border-green-500' : showWrong ? 'border-red-500' : isSelected ? 'border-blue-500' : 'border-gray-600 hover:border-blue-400'}`}>
>>>>>>> cf50603 (MWP Working)
                      <span>{option}</span>
                      {showCorrect && <CheckCircle className="w-6 h-6 text-green-500" />}
                      {showWrong && <XCircle className="w-6 h-6 text-red-500" />}
                    </button>
                  )
                })}
              </div>
<<<<<<< HEAD
            )}

            {question.type === 'translate' && (
              <div>
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

                {showFeedback && !isCorrect && (
                  <div className={`mt-2 text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    Правильный ответ: <strong>{question.correct}</strong>
                  </div>
                )}

                {!showFeedback && (
                  <div className="mt-4 flex flex-wrap gap-2">
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

                    <button
                      onClick={() => {
                        sounds.playClick()
                        handleAnswer(currentQuestionIndex, '___skip___')
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
            <div
              className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
                isCorrect
                  ? darkMode
                    ? 'bg-green-900/30 border-2 border-green-500'
                    : 'bg-green-50 border-2 border-green-500'
                  : darkMode
                  ? 'bg-red-900/30 border-2 border-red-500'
                  : 'bg-red-50 border-2 border-red-500'
              }`}
            >
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
=======
              {showFeedback && !isCorrect && (
                <div className={`mt-4 p-4 rounded-xl ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                  <div className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-700'} mb-1`}>Правильный ответ:</div>
                  <div className={`text-xl font-bold ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                    {question.options[question.correct]}
                  </div>
                </div>
              )}
            </>
          )}

          {question.type === 'translate' && !question.isBroken && (
            <div>
              <div className={`w-full p-4 border-2 rounded-xl mb-4 min-h-[6rem] flex flex-wrap items-center gap-2 border-gray-600`}>
                {userWords.map((word, index) => (<button key={index} onClick={() => removeWord(index)} className={`p-2 rounded-lg font-medium bg-blue-800 text-white`}>{word}</button>))}
                {userWords.length === 0 && !showFeedback && <span className={textSecondaryClass}>Соберите ответ...</span>}
              </div>
              {!showFeedback && wordOptions.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {wordOptions.map((word, index) => (
                    <button key={index} onClick={() => addWord(word)} className={`p-3 rounded-lg font-medium bg-gray-700 hover:bg-gray-600`}>{word}</button>
                  ))}
                </div>
              )}
              {!showFeedback && (
                <div className="mt-4 flex justify-center gap-4">
                  <button onClick={skipQuestion} className={`flex items-center justify-center gap-2 p-3 rounded-lg bg-orange-900/50 text-orange-300 hover:bg-orange-800`}>
                    <SkipForward className="w-4 h-4" /> Пропустить
                  </button>
                </div>
              )}
              {showFeedback && !isCorrect && (
                <div className={`mt-4 p-4 rounded-xl bg-green-900/30`}>
                  <div className={`text-sm text-green-400 mb-1`}>Правильный ответ:</div>
                  <div className={`text-xl font-bold text-green-300`}>
                    {question.correct}
                  </div>
                </div>
>>>>>>> cf50603 (MWP Working)
              )}
            </div>
          )}

<<<<<<< HEAD
          <button
            onClick={goNext}
            disabled={!showFeedback && (userAnswer === undefined || userAnswer === '' || userAnswer === '___skip___')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
          >
            {showFeedback
              ? currentQuestionIndex === lesson.questions.length - 1
                ? 'Посмотреть результаты'
                : 'Продолжить'
              : 'Проверить'}
=======
          {showFeedback && (
              <div className={`mt-6 mb-4 p-4 rounded-xl flex items-center gap-3 ${isCorrect ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
              {isCorrect ? (<><CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" /><div><div className={`font-bold text-green-400`}>Правильно! 🎉</div></div></>) : (<><XCircle className="w-8 h-8 text-red-500 flex-shrink-0" /><div><div className={`font-bold text-red-400`}>Неправильно</div></div></>)}
            </div>
          )}
          
          <button
            onClick={goNext}
            disabled={showFeedback ? false : (question.isBroken ? true : (question.type === 'translate' ? userWords.length === 0 : answers[currentQuestionIndex] === undefined))}
            className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-xl disabled:opacity-50"
          >
            {question.isBroken ? 'Пропустить' : (showFeedback ? (currentQuestionIndex === shuffledQuestions.length - 1 ? 'Результаты' : 'Далее') : 'Проверить')}
>>>>>>> cf50603 (MWP Working)
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> cf50603 (MWP Working)
