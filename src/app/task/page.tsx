"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

const SUBMIT_MINUTES: Record<string, number> = {
  'G1-Human': 10,
  'G2-AI': 5,
  'G3-HumanAndAI': 5,
}

const AUTO_REDIRECT_MINUTES = 10

export default function TaskPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const qs = searchParams.toString()
  const withParams = (path: string) => (qs ? `${path}?${qs}` : path)
  const [showInstructions, setShowInstructions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [submitCountdown, setSubmitCountdown] = useState<number | null>(null)
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null)
  const [showAutoSubmitWarning, setShowAutoSubmitWarning] = useState(false)
  const autoSubmitTriggered = useRef(false)
  const skipBeforeUnload = useRef(false)
  const [phase2StartTime, setPhase2StartTime] = useState<Date | null>(null)

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
  const currentPhase = useAppStore((state) => state.currentPhase)
  const setCurrentPhase = useAppStore((state) => state.setCurrentPhase)
  const taskSubmitted = useAppStore((state) => state.taskSubmitted)
  const setTaskSubmitted = useAppStore((state) => state.setTaskSubmitted)

  const submitMinutes = groupType ? (SUBMIT_MINUTES[groupType] ?? 5) : 5

  const handlePhase1AutoSubmit = useCallback(async () => {
    // Save Phase 1 submission and chat, then transition to Phase 2
    const submission = taskSubmissionRef.current
    const messages = chatMessagesRef.current

    try {
      if (submission.trim()) {
        await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, taskId, content: submission }),
        })
      }
      for (const msg of messages) {
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
    } catch (error) {
      console.error('Phase 1 auto-save error:', error)
    }

    // Transition to Phase 2
    setCurrentPhase(2)
    unlockFeatures()
    setPhase2StartTime(new Date())
  }, [userId, taskId, setCurrentPhase, unlockFeatures])

  const handleAutoSubmit = useCallback(async () => {
    if (autoSubmitTriggered.current) return
    autoSubmitTriggered.current = true

    const submission = taskSubmissionRef.current
    const messages = chatMessagesRef.current

    if (!submission.trim()) {
      skipBeforeUnload.current = true
      setTaskSubmitted(true)
      router.replace(withParams('/post-task-survey'))
      return
    }

    setIsSubmitting(true)
    try {
      if (startTime) {
        const endTime = new Date()
        const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
        setTaskDuration(duration)
      }
      for (const msg of messages) {
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
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, taskId, content: submission }),
      })
      skipBeforeUnload.current = true
      setTaskSubmitted(true)
      router.replace(withParams('/post-task-survey'))
    } catch (error) {
      console.error('Auto-submit error:', error)
    }
  }, [startTime, userId, taskId, setTaskDuration, setTaskSubmitted, router])

  // Use refs to always have latest values for auto-submit
  const taskSubmissionRef = useRef(taskSubmission)
  const chatMessagesRef = useRef(chatMessages)
  const isSubmittingRef = useRef(isSubmitting)

  useEffect(() => { taskSubmissionRef.current = taskSubmission }, [taskSubmission])
  useEffect(() => { chatMessagesRef.current = chatMessages }, [chatMessages])
  useEffect(() => { isSubmittingRef.current = isSubmitting }, [isSubmitting])

  // Prevent re-entry after submission
  useEffect(() => {
    if (taskSubmitted) {
      skipBeforeUnload.current = true
      router.replace(withParams('/post-task-survey'))
    }
  }, [taskSubmitted, router])

  // Instructions are now shown on the entry page — dialog only opens on manual request
  // G3 Phase 2 transition still auto-shows since it introduces new rules
  useEffect(() => {
    if (groupType === 'G3-HumanAndAI' && currentPhase === 2) {
      setShowInstructions(true)
    }
  }, [groupType, currentPhase])

  // For G3, the effective timer base depends on current phase
  const effectiveStartTime = groupType === 'G3-HumanAndAI' && currentPhase === 2 && phase2StartTime
    ? phase2StartTime
    : startTime

  // Unified timer: auto-redirect countdown + minimum submit countdown
  useEffect(() => {
    if (!effectiveStartTime) {
      setRedirectCountdown(null)
      setSubmitCountdown(null)
      return
    }

    autoSubmitTriggered.current = false

    const autoTargetTime = new Date(effectiveStartTime.getTime() + AUTO_REDIRECT_MINUTES * 60 * 1000)
    const submitTargetTime = new Date(effectiveStartTime.getTime() + submitMinutes * 60 * 1000)
    const warningTime = new Date(effectiveStartTime.getTime() + (AUTO_REDIRECT_MINUTES - 1) * 60 * 1000)
    let warningShown = false

    const updateCountdown = () => {
      const now = new Date()
      const autoRemaining = autoTargetTime.getTime() - now.getTime()
      const submitRemaining = submitTargetTime.getTime() - now.getTime()

      // Show 1-minute warning before auto-submit
      if (!warningShown && now >= warningTime) {
        warningShown = true
        setShowAutoSubmitWarning(true)
      }

      // Auto-submit / phase switch when time is up
      if (autoRemaining <= 0) {
        setRedirectCountdown(0)
        setSubmitCountdown(0)
        setShowAutoSubmitWarning(false)
        if (groupType === 'G3-HumanAndAI' && currentPhase === 1) {
          handlePhase1AutoSubmit()
        } else {
          handleAutoSubmit()
        }
        return
      }

      setRedirectCountdown(Math.ceil(autoRemaining / 1000))
      setSubmitCountdown(submitRemaining > 0 ? Math.ceil(submitRemaining / 1000) : 0)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [effectiveStartTime, submitMinutes, groupType, currentPhase, handleAutoSubmit, handlePhase1AutoSubmit])

  // Prevent leaving task page (skip during auto-submit)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (skipBeforeUnload.current) return
      e.preventDefault()
      e.returnValue = 'Are you sure you want to leave? Your progress will be lost.'
      return e.returnValue
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const handleSubmit = async () => {
    if (!taskSubmission.trim()) {
      alert('Please write a response before submitting.')
      return
    }

    if (submitCountdown !== null && submitCountdown > 0) {
      alert(`Please wait at least ${submitMinutes} minutes before submitting. Time remaining: ${formatCountdown(submitCountdown)}`)
      return
    }

    setShowConfirmDialog(true)
  }

  const confirmSubmit = async () => {
    setIsSubmitting(true)
    setShowConfirmDialog(false)

    // G3 Phase 1: save and transition to Phase 2
    if (groupType === 'G3-HumanAndAI' && currentPhase === 1) {
      try {
        if (taskSubmission.trim()) {
          await fetch('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, taskId, content: taskSubmission }),
          })
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
        setCurrentPhase(2)
        unlockFeatures()
        setPhase2StartTime(new Date())
      } catch (error) {
        console.error('Error transitioning to Phase 2:', error)
        alert('Failed to proceed. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    // Normal submit (Phase 2 or non-G3 groups) → survey
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

      skipBeforeUnload.current = true
      setTaskSubmitted(true)
      router.replace(withParams('/post-task-survey'))
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

  // Instruction content per group
  const getInstructions = () => {
    if (groupType === 'G1-Human') {
      return (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-blue-700 text-sm">
              Please write and revise your response below, breaking it into paragraphs as appropriate for readability. <strong>Do not</strong> use any assistance (e.g., AI tools, search engines, etc.). Use <strong>YOUR OWN</strong> knowledge and skills to complete the task from start to finish.
            </p>
          </div>
          <div className="bg-amber-50 p-3 rounded">
            <p className="text-amber-700 text-sm">
              [Note: copy and paste function is <strong>disabled</strong> for this text box. You will not be allowed to advance before <strong>10</strong> minutes, and the page will advance automatically at <strong>10</strong> minutes. Please dedicate your full effort to the writing task during this period.]
            </p>
          </div>
        </div>
      )
    }

    if (groupType === 'G2-AI') {
      return (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-blue-700 text-sm">
              Please use the ChatGPT AI tool available <strong>in this interface</strong>, interacting freely with the AI until you arrive at an answer you are satisfied with. Then paste the final AI-generated content you decide to submit into the box below.
            </p>
          </div>
          <div className="bg-amber-50 p-3 rounded">
            <p className="text-amber-700 text-sm">
              [Note: You will not be allowed to advance before <strong>5</strong> minutes, and the page will advance automatically at <strong>10</strong> minutes. Please dedicate your full effort to the writing task during this period.]
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="text-green-700 text-sm">
              <strong>Using the AI Assistant</strong> <br />
              During the task, you will be able to communicate with an AI assistant using the chat box provided in the right panel.<br />
              Type a message in the chat box and click <strong>Send</strong> to send it to the AI assistant. You may send multiple messages and follow up on previous responses.<br />
              You may use the AI assistant in any way you find helpful for completing the task.<br />
              You are responsible for submitting your final response.
            </p>
          </div>
        </div>
      )
    }

    if (groupType === 'G3-HumanAndAI') {
      if (currentPhase === 1) {
        return (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-blue-700 text-sm">
                <strong>Phase 1 — Draft:</strong> Please write and revise your response below, breaking it into paragraphs as appropriate for readability. In this initial draft, <strong>do not</strong> use any assistance (e.g., AI tools, search engines, etc.). Use <strong>YOUR OWN</strong> knowledge and skills to complete the task from start to finish.
              </p>
            </div>
            <div className="bg-amber-50 p-3 rounded">
              <p className="text-amber-700 text-sm">
                [Note: copy and paste function is <strong>disabled</strong> for this text box. You will not be allowed to advance before <strong>5</strong> minutes, and the page will advance automatically at <strong>10</strong> minutes. Please dedicate your full effort to the writing task during this period.]
              </p>
            </div>
          </div>
        )
      }
      return (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-green-50 p-3 rounded">
            <p className="text-green-700 text-sm">
              <strong>Phase 2 — Revise with AI:</strong> Please use ChatGPT <strong>in this interface</strong>, interacting freely with the AI to review and revise the draft you just wrote, then enter the version improved by AI into the box below. You may make any further adjustments to the AI&apos;s edits that you see fit — this version will serve as your final submission.
            </p>
          </div>
          <div className="bg-amber-50 p-3 rounded">
            <p className="text-amber-700 text-sm">
              [Note: Copy and paste is <strong>enabled</strong> for this text box. You will not be allowed to advance before <strong>5</strong> minutes, and the page will advance automatically at <strong>10</strong> minutes. Please dedicate your full effort to the writing task during this period.]
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="text-green-700 text-sm">
              <strong>Using the AI Assistant</strong> <br />
              During the Phase 2, you will be able to communicate with an AI assistant using the chat box provided in the right panel.<br />
              Type a message in the chat box and click <strong>Send</strong> to send it to the AI assistant. You may send multiple messages and follow up on previous responses.<br />
              You may use the AI assistant in any way you find helpful for completing the task.<br />
              You are responsible for submitting your final response.
            </p>
          </div>
        </div>
      )
    }

    return null
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

      {/* Countdown banner */}
      {redirectCountdown !== null && redirectCountdown > 0 && (
        <div className={`${groupType === 'G3-HumanAndAI' && currentPhase === 1 ? 'bg-amber-100 border-amber-200' : 'bg-purple-100 border-purple-200'} border-b px-4 py-2`}>
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <Badge variant="outline" className={groupType === 'G3-HumanAndAI' && currentPhase === 1 ? 'bg-amber-500 text-white border-amber-500' : 'bg-purple-500 text-white border-purple-500'}>
              {groupType === 'G3-HumanAndAI' && currentPhase === 1 ? 'Phase 1 — Writing Draft' : 'Auto-submit'}
            </Badge>
            <span className={`${groupType === 'G3-HumanAndAI' && currentPhase === 1 ? 'text-amber-700' : 'text-purple-700'} font-semibold`}>
              {groupType === 'G3-HumanAndAI' && currentPhase === 1
                ? `Phase 2 in ${formatCountdown(redirectCountdown)}`
                : `Auto-submit in ${formatCountdown(redirectCountdown)}`}
            </span>
          </div>
        </div>
      )}

      {/* Minimum submit time banner */}
      {submitCountdown !== null && submitCountdown > 0 && (
        <div className="bg-blue-100 border-b border-blue-200 px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-blue-500 text-white border-blue-500">
              Minimum Time Required
            </Badge>
            <span className="text-blue-700 font-semibold">
              You can submit in {formatCountdown(submitCountdown)}
            </span>
          </div>
        </div>
      )}

      {/* G3 Phase 2 banner */}
      {groupType === 'G3-HumanAndAI' && currentPhase === 2 && (
        <div className="bg-green-100 border-b border-green-200 px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-green-500 text-white border-green-500">
              Phase 2 — AI Improvement
            </Badge>
            <span className="text-green-700">ChatGPT and copy/paste are now available</span>
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
                disabled={isSubmitting || (submitCountdown !== null && submitCountdown > 0)}
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

      {/* Instructions Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Task Instructions</DialogTitle>
            <DialogDescription>
              Please review the instructions before continuing.
            </DialogDescription>
          </DialogHeader>
          {getInstructions()}
        </DialogContent>
      </Dialog>

      {/* Auto-Submit Warning Dialog */}
      <Dialog open={showAutoSubmitWarning} onOpenChange={setShowAutoSubmitWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⏰ Auto‑submit soon</DialogTitle>
            <DialogDescription>
              1 minute left until automatic submission. Please finish your answer as soon as possible. Once the time is up, the system will automatically submit the current content and redirect.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Confirm Submit Dialog */}
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
