"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { X, MessageSquare, Loader2 } from 'lucide-react'
import ChatMessage from './ChatMessage'
import { useAppStore } from '@/lib/store'

// Max input: ~6000 words (≈ 30000 chars, avg 5 chars/word for English)
const MAX_INPUT_CHARS = 30000

export default function ChatWindow({ disabled = false }: { disabled?: boolean }) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  const chatMessages = useAppStore((state) => state.chatMessages)
  const addChatMessage = useAppStore((state) => state.addChatMessage)
  const incrementAiTokens = useAppStore((state) => state.incrementAiTokens)
  const isChatOpen = useAppStore((state) => state.isChatOpen)
  const toggleChat = useAppStore((state) => state.toggleChat)
  const allowChat = useAppStore((state) => state.allowChat)
  const groupType = useAppStore((state) => state.groupType)
  const userId = useAppStore((state) => state.userId)
  const taskId = useAppStore((state) => state.taskId)

  const userScrolledUpRef = useRef(false)

  const handleChatScroll = () => {
    const container = chatContainerRef.current
    if (!container) return
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    userScrolledUpRef.current = distanceFromBottom > 100
  }

  const scrollChatToBottom = () => {
    const container = chatContainerRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }

  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return
    if (!userScrolledUpRef.current) {
      scrollChatToBottom()
    }
  }, [chatMessages])

  const handleSend = async () => {
    if (!input.trim() || isLoading || !userId || !taskId) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date(),
    }

    addChatMessage(userMessage)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          taskId,
          message: userMessage.content,
          history: chatMessages
            .filter(msg => msg.id !== userMessage.id)
            .map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `Server error ${response.status}`)
      }

      const data = await response.json()

      if (data.usage?.total_tokens) {
        incrementAiTokens(data.usage.total_tokens)
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.message,
        timestamp: new Date(),
      }

      addChatMessage(assistantMessage)
    } catch (error: any) {
      console.error('Error sending message:', error)
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error?.message || 'Unknown error. Please try again.'}`,
        timestamp: new Date(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter = 换行，不再发送；仅点击发送按钮（或 Ctrl/Cmd+Enter）才发送
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!allowChat) {
    return null
  }

  if (!isChatOpen) {
    return (
      <Button
        onClick={toggleChat}
        className="fixed right-4 bottom-4 rounded-full w-14 h-14 shadow-lg"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 border-b">
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">AI Assistant</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleChat}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed mt-2">
          <strong className="font-semibold">Reminder:</strong>{' '}
          {groupType === 'G3-HumanAndAI'
            ? 'Use the AI assistant to review and improve your initial response. Please provide it with your initial response and the task-related materials.'
            : 'Use the AI assistant to complete the task. Please provide it with the task\u2011related materials.'}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div ref={chatContainerRef} onScroll={handleChatScroll} className="flex-1 overflow-y-auto p-4 space-y-2">
          {chatMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Ask me anything!</p>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp}
              />
            ))
          )}
          {isLoading && (
            <div className="flex w-full mb-4 justify-start">
              <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-3 rounded-tl-none flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_CHARS))}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to go to a new line. Click “Send” to send the message.)"
              disabled={isLoading || disabled}
              rows={4}
              className="flex-1 resize-none min-h-[108px] max-h-[200px] overflow-y-auto"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || disabled}
              size="sm"
              className="shrink-0"
            >
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
