"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import { getSkipRouteWithParams, FLOW_CONFIG } from '@/lib/flow-config'
import { encodedQuery } from '@/lib/url-cipher'

const TASK_TYPE_LABELS: Record<string, string> = {
  'task1': 'event planning',
  'task1-2': 'event planning',
  'task2': 'reviewing information and drawing conclusions from it',
  'task3': 'text labeling',
  'task4': 'handling customer complaints',
  'task4-2': 'handling customer complaints',
}

// Scale options
const CLARITY_OPTIONS = [
  { value: 1, label: 'Not at all clear' },
  { value: 2, label: 'Slightly clear' },
  { value: 3, label: 'Moderately clear' },
  { value: 4, label: 'Very clear' },
  { value: 5, label: 'Extremely clear' },
]

const DIFFICULTY_OPTIONS = [
  { value: 1, label: 'Not at all difficult' },
  { value: 2, label: 'Slightly difficult' },
  { value: 3, label: 'Moderately difficult' },
  { value: 4, label: 'Very difficult' },
  { value: 5, label: 'Extremely difficult' },
]

const TIME_OPTIONS = [
  { value: 1, label: 'Not at all' },
  { value: 2, label: 'Slightly' },
  { value: 3, label: 'Moderately' },
  { value: 4, label: 'To a great extent' },
  { value: 5, label: 'Completely' },
]

const WAIT_TIME_OPTIONS = [
  { value: 1, label: 'Not at all' },
  { value: 2, label: 'Slightly' },
  { value: 3, label: 'Moderately' },
  { value: 4, label: 'To a great extent' },
  { value: 5, label: 'Completely' },
]

const AGREEMENT_OPTIONS = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Somewhat disagree' },
  { value: 4, label: 'Neither' },
  { value: 5, label: 'Somewhat agree' },
  { value: 6, label: 'Agree' },
  { value: 7, label: 'Strongly agree' },
]

const FAMILIARITY_OPTIONS = [
  { value: 1, label: 'Not familiar at all' },
  { value: 2, label: 'Slightly familiar' },
  { value: 3, label: 'Somewhat familiar' },
  { value: 4, label: 'Moderately familiar' },
  { value: 5, label: 'Quite familiar' },
  { value: 6, label: 'Very familiar' },
  { value: 7, label: 'Extremely familiar' },
]

const AGREEMENT_ITEMS = [
  { id: 'analyze_info', text: 'The task required careful analysis of information.' },
  { id: 'generate_ideas', text: 'The task required me to generate original ideas.' },
  { id: 'repeatedly', text: 'The task involved doing similar things repeatedly.' },
  { id: 'consider_feelings', text: 'The task required me to consider another person\'s feelings.' },
  { id: 'logical_reasoning', text: 'The task required logical reasoning to reach a conclusion.' },
  { id: 'repetitive_steps', text: 'The task involved repetitive steps.' },
  { id: 'imagination', text: 'The task required imagination.' },
  { id: 'consider_perspective', text: 'The task required me to consider another person\'s perspective.' },
  { id: 'follow_procedure', text: 'The task required me to follow the same procedure repeatedly.' },
  { id: 'creative_thinking', text: 'The task required creative thinking.' },
  { id: 'think_reaction', text: 'The task required me to think about how another person might react.' },
  { id: 'compare_evaluate', text: 'The task required me to compare and evaluate different pieces of information.' },
] as const

type SurveyAnswers = {
  clarity?: number
  unclearDescription?: string
  difficulty?: number
  timeSufficient?: number
  waitTime?: number
  agreement: Record<string, number | undefined>
  familiarity?: number
}

