import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const {
      userId,
      taskId,
      groupType,
      aiUsed,
      otherAssistance,
      stage1AiUsed,
      stage1OtherAssistance,
      stage2AiUsed,
      stage2OtherAssistance,
    } = await request.json()

    console.log('[Manipulation Check] Received:', JSON.stringify({ userId, groupType, aiUsed, otherAssistance, stage1AiUsed, stage1OtherAssistance, stage2AiUsed, stage2OtherAssistance }))

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    if (!groupType) {
      return NextResponse.json({ error: 'Missing group type' }, { status: 400 })
    }

    const insertPayload: Record<string, unknown> = {
      user_id: userId,
      task_id: taskId || null,
      group_type: groupType,
      created_at: new Date().toISOString(),
    }

    if (groupType === 'G1-Human' || groupType === 'G2-AI') {
      insertPayload.ai_used = aiUsed || null
      insertPayload.other_assistance = otherAssistance || null
    } else if (groupType === 'G3-HumanAndAI') {
      insertPayload.stage1_ai_used = stage1AiUsed || null
      insertPayload.stage1_other_assistance = stage1OtherAssistance || null
      insertPayload.stage2_ai_used = stage2AiUsed || null
      insertPayload.stage2_other_assistance = stage2OtherAssistance || null
    }

    const { error } = await supabaseServer
      .from('manipulation_checks')
      .insert(insertPayload)

    if (error) {
      console.error('Error saving manipulation check:', error)
      return NextResponse.json({ error: `Failed to save manipulation check: ${error.message}` }, { status: 500 })
    }

    console.log('[Manipulation Check] Saved successfully for user:', userId, 'group:', groupType)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in manipulation checks API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
