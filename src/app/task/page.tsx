"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
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

const SUBMIT_MINUTES: Record<string, number> = {
  'G1-Human': 10,
  'G2-HumanAndAI': 5,
  'G3-AI': 5,
}

const AUTO_REDIRECT_MINUTES = 10
const G3_PHASE_SWITCH_MINUTES = 5

export default function TaskPage() {
  const router = useRouter()
  const [showInstructions, setShowInstructions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [submitCountdown, setSubmitCountdown] = useState<number | null>(null)
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null)
  const [g3PhaseCountdown, setG3PhaseCountdown] = useState<number | null>(null)
  const [showAutoSubmitWarning, setShowAutoSubmitWarning] = useState(false)
  const autoSubmitTriggered = useRef(false)

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
      router.replace('/survey')
    }
  }, [taskSubmitted, router])

  // Auto-show instructions on first entry
  useEffect(() => {
    if (userId && taskId && groupType) {
      setShowInstructions(true)
    }
  }, [userId, taskId, groupType])

  const handleAutoSubmit = useCallback(async () => {
    if (autoSubmitTriggered.current) return
    autoSubmitTriggered.current = true

    const submission = taskSubmissionRef.current
    const messages = chatMessagesRef.current

    if (!submission.trim()) {
      setTaskSubmitted(true)
      router.replace('/survey')
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
      setTaskSubmitted(true)
      router.replace('/survey')
    } catch (error) {
      console.error('Auto-submit error:', error)
    }
  }, [startTime, userId, taskId, setTaskDuration, setTaskSubmitted, router])

  // 10-minute auto-redirect timer (all groups)
  useEffect(() => {
    if (!startTime) {
      setRedirectCountdown(null)
      return
    }

    autoSubmitTriggered.current = false

    const targetTime = new Date(startTime.getTime() + AUTO_REDIRECT_MINUTES * 60 * 1000)
    const warningTime = new Date(startTime.getTime() + (AUTO_REDIRECT_MINUTES - 1) * 60 * 1000)
    let warningShown = false

    const updateCountdown = () => {
      const now = new Date()
      const remaining = targetTime.getTime() - now.getTime()

      // Show 1-minute warning
      if (!warningShown && now >= warningTime) {
        warningShown = true
        setShowAutoSubmitWarning(true)
      }

      if (remaining <= 0) {
        setRedirectCountdown(0)
        setShowAutoSubmitWarning(false)
        handleAutoSubmit()
        return
      }

      setRedirectCountdown(Math.ceil(remaining / 1000))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [startTime, handleAutoSubmit])

  // Minimum submit timer (all groups)
  useEffect(() => {
    if (!startTime) {
      setSubmitCountdown(null)
      return
    }

    const targetTime = new Date(startTime.getTime() + submitMinutes * 60 * 1000)

    const updateCountdown = () => {
      const now = new Date()
      const remaining = targetTime.getTime() - now.getTime()

      if (remaining <= 0) {
        setSubmitCountdown(0)
        return
      }

      setSubmitCountdown(Math.ceil(remaining / 1000))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [startTime, submitMinutes])

  // G3 phase switch timer (5 min → Phase 2)
  useEffect(() => {
    if (groupType !== 'G3-AI' || !startTime) {
      setG3PhaseCountdown(null)
      return
    }

    const targetTime = new Date(startTime.getTime() + G3_PHASE_SWITCH_MINUTES * 60 * 1000)

    const updateCountdown = () => {
      const now = new Date()
      const remaining = targetTime.getTime() - now.getTime()

      if (remaining <= 0) {
        setG3PhaseCountdown(0)
        if (currentPhase === 1) {
          setCurrentPhase(2)
          unlockFeatures()
        }
        return
      }

      setG3PhaseCountdown(Math.ceil(remaining / 1000))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [groupType, startTime, currentPhase, setCurrentPhase, unlockFeatures])

  // Prevent leaving task page (always warn)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = '确定要离开吗？你的作答进度将会丢失。'
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

      setTaskSubmitted(true)
      router.replace('/survey')
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
        <div className="space-y-4 py-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-700 text-sm">
              请在下方撰写修改您的回答，并根据内容适当分段方便阅读。禁止使用包括人工智能和搜索引擎在内的任何工具，全程依靠自身知识与能力独立完成。
            </p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <p className="text-amber-700 text-sm">
              *注：本输入框已禁用复制粘贴功能。作答未满 10 分钟无法切换页面，计时结束后页面将自动跳转。请在此期间认真完成写作。你的作答将由专业评审按照 1–7 分制进行评分。评阅人会结合实际工作场景评判你的文稿。
            </p>
          </div>
        </div>
      )
    }

    if (groupType === 'G2-HumanAndAI') {
      return (
        <div className="space-y-4 py-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-700 text-sm">
              请使用当前界面的 ChatGPT 人工智能工具，通过和AI的自由互动生成满意的答案，最后将你最终决定提交的AI生成内容粘贴到下方。
            </p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <p className="text-amber-700 text-sm">
              *注：作答未满 5 分钟无法切换页面，计时满 10 分钟后页面将自动跳转。请在此期间认真完成操作。你的作答将由专业评审按照 1–7 分制进行评分。评阅人会结合实际工作场景评判你的文稿。
            </p>
          </div>
        </div>
      )
    }

    if (groupType === 'G3-AI') {
      if (currentPhase === 1) {
        return (
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-700 text-sm">
                请在下方撰写修改您的回答，并根据内容适当分段方便阅读。禁止使用包括人工智能和搜索引擎在内的任何工具，全程依靠自身知识与能力独立完成。
              </p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-amber-700 text-sm">
                *注：本输入框已禁用复制粘贴功能。作答未满 5 分钟无法切换页面，计时满 10 分钟后页面将自动跳转。请在此期间认真完成写作。你的作答将由专业评审按照 1–7 分制进行评分。评审会结合实际工作场景评判你的文稿。
              </p>
            </div>
          </div>
        )
      }
      return (
        <div className="space-y-4 py-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-700 text-sm">
              请使用当前页面的ChatGPT，把上一步撰写的初稿复制到对话框中，通过和AI的自由互动对刚才撰写的初稿进行审阅和修改，并将改进后的最终稿粘贴到下方。你可以对 AI 的修改再做任何你认为合适的调整，这一稿将作为你的最终提交。
            </p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <p className="text-amber-700 text-sm">
              *注：本输入框已开放复制粘贴功能。作答未满 5 分钟无法切换页面，计时满 10 分钟后页面将自动跳转。请在此期间认真完成写作&amp;操作。你的作答将由专业评审按照 1–7 分制进行评分。评审会结合实际工作场景评判你的文稿。
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

      {/* Auto-redirect countdown banner */}
      {redirectCountdown !== null && redirectCountdown > 0 && (
        <div className="bg-purple-100 border-b border-purple-200 px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-purple-500 text-white border-purple-500">
              Auto-redirect
            </Badge>
            <span className="text-purple-700 font-semibold">
              Page will auto-submit in {formatCountdown(redirectCountdown)}
            </span>
          </div>
        </div>
      )}

      {/* Submit countdown banner */}
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

      {/* G3 Phase 1 countdown */}
      {groupType === 'G3-AI' && g3PhaseCountdown !== null && g3PhaseCountdown > 0 && currentPhase === 1 && (
        <div className="bg-amber-100 border-b border-amber-200 px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-amber-500 text-white border-amber-500">
              Phase 1 — Writing Draft
            </Badge>
            <span className="text-amber-700 font-semibold">
              Phase 2 unlocks in {formatCountdown(g3PhaseCountdown)}
            </span>
          </div>
        </div>
      )}

      {/* G3 Phase 2 unlocked */}
      {groupType === 'G3-AI' && currentPhase === 2 && (
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
            <DialogTitle>⏰ 即将自动提交</DialogTitle>
            <DialogDescription>
              距离自动提交还剩 1 分钟。请尽快完成你的作答，时间到后系统将自动提交当前内容并跳转。
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
