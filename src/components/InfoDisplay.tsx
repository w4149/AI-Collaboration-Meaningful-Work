"use client"

import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface InfoDisplayProps {
  content: string | null
  allowCopy: boolean
  title?: string
}

export default function InfoDisplay({ content, allowCopy, title = "Task Information" }: InfoDisplayProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const preventCopy = (e: ClipboardEvent) => {
      if (!allowCopy) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    const preventCut = (e: ClipboardEvent) => {
      if (!allowCopy) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    const preventDragStart = (e: DragEvent) => {
      if (!allowCopy) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    const preventContextMenu = (e: MouseEvent) => {
      if (!allowCopy) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    const preventSelectStart = (e: Event) => {
      if (!allowCopy) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!allowCopy) {
        const target = e.target as HTMLElement
        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
          return
        }
        
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x' || e.key === 'a')) {
          e.preventDefault()
          e.stopPropagation()
          return false
        }
        if (e.key === 'PrintScreen') {
          e.preventDefault()
          return false
        }
      }
    }

    const element = contentRef.current
    if (element) {
      element.addEventListener('copy', preventCopy, true)
      element.addEventListener('cut', preventCut, true)
      element.addEventListener('dragstart', preventDragStart, true)
      element.addEventListener('contextmenu', preventContextMenu, true)
      element.addEventListener('selectstart', preventSelectStart, true)
      document.addEventListener('keydown', handleKeyDown, true)
    }

    return () => {
      if (element) {
        element.removeEventListener('copy', preventCopy, true)
        element.removeEventListener('cut', preventCut, true)
        element.removeEventListener('dragstart', preventDragStart, true)
        element.removeEventListener('contextmenu', preventContextMenu, true)
        element.removeEventListener('selectstart', preventSelectStart, true)
      }
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [allowCopy])

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {!allowCopy && (
          <p className="text-xs text-amber-600">
            Copying and screenshots are disabled for this task
          </p>
        )}
      </CardHeader>
      <CardContent 
        ref={contentRef}
        className={`flex-1 overflow-y-auto scroll-smooth pr-2 ${
          !allowCopy ? 'select-none' : ''
        }`}
        style={{
          maxHeight: 'calc(100vh - 200px)',
          userSelect: !allowCopy ? 'none' : 'text',
          WebkitUserSelect: !allowCopy ? 'none' : 'text',
          msUserSelect: !allowCopy ? 'none' : 'text',
        }}
        onContextMenu={(e) => !allowCopy && e.preventDefault()}
        onCopy={(e) => !allowCopy && e.preventDefault()}
        onCut={(e) => !allowCopy && e.preventDefault()}
        onDragStart={(e) => !allowCopy && e.preventDefault()}
      >
        <div className="prose prose-sm max-w-none">
          {content ? (
            <div
              className="text-gray-700 leading-relaxed"
              style={{ userSelect: !allowCopy ? 'none' : 'text' }}
            >
              <ReactMarkdown
                components={{
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3">
                      <table className="min-w-full border border-gray-300 text-sm">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-gray-100">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-gray-300 px-3 py-2">{children}</td>
                  ),
                  tr: ({ children }) => (
                    <tr className="border-b border-gray-200">{children}</tr>
                  ),
                  h4: ({ children }) => (
                    <h4 className="font-semibold text-gray-900 mt-3 mb-1">{children}</h4>
                  ),
                  p: ({ children }) => (
                    <p className="mb-2">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li>{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold">{children}</strong>
                  ),
                  hr: () => (
                    <hr className="my-3 border-gray-300" />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-gray-400 italic">Loading task content...</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}