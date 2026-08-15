"use client"

import { useEffect, useRef, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface InfoDisplayProps {
  content: string | null
  allowCopy: boolean
  title?: string
}

export default function InfoDisplay({ content, allowCopy, title = "Task Information" }: InfoDisplayProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  // Store allowCopy in a ref so event handlers always read the latest value
  // without needing to re-register listeners on every change
  const allowCopyRef = useRef(allowCopy)
  allowCopyRef.current = allowCopy

  // Register listeners ONCE — never re-run, never interrupt text selection
  useEffect(() => {
    const preventIfDisabled = (e: Event) => {
      if (!allowCopyRef.current) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!allowCopyRef.current) {
        const target = e.target as HTMLElement
        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return

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
      element.addEventListener('copy', preventIfDisabled, true)
      element.addEventListener('cut', preventIfDisabled, true)
      element.addEventListener('dragstart', preventIfDisabled, true)
      element.addEventListener('contextmenu', preventIfDisabled, true)
      element.addEventListener('selectstart', preventIfDisabled, true)
      document.addEventListener('keydown', handleKeyDown, true)
    }

    return () => {
      if (element) {
        element.removeEventListener('copy', preventIfDisabled, true)
        element.removeEventListener('cut', preventIfDisabled, true)
        element.removeEventListener('dragstart', preventIfDisabled, true)
        element.removeEventListener('contextmenu', preventIfDisabled, true)
        element.removeEventListener('selectstart', preventIfDisabled, true)
      }
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, []) // empty deps — register once

  // Memoize markdown rendering to avoid re-rendering when parent updates
  const markdownContent = useMemo(() => {
    if (!content) return null
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
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
            <ul className="list-disc list-outside pl-6 mb-2 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-6 mb-2 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="list-item">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          img: ({ src, alt }) => (
            <img src={src} alt={alt} className="max-w-[60%] h-auto rounded-lg my-3" />
          ),
          hr: () => (
            <hr className="my-3 border-gray-300" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    )
  }, [content])

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
        className={`flex-1 overflow-y-auto pr-2 ${
          !allowCopy ? 'select-none' : 'select-text'
        }`}
        style={{
          maxHeight: 'calc(100vh - 200px)',
          userSelect: !allowCopy ? 'none' : 'text',
          WebkitUserSelect: !allowCopy ? 'none' : 'text',
        }}
      >
        <div className="prose prose-sm max-w-none">
          {markdownContent ? (
            <div className="text-gray-700 leading-relaxed">
              {markdownContent}
            </div>
          ) : (
            <p className="text-gray-400 italic">Loading task content...</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
