import React, { useState, useEffect } from 'react';
import { Shuffle, RotateCcw } from 'lucide-react';

export default function LetterTiles({ correctAnswer, onSubmit, onSkip }) {
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [availableLetters, setAvailableLetters] = useState([]);

  useEffect(() => {
    // Инициализация: разбиваем правильный ответ на буквы и перемешиваем
    const letters = correctAnswer.toLowerCase().split('');
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setAvailableLetters(shuffled.map((letter, index) => ({
      letter,
      id: `${letter}_${index}`,
      used: false
    })));
    setSelectedLetters([]);
  }, [correctAnswer]);

  // Выбор буквы из доступных
  const selectLetter = (letterId) => {
    const letterObj = availableLetters.find(l => l.id === letterId);
    if (!letterObj || letterObj.used) return;

    setSelectedLetters(prev => [...prev, letterObj]);
    setAvailableLetters(prev =>
      prev.map(l => l.id === letterId ? { ...l, used: true } : l)
    );
  };

  // Убрать последнюю букву
  const removeLastLetter = () => {
    if (selectedLetters.length === 0) return;

    const lastLetter = selectedLetters[selectedLetters.length - 1];
    setSelectedLetters(prev => prev.slice(0, -1));
    setAvailableLetters(prev =>
      prev.map(l => l.id === lastLetter.id ? { ...l, used: false } : l)
    );
  };

  // Перемешать буквы заново
  const shuffleLetters = () => {
    const shuffled = [...availableLetters].sort(() => Math.random() - 0.5);
    setAvailableLetters(shuffled);
  };

  // Сбросить все
  const reset = () => {
    setSelectedLetters([]);
    setAvailableLetters(prev => prev.map(l => ({ ...l, used: false })));
  };

  // Проверить ответ
  const checkAnswer = () => {
    const userAnswer = selectedLetters.map(l => l.letter).join('');
    onSubmit(userAnswer);
  };

  const userAnswer = selectedLetters.map(l => l.letter).join('');
  const isComplete = selectedLetters.length === correctAnswer.length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Поле с выбранными буквами */}
      <div
        onClick={removeLastLetter}
        className="min-h-[60px] sm:min-h-[80px] bg-gray-800/50 rounded-xl p-3 sm:p-4 border-2 border-gray-700 flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 cursor-pointer hover:bg-gray-800/70 transition-all"
      >
        {selectedLetters.length === 0 ? (
          <span className="text-gray-500 text-xs sm:text-sm">Нажимайте на буквы ниже 👇</span>
        ) : (
          selectedLetters.map((letterObj, index) => (
            <div
              key={`selected_${letterObj.id}_${index}`}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 text-white font-bold text-lg sm:text-xl rounded-lg flex items-center justify-center shadow-lg animate-in fade-in zoom-in duration-200"
            >
              {letterObj.letter}
            </div>
          ))
        )}
      </div>

      {/* Подсказка */}
      <div className="text-center text-gray-400 text-[10px] sm:text-xs">
        {selectedLetters.length > 0 && (
          <p>Нажмите сверху, чтобы убрать букву</p>
        )}
      </div>

      {/* Доступные буквы */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
        {availableLetters.map((letterObj) => (
          <button
            key={letterObj.id}
            onClick={() => selectLetter(letterObj.id)}
            disabled={letterObj.used}
            className={`w-10 h-10 sm:w-12 sm:h-12 font-bold text-base sm:text-xl rounded-lg transition-all ${letterObj.used
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-30'
                : 'bg-gray-700 text-white hover:bg-gray-600 active:scale-95 shadow-sm'
              }`}
          >
            {letterObj.letter}
          </button>
        ))}
      </div>

      {/* Управление */}
      <div className="flex gap-2">
        <button
          onClick={reset}
          className="flex-1 bg-gray-700 text-white py-2.5 sm:py-3 rounded-xl hover:bg-gray-600 transition-all flex items-center justify-center gap-2 text-sm sm:text-base border border-gray-600"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          Сбросить
        </button>
        <button
          onClick={shuffleLetters}
          className="flex-1 bg-gray-700 text-white py-2.5 sm:py-3 rounded-xl hover:bg-gray-600 transition-all flex items-center justify-center gap-2 text-sm sm:text-base border border-gray-600"
        >
          <Shuffle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          Перемешать
        </button>
      </div>

      {/* Кнопки действий */}
      <div className="space-y-2 pt-2">
        <button
          onClick={checkAnswer}
          disabled={!isComplete}
          className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all active:scale-[0.98] ${isComplete
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
            }`}
        >
          Проверить
        </button>

        <button
          onClick={onSkip}
          className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 sm:py-3 rounded-xl transition-all font-medium text-xs sm:text-sm"
        >
          ❓ Пропустить вопрос
        </button>
      </div>
    </div>
  );
}