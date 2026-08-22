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
import { encodedQuery } from '@/lib/url-cipher'
import { getSubmitMinMinutes, getAutoSubmitMinutes } from '@/lib/task-time-config'

export default function TaskPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const withParams = (path: string) => {
    const eq = encodedQuery(searchParams)
    return eq ? `${path}${eq}` : path
  }
  const [showInstructions, setShowInstructions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [submitCountdown, setSubmitCountdown] = useState<number | null>(null)
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null)
  const [readingCountdown, setReadingCountdown] = useState<number | null>(null)
  const [mountTime, setMountTime] = useState<Date | null>(null)
  const [taskTimerStart, setTaskTimerStart] = useState<Date | null>(null)
  const [showAutoSubmitWarning, setShowAutoSubmitWarning] = useState(false)
  const [showLeaveWarning, setShowLeaveWarning] = useState(false)
  const [showBackDialog, setShowBackDialog] = useState(false)
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

  const submitMinutes = getSubmitMinMinutes(groupType, currentPhase)
  const autoSubmitMinutes = getAutoSubmitMinutes(groupType, currentPhase)

  const handlePhase1AutoSubmit = useCallback(async () => {
    // Save Phase 1 submission and chat, then transition to Phase 2
    const submission = taskSubmissionRef.current
    const messages = chatMessagesRef.current

    const phase1Time = startTime
      ? Math.floor((Date.now() - startTime.getTime()) / 1000)
      : 0

    try {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          taskId,
          phase: 1,
          submission,
          submissionTime: phase1Time,
        }),
      })
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
  }, [userId, taskId, setCurrentPhase, unlockFeatures, startTime])

  const handleAutoSubmit = useCallback(async () => {
    if (autoSubmitTriggered.current) return
    autoSubmitTriggered.current = true

    const submission = taskSubmissionRef.current
    const messages = chatMessagesRef.current
    const isG3Phase2 = groupType === 'G3-HumanAndAI' && currentPhase === 2

    if (!submission.trim()) {
      skipBeforeUnload.current = true
      setTaskSubmitted(true)
      router.replace(withParams('/psychological-scale'))
      return
    }

    setIsSubmitting(true)
    try {
      if (isG3Phase2) {
        // G3 Phase 2: update existing row with submission_2 and submission_time_2
        const phase2Time = phase2StartTime
          ? Math.floor((Date.now() - phase2StartTime.getTime()) / 1000)
          : 0
        await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            taskId,
            submission2: submission,
            submissionTime2: phase2Time,
          }),
        })
      } else {
        // G1/G2: create new row with submission and submission_time
        const totalTime = startTime
          ? Math.floor((Date.now() - startTime.getTime()) / 1000)
          : 0
        setTaskDuration(totalTime)
        await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            taskId,
            submission,
            submissionTime: totalTime,
          }),
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
      skipBeforeUnload.current = true
      setTaskSubmitted(true)
      router.replace(withParams('/psychological-scale'))
    } catch (error) {
      console.error('Auto-submit error:', error)
    }
  }, [startTime, phase2StartTime, groupType, currentPhase, userId, taskId, setTaskDuration, setTaskSubmitted, router])

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
      router.replace(withParams('/psychological-scale'))
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

  // Set mountTime when task page first renders or phase changes
  useEffect(() => {
    if (!effectiveStartTime) return
    setMountTime(new Date())
    setTaskTimerStart(null)
  }, [effectiveStartTime])

  // Unified timer: 30s reading period → auto-redirect countdown + minimum submit countdown
  useEffect(() => {
    if (!mountTime) {
      setRedirectCountdown(null)
      setSubmitCountdown(null)
      setReadingCountdown(null)
      return
    }

    autoSubmitTriggered.current = false

    const READING_DURATION = (groupType === 'G3-HumanAndAI' && currentPhase === 2) ? 0 : 30 * 1000
    const readingEndTime = new Date(mountTime.getTime() + READING_DURATION)
    const autoTargetTime = new Date(readingEndTime.getTime() + autoSubmitMinutes * 60 * 1000)
    const submitTargetTime = new Date(readingEndTime.getTime() + submitMinutes * 60 * 1000)
    const warningTime = new Date(autoTargetTime.getTime() - 60 * 1000)
    let warningShown = false
    let timerStartSet = false

    const updateCountdown = () => {
      const now = new Date()
      const readingRemaining = readingEndTime.getTime() - now.getTime()

      // Phase 1: Reading period (first 30s)
      if (readingRemaining > 0) {
        setReadingCountdown(Math.ceil(readingRemaining / 1000))
        setRedirectCountdown(null)
        setSubmitCountdown(null)
        return
      }

      // Reading period is over
      setReadingCountdown(null)
      if (!timerStartSet) {
        timerStartSet = true
        setTaskTimerStart(readingEndTime)
      }

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
  }, [mountTime, submitMinutes, autoSubmitMinutes, groupType, currentPhase, handleAutoSubmit, handlePhase1AutoSubmit])

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

  // Block browser back navigation
  useEffect(() => {
    const preventBack = (e: PopStateEvent) => {
      e.preventDefault()
      window.history.pushState(null, '', window.location.href)
      setShowBackDialog(true)
    }
    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', preventBack)
    return () => {
      window.removeEventListener('popstate', preventBack)
    }
  }, [])

  const handleSubmit = async () => {
    if (!taskSubmission.trim()) {
      alert('Please write a response before submitting.')
      return
    }

    if (readingCountdown !== null && readingCountdown > 0) {
      alert(`Please read the task content carefully before answering. Time remaining: ${formatCountdown(readingCountdown)}`)
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
        const phase1Time = startTime
          ? Math.floor((Date.now() - startTime.getTime()) / 1000)
          : 0
        await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            taskId,
            phase: 1,
            submission: taskSubmission,
            submissionTime: phase1Time,
          }),
        })
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

    // Final submit (Phase 2 or non-G3 groups) → survey
    try {
      const isG3Phase2 = groupType === 'G3-HumanAndAI' && currentPhase === 2

      if (isG3Phase2) {
        const phase2Time = phase2StartTime
          ? Math.floor((Date.now() - phase2StartTime.getTime()) / 1000)
          : 0
        const response = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            taskId,
            submission2: taskSubmission,
            submissionTime2: phase2Time,
          }),
        })
        if (!response.ok) throw new Error('Failed to submit')
      } else {
        const totalTime = startTime
          ? Math.floor((Date.now() - startTime.getTime()) / 1000)
          : 0
        setTaskDuration(totalTime)
        const response = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            taskId,
            submission: taskSubmission,
            submissionTime: totalTime,
          }),
        })
        if (!response.ok) throw new Error('Failed to submit')
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

      skipBeforeUnload.current = true
      setShowLeaveWarning(true)
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

  const handleLeaveWarningContinue = () => {
    setShowLeaveWarning(false)
    setTaskSubmitted(true)
  }

  // Instruction content per group
  const getInstructions = () => {
    if (groupType === 'G1-Human') {
      return (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-blue-700 text-sm">
              Please complete the task independently, <strong>without using AI tools, search engines, or other outside assistance</strong>.
              <br /> <br />
              When you are finished, click <strong>Submit Task</strong> and complete a supplemental survey.
              <br /> <br />
              Your response will be graded by professional evaluators based on real-world work scenarios. 
              Please <strong>take the task seriously</strong> and approach it as you would a real work assignment.
            </p>
          </div>
          <div className="bg-amber-50 p-3 rounded">
            <p className="text-amber-700 text-sm">
              [Note: copy and paste function is <strong>disabled</strong> for this text box. You will not be allowed to advance before <strong>{submitMinutes}</strong> minutes, and the page will advance automatically at <strong>{autoSubmitMinutes}</strong> minutes. Please dedicate your full effort to the writing task during this period.]
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
              You may use the <strong>AI assistant available in the interface</strong> to complete the task, and <strong>must not</strong> use any tools or resources other than those provided by the interface.
              <br /> <br />
              When you are finished, click <strong>Submit Task</strong> and complete a supplemental survey.
              <br /> <br />
              Your response will be graded by professional evaluators based on real-world work scenarios. 
              Please <strong>take the task seriously</strong> and approach it as you would a real work assignment.
            </p>
          </div>
          <div className="bg-amber-50 p-3 rounded">
            <p className="text-amber-700 text-sm">
              [Note: You will not be allowed to advance before <strong>{submitMinutes}</strong> minutes, and the page will advance automatically at <strong>{autoSubmitMinutes}</strong> minutes. Please dedicate your full effort to the writing task during this period.]
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="text-green-700 text-sm">
              <strong>Using the AI Assistant</strong> <br />
              The AI assistant will appear in the <strong>right panel</strong>. Type your message in the chat box and click <strong>Send</strong>.<br />
              You may send multiple messages and follow up on previous responses.
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
                <strong>Phase 1 — Draft:</strong> <br />
                Please write an initial draft independently, <strong>without using AI tools, search engines, or other outside assistance.</strong>
              </p>
            </div>
            <div className="bg-amber-50 p-3 rounded">
              <p className="text-amber-700 text-sm">
                [Note: Copy and paste function is <strong>disabled</strong> for this text box. You will not be allowed to advance before <strong>{submitMinutes}</strong> minutes, and the page will advance automatically at <strong>{autoSubmitMinutes}</strong> minutes. Please dedicate your full effort to the writing task during this period.]
              </p>
            </div>
          </div>
        )
      }
      return (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-green-50 p-3 rounded">
            <p className="text-green-700 text-sm">
              <strong>Phase 2 — Revise with AI:</strong> <br />
              You may use the <strong>AI assistant available in the interface</strong> to help review and revise the draft you just wrote. Then enter the revised draft in the submission box.
              <br /> <br />
              When you are finished, click <strong>Submit Task</strong> and complete a supplemental survey.
              <br /> <br />
              Your response will be graded by professional evaluators based on real-world work scenarios.
              Please <strong>take the task seriously</strong> and approach it as you would a real work assignment.
            </p>
          </div>
          <div className="bg-amber-50 p-3 rounded">
            <p className="text-amber-700 text-sm">
              [Note: Copy and paste is <strong>enabled</strong> for this text box. You will not be allowed to advance before <strong>{submitMinutes}</strong> minutes, and the page will advance automatically at <strong>{autoSubmitMinutes}</strong> minutes. Please dedicate your full effort to the writing task during this period.]
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="text-green-700 text-sm">
              <strong>Using the AI Assistant</strong> <br />
              The AI assistant will appear in the <strong>right panel</strong>. Type your message in the chat box and click <strong>Send</strong>.<br />
              You may send multiple messages and follow up on previous responses.
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

  const isReading = readingCountdown !== null && readingCountdown > 0

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation onShowInstructions={() => setShowInstructions(true)} effectiveStart={taskTimerStart} />

      {/* Reading period banner (first 30s) */}
      {readingCountdown !== null && readingCountdown > 0 && (
        <div className="bg-blue-100 border-b border-blue-200 px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-blue-500 text-white border-blue-500">
              Reading
            </Badge>
            <span className="text-blue-700 font-semibold">
              Please read the task content carefully. You can start answering in {formatCountdown(readingCountdown)}
            </span>
          </div>
        </div>
      )}

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
          {/* Left column: task info + (when chat available) input */}
          <div className={`${allowChat && isChatOpen ? 'lg:col-span-7' : 'lg:col-span-7'} flex flex-col gap-4`}>
            <div className="flex-1 min-h-[300px]">
              <InfoDisplay
                content={taskContent}
                allowCopy={allowCopy}
              />
            </div>
            {allowChat && isChatOpen && (
              <>
                <div className="min-h-[250px]">
                  <TaskInput allowPaste={allowPaste} disabled={isReading} />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || (submitCountdown !== null && submitCountdown > 0) || (readingCountdown !== null && readingCountdown > 0)}
                    size="lg"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Task'}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Right column: chat (when available) OR input (no chat) */}
          {allowChat && isChatOpen ? (
            <div className="lg:col-span-5">
              <div className="h-[calc(100vh-140px)] min-h-[500px]">
                <ChatWindow disabled={isReading} />
              </div>
            </div>
          ) : (
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex-1 min-h-[400px]">
                <TaskInput allowPaste={allowPaste} />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || (submitCountdown !== null && submitCountdown > 0) || (readingCountdown !== null && readingCountdown > 0)}
                  size="lg"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Task'}
                </Button>
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

      {/* Leave Warning Dialog */}
      <Dialog open={showLeaveWarning} onOpenChange={setShowLeaveWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚠ Please Do Not Leave</DialogTitle>
            <DialogDescription>
              Your task has been submitted. Please do not leave this page. You must complete the entire study to successfully receive your payment.
              <br /><br />
              Click &quot;Continue&quot; to proceed to the next step.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={handleLeaveWarningContinue}>
              Continue to Next Step
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Back Navigation Dialog */}
      <Dialog open={showBackDialog} onOpenChange={setShowBackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚠ Leaving This Page Will Void Your Session</DialogTitle>
            <DialogDescription>
              You cannot go back to the previous step. If you leave this page, it will be treated as a mid-exit and will <strong>not</strong> be counted as a completed study. You will <strong>not</strong> receive your payment.
              <br /><br />
              Please stay on this page and complete the task.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowBackDialog(false)}>
              Stay on This Page
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
