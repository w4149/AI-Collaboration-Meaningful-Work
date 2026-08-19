"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import { getSkipRouteWithParams, FLOW_CONFIG } from '@/lib/flow-config'
import { encodedQuery } from '@/lib/url-cipher'

const AGREEMENT_OPTIONS = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Somewhat disagree' },
  { value: 4, label: 'Neither' },
  { value: 5, label: 'Somewhat agree' },
  { value: 6, label: 'Agree' },
  { value: 7, label: 'Strongly agree' },
]

const MENTAL_EFFORT_OPTIONS = [
  { value: 1, label: 'Extremely low' },
  { value: 2, label: 'Very low' },
  { value: 3, label: 'Low' },
  { value: 4, label: 'Moderate' },
  { value: 5, label: 'High' },
  { value: 6, label: 'Very high' },
  { value: 7, label: 'Extremely high' },
]

const MEANING_ITEMS = [
  { id: 'meaningful', text: 'This task was meaningful to me.' },
  { id: 'contributed_growth', text: 'This task contributed to my growth at work.' },
  { id: 'sense_of_purpose', text: 'This task gave me a sense of purpose.' },
  { id: 'worthwhile', text: 'This task was worthwhile to me.' },
]

const OWNERSHIP_ITEMS = [
  { id: 'my_task_output', text: 'The task output is MY task output.' },
  { id: 'sense_of_belonging', text: 'I sense that the output of the task belongs to me.' },
  { id: 'personal_ownership', text: 'I feel a very high degree of personal ownership for my task.' },
  { id: 'this_is_my_task', text: 'I sense that this is MY task.' },
  { id: 'hard_to_think_mine', text: 'It is hard for me to think about this task as MINE.' },
]

const AUTONOMY_OPTIONS = [
  { value: 1, label: 'Very inaccurate' },
  { value: 2, label: 'Somewhat inaccurate' },
  { value: 3, label: 'Slightly inaccurate' },
  { value: 4, label: 'Neutral' },
  { value: 5, label: 'Slightly accurate' },
  { value: 6, label: 'Somewhat accurate' },
  { value: 7, label: 'Very accurate' },
]

const AUTONOMY_ITEMS = [
  { id: 'decide_own_how', text: 'I could decide on my own how to go about getting the task done.' },
  { id: 'make_decisions_own', text: 'The task allowed me to make decisions on my own.' },
  { id: 'opportunity_independence', text: 'I had considerable opportunity for independence and freedom in how I did this task.' },
  { id: 'personal_initiative', text: 'I could use my personal initiative or judgment in carrying out the task.' },
]

const SKILL_OPTIONS = [
  { value: 1, label: 'Not at all' },
  { value: 2, label: 'Very little' },
  { value: 3, label: 'Little' },
  { value: 4, label: 'Somewhat' },
  { value: 5, label: 'Much' },
  { value: 6, label: 'Very much' },
  { value: 7, label: 'A great deal' },
]

const SKILL_ITEMS = [
  { id: 'learn_new_things', text: 'learn new things?' },
  { id: 'utilize_abilities', text: 'work in the way that best utilizes your abilities?' },
  { id: 'use_talent_skills', text: 'use your talent and skills?' },
  { id: 'develop_skills', text: 'offer opportunities to develop your skills or abilities?' },
]

type PsychologicalAnswers = {
  meaning: Record<string, number | undefined>
  ownership: Record<string, number | undefined>
  mentalEffort?: number
  autonomy: Record<string, number | undefined>
  attentionCheck?: number
  skill: Record<string, number | undefined>
}

