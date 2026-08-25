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

type CompQuestion = {
  id: string
  text: string
  optionA: string
  optionB: string
  correct: 'A' | 'B'
}

type CompSet = {
  id: string
  label: string
  questions: CompQuestion[]
}

type CompConfig = {
  title: string
  sets: CompSet[]
}

const COMPREHENSION_CHECK: Record<string, CompConfig> = {
  'G1-Human': {
    title: 'Comprehension Check',
    sets: [
      {
        id: 'g1_p1',
        label: '',
        questions: [
          {
            id: 'g1_q1',
            text: 'In the following task____',
            optionA: 'I need to interact with AI to complete the task.',
            optionB: 'I need to complete the task independently.',
            correct: 'B',
          },
          {
            id: 'g1_q2',
            text: 'In the following task____',
            optionA: 'I need to complete the task as quickly as possible.',
            optionB: 'I need to complete the task carefully as if it were real work.',
            correct: 'B',
          },
          {
            id: 'g1_q3',
            text: 'In the following task____',
            optionA: 'I need to use search engines and other external tools as supplemental.',
            optionB: 'I can only use my own knowledge to complete the task.',
            correct: 'B',
          },
        ],
      },
    ],
  },
  'G2-AI': {
    title: 'Comprehension Check',
    sets: [
      {
        id: 'g2_p1',
        label: '',
        questions: [
          {
            id: 'g2_q1',
            text: 'In the following task____',
            optionA: 'I need to complete the task independently.',
            optionB: 'I need to interact with AI to complete the task.',
            correct: 'B',
          },
          {
            id: 'g2_q2',
            text: 'In the following task____',
            optionA: 'I need to open external AI products to interact.',
            optionB: 'I need to use the AI provided in this study interface.',
            correct: 'B',
          },
          {
            id: 'g2_q3',
            text: 'In the following task____',
            optionA: 'I need to use search engines and other external tools as supplemental.',
            optionB: 'I can only use the AI provided in this study interface.',
            correct: 'B',
          },
        ],
      },
    ],
  },
  'G3-HumanAndAI': {
    title: 'Comprehension Check',
    sets: [
      {
        id: 'g3_p1',
        label: 'Phase 1',
        questions: [
          {
            id: 'g3_p1_q1',
            text: 'In the Phase 1____',
            optionA: 'I need to interact with AI to complete the task.',
            optionB: 'I need to complete the task independently.',
            correct: 'B',
          },
          {
            id: 'g3_p1_q2',
            text: 'In the Phase 1____',
            optionA: 'I need to complete the task as quickly as possible.',
            optionB: 'I need to complete the task carefully as if it were real work.',
            correct: 'B',
          },
          {
            id: 'g3_p1_q3',
            text: 'In the Phase 1____',
            optionA: 'I need to use search engines and other external tools as supplemental.',
            optionB: 'I can only use my own knowledge to complete the first draft.',
            correct: 'B',
          },
        ],
      },
      {
        id: 'g3_p2',
        label: 'Phase 2',
        questions: [
          {
            id: 'g3_p2_q1',
            text: 'In the Phase 2____',
            optionA: 'I need to complete the task independently.',
            optionB: 'I need to interact with AI to complete the task.',
            correct: 'B',
          },
          {
            id: 'g3_p2_q2',
            text: 'In the Phase 2____',
            optionA: 'I need to open external AI products to interact.',
            optionB: 'I need to use the AI provided in this study interface.',
            correct: 'B',
          },
          {
            id: 'g3_p2_q3',
            text: 'In the Phase 2____',
            optionA: 'I need to use search engines and other external tools as supplemental.',
            optionB: 'I can only use the AI provided in this study interface.',
            correct: 'B',
          },
        ],
      },
    ],
  },
}

export default function EntryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [failCount, setFailCount] = useState(0)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showExcludeDialog, setShowExcludeDialog] = useState(false)

  const setUser = useAppStore((state) => state.setUser)
  const setTask = useAppStore((state) => state.setTask)
  const setStartTime = useAppStore((state) => state.setStartTime)
  const setGroupType = useAppStore((state) => state.setGroupType)
  const setTaskSubmitted = useAppStore((state) => state.setTaskSubmitted)
  const reset = useAppStore((state) => state.reset)
  const userId = useAppStore((state) => state.userId)

  const urlTask = getParam(searchParams, 'task')
  const urlGroup = getParam(searchParams, 'group')
  const prolificId = searchParams.get('PROLIFIC_PID') || 'test_user_' + Date.now()
  const studyId = searchParams.get('STUDY_ID') || ''
  const prolificSessionId = searchParams.get('SESSION_ID') || ''

  const g1Min = getSubmitMinMinutes('G1-Human', undefined, urlTask)
  const g1Max = getAutoSubmitMinutes('G1-Human', undefined, urlTask)
  const g2Min = getSubmitMinMinutes('G2-AI', undefined, urlTask)
  const g2Max = getAutoSubmitMinutes('G2-AI', undefined, urlTask)
  const g3Min = getSubmitMinMinutes('G3-HumanAndAI', undefined, urlTask)
  const g3Max = getAutoSubmitMinutes('G3-HumanAndAI', undefined, urlTask)
  const g3Phase2Min = getSubmitMinMinutes('G3-HumanAndAI', 2, urlTask)
  const g3Phase2Max = getAutoSubmitMinutes('G3-HumanAndAI', 2, urlTask)

  const hasUrlAssignment = !!(urlTask && urlGroup)
  const compConfig = hasUrlAssignment && urlGroup ? COMPREHENSION_CHECK[urlGroup] : null

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [visibleSets, setVisibleSets] = useState<Set<string>>(new Set())
  const [visibleQuestions, setVisibleQuestions] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!compConfig) return
    const firstSetId = compConfig.sets[0]?.id
    if (firstSetId) {
      setVisibleSets(new Set([firstSetId]))
      setVisibleQuestions({ [firstSetId]: 0 })
    }
  }, [compConfig])

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

  const isAllAnswered = (): boolean => {
    if (!compConfig) return true
    for (const set of compConfig.sets) {
      if (!visibleSets.has(set.id)) continue
      const maxVisible = visibleQuestions[set.id] ?? 0
      for (let qi = 0; qi <= maxVisible && qi < set.questions.length; qi++) {
        const q = set.questions[qi]
        if (answers[q.id] === undefined) return false
      }
    }
    return true
  }

  const isAllCorrect = (): boolean => {
    if (!compConfig) return true
    for (const set of compConfig.sets) {
      for (const q of set.questions) {
        if (answers[q.id] !== q.correct) return false
      }
    }
    return true
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    if (!compConfig) return

    setAnswers((prev) => {
      const newAnswers = { ...prev, [questionId]: value }

      const currentSet = compConfig.sets.find((s) => s.questions.some((q) => q.id === questionId))
      if (currentSet) {
        const qIdx = currentSet.questions.findIndex((q) => q.id === questionId)
        const maxVisible = visibleQuestions[currentSet.id] ?? 0

        if (qIdx === maxVisible && qIdx < currentSet.questions.length - 1) {
          setVisibleQuestions((prev) => ({ ...prev, [currentSet.id]: qIdx + 1 }))
        } else if (qIdx === currentSet.questions.length - 1) {
          const setIdx = compConfig.sets.findIndex((s) => s.id === currentSet.id)
          if (setIdx < compConfig.sets.length - 1) {
            const nextSet = compConfig.sets[setIdx + 1]
            setVisibleSets((prev) => new Set([...Array.from(prev), nextSet.id]))
            setVisibleQuestions((prev) => ({ ...prev, [nextSet.id]: 0 }))
          }
        }
      }

      return newAnswers
    })
  }

  const handleStart = async () => {
    if (!agreed) return
    if (compConfig && !isAllAnswered()) {
      setErrorMessage('Please answer all comprehension check questions before proceeding.')
      setShowError(true)
      return
    }
    setShowConfirmDialog(true)
  }

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false)

    if (compConfig && !isAllCorrect()) {
      const newFailCount = failCount + 1
      setFailCount(newFailCount)

      if (newFailCount >= 2) {
        setShowExcludeDialog(true)
        return
      }

      setErrorMessage(
        'Some of your answers were incorrect. Please read the task instructions carefully and try again.'
      )
      setShowError(true)

      const firstSetId = compConfig.sets[0].id
      setAnswers({})
      setVisibleSets(new Set([firstSetId]))
      setVisibleQuestions({ [firstSetId]: 0 })
      return
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

  const handleExclude = () => {
    const eq = encodedQuery(searchParams)
    const qs = eq ? eq : ''
    router.replace(`/reject${qs}`)
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
                    Please use the <strong>AI assistant available in the interface</strong> to complete the task, and <strong>must not</strong> use any tools or resources other than those provided by the interface. You will have <strong>up to {g2Max} minutes</strong> to complete the task and paste the AI-generated response into the submission box.
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
                  setAnswers({})
                  setVisibleSets(new Set())
                  setVisibleQuestions({})
                  setShowError(false)
                }
              }}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="agree" className="text-base">
                I have read and understood the instructions, and I agree to participate in this study.
              </Label>
            </div>
          </div>

          {/* Comprehension check */}
          {agreed && compConfig && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-4">
              <Label className="text-sm font-medium text-amber-800">
                Comprehension Check: Please answer the following questions carefully. Incorrect answers will result in disqualification from this study.
              </Label>

              {compConfig.sets.map((set) => {
                if (!visibleSets.has(set.id)) return null
                const maxVisible = visibleQuestions[set.id] ?? 0

                return (
                  <div key={set.id} className="space-y-3">
                    {set.label && (
                      <p className="text-sm font-semibold text-gray-700">{set.label}</p>
                    )}
                    {set.questions.slice(0, maxVisible + 1).map((q) => {
                      const isAnswered = answers[q.id] !== undefined
                      return (
                        <div key={q.id} className="space-y-2 pb-3 border-b border-amber-200 last:border-0">
                          <p className="text-sm text-gray-700">{q.text}</p>
                          <RadioGroup
                            value={answers[q.id] ?? ''}
                            onValueChange={(v) => handleAnswerChange(q.id, v)}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="A" id={`${q.id}-A`} />
                                <Label htmlFor={`${q.id}-A`} className="text-sm cursor-pointer">
                                  {q.optionA}
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="B" id={`${q.id}-B`} />
                                <Label htmlFor={`${q.id}-B`} className="text-sm cursor-pointer">
                                  {q.optionB}
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button
            onClick={handleStart}
            disabled={!agreed || isLoading || (!!compConfig && !isAllAnswered())}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Starting...' : compConfig ? 'Submit Answer & Start' : 'Start Task'}
          </Button>
        </CardFooter>
      </Card>

      {/* Error Dialog */}
      <Dialog open={showError} onOpenChange={(open) => { if (!open) setShowError(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comprehension Check Failed</DialogTitle>
            <DialogDescription>
              {errorMessage}
              {failCount >= 2
                ? ' You have failed twice. You will be disqualified from this study.'
                : ` This is attempt ${failCount} of 2.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowError(false)}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Submit Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proceed to Next Step?</DialogTitle>
            <DialogDescription>
              Are you sure you want to proceed? Previous answers cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmit} disabled={isLoading}>
              {isLoading ? 'Starting...' : 'Yes, Proceed'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exclusion Dialog */}
      <Dialog open={showExcludeDialog} onOpenChange={(open) => { if (!open) setShowExcludeDialog(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>You Have Been Disqualified</DialogTitle>
            <DialogDescription>
              Unfortunately, you did not pass the comprehension check. You will now be redirected to complete the screening questionnaire, and your responses will be used for research purposes only.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button onClick={handleExclude}>Continue</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
