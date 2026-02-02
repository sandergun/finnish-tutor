'use client';

import { useState, useEffect } from 'react';
import { Volume2, ArrowRight, ArrowLeft } from 'lucide-react';
import { speak } from '@/lib/googleTTS';
import { sounds } from '@/lib/sounds';

export default function WordStudyBlock({ words, onNext, onBack, onWordChange, isIntensiveMode }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    if (onWordChange) {
      onWordChange(currentWordIndex);
    }
  }, [currentWordIndex, onWordChange]);

  useEffect(() => {
    if (isIntensiveMode && (!words || words.length === 0)) {
      onNext();
    }
  }, [words, onNext, isIntensiveMode]);

  const handleNextWord = () => {
    sounds.playNext();
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      onNext();
    }
  };

  const speakWord = async (text) => {
    sounds.playClick();
    try {
      await speak(text, 'fi-FI');
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  if (!words || words.length === 0) {
    return isIntensiveMode ? null : (
      <div>
        <p>Нет слов для изучения в этом блоке.</p>
        <button onClick={onNext} className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-xl">
          Продолжить
        </button>
      </div>
    );
  }

  const word = words[currentWordIndex];

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="mb-4 text-sm text-gray-400 font-medium tracking-wide uppercase">
        Слово {currentWordIndex + 1} из {words.length}
      </div>

      <div className="text-center mb-6 sm:mb-8 w-full">
        {/* Emoji & Word */}
        <div onClick={() => speakWord(word.finnish)} className="cursor-pointer group transition-transform active:scale-95">
          <div className="text-5xl sm:text-7xl mb-4 sm:mb-6 transform group-hover:scale-110 transition-transform duration-300">{word.emoji}</div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-800 dark:text-white leading-tight">{word.finnish}</h2>
            <Volume2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Translation - Always visible */}
        <p className="text-xl sm:text-2xl text-gray-500 dark:text-gray-400 font-medium mt-1 sm:mt-2">{word.russian}</p>
      </div>

      {/* Example - Always visible if exists (Max 1) */}
      {word.example_sentence && (
        <div className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-[10px] sm:text-sm text-gray-400 uppercase tracking-wider mb-2 sm:mb-3 font-semibold">Пример</p>
          <div className="flex items-center justify-center gap-3 sm:gap-4 text-left">
            <button
              onClick={() => speakWord(word.example_sentence.finnish)}
              className="mt-1 p-2 bg-white dark:bg-gray-600 rounded-full shadow-sm hover:shadow-md transition-shadow shrink-0 text-blue-500"
            >
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="min-w-0">
              <p className="text-base sm:text-xl font-medium text-gray-800 dark:text-white mb-0.5 sm:mb-1 leading-snug break-words">
                {word.example_sentence.finnish}
              </p>
              <p className="text-sm sm:text-lg text-gray-500 dark:text-gray-400 leading-snug break-words">
                {word.example_sentence.russian}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="w-full mt-auto pt-4 flex gap-3 sm:gap-4">
        <button
          onClick={() => {
            if (currentWordIndex > 0) {
              setCurrentWordIndex(prev => prev - 1);
            } else if (onBack) {
              onBack();
            }
          }}
          className="p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNextWord}
          className={`flex-grow bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base sm:text-lg font-bold py-3.5 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2`}
        >
          <span className="truncate">{currentWordIndex < words.length - 1 ? 'Дальше' : 'Далее'}</span>
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
        </button>
      </div>
    </div>
  );
}
