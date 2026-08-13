import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const {
      userId,
      birthYear,
      gender,
      ethnicBackgrounds,
      ethnicOtherText,
      education,
      employment,
      employmentOtherText,
    } = await request.json()

    console.log('[Pre-Survey] received:', { userId, birthYear, gender, education, employment })

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    if (!birthYear || !gender || !ethnicBackgrounds || !ethnicBackgrounds.length || !education || !employment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Compose multi-select ethnic values into a single string
    const ethnicStr = Array.isArray(ethnicBackgrounds) ? ethnicBackgrounds.join(', ') : null

    const insertData = {
      user_id: userId,
      birth_year: birthYear ? Number(birthYear) : null,
      gender,
      ethnic_background: ethnicStr,
      ethnic_other_text: ethnicOtherText || null,
      education,
      employment,
      employment_other_text: employmentOtherText || null,
      submitted_at: new Date().toISOString(),
    }

    let { data, error } = await supabaseServer
      .from('pre_survey_responses')
      .insert(insertData)
      .select('id')
      .single()

    // Fallback: try inserting to users table directly (in case pre_survey table not yet created)
    if (error) {
      console.warn('[Pre-Survey] primary insert failed, trying users fallback:', error.message)
      const result = await supabaseServer
        .from('users')
        .update({
          pre_birth_year: insertData.birth_year,
          pre_gender: insertData.gender,
          pre_ethnic_background: insertData.ethnic_background,
          pre_ethnic_other_text: insertData.ethnic_other_text,
          pre_education: insertData.education,
          pre_employment: insertData.employment,
          pre_employment_other_text: insertData.employment_other_text,
        })
        .eq('id', userId)
        .select('id')
        .single()
      data = result.data
      error = result.error
    }

    if (error || !data) {
      console.error('[Pre-Survey] save error:', error)
      return NextResponse.json({ error: 'Failed to save pre-survey data' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    console.error('[Pre-Survey] server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