export default function PsychologicalScalePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const taskId = useAppStore((s) => s.taskId)
  const userId = useAppStore((s) => s.userId)
  const prolificId = useAppStore((s) => s.prolificId)
  const setPsychologicalScaleCompleted = useAppStore((s) => s.setPsychologicalScaleCompleted)

  const [answers, setAnswers] = useState<PsychologicalAnswers>({
    meaning: {},
    ownership: {},
    autonomy: {},
    skill: {},
  })
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showBackDialog, setShowBackDialog] = useState(false)

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

  useEffect(() => {
    if (!FLOW_CONFIG.psychologicalScale) {
      const skip = getSkipRouteWithParams('psychologicalScale', searchParams)
      if (skip) router.replace(skip)
      else {
        const eq = encodedQuery(searchParams)
        router.replace(eq ? `/post-task-survey${eq}` : '/post-task-survey')
      }
    }
  }, [router, searchParams, setPsychologicalScaleCompleted])

  const saveAttentionCheck = async (isCorrect: boolean): Promise<boolean> => {
    try {
      const payload = {
        userId,
        checkType: 2,
        answer: String(answers.attentionCheck ?? ''),
        isCorrect,
      }
      console.log('[PsychScale] saveAttentionCheck payload:', JSON.stringify(payload))
      const res = await fetch('/api/attention-checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errText = await res.text()
        console.error('Attention check save failed:', res.status, errText)
        return false
      }
      const data = await res.json()
      console.log('[PsychScale] saveAttentionCheck response:', JSON.stringify(data))
      return true
    } catch (e) {
      console.error('Failed to save attention check:', e)
      return false
    }
  }

  const allRequiredAnswered = (): boolean => {
    for (const item of MEANING_ITEMS) {
      if (answers.meaning[item.id] === undefined) return false
    }
    for (const item of OWNERSHIP_ITEMS) {
      if (answers.ownership[item.id] === undefined) return false
    }
    if (answers.mentalEffort === undefined) return false
    for (const item of AUTONOMY_ITEMS) {
      if (answers.autonomy[item.id] === undefined) return false
    }
    if (answers.attentionCheck === undefined) return false
    for (const item of SKILL_ITEMS) {
      if (answers.skill[item.id] === undefined) return false
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
      const attentionAnswer = answers.attentionCheck
      console.log('[PsychScale] userId from store:', userId, 'type:', typeof userId)
      console.log('[PsychScale] attentionCheck answer:', attentionAnswer, 'type:', typeof attentionAnswer)
      if (attentionAnswer !== undefined) {
        const isCorrect = attentionAnswer === 7
        console.log('[PsychScale] Saving attention check, isCorrect:', isCorrect)
        const acRes = await saveAttentionCheck(isCorrect)
        console.log('[PsychScale] saveAttentionCheck result:', acRes)
        if (!acRes) {
          console.warn('Attention check save failed, continuing anyway')
        }
      } else {
        console.warn('[PsychScale] attentionCheck is undefined, skipping save')
      }

      const response = await fetch('/api/psychological-scale', {
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
        setPsychologicalScaleCompleted(true)
        router.replace(`/post-task-survey${qs}`)
      } else {
        setError('Failed to save your responses. Please try again.')
        setIsSubmitting(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setIsSubmitting(false)
    }
  }

  const setMeaning = (id: string, v: string) =>
    setAnswers((p) => ({ ...p, meaning: { ...p.meaning, [id]: Number(v) } }))
  const setOwnership = (id: string, v: string) =>
    setAnswers((p) => ({ ...p, ownership: { ...p.ownership, [id]: Number(v) } }))
  const setMentalEffort = (v: string) =>
    setAnswers((p) => ({ ...p, mentalEffort: Number(v) }))
  const setAutonomy = (id: string, v: string) =>
    setAnswers((p) => ({ ...p, autonomy: { ...p.autonomy, [id]: Number(v) } }))
  const setAttention = (v: string) =>
    setAnswers((p) => ({ ...p, attentionCheck: Number(v) }))
  const setSkill = (id: string, v: string) =>
    setAnswers((p) => ({ ...p, skill: { ...p.skill, [id]: Number(v) } }))

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
  )

  const renderItemList = (
    items: { id: string; text: string }[],
    answers: Record<string, number | undefined>,
    setter: (id: string, v: string) => void,
    scaleOptions: { value: number; label: string }[]
  ) => (
    <div className="space-y-5 bg-gray-50 p-4 rounded-lg border">
      {items.map((item) => (
        <div key={item.id} className="space-y-2">
          <p className="text-sm text-gray-700">{item.text}</p>
          <RadioGroup
            value={answers[item.id] !== undefined ? String(answers[item.id]) : ''}
            onValueChange={(v) => setter(item.id, v)}
          >
            <div className="flex justify-between gap-0.5">
              {scaleOptions.map((opt) => (
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
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <Card className="max-w-3xl w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Your Experience with the Task
          </CardTitle>
          <p className="text-center text-gray-500 text-sm mt-1">
            Please answer the following questions about the task you just completed.
          </p>
        </CardHeader>

        <CardContent className="space-y-8 pb-2">
          {/* Q1: Meaning */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              1. Please think about the task you just did, and indicate to what extent you agree or disagree with the following statements. <span className="text-red-500">*</span>
            </Label>
            {renderItemList(MEANING_ITEMS, answers.meaning, setMeaning, AGREEMENT_OPTIONS)}
          </div>

          {/* Q2: Psychological Ownership */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              2. Please continue to think about the task you just did, and indicate to what extent you agree or disagree with the following statements. <span className="text-red-500">*</span>
            </Label>
            {renderItemList(OWNERSHIP_ITEMS, answers.ownership, setOwnership, AGREEMENT_OPTIONS)}
          </div>

          {/* Q3: Mental Effort */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              3. How much mental effort did you invest in the task you just did? <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-gray-500">
              Mental effort is how much thinking and focused attention you actually put into completing the task—not how difficult the task was or how physically tired you felt.
            </p>
            {renderRadioGroup('mentalEffort', answers.mentalEffort, MENTAL_EFFORT_OPTIONS, setMentalEffort)}
          </div>

          {/* Q4: Autonomy */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              4. Please indicate how accurately or inaccurately the following statements describe the task you just did. <span className="text-red-500">*</span>
            </Label>
            {renderItemList(AUTONOMY_ITEMS, answers.autonomy, setAutonomy, AUTONOMY_OPTIONS)}
          </div>

          {/* Q5: Attention check (silent, no special highlighting) */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              5. This is an attention check question. Please select <strong>&quot;Strongly agree&quot;</strong> below. <span className="text-red-500">*</span>
            </Label>
            {renderRadioGroup('attentionCheck', answers.attentionCheck, AGREEMENT_OPTIONS, setAttention)}
          </div>

          {/* Q6: Skill Utilisation */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              6. Thinking about the task you just did: To what extent did the task allow you to... <span className="text-red-500">*</span>
            </Label>
            {renderItemList(SKILL_ITEMS, answers.skill, setSkill, SKILL_OPTIONS)}
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
