"use client";
import { useEffect, useState } from "react";
import { useAchievementsStore } from "@/store/useAchievementsStore";
import { ACHIEVEMENTS } from "@/lib/achievements";

export default function AchievementPopup() {
    const [popup, setPopup] = useState(null);
    const achievements = useAchievementsStore((state) => state.achievements);

    useEffect(() => {
        const lastAchievement = achievements.find((a) => a.earned);
        if (lastAchievement) {
            const achievementData = ACHIEVEMENTS[lastAchievement.id];
            if (achievementData) {
                setPopup(achievementData);
                setTimeout(() => {
                    setPopup(null);
                }, 3000);
            }
        }
    }, [achievements]);

    if (!popup) {
        return null;
    }

    return (
        <div className="fixed bottom-16 right-4 bg-white p-4 rounded-lg shadow-lg flex items-center">
            <div className="text-4xl">{popup.icon}</div>
            <div className="ml-4">
                <div className="font-bold">{popup.name}</div>
                <div className="text-sm text-gray-600">
                    +{popup.points} points
                </div>
            </div>
        </div>
    );
}
