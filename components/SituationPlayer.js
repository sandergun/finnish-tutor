'use client';
import { useState, useEffect, useRef } from 'react';
import { Check, X, HelpCircle, ArrowRight, RotateCcw, Volume2, Mic, Lightbulb } from 'lucide-react';
import { speak } from '@/lib/googleTTS';
import { sounds } from '@/lib/sounds';
import { createPortal } from 'react-dom';

export default function SituationPlayer({ situation, onClose, onComplete, initialStep = 1 }) {
    const [mounted, setMounted] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(initialStep - 1);
    const [selectedWords, setSelectedWords] = useState([]);
    const [availableWords, setAvailableWords] = useState([]);
    const [status, setStatus] = useState('idle'); // idle, correct, incorrect
    const [feedback, setFeedback] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [showTheory, setShowTheory] = useState(!!situation.theory);

    useEffect(() => {
        setMounted(true);
        // Lock body scroll
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const steps = situation.steps || [];
    const currentStep = steps[currentStepIndex];

    // Initialize words for the new step
    useEffect(() => {
        console.log('SituationPlayer: currentStep changed', currentStepIndex);
        if (!currentStep) {
            console.error('SituationPlayer: No current step!', situation);
            return;
        }

        // Harvest unique words from ALL possible Finnish answers
        const allCorrectAnswers = currentStep.expected_fi || [];
        console.log('SituationPlayer: Harvesting words from:', allCorrectAnswers);

        const uniqueWordsMap = new Map();
        allCorrectAnswers.forEach(answerStr => {
            if (!answerStr) return;
            const words = answerStr.split(/\s+/).filter(w => w.trim());
            words.forEach((w, i) => {
                const clean = w.replace(/[.,!?]/g, '').toLowerCase();
                if (!uniqueWordsMap.has(clean)) {
                    uniqueWordsMap.set(clean, w);
                }
            });
        });

        const wordsToDisplay = Array.from(uniqueWordsMap.entries()).map(([clean, original], i) => ({
            id: i,
            text: clean,
            original: original
        }));

        console.log('SituationPlayer: Generated words', wordsToDisplay);

        // Shuffle
        const shuffled = [...wordsToDisplay].sort(() => Math.random() - 0.5);

        setAvailableWords(shuffled);
        setSelectedWords([]);
        setStatus('idle');
        setFeedback('');
        setShowHint(false);
        setAttempts(0);
    }, [currentStepIndex, currentStep]);

    const handleClearAll = () => {
        if (selectedWords.length === 0) return;
        setAvailableWords(prev => [...prev, ...selectedWords]);
        setSelectedWords([]);
    };

    const handleWordClick = (word, fromBank) => {
        if (status === 'correct') return; // Locked

        if (fromBank) {
            // Move from bank to selected
            setAvailableWords(prev => prev.filter(w => w.id !== word.id));
            setSelectedWords(prev => [...prev, word]);
        } else {
            // Move from selected back to bank
            setSelectedWords(prev => prev.filter(w => w.id !== word.id));
            setAvailableWords(prev => [...prev, word]);
        }
    };

    const checkAnswer = () => {
        if (selectedWords.length === 0) return;

        const userAnswer = selectedWords.map(w => w.text.toLowerCase()).join(' ');

        // Normalize all expected answers
        const expectedVariants = (currentStep.expected_fi || []).map(v =>
            v.toLowerCase().replace(/[.,!?]/g, '').trim()
        );

        console.log('SituationPlayer: Checking answer:', userAnswer, 'against:', expectedVariants);

        // Simple normalization for check
        if (expectedVariants.includes(userAnswer)) {
            setStatus('correct');
            sounds.playSuccess();
            setFeedback('Верно!');

            // Speak the input (or first variant) in Finnish
            speak(userAnswer, 'fi-FI');
        } else {
            setStatus('incorrect');
            sounds.playWrong();
            setAttempts(prev => prev + 1);

            if (attempts >= 1) {
                setFeedback('Неверно. Попробуйте еще раз.');
            } else {
                setFeedback('Ошибка.');
            }

            // Return words to bank after delay? Or let user fix?
            // Let user fix manually.
            setTimeout(() => setStatus('idle'), 1000);
        }
    };

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const handleShowAnswer = () => {
        const firstExpected = (currentStep.expected_fi || [])[0];
        if (!firstExpected) return;

        // Return all currently selected words to bank first
        const allWords = [...availableWords, ...selectedWords];
        setSelectedWords([]);
        setAvailableWords(allWords); // Update state immediately for the next step

        // Find words to match the answer from the now combined list
        const words = firstExpected.split(/\s+/).filter(w => w.trim());
        const newSelected = [];
        let tempAvailable = [...allWords]; // Use the combined list for finding words

        words.forEach(wordStr => {
            const clean = wordStr.replace(/[.,!?]/g, '').toLowerCase();
            const foundIdx = tempAvailable.findIndex(v => v.text === clean);
            if (foundIdx !== -1) {
                newSelected.push(tempAvailable[foundIdx]);
                tempAvailable.splice(foundIdx, 1);
            }
        });

        setSelectedWords(newSelected);
        setAvailableWords(tempAvailable);
        setStatus('correct');
        sounds.playSuccess();
        setFeedback('Посмотрели ответ. Теперь можно идти дальше.');
        speak(firstExpected, 'fi-FI');
    };

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [currentStepIndex, feedback, status]);

    useEffect(() => {
        // Auto-play current step interlocutor audio when entering step
        // But only if theory is closed and we have audio
        if (!showTheory && currentStep && currentStep.interlocutor_fi) {
            speak(currentStep.interlocutor_fi, 'fi-FI');
        }
    }, [currentStepIndex, currentStep, showTheory]);

    const handleStart = () => {
        setShowTheory(false);
        // rely on useEffect to play audio when showTheory becomes false
    };

    if (!mounted || !currentStep) return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-900/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">

                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-gray-900/50 flex-shrink-0">
                    <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:text-white transition">
                        <X className="w-6 h-6" />
                    </button>
                    <div className="h-2 flex-1 mx-6 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300 ease-out"
                            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                        />
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                        {currentStepIndex + 1} / {steps.length}
                    </div>
                </div>

                {/* THEORY SCREEN */}
                {showTheory && situation.theory ? (
                    <div className="flex-1 overflow-y-auto p-8 flex flex-col">
                        <h2 className="text-3xl font-bold text-white mb-6">📝 Перед началом</h2>

                        {/* Separate Finnish Fact Block */}
                        {situation.finnish_fact && (
                            <div className="mb-6 p-5 bg-blue-900/20 border border-blue-800/50 rounded-2xl flex gap-4 items-start">
                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 flex-shrink-0">
                                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Знаете ли вы?</p>
                                    <p className="text-base text-gray-200 leading-relaxed italic">
                                        {situation.finnish_fact}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="prose prose-invert max-w-none text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                            {situation.theory}
                        </div>
                        <div className="mt-auto pt-8">
                            <button
                                onClick={handleStart}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                Начать <ArrowRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                ) : (
                    /* CHAT INTERFACE */
                    <>
                        {/* Chat History Body */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

                            {/* Render History */}
                            {steps.slice(0, currentStepIndex).map((step, idx) => (
                                <div key={`history-${idx}`} className="space-y-4 opacity-70 hover:opacity-100 transition-opacity">
                                    {/* AI Prompt (Interlocutor) */}
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                                            🤖
                                        </div>
                                        <div className="space-y-1 max-w-[85%]">
                                            <div className="bg-gray-800 p-4 pr-12 rounded-2xl rounded-tl-none border border-gray-700 relative group">
                                                {/* If interlocutor text exists, show it. Otherwise description/prompt */}
                                                <p className="text-white text-lg font-medium">{step.interlocutor_fi || step.description_ru || step.prompt_ru}</p>

                                                {/* Translation */}
                                                {(step.interlocutor_ru || (step.interlocutor_fi && step.prompt_ru)) && (
                                                    <p className="text-sm text-gray-400 mt-2 border-t border-gray-700 pt-2">
                                                        {step.interlocutor_ru || step.prompt_ru}
                                                    </p>
                                                )}

                                                {/* Play Button */}
                                                {step.interlocutor_fi && (
                                                    <button
                                                        onClick={() => speak(step.interlocutor_fi, 'fi-FI')}
                                                        className="absolute right-2 top-2 p-2 text-gray-500 hover:text-purple-400 opacity-0 group-hover:opacity-100 transition bg-gray-800/50 rounded-full"
                                                        title="Прослушать"
                                                    >
                                                        <Volume2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Answer (History) */}
                                    <div className="flex gap-3 flex-row-reverse">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                                            👤
                                        </div>
                                        <div className="space-y-1 max-w-[85%] text-right">
                                            <div className="bg-blue-900/20 p-4 pl-12 rounded-2xl rounded-tr-none border border-blue-900/30 relative group">
                                                <p className="text-white text-lg">{step.expected_fi[0]}</p>

                                                {/* Translation of user response: prioritize literal translation (expected_ru) */}
                                                <p className="text-sm text-blue-300/60 mt-2 border-t border-blue-900/30 pt-2 italic">
                                                    {step.expected_ru?.[0] || (`Инструкция: "${step.prompt_ru}"`)}
                                                </p>

                                                <button
                                                    onClick={() => speak(step.expected_fi[0], 'fi-FI')}
                                                    className="absolute left-2 top-2 p-2 text-gray-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition bg-gray-900/50 rounded-full"
                                                >
                                                    <Volume2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Current Step AI Prompt */}
                            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-4">
                                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-purple-500/30">
                                    🤖
                                </div>
                                <div className="space-y-1 max-w-[85%]">
                                    <div className="bg-gray-800 p-5 pr-16 rounded-2xl rounded-tl-none border border-gray-600 shadow-xl relative group">
                                        {/* Main Text: Interlocutor Finnish or Instruction */}
                                        <p className="text-xl md:text-2xl text-white font-medium leading-relaxed">
                                            {currentStep.interlocutor_fi || currentStep.prompt_ru}
                                        </p>

                                        {/* Translation / Instruction */}
                                        <div className="mt-3 pt-3 border-t border-gray-700">
                                            {currentStep.interlocutor_fi ? (
                                                <>
                                                    <p className="text-gray-400 italic mb-1">{currentStep.interlocutor_ru}</p>
                                                    <p className="text-blue-300 font-medium text-sm">👇 {currentStep.prompt_ru}</p>
                                                </>
                                            ) : (
                                                <p className="text-sm text-gray-500">Перевод не требуется</p>
                                            )}
                                        </div>

                                        {/* Controls */}
                                        {currentStep.interlocutor_fi && (
                                            <button
                                                onClick={() => speak(currentStep.interlocutor_fi, 'fi-FI')}
                                                className="absolute right-3 top-3 p-2.5 text-purple-400 hover:text-purple-300 transition bg-purple-500/10 rounded-xl"
                                            >
                                                <Volume2 className="w-6 h-6" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Dummy div to scroll to */}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>

                        {/* Interaction Area (Answer & Word Bank) */}
                        <div className="bg-gray-900/50 border-t border-gray-800 p-4 shrink-0 flex flex-col items-center relative">
                            {/* Hint Overlay (Now as a pop-up above the interaction area) */}
                            {showHint && currentStep.hint_ru && (
                                <div className="absolute bottom-full left-4 right-4 mb-4 bg-blue-900/90 backdrop-blur-md border border-blue-500/50 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-2 duration-200 z-10">
                                    <div className="flex items-start gap-3 text-white">
                                        <div className="bg-blue-500/20 p-2 rounded-lg">
                                            <HelpCircle className="w-5 h-5 text-blue-300" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-xs mb-1 uppercase tracking-widest text-blue-300 opacity-80">Совет от учителя</p>
                                            <p className="text-lg leading-snug">{currentStep.hint_ru}</p>
                                        </div>
                                        <button onClick={() => setShowHint(false)} className="p-1 hover:bg-white/10 rounded-lg transition">
                                            <X className="w-5 h-5 text-blue-200" />
                                        </button>
                                    </div>
                                    {/* Arrow pointing down */}
                                    <div className="absolute -bottom-2 left-10 w-4 h-4 bg-blue-900/90 border-r border-b border-blue-500/50 rotate-45 transform"></div>
                                </div>
                            )}

                            {/* Answer Area (Selected Words) */}
                            <div className="w-full max-w-lg min-h-[60px] mb-4 relative">
                                {selectedWords.length > 0 && status !== 'correct' && (
                                    <button
                                        onClick={handleClearAll}
                                        className="absolute right-0 -top-8 text-xs text-gray-500 hover:text-red-400 flex items-center gap-1 transition uppercase font-bold tracking-wider"
                                    >
                                        <RotateCcw className="w-3 h-3" /> Очистить
                                    </button>
                                )}

                                <div className={`w-full min-h-[50px] p-2 border-b-2 transition-colors flex flex-wrap gap-2 items-end
                                    ${status === 'correct' ? 'border-green-500' :
                                        status === 'incorrect' ? 'border-red-500' : 'border-gray-700'}`}
                                >
                                    {selectedWords.map((word) => (
                                        <button
                                            key={`sel-${word.id}`}
                                            onClick={() => handleWordClick(word, false)}
                                            className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 px-3 py-1.5 rounded-lg text-lg font-medium shadow-sm transition animate-in zoom-in-50 duration-200"
                                        >
                                            {word.original}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Word Bank (Available Words) */}
                            <div className="w-full max-w-lg flex flex-wrap gap-2 justify-center mb-2 min-h-[60px]">
                                {availableWords.map((word) => (
                                    <button
                                        key={`avail-${word.id}`}
                                        onClick={() => handleWordClick(word, true)}
                                        className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 px-3 py-1.5 rounded-lg text-lg font-medium shadow-sm transition transform active:scale-95"
                                    >
                                        {word.original}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Footer Controls */}
                <div className={`p-4 md:p-6 border-t border-gray-800 bg-gray-900/50 transition-colors
                    ${status === 'correct' ? 'bg-green-900/20 border-green-900/30' :
                        status === 'incorrect' ? 'bg-red-900/20 border-red-900/30' : ''}`}
                >
                    <div className="max-w-lg mx-auto flex items-center gap-4">
                        {status === 'idle' || status === 'incorrect' ? (
                            <>
                                <button
                                    onClick={() => setShowHint(prev => !prev)}
                                    className={`p-4 rounded-xl transition ${showHint ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
                                    title={showHint ? "Скрыть подсказку" : "Показать подсказку"}
                                >
                                    <HelpCircle className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={() => speak(currentStep.expected_fi[0], 'fi-FI')}
                                    className="p-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-blue-400 transition shadow-sm flex items-center gap-2 font-bold px-6"
                                    title="Прослушать ответ на финском"
                                >
                                    <Volume2 className="w-6 h-6" /> 🇫🇮
                                </button>
                                <button
                                    onClick={checkAnswer}
                                    disabled={selectedWords.length === 0}
                                    className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 transition transform active:scale-[0.98]"
                                >
                                    Проверить
                                </button>
                                {status !== 'correct' && (
                                    <button
                                        onClick={handleShowAnswer}
                                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-500 hover:text-gray-400 text-sm font-bold py-3.5 rounded-xl transition border border-gray-700 flex items-center justify-center gap-2"
                                        title="Подсмотреть ответ и продолжить"
                                    >
                                        <ArrowRight className="w-4 h-4" /> Пропустить
                                    </button>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="flex-1 bg-green-600 hover:bg-green-500 text-white text-lg font-bold py-3.5 rounded-xl shadow-lg shadow-green-900/20 transition transform active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {currentStepIndex < steps.length - 1 ? 'Дальше' : 'Завершить'} <ArrowRight className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
