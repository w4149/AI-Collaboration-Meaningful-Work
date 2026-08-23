"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import { getSkipRouteWithParams, FLOW_CONFIG } from '@/lib/flow-config'
import { getParam, encodedQuery } from '@/lib/url-cipher'
import { getSubmitMinMinutes, getAutoSubmitMinutes } from '@/lib/task-time-config'

// Attention check questions per group
const ATTENTION_CHECK = {
  'G1-Human': {
    question: 'In the following task____',
    options: [
      { value: 'g1_wrong', label: 'I may use AI tools, search engines, or other external assistance to complete the task.' },
      { value: 'g1_correct', label: 'I must complete the task independently and must not use AI tools, search engines, or other external assistance.' },
    ],
    correctValue: 'g1_correct',
  },
  'G2-AI': {
    question: 'In the following task____',
    options: [
      { value: 'g2_wrong', label: 'I may use tools and resources external to the interface for assistance.' },
      { value: 'g2_correct', label: 'I may only use the AI assistant available in the interface for assistance.' },
    ],
    correctValue: 'g2_correct',
  },
  'G3-HumanAndAI': {
    question: 'In the following task____',
    options: [
      { value: 'g3_wrong', label: 'I may use the AI assistant available in the interface for assistance during Phase 1.' },
      { value: 'g3_correct', label: 'I may use the AI assistant available in the interface for assistance during Phase 2.' },
    ],
    correctValue: 'g3_correct',
  },
} as const

export default function EntryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [attentionAnswer, setAttentionAnswer] = useState<string>('')
  const [showAttentionError, setShowAttentionError] = useState(false)
  const [attentionSubmitted, setAttentionSubmitted] = useState(false)
  const preUserIdFailuresRef = useRef<{ answer: string; count: number } | null>(null)

  const setUser = useAppStore((state) => state.setUser)
  const setTask = useAppStore((state) => state.setTask)
  const setStartTime = useAppStore((state) => state.setStartTime)
  const setGroupType = useAppStore((state) => state.setGroupType)
  const setTaskSubmitted = useAppStore((state) => state.setTaskSubmitted)
  const reset = useAppStore((state) => state.reset)
  const userId = useAppStore((state) => state.userId)
  const attentionCheck1FailCount = useAppStore((state) => state.attentionCheck1FailCount)
  const incrementAttentionCheck1Fail = useAppStore((state) => state.incrementAttentionCheck1Fail)

  // Get params from URL (decoded from cipher)
  const urlTask = getParam(searchParams, 'task')
  const urlGroup = getParam(searchParams, 'group')
  const prolificId = searchParams.get('PROLIFIC_PID') || 'test_user_' + Date.now()
  const studyId = searchParams.get('STUDY_ID') || ''
  const prolificSessionId = searchParams.get('SESSION_ID') || ''

  // Time config per group (pass urlTask for task-specific overrides)
  const g1Min = getSubmitMinMinutes('G1-Human', undefined, urlTask)
  const g1Max = getAutoSubmitMinutes('G1-Human', undefined, urlTask)
  const g2Min = getSubmitMinMinutes('G2-AI', undefined, urlTask)
  const g2Max = getAutoSubmitMinutes('G2-AI', undefined, urlTask)
  const g3Min = getSubmitMinMinutes('G3-HumanAndAI', undefined, urlTask)
  const g3Max = getAutoSubmitMinutes('G3-HumanAndAI', undefined, urlTask)
  const g3Phase2Min = getSubmitMinMinutes('G3-HumanAndAI', 2, urlTask)
  const g3Phase2Max = getAutoSubmitMinutes('G3-HumanAndAI', 2, urlTask)

  // If task and group are in URL, skip select-task and start directly
  const hasUrlAssignment = !!(urlTask && urlGroup)

  // Attention check config for current group
  const attentionConfig = hasUrlAssignment && urlGroup ? ATTENTION_CHECK[urlGroup as keyof typeof ATTENTION_CHECK] : null

  useEffect(() => {
    if (!FLOW_CONFIG.entry) {
      const taskId = urlTask || 'task1'
      const group = (urlGroup || 'G1-Human') as 'G1-Human' | 'G2-AI' | 'G3-HumanAndAI'

      reset()
      setTaskSubmitted(false)
      setUser(`skip_${Date.now()}`, `session_${Date.now()}`, prolificId, studyId, prolificSessionId)
      setGroupType(group)
      setStartTime(new Date())

      fetch('/api/auth/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prolificId, taskId, groupType: group, studyId, prolificSessionId }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data && data.taskId) {
            setUser(data.userId, data.sessionId || `session_${Date.now()}`, prolificId, studyId, prolificSessionId)
            setTask(
              data.taskId,
              data.taskTypeId || '',
              data.taskType || '',
              data.taskContent || '',
              data.allowCopy ?? false,
              data.allowPaste ?? false,
              data.allowChat ?? false
            )
          }
        })
        .catch(() => {})
        .finally(() => {
          const eq = encodedQuery(searchParams)
          router.replace(eq ? `/task${eq}` : '/task')
        })
    }
  }, [router, searchParams, urlTask, urlGroup, prolificId, studyId, prolificSessionId, reset, setTaskSubmitted, setUser, setGroupType, setStartTime, setTask])

  const saveAttentionCheck = async (isCorrect: boolean) => {
    try {
      const res = await fetch('/api/attention-checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          checkType: 1,
          groupType: urlGroup,
          answer: attentionAnswer,
          isCorrect,
        }),
      })
      if (!res.ok) {
        const errText = await res.text()
        console.error('Attention check save failed:', res.status, errText)
      }
    } catch (e) {
      console.error('Failed to save attention check:', e)
    }
  }

  const handleStart = async () => {
    if (!agreed) return

    let attentionCheckPassed = true
    let attentionCheckData: { answer: string; isCorrect: boolean } | null = null

    // If there's an attention check to validate
    if (attentionConfig && !attentionSubmitted) {
      if (!attentionAnswer) {
        setShowAttentionError(true)
        return
      }
      const isCorrect = attentionAnswer === attentionConfig.correctValue
      attentionCheckData = { answer: attentionAnswer, isCorrect }
      if (!isCorrect) {
        incrementAttentionCheck1Fail()
        // Save the failed attempt BEFORE clearing the answer
        if (userId) {
          try {
            const res = await fetch('/api/attention-checks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                checkType: 1,
                groupType: urlGroup,
                answer: attentionAnswer,
                isCorrect: false,
              }),
            })
            if (!res.ok) {
              console.error('Attention check save failed:', res.status, await res.text())
            }
          } catch (e) {
            console.error('Failed to save attention check:', e)
          }
        } else {
          preUserIdFailuresRef.current = {
            answer: attentionAnswer,
            count: (preUserIdFailuresRef.current?.count ?? 0) + 1,
          }
        }
        setShowAttentionError(true)
        return
      }
      attentionCheckPassed = true
    }

    setIsLoading(true)

    try {
      if (hasUrlAssignment) {
        reset()
        setTaskSubmitted(false)

        const response = await fetch('/api/auth/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prolificId,
            taskId: urlTask,
            groupType: urlGroup,
            studyId,
            prolificSessionId,
          }),
        })

        if (!response.ok) throw new Error('Failed to start session')

        const data = await response.json()

        setUser(data.userId, data.sessionId, prolificId, studyId, prolificSessionId)
        setTask(
          data.taskId,
          data.taskTypeId,
          data.taskType,
          data.taskContent,
          data.allowCopy,
          data.allowPaste,
          data.allowChat
        )
        setGroupType(urlGroup as 'G1-Human' | 'G2-AI' | 'G3-HumanAndAI')
        setStartTime(new Date())

        // Flush pre-userId failures first (so ever_failed is recorded)
        if (preUserIdFailuresRef.current && data.userId) {
          const failures = preUserIdFailuresRef.current
          for (let i = 0; i < failures.count; i++) {
            try {
              const res = await fetch('/api/attention-checks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: data.userId,
                  checkType: 1,
                  groupType: urlGroup,
                  answer: failures.answer,
                  isCorrect: false,
                }),
              })
              if (!res.ok) {
                console.error('Pre-userId attention check save failed:', res.status, await res.text())
              }
            } catch (e) {
              console.error('Failed to save pre-userId attention check failure:', e)
            }
          }
          preUserIdFailuresRef.current = null
        }

        // Save attention check with the real user ID
        if (attentionCheckData && data.userId) {
          try {
            const res = await fetch('/api/attention-checks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: data.userId,
                checkType: 1,
                groupType: urlGroup,
                answer: attentionCheckData.answer,
                isCorrect: attentionCheckData.isCorrect,
              }),
            })
            if (!res.ok) {
              console.error('Attention check save failed:', res.status, await res.text())
            }
          } catch (e) {
            console.error('Failed to save attention check:', e)
          }
        }

        setAttentionSubmitted(true)

        const eq = encodedQuery(searchParams)
        router.push(eq ? `/task${eq}` : '/task')
      } else {
        setUser(`test_user_${Date.now()}`, `session_${Date.now()}`, prolificId, studyId, prolificSessionId)
        setStartTime(new Date())
        router.push('/select-task')
      }
    } catch (error) {
      console.error('Error starting session:', error)
      alert('Failed to start. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Everyday Work Task Study</CardTitle>
          <CardDescription className="text-center">Please read the following instructions carefully</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Group-specific instructions */}
          <div className="space-y-4">

            {/* G1-Human */}
            {(!hasUrlAssignment || urlGroup === 'G1-Human') && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-blue-700 text-sm">
                    You will enter the task interface, where you can view <strong>task information in the left panel</strong>.
                    <br /> <br />
                    You will have <strong>up to {g1Max} minutes</strong> to complete the task and enter your response in the submission box. Please complete the task independently, <strong>without using AI tools, search engines, or other outside assistance</strong>.
                    <br /> <br />
                    When you are finished, click <strong>Submit Task</strong> and complete a supplemental survey.
                    <br /> <br />
                    Your response will be graded by professional evaluators based on real-world work scenarios. 
                    Please <strong>take the task seriously</strong> and approach it as you would a real work assignment.
                  </p>
                </div>
              </div>
            )}

            {/* G2-AI */}
            {(!hasUrlAssignment || urlGroup === 'G2-AI') && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-blue-700 text-sm">
                    You will enter the task interface, where you can view <strong>task information in the left panel</strong>.
                    <br /> <br />
                    You will use the <strong>AI assistant available in the interface</strong> to complete the task, and <strong>must not</strong> use any tools or resources other than those provided by the interface. You will have <strong>up to {g2Max} minutes</strong> to complete the task and paste the AI-generated response into the submission box.
                    <br /> <br />
                    When you are finished, click <strong>Submit Task</strong> and complete a supplemental survey.
                    <br /> <br />
                    Your response will be graded by professional evaluators based on real-world work scenarios. 
                    Please <strong>take the task seriously</strong> and approach it as you would a real work assignment.
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
            )}

            {/* G3-HumanAndAI */}
            {(!hasUrlAssignment || urlGroup === 'G3-HumanAndAI') && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-blue-700 text-sm">
                    You will enter the task interface, where you can view <strong>task information in the left panel</strong>.
                    <br /> <br />
                    You will complete the task in <strong>two phases:</strong>
                    <br /> <br />
                    <strong>Phase 1 — Draft:</strong> <br />
                    You will have <strong>up to {g3Max} minutes</strong> to write an initial draft independently, <strong>without using AI tools, search engines, or other outside assistance.</strong>
                    <br /> <br />
                    <strong>Phase 2 — Revise with AI:</strong> <br />
                    You will have <strong>up to {g3Phase2Max} minutes</strong> to use the <strong>AI assistant available in the interface</strong> to help review and revise the draft you just wrote, and <strong>must not</strong> use any tools or resources other than those provided by the interface. Then enter the revised draft in the submission box.
                    <br /> <br />
                    When you are finished, click <strong>Submit Task</strong> and complete a supplemental survey.
                    <br /> <br />
                    Your response will be graded by professional evaluators based on real-world work scenarios.
                    Please <strong>take the task seriously</strong> and approach it as you would a real work assignment.
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
            )}
          </div>
          
          <div className="flex items-start space-x-3 pt-4">
            <Checkbox 
              id="agree" 
              checked={agreed} 
              onCheckedChange={(checked) => {
                setAgreed(checked as boolean)
                if (!checked) {
                  setAttentionAnswer('')
                  setAttentionSubmitted(false)
                  setShowAttentionError(false)
                }
              }}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="agree" className="text-base">
                I have read and understood the instructions, and I agree to participate in this study.
              </Label>
            </div>
          </div>

          {/* Attention check - shown after agreement for URL-assigned groups */}
          {agreed && attentionConfig && !attentionSubmitted && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
              <Label className="text-sm font-medium text-amber-800">
                Attention Check: Please answer the following question carefully.
              </Label>
              <p className="text-sm text-gray-700">{attentionConfig.question}</p>
              <RadioGroup value={attentionAnswer} onValueChange={setAttentionAnswer}>
                <div className="space-y-2">
                  {attentionConfig.options.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={`att-${opt.value}`} />
                      <Label htmlFor={`att-${opt.value}`} className="text-sm cursor-pointer">
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button 
            onClick={handleStart} 
            disabled={!agreed || isLoading}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Starting...' : attentionConfig && !attentionSubmitted ? 'Submit Answer & Start' : 'Start Task'}
          </Button>
        </CardFooter>
      </Card>

      {/* Attention Check Error Dialog */}
      <Dialog open={showAttentionError} onOpenChange={setShowAttentionError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attention Check Failed</DialogTitle>
            <DialogDescription>
              {attentionAnswer === '' 
                ? 'Please select an answer before proceeding.'
                : 'Your answer is incorrect. Please read the task requirements carefully and try again.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button onClick={() => {
              setShowAttentionError(false)
              setAttentionAnswer('')
            }}>
              {attentionAnswer === '' ? 'OK' : 'Try Again'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
