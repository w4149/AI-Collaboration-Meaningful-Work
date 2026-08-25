import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const {
      taskId,
      clarity,
      unclearDescription,
      difficulty,
      timeSufficient,
      waitTime,
      agreement,
      familiarity,
      attentionCheck2,
      prolificId,
      userId,
    } = await request.json()

    console.log('[Post-Task Survey] received:', { taskId, clarity, difficulty, timeSufficient, waitTime, familiarity })

    if (!clarity || !difficulty || !timeSufficient || !waitTime || !familiarity || !agreement) {
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
          console.warn('[Post-Task Survey] Could not create user:', userError?.message)
        }
      }
    }

    const surveyData = {
      task_id: taskId || null,
      clarity: Number(clarity),
      unclear_description: unclearDescription || null,
      difficulty: Number(difficulty),
      time_sufficient: Number(timeSufficient),
      wait_time: Number(waitTime),
      familiarity: Number(familiarity),
      analyze_info: agreement.analyze_info ?? null,
      generate_ideas: agreement.generate_ideas ?? null,
      doing_similar_repeatedly: agreement.repeatedly ?? null,
      consider_feelings: agreement.consider_feelings ?? null,
      logical_reasoning: agreement.logical_reasoning ?? null,
      repetitive_steps: agreement.repetitive_steps ?? null,
      imagination: agreement.imagination ?? null,
      consider_perspective: agreement.consider_perspective ?? null,
      follow_procedure: agreement.follow_procedure ?? null,
      creative_thinking: agreement.creative_thinking ?? null,
      think_reaction: agreement.think_reaction ?? null,
      compare_evaluate: agreement.compare_evaluate ?? null,
    }

    let saved = false

    // Step 2: Try inserting into post_task_surveys table
    const insertPayload: Record<string, unknown> = {
      ...surveyData,
      submitted_at: new Date().toISOString(),
    }
    if (dbUserId) insertPayload.user_id = dbUserId

    const { data, error } = await supabaseServer
      .from('post_task_surveys')
      .insert(insertPayload)
      .select('id')
      .single()

    if (!error && data) {
      saved = true
      console.log('[Post-Task Survey] saved to post_task_surveys table, id:', data.id)
    } else {
      console.error('[Post-Task Survey] post_task_surveys insert failed:', error?.message)

      // Step 3: Fallback - try updating users table with post_* columns
      if (dbUserId) {
        const { error: updateError } = await supabaseServer
          .from('users')
          .update({
            post_task_id: surveyData.task_id,
            post_clarity: surveyData.clarity,
            post_unclear_description: surveyData.unclear_description,
            post_difficulty: surveyData.difficulty,
            post_time_sufficient: surveyData.time_sufficient,
            post_wait_time: surveyData.wait_time,
            post_familiarity: surveyData.familiarity,
            post_analyze_info: surveyData.analyze_info,
            post_generate_ideas: surveyData.generate_ideas,
            post_doing_similar_repeatedly: surveyData.doing_similar_repeatedly,
            post_consider_feelings: surveyData.consider_feelings,
            post_logical_reasoning: surveyData.logical_reasoning,
            post_repetitive_steps: surveyData.repetitive_steps,
            post_imagination: surveyData.imagination,
            post_consider_perspective: surveyData.consider_perspective,
            post_follow_procedure: surveyData.follow_procedure,
            post_creative_thinking: surveyData.creative_thinking,
            post_think_reaction: surveyData.think_reaction,
            post_compare_evaluate: surveyData.compare_evaluate,
          })
          .eq('id', dbUserId)

        if (!updateError) {
          saved = true
          console.log('[Post-Task Survey] saved to users table columns')
        } else {
          console.error('[Post-Task Survey] users table update failed:', updateError.message)
        }
      }
    }

    // Step 4: Save attention check answer (check2_answer) to attention_checks table
    if (dbUserId && attentionCheck2 !== undefined) {
      const { error: acError } = await supabaseServer
        .from('attention_checks')
        .upsert(
          {
            user_id: dbUserId,
            check2_answer: Number(attentionCheck2),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )

      if (acError) {
        console.error('[Post-Task Survey] attention_checks upsert failed:', acError.message)
      } else {
        console.log('[Post-Task Survey] check2_answer saved:', Number(attentionCheck2))
      }
    }

    return NextResponse.json({
      success: true,
      userId: dbUserId || userId,
      saved,
    })
  } catch (error) {
    console.error('[Post-Task Survey] server error:', error)
    return NextResponse.json({ success: true, saved: false, error: 'Internal error but proceeding' })
  }
}