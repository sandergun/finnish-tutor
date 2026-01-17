import { NextResponse } from 'next/server';
import { generateLesson } from '@/lib/lessonGenerator';

export async function POST(request) {
  try {
    const { level, topic } = await request.json();

    if (!topic || typeof topic !== 'string' || topic.trim() === '') {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const insertedLesson = await generateLesson(level, topic);

    return NextResponse.json({
      success: true,
      lesson: insertedLesson,
      lessonId: insertedLesson.id,
    });

  } catch (error) {
    console.error('❌ Generate lesson error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate lesson',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}