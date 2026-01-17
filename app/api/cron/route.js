import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateLesson } from '@/lib/lessonGenerator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    // 1. Удаляем все старые AI уроки
    const { error: deleteError } = await supabase.from('ai_lessons').delete().not('id', 'is', null);
    if (deleteError) throw deleteError;

    // 2. Генерируем новые уроки
    const levels = ['A0', 'A1', 'A2'];
    const lessonsPerLevel = 3;
    const generatedLessons = [];

    for (const level of levels) {
      for (let i = 0; i < lessonsPerLevel; i++) {
        // Используем 'auto' для автоматического подбора темы
        const newLesson = await generateLesson(level, 'auto');
        generatedLessons.push(newLesson);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted all old lessons and generated ${generatedLessons.length} new lessons.`,
      generatedLessons: generatedLessons.map(l => ({ id: l.id, title: l.title, level: l.level })),
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to execute daily lesson generation.',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
