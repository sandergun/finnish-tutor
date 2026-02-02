"use client";
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { useAchievementsStore } from "./useAchievementsStore";

export const useUserStore = create((set, get) => ({
    user: null,
    loading: true,
    completedLessons: [],
    progressData: [],
    situations: [],
    situationProgress: [],
    situationsLoading: false,

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
                    .eq('user_id', data.id || data.telegram_id)
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

                // Removed automatic last_active update on login to prevent breaking streak calculation.

                if (!data.last_active) {
                    // First login ever - set last_active and initial streak
                    const { data: updated } = await supabase
                        .from('users')
                        .update({ streak: 1, last_active: new Date().toISOString() })
                        .eq('telegram_id', id)
                        .select()
                        .single();
                    if (updated) updatedUser = updated;
                }

                // Recalculate totals from progress to ensure accuracy
                const calculatedTotalLessons = progress ? progress.filter(p => p.completed).length : 0;

                // If there is a mismatch, update the user profile in the background
                if (calculatedTotalLessons !== data.total_lessons) {
                    // Update local state first
                    updatedUser = { ...updatedUser, total_lessons: calculatedTotalLessons };

                    // Fire and forget update to DB
                    supabase.from('users').update({ total_lessons: calculatedTotalLessons }).eq('telegram_id', id).then(({ error }) => {
                        if (error) console.error("Failed to sync total_lessons:", error);
                    });
                }

                console.log('✅ User loaded:', updatedUser);
                set({
                    user: updatedUser,
                    loading: false,
                    completedLessons: progress ? progress.filter(p => p.completed).map(p => p.lesson_id) : [],
                    progressData: progress || []
                });

                // Check for achievements upon login/load to catch up on any missed ones
                // e.g. if total_lessons was updated but achievement not granted due to crash
                const achievementsStore = useAchievementsStore.getState();

                // First, load existing achievements to ensure store is populated
                await achievementsStore.loadAchievements(updatedUser.telegram_id);

                // Then check for new ones
                achievementsStore.checkForNewAchievements(updatedUser, progress || []).then(newPoints => {
                    if (newPoints > 0) {
                        get().updateProfile({
                            points: (updatedUser.points || 0) + newPoints,
                        });
                    }
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
                    avatar: '👤',
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
        const userId = user?.id || user?.telegram_id;
        if (!user || !userId) return null;

        try {
            const progressDataToSave = {
                user_id: userId,
                lesson_id: lessonData.lessonId,
                score: lessonData.score,
                completed: lessonData.score >= 70,
                completed_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('progress').upsert(progressDataToSave, { onConflict: ['user_id', 'lesson_id'] });

            if (error) throw error;

            // Recalculate total_lessons based on actual unique completed lessons in progress table
            // This is safer than incrementing
            const { count: completedCount, error: countError } = await supabase
                .from('progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('completed', true);

            let newTotalLessons = completedCount || user.total_lessons;

            // If the current lesson is just completed (>=70) and wasn't counted yet (race condition or latency), 
            // force increment if we know it wasn't in the DB count yet. 
            // actually, we just upserted it. So if we query NOW, it should be there.
            // But let's trust the count from DB.
            if (!countError) {
                newTotalLessons = completedCount;
            } else {
                // Fallback to increment logic if count fails
                if (lessonData.score >= 70 && !user.completedLessons?.includes(lessonData.lessonId)) {
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
                .eq('user_id', user.id || user.telegram_id)
                .order('completed_at', { ascending: true });

            set({ progressData: updatedProgress || [] });

            const newPoints = await useAchievementsStore.getState().checkForNewAchievements(get().user, updatedProgress || []);
            if (newPoints > 0) {
                await get().updateProfile({
                    points: (get().user.points || 0) + newPoints,
                });
            }

            return true;
        } catch (error) {
            console.error('❌ Error saving progress:', error);
            return false;
        }
    },

    startLesson: async (lessonId) => {
        const user = get().user;
        const userId = user?.id || user?.telegram_id;
        if (!user || !userId) return;

        // Check if progress already exists
        const existingProgress = get().progressData.find(p => p.lesson_id === lessonId);
        if (existingProgress) return;

        try {
            const progressDataToSave = {
                user_id: userId,
                lesson_id: lessonId,
                score: 0,
                completed: false,
                completed_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('progress').insert([progressDataToSave]);

            if (error) throw error;

            // Update local state immediately
            const { data: updatedProgress } = await supabase
                .from('progress')
                .select('*')
                .eq('user_id', userId)
                .order('completed_at', { ascending: true });

            set({ progressData: updatedProgress || [] });

        } catch (error) {
            console.error('❌ Error starting lesson:', error);
        }
    },

    isLessonCompleted: (lessonId) => {
        const progressData = get().progressData;
        if (!progressData) return false;
        return progressData.some(p => String(p.lesson_id) === String(lessonId) && p.completed);
    },

    refreshProgress: async () => {
        const user = get().user;
        const userId = user?.id || user?.telegram_id;

        // If user is missing or doesn't have an ID, we can't refresh progress reliably
        if (!user || !userId) {
            console.warn('⚠️ Cannot refresh progress: User ID missing', user);
            return;
        }

        try {
            const { data: progress, error } = await supabase
                .from('progress')
                .select('*')
                .eq('user_id', userId)
                .order('completed_at', { ascending: true });

            if (error) throw error;

            set({
                completedLessons: progress ? progress.filter(p => p.completed).map(p => p.lesson_id) : [],
                progressData: progress || []
            });
            console.log('🔄 Progress refreshed manually');
        } catch (error) {
            console.error('❌ Error refreshing progress FULL:', JSON.stringify(error, null, 2));
            console.error('❌ Error details:', error);
            if (error.message) console.error('❌ Error message:', error.message);
            if (error.details) console.error('❌ Error details:', error.details);
            if (error.hint) console.error('❌ Error hint:', error.hint);
        }
    },

    subscribeToProgress: () => {
        const user = get().user;
        const userId = user?.id || user?.telegram_id;
        if (!user || !userId) return () => { };

        console.log('📡 Subscribing to progress changes for user:', userId);

        const subscription = supabase
            .channel('progress_changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'progress',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log('🔔 Realtime progress update received:', payload);
                    // Trigger a full refresh to ensure consistency
                    get().refreshProgress();
                }
            )
            .subscribe();

        // Return unsubscribe function
        return () => {
            console.log('🔕 Unsubscribing from progress changes');
            supabase.removeChannel(subscription);
        };
    },

    resetProfile: async () => {
        const user = get().user;
        const userId = user?.id || user?.telegram_id;
        if (!user || !userId) return false;

        try {
            console.log('🧨 STARTING PROFILE RESET FOR:', userId);

            // 1. Delete all progress
            const { error: progressError } = await supabase
                .from('progress')
                .delete()
                .eq('user_id', userId);

            if (progressError) throw progressError;

            // 2. Delete all achievements
            const { error: achievementsError } = await supabase
                .from('user_achievements')
                .delete()
                .eq('telegram_id', userId);

            if (achievementsError) throw achievementsError;

            // 3. Reset user stats
            const { data: updatedUser, error: userError } = await supabase
                .from('users')
                .update({
                    level: 'A0',
                    streak: 0,
                    total_lessons: 0,
                    total_words: 0,
                    points: 0,
                    last_active: null // Clear last active to fully reset streak logic
                })
                .eq('telegram_id', userId)
                .select()
                .single();

            if (userError) throw userError;

            // 4. Update local state
            set({
                user: updatedUser,
                completedLessons: [],
                progressData: []
            });

            // 5. Clear achievements store locally
            useAchievementsStore.getState().clearLastEarned();
            // Reload achievements to reflect empty state (or manually clear)
            useAchievementsStore.setState({ achievements: [] });
            // Better to reload to keep structure but mark all as unearned
            await useAchievementsStore.getState().loadAchievements(userId);

            console.log('✅ PROFILE RESET COMPLETE');
            return true;

        } catch (error) {
            console.error('❌ Error resetting profile:', error);
            return false;
        }
    },

    // --- SITUATIONS ACTIONS ---

    loadSituations: async () => {
        set({ situationsLoading: true });
        const { data, error } = await supabase
            .from('situations')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading situations:', error);
            set({ situationsLoading: false });
            return;
        }

        set({ situations: data, situationsLoading: false });
    },

    loadSituationProgress: async () => {
        const user = get().user;
        const userId = user?.id || user?.telegram_id;
        if (!userId) return;

        const { data, error } = await supabase
            .from('user_situation_progress')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error loading situation progress:', error);
            return;
        }

        set({ situationProgress: data || [] });
    },

    saveSituationProgress: async (situationId, step, completed = false) => {
        const user = get().user;
        const userId = user?.id || user?.telegram_id;
        if (!userId) return;

        const { error } = await supabase
            .from('user_situation_progress')
            .upsert({
                user_id: userId,
                situation_id: situationId,
                current_step: step,
                completed: completed,
                completed_at: completed ? new Date().toISOString() : null,
                last_updated: new Date().toISOString()
            }, { onConflict: ['user_id', 'situation_id'] });

        if (error) console.error('Error saving situation progress:', JSON.stringify(error, null, 2));

        // Refresh local progress state
        await get().loadSituationProgress();

        if (completed) {
            // Add HP or XP?
            // For now just logging.
            console.log('Situation completed!');
        }
    },

    createSituation: async (situationData) => {
        // Admin only usually, but we put it here for convenience or Move to AdminPanel
        const { data, error } = await supabase
            .from('situations')
            .insert([situationData])
            .select()
            .single();

        if (error) throw error;
        // Refresh list
        await get().loadSituations();
        return data;
    },

    deleteSituation: async (id) => {
        const { error } = await supabase
            .from('situations')
            .delete()
            .eq('id', id);

        if (error) throw error;
        // Refresh list
        await get().loadSituations();
    },

    deleteAllSituations: async () => {
        const { error } = await supabase
            .from('situations')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all by checking id is not a dummy UUID

        if (error) throw error;
        await get().loadSituations();
    },

    deleteSituations: async (ids) => {
        const { error } = await supabase
            .from('situations')
            .delete()
            .in('id', ids);

        if (error) throw error;
        await get().loadSituations();
    }
}));
