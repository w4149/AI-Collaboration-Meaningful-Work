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

const TASK_TYPE_LABELS: Record<string, string> = {
  'task1': 'event design tasks',
  'task1-2': 'event design tasks',
  'task2': 'evaluation and analysis tasks',
  'task3': 'categorization tasks',
  'task4': 'creative design tasks',
  'task4-2': 'creative design tasks',
}

// Scale options
const CLARITY_OPTIONS = [
  { value: 1, label: '1 — Not at all clear' },
  { value: 2, label: '2 — Slightly clear' },
  { value: 3, label: '3 — Moderately clear' },
  { value: 4, label: '4 — Very clear' },
  { value: 5, label: '5 — Extremely clear' },
]

const DIFFICULTY_OPTIONS = [
  { value: 1, label: '1 — Not at all difficult' },
  { value: 2, label: '2 — Slightly difficult' },
  { value: 3, label: '3 — Moderately difficult' },
  { value: 4, label: '4 — Very difficult' },
  { value: 5, label: '5 — Extremely difficult' },
]

const TIME_OPTIONS = [
  { value: 1, label: '1 — Not at all' },
  { value: 2, label: '2 — Slightly' },
  { value: 3, label: '3 — Moderately' },
  { value: 4, label: '4 — To a great extent' },
  { value: 5, label: '5 — Completely' },
]

const AGREEMENT_OPTIONS = [
  { value: 1, label: '1 — Strongly disagree' },
  { value: 2, label: '2 — Disagree' },
  { value: 3, label: '3 — Somewhat disagree' },
  { value: 4, label: '4 — Neither agree nor disagree' },
  { value: 5, label: '5 — Somewhat agree' },
  { value: 6, label: '6 — Agree' },
  { value: 7, label: '7 — Strongly agree' },
]

const FAMILIARITY_OPTIONS = [
  { value: 1, label: '1 — Not at all familiar' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4 — Moderately familiar' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7 — Extremely familiar' },
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
  agreement: Record<string, number | undefined>
  familiarity?: number
}

export default function PostTaskSurveyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const taskId = useAppStore((s) => s.taskId)
  const userId = useAppStore((s) => s.userId)
  const prolificId = useAppStore((s) => s.prolificId)
  const setPostSurveyCompleted = useAppStore((s) => s.setPostSurveyCompleted)

  const [answers, setAnswers] = useState<SurveyAnswers>({
    agreement: {},
  })
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Skip survey when disabled
  useEffect(() => {
    if (!FLOW_CONFIG.postSurvey) {
      const skip = getSkipRouteWithParams('postSurvey', searchParams)
      if (skip) router.replace(skip)
      else router.replace('/thank-you')
    }
  }, [router, searchParams, setPostSurveyCompleted])

  const taskTypeLabel = taskId ? (TASK_TYPE_LABELS[taskId] || 'tasks') : 'tasks'

  const allRequiredAnswered = (): boolean => {
    if (!answers.clarity) return false
    if (!answers.difficulty) return false
    if (!answers.timeSufficient) return false
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

    const params = searchParams.toString()
    const qs = params ? `?${params}` : ''

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt) => (
          <div key={opt.value} className="flex items-start gap-2">
            <RadioGroupItem value={String(opt.value)} id={`${name}-${opt.value}`} className="mt-1" />
            <Label htmlFor={`${name}-${opt.value}`} className="cursor-pointer text-sm leading-tight">
              {opt.label}
            </Label>
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
          {/* Q1: Clarity */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              1. How clear were the task instructions? <span className="text-red-500">*</span>
            </Label>
            {renderRadioGroup('clarity', answers.clarity, CLARITY_OPTIONS, setClarity)}
          </div>

          {/* Q2: Unclear description (optional) */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              2. Was anything about the task instructions unclear? If so, please briefly describe what was unclear.
              <span className="text-sm text-gray-400 font-normal"> (Optional)</span>
            </Label>
            <Textarea
              value={answers.unclearDescription || ''}
              onChange={(e) => setAnswers((p) => ({ ...p, unclearDescription: e.target.value }))}
              placeholder="Describe what was unclear..."
              className="min-h-[80px]"
            />
          </div>

          {/* Q3: Difficulty */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              3. How difficult did you find the task? <span className="text-red-500">*</span>
            </Label>
            {renderRadioGroup('difficulty', answers.difficulty, DIFFICULTY_OPTIONS, setDifficulty)}
          </div>

          {/* Q4: Time */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              4. To what extent did you feel that you had enough time to complete the task to your satisfaction? <span className="text-red-500">*</span>
            </Label>
            {renderRadioGroup('time', answers.timeSufficient, TIME_OPTIONS, setTime)}
          </div>

          {/* Q5: Cognitive load items */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              5. Thinking about the task you just completed, please indicate how much you agree or disagree with each of the following statements. <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-5 bg-gray-50 p-4 rounded-lg border">
              {AGREEMENT_ITEMS.map((item) => (
                <div key={item.id} className="space-y-2">
                  <p className="text-sm text-gray-700">{item.text}</p>
                  <div className="overflow-x-auto">
                    <RadioGroup
                      value={answers.agreement[item.id] !== undefined ? String(answers.agreement[item.id]) : ''}
                      onValueChange={(v) => setAgreement(item.id, v)}
                    >
                      <div className="flex gap-2 min-w-max">
                        {AGREEMENT_OPTIONS.map((opt) => (
                          <div key={opt.value} className="flex items-center gap-1.5 shrink-0">
                            <RadioGroupItem value={String(opt.value)} id={`${item.id}-${opt.value}`} />
                            <Label htmlFor={`${item.id}-${opt.value}`} className="cursor-pointer text-xs whitespace-nowrap">
                              {opt.value}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Scale: 1 — Strongly disagree, 2 — Disagree, 3 — Somewhat disagree, 4 — Neither agree nor disagree, 5 — Somewhat agree, 6 — Agree, 7 — Strongly agree
            </p>
          </div>

          {/* Q6: Familiarity */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              6. How familiar are you with tasks involving {taskTypeLabel}? <span className="text-red-500">*</span>
            </Label>
            {renderRadioGroup('familiarity', answers.familiarity, FAMILIARITY_OPTIONS, setFamiliarity)}
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
    </div>
  )
}
