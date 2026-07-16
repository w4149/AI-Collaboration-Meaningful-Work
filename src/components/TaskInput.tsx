"use client"

import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

interface TaskInputProps {
  allowPaste: boolean
}

export default function TaskInput({ allowPaste }: TaskInputProps) {
  const taskSubmission = useAppStore((state) => state.taskSubmission)
  const setTaskSubmission = useAppStore((state) => state.setTaskSubmission)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const preventPaste = (e: ClipboardEvent) => {
      if (!allowPaste) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    const preventDrop = (e: DragEvent) => {
      if (!allowPaste) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }
    
    const preventDragover = (e: DragEvent) => {
      if (!allowPaste) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!allowPaste) {
        // Prevent Ctrl+V and Cmd+V
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
          e.preventDefault()
          e.stopPropagation()
          return false
        }
      }
    }

    const element = textareaRef.current
    if (element) {
      element.addEventListener('paste', preventPaste, true)
      element.addEventListener('drop', preventDrop, true)
      element.addEventListener('dragover', preventDragover, true)
      element.addEventListener('keydown', handleKeyDown, true)
    }

    return () => {
      if (element) {
        element.removeEventListener('paste', preventPaste, true)
        element.removeEventListener('drop', preventDrop, true)
        element.removeEventListener('dragover', preventDragover, true)
        element.removeEventListener('keydown', handleKeyDown, true)
      }
    }
  }, [allowPaste])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTaskSubmission(e.target.value)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Your Response</CardTitle>
          <span className="text-sm text-gray-500">
            {taskSubmission.length} characters
          </span>
        </div>
        {!allowPaste && (
          <p className="text-xs text-amber-600">
            Pasting is disabled for this task
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Textarea
          ref={textareaRef}
          value={taskSubmission}
          onChange={handleChange}
          placeholder="Write your response here..."
          className="flex-1 resize-none min-h-[200px]"
          onPaste={(e) => !allowPaste && e.preventDefault()}
          onDrop={(e) => !allowPaste && e.preventDefault()}
          onDragOver={(e) => !allowPaste && e.preventDefault()}
        />
      </CardContent>
    </Card>
  )
}
