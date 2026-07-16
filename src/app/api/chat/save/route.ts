import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { userId, taskId, role, content, timestamp } = await request.json()

    if (!userId || !taskId || !role || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await supabaseServer
      .from('chat_messages')
      .insert({
        user_id: userId,
        task_id: taskId,
        role: role,
        content: content,
        timestamp: timestamp || new Date().toISOString(),
      })

    if (error) {
      console.error('Error saving chat message:', error)
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in save chat API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
