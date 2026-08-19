import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const {
      userId,
      taskId,
      groupType,
      aiUsedStage1,
      aiUsedStage2,
    } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    if (!groupType) {
      return NextResponse.json({ error: 'Missing group type' }, { status: 400 })
    }

    const { error } = await supabaseServer
      .from('manipulation_checks')
      .insert({
        user_id: userId,
        task_id: taskId || null,
        group_type: groupType,
        ai_used_stage1: aiUsedStage1 || null,
        ai_used_stage2: aiUsedStage2 || null,
      })

    if (error) {
      console.error('Error saving manipulation check:', error)
      return NextResponse.json({ error: 'Failed to save manipulation check' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in manipulation checks API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
