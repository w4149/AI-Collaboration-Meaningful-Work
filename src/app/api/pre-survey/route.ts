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
      prolificId,
    } = await request.json()

    console.log('[Pre-Survey] received:', { userId, birthYear, gender, education, employment, prolificId })

    if (!birthYear || !gender || !ethnicBackgrounds || !ethnicBackgrounds.length || !education || !employment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Step 1: Ensure user exists in DB (create if not)
    let dbUserId = userId

    // Check if userId is a valid UUID (not a temp ID like "user_123")
    const isUuid = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)

    if (!isUuid) {
      // Try to find or create user by prolific_id
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
          console.warn('[Pre-Survey] Could not create user:', userError?.message)
        }
      }
    }

    // Compose multi-select ethnic values into a single string
    const ethnicStr = Array.isArray(ethnicBackgrounds) ? ethnicBackgrounds.join(', ') : null

    const surveyData = {
      birth_year: birthYear ? Number(birthYear) : null,
      gender,
      ethnic_background: ethnicStr,
      ethnic_other_text: ethnicOtherText || null,
      education,
      employment,
      employment_other_text: employmentOtherText || null,
    }

    let saved = false

    // Step 2: Try inserting into pre_survey_responses table
    if (dbUserId) {
      const { data, error } = await supabaseServer
        .from('pre_survey_responses')
        .insert({ user_id: dbUserId, ...surveyData, submitted_at: new Date().toISOString() })
        .select('id')
        .single()

      if (!error && data) {
        saved = true
        console.log('[Pre-Survey] saved to pre_survey_responses table')
      } else {
        console.warn('[Pre-Survey] pre_survey_responses insert failed:', error?.message)
      }
    }

    // Step 3: Fallback - try updating users table with pre_* columns
    if (!saved && dbUserId) {
      const { error: updateError } = await supabaseServer
        .from('users')
        .update({
          pre_birth_year: surveyData.birth_year,
          pre_gender: surveyData.gender,
          pre_ethnic_background: surveyData.ethnic_background,
          pre_ethnic_other_text: surveyData.ethnic_other_text,
          pre_education: surveyData.education,
          pre_employment: surveyData.employment,
          pre_employment_other_text: surveyData.employment_other_text,
        })
        .eq('id', dbUserId)

      if (!updateError) {
        saved = true
        console.log('[Pre-Survey] saved to users table columns')
      } else {
        console.warn('[Pre-Survey] users table update failed:', updateError.message)
      }
    }

    // Step 4: Don't block the user flow even if DB save fails
    // Data is also stored in localStorage via the store
    if (!saved) {
      console.warn('[Pre-Survey] DB save failed, proceeding anyway (data in localStorage)')
    }

    return NextResponse.json({
      success: true,
      userId: dbUserId || userId,
      saved,
    })
  } catch (error) {
    console.error('[Pre-Survey] server error:', error)
    // Still return success to not block the user flow
    return NextResponse.json({ success: true, saved: false, error: 'Internal error but proceeding' })
  }
}
