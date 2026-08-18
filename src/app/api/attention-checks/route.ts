import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const {
      userId,
      taskId,
      checkType,
      groupType,
      answer,
      isCorrect,
    } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    const { error } = await supabaseServer
      .from('attention_checks')
      .insert({
        user_id: userId,
        task_id: taskId || null,
        check_type: checkType,
        group_type: groupType || null,
        answer,
        is_correct: isCorrect || false,
      })

    if (error) {
      console.error('Error saving attention check:', error)
      return NextResponse.json({ error: 'Failed to save attention check' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in attention checks API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
