'use client';

import { useState, useEffect, useMemo } from 'react';
import { sounds } from '@/lib/sounds';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { speak } from '@/lib/googleTTS';

// Helper function to shuffle an array
const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
}

export default function ExercisesBlock({ question, allWords, onNext, onBack, onResult, isIntensiveMode }) {
    const [userWords, setUserWords] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [wordOptions, setWordOptions] = useState([]);
    const [feedback, setFeedback] = useState(null); // null, 'correct', 'incorrect'

    // Determine mode based on question type
    // 'translate' -> Assemble Phrase
    // 'fill-in', 'fill-in-choice' -> Insert Word
    const isAssembleMode = question?.type === 'translate';
    const isInsertMode = question?.type === 'fill-in' || question?.type === 'fill-in-choice';

    const userInput = useMemo(() => userWords.join(' '), [userWords]);

    useEffect(() => {
        if (isIntensiveMode && !question) {
            onNext();
        }
    }, [question, onNext, isIntensiveMode]);

    useEffect(() => {
        if (isAssembleMode) {
            const correctWords = (question.correct || '').split(' ').filter(Boolean);
            if (correctWords.length === 0) {
                setWordOptions([]);
                return;
            }
            const distractorPool = [
                ...allWords.map(w => w.finnish).filter(w => !correctWords.includes(w)),
                'ja', 'on', 'ei', 'mutta', 'myös', 'sinä', 'minä', 'hän'
            ];
            const shuffledPool = shuffleArray([...new Set(distractorPool)]);
            const numDistractors = Math.min(Math.max(4, correctWords.length), 6);
            const distractors = shuffledPool.slice(0, numDistractors);
            setWordOptions(shuffleArray([...correctWords, ...distractors]));
            setUserWords([]);
        } else if (isInsertMode) {
            // For insert mode, options might be provided or need generation
            if (question.options && question.options.length > 0) {
                setWordOptions(shuffleArray([...question.options]));
            } else {
                // Fallback or error if no options?
                // For now assuming options exist for fill-in-choice
                setWordOptions([]);
            }
            setSelectedOption(null);
        }
    }, [question, allWords, isAssembleMode, isInsertMode]);

    if (!question) {
        // ... helper render for empty state ...
        return isIntensiveMode ? null : (
            <div>
                <p>Нет упражнения в этом цикле.</p>
                <button onClick={onNext} className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-xl">
                    Продолжить
                </button>
            </div>
        );
    }

    const addWord = (word) => {
        if (feedback) return;
        setUserWords(prev => [...prev, word]);
    }

    const removeWord = (index) => {
        if (feedback) return;
        setUserWords(prev => prev.filter((_, i) => i !== index));
    }

    const handleOptionSelect = (option) => {
        if (feedback) return;
        setSelectedOption(option);
    }

    const handleCheck = () => {
        let isCorrect = false;
        if (isAssembleMode) {
            // Check assembled sentence
            isCorrect = userInput.toLowerCase().trim() === (question.correct || '').toLowerCase().trim();
        } else if (isInsertMode) {
            // Check selected option
            // question.correct might be the word, or index (if number)
            if (typeof question.correct === 'number') {
                isCorrect = selectedOption === question.options[question.correct];
            } else {
                isCorrect = selectedOption === question.correct;
            }
        }

        if (isCorrect) {
            setFeedback('correct');
            sounds.playCorrect();
        } else {
            setFeedback('incorrect');
            sounds.playWrong();
        }
        if (onResult) onResult(isCorrect);
    };

    // Fallback translation helper - also extracts from question text for assemble mode
    const getTranslation = (q) => {
        if (q.translation) return q.translation;
        // For assemble questions, extract translation from question: 'Соберите фразу: "Russian text"'
        if (q.question) {
            const match = q.question.match(/[«"„]([^»"]+)[»""]/);
            if (match && match[1]) return match[1];
        }
        return 'Перевод отсутствует';
    };

    // Compute full sentence for fill-in exercises (replace blank with correct answer)
    const fullSentence = useMemo(() => {
        if (!isInsertMode || !question) return '';
        // Remove instruction prefix and replace blank placeholder with correct answer
        let sentence = question.question
            .replace(/Вставьте пропущенное слово:\n?/i, '')
            .replace(/______|_____/g, question.correct || '')
            .replace(/\n?\(.+\)$/g, '') // remove translation in parentheses at end
            .trim();
        return sentence;
    }, [isInsertMode, question]);

    const speakPhrase = async (text) => {
        sounds.playClick();
        try {
            await speak(text, 'fi-FI');
        } catch (error) {
            console.error('TTS error:', error);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full mx-auto flex flex-col items-center">
            {isAssembleMode && (
                <div className="w-full">
                    <p className="text-sm text-center text-gray-500 uppercase tracking-widest mb-4">Соберите фразу</p>
                    <h2 className="text-2xl font-bold mb-6 text-center">{question.question}</h2>

                    <div className="relative min-h-[4rem] mb-6">
                        <div className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl bg-gray-50 dark:bg-gray-700 min-h-[4rem] flex flex-wrap gap-2 items-center">
                            {userWords.length === 0 && <span className="text-gray-400">Выберите слова...</span>}
                            {userWords.map((word, index) => (
                                <button key={index} onClick={() => removeWord(index)} className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors shadow-sm animate-in fade-in zoom-in duration-200">
                                    {word}
                                </button>
                            ))}
                        </div>
                        {userWords.length > 0 && !feedback && (
                            <button
                                onClick={() => setUserWords([])}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 min-h-[6rem] flex flex-wrap justify-center gap-2">
                        {wordOptions.map((word, index) => (
                            <button key={index} onClick={() => addWord(word)} disabled={!!feedback} className="bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all shadow-sm active:scale-95 disabled:opacity-50">
                                {word}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isInsertMode && (
                <div className="w-full">
                    <p className="text-sm text-center text-gray-500 uppercase tracking-widest mb-4">Вставьте слово</p>
                    <h2 className="text-2xl font-bold mb-8 text-center leading-relaxed">
                        {question.question.replace('______', '________').split('________').map((part, i, arr) => (
                            <span key={i}>
                                {part}
                                {i < arr.length - 1 && (
                                    <span className={`inline-block border-b-2 px-2 mx-1 font-medium ${selectedOption ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-gray-300'}`}>
                                        {selectedOption || '?'}
                                    </span>
                                )}
                            </span>
                        ))}
                    </h2>

                    <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
                        {wordOptions.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleOptionSelect(option)}
                                disabled={!!feedback}
                                className={`w-full p-4 rounded-xl text-lg font-medium transition-all border-2 ${selectedOption === option
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'border-gray-200 bg-white hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700'
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Feedback Areas */}
            {feedback === 'incorrect' && (
                <div className="w-full mt-6 p-4 rounded-xl bg-red-50 text-red-900 border border-red-100 flex flex-col items-center">
                    <p className="font-bold mb-1">Неверно</p>
                    {isAssembleMode ? (
                        <div className="mt-2 p-3 bg-white rounded-lg border border-red-200 w-full">
                            <p className="text-sm text-gray-500 mb-1">Правильный ответ:</p>
                            <div className="flex items-center justify-center gap-2">
                                <p className="text-lg font-medium text-gray-800">{question.correct}</p>
                                <button onClick={() => speakPhrase(question.correct)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full flex-shrink-0">
                                    <Volume2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p>Правильный ответ: {question.correct}</p>
                    )}
                    {isInsertMode && fullSentence && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-red-200 w-full">
                            <p className="text-sm text-gray-500 mb-1">Полная фраза:</p>
                            <div className="flex items-center justify-center gap-2">
                                <p className="text-lg font-medium text-gray-800">{fullSentence}</p>
                                <button onClick={() => speakPhrase(fullSentence)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full flex-shrink-0">
                                    <Volume2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                    <p className="text-sm opacity-80 mt-2">{getTranslation(question)}</p>
                </div>
            )}

            {feedback === 'correct' && (
                <div className="w-full mt-6 p-4 rounded-xl bg-green-50 text-green-900 border border-green-100 flex flex-col items-center">
                    <p className="font-bold text-xl mb-2">Правильно! 🎉</p>
                    {isInsertMode && fullSentence ? (
                        <div className="mt-2 p-3 bg-white rounded-lg border border-green-200 w-full">
                            <p className="text-sm text-gray-500 mb-1">Полная фраза:</p>
                            <div className="flex items-center justify-center gap-2">
                                <p className="text-lg font-medium text-gray-800">{fullSentence}</p>
                                <button onClick={() => speakPhrase(fullSentence)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full flex-shrink-0">
                                    <Volume2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ) : isAssembleMode ? (
                        <div className="mt-2 p-3 bg-white rounded-lg border border-green-200 w-full">
                            <div className="flex items-center justify-center gap-2">
                                <p className="text-lg font-medium text-gray-800">{question.correct}</p>
                                <button onClick={() => speakPhrase(question.correct)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full flex-shrink-0">
                                    <Volume2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-lg font-medium">{question.correct}</p>
                    )}
                    <p className="text-sm opacity-80 mt-2 italic">{getTranslation(question)}</p>
                </div>
            )}

            <div className="w-full mt-8 flex gap-4">
                <button
                    onClick={onBack}
                    className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                {!feedback ? (
                    <button
                        onClick={handleCheck}
                        disabled={isAssembleMode ? userWords.length === 0 : !selectedOption}
                        className="flex-grow bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-98"
                    >
                        Проверить
                    </button>
                ) : (
                    <button onClick={onNext} className="flex-grow bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-98">
                        Продолжить
                    </button>
                )}
            </div>
        </div>
    );
}
