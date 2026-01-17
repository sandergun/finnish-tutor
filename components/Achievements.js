"use client";
import { useAchievementsStore } from "@/store/useAchievementsStore";
import { Loader2 } from "lucide-react";

export default function Achievements({ darkMode }) {
    const achievements = useAchievementsStore((state) => state.achievements);
    const loading = useAchievementsStore((state) => state.loading);

    const sortedAchievements = [...achievements].sort((a, b) => {
        if (a.earned === b.earned) return a.points - b.points;
        return a.earned ? -1 : 1;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-6 text-center`}>
                🏆 Достижения
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedAchievements.map(ach => {
                    const isUnlocked = ach.earned;
                    return (
                        <div
                            key={ach.id}
                            className={`rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-300 ${
                                isUnlocked
                                    ? (darkMode ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-100/70 border-yellow-300')
                                    : (darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200')
                            } border-2`}
                            style={isUnlocked ? {
                                boxShadow: '0 0 15px rgba(250, 204, 21, 0.3)',
                                transform: 'scale(1.02)'
                            } : {}}
                        >
                            <div
                                className={`text-5xl mb-3 transition-transform duration-300 ${isUnlocked ? '' : 'grayscale'}`}
                            >
                                {ach.icon}
                            </div>
                            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'} ${!isUnlocked && (darkMode ? 'opacity-50' : 'opacity-60')}`}>
                                {ach.name}
                            </h3>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'} ${!isUnlocked && 'opacity-50'}`}>
                                {ach.description}
                            </p>
                            <p className={`text-sm font-bold mt-2 ${
                                isUnlocked
                                    ? (darkMode ? 'text-yellow-400' : 'text-yellow-600')
                                    : (darkMode ? 'text-gray-600' : 'text-gray-400')
                            }`}>
                                + {ach.points} XP
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
