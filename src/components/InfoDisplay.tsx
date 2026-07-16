"use client"

import { useEffect, useRef } from 'react'
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
              className="whitespace-pre-wrap text-gray-700 leading-relaxed"
              style={{ userSelect: !allowCopy ? 'none' : 'text' }}
            >
              {content}
            </div>
          ) : (
            <p className="text-gray-400 italic">Loading task content...</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}