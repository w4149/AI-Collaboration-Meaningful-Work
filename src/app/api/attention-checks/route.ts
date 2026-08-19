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

    // Step 1: Read existing fail count (if any). Use maybeSingle() because new users
    // have no row yet — .single() throws PGRST116 when no rows found.
    const countField = checkType === 1 ? 'check1_fail_count' : 'check2_fail_count'
    const { data: existingRow, error: readError } = await supabaseServer
      .from('attention_checks')
      .select(countField)
      .eq('user_id', userId)
      .maybeSingle()

    if (readError) {
      console.error('[attention-checks] Read failed:', readError.message)
      return NextResponse.json(
        { error: `Cannot read attention_checks table. Column "${countField}" may be missing. Details: ${readError.message}` },
        { status: 500 }
      )
    }

    const row = existingRow as Record<string, unknown> | null
    const currentFailCount = (row?.[countField] as number | undefined) ?? 0

    // Step 2: Build UPSERT payload
    const upsertPayload: Record<string, unknown> = {
      user_id: userId,
      updated_at: new Date().toISOString(),
    }

    if (taskId) upsertPayload.task_id = taskId
    if (groupType) upsertPayload.group_type = groupType

    if (checkType === 1) {
      if (!isCorrect) {
        upsertPayload.check1_ever_failed = true
        upsertPayload.check1_fail_count = currentFailCount + 1
        console.log(`[attention-checks] check1 FAILED — fail_count: ${currentFailCount + 1}`)
      } else {
        upsertPayload.check1_correct_answer = answer
        upsertPayload.check1_final_answer = answer
        upsertPayload.check1_completed_at = new Date().toISOString()
        console.log('[attention-checks] check1 PASSED')
      }
    } else {
      if (!isCorrect) {
        upsertPayload.check2_ever_failed = true
        upsertPayload.check2_fail_count = currentFailCount + 1
        console.log(`[attention-checks] check2 FAILED — fail_count: ${currentFailCount + 1}`)
      } else {
        upsertPayload.check2_correct_answer = answer
        upsertPayload.check2_final_answer = answer
        upsertPayload.check2_completed_at = new Date().toISOString()
        console.log('[attention-checks] check2 PASSED')
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
        { error: `UPSERT failed: ${upsertError.message}` },
        { status: 500 }
      )
    }

    console.log('[attention-checks] Saved for user:', userId, 'checkType:', checkType, 'isCorrect:', isCorrect)
    return NextResponse.json({ success: true, data: upsertData })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[attention-checks] API error:', message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
