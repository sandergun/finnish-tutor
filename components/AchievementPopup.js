"use client";
import { useEffect, useState } from "react";
import { useAchievementsStore } from "@/store/useAchievementsStore";
import { Trophy } from "lucide-react";

export default function AchievementPopup() {
    const lastEarned = useAchievementsStore((state) => state.lastEarned);
    const clearLastEarned = useAchievementsStore((state) => state.clearLastEarned);
    const [isVisible, setIsVisible] = useState(false);
    const [popupData, setPopupData] = useState(null);

    useEffect(() => {
        if (lastEarned) {
            setPopupData(lastEarned);
            setIsVisible(true);

            const visibilityTimer = setTimeout(() => {
                setIsVisible(false);
            }, 4000); // Visible for 4 seconds

            const clearTimer = setTimeout(() => {
                clearLastEarned();
                setPopupData(null);
            }, 4500); // Clears after fade-out animation (500ms)

            return () => {
                clearTimeout(visibilityTimer);
                clearTimeout(clearTimer);
            };
        }
    }, [lastEarned, clearLastEarned]);

    if (!popupData) {
        return null;
    }

    return (
        <div 
            className={`fixed bottom-6 right-6 w-80 bg-gray-800 text-white p-4 rounded-xl shadow-2xl flex items-start gap-4 transform transition-all duration-500 ease-in-out
                ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`
            }
            style={{ zIndex: 1000 }}
        >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                 <Trophy className="w-7 h-7 text-yellow-400" />
            </div>
            <div className="flex-1">
                <div className="font-bold text-base leading-tight">Новое достижение!</div>
                <div className="text-sm text-gray-300 mt-1">
                    «{popupData.name}»
                </div>
            </div>
        </div>
    );
}