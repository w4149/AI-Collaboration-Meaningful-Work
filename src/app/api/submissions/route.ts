import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

function countWords(text: string | null | undefined): number {
  if (!text) return 0
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

export async function POST(request: Request) {
  try {
    const {
      userId,
      taskId,
      submission,
      submissionTime,
      submission2,
      submissionTime2,
      phase,
      aiTotalTokens,
    } = await request.json()

    if (!userId || !taskId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const tokenCount = aiTotalTokens ?? 0

    if (phase === 1) {
      // Phase 1: insert new row with Phase 1 submission
      const { data, error } = await supabaseServer
        .from('task_submissions')
        .insert({
          user_id: userId,
          task_id: taskId,
          submission: submission || null,
          submission_time: submissionTime ?? null,
          submission_word_count: countWords(submission),
          ai_total_tokens: tokenCount,
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error saving Phase 1 submission:', error)
        return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
      }

      return NextResponse.json({ success: true, submissionId: data.id, phase: 1 })
    }

    // Phase 2 (or single-phase final submit): insert with both fields
    const { data: existing } = await supabaseServer
      .from('task_submissions')
      .select('id')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (existing?.id) {
      // Update existing row with Phase 2 data
      const { error } = await supabaseServer
        .from('task_submissions')
        .update({
          submission_2: submission2 || null,
          submission_time_2: submissionTime2 ?? null,
          submission_word_count_2: countWords(submission2),
          ai_total_tokens: tokenCount,
        })
        .eq('id', existing.id)

      if (error) {
        console.error('Error updating Phase 2 submission:', error)
        return NextResponse.json({ error: 'Failed to save Phase 2 submission' }, { status: 500 })
      }

      // Update session to mark task as completed
      await supabaseServer
        .from('sessions')
        .update({ task_completed: true, end_time: new Date().toISOString() })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)

      return NextResponse.json({ success: true, submissionId: existing.id, phase: 2 })
    }

    // No existing row found — create new row
    // Handle both Phase 2 (submission2) and single-phase (submission) scenarios
    if (submission2 !== undefined) {
      // Phase 2 fallback: create row with submission_2
      const { data, error } = await supabaseServer
        .from('task_submissions')
        .insert({
          user_id: userId,
          task_id: taskId,
          submission_2: submission2 || null,
          submission_time_2: submissionTime2 ?? null,
          submission_word_count_2: countWords(submission2),
          ai_total_tokens: tokenCount,
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error saving Phase 2 submission (no existing row):', error)
        return NextResponse.json({ error: 'Failed to save Phase 2 submission' }, { status: 500 })
      }

      await supabaseServer
        .from('sessions')
        .update({ task_completed: true, end_time: new Date().toISOString() })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)

      return NextResponse.json({ success: true, submissionId: data.id, phase: 2 })
    }

    // Single-phase (G1/G2): insert new row with submission
    const { data, error } = await supabaseServer
      .from('task_submissions')
      .insert({
        user_id: userId,
        task_id: taskId,
        submission: submission || null,
        submission_time: submissionTime ?? null,
        submission_word_count: countWords(submission),
        ai_total_tokens: tokenCount,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error saving submission:', error)
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
    }

    // Update session to mark task as completed
    await supabaseServer
      .from('sessions')
      .update({ task_completed: true, end_time: new Date().toISOString() })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    return NextResponse.json({ success: true, submissionId: data.id })
  } catch (error) {
    console.error('Error in submissions API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
