"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { HelpCircle } from 'lucide-react'
import { useAppStore } from '@/lib/store'

interface NavigationProps {
  onShowInstructions?: () => void
}

export default function Navigation({ onShowInstructions }: NavigationProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const startTime = useAppStore((state) => state.startTime)
  const taskType = useAppStore((state) => state.taskType)

  useEffect(() => {
    if (!startTime) return

    const timer = setInterval(() => {
      const now = new Date()
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      setElapsedTime(diff)
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">AI Collaboration Study</h1>
          {taskType && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Task: {taskType}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-sm">Time:</span>
            <span className="font-mono font-semibold text-lg">{formatTime(elapsedTime)}</span>
          </div>
          
          {onShowInstructions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowInstructions}
              className="flex items-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Instructions</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
