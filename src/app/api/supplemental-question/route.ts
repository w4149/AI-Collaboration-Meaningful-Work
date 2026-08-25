import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      userId: string
      prolificId?: string
      aiFamiliarity: number
      aiWorkExtent: number
      aiInteractionFreq?: number
      aiHelpful?: number
      aiEasy?: number
      aiSpeed?: number
      aiNoUseReasons?: string
      aiNoUseTechIssue?: string | null
      aiNoUseOther?: string | null
      aiSuggestions?: string | null
    }

    const { userId, prolificId, aiFamiliarity, aiWorkExtent } = body

    console.log('[Supplemental Question] Received:', JSON.stringify(body))

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    if (aiFamiliarity === undefined || aiFamiliarity === null) {
      return NextResponse.json({ error: 'Missing aiFamiliarity' }, { status: 400 })
    }

    if (aiWorkExtent === undefined || aiWorkExtent === null) {
      return NextResponse.json({ error: 'Missing aiWorkExtent' }, { status: 400 })
    }

    // Ensure user exists
    const { data: existingUser } = await supabaseServer
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (!existingUser) {
      console.log('[Supplemental Question] User not found, creating...')
      const { error: createError } = await supabaseServer
        .from('users')
        .insert({ id: userId, prolific_id: prolificId || 'unknown' })
      if (createError) {
        console.error('[Supplemental Question] Failed to create user:', createError.message)
      }
    }

    const { error } = await supabaseServer
      .from('supplemental_questions')
      .insert({
        user_id: userId,
        ai_familiarity: Number(aiFamiliarity),
        ai_work_extent: Number(aiWorkExtent),
        ai_interaction_freq: body.aiInteractionFreq ?? null,
        ai_helpful: body.aiHelpful ?? null,
        ai_easy: body.aiEasy ?? null,
        ai_speed: body.aiSpeed ?? null,
        ai_no_use_reasons: body.aiNoUseReasons ?? null,
        ai_no_use_tech_issue: body.aiNoUseTechIssue ?? null,
        ai_no_use_other: body.aiNoUseOther ?? null,
        ai_suggestions: body.aiSuggestions ?? null,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('[Supplemental Question] Insert failed:', error.message)
      return NextResponse.json(
        { error: `Failed to save: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('[Supplemental Question] Saved for user:', userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Supplemental Question] Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}