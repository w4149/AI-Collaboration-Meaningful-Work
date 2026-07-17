import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { userId, sessionId, age, gender, education, taskFamiliarity, taskDuration, additionalComments } = await request.json()

    if (!userId || !sessionId || taskFamiliarity === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch group_mode from the session
    const { data: sessionData, error: sessionError } = await supabaseServer
      .from('sessions')
      .select('group_mode')
      .eq('id', sessionId)
      .single()

    if (sessionError || !sessionData) {
      console.error('Error fetching session data:', sessionError)
      return NextResponse.json({ error: 'Failed to retrieve session information' }, { status: 500 })
    }

    const groupMode = sessionData.group_mode;

    // Fetch task_id and task_type_id from the tasks table for the current session
    // We assume there's only one active task per user for a given session.
    const { data: taskData, error: taskError } = await supabaseServer
      .from('tasks')
      .select('id, task_type_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // Get the most recent task
      .limit(1)
      .single()

    if (taskError || !taskData) {
      console.error('Error fetching task data:', taskError)
      return NextResponse.json({ error: 'Failed to retrieve task information' }, { status: 500 })
    }

    const taskTypeId = taskData.task_type_id;

    const { data, error } = await supabaseServer
      .from('survey_responses')
      .insert({
        user_id: userId,
        task_type_id: taskTypeId,
        group_mode: groupMode,
        age: age,
        gender: gender,
        education: education,
        task_familiarity: taskFamiliarity,
        task_duration: taskDuration,
        additional_comments: additionalComments,
      })
      .select('id')
      .single()
    if (error) {
      console.error('Error saving survey response:', error)
      return NextResponse.json({ error: 'Failed to save survey response' }, { status: 500 })
    }

    return NextResponse.json({ success: true, responseId: data.id })
  } catch (error) {
    console.error('Error in survey API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
