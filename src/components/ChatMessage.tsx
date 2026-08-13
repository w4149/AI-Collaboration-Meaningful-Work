import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
        'max-w-[85%] rounded-lg px-4 py-3',
        isUser
          ? 'bg-blue-600 text-white rounded-tr-none'
          : 'bg-gray-100 text-gray-900 rounded-tl-none'
      )}>
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">{content}</p>
        ) : (
          <div className="markdown-body text-sm leading-relaxed break-words overflow-x-auto">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-3">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="marker:text-gray-500">{children}</li>,
                code: ({ children, node, ...props }: any) => {
                  const isInline = node?.position?.start?.line !== node?.position?.end?.line
                  if (isInline) {
                    return (
                      <code className="px-1.5 py-0.5 rounded bg-gray-200 text-pink-700 text-xs font-mono" {...props}>
                        {children}
                      </code>
                    )
                  }
                  return (
                    <code className="block p-3 rounded-md bg-gray-900 text-green-300 text-xs font-mono overflow-x-auto" {...props}>
                      {children}
                    </code>
                  )
                },
                pre: ({ children }) => <pre className="mb-2">{children}</pre>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-400 pl-3 italic text-gray-600 mb-2">
                    {children}
                  </blockquote>
                ),
                a: ({ children, href }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    {children}
                  </a>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-2">
                    <table className="border-collapse text-xs">{children}</table>
                  </div>
                ),
                th: ({ children }) => <th className="border border-gray-400 px-2 py-1 bg-gray-200 text-left">{children}</th>,
                td: ({ children }) => <td className="border border-gray-400 px-2 py-1">{children}</td>,
                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                hr: () => <hr className="my-3 border-gray-300" />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
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
