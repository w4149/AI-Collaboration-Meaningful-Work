import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { userId, prolificId, aiFamiliarity } = await request.json()

    console.log('[Supplemental Question] Received:', JSON.stringify({ userId, aiFamiliarity }))

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    if (aiFamiliarity === undefined || aiFamiliarity === null) {
      return NextResponse.json({ error: 'Missing aiFamiliarity' }, { status: 400 })
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
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('[Supplemental Question] Insert failed:', error.message)
      return NextResponse.json(
        { error: `Failed to save: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('[Supplemental Question] Saved for user:', userId, 'aiFamiliarity:', aiFamiliarity)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Supplemental Question] Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
