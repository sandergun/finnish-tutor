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
    <div>
      <h2 className="text-2xl font-bold mb-4">Слушайте и выберите</h2>
      <div className="flex justify-center my-6">
        <button onClick={handlePlayAudio} className="p-6 bg-blue-500 rounded-full text-white">
          <Volume2 size={48} />
        </button>
      </div>

      <div className="space-y-2">
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
          <p>Перевод: {getTranslation(question)}</p>
        </div>
      )}

      {feedback === 'correct' && (
        <div className="mt-4 p-4 rounded-lg bg-green-900 text-white flex items-center">
          <CheckCircle className="mr-2" />
          <p>Правильно!</p>
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <button
          onClick={onBack}
          className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        {!feedback ? (
          <button onClick={handleCheck} disabled={!selectedAnswer} className="flex-grow bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-xl disabled:opacity-50">
            Проверить
          </button>
        ) : (
          <button onClick={handleNext} className="flex-grow bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold py-4 rounded-xl">
            Продолжить
          </button>
        )}
      </div>
    </div>
  );
}
