import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const {
      userId,
      prolificId,
      gender,
      raceEthnicity,
      education,
      employment,
      income,
      usBorn,
      political,
    } = await request.json()

    console.log('[Demographics Survey] received:', { userId, prolificId, gender, education, employment, income, usBorn, political })

    if (!gender || !raceEthnicity || !raceEthnicity.length || !education || !employment || !income || !usBorn || !political) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Step 1: Ensure user exists in DB
    let dbUserId = userId

    const isUuid = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)

    if (!isUuid) {
      const pid = prolificId || 'unknown'
      const { data: existingUser } = await supabaseServer
        .from('users')
        .select('id')
        .eq('prolific_id', pid)
        .single()

      if (existingUser) {
        dbUserId = existingUser.id
      } else {
        const { data: newUser, error: userError } = await supabaseServer
          .from('users')
          .insert({ prolific_id: pid })
          .select('id')
          .single()

        if (newUser) {
          dbUserId = newUser.id
        } else {
          console.warn('[Demographics Survey] Could not create user:', userError?.message)
        }
      }
    }

    const surveyData = {
      gender,
      race_ethnicity: Array.isArray(raceEthnicity) ? raceEthnicity.join(', ') : null,
      education,
      employment,
      income: Number(income),
      us_born: usBorn,
      political,
    }

    let saved = false

    // Step 2: Try inserting into demographics_survey_responses table
    const insertPayload: Record<string, unknown> = {
      ...surveyData,
      submitted_at: new Date().toISOString(),
    }
    if (dbUserId) insertPayload.user_id = dbUserId

    const { data, error } = await supabaseServer
      .from('demographics_survey_responses')
      .insert(insertPayload)
      .select('id')
      .single()

    if (!error && data) {
      saved = true
      console.log('[Demographics Survey] saved to demographics_survey_responses table, id:', data.id)
    } else {
      console.error('[Demographics Survey] demographics_survey_responses insert failed:', error?.message)

      // Step 3: Fallback - try updating users table with demo_* columns
      if (dbUserId) {
        const { error: updateError } = await supabaseServer
          .from('users')
          .update({
            demo_gender: surveyData.gender,
            demo_race_ethnicity: surveyData.race_ethnicity,
            demo_education: surveyData.education,
            demo_employment: surveyData.employment,
            demo_income: surveyData.income,
            demo_us_born: surveyData.us_born,
            demo_political: surveyData.political,
          })
          .eq('id', dbUserId)

        if (!updateError) {
          saved = true
          console.log('[Demographics Survey] saved to users table columns')
        } else {
          console.error('[Demographics Survey] users table update failed:', updateError.message)
        }
      }
    }

    return NextResponse.json({
      success: true,
      userId: dbUserId || userId,
      saved,
    })
  } catch (error) {
    console.error('[Demographics Survey] server error:', error)
    return NextResponse.json({ success: true, saved: false, error: 'Internal error but proceeding' })
  }
}