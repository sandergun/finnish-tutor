'use client'

import { useState, useEffect, useMemo } from 'react'
import { Volume2, ArrowRight, ArrowLeft, Moon, Sun, CheckCircle, XCircle, Sparkles, Zap, Book, X, HelpCircle, RotateCcw, SkipForward, Eye, MessageSquare, GraduationCap, Brain, Globe, Lightbulb } from 'lucide-react'
import { speak } from '@/lib/googleTTS'
import { sounds } from '@/lib/sounds'
import WordStudyBlock from './WordStudyBlock'
import MiniTestBlock from './MiniTestBlock'
import MiniDialogueBlock from './MiniDialogueBlock'
import ListeningTaskBlock from './ListeningTaskBlock'
import ExercisesBlock from './ExercisesBlock'
import FinalExamBlock from './FinalExamBlock'
// removed CycleSummaryBlock

// Helper function to shuffle an array
const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
}


const QUESTIONS_PER_CYCLE = 3;
const FINAL_QUIZ_QUESTIONS = 2;

// Inline component for Listening Mode - handles questions without cycles
function ListeningModePlayer({ questions, onNext }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const currentQuestion = questions[currentIndex];

  const correctAnswer = useMemo(() => {
    if (!currentQuestion) return null;
    if (typeof currentQuestion.correct === 'number') {
      return currentQuestion.options?.[currentQuestion.correct] || null;
    }
    return currentQuestion.correct || null;
  }, [currentQuestion]);

  const handlePlayAudio = async () => {
    if (!currentQuestion) return;

    let textToSpeak = currentQuestion.text_to_speak;
    if (!textToSpeak && typeof currentQuestion.correct === 'string') {
      textToSpeak = currentQuestion.correct;
    } else if (!textToSpeak && typeof currentQuestion.correct === 'number' && currentQuestion.options) {
      textToSpeak = currentQuestion.options[currentQuestion.correct];
    }

    if (textToSpeak) {
      try {
        await speak(textToSpeak, 'fi-FI');
      } catch (error) {
        console.error('TTS error:', error);
      }
    }
  };

  useEffect(() => {
    if (currentQuestion) {
      handlePlayAudio();
    }
  }, [currentIndex]);

  const handleCheck = () => {
    if (!selectedAnswer || !correctAnswer) return;

    if (selectedAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
      setFeedback('correct');
      sounds.playCorrect();
    } else {
      setFeedback('incorrect');
      sounds.playWrong();
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setSelectedAnswer(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onNext();
    }
  };

  if (!currentQuestion || !currentQuestion.options || currentQuestion.options.length === 0) {
    return (
      <div className="text-center">
        <p>Нет вопросов для аудирования.</p>
        <button onClick={onNext} className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-xl">
          Продолжить
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 text-sm text-gray-400 text-center">
        Вопрос {currentIndex + 1} из {questions.length}
      </div>
      <h2 className="text-2xl font-bold mb-4 text-center">Что вы слышите?</h2>
      <div className="flex justify-center my-6">
        <button onClick={handlePlayAudio} className="p-6 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors">
          <Volume2 size={48} />
        </button>
      </div>

      <div className="space-y-2">
        {currentQuestion.options.map((option, index) => {
          let buttonClass = 'bg-gray-700 hover:bg-gray-600';
          if (feedback && option === correctAnswer) {
            buttonClass = 'bg-green-500';
          } else if (feedback && option === selectedAnswer && selectedAnswer !== correctAnswer) {
            buttonClass = 'bg-red-500';
          } else if (selectedAnswer === option) {
            buttonClass = 'bg-blue-600';
          }

          return (
            <button
              key={index}
              onClick={() => !feedback && setSelectedAnswer(option)}
              disabled={!!feedback}
              className={`w-full p-4 rounded-lg text-left transition-colors ${buttonClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {feedback === 'incorrect' && (
        <div className="mt-4 p-4 rounded-lg bg-red-900 text-white">
          <p>Неправильно!</p>
          <p>Правильный ответ: {correctAnswer}</p>
        </div>
      )}

      {feedback === 'correct' && (
        <div className="mt-4 p-4 rounded-lg bg-green-900 text-white flex items-center">
          <CheckCircle className="mr-2" />
          <p>Правильно!</p>
        </div>
      )}

      <div className="mt-6">
        {!feedback ? (
          <button onClick={handleCheck} disabled={!selectedAnswer} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-xl disabled:opacity-50">
            Проверить
          </button>
        ) : (
          <button onClick={handleNext} className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold py-4 rounded-xl">
            {currentIndex < questions.length - 1 ? 'Следующий вопрос' : 'Завершить'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function LessonPlayer({ lesson: rawLesson, onComplete, onClose }) {
  const [currentBlock, setCurrentBlock] = useState('word-study');
  const [currentCycleIndex, setCurrentCycleIndex] = useState(0);

  // Normalize lesson data (AI lessons store data in lesson_data, or already normalized by lib/lessonsData.js)
  const data = useMemo(() => {
    return {
      ...rawLesson,
      ...(rawLesson?.lesson_data || {})
    };
  }, [rawLesson]);

  // Debug: log normalized data to verify fact presence
  useEffect(() => {
    console.log('📚 LessonPlayer data initialized:', {
      title: data.title,
      hasTheory: !!data.theory,
      hasFact: !!data.finnish_fact,
      factValue: data.finnish_fact?.substring(0, 30) + '...'
    });
  }, [data]);

  // 1. Dynamic Question Generation
  // Ensure we have "choice", "assemble" (translate), "fill-in" questions even if lesson data is sparse.
  const generatedQuestions = useMemo(() => {
    const gen = [];
    const lessonWords = data?.words || [];

    lessonWords.forEach((word) => {
      // 1. Choice ("How to say X?")
      const distractors = shuffleArray(lessonWords.filter(w => w.finnish !== word.finnish).map(w => w.finnish)).slice(0, 3);
      gen.push({
        type: 'choice',
        question: `Как сказать по-фински "${word.russian}"?`,
        correct: word.finnish,
        options: shuffleArray([word.finnish, ...distractors])
      });

      // 2. Assemble / Translate ("Assemble the phrase") - ONLY if example sentence exists
      if (word.example_sentence && word.example_sentence.finnish) {
        gen.push({
          type: 'translate', // mapped to ExercisesBlock (Assemble)
          question: `Соберите фразу: "${word.example_sentence.russian}"`,
          correct: word.example_sentence.finnish,
          options: [], // Options generated dynamically in block or here? 
          // ExercisesBlock expects 'correct' string and 'allWords' to prompt assemble.
        });

        // 3. Fill-in ("Insert missing word")
        // Create a fill-in by removing the current word from the example sentence
        const sentence = word.example_sentence.finnish;
        const wordForm = word.finnish.toLowerCase(); // simplified matching

        if (sentence.toLowerCase().includes(wordForm)) {
          const part1 = sentence.replace(new RegExp(wordForm, 'gi'), '_____');
          const fillInDistractors = shuffleArray(lessonWords.filter(w => w.finnish !== word.finnish).map(w => w.finnish)).slice(0, 3);
          gen.push({
            type: 'fill-in-choice', // or 'fill-in'
            question: `Вставьте пропущенное слово:\n"${part1}"\n(${word.example_sentence.russian})`,
            translation: word.example_sentence.russian, // Added explicit translation
            correct: word.finnish, // The word form users choose
            options: shuffleArray([word.finnish, ...fillInDistractors])
          });
        }
      }
    });
    return gen;
  }, [data]);

  const { words, questions, dialogues } = useMemo(() => {
    const lessonWords = data?.words || [];

    // Combine static questions with generated ones
    const staticQuestions = (data?.questions || [])
      .filter(q => q.type !== 'audio-choice')
      .map(q => {
        let correctString = null;
        if (typeof q.correct === 'number') {
          if (q.options && q.options[q.correct]) {
            correctString = q.options[q.correct];
          }
        } else if (typeof q.correct === 'string') {
          correctString = q.correct;
        }

        if (!correctString) return q; // Could not resolve correct

        const options = q.options ? [...q.options] : [];
        // If correctString is not in options, add it (shouldn't happen usually)
        if (!options.includes(correctString)) options.push(correctString);

        return { ...q, options: shuffleArray(options), correct: correctString };
      });

    // Deduplicate questions by correct answer to avoid "Как по-фински X" and "Как сказать по-фински X"
    const seenCorrects = new Set();
    const allQuestions = [...staticQuestions, ...generatedQuestions].filter(q => {
      const key = (q.correct || '').toLowerCase().trim();
      if (!key) return true; // keep questions without correct answer (edge case)
      if (seenCorrects.has(key)) return false;
      seenCorrects.add(key);
      return true;
    });
    const lessonDialogues = rawLesson?.mini_dialogues || [];
    return { words: lessonWords, questions: allQuestions, dialogues: lessonDialogues };
  }, [rawLesson, generatedQuestions]);

  // Unified flow: 4 words per cycle (or all if random mode)
  const wordChunks = useMemo(() => {
    const perCycle = rawLesson.isRandomMode ? 50 : 4;
    const chunks = [];
    for (let i = 0; i < words.length; i += perCycle) {
      chunks.push(words.slice(i, i + perCycle));
    }
    return chunks;
  }, [words, rawLesson.isRandomMode]);

  // 1. Logic for Cycles with Cumulative Review
  // Block N: 4 new words + 1 random from Block N-1 (if exists)

  const cycles = useMemo(() => {
    return wordChunks.map((chunk, index) => {
      let cycleWords = [...chunk];

      // Add review word from previous block if available
      if (index > 0) {
        const prevChunk = wordChunks[index - 1];
        if (prevChunk && prevChunk.length > 0) {
          const randomPrevWord = prevChunk[Math.floor(Math.random() * prevChunk.length)];
          // Add as a "review" word - maybe mark it? 
          // For WordStudyBlock, it just renders words. If we want to show it's review, we might need a flag.
          // But requirement says just "Study 5 words".
          // Ensure uniqueness (though mostly safe if chunks are distinct)
          if (!cycleWords.find(w => w.finnish === randomPrevWord.finnish)) {
            cycleWords.push(randomPrevWord);
          }
        }
      }

      // Find questions relevant to these words (including the review word)
      const chunkWordSet = new Set(cycleWords.map(w => (w.finnish || '').toLowerCase().trim()));

      const chunkQuestions = questions.filter(q => {
        // Strict filter: Question must relate to one of the words in the chunk
        if (q.type === 'audio-choice' || q.type === 'listening-task') {
          return false;
        }

        let keys = [];
        let correctStr = typeof q.correct === 'string' ? q.correct :
          (typeof q.correct === 'number' && q.options ? q.options[q.correct] : null);

        if (correctStr) keys.push(correctStr);
        // We can also check options, but checking correct answer is safest for "Mini Test" context.
        // Actually, if a question has "Distractor" from this chunk, it might be confusing?
        // Let's stick to checking if the CORRECT answer is in the chunk.

        // Check if correct answer matches a word in the chunk
        return keys.some(k => chunkWordSet.has((k || '').toLowerCase().trim()));
      });

      return {
        words: cycleWords,
        questions: chunkQuestions, // Pass only RELEVANT questions
        dialogues: dialogues[index] ? [dialogues[index]] : [],
      };
    });
  }, [wordChunks, questions, dialogues]);

  // 2. Final Exam Data Generation
  // "After passing all blocks comes a big check... Result shown only after this."
  // Types: Fill-in, Dialogue Fill (reuse Dialogue choice), Translation (Choice), Situation (Dialogue), Assemble (Translate)

  const finalExamTasks = useMemo(() => {
    if (!words || words.length === 0) return [];

    const tasks = [];

    // 1. Fill-in ('fill-in-choice' or 'fill-in')
    const fillInQs = questions.filter(q => ['fill-in', 'fill-in-choice'].includes(q.type));
    if (fillInQs.length > 0) {
      tasks.push({ type: 'question', data: { ...fillInQs[Math.floor(Math.random() * fillInQs.length)], allWordsRef: words } });
    }

    // 2. Dialogue Fill / Situation (Reusable MiniDialogue)
    // "Insert needed replica" / "Situation ordering coffee" -> These are essentially dialogues.
    // Let's pick 1 or 2 dialogues from the lesson.
    // If we have dialogues, pick a random one that IS NOT the one from the very last cycle (to ensure review).
    // Or just pick any.
    if (dialogues.length > 0) {
      const dialog = dialogues[Math.floor(Math.random() * dialogues.length)];
      tasks.push({ type: 'dialogue', data: dialog });
    }

    // 3. Translation ("How is X...") -> Choice
    const choiceQs = questions.filter(q => q.type === 'choice');
    if (choiceQs.length > 0) {
      tasks.push({ type: 'question', data: choiceQs[Math.floor(Math.random() * choiceQs.length)] });
    }

    // 4. Assemble ("Collect phrase") -> Translate
    const assembleQs = questions.filter(q => q.type === 'translate');
    if (assembleQs.length > 0) {
      tasks.push({ type: 'question', data: { ...assembleQs[Math.floor(Math.random() * assembleQs.length)], allWordsRef: words } });
    }

    // Shuffle tasks
    return shuffleArray(tasks);
  }, [questions, dialogues, words]);


  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [userWords, setUserWords] = useState([]);
  const [wordOptions, setWordOptions] = useState([]);

  const [showExample, setShowExample] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const [translationClicks, setTranslationClicks] = useState(0);
  const [cardsWithoutTranslation, setCardsWithoutTranslation] = useState(0);
  const [translationShownForCurrentCard, setTranslationShownForCurrentCard] = useState(false);
  const [randomModeWordIndex, setRandomModeWordIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [lessonResult, setLessonResult] = useState(null);

  // Score tracking - blocks report their results via onResult callback
  const [scoreStats, setScoreStats] = useState({ correct: 0, total: 0 });

  // Stable mini-test questions stored in state
  const [miniTestQuestions, setMiniTestQuestions] = useState([]);
  const [lastShuffledCycleIndex, setLastShuffledCycleIndex] = useState(-1);

  const handleResult = (isCorrect) => {
    if (isCorrect === 'skip') return; // Don't count skipped questions in stats
    setScoreStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const handleRestart = () => {
    if (typeof window !== 'undefined' && !window.confirm('Вы уверены, что хотите начать урок заново? Весь прогресс будет сброшен.')) return;

    localStorage.removeItem('lessonProgress');
    setCurrentCycleIndex(0);
    setCurrentBlock('word-study');
    setAnswers({});
    setScore(0);
    setUserWords([]);
    setLessonResult(null);
    setShowResults(false);
    setScoreStats({ correct: 0, total: 0 });

    // Also reset random/internal states if needed
    setRandomModeWordIndex(0);
    setTranslationClicks(0);
    setShowSummary(false);
    setLastShuffledCycleIndex(-1); // Reset to trigger new shuffle
  };


  useEffect(() => {
    if (mounted) {
      const progress = {
        lessonId: data.id,
        cycleIndex: currentCycleIndex,
        block: currentBlock,
      };
      localStorage.setItem('lessonProgress', JSON.stringify(progress));
    }
  }, [currentCycleIndex, currentBlock, data.id, mounted]);

  const userInput = useMemo(() => userWords.join(' '), [userWords]);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme === 'dark');

    const savedProgress = localStorage.getItem('lessonProgress');
    if (savedProgress) {
      const { lessonId, cycleIndex, block } = JSON.parse(savedProgress);
      if (lessonId === data.id) {
        setCurrentCycleIndex(cycleIndex);
        setCurrentBlock(block);
        return; // Exit early if progress was restored
      }
    }

    // Fresh start - determine initial block
    if (data.isListeningMode) {
      setCurrentBlock('listening-task');
      return;
    }

    // If lesson has theory, start with theory (regardless of cycles being ready)
    if (data.theory) {
      setCurrentBlock('theory');
    } else {
      setCurrentBlock('word-study');
    }
  }, [data.id, data.theory, data.isListeningMode]);

  // Get current cycle, word, and question based on indices
  const currentCycle = useMemo(() => cycles[currentCycleIndex], [cycles, currentCycleIndex]);
  const question = useMemo(() => currentCycle?.questions[currentQuestionIndex], [currentCycle, currentQuestionIndex]);

  // Shuffle mini-test questions when cycle changes
  useEffect(() => {
    // Only reshuffle when cycle index actually changes
    if (currentCycleIndex === lastShuffledCycleIndex) return;
    if (!currentCycle || !currentCycle.words) {
      setMiniTestQuestions([]);
      return;
    }

    const cycleWords = new Set(currentCycle.words.map(w => w.finnish));

    const relevantQuestions = currentCycle.questions.filter(q => {
      if (!q.options || q.options.length === 0) return false;

      let correctAnswerWord;
      if (typeof q.correct === 'number') {
        if (q.correct >= q.options.length) return false;
        correctAnswerWord = q.options[q.correct];
      } else {
        correctAnswerWord = q.correct;
      }

      if (!correctAnswerWord) return false;
      return cycleWords.has(correctAnswerWord);
    });

    // Shuffle once when cycle changes
    const shuffled = [...relevantQuestions]
      .filter(q => q.type !== 'audio-choice' && q.type !== 'translate')
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);

    setMiniTestQuestions(shuffled);
    setLastShuffledCycleIndex(currentCycleIndex);
  }, [currentCycle, currentCycleIndex, lastShuffledCycleIndex]);

  const blockOrder = useMemo(() => {
    if (currentBlock === 'final-exam') return ['final-exam'];
    if (!currentCycle) return [];

    // Progressive Structure:
    // First cycle (Index 0): Theory -> Study -> Test
    // Block 2 (Index 1): Study -> Test -> Dialogue (Simple)
    // Block 3+ (Index 2+): Study -> Test -> Dialogue -> Practice

    const order = [];

    // Add theory block only for the first cycle and if lesson has theory
    if (currentCycleIndex === 0 && data.theory) {
      order.push('theory');
    }

    order.push('word-study', 'mini-test');

    if (currentCycleIndex >= 1) {
      // Add Dialogue
      if (currentCycle.dialogues && currentCycle.dialogues.length > 0) {
        order.push('mini-dialogue');
      }
    }

    if (currentCycleIndex >= 2) {
      // Add Practice
      if (currentCycle.questions.some(q => ['translate', 'fill-in', 'fill-in-choice'].includes(q.type))) {
        order.push('exercises');
      }
    }

    return order;
  }, [currentCycle, currentCycleIndex, currentBlock, rawLesson.theory]);

  const currentBlockIndex = blockOrder.indexOf(currentBlock);

  const blockTypeNames = {
    'theory': 'Теория',
    'word-study': 'Изучение слов',
    'mini-test': 'Мини-тест',
    'mini-dialogue': 'Мини-диалог',
    'exercises': 'Практика',
    'final-exam': 'Финальный экзамен'
  };
  const blockName = blockTypeNames[currentBlock];



  useEffect(() => {

    if (question?.type === 'translate') {

      const correctWords = (question.correct || '').split(' ').filter(Boolean);



      if (correctWords.length === 0) {

        setWordOptions([]);

        return;

      }



      const distractorPool = [

        ...cycles.flatMap(c => c.words).map(w => w.finnish).filter(w => !correctWords.includes(w)),

        'ja', 'on', 'ei', 'mutta', 'myös', 'sinä', 'minä', 'hän'

      ];

      const shuffledPool = shuffleArray([...new Set(distractorPool)]);

      const numDistractors = Math.min(Math.max(4, correctWords.length), 6);

      const distractors = shuffledPool.slice(0, numDistractors);

      setWordOptions(shuffleArray([...correctWords, ...distractors]));

      setUserWords([]);

    }

  }, [currentQuestionIndex, question, cycles]);



  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
    sounds.playClick()
  }

  const speakWord = async (text) => {
    sounds.playClick()
    try {
      await speak(text, 'fi-FI')
    } catch (error) {
      console.error('TTS error:', error)
    }
  }

  const handleAnswer = (key, answer) => {
    if (showFeedback) return
    sounds.playClick()
    setAnswers({ ...answers, [key]: answer })
  }

  const triggerLessonEnd = () => {
    const totalWords = cycles.reduce((acc, c) => acc + c.words.length, 0);

    // Use scoreStats from blocks - this is the actual tracked data
    const { correct: correctCount, total: totalAnswered } = scoreStats;

    // Fall back to question count if no answers tracked
    const effectiveTotal = totalAnswered > 0 ? totalAnswered : 1;

    const finalStats = {
      lessonId: rawLesson.id,
      score: effectiveTotal > 0 ? Math.round((correctCount / effectiveTotal) * 100) : 100,
      correctAnswers: correctCount,
      totalQuestions: totalAnswered,
      newWords: totalWords,
      translationClicks,
      cardsWithoutTranslation
    };
    setLessonResult(finalStats);
    setShowSummary(true);
    if (finalStats.score >= 70) sounds.playSuccess();
    else sounds.playFailure();
  };

  const handleFinish = () => {
    sounds.playClick()
    localStorage.removeItem('lessonProgress'); // Clear saved progress on finish
    if (lessonResult) {
      onComplete(lessonResult)
    } else {
      // Fallback
      onComplete({
        lessonId: rawLesson.id,
        score: 100,
        correctAnswers: 0,
        totalQuestions: 0,
        newWords: 0,
        translationClicks,
        cardsWithoutTranslation
      })
    }
  }

  const resetWordCard = () => {
    setShowExample(false)
    setShowTranslation(false)
    setTranslationShownForCurrentCard(false)
  }

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
    handleAnswer(`${currentCycleIndex}_${currentQuestionIndex}`, '___skip___')
    setIsCorrect(false)
    setShowFeedback(true)
    setUserWords([])
    sounds.playWrong()
  }

  const bgClass = darkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
  const textClass = darkMode ? 'text-white' : 'text-gray-800'
  const textSecondaryClass = darkMode ? 'text-gray-300' : 'text-gray-600'

  const handleNextBlock = () => {
    if (rawLesson.isRandomMode || rawLesson.isListeningMode) {
      triggerLessonEnd();
      return;
    }

    // Check if we are in Final Exam
    if (currentBlock === 'final-exam') {
      triggerLessonEnd();
      return;
    }

    const nextBlockIndex = currentBlockIndex + 1;
    if (nextBlockIndex < blockOrder.length) {
      setCurrentBlock(blockOrder[nextBlockIndex]);
    } else {
      // End of cycle
      if (currentCycleIndex < cycles.length - 1) {
        setCurrentCycleIndex(currentCycleIndex + 1);
        // Force reset to first block of NEXT cycle
        // Note: blockOrder depends on currentCycleIndex, so we need to wait for render or just predict.
        // But useEffect handles reset? No, relying on state update.
        // We set index + 1. Component re-renders. blockOrder recalculates for index+1.
        // We need to set currentBlock to the first block of that new order.
        // The first block is ALWAYS 'word-study'.
        setCurrentBlock('word-study');
      } else {
        // End of ALL cycles -> Final Exam
        setCurrentBlock('final-exam');
      }
    }
  }

  const handlePrevBlock = () => {
    const prevBlockIndex = currentBlockIndex - 1;
    if (prevBlockIndex >= 0) {
      setCurrentBlock(blockOrder[prevBlockIndex]);
    } else {
      // Go to previous cycle
      if (currentCycleIndex > 0) {
        setCurrentCycleIndex(currentCycleIndex - 1);
        // We need to set the block to the LAST block of the previous cycle.
        // However, blockOrder is derived from currentCycleIndex. 
        // We can't know the last block of the previous cycle easily without render.
        // But we observe a pattern:
        // Cycle 0: theory (maybe), word-study, mini-test
        // Cycle >=1: word-study, mini-test, [mini-dialogue], [exercises]

        // Strategy: Set a temporary flag or just default to 'word-study' (start of prev cycle)?
        // User probably wants to go back to the *end* of the previous cycle.
        // But going to start of previous cycle is safer/easier.
        // Let's try to determine the last block type based on data.

        // Actually, let's just go to 'mini-test' or 'exercises' if available?
        // Simplest valid navigation: Go to 'word-study' of previous cycle.
        // This is less disorienting than jumping to the end of a previous cycle.
        setCurrentBlock('word-study');
      } else {
        console.log('Already at the start of the lesson');
      }
    }
  }

  const renderCurrentBlock = () => {
    if (currentBlock === 'final-exam') {
      return <FinalExamBlock tasks={finalExamTasks} onNext={handleNextBlock} onResult={handleResult} isIntensiveMode={rawLesson.id.startsWith('intensive-')} />
    }

    // Special handling for Listening Mode - no cycles, just questions from lesson
    if (data.isListeningMode) {
      const listeningQuestions = data.questions || [];
      return <ListeningModePlayer questions={listeningQuestions} onNext={handleNextBlock} />;
    }

    if (!currentCycle) {
      return <div>Загрузка...</div>;
    }
    const isIntensiveMode = data.id.startsWith('intensive-');

    switch (currentBlock) {
      case 'theory':
        return (
          <div className="flex flex-col h-full">
            <div className="mb-4 text-center">
              <span className="text-sm font-medium text-purple-500 uppercase tracking-widest">📚 Теория урока</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {/* Separate Finnish Fact Block */}
              {data.finnish_fact && (
                <div className={`mb-6 p-4 rounded-xl border flex gap-4 items-start ${darkMode ? 'bg-blue-900/20 border-blue-800/50' : 'bg-blue-50 border-blue-100'}`}>
                  <div className={`p-2 rounded-lg flex-shrink-0 ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="space-y-1">
                    <p className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Знаете ли вы?</p>
                    <p className={`text-sm leading-relaxed italic ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {data.finnish_fact}
                    </p>
                  </div>
                </div>
              )}

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {data.theory}
                </p>
              </div>

              {/* Show first mini-dialogue as example if available */}
              {data.mini_dialogues && data.mini_dialogues[0] && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3">
                    💬 Пример диалога по теме:
                  </p>
                  <div className="space-y-2">
                    {data.mini_dialogues[0].lines?.slice(0, 4).map((line, idx) => (
                      <div key={idx} className={`flex ${idx % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] p-3 rounded-xl ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-blue-100 dark:bg-blue-900/40'}`}>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{line.line}</p>
                            <button onClick={() => speakWord(line.line)} className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full flex-shrink-0">
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                          {line.translation && <p className="text-xs text-gray-500 mt-1">{line.translation}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleNextBlock}
              className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              Начать изучение слов
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        );
      case 'word-study':
        if (data.isRandomMode) {
          return <WordStudyBlock
            words={currentCycle.words}
            onNext={handleNextBlock}
            isIntensiveMode={isIntensiveMode}
            onWordChange={setRandomModeWordIndex}
          />;
        }
        // Filter out review words (words that were added from previous chunks)
        // Review words are the ones that are NOT in the original chunk for this cycle.
        // But we computed `currentCycle.words` which includes them.
        // We can identify them if we know which ones are new.
        // Or simpler: pass `rawLesson` words to check against? 
        // Actually, `currentCycle.words` has 5 words (4 new + 1 old).
        // We assume the first 4 are new (based on how we constructed it: `[...chunk, randomPrevWord]`).
        // So just take the first 4? `words.slice(0, 4)`?
        // Yes, `slice(0, 4)` should work if we stick to WORDS_PER_CYCLE constant (which is 4).
        const studyWords = (currentCycle.words || []).slice(0, 4);

        return <WordStudyBlock words={studyWords} onNext={handleNextBlock} onBack={handlePrevBlock} isIntensiveMode={isIntensiveMode} />;
      case 'mini-test':
        // Use memoized miniTestQuestions instead of computing on every render
        return <MiniTestBlock questions={miniTestQuestions} onNext={handleNextBlock} onBack={handlePrevBlock} onResult={handleResult} isIntensiveMode={isIntensiveMode} />;
      case 'mini-dialogue':
        return <MiniDialogueBlock dialogue={currentCycle.dialogues[0]} onNext={handleNextBlock} onBack={handlePrevBlock} onResult={handleResult} isIntensiveMode={isIntensiveMode} />;
      case 'listening-task':
        const listeningQuestion = currentCycle.questions.find(q => q.type === 'audio-choice');
        return <ListeningTaskBlock question={listeningQuestion} onNext={handleNextBlock} onBack={handlePrevBlock} isIntensiveMode={isIntensiveMode} />;
      case 'exercises':
        const exerciseQuestion = currentCycle.questions.find(q => ['translate', 'fill-in', 'fill-in-choice'].includes(q.type));
        return <ExercisesBlock question={exerciseQuestion} allWords={words} onNext={handleNextBlock} onBack={handlePrevBlock} onResult={handleResult} isIntensiveMode={isIntensiveMode} />;
      default:
        return null; // Cycle summary removed
    }
  }

  const isSpecialMode = rawLesson.isRandomMode || rawLesson.isListeningMode;

  if (showSummary) {
    // For random mode, show simpler completion screen
    if (rawLesson.isRandomMode) {
      return (
        <div className={`min-h-screen ${bgClass} transition-colors duration-300 flex items-center justify-center p-4`}>
          <div className="relative z-10 w-full max-w-2xl">
            <div className={`${cardClass} rounded-2xl p-6 shadow-2xl border text-center ${textClass}`}>
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-bold mb-4">Практика завершена!</h1>
              <p className="text-xl mb-2">Вы изучили {lessonResult?.newWords || 0} слов</p>
              <p className="text-gray-400">Отличная работа!</p>
              <button
                onClick={handleFinish}
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold py-4 rounded-xl"
              >
                Продолжить
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`min-h-screen ${bgClass} transition-colors duration-300 flex items-center justify-center p-4`}>
        <div className="relative z-10 w-full max-w-2xl">
          <div className={`${cardClass} rounded-2xl p-6 shadow-2xl border text-center ${textClass}`}>
            <h1 className="text-3xl font-bold mb-4">Урок завершен!</h1>
            {lessonResult && (
              <div className="space-y-2 text-lg">
                <p>Результат: {lessonResult.score}%</p>
                <p>Выучено слов: {lessonResult.newWords}</p>
                <p className="text-red-500">Ошибок: {lessonResult.totalQuestions - lessonResult.correctAnswers}</p>
              </div>
            )}
            <button
              onClick={handleFinish}
              className="w-full mt-6 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold py-4 rounded-xl"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate progress
  // Estimate: Each cycle has roughly 4 blocks. 
  // We can be more precise if we want, but simple estimate is fine.
  const totalCycles = cycles.length;
  const progressPerCycle = 100 / Math.max(totalCycles, 1);
  const currentBaseProgress = currentCycleIndex * progressPerCycle;

  // Progress within cycle
  const totalBlocksInCycle = blockOrder.length;
  const progressWithinCycle = totalBlocksInCycle > 0 ? (currentBlockIndex / totalBlocksInCycle) * progressPerCycle : 0;

  const currentProgress = Math.min(Math.round(currentBaseProgress + progressWithinCycle), 100);

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300 flex flex-col items-center p-4`}>
      {/* Header Area */}
      <div className="w-full max-w-2xl mb-6 mt-2 relative">

        {/* Top Row: Title Center, X Right */}
        <div className="flex items-center justify-between mb-4 relative">
          <button
            onClick={handleRestart}
            title="Начать заново"
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${textClass} opacity-70 hover:opacity-100`}
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <h2 className={`text-xl font-bold text-center ${textClass} opacity-90`}>
            {data.title}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${textClass}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-2">
          <div className="w-full bg-gray-200/30 rounded-full h-3 backdrop-blur-sm overflow-hidden">
            <div
              className="bg-green-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${currentProgress}%` }}
            ></div>
          </div>
          <div className={`text-right text-sm font-medium ${textClass} opacity-80`}>
            {currentProgress}%
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="w-full max-w-2xl flex-1 flex flex-col">
        {/* We don't need extra padding container if the Block handles it, 
                but keeping the card style wrapper is good for consistency. 
                Obuchenie.txt says explicitly "Lesson 3... Progress... [Current Task] ... Next".
                So the card is the [Current Task] area.
            */}
        <div className={`${cardClass} rounded-2xl p-6 shadow-xl border w-full flex-1 flex flex-col justify-center`}>
          {renderCurrentBlock()}
        </div>
      </div>
    </div>
  )
}
