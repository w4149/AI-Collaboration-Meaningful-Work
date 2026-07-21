import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { userId, part, responses, questionOrder } = await request.json()

    if (!userId || !part || !responses) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Save detailed responses to survey_likert_responses
    const { data, error } = await supabaseServer
      .from('survey_likert_responses')
      .insert({
        user_id: userId,
        part: part,
        responses: responses,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error saving likert response:', error)
      return NextResponse.json({ error: 'Failed to save likert response' }, { status: 500 })
    }

    // Also save comma-separated results to scale_results
    if (questionOrder && Array.isArray(questionOrder)) {
      const resultsStr = questionOrder.map((id: string) => responses[id] || '').join(',')
      const { error: scaleError } = await supabaseServer
        .from('scale_results')
        .insert({
          user_id: userId,
          part: part,
          scale_name: `part_${part}`,
          results: resultsStr,
        })

      if (scaleError) {
        console.error('Error saving scale results:', scaleError)
      }
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    console.error('Error in survey-likert API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
