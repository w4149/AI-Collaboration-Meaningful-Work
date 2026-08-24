import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import type { ChatCompletionMessageParam } from 'openai/resources/chat'

// Context length limit: use token-based budgeting (16k context window)
const MAX_CONTEXT_TOKENS = 16000
const RESERVE_FOR_RESPONSE = 2000
const CHARS_PER_TOKEN = 4
const PER_MESSAGE_OVERHEAD = 4

function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN) + PER_MESSAGE_OVERHEAD
}

function estimateMessageTokens(msg: { role: string; content: string }): number {
  return estimateTokens(msg.content) + PER_MESSAGE_OVERHEAD
}

// === TEMPORARILY DISABLED: System prompt & task content injection ===
// To re-enable, set these to true
const ENABLE_SYSTEM_PROMPT = false
const ENABLE_TASK_INJECTION = false

export async function POST(request: Request) {
  try {
    const { userId, taskId, message, history } = await request.json()

    if (!userId || !taskId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY

    if (!apiKey) {
      const mockResponse = `[Mock AI] You said: "${message}"\n\nThis is a mock AI response for testing. When you configure a real OPENROUTER_API_KEY, the real AI response will appear here.`
      return NextResponse.json({
        message: mockResponse,
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      })
    }

    const baseURL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-5'

    const OpenAI = (await import('openai')).default
    const client = new OpenAI({ apiKey, baseURL })

    // Get task content for context (skipped when disabled)
    let task: { content_to_display?: string } | null = null
    if (ENABLE_TASK_INJECTION) {
      const result = await supabaseServer
        .from('tasks')
        .select('content_to_display')
        .eq('id', taskId)
        .single()
      task = result.data
    }

    // Build messages array with token budget
    const messages: ChatCompletionMessageParam[] = []
    let tokenBudget = MAX_CONTEXT_TOKENS

    if (ENABLE_SYSTEM_PROMPT) {
      const systemPrompt = `You are a helpful, friendly AI assistant for a research study. Your role is to help participants understand and complete their writing task.

Rules:
- Keep your responses relatively concise (1-3 paragraphs max)
- Don't write the response for the participant - help them think through ideas
- Be encouraging and supportive
- If asked about the task itself, you can discuss general approaches but don't provide a complete answer
- Keep your tone professional but approachable
- Respond in the same language the participant uses (if they write in English, respond in English)`
      messages.push({ role: 'system', content: systemPrompt })
      tokenBudget -= estimateMessageTokens({ role: 'system', content: systemPrompt })
    }

    if (ENABLE_TASK_INJECTION && task?.content_to_display) {
      const taskSnippet = task.content_to_display.length > 2000
        ? task.content_to_display.substring(0, 2000) + '...'
        : task.content_to_display
      const taskMessage = `The task content the participant is working with is:\n\n${taskSnippet}`
      messages.push({ role: 'system', content: taskMessage })
      tokenBudget -= estimateMessageTokens({ role: 'system', content: taskMessage })
    }

    // Reserve tokens for the current message + AI response
    tokenBudget -= estimateMessageTokens({ role: 'user', content: message })
    tokenBudget -= RESERVE_FOR_RESPONSE

    // Add history, trimming from oldest to fit within token budget
    if (history && history.length > 0) {
      let historyTokens = history.reduce((sum, h) => sum + estimateMessageTokens(h), 0)
      let startIdx = 0

      // Trim oldest messages until history fits within budget
      while (historyTokens > tokenBudget && startIdx < history.length - 1) {
        historyTokens -= estimateMessageTokens(history[startIdx])
        startIdx++
      }

      const trimmedHistory = history.slice(startIdx)
      messages.push(...trimmedHistory)
    }

    // Add current message
    messages.push({ role: 'user', content: message })

    // Call OpenRouter with timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout for larger models

    try {
      const completion = await client.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
      }, { signal: controller.signal })
      clearTimeout(timeout)

      const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.'
      const usage = completion.usage
      return NextResponse.json({
        message: assistantMessage,
        usage: usage ? {
          prompt_tokens: usage.prompt_tokens || 0,
          completion_tokens: usage.completion_tokens || 0,
          total_tokens: usage.total_tokens || 0,
        } : null,
      })
    } catch (apiError: any) {
      clearTimeout(timeout)
      const errMsg = apiError?.message || String(apiError)
      console.error('OpenRouter API error:', errMsg)
      if (apiError?.name === 'AbortError') {
        return NextResponse.json({ error: 'AI response timed out. Please try again.' }, { status: 504 })
      }
      if (errMsg.includes('ENOTFOUND') || errMsg.includes('Connection error')) {
        return NextResponse.json({ error: 'AI service is currently unreachable. Please check your network connection.' }, { status: 503 })
      }
      throw apiError
    }
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
