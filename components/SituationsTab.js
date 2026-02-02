'use client';
import { useState, useEffect } from 'react';
import { Play, CheckCircle, Clock } from 'lucide-react';
import SituationPlayer from './SituationPlayer';
import { useUserStore } from '@/store/useUserStore';
import { useAchievementsStore } from '@/store/useAchievementsStore';

// Actually I don't see sonner installed, checking package.json would be good but I'll stick to store updates for now.
// Checking previously viewed files... AdminPanel doesn't seem to import toast.
// I'll skip toast import and just use the AchievementPopup component which is in Dashboard.

export default function SituationsTab({ darkMode }) {
    const { situations, situationProgress, loadSituations, loadSituationProgress, saveSituationProgress, user, progressData } = useUserStore();
    const { checkForNewAchievements } = useAchievementsStore();
    const [activeSituation, setActiveSituation] = useState(null);

    useEffect(() => {
        loadSituations();
        loadSituationProgress();
    }, [loadSituations, loadSituationProgress]);

    const cardClass = darkMode
        ? 'bg-gray-800/50 border-gray-700 hover:border-purple-500'
        : 'bg-white/70 border-gray-200 hover:shadow-xl hover:border-purple-300';

    const textClass = darkMode ? 'text-white' : 'text-gray-800';
    const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-600';

    const getProgress = (situationId) => {
        return situationProgress.find(p => p.situation_id === situationId);
    };

    const handleStart = (situation) => {
        const progress = getProgress(situation.id);
        // Determine start step: if completed, step 1 (replay), else current_step
        // But user might want to continue.
        // Let's pass the saved step.
        const startStep = progress && !progress.completed ? progress.current_step : 1;

        setActiveSituation({ ...situation, startStep });
    };

    const handleComplete = async () => {
        if (activeSituation) {
            await saveSituationProgress(activeSituation.id, activeSituation.steps.length, true);

            // Check for achievements immediately
            await checkForNewAchievements(user, progressData, situationProgress);

            setActiveSituation(null);
        }
    };

    if (activeSituation) {
        return (
            <SituationPlayer
                situation={activeSituation}
                initialStep={activeSituation.startStep}
                onClose={() => setActiveSituation(null)}
                onComplete={handleComplete}
            />
        );
    }

    return (
        <div className="pt-6 px-6 pb-24">
            <div className="mb-8">
                <h2 className={`text-3xl font-bold ${textClass} mb-2`}>Ситуации</h2>
                <p className={textSecondaryClass}>Практика реальных жизненных сценариев</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {situations.map(situation => {
                    const progress = getProgress(situation.id);
                    const isCompleted = progress?.completed;
                    const isStarted = progress && !isCompleted;

                    return (
                        <div key={situation.id} className={`${cardClass} backdrop-blur-sm rounded-2xl p-5 border-2 transition-all hover:scale-[1.01]`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs font-bold px-2 py-1 rounded bg-purple-500/20 text-purple-300 mb-2 inline-block">
                                        {situation.level || 'A1'}
                                    </span>
                                    <h3 className={`text-xl font-bold ${textClass}`}>{situation.title}</h3>
                                    <p className={`text-sm ${textSecondaryClass} mt-1`}>{situation.description_ru}</p>
                                </div>
                                {isCompleted && <CheckCircle className="text-green-500 w-6 h-6" />}
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm font-medium text-gray-500">
                                    {situation.steps.length} шагов
                                </div>
                                <button
                                    onClick={() => handleStart(situation)}
                                    className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition
                                ${isCompleted
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105 shadow-lg'
                                        }`}
                                >
                                    <Play className="w-4 h-4" />
                                    {isCompleted ? 'Повторить' : isStarted ? 'Продолжить' : 'Начать'}
                                </button>
                            </div>

                            {isStarted && (
                                <div className="mt-3 w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-yellow-500 h-full"
                                        style={{ width: `${(progress.current_step / situation.steps.length) * 100}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}

                {situations.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-700">
                        <p className="text-gray-400">Ситуаций пока нет. Загляните в Админку!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
