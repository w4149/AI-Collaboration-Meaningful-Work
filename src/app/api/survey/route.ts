import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { userId, age, gender, education, taskFamiliarity, taskDuration, taskTypeId, groupMode, additionalComments, scaleResults } = await request.json()

    console.log('Survey API received:', { userId, taskFamiliarity, taskDuration, taskTypeId, groupMode, scaleResultsLength: scaleResults?.length })

    if (!userId || taskFamiliarity === undefined) {
      console.error('Missing required fields:', { userId, taskFamiliarity })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Try inserting with all columns first
    let { data, error } = await supabaseServer
      .from('survey_responses')
      .insert({
        user_id: userId,
        age: age,
        gender: gender,
        education: education,
        task_familiarity: taskFamiliarity,
        task_duration: taskDuration,
        task_type_id: taskTypeId || null,
        group_mode: groupMode || null,
        additional_comments: additionalComments,
        scale_results: scaleResults || null,
      })
      .select('id')
      .single()

    // If error (e.g. columns don't exist), try with basic columns only
    if (error) {
      console.warn('Full insert failed, trying basic columns:', error.message)
      const result = await supabaseServer
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
      data = result.data
      error = result.error
    }

    if (error || !data) {
      console.error('Error saving survey response:', error)
      return NextResponse.json({ error: 'Failed to save survey response' }, { status: 500 })
    }

    return NextResponse.json({ success: true, responseId: data.id })
  } catch (error) {
    console.error('Error in survey API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