export default function PostTaskSurveyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const taskId = useAppStore((s) => s.taskId)
  const taskType = useAppStore((s) => s.taskType)
  const userId = useAppStore((s) => s.userId)
  const prolificId = useAppStore((s) => s.prolificId)
  const setPostSurveyCompleted = useAppStore((s) => s.setPostSurveyCompleted)

  const [answers, setAnswers] = useState<SurveyAnswers>({
    agreement: {},
  })
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showBackDialog, setShowBackDialog] = useState(false)

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

  // Skip survey when disabled
  useEffect(() => {
    if (!FLOW_CONFIG.postSurvey) {
      const skip = getSkipRouteWithParams('postSurvey', searchParams)
      if (skip) router.replace(skip)
      else router.replace('/thank-you')
    }
  }, [router, searchParams, setPostSurveyCompleted])

  const taskTypeLabel = taskType ? (TASK_TYPE_LABELS[taskType] || 'tasks') : 'tasks'

  const allRequiredAnswered = (): boolean => {
    if (!answers.clarity) return false
    if (!answers.difficulty) return false
    if (!answers.timeSufficient) return false
    if (!answers.waitTime) return false
    if (!answers.familiarity) return false
    for (const item of AGREEMENT_ITEMS) {
      if (answers.agreement[item.id] === undefined) return false
    }
    return true
  }

  const handleNext = () => {
    if (!allRequiredAnswered()) {
      setError('Please answer all required questions before proceeding.')
      return
    }
    setError('')
    setShowConfirmDialog(true)
  }

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false)
    setIsSubmitting(true)

    const eq = encodedQuery(searchParams)
    const qs = eq ? eq : ''

    try {
      const response = await fetch('/api/post-task-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          userId,
          prolificId,
          ...answers,
        }),
      })

      if (response.ok) {
        setPostSurveyCompleted(true)
        router.replace(`/demographics-survey${qs}`)
      } else {
        setError('Failed to save your responses. Please try again.')
        setIsSubmitting(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setIsSubmitting(false)
    }
  }

  const setClarity = (v: string) => setAnswers((p) => ({ ...p, clarity: Number(v) }))
  const setDifficulty = (v: string) => setAnswers((p) => ({ ...p, difficulty: Number(v) }))
  const setTime = (v: string) => setAnswers((p) => ({ ...p, timeSufficient: Number(v) }))
  const setWaitTime = (v: string) => setAnswers((p) => ({ ...p, waitTime: Number(v) }))
  const setFamiliarity = (v: string) => setAnswers((p) => ({ ...p, familiarity: Number(v) }))
  const setAgreement = (id: string, v: string) => 
    setAnswers((p) => ({ ...p, agreement: { ...p.agreement, [id]: Number(v) } }))

  const renderRadioGroup = (
    name: string,
    value: number | undefined,
    options: { value: number; label: string }[],
    onChange: (v: string) => void
  ) => (
    <RadioGroup value={value !== undefined ? String(value) : ''} onValueChange={onChange}>
      <div className="flex justify-between gap-0.5">
        {options.map((opt) => (
          <div key={opt.value} className="flex flex-col items-center gap-0.5 flex-1">
            <RadioGroupItem value={String(opt.value)} id={`${name}-${opt.value}`} className="sr-only peer" />
            <Label
              htmlFor={`${name}-${opt.value}`}
              className="cursor-pointer flex items-center justify-center w-7 h-7 rounded-full border border-gray-300 text-[11px] font-medium peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-colors"
            >
              {opt.value}
            </Label>
            <span className="text-[9px] text-gray-500 text-center leading-tight whitespace-nowrap">
              {opt.label}
            </span>
          </div>
        ))}
      </div>
    </RadioGroup>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <Card className="max-w-3xl w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Post-Task Survey
          </CardTitle>
          <p className="text-center text-gray-500 text-sm mt-1">
            Please answer the following questions about the task you just completed.
          </p>
        </CardHeader>

        <CardContent className="space-y-8 pb-2">
          {/* Q1: Cognitive load items */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              1. Thinking about the task you just completed, please indicate how much you agree or disagree with each of the following statements. <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-5 bg-gray-50 p-4 rounded-lg border">
              {AGREEMENT_ITEMS.map((item) => (
                <div key={item.id} className="space-y-2">
                  <p className="text-sm text-gray-700">{item.text}</p>
                  <RadioGroup
                    value={answers.agreement[item.id] !== undefined ? String(answers.agreement[item.id]) : ''}
                    onValueChange={(v) => setAgreement(item.id, v)}
                  >
                    <div className="flex justify-between gap-0.5">
                      {AGREEMENT_OPTIONS.map((opt) => (
                        <div key={opt.value} className="flex flex-col items-center gap-0.5 flex-1">
                          <RadioGroupItem value={String(opt.value)} id={`${item.id}-${opt.value}`} className="sr-only peer" />
                          <Label
                            htmlFor={`${item.id}-${opt.value}`}
                            className="cursor-pointer flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 text-[11px] font-medium peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-colors"
                          >
                            {opt.value}
                          </Label>
                          <span className="text-[9px] text-gray-500 text-center leading-tight whitespace-nowrap">
                            {opt.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              ))}
            </div>
          </div>

          {/* Q2: Familiarity */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              2. How familiar are you with tasks involving {taskTypeLabel}? <span className="text-red-500">*</span>
            </Label>
            {renderRadioGroup('familiarity', answers.familiarity, FAMILIARITY_OPTIONS, setFamiliarity)}
          </div>

          {/* Q3: Clarity */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              3. How clear were the task instructions? <span className="text-red-500">*</span>
            </Label>
            {renderRadioGroup('clarity', answers.clarity, CLARITY_OPTIONS, setClarity)}
          </div>

          {/* Q4: Difficulty */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              4. How difficult did you find the task? <span className="text-red-500">*</span>
            </Label>
            {renderRadioGroup('difficulty', answers.difficulty, DIFFICULTY_OPTIONS, setDifficulty)}
          </div>

          {/* Q5: Time */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              5. To what extent did you feel that you had enough time to complete the task to your satisfaction? <span className="text-red-500">*</span>
            </Label>
            {renderRadioGroup('time', answers.timeSufficient, TIME_OPTIONS, setTime)}
          </div>

          {/* Q6: Wait time */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              6. To what extent did you feel that you had to wait for the minimum time to pass before you could submit your response? <span className="text-red-500">*</span>
            </Label>
            {renderRadioGroup('waitTime', answers.waitTime, WAIT_TIME_OPTIONS, setWaitTime)}
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
        </CardContent>

        <div className="px-6 pb-6">
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            size="lg"
            className="w-full"
          >
            Next
          </Button>
        </div>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proceed to Next Step?</DialogTitle>
            <DialogDescription>
              Are you sure you want to proceed to the next step? Your previous answers cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Yes, Proceed'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Back Navigation Warning Dialog */}
      <Dialog open={showBackDialog} onOpenChange={setShowBackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Warning: Page Navigation Blocked</DialogTitle>
            <DialogDescription>
              You cannot go back to the previous step. Once you leave this page, your task responses cannot be changed.
              <br /><br />
              If you accidentally navigate away, you will need to start the entire study over.
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
