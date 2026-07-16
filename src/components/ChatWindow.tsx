"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, X, MessageSquare, Loader2 } from 'lucide-react'
import ChatMessage from './ChatMessage'
import { useAppStore } from '@/lib/store'

export default function ChatWindow() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const chatMessages = useAppStore((state) => state.chatMessages)
  const addChatMessage = useAppStore((state) => state.addChatMessage)
  const isChatOpen = useAppStore((state) => state.isChatOpen)
  const toggleChat = useAppStore((state) => state.toggleChat)
  const allowChat = useAppStore((state) => state.allowChat)
  const userId = useAppStore((state) => state.userId)
  const taskId = useAppStore((state) => state.taskId)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
          history: chatMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.message,
        timestamp: new Date(),
      }

      addChatMessage(assistantMessage)
    } catch (error) {
      console.error('Error sending message:', error)
      // Add error message
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
      <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">AI Assistant</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleChat}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chatMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Ask me anything about the task!</p>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={new Date(msg.timestamp)}
              />
            ))
          )}
          {isLoading && (
            <div className="flex w-full mb-4 justify-start">
              <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-3 rounded-tl-none">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
