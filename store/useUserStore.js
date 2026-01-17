"use client";
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { useAchievementsStore } from "./useAchievementsStore";

export const useUserStore = create((set, get) => ({
    user: null,
    loading: true,
    completedLessons: [],
    fullProgress: [],

    loadUser: async (telegramId) => {
        set({ loading: true });

        try {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("telegram_id", telegramId)
                .maybeSingle();

            if (error) {
                set({ user: null, loading: false, fullProgress: [] });
                return null;
            }

            if (data) {
                const { data: completedProgress } = await supabase
                    .from("progress")
                    .select("lesson_id")
                    .eq("telegram_id", data.telegram_id)
                    .eq("completed", true);

                const { data: fullProgressData } = await supabase
                    .from("progress")
                    .select("*")
                    .eq("telegram_id", data.telegram_id);

                set({
                    user: data,
                    loading: false,
                    completedLessons: completedProgress
                        ? completedProgress.map((p) => p.lesson_id)
                        : [],
                    fullProgress: fullProgressData || [],
                });
            } else {
                set({
                    user: null,
                    loading: false,
                    completedLessons: [],
                    fullProgress: [],
                });
            }

            return data;
        } catch (error) {
            set({ user: null, loading: false, fullProgress: [] });
            return null;
        }
    },

    createUser: async (telegramId, name = "Пользователь") => {
        try {
            const { data: existing, error: checkError } = await supabase
                .from("users")
                .select("*")
                .eq("telegram_id", telegramId)
                .maybeSingle();

            if (existing) {
                set({ user: existing, loading: false });
                return existing;
            }

            if (checkError && checkError.code !== "PGRST116") {
                throw checkError;
            }

            const { data, error } = await supabase
                .from("users")
                .insert([
                    {
                        telegram_id: telegramId,
                        name: name,
                        level: "A0",
                        streak: 0,
                        total_lessons: 0,
                        total_words: 0,
                        points: 0,
                    },
                ])
                .select()
                .single();

            if (error) {
                if (error.code === "23505") {
                    const { data: existingUser, error: fetchError } =
                        await supabase
                            .from("users")
                            .select("*")
                            .eq("telegram_id", telegramId)
                            .single();

                    if (fetchError) {
                        throw fetchError;
                    }

                    if (existingUser) {
                        set({ user: existingUser, loading: false });
                        return existingUser;
                    }
                }

                throw error;
            }

            set({ user: data, loading: false });
            return data;
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    updateProfile: async (updates) => {
        const user = get().user;
        if (!user) {
            return null;
        }

        const { data, error } = await supabase
            .from("users")
            .update(updates)
            .eq("telegram_id", user.telegram_id)
            .select()
            .single();

        if (error) {
            return null;
        }

        set({ user: data });
        return data;
    },

    saveProgress: async (lessonData) => {
        const user = get().user;
        if (!user || !user.telegram_id) {
            return null;
        }

        try {
            const { data: existing } = await supabase
                .from("progress")
                .select("lesson_id")
                .eq("telegram_id", user.telegram_id)
                .eq("lesson_id", lessonData.lessonId)
                .maybeSingle();

            const progressData = {
                telegram_id: user.telegram_id,
                lesson_id: lessonData.lessonId,
                score: lessonData.score,
                completed: lessonData.score >= 70,
                completed_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from("progress")
                .upsert(progressData);

            if (error) throw error;

            const newTotalLessons =
                lessonData.score >= 70
                    ? user.total_lessons + (existing ? 0 : 1)
                    : user.total_lessons;

            const newTotalWords =
                user.total_words + (lessonData.newWords || 0);

            await get().updateProfile({
                total_lessons: newTotalLessons,
                total_words: newTotalWords,
                last_active: new Date().toISOString(),
            });

            if (lessonData.score >= 70) {
                const completedLessons = get().completedLessons;
                if (!completedLessons.includes(lessonData.lessonId)) {
                    set({
                        completedLessons: [
                            ...completedLessons,
                            lessonData.lessonId,
                        ],
                    });
                }
            }

            await useAchievementsStore
                .getState()
                .checkForNewAchievements(get().user, progressData);

            return true;
        } catch (error) {
            return false;
        }
    },

    isLessonCompleted: (lessonId) => {
        const completedLessons = get().completedLessons;
        return completedLessons.includes(lessonId);
    },
}));