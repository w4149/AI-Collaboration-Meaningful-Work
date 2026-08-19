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

    if (!checkType || (checkType !== 1 && checkType !== 2)) {
      return NextResponse.json({ error: 'Invalid check type. Must be 1 or 2.' }, { status: 400 })
    }

    // Build the UPSERT payload — one row per user_id
    const upsertPayload: Record<string, unknown> = {
      user_id: userId,
      updated_at: new Date().toISOString(),
    }

    if (taskId) upsertPayload.task_id = taskId
    if (groupType) upsertPayload.group_type = groupType

    if (checkType === 1) {
      // If this is a wrong answer, mark ever_failed and increment count
      // If correct, store the final correct answer and timestamp
      if (!isCorrect) {
        // We need to read existing row to increment count
        const { data: existing } = await supabaseServer
          .from('attention_checks')
          .select('check1_ever_failed, check1_fail_count')
          .eq('user_id', userId)
          .maybeSingle()

        const currentFailCount = existing?.check1_fail_count ?? 0
        upsertPayload.check1_ever_failed = true
        upsertPayload.check1_fail_count = currentFailCount + 1
      } else {
        // Correct answer
        upsertPayload.check1_correct_answer = answer
        upsertPayload.check1_final_answer = answer
        upsertPayload.check1_completed_at = new Date().toISOString()
      }
    } else {
      // checkType === 2
      if (!isCorrect) {
        const { data: existing } = await supabaseServer
          .from('attention_checks')
          .select('check2_ever_failed, check2_fail_count')
          .eq('user_id', userId)
          .maybeSingle()

        const currentFailCount = existing?.check2_fail_count ?? 0
        upsertPayload.check2_ever_failed = true
        upsertPayload.check2_fail_count = currentFailCount + 1
      } else {
        upsertPayload.check2_correct_answer = answer
        upsertPayload.check2_final_answer = answer
        upsertPayload.check2_completed_at = new Date().toISOString()
      }
    }

    const { error } = await supabaseServer
      .from('attention_checks')
      .upsert(upsertPayload, { onConflict: 'user_id' })

    if (error) {
      console.error('Error upserting attention check:', error)
      return NextResponse.json({ error: 'Failed to save attention check' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in attention checks API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
