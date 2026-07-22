import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import type { ChatCompletionMessageParam } from 'openai/resources/chat'

// Context length limit: keep last N user/assistant messages to control token costs
const MAX_HISTORY_MESSAGES = 10
const MAX_COMPLETION_TOKENS = 500

export async function POST(request: Request) {
  try {
    const { userId, taskId, message, history } = await request.json()

    if (!userId || !taskId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      const mockResponse = `[模拟AI] 您说的是: "${message}"\n\n这是一个模拟的AI回复，用于测试。当您配置了真实的OPENAI_API_KEY后，这里会显示真实的AI回复。`
      return NextResponse.json({ message: mockResponse })
    }

    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({
      apiKey: openaiApiKey,
      baseURL: process.env.OPENAI_BASE_URL || 'https://aigc-api.hkust-gz.edu.cn/v1',
    })

    // Get task content for context
    const { data: task } = await supabaseServer
      .from('tasks')
      .select('content_to_display')
      .eq('id', taskId)
      .single()

    // Build messages array
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are a helpful, friendly AI assistant for a research study. Your role is to help participants understand and complete their writing task. 
        
Rules:
- Keep your responses relatively concise (1-3 paragraphs max)
- Don't write the response for the participant - help them think through ideas
- Be encouraging and supportive
- If asked about the task itself, you can discuss general approaches but don't provide a complete answer
- Keep your tone professional but approachable
- Respond in the same language the participant uses (if they write in Chinese, respond in Chinese)`,
      },
    ]

    if (task?.content_to_display) {
      // Truncate task content if too long (first 2000 chars)
      const taskSnippet = task.content_to_display.length > 2000
        ? task.content_to_display.substring(0, 2000) + '...'
        : task.content_to_display
      messages.push({
        role: 'system',
        content: `The task content the participant is working with is:\n\n${taskSnippet}`,
      })
    }

    // Add history with limit — keep only last N messages for context isolation & cost control
    if (history && history.length > 0) {
      const trimmedHistory = history.slice(-MAX_HISTORY_MESSAGES)
      messages.push(...trimmedHistory)
    }

    // Add current message
    messages.push({ role: 'user', content: message })

    // Call OpenAI GPT-4 with timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000) // 15s timeout

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: MAX_COMPLETION_TOKENS,
      }, { signal: controller.signal })
      clearTimeout(timeout)

      const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.'
      return NextResponse.json({ message: assistantMessage })
    } catch (apiError: any) {
      clearTimeout(timeout)
      const errMsg = apiError?.message || String(apiError)
      console.error('OpenAI API error:', errMsg)
      if (apiError?.name === 'AbortError') {
        return NextResponse.json({ error: 'AI response timed out. Please try again.' }, { status: 504 })
      }
      if (errMsg.includes('ENOTFOUND') || errMsg.includes('Connection error')) {
        return NextResponse.json({ error: 'AI service is currently unreachable. Please check your network connection (VPN required).' }, { status: 503 })
      }
      throw apiError
    }
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
