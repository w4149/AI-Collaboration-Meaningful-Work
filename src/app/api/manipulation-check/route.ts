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
    const { data: existingUser, error: userLookupError } = await supabaseServer
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (userLookupError) {
      console.warn('[Manipulation Check] User lookup failed:', userLookupError.message)
    }

    if (!existingUser) {
      console.log('[Manipulation Check] User not found, creating...')
      const { data: newUser, error: createError } = await supabaseServer
        .from('users')
        .insert({ id: userId, prolific_id: prolificId || 'unknown' })
        .select('id')
        .maybeSingle()

      if (createError) {
        console.error('[Manipulation Check] Failed to create user:', createError.message)
        return NextResponse.json(
          { error: `Failed to create user: ${createError.message}` },
          { status: 500 }
        )
      }
      console.log('[Manipulation Check] Created user:', userId)
    }

    // Build payload
    const insertPayload: Record<string, unknown> = {
      user_id: userId,
      task_id: taskId || null,
      group_type: groupType,
      created_at: new Date().toISOString(),
    }

    if (groupType === 'G1-Human' || groupType === 'G2-AI') {
      // Old columns (always exist)
      insertPayload.ai_used_stage1 = aiUsed || null
      insertPayload.ai_used_stage2 = otherAssistance || null
      // New columns (migration 017)
      insertPayload.other_assistance = otherAssistance || null
    } else if (groupType === 'G3-HumanAndAI') {
      // Old columns (always exist)
      insertPayload.ai_used_stage1 = stage1AiUsed || null
      insertPayload.ai_used_stage2 = stage2AiUsed || null
      // New columns (migration 017)
      insertPayload.stage1_ai_used = stage1AiUsed || null
      insertPayload.stage1_other_assistance = stage1OtherAssistance || null
      insertPayload.stage2_ai_used = stage2AiUsed || null
      insertPayload.stage2_other_assistance = stage2OtherAssistance || null
    }

    // Try insert
    let { error } = await supabaseServer
      .from('manipulation_checks')
      .insert(insertPayload)

    if (error) {
      console.warn('[Manipulation Check] Insert failed, trying with minimal columns:', error.message)
      
      // Minimal insert - only columns guaranteed to exist
      const fallbackPayload: Record<string, unknown> = {
        user_id: userId,
        task_id: taskId || null,
        group_type: groupType,
        created_at: new Date().toISOString(),
      }

      if (groupType === 'G1-Human' || groupType === 'G2-AI') {
        fallbackPayload.ai_used_stage1 = aiUsed || null
        fallbackPayload.ai_used_stage2 = otherAssistance || null
      } else if (groupType === 'G3-HumanAndAI') {
        fallbackPayload.ai_used_stage1 = stage1AiUsed || null
        fallbackPayload.ai_used_stage2 = stage2AiUsed || null
      }

      console.log('[Manipulation Check] Fallback payload:', JSON.stringify(fallbackPayload))
      const { error: fallbackError } = await supabaseServer
        .from('manipulation_checks')
        .insert(fallbackPayload)

      if (fallbackError) {
        console.error('[Manipulation Check] Both inserts failed:', fallbackError.message)
        return NextResponse.json(
          { error: `Failed to save manipulation check: ${fallbackError.message}` },
          { status: 500 }
        )
      }
    }

    console.log('[Manipulation Check] Saved successfully for user:', userId, 'group:', groupType)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in manipulation checks API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
