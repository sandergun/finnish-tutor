'use client';

import { useState, useEffect, useMemo } from 'react';
import { Volume2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { speak } from '@/lib/googleTTS';
import { sounds } from '@/lib/sounds';

export default function ListeningTaskBlock({ question, onNext, onBack, isIntensiveMode }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null); // null, 'correct', 'incorrect'

  const correctAnswer = useMemo(() => {
    if (!question) return null;
    if (typeof question.correct === 'number') {
      return question.options[question.correct];
    }
    return question.correct;
  }, [question]);

  useEffect(() => {
    if (isIntensiveMode && !question) {
      onNext();
      return;
    }
    if (question) {
      handlePlayAudio();
    }
  }, [question, onNext, isIntensiveMode]);

  const handlePlayAudio = async () => {
    if (!question) return;

    let textToSpeak = question.text_to_speak;

    // Fallback for old lessons where text_to_speak is missing
    if (!textToSpeak) {
      if (typeof question.correct === 'string') {
        textToSpeak = question.correct;
      } else if (typeof question.correct === 'number' && question.options) {
        textToSpeak = question.options[question.correct];
      }
    }

    // Safety: don't speak if we still don't have valid text
    if (!textToSpeak || textToSpeak === 'undefined') {
      console.warn('No valid text to speak for listening task');
      return;
    }

    try {
      await speak(textToSpeak, 'fi-FI');
    } catch (error) {
      console.error('TTS error in listening task:', error);
    }
  };

  const handleAnswerClick = (option) => {
    if (feedback) return;
    setSelectedAnswer(option);
  };

  const handleCheck = () => {
    if (!selectedAnswer) return;

    // Safety check for correctAnswer
    if (!correctAnswer) {
      console.warn('Cannot check answer: correctAnswer is null');
      setFeedback('incorrect');
      sounds.playWrong();
      return;
    }

    if (selectedAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
      setFeedback('correct');
      sounds.playCorrect();
    } else {
      setFeedback('incorrect');
      sounds.playWrong();
    }
  };

  const handleNext = () => {
    onNext();
  };

  const getTranslation = (q) => {
    if (q.translation) return q.translation;
    // Try to parse from question text like "Как по-фински 'слово'?"
    if (q.question) {
      const match = q.question.match(/Как по-фински '(.+?)'/);
      if (match && match[1]) return match[1];
    }
    return 'Перевод отсутствует';
  };

  if (!question) {
    return isIntensiveMode ? null : (
      <div>
        <p>Нет задания на аудирование в этом цикле.</p>
        <button onClick={onNext} className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-xl">
          Продолжить
        </button>
      </div>
    );
  }

  if (!question.options || question.options.length === 0) {
    console.error('Question has no options:', question);
    return (
      <div>
        <p>Ошибка: в вопросе отсутствуют варианты ответов.</p>
        <button onClick={onNext} className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-xl">
          Продолжить
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center leading-tight">Слушайте и выберите</h2>

      <div className="flex justify-center my-4 sm:my-8 animate-in zoom-in duration-500">
        <button
          onClick={handlePlayAudio}
          className="p-5 sm:p-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/30 transition-all active:scale-90 hover:scale-105"
          aria-label="Слушать"
        >
          <Volume2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </button>
      </div>

      <div className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto min-h-0 pr-1 py-1">
        {question.options.map((option, index) => {
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
              className={`w-full p-3.5 sm:p-4 rounded-xl text-left transition-all active:scale-[0.98] border border-transparent ${buttonClass} ${selectedAnswer === option ? 'border-blue-400 shadow-md shadow-blue-500/20' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-bold ${selectedAnswer === option ? 'bg-white text-blue-600' : 'text-white/40'}`}>
                  {index + 1}
                </span>
                <span className="text-sm sm:text-base font-medium">{option}</span>
              </div>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 ${feedback === 'correct' ? 'bg-green-900/30 border border-green-700 text-green-300' : 'bg-red-900/30 border border-red-700 text-red-300'}`}>
          {feedback === 'correct' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
          <div>
            <p className="font-bold text-sm uppercase tracking-wider">{feedback === 'correct' ? 'Превосходно!' : 'Почти...'}</p>
            {feedback === 'incorrect' && (
              <div className="mt-1">
                <p className="text-sm">Правильно: <span className="font-bold">{correctAnswer}</span></p>
                <p className="text-xs opacity-80 mt-1">Значение: {getTranslation(question)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3 sm:gap-4">
        <button
          onClick={onBack}
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
            Продолжить
          </button>
        )}
      </div>
    </div>
  );
}
