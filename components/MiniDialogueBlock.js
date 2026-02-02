'use client';

import { useState } from 'react';
import { Volume2, ArrowLeft, SkipForward } from 'lucide-react';
import { speak } from '@/lib/googleTTS';
import { sounds } from '@/lib/sounds';

export default function MiniDialogueBlock({ dialogue, onNext, onBack, onResult }) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null); // null, 'correct', 'incorrect'

  // Helper to get consistent distractors (mocking for now since we don't have them in data)
  // ideally this should be part of the lesson data
  const getDistractors = (correctLine) => {
    const genericPhrases = [
      "Kiitos, hei!", "En ymmärrä.", "Anteeksi, missä on WC?",
      "Minä olen suomalainen.", "Tämä on erittäin kallis.", "Haluan kahvia.",
      "Mitä kuuluu?", "Näkemiin.", "Olen pahoillani."
    ];
    const pool = genericPhrases.filter(p => p !== correctLine);
    return pool.sort(() => 0.5 - Math.random()).slice(0, 2);
  };

  const currentLine = dialogue?.lines[currentLineIndex];

  // Effect to handle initialization of specific line type
  // Whenever line index changes, check if it's user turn or computer turn
  if (currentLine && !showOptions && !feedback) {
    const isUserTurn = currentLineIndex % 2 !== 0;
    if (isUserTurn && options.length === 0) {
      // Prepare options only if not already prepared
      const correctLine = currentLine.line;
      const distractors = getDistractors(correctLine);
      const arrayToShuffle = [correctLine, ...distractors];
      for (let i = arrayToShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayToShuffle[i], arrayToShuffle[j]] = [arrayToShuffle[j], arrayToShuffle[i]];
      }
      setOptions(arrayToShuffle);
      setShowOptions(true);
    }
  }

  const handleOptionClick = (option) => {
    if (feedback) return;
    sounds.playClick();
    setSelectedOption(option);
  };

  const handleCheck = () => {
    if (!selectedOption) return;

    const isCorrect = selectedOption === currentLine.line;
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
    if (onResult) onResult('skip');
  };

  const handleNextLine = () => {
    sounds.playNext();
    setFeedback(null);
    setSelectedOption(null);
    setShowOptions(false);
    setOptions([]); // Reset options for next turn

    if (currentLineIndex < dialogue.lines.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
    } else {
      onNext();
    }
  };

  const speakLine = async (text) => {
    sounds.playClick();
    try {
      await speak(text, 'fi-FI');
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  if (!dialogue || !dialogue.lines) return null;

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto overflow-hidden">
      <h2 className="text-sm sm:text-lg font-bold mb-3 sm:mb-4 text-center text-gray-500 uppercase tracking-widest">{dialogue.title}</h2>

      <div className="flex-1 overflow-y-auto px-1 sm:px-4 py-2 space-y-4 mb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 min-h-0">
        {/* History Bubbles */}
        {dialogue.lines.slice(0, currentLineIndex).map((line, idx) => (
          <div key={idx} className={`flex ${idx % 2 === 0 ? 'justify-start' : 'justify-end'} animate-in fade-in duration-300`}>
            <div className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl shadow-sm ${idx % 2 === 0
              ? 'bg-gray-100 dark:bg-gray-800 rounded-tl-none'
              : 'bg-blue-100 dark:bg-blue-900/40 rounded-tr-none'
              }`}>
              <p className="text-[10px] font-bold mb-1 opacity-50 uppercase tracking-tighter">{line.speaker}</p>
              <div className="flex items-center gap-2">
                <p className="text-base sm:text-lg leading-tight">{line.line}</p>
                <button onClick={() => speakLine(line.line)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full flex-shrink-0">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs sm:text-sm opacity-60 mt-1 pb-1 border-b border-gray-300/20">{line.translation}</p>
            </div>
          </div>
        ))}

        {/* Current Computer Line (only if it's computer turn) */}
        {currentLineIndex % 2 === 0 && currentLine && (
          <div className="flex justify-start animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl rounded-tl-none shadow-md bg-white dark:bg-gray-800 border-l-4 border-blue-500">
              <p className="text-[10px] font-bold mb-1 text-blue-500 uppercase tracking-tighter">{currentLine.speaker}</p>
              <div className="flex items-center gap-3">
                <p className="text-base sm:text-lg font-medium leading-tight">{currentLine.line}</p>
                <button onClick={() => speakLine(currentLine.line)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full flex-shrink-0">
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">{currentLine.translation}</p>
            </div>
          </div>
        )}

        {/* Current User Line Feedback (after selection) */}
        {showOptions && feedback && (
          <div className="flex justify-end animate-in fade-in slide-in-from-right-4 duration-500">
            <div className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl rounded-tr-none shadow-md ${feedback === 'correct' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
              }`}>
              <p className="text-[10px] font-bold mb-1 opacity-50 uppercase tracking-tighter">{currentLine.speaker}</p>
              <div className="flex items-center gap-2">
                <p className="text-base sm:text-lg font-bold leading-tight">{selectedOption}</p>
                <button onClick={() => speakLine(currentLine.line)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full flex-shrink-0">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              {feedback === 'incorrect' && (
                <div className="mt-2 pt-2 border-t border-red-200/50">
                  <p className="text-[10px] uppercase font-bold text-red-700 mb-1">Правильно:</p>
                  <p className="text-sm sm:text-lg font-medium">{currentLine.line}</p>
                </div>
              )}
              <p className="text-xs sm:text-sm opacity-60 mt-1 italic">{currentLine.translation}</p>
            </div>
          </div>
        )}

        <div id="chat-anchor" className="h-4" />
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex gap-3 flex-wrap sm:flex-nowrap">
        <button
          onClick={() => {
            if (currentLineIndex > 0) {
              sounds.playClick();
              setFeedback(null);
              setSelectedOption(null);
              setShowOptions(false);
              setOptions([]);
              setCurrentLineIndex(prev => prev - 1);
            } else if (onBack) {
              onBack();
            }
          }}
          className="p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Назад"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {currentLineIndex % 2 === 0 ? (
          <button onClick={handleNextLine} className="flex-grow bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-sm sm:text-base">
            Продолжить <span className="opacity-50 ml-1">→</span>
          </button>
        ) : (
          <div className="flex-grow space-y-3">
            {feedback ? (
              <button
                onClick={handleNextLine}
                className={`w-full font-bold py-3.5 sm:py-4 rounded-xl shadow-lg transition-all active:scale-95 text-sm sm:text-base ${currentLineIndex < dialogue.lines.length - 1
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  }`}>
                {currentLineIndex < dialogue.lines.length - 1 ? 'Дальше' : 'Завершить'}
              </button>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <p className="text-center text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Выберите ответ:</p>
                <div className="grid gap-2 mb-3">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        onClick={() => handleOptionClick(opt)}
                        className={`flex-grow p-3 sm:p-4 rounded-xl text-left border-2 transition-all font-medium text-sm sm:text-base ${selectedOption === opt
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                      >
                        {opt}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); speakLine(opt); }}
                        className="p-2.5 sm:p-3 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 flex-shrink-0 shadow-sm"
                      >
                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={handleCheck}
                    disabled={!selectedOption}
                    className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 sm:py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide shadow-lg shadow-blue-500/20 active:scale-95 text-xs sm:text-sm"
                  >
                    Проверить
                  </button>
                  <button
                    onClick={handleSkip}
                    className="p-3.5 sm:p-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors shadow-sm"
                    title="Пропустить"
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
