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
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      <h2 className="text-lg font-bold mb-4 text-center text-gray-400">{dialogue.title}</h2>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 mb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {/* History Bubbles */}
        {dialogue.lines.slice(0, currentLineIndex).map((line, idx) => (
          <div key={idx} className={`flex ${idx % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${idx % 2 === 0
              ? 'bg-gray-100 dark:bg-gray-800 rounded-tl-none'
              : 'bg-blue-100 dark:bg-blue-900/40 rounded-tr-none'
              }`}>
              <p className="text-xs font-bold mb-1 opacity-50">{line.speaker}</p>
              <div className="flex items-center gap-2">
                <p className="text-lg">{line.line}</p>
                <button onClick={() => speakLine(line.line)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full flex-shrink-0">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm opacity-60 mt-1 pb-1 border-b border-gray-300/20">{line.translation}</p>
            </div>
          </div>
        ))}

        {/* Current Computer Line (only if it's computer turn) */}
        {currentLineIndex % 2 === 0 && currentLine && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="max-w-[80%] p-4 rounded-2xl rounded-tl-none shadow-md bg-white dark:bg-gray-800 border-l-4 border-blue-500">
              <p className="text-xs font-bold mb-1 text-blue-500">{currentLine.speaker}</p>
              <div className="flex items-center gap-3">
                <p className="text-lg font-medium">{currentLine.line}</p>
                <button onClick={() => speakLine(currentLine.line)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full">
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">{currentLine.translation}</p>
            </div>
          </div>
        )}

        {/* Current User Line Feedback (after selection) */}
        {showOptions && feedback && (
          <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2">
            <div className={`max-w-[80%] p-4 rounded-2xl rounded-tr-none shadow-md ${feedback === 'correct' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
              }`}>
              <p className="text-xs font-bold mb-1 opacity-50">{currentLine.speaker}</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold">{selectedOption}</p>
                <button onClick={() => speakLine(currentLine.line)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full flex-shrink-0">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              {feedback === 'incorrect' && (
                <div className="mt-2 pt-2 border-t border-red-200">
                  <p className="text-sm font-bold text-red-700">Правильно:</p>
                  <p className="text-lg">{currentLine.line}</p>
                </div>
              )}
              <p className="text-sm opacity-60 mt-1">{currentLine.translation}</p>
            </div>
          </div>
        )}

        <div id="chat-anchor" className="h-1" />
      </div>

      <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex gap-3">
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
          className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {currentLineIndex % 2 === 0 ? (
          <button onClick={handleNextLine} className="flex-grow bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
            Далее
          </button>
        ) : (
          <div className="flex-grow space-y-4">
            {feedback ? (
              <button onClick={handleNextLine} className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all ${currentLineIndex < dialogue.lines.length - 1
                ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                }`}>
                {currentLineIndex < dialogue.lines.length - 1 ? 'Дальше' : 'Завершить диалог'}
              </button>
            ) : (
              <>
                <p className="text-center text-sm text-gray-500 font-medium">Выберите ответ:</p>
                <div className="grid gap-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        onClick={() => handleOptionClick(opt)}
                        className={`flex-grow p-4 rounded-xl text-left border-2 transition-all font-medium ${selectedOption === opt
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                      >
                        {opt}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); speakLine(opt); }}
                        className="p-3 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 flex-shrink-0"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 w-full mt-2">
                  <button
                    onClick={handleCheck}
                    disabled={!selectedOption}
                    className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                  >
                    Проверить
                  </button>
                  <button
                    onClick={handleSkip}
                    className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                    title="Пропустить"
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
