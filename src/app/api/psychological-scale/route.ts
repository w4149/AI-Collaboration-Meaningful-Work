import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const {
      taskId,
      meaning,
      ownership,
      mentalEffort,
      autonomy,
      skill,
      attentionCheck,
      prolificId,
      userId,
    } = await request.json()

    console.log('[Psychological Scale] received:', { taskId, mentalEffort })

    if (!meaning || !ownership || !mentalEffort || !autonomy || !skill) {
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
          console.warn('[Psychological Scale] Could not create user:', userError?.message)
        }
      }
    }

    const surveyData = {
      task_id: taskId || null,
      meaningful: meaning.meaningful ?? null,
      contributed_growth: meaning.contributed_growth ?? null,
      sense_of_purpose: meaning.sense_of_purpose ?? null,
      worthwhile: meaning.worthwhile ?? null,
      my_task_output: ownership.my_task_output ?? null,
      sense_of_belonging: ownership.sense_of_belonging ?? null,
      personal_ownership: ownership.personal_ownership ?? null,
      this_is_my_task: ownership.this_is_my_task ?? null,
      hard_to_think_mine: ownership.hard_to_think_mine ?? null,
      mental_effort: Number(mentalEffort),
      decide_own_how: autonomy.decide_own_how ?? null,
      make_decisions_own: autonomy.make_decisions_own ?? null,
      opportunity_independence: autonomy.opportunity_independence ?? null,
      personal_initiative: autonomy.personal_initiative ?? null,
      learn_new_things: skill.learn_new_things ?? null,
      utilize_abilities: skill.utilize_abilities ?? null,
      use_talent_skills: skill.use_talent_skills ?? null,
      develop_skills: skill.develop_skills ?? null,
    }

    let saved = false

    // Step 2: Try inserting into psychological_scales table
    const insertPayload: Record<string, unknown> = {
      ...surveyData,
      submitted_at: new Date().toISOString(),
    }
    if (dbUserId) insertPayload.user_id = dbUserId

    const { data, error } = await supabaseServer
      .from('psychological_scales')
      .insert(insertPayload)
      .select('id')
      .single()

    if (!error && data) {
      saved = true
      console.log('[Psychological Scale] saved, id:', data.id)
    } else {
      console.error('[Psychological Scale] insert failed:', error?.message)

      // Step 3: Fallback - try updating users table
      if (dbUserId) {
        const { error: updateError } = await supabaseServer
          .from('users')
          .update({
            psy_task_id: surveyData.task_id,
            psy_meaningful: surveyData.meaningful,
            psy_contributed_growth: surveyData.contributed_growth,
            psy_sense_of_purpose: surveyData.sense_of_purpose,
            psy_worthwhile: surveyData.worthwhile,
            psy_my_task_output: surveyData.my_task_output,
            psy_sense_of_belonging: surveyData.sense_of_belonging,
            psy_personal_ownership: surveyData.personal_ownership,
            psy_this_is_my_task: surveyData.this_is_my_task,
            psy_hard_to_think_mine: surveyData.hard_to_think_mine,
            psy_mental_effort: surveyData.mental_effort,
            psy_decide_own_how: surveyData.decide_own_how,
            psy_make_decisions_own: surveyData.make_decisions_own,
            psy_opportunity_independence: surveyData.opportunity_independence,
            psy_personal_initiative: surveyData.personal_initiative,
            psy_learn_new_things: surveyData.learn_new_things,
            psy_utilize_abilities: surveyData.utilize_abilities,
            psy_use_talent_skills: surveyData.use_talent_skills,
            psy_develop_skills: surveyData.develop_skills,
          })
          .eq('id', dbUserId)

        if (!updateError) {
          saved = true
          console.log('[Psychological Scale] saved to users table columns')
        } else {
          console.error('[Psychological Scale] users table update failed:', updateError.message)
        }
      }
    }

    // Step 4: Save attention check answer (check1_answer) to attention_checks table
    if (dbUserId && attentionCheck !== undefined) {
      const { error: acError } = await supabaseServer
        .from('attention_checks')
        .upsert(
          {
            user_id: dbUserId,
            check1_answer: Number(attentionCheck),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )

      if (acError) {
        console.error('[Psychological Scale] attention_checks upsert failed:', acError.message)
      } else {
        console.log('[Psychological Scale] check1_answer saved:', Number(attentionCheck))
      }
    }

    return NextResponse.json({
      success: true,
      userId: dbUserId || userId,
      saved,
    })
  } catch (error) {
    console.error('[Psychological Scale] server error:', error)
    return NextResponse.json({ success: true, saved: false, error: 'Internal error but proceeding' })
  }
}
