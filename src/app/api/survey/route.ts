import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { userId, age, gender, education, taskFamiliarity, taskDuration, additionalComments } = await request.json()

    if (!userId || taskFamiliarity === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from('survey_responses')
      .insert({
        user_id: userId,
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
