import { NextResponse } from 'next/server';
import { generateSituation } from '@/lib/situationGenerator';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
    try {
        const { mode, topic, level } = await request.json();

        if (!mode) {
            return NextResponse.json({ error: 'Mode is required' }, { status: 400 });
        }

        // Fetch recent titles to avoid repetition
        const { data: recentSituations } = await supabase
            .from('situations')
            .select('title')
            .order('created_at', { ascending: false })
            .limit(50);

        const recentTitles = recentSituations?.map(s => s.title) || [];

        const situationData = await generateSituation(mode, topic, level, recentTitles);

        // Note: We are returning the generated JSON directly. 
        // The Admin Panel will handle saving it to the DB after review, 
        // OR we can save it here if we trust the AI output 100%. 
        // Implementation Plan Step 15 says "UI for generating". 
        // Usually Admin generates -> reviews -> saves.

        // If "User" generates (Auto mode), we might want to save immediately.
        // For now, let's return it. The client decides what to do.

        return NextResponse.json({
            success: true,
            situation: situationData
        });

    } catch (error) {
        console.error('❌ Generate situation error:', error);
        return NextResponse.json(
            {
                error: error.message || 'Failed to generate situation',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
