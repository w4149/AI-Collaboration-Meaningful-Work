import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { userId, taskId, message, history } = await request.json()

    if (!userId || !taskId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 检查是否有OpenAI密钥，没有就使用模拟AI
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      // 使用模拟AI：返回和用户输入一样的内容，并添加一些标记
      const mockResponse = `[模拟AI] 您说的是: "${message}"\n\n这是一个模拟的AI回复，用于测试。当您配置了真实的OPENAI_API_KEY后，这里会显示真实的AI回复。`
      return NextResponse.json({ message: mockResponse })
    }

    // 如果有API密钥，使用真实的OpenAI
    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Get task content for context
    const { data: task } = await supabaseServer
      .from('tasks')
      .select('content_to_display')
      .eq('id', taskId)
      .single()

    // Build messages array
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are a helpful, friendly AI assistant for a research study. Your role is to help participants understand and complete their writing task. 
        
Rules:
- Keep your responses relatively concise (1-3 paragraphs max)
- Don't write the response for the participant - help them think through ideas
- Be encouraging and supportive
- If asked about the task itself, you can discuss general approaches but don't provide a complete answer
- Keep your tone professional but approachable`,
      },
    ]

    if (task?.content_to_display) {
      messages.push({
        role: 'system',
        content: `The task content the participant is working with is:\n\n${task.content_to_display}`,
      })
    }

    // Add history
    if (history && history.length > 0) {
      messages.push(...history)
    }

    // Add current message
    messages.push({ role: 'user', content: message })

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
    })

    const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.'

    return NextResponse.json({ message: assistantMessage })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
