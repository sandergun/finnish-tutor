'use client';

import { useState, useMemo, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowLeft, SkipForward } from 'lucide-react';
import { sounds } from '@/lib/sounds';

export default function MiniTestBlock({ questions, onNext, onBack, onResult, isIntensiveMode }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null); // null, 'correct', 'incorrect'

  useEffect(() => {
    if (isIntensiveMode && (!questions || questions.length === 0)) {
      onNext();
    }
  }, [questions, onNext, isIntensiveMode]);

  const handleAnswerClick = (option) => {
    if (feedback) return;
    if (option !== undefined && option !== null) {
      setSelectedAnswer(option);
    }
  };

  const currentQuestion = questions ? questions[currentQuestionIndex] : null;

  // Calculate correct answer - include all dependencies to ensure proper recalculation
  const correctAnswer = useMemo(() => {
    if (!currentQuestion) return null;
    if (typeof currentQuestion.correct === 'number') {
      if (currentQuestion.correct >= 0 && currentQuestion.correct < currentQuestion.options.length) {
        return currentQuestion.options[currentQuestion.correct];
      }
    }
    // If .correct is a string, it's the answer itself
    if (typeof currentQuestion.correct === 'string') {
      return currentQuestion.correct;
    }
    return null;
  }, [questions, currentQuestionIndex, currentQuestion]);


  const handleCheck = () => {
    if (correctAnswer === null) {
      console.warn('Cannot check answer: correctAnswer is null (invalid question data)');
      setFeedback('incorrect');
      if (onResult) onResult(false);
      return;
    }

    if (typeof selectedAnswer !== 'string') {
      return;
    }

    // Debug log to diagnose the issue
    console.log('🔍 Checking answer:', {
      selectedAnswer,
      correctAnswer,
      question: currentQuestion?.question,
      currentQuestionIndex,
    });

    const isCorrect = selectedAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    console.log('🔍 isCorrect:', isCorrect);

    if (isCorrect) {
      setFeedback('correct');
      sounds.playCorrect();
    } else {
      setFeedback('incorrect');
      sounds.playWrong();
    }
    if (onResult) onResult(isCorrect);
  };

  const handleSkip = () => {
    setFeedback('skipped');
    // Don't play wrong sound
    if (onResult) onResult('skip');
  };

  const handleNext = () => {
    sounds.playNext();
    setFeedback(null);
    setSelectedAnswer(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onNext();
    }
  };

  const handlePrevious = () => {
    sounds.playPrev();
    setFeedback(null);
    setSelectedAnswer(null);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (onBack) {
      onBack();
    }
  };

  if (!questions || questions.length === 0) {
    return isIntensiveMode ? null : (
      <div>
        <p>Нет вопросов в этом цикле.</p>
        <button onClick={onNext} className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-xl">
          Продолжить
        </button>
      </div>
    );
  }

  if (!currentQuestion || !currentQuestion.options || currentQuestion.options.length === 0) {
    return (
      <div>
        <p>Ошибка: в вопросе отсутствуют варианты ответов.</p>
        <button onClick={handleNext} className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-xl">
          Продолжить
        </button>
      </div>
    );
  }

  const getTranslation = (q) => {
    if (q.translation) return q.translation;
    if (q.question) {
      const match = q.question.match(/Как по-фински '(.+?)'/);
      if (match && match[1]) return match[1];
    }
    return 'Перевод отсутствует';
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 leading-tight">{currentQuestion.question}</h2>
      <div className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto min-h-0 pr-1">
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
              onClick={() => handleAnswerClick(option)}
              disabled={!!feedback}
              className={`w-full p-3.5 sm:p-4 rounded-xl text-left transition-all active:scale-[0.98] border border-transparent ${buttonClass} ${selectedAnswer === option ? 'border-blue-400 shadow-lg shadow-blue-500/20' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-xs font-bold ${selectedAnswer === option ? 'bg-white text-blue-600' : 'text-white/40'}`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-sm sm:text-base font-medium">{option}</span>
              </div>
            </button>
          );
        })}
      </div>

      {feedback && feedback !== 'skipped' && (
        <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 ${feedback === 'correct' ? 'bg-green-900/30 border border-green-700 text-green-300' : 'bg-red-900/30 border border-red-700 text-red-300'}`}>
          {feedback === 'correct' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
          <div>
            <p className="font-bold text-sm uppercase tracking-wider">{feedback === 'correct' ? 'Правильно!' : 'Не совсем...'}</p>
            {feedback === 'incorrect' && (
              <div className="mt-1">
                <p className="text-sm">Правильный ответ: <span className="font-bold">{correctAnswer}</span></p>
                <p className="text-xs opacity-80 mt-1">Перевод: {getTranslation(currentQuestion)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {feedback === 'skipped' && (
        <div className="mt-4 p-4 rounded-xl bg-yellow-900/30 border border-yellow-700 text-yellow-200 animate-in fade-in slide-in-from-bottom-2">
          <p className="font-bold text-sm uppercase tracking-wider mb-1">Пропущено</p>
          <p className="text-sm">Правильный ответ: <span className="font-bold">{correctAnswer}</span></p>
          <p className="text-xs opacity-80 mt-1">Перевод: {getTranslation(currentQuestion)}</p>
        </div>
      )}

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={handlePrevious}
          className="p-3.5 sm:p-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Назад"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        {!feedback ? (
          <button
            onClick={handleCheck}
            disabled={!selectedAnswer}
            className="flex-grow bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3.5 sm:py-4 rounded-xl disabled:opacity-50 shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm sm:text-base"
          >
            Проверить
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-grow bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3.5 sm:py-4 rounded-xl shadow-lg shadow-green-500/20 active:scale-95 transition-all text-sm sm:text-base"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Дальше' : 'Завершить'}
          </button>
        )}

        {!feedback && (
          <button
            onClick={handleSkip}
            className="p-3.5 sm:p-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
            title="Пропустить"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
