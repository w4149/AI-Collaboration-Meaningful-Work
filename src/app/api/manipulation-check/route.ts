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
      prolificId,
    } = await request.json()

    console.log('[Manipulation Check] Received:', JSON.stringify({ userId, groupType, aiUsed, otherAssistance, stage1AiUsed, stage1OtherAssistance, stage2AiUsed, stage2OtherAssistance }))

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    if (!groupType) {
      return NextResponse.json({ error: 'Missing group type' }, { status: 400 })
    }

    // Ensure user exists in DB
    const { data: existingUser } = await supabaseServer
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (!existingUser) {
      console.log('[Manipulation Check] User not found, creating...')
      const { error: createError } = await supabaseServer
        .from('users')
        .insert({ id: userId, prolific_id: prolificId || 'unknown' })
      if (createError) {
        console.error('[Manipulation Check] Failed to create user:', createError.message)
      }
    }

    // Build payload using GX-X column names
    const insertPayload: Record<string, unknown> = {
      user_id: userId,
      task_id: taskId || null,
      created_at: new Date().toISOString(),
    }

    if (groupType === 'G1-Human') {
      insertPayload.g1_human_1 = aiUsed || null
      insertPayload.g1_human_2 = otherAssistance || null
    } else if (groupType === 'G2-AI') {
      insertPayload.g2_ai_1 = aiUsed || null
      insertPayload.g2_ai_2 = otherAssistance || null
    } else if (groupType === 'G3-HumanAndAI') {
      insertPayload.g3_humanandai_1 = stage1AiUsed || null
      insertPayload.g3_humanandai_2 = stage1OtherAssistance || null
      insertPayload.g3_humanandai_3 = stage2AiUsed || null
      insertPayload.g3_humanandai_4 = stage2OtherAssistance || null
    }

    console.log('[Manipulation Check] Insert payload:', JSON.stringify(insertPayload))

    const { error } = await supabaseServer
      .from('manipulation_checks')
      .insert(insertPayload)

    if (error) {
      console.error('[Manipulation Check] Insert failed:', error.message)
      return NextResponse.json(
        { error: `Failed to save manipulation check: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('[Manipulation Check] Saved successfully for user:', userId, 'group:', groupType)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in manipulation checks API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
