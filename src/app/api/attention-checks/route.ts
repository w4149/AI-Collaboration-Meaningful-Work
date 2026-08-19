import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      userId,
      taskId,
      checkType,
      groupType,
      answer,
      isCorrect,
    } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    if (!checkType || (checkType !== 1 && checkType !== 2)) {
      return NextResponse.json({ error: 'Invalid check type. Must be 1 or 2.' }, { status: 400 })
    }

    // Step 1: Verify user exists in DB (FK constraint)
    const { data: userExists, error: userCheckError } = await supabaseServer
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (userCheckError || !userExists) {
      console.error('[attention-checks] User not found in users table:', userId, userCheckError?.message)
      return NextResponse.json(
        { error: `User not found (id=${userId}). User must exist in users table before saving attention check.` },
        { status: 400 }
      )
    }

    // Step 2: Read existing row (if any) to get current fail counts
    let existingCheck: { fail_count: number } | null = null

    if (checkType === 1) {
      const { data, error } = await supabaseServer
        .from('attention_checks')
        .select('check1_fail_count')
        .eq('user_id', userId)
        .single()
      if (error) {
        console.error('[attention-checks] Read existing failed — migration 016 may not be deployed:', error.message)
        return NextResponse.json(
          { error: 'Database schema mismatch. Please deploy migration 016_rebuild_attention_checks first.' },
          { status: 500 }
        )
      }
      existingCheck = { fail_count: data?.check1_fail_count ?? 0 }
    } else {
      const { data, error } = await supabaseServer
        .from('attention_checks')
        .select('check2_fail_count')
        .eq('user_id', userId)
        .single()
      if (error) {
        console.error('[attention-checks] Read existing failed — migration 016 may not be deployed:', error.message)
        return NextResponse.json(
          { error: 'Database schema mismatch. Please deploy migration 016_rebuild_attention_checks first.' },
          { status: 500 }
        )
      }
      existingCheck = { fail_count: data?.check2_fail_count ?? 0 }
    }

    const upsertPayload: Record<string, unknown> = {
      user_id: userId,
      updated_at: new Date().toISOString(),
    }

    if (taskId) upsertPayload.task_id = taskId
    if (groupType) upsertPayload.group_type = groupType

    if (checkType === 1) {
      const currentFailCount = existingCheck?.fail_count ?? 0
      if (!isCorrect) {
        upsertPayload.check1_ever_failed = true
        upsertPayload.check1_fail_count = currentFailCount + 1
        console.log(`[attention-checks] check1 FAILED — fail_count: ${currentFailCount + 1}`)
      } else {
        upsertPayload.check1_correct_answer = answer
        upsertPayload.check1_final_answer = answer
        upsertPayload.check1_completed_at = new Date().toISOString()
        console.log(`[attention-checks] check1 PASSED`)
      }
    } else {
      const currentFailCount = existingCheck?.fail_count ?? 0
      if (!isCorrect) {
        upsertPayload.check2_ever_failed = true
        upsertPayload.check2_fail_count = currentFailCount + 1
        console.log(`[attention-checks] check2 FAILED — fail_count: ${currentFailCount + 1}`)
      } else {
        upsertPayload.check2_correct_answer = answer
        upsertPayload.check2_final_answer = answer
        upsertPayload.check2_completed_at = new Date().toISOString()
        console.log(`[attention-checks] check2 PASSED`)
      }
    }

    // Step 3: UPSERT
    const { error: upsertError, data: upsertData } = await supabaseServer
      .from('attention_checks')
      .upsert(upsertPayload, { onConflict: 'user_id' })
      .select()

    if (upsertError) {
      console.error('[attention-checks] UPSERT failed:', upsertError.message, 'payload:', JSON.stringify(upsertPayload))
      return NextResponse.json(
        { error: `UPSERT failed: ${upsertError.message}. Migration 016 may be required.` },
        { status: 500 }
      )
    }

    console.log('[attention-checks] Saved successfully for user:', userId, 'checkType:', checkType, 'isCorrect:', isCorrect)
    return NextResponse.json({ success: true, data: upsertData })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[attention-checks] API error:', message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
