"use client";
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
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

    checkForNewAchievements: async (user, allProgressData, situationProgress = []) => {
        if (!user) return 0;
        const telegramId = user.telegram_id; // Strictly use telegram_id (BIGINT)
        if (!telegramId) return 0;

        console.log(`🏆 Checking achievements for user ${telegramId}...`);

        const earnedAchievements = get().achievements.filter((a) => a.earned);
        let totalNewPoints = 0;

        const checkAchievement = async (achievementId, condition) => {
            const achievement = ACHIEVEMENTS[achievementId];
            if (!achievement) return;

            // Check if already earned
            const isEarned = earnedAchievements.some(a => a.id === achievementId) ||
                get().achievements.some(a => a.id === achievementId && a.earned);

            if (condition && !isEarned) {
                console.log(`✨ Granting achievement: ${achievementId}`);
                const points = await get().grantAchievement(telegramId, achievementId);
                totalNewPoints += points;
            }
        };

        const currentHour = new Date().getHours();
        const currentDay = new Date().getDay();
        const userXP = user.points || 0;
        const hasActivity = true;

        // --- STREAKS ---
        const streakTiers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 150, 180, 200, 250, 300, 365, 400];
        for (const s of streakTiers) {
            await checkAchievement(`streak_${s}`, user.streak >= s);
        }
        await checkAchievement("three_days_streak", user.streak >= 3);
        await checkAchievement("week_streak", user.streak >= 7);
        await checkAchievement("month_streak", user.streak >= 30);

        // --- LESSONS ---
        const lessonTiers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32, 34, 35, 36, 37, 38, 39, 41, 42, 43, 44, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 67, 68, 69, 70, 75, 80, 88, 90, 95, 100, 125, 128, 150, 175, 200, 250, 256, 300, 400, 500, 600, 700, 800, 900, 1000];
        for (const l of lessonTiers) {
            await checkAchievement(`lessons_${l}`, user.total_lessons >= l);
            await checkAchievement(`lesson_${l}`, user.total_lessons >= l);
        }
        await checkAchievement("first_lesson", user.total_lessons >= 1);

        // --- WORDS ---
        const wordTiers = [5, 10, 25, 50, 100, 101, 111, 125, 150, 175, 200, 202, 222, 225, 250, 275, 300, 303, 333, 350, 400, 404, 444, 450, 500, 505, 555, 600, 666, 750, 800, 900, 999, 1000, 1500, 2000, 2500, 5000];
        for (const w of wordTiers) {
            await checkAchievement(`words_${w}`, user.total_words >= w);
        }
        await checkAchievement("word_master_50", user.total_words >= 50);
        await checkAchievement("word_master_100", user.total_words >= 100);

        // --- XP / POINTS ---
        const xpTiers = [60, 70, 80, 90, 100, 110, 120, 130, 140, 160, 170, 180, 190, 250, 500, 750, 1000, 1100, 1300, 1700, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3500, 4000, 4500, 5000, 5500, 6500, 7500, 8500, 9500, 10000, 15000, 20000, 30000, 50000, 75000];
        for (const x of xpTiers) {
            await checkAchievement(`xp_${x}`, userXP >= x);
        }
        await checkAchievement("xp_1200_new", userXP >= 1200);
        await checkAchievement("xp_1400_new", userXP >= 1400);
        await checkAchievement("xp_1600_new", userXP >= 1600);
        await checkAchievement("xp_1800_new", userXP >= 1800);

        // --- PERFECT ---
        const perfectCount = (allProgressData || []).filter(p => p.score === 100).length;
        const perfectTiers = [1, 3, 5, 10, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 30, 40, 50, 75];
        for (const p of perfectTiers) {
            await checkAchievement(`perfect_${p}`, perfectCount >= p);
        }
        await checkAchievement("perfect_score", perfectCount >= 1);
        await checkAchievement("five_perfect", perfectCount >= 5);

        // --- SITUATIONS ---
        const sitProgress = situationProgress || [];
        const completedSits = sitProgress.filter(p => p.completed);
        const totalSitCompletions = completedSits.length;
        const uniqueSits = new Set(completedSits.map(p => p.situation_id));
        const uniqueSitCount = uniqueSits.size;

        console.log(`📊 Situations progress: ${totalSitCompletions} total, ${uniqueSitCount} unique`);

        const sitTotalTiers = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100];
        for (const tier of sitTotalTiers) {
            await checkAchievement(`sit_total_${tier}`, totalSitCompletions >= tier);
        }

        const sitVarietyTiers = [1, 5, 10, 15, 20, 25, 30];
        for (const tier of sitVarietyTiers) {
            const req = (tier === 1 ? 3 : tier);
            await checkAchievement(`sit_variety_${tier}`, uniqueSitCount >= req);
        }

        await checkAchievement("sit_morning", currentHour < 10 && hasActivity);
        await checkAchievement("sit_night", currentHour >= 22 && hasActivity);

        const sitXP = totalSitCompletions * 20;
        await checkAchievement("sit_points_100", sitXP >= 100);
        await checkAchievement("sit_points_500", sitXP >= 500);
        await checkAchievement("sit_points_1000", sitXP >= 1000);

        // --- RANDOM WORDS (50) ---
        const rndCompleted = (allProgressData || []).filter(p => p.lesson_id?.startsWith('random-words-') && p.completed);
        const rndCount = rndCompleted.length;
        console.log(`📊 Random words progress: ${rndCount} completed lessons`);
        for (let i = 1; i <= 50; i++) {
            await checkAchievement(`rnd_total_${i}`, rndCount >= i);
        }

        // --- INTENSIVE TRAINING (50) ---
        const intCompleted = (allProgressData || []).filter(p => p.lesson_id?.startsWith('intensive-') && p.completed);
        const intCount = intCompleted.length;
        console.log(`📊 Intensive progress: ${intCount} completed lessons`);
        for (let i = 1; i <= 50; i++) {
            await checkAchievement(`int_total_${i}`, intCount >= i);
        }

        // --- COLLECTOR ---
        const earnedCountNow = get().achievements.filter(a => a.earned).length;
        const collectorTiers = [{ id: 'collector_1', count: 10 }, { id: 'collector_2', count: 25 }, { id: 'collector_3', count: 50 }, { id: 'collector_4', count: 100 }, { id: 'collector_5', count: 200 }, { id: 'collector_6', count: 150 }, { id: 'collector_7', count: 250 }];
        for (const c of collectorTiers) {
            await checkAchievement(c.id, earnedCountNow >= c.count);
        }

        // --- TIME / SPECIAL ---
        await checkAchievement("early_bird", currentHour < 9 && hasActivity);
        await checkAchievement("night_owl", currentHour >= 23 && hasActivity);
        await checkAchievement("lunch_learner", currentHour >= 13 && currentHour < 14 && hasActivity);
        await checkAchievement("weekend_warrior", (currentDay === 0 || currentDay === 6) && hasActivity);
        await checkAchievement("morning_coffee", currentHour >= 6 && currentHour < 8 && hasActivity);
        await checkAchievement("lunch_break_late", currentHour >= 14 && currentHour < 15 && hasActivity);
        await checkAchievement("after_work", currentHour >= 17 && currentHour < 19 && hasActivity);
        await checkAchievement("monday_motivation", currentDay === 1 && hasActivity);
        await checkAchievement("friday_fun", currentDay === 5 && hasActivity);
        await checkAchievement("siesta", currentHour >= 14 && currentHour < 16 && hasActivity);
        await checkAchievement("sunset", currentHour >= 19 && currentHour < 20 && hasActivity);
        await checkAchievement("midnight", (currentHour >= 23 || currentHour === 0) && hasActivity);

        return totalNewPoints;
    },

    grantAchievement: async (telegramId, achievementId) => {
        const { error } = await supabase
            .from("user_achievements")
            .insert([{ telegram_id: telegramId, achievement_id: achievementId }]);

        if (error) {
            if (error.code === '23505') return 0;
            console.error("Error granting achievement:", error);
            return 0;
        }

        const achievement = ACHIEVEMENTS[achievementId];
        set((state) => ({
            achievements: state.achievements.map((a) =>
                a.id === achievementId ? { ...a, earned: true } : a
            ),
            lastEarned: achievement,
        }));

        return achievement ? achievement.points : 0;
    },
}));
