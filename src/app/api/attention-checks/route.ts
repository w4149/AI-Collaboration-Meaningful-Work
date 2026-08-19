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

    const upsertPayload: Record<string, unknown> = {
      user_id: userId,
      updated_at: new Date().toISOString(),
    }

    if (taskId) upsertPayload.task_id = taskId
    if (groupType) upsertPayload.group_type = groupType

    if (checkType === 1) {
      if (!isCorrect) {
        const { data: existing, error: readError } = await supabaseServer
          .from('attention_checks')
          .select('check1_ever_failed, check1_fail_count')
          .eq('user_id', userId)
          .single()

        if (readError) {
          console.warn('attention_checks read (check1) — table may need migration 016:', readError.message)
        }

        const currentFailCount = existing?.check1_fail_count ?? 0
        upsertPayload.check1_ever_failed = true
        upsertPayload.check1_fail_count = currentFailCount + 1
      } else {
        upsertPayload.check1_correct_answer = answer
        upsertPayload.check1_final_answer = answer
        upsertPayload.check1_completed_at = new Date().toISOString()
      }
    } else {
      if (!isCorrect) {
        const { data: existing, error: readError } = await supabaseServer
          .from('attention_checks')
          .select('check2_ever_failed, check2_fail_count')
          .eq('user_id', userId)
          .single()

        if (readError) {
          console.warn('attention_checks read (check2) — table may need migration 016:', readError.message)
        }

        const currentFailCount = existing?.check2_fail_count ?? 0
        upsertPayload.check2_ever_failed = true
        upsertPayload.check2_fail_count = currentFailCount + 1
      } else {
        upsertPayload.check2_correct_answer = answer
        upsertPayload.check2_final_answer = answer
        upsertPayload.check2_completed_at = new Date().toISOString()
      }
    }

    const { error: upsertError } = await supabaseServer
      .from('attention_checks')
      .upsert(upsertPayload, { onConflict: 'user_id' })

    if (upsertError) {
      console.error('attention_checks UPSERT failed:', upsertError.message, 'payload:', upsertPayload)
      return NextResponse.json({ error: 'Failed to save attention check' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('attention_checks API error:', message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
