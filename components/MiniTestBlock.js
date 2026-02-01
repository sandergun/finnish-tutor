'use client';

import { useState, useMemo, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
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
    <div>
      <h2 className="text-2xl font-bold mb-4">{currentQuestion.question}</h2>
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
              onClick={() => handleAnswerClick(option)}
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
          <p>Правильный ответ: {correctAnswer}</p>
          <p>Перевод: {getTranslation(currentQuestion)}</p>
        </div>
      )}

      {feedback === 'correct' && (
        <div className="mt-4 p-4 rounded-lg bg-green-900 text-white flex items-center">
          <CheckCircle className="mr-2" />
          <p>Правильно!</p>
        </div>
      )}

      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={handlePrevious}
          className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        {!feedback ? (
          <button onClick={handleCheck} disabled={!selectedAnswer} className="flex-grow w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-xl disabled:opacity-50">
            Проверить
          </button>
        ) : (
          <button onClick={handleNext} className="flex-grow w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold py-4 rounded-xl">
            {currentQuestionIndex < questions.length - 1 ? 'Следующий вопрос' : 'Продолжить'}
          </button>
        )}
      </div>
    </div>
  );
}
