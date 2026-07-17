"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import Navigation from '@/components/Navigation'
import InfoDisplay from '@/components/InfoDisplay'
import TaskInput from '@/components/TaskInput'
import ChatWindow from '@/components/ChatWindow'
import { useAppStore } from '@/lib/store'

const UNLOCK_DELAY_MINUTES = 5

export default function TaskPage() {
  const router = useRouter()
  const [showInstructions, setShowInstructions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  
  const userId = useAppStore((state) => state.userId)
  const taskId = useAppStore((state) => state.taskId)
  const taskContent = useAppStore((state) => state.taskContent)
  const taskType = useAppStore((state) => state.taskType)
  const allowCopy = useAppStore((state) => state.allowCopy)
  const allowPaste = useAppStore((state) => state.allowPaste)
  const allowChat = useAppStore((state) => state.allowChat)
  const taskSubmission = useAppStore((state) => state.taskSubmission)
  const chatMessages = useAppStore((state) => state.chatMessages)
  const isChatOpen = useAppStore((state) => state.isChatOpen)
  const groupType = useAppStore((state) => state.groupType)
  const startTime = useAppStore((state) => state.startTime)
  const unlockFeatures = useAppStore((state) => state.unlockFeatures)
  const setTaskDuration = useAppStore((state) => state.setTaskDuration)

  useEffect(() => {
    if (!userId || !taskId) {
      router.push('/entry')
    }
  }, [userId, taskId, router])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = 'Your work will be lost if you leave this page. Are you sure?'
      return e.returnValue
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  useEffect(() => {
    if (groupType !== 'G2-HumanAndAI' || !startTime) {
      setCountdown(null)
      return
    }

    const targetTime = new Date(startTime.getTime() + UNLOCK_DELAY_MINUTES * 60 * 1000)
    
    const updateCountdown = () => {
      const now = new Date()
      const remaining = targetTime.getTime() - now.getTime()
      
      if (remaining <= 0) {
        setCountdown(0)
        unlockFeatures()
        return
      }
      
      setCountdown(Math.ceil(remaining / 1000))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    
    return () => clearInterval(interval)
  }, [groupType, startTime, unlockFeatures])

  const handleSubmit = async () => {
    if (!taskSubmission.trim()) {
      alert('Please write a response before submitting.')
      return
    }
    
    setShowConfirmDialog(true)
  }

  const confirmSubmit = async () => {
    setIsSubmitting(true)
    setShowConfirmDialog(false)

    try {
      if (startTime) {
        const endTime = new Date()
        const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
        setTaskDuration(duration)
      }

      for (const msg of chatMessages) {
        await fetch('/api/chat/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            taskId,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
          }),
        })
      }

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          taskId,
          content: taskSubmission,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit')

      router.push('/survey')
    } catch (error) {
      console.error('Error submitting task:', error)
      alert('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!userId || !taskId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation onShowInstructions={() => setShowInstructions(true)} />
      
      {groupType === 'G2-HumanAndAI' && countdown !== null && countdown > 0 && (
        <div className="bg-amber-100 border-b border-amber-200 px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-amber-500 text-white border-amber-500">
              AI Assistant Unlocking Soon
            </Badge>
            <span className="text-amber-700 font-semibold">
              {formatCountdown(countdown)}
            </span>
          </div>
        </div>
      )}

      {groupType === 'G2-HumanAndAI' && countdown === 0 && (
        <div className="bg-green-100 border-b border-green-200 px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-green-500 text-white border-green-500">
              Unlocked!
            </Badge>
            <span className="text-green-700">AI Assistant and copy/paste are now available</span>
          </div>
        </div>
      )}
      
      <main className="flex-1 flex flex-col p-4 lg:p-6">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          <div className={`lg:col-span-7 ${!isChatOpen || !allowChat ? 'lg:col-span-12' : ''} flex flex-col gap-4`}>
            <div className="flex-1 min-h-[300px]">
              <InfoDisplay 
                content={taskContent} 
                allowCopy={allowCopy} 
              />
            </div>
            <div className="min-h-[250px]">
              <TaskInput allowPaste={allowPaste} />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Task'}
              </Button>
            </div>
          </div>
          
          {allowChat && isChatOpen && (
            <div className="lg:col-span-5">
              <div className="h-[calc(100vh-140px)] min-h-[500px]">
                <ChatWindow />
              </div>
            </div>
          )}
        </div>
      </main>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Task Instructions</DialogTitle>
            <DialogDescription>
              Please review the instructions before continuing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Your Task</h4>
              <p className="text-blue-700 text-sm">
                Read the text in the top-left panel carefully, then write your response in the box below it.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Guidelines</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>You may use the AI assistant for help and clarification</li>
                <li>Take your time - there is no strict time limit</li>
                <li>Your response will be saved automatically as you type</li>
                <li>When you are ready, click &quot;Submit Task&quot; to continue</li>
              </ul>
            </div>
            {groupType === 'G2-HumanAndAI' && (
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-semibold text-amber-800 mb-2">G2 - Human + AI Group</h4>
                <p className="text-amber-700 text-sm">
                  AI assistant and copy/paste features will be unlocked after 5 minutes.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Your Task?</DialogTitle>
            <DialogDescription>
              Once you submit, you will not be able to make changes to your response.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}