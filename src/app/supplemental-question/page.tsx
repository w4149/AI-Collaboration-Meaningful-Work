"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import { getSkipRouteWithParams, FLOW_CONFIG } from '@/lib/flow-config'
import { encodedQuery } from '@/lib/url-cipher'

const AI_WORK_EXTENT_OPTIONS = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Rarely' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Often' },
  { value: 5, label: 'Almost every day' },
]

const AGREEMENT_OPTIONS = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neither' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly agree' },
]

const AI_INTERACTION_OPTIONS = [
  { value: 0, label: 'Never — I completed the task without using the AI assistant' },
  { value: 1, label: 'Seldom — I consulted the AI assistant only a few times' },
  { value: 2, label: 'Often — I consulted the AI assistant repeatedly during the task' }
]

const AI_EXPERIENCE_ITEMS = [
  { id: 'ai_perceivedUsefulness', text: 'provided outputs that were helpful for completing my task.' },
  { id: 'ai_perceivedEaseOfUse', text: 'required little effort for me to interact with.' },
  { id: 'ai_perceivedTrustworthiness', text: 'produced outputs that I can trust.' },
  { id: 'ai_interactionFluency', text: 'understood my intentions and maintained smooth conversation flow.' },
  { id: 'ai_satisfaction', text: 'delivered an overall satisfying interaction experience.' },
]

const AI_NO_USE_REASONS = [
  { value: 'a', label: 'The AI assistant is unavailable due to technical issues.', hasInput: false },
  { value: 'b', label: 'After reading the task, I felt I could complete it fully on my own.', hasInput: false },
  { value: 'c', label: 'I did not know how to use it (e.g., where to type or how to send).', hasInput: false },
  { value: 'd', label: 'I thought using the AI assistant would take too much effort and time.', hasInput: false },
  { value: 'e', label: 'I did not trust the AI-generated content.', hasInput: false },
  { value: 'f', label: 'I was worried that using AI would be seen as cheating or would hurt my evaluation.', hasInput: false },
  { value: 'g', label: 'I used another tool instead (e.g., ChatGPT, a search engine).', hasInput: false },
  { value: 'h', label: 'Other', hasInput: true },
]

type NoUseReasons = {
  a?: boolean
  b?: boolean
  c?: boolean
  d?: boolean
  e?: boolean
  f?: boolean
}

export default function SupplementalQuestionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const taskId = useAppStore((s) => s.taskId)
  const userId = useAppStore((s) => s.userId)
  const prolificId = useAppStore((s) => s.prolificId)
  const groupType = useAppStore((s) => s.groupType)
  const setSupplementalQuestionCompleted = useAppStore((s) => s.setSupplementalQuestionCompleted)

  const isHumanOnly = groupType === 'G1-Human'

  const [aiWorkExtent, setAiWorkExtent] = useState<number | undefined>(undefined)

  const [aiInteractionFreq, setAiInteractionFreq] = useState<number | undefined>(undefined)

  const [aiExperience, setAiExperience] = useState<Record<string, number | undefined>>({})

  const [noUseReasons, setNoUseReasons] = useState<NoUseReasons>({})
  const [noUseOther, setNoUseOther] = useState('')

  const [aiSuggestions, setAiSuggestions] = useState('')

  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showBackDialog, setShowBackDialog] = useState(false)

  const usedAI = aiInteractionFreq !== undefined && aiInteractionFreq > 0

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
    if (!FLOW_CONFIG.supplementalQuestion) {
      const skip = getSkipRouteWithParams('supplementalQuestion', searchParams)
      if (skip) router.replace(skip)
      else router.replace('/manipulation-check')
    }
  }, [router, searchParams])

  const toggleNoUseReason = (key: keyof NoUseReasons) => {
    setNoUseReasons((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleNext = () => {
    if (aiWorkExtent === undefined) {
      setError('Please answer all required questions before proceeding.')
      return
    }

    if (!isHumanOnly) {
      if (aiInteractionFreq === undefined) {
        setError('Please answer the AI interaction frequency question.')
        return
      }

      if (usedAI) {
        for (const item of AI_EXPERIENCE_ITEMS) {
          if (aiExperience[item.id] === undefined) {
            setError('Please answer all AI experience rating questions.')
            return
          }
        }
      } else {
        const hasReasons = Object.values(noUseReasons).some((v) => v)
        if (!hasReasons) {
          setError('Please select at least one reason for not using the AI assistant.')
          return
        }
        if (noUseReasons.f && !noUseOther.trim()) {
          setError('Please specify your reason for "Other".')
          return
        }
      }

      if (!aiSuggestions.trim()) {
        setError('Please share your experience or suggestions in the text field.')
        return
      }
    }

    setError('')
    setShowConfirmDialog(true)
  }

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false)
    setIsSubmitting(true)

    const eq = encodedQuery(searchParams)
    const qs = eq ? eq : ''

    const payload: Record<string, unknown> = {
      userId,
      prolificId,
      aiWorkExtent,
    }

    if (!isHumanOnly) {
      payload.aiInteractionFreq = aiInteractionFreq

      if (usedAI) {
        payload.ai_perceivedUsefulness = aiExperience.ai_perceivedUsefulness
        payload.ai_perceivedEaseOfUse = aiExperience.ai_perceivedEaseOfUse
        payload.ai_perceivedTrustworthiness = aiExperience.ai_perceivedTrustworthiness
        payload.ai_interactionFluency = aiExperience.ai_interactionFluency
        payload.ai_satisfaction = aiExperience.ai_satisfaction
        payload.aiSuggestions = aiSuggestions
      } else {
        const reasons: string[] = []
        if (noUseReasons.a) reasons.push('a')
        if (noUseReasons.b) reasons.push('b')
        if (noUseReasons.c) reasons.push('c')
        if (noUseReasons.d) reasons.push('d')
        if (noUseReasons.e) reasons.push('e')
        if (noUseReasons.f) reasons.push('f')
        payload.aiNoUseReasons = reasons.join(',')
        payload.aiNoUseOther = noUseReasons.f ? noUseOther : null
        payload.aiSuggestions = aiSuggestions
      }
    }

    try {
      const response = await fetch('/api/supplemental-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setSupplementalQuestionCompleted(true)
        router.replace(`/manipulation-check${qs}`)
      } else {
        const data = await response.json().catch(() => ({}))
        setError(`Failed to save. ${data.error || 'Please try again.'}`)
        setIsSubmitting(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setIsSubmitting(false)
    }
  }

  const renderScale = (
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
              className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-[13px] font-medium peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-colors"
            >
              {opt.value}
            </Label>
            <span className="text-[11px] text-gray-500 text-center leading-tight whitespace-nowrap min-h-[2em]">
              {opt.label}
            </span>
          </div>
        ))}
      </div>
    </RadioGroup>
  )

  const renderAgreementScale = (
    name: string,
    value: number | undefined,
    onChange: (v: string) => void
  ) => (
    <RadioGroup value={value !== undefined ? String(value) : ''} onValueChange={onChange}>
      <div className="flex justify-between gap-0.5">
        {AGREEMENT_OPTIONS.map((opt) => (
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
            Supplemental Question
          </CardTitle>
          <p className="text-center text-gray-500 text-sm mt-1">
            Please answer the following questions.
          </p>
        </CardHeader>

        <CardContent className="space-y-8 pb-2">
          {/* Q1: AI work extent */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              How often do you currently use generative AI tools (e.g., ChatGPT, Claude, Gemini) for work, study, or other daily tasks? <span className="text-red-500">*</span>
            </Label>
            {renderScale('aiWorkExtent', aiWorkExtent, AI_WORK_EXTENT_OPTIONS, (v) => setAiWorkExtent(Number(v)))}
          </div>

          {/* AI interaction questions - hidden for Human-only group */}
          {!isHumanOnly && (
            <>
              {/* Q2: AI interaction frequency */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  How frequently did you interact with the AI assistant provided in the interface while completing the writing task? <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={aiInteractionFreq !== undefined ? String(aiInteractionFreq) : ''}
                  onValueChange={(v) => setAiInteractionFreq(Number(v))}
                >
                  <div className="space-y-2">
                    {AI_INTERACTION_OPTIONS.map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-3">
                        <RadioGroupItem value={String(opt.value)} id={`freq-${opt.value}`} />
                        <Label htmlFor={`freq-${opt.value}`} className="text-sm cursor-pointer">
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* If used AI: show experience ratings */}
              {usedAI && (
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    To what extent do you agree with the following statements about the AI assistant provided in the interface? <span className="text-red-500">*</span>
                  </Label>
                  <div className="space-y-5 bg-gray-50 p-4 rounded-lg border">
                    {AI_EXPERIENCE_ITEMS.map((item) => (
                      <div key={item.id} className="space-y-2">
                        <p className="text-sm text-gray-700">The AI available in the interface {item.text}</p>
                        {renderAgreementScale(
                          item.id,
                          aiExperience[item.id],
                          (v) => setAiExperience((p) => ({ ...p, [item.id]: Number(v) }))
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* If did NOT use AI: show reasons */}
              {aiInteractionFreq === 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Why did you not use the AI assistant provided in the interface? <span className="text-red-500">*</span>
                  </Label>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg border">
                    {AI_NO_USE_REASONS.map((r) => (
                      <div key={r.value} className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id={`reason-${r.value}`}
                            checked={!!noUseReasons[r.value as keyof NoUseReasons]}
                            onCheckedChange={() => toggleNoUseReason(r.value as keyof NoUseReasons)}
                          />
                          <Label htmlFor={`reason-${r.value}`} className="text-sm cursor-pointer leading-tight">
                            {r.label}
                          </Label>
                        </div>
                        {r.hasInput && noUseReasons[r.value as keyof NoUseReasons] && (
                          <div className="ml-7">
                            {r.value === 'f' && (
                              <Textarea
                                placeholder="Please specify other reasons..."
                                value={noUseOther}
                                onChange={(e) => setNoUseOther(e.target.value)}
                                className="min-h-[60px]"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI suggestions - required */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Did you experience any other issues interacting with the AI assistant that were not listed above? (Please enter “none” if you had no additional issues.) <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Share other issues interacting with the AI assistant..."
                  value={aiSuggestions}
                  onChange={(e) => setAiSuggestions(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </>
          )}

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
            {isSubmitting ? 'Submitting...' : 'Next'}
          </Button>
        </div>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your answer?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
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
              You cannot go back to the previous step. Once you leave this page, your responses cannot be changed.
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