import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { userId, taskId, content } = await request.json()

    if (!userId || !taskId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from('task_submissions')
      .insert({
        user_id: userId,
        task_id: taskId,
        content: content,
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
