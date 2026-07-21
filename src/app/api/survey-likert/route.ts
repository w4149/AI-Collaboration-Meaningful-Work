import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { userId, part, responses } = await request.json()

    if (!userId || !part || !responses) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

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

    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    console.error('Error in survey-likert API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
