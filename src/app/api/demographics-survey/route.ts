import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const {
      userId,
      prolificId,
      gender,
      otherGender,
      raceEthnicity,
      otherRace,
      education,
      employment,
      income,
      usBorn,
      political,
      otherPolitical,
    } = await request.json()

    console.log('[Demographics Survey] received:', { userId, prolificId, gender, education, employment, income, usBorn, political })

    if (!gender || !raceEthnicity || !raceEthnicity.length || !education || !employment || !income || !usBorn || !political) {
      console.error('[Demographics Survey] Missing required fields:', { gender, raceEthnicity, education, employment, income, usBorn, political })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Step 1: Ensure user exists in DB
    let dbUserId = userId

    const isUuid = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)

    if (!isUuid) {
      const pid = prolificId || 'unknown'
      console.log('[Demographics Survey] userId is not UUID, looking up by prolificId:', pid)
      const { data: existingUser, error: lookupError } = await supabaseServer
        .from('users')
        .select('id')
        .eq('prolific_id', pid)
        .maybeSingle()

      if (existingUser) {
        dbUserId = existingUser.id
        console.log('[Demographics Survey] Found existing user:', dbUserId)
      } else {
        console.log('[Demographics Survey] No existing user, creating new. Lookup error:', lookupError?.message)
        const { data: newUser, error: userError } = await supabaseServer
          .from('users')
          .insert({ prolific_id: pid })
          .select('id')
          .maybeSingle()

        if (newUser) {
          dbUserId = newUser.id
          console.log('[Demographics Survey] Created new user:', dbUserId)
        } else {
          console.warn('[Demographics Survey] Could not create user:', userError?.message)
        }
      }
    } else {
      console.log('[Demographics Survey] userId is valid UUID:', dbUserId)
    }

    const surveyData = {
      gender,
      other_gender: otherGender || null,
      race_ethnicity: Array.isArray(raceEthnicity) ? raceEthnicity.join(', ') : null,
      other_race: otherRace || null,
      education,
      employment,
      income: Number(income),
      us_born: usBorn,
      political,
      other_political: otherPolitical || null,
    }

    let saved = false

    // Step 2: Try inserting into demographics_survey_responses table
    const insertPayload: Record<string, unknown> = {
      ...surveyData,
      submitted_at: new Date().toISOString(),
    }
    if (dbUserId) insertPayload.user_id = dbUserId

    console.log('[Demographics Survey] Insert payload:', JSON.stringify(insertPayload))

    const { data, error } = await supabaseServer
      .from('demographics_survey_responses')
      .insert(insertPayload)
      .select('id')
      .maybeSingle()

    if (!error && data) {
      saved = true
      console.log('[Demographics Survey] saved to demographics_survey_responses table, id:', data.id)
    } else if (error) {
      console.error('[Demographics Survey] insert failed:', error.message, 'code:', error.code)

      // Step 3: Fallback - try updating users table with demo_* columns
      if (dbUserId) {
        const { error: updateError } = await supabaseServer
          .from('users')
          .update({
            demo_gender: surveyData.gender,
            demo_other_gender: surveyData.other_gender,
            demo_race_ethnicity: surveyData.race_ethnicity,
            demo_other_race: surveyData.other_race,
            demo_education: surveyData.education,
            demo_employment: surveyData.employment,
            demo_income: surveyData.income,
            demo_us_born: surveyData.us_born,
            demo_political: surveyData.political,
            demo_other_political: surveyData.other_political,
          })
          .eq('id', dbUserId)

        if (!updateError) {
          saved = true
          console.log('[Demographics Survey] saved to users table columns')
        } else {
          console.error('[Demographics Survey] users table update failed:', updateError.message)
        }
      }
    } else {
      // No error but no data — insert likely succeeded but select returned nothing
      saved = true
      console.log('[Demographics Survey] Insert appears successful (no error, no data returned from select)')
    }

    return NextResponse.json({
      success: true,
      userId: dbUserId || userId,
      saved,
    })
  } catch (error) {
    console.error('[Demographics Survey] server error:', error)
    return NextResponse.json({ success: false, saved: false, error: 'Internal server error' }, { status: 500 })
  }
}