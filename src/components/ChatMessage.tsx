import { cn } from '@/lib/utils'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === 'user'
  
  return (
    <div className={cn(
      'flex w-full mb-4',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'max-w-[80%] rounded-lg px-4 py-3',
        isUser 
          ? 'bg-blue-600 text-white rounded-tr-none'
          : 'bg-gray-100 text-gray-900 rounded-tl-none'
      )}>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
        <p className={cn(
          'text-xs mt-2',
          isUser ? 'text-blue-200' : 'text-gray-500'
        )}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}
