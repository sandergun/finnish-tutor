'use client';

import { useState } from 'react';
import MiniTestBlock from './MiniTestBlock';
import MiniDialogueBlock from './MiniDialogueBlock';
import ExercisesBlock from './ExercisesBlock';

export default function FinalExamBlock({ tasks, onNext, onResult, isIntensiveMode }) {
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

    const handlePrevTask = () => {
        if (currentTaskIndex > 0) {
            setCurrentTaskIndex(currentTaskIndex - 1);
        } else {
            // Optional: confirm exit or just do nothing (since it's exam)
            // For now, let's just stay on first task or maybe call a parent onBack if we adds one later.
        }
    };

    const handleNextTask = () => {
        if (currentTaskIndex < tasks.length - 1) {
            setCurrentTaskIndex(currentTaskIndex + 1);
        } else {
            onNext();
        }
    };

    if (!tasks || tasks.length === 0) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Экзамен завершен!</h2>
                <button onClick={onNext} className="bg-blue-600 text-white px-6 py-3 rounded-xl">
                    Посмотреть результаты
                </button>
            </div>
        );
    }

    const currentTask = tasks[currentTaskIndex];

    return (
        <div className="w-full h-full flex flex-col">
            <div className="mb-3 sm:mb-4 text-center">
                <span className="text-[10px] sm:text-sm font-bold text-purple-500 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full">
                    Экзамен • {currentTaskIndex + 1} / {tasks.length}
                </span>
            </div>

            {currentTask.type === 'question' && (
                <WrappedQuestionTask question={currentTask.data} onNext={handleNextTask} onBack={handlePrevTask} onResult={onResult} isIntensiveMode={isIntensiveMode} />
            )}

            {currentTask.type === 'dialogue' && (
                <MiniDialogueBlock dialogue={currentTask.data} onNext={handleNextTask} onBack={handlePrevTask} onResult={onResult} />
            )}
        </div>
    );
}

// Wrapper to adapt single question to blocks that expect arrays or specific props
function WrappedQuestionTask({ question, onNext, onBack, onResult, isIntensiveMode }) {
    // Map question types to blocks
    // 'choice', 'audio-choice' -> MiniTestBlock (expects array of questions)
    // 'translate', 'fill-in', 'fill-in-choice' -> ExercisesBlock (expects single question)

    if (['choice', 'audio-choice'].includes(question.type) || !question.type) {
        return (
            <MiniTestBlock
                questions={[question]}
                onNext={onNext}
                onBack={onBack}
                onResult={onResult}
                isIntensiveMode={isIntensiveMode}
            />
        );
    }

    if (['translate', 'fill-in', 'fill-in-choice'].includes(question.type)) {
        return (
            <ExercisesBlock
                question={question}
                allWords={question.allWordsRef || []}
                onNext={onNext}
                onBack={onBack}
                onResult={onResult}
                isIntensiveMode={isIntensiveMode}
            />
        );
    }

    return <div>Unknown question type: {question.type}</div>;
}

