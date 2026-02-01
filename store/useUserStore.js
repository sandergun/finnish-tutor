"use client";
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { useAchievementsStore } from "./useAchievementsStore";

export const useUserStore = create((set, get) => ({
    user: null,
    loading: true,
    completedLessons: [],
    progressData: [],

    login: (user) => {
        set({ user });
    },

    logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, completedLessons: [], progressData: [] });
    },

    loadUser: async (id, name) => {
        if (!id) {
            set({ user: null, loading: false, progressData: [] });
            return null;
        }
        set({ loading: true });
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_id', id)
                .single();

            if (error) {
                // If user not found, create it
                if (error.code === 'PGRST116') {
                    const newUser = await get().createUser(id, name);
                    return newUser;
                }
                console.error('❌ Error loading user:', error);
                set({ user: null, loading: false, progressData: [] });
                return null;
            }

            if (data) {
                const { data: progress, error: progressError } = await supabase
                    .from('progress')
                    .select('*')
                    .eq('user_id', data.id)
                    .order('completed_at', { ascending: true });

                if (progressError) {
                    // Not a critical error, maybe the user has no progress yet.
                }

                // Update streak on login
                // NOTE: We only update last_active here, NOT the streak.
                // Streak is ONLY updated in saveProgress when a lesson is completed.
                // This prevents the bug where refreshing the page adds +1 to streak.
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                let updatedUser = data;

                // Only update last_active if it's a new day (to track daily activity)
                // But do NOT increment streak here
                if (data.last_active) {
                    const lastActiveDate = new Date(data.last_active).toDateString();
                    const todayDate = new Date().toDateString();

                    if (lastActiveDate !== todayDate) {
                        // Update last_active to today, but don't touch streak
                        const { data: updated, error: updateError } = await supabase
                            .from('users')
                            .update({ last_active: new Date().toISOString() })
                            .eq('telegram_id', id)
                            .select()
                            .single();

                        if (updateError) {
                            console.error('Error updating last_active:', JSON.stringify(updateError));
                        } else if (updated) {
                            updatedUser = updated;
                            console.log('Updated last_active for new day (streak unchanged)');
                        }
                    }
                } else {
                    // First login ever - set last_active and initial streak
                    const { data: updated } = await supabase
                        .from('users')
                        .update({ streak: 1, last_active: new Date().toISOString() })
                        .eq('telegram_id', id)
                        .select()
                        .single();
                    if (updated) updatedUser = updated;
                }

                set({
                    user: updatedUser,
                    loading: false,
                    completedLessons: progress ? progress.filter(p => p.completed).map(p => p.lesson_id) : [],
                    progressData: progress || []
                });
            } else {
                const newUser = await get().createUser(id, name);
                return newUser;
            }
            return data;
        } catch (error) {
            console.error('❌ CATCH Error loading user:', error);
            set({ user: null, loading: false, progressData: [] });
            return null;
        }
    },

    createUser: async (id, name) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .insert([{
                    telegram_id: id,
                    name: name,
                    level: 'A0',
                    streak: 0,
                    total_lessons: 0,
                    total_words: 0,
                    points: 0,
                }])
                .select()
                .single();

            if (error) throw error;

            set({ user: data, loading: false, completedLessons: [], progressData: [] });
            return data;
        } catch (error) {
            console.error('❌ Error creating user. Raw object:', error);
            console.error('❌ Error creating user. Message:', error.message);
            console.error('❌ Error creating user. Details:', error.details);
            console.error('❌ Error creating user. Hint:', error.hint);
            console.error('❌ Error creating user. Code:', error.code);

            // If user already exists, load it
            if (error.code === '23505') {
                const { data: existingUser, error: fetchError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('telegram_id', id)
                    .single();
                if (fetchError) throw fetchError;
                if (existingUser) {
                    set({ user: existingUser, loading: false });
                    return existingUser;
                }
            }
            set({ loading: false });
            return null;
        }
    },

    updateProfile: async (updates) => {
        const user = get().user;
        if (!user) return null;


        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('telegram_id', user.telegram_id)
            .select()
            .single();

        if (error) {
            console.error('❌ Error updating profile:', error);
            return null;
        }

        set({ user: data });
        return data;
    },

    saveProgress: async (lessonData) => {
        const user = get().user;
        if (!user || !user.id) return null;

        try {
            const progressDataToSave = {
                user_id: user.id,
                lesson_id: lessonData.lessonId,
                score: lessonData.score,
                completed: lessonData.score >= 70,
                completed_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('progress').upsert(progressDataToSave, { onConflict: ['user_id', 'lesson_id'] });

            if (error) throw error;

            let newTotalLessons = user.total_lessons;
            if (lessonData.score >= 70) {
                const { data: existing } = await supabase
                    .from('progress')
                    .select("lesson_id")
                    .eq("user_id", user.id)
                    .eq("lesson_id", lessonData.lessonId)
                    .maybeSingle();

                if (!existing) {
                    newTotalLessons++;
                }
            }

            const newTotalWords = user.total_words + (lessonData.newWords || 0);

            // Calculate new streak based on last_active date
            let newStreak = user.streak || 0;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (user.last_active) {
                const lastActive = new Date(user.last_active);
                lastActive.setHours(0, 0, 0, 0);

                const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

                if (diffDays === 0) {
                    // Already active today, keep streak
                } else if (diffDays === 1) {
                    // Was active yesterday, increment streak
                    newStreak = newStreak + 1;
                } else {
                    // Gap in activity, reset streak
                    newStreak = 1;
                }
            } else {
                // First time activity
                newStreak = 1;
            }

            await get().updateProfile({
                total_lessons: newTotalLessons,
                total_words: newTotalWords,
                streak: newStreak,
                last_active: new Date().toISOString(),
            });

            if (lessonData.score >= 70) {
                const completedLessons = get().completedLessons;
                if (!completedLessons.includes(lessonData.lessonId)) {
                    set({
                        completedLessons: [...completedLessons, lessonData.lessonId],
                    });
                }
            }

            const { data: updatedProgress } = await supabase
                .from('progress')
                .select('*')
                .eq('user_id', user.id)
                .order('completed_at', { ascending: true });

            set({ progressData: updatedProgress || [] });

            await useAchievementsStore.getState().checkForNewAchievements(get().user, progressDataToSave);

            return true;
        } catch (error) {
            console.error('❌ Error saving progress:', error);
            return false;
        }
    },

    isLessonCompleted: (lessonId) => {
        const completedLessons = get().completedLessons;
        return completedLessons.includes(lessonId);
    },
}));
