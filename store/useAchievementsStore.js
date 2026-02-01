"use client";
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "./useUserStore";
import { ACHIEVEMENTS } from "@/lib/achievements";

export const useAchievementsStore = create((set, get) => ({
    achievements: [],
    loading: true,
    lastEarned: null,

    clearLastEarned: () => set({ lastEarned: null }),

    loadAchievements: async (telegramId) => {
        set({ loading: true });

        const { data: earnedAchievements, error } = await supabase
            .from("user_achievements")
            .select("achievement_id")
            .eq("telegram_id", telegramId);

        if (error) {
            set({ loading: false });
            return;
        }

        const earnedIds = earnedAchievements.map((a) => a.achievement_id);
        const allAchievements = Object.values(ACHIEVEMENTS).map(
            (achievement) => ({
                ...achievement,
                earned: earnedIds.includes(achievement.id),
            })
        );

        set({ achievements: allAchievements, loading: false });
    },

    checkForNewAchievements: async (userData, progressData) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const earnedAchievements = get().achievements.filter((a) => a.earned);

        for (const achievement of Object.values(ACHIEVEMENTS)) {
            if (earnedAchievements.find((a) => a.id === achievement.id)) {
                continue;
            }

            let earned = false;
            switch (achievement.id) {
                case "first_lesson":
                    if (user.total_lessons >= 1) earned = true;
                    break;
                case "three_days_streak":
                    if (user.streak >= 3) earned = true;
                    break;
                case "week_streak":
                    if (user.streak >= 7) earned = true;
                    break;
                case "month_streak":
                    if (user.streak >= 30) earned = true;
                    break;
                case "word_master_50":
                    if (user.total_words >= 50) earned = true;
                    break;
                case "word_master_100":
                    if (user.total_words >= 100) earned = true;
                    break;
                case "perfect_score":
                    if (progressData.score === 100) earned = true;
                    break;
                case "five_perfect":
                    const perfectScores = useUserStore
                        .getState()
                        .fullProgress.filter((p) => p.score === 100).length;
                    if (perfectScores >= 5) earned = true;
                    break;
                case "early_bird":
                    if (new Date().getHours() < 9) earned = true;
                    break;
                case "night_owl":
                    if (new Date().getHours() >= 23) earned = true;
                    break;
            }

            if (earned) {
                await get().grantAchievement(user.telegram_id, achievement.id);
            }
        }
    },

    grantAchievement: async (telegramId, achievementId) => {
        const { data, error } = await supabase
            .from("user_achievements")
            .insert([
                {
                    telegram_id: telegramId,
                    achievement_id: achievementId,
                },
            ]);

        if (error) {
            return;
        }
        
        const achievement = ACHIEVEMENTS[achievementId];

        set((state) => ({
            achievements: state.achievements.map((a) =>
                a.id === achievementId ? { ...a, earned: true } : a
            ),
            lastEarned: achievement,
        }));

        if (achievement) {
            const user = useUserStore.getState().user;
            await useUserStore.getState().updateProfile({
                points: (user.points || 0) + achievement.points,
            });
        }
    },
}));
