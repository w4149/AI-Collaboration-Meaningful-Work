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

const AI_FAMILIARITY_OPTIONS = [
  { value: 1, label: 'Not familiar at all' },
  { value: 2, label: 'Slightly familiar' },
  { value: 3, label: 'Somewhat familiar' },
  { value: 4, label: 'Moderately familiar' },
  { value: 5, label: 'Quite familiar' },
  { value: 6, label: 'Very familiar' },
  { value: 7, label: 'Extremely familiar' },
]

const AI_WORK_EXTENT_OPTIONS = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Rarely' },
  { value: 3, label: 'Occasionally' },
  { value: 4, label: 'Sometimes' },
  { value: 5, label: 'Often' },
  { value: 6, label: 'Very often' },
  { value: 7, label: 'Almost every day' },
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

const AI_INTERACTION_OPTIONS = [
  { value: 0, label: '0 times (I did not use it at all)' },
  { value: 1, label: '1-2 times' },
  { value: 2, label: '3-5 times' },
  { value: 3, label: '6 or more times' },
]

const AI_EXPERIENCE_ITEMS = [
  { id: 'ai_helpful', text: 'Provided helpful answers' },
  { id: 'ai_easy', text: 'Easy to use' },
  { id: 'ai_speed', text: 'Fast response speed' },
]

const AI_NO_USE_REASONS = [
  { value: 'a', label: 'Encountered technical issues, cannot use the AI interface normally', hasInput: true },
  { value: 'b', label: 'AI interface operations are too complex, I prefer to write it myself', hasInput: false },
  { value: 'c', label: 'I do not trust the AI-generated content, I prefer to complete it myself', hasInput: false },
  { value: 'd', label: 'I think my existing knowledge is sufficient to complete the task, no AI assistance is needed', hasInput: false },
  { value: 'e', label: 'I am concerned that using the AI will be considered cheating or affect the evaluation process', hasInput: false },
  { value: 'f', label: 'I used a different AI tool instead (e.g., ChatGPT, Claude, Gemini, etc.)', hasInput: false },
  { value: 'g', label: 'I used a search engine or other non-AI tool', hasInput: false },
  { value: 'h', label: 'Other', hasInput: true },
]

type NoUseReasons = {
  a?: boolean
  b?: boolean
  c?: boolean
  d?: boolean
  e?: boolean
  f?: boolean
  g?: boolean
  h?: boolean
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

  const [aiFamiliarity, setAiFamiliarity] = useState<number | undefined>(undefined)
  const [aiWorkExtent, setAiWorkExtent] = useState<number | undefined>(undefined)

  // AI interaction frequency (0=none, 1=1-2, 2=3-5, 3=6+)
  const [aiInteractionFreq, setAiInteractionFreq] = useState<number | undefined>(undefined)

  // AI experience ratings (for those who used AI)
  const [aiExperience, setAiExperience] = useState<Record<string, number | undefined>>({})

  // No-use reasons (for those who didn't use AI)
  const [noUseReasons, setNoUseReasons] = useState<NoUseReasons>({})
  const [noUseTechIssue, setNoUseTechIssue] = useState('')
  const [noUseOther, setNoUseOther] = useState('')

  // Optional suggestions
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
    if (aiFamiliarity === undefined || aiWorkExtent === undefined) {
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
        if (noUseReasons.a && !noUseTechIssue.trim()) {
          setError('Please describe the technical issue you encountered.')
          return
        }
        if (noUseReasons.h && !noUseOther.trim()) {
          setError('Please specify your reason for "Other".')
          return
        }
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
      aiFamiliarity,
      aiWorkExtent,
    }

    if (!isHumanOnly) {
      payload.aiInteractionFreq = aiInteractionFreq

      if (usedAI) {
        payload.aiHelpful = aiExperience.ai_helpful
        payload.aiEasy = aiExperience.ai_easy
        payload.aiSpeed = aiExperience.ai_speed
        payload.aiSuggestions = aiSuggestions || null
      } else {
        const reasons: string[] = []
        if (noUseReasons.a) reasons.push('a')
        if (noUseReasons.b) reasons.push('b')
        if (noUseReasons.c) reasons.push('c')
        if (noUseReasons.d) reasons.push('d')
        if (noUseReasons.e) reasons.push('e')
        if (noUseReasons.f) reasons.push('f')
        if (noUseReasons.g) reasons.push('g')
        if (noUseReasons.h) reasons.push('h')
        payload.aiNoUseReasons = reasons.join(',')
        payload.aiNoUseTechIssue = noUseReasons.a ? noUseTechIssue : null
        payload.aiNoUseOther = noUseReasons.h ? noUseOther : null
        payload.aiSuggestions = aiSuggestions || null
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
          {/* Q1: AI familiarity */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Before participating in this study, how familiar were you with generative AI tools (e.g., ChatGPT, Gemini, Claude, or another similar tool)? <span className="text-red-500">*</span>
            </Label>
            {renderScale('aiFamiliarity', aiFamiliarity, AI_FAMILIARITY_OPTIONS, (v) => setAiFamiliarity(Number(v)))}
          </div>

          {/* Q2: AI work extent */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              How often do you currently use generative AI tools (e.g., ChatGPT, Claude, Gemini) for work, study, or other daily tasks? <span className="text-red-500">*</span>
            </Label>
            {renderScale('aiWorkExtent', aiWorkExtent, AI_WORK_EXTENT_OPTIONS, (v) => setAiWorkExtent(Number(v)))}
          </div>

          {/* AI interaction questions - hidden for Human-only group */}
          {!isHumanOnly && (
            <>
              {/* Q3: AI interaction frequency */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  During the writing task, how many times did you interact with the AI assistant provided in the interface? <span className="text-red-500">*</span>
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
                        <p className="text-sm text-gray-700">The AI available in the interface is {item.text}</p>
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
                            {r.value === 'a' && (
                              <Textarea
                                placeholder="Describe the specific technical issues you encountered with the AI assistant..."
                                value={noUseTechIssue}
                                onChange={(e) => setNoUseTechIssue(e.target.value)}
                                className="min-h-[60px]"
                              />
                            )}
                            {r.value === 'h' && (
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

              {/* Optional: AI suggestions */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Your experience with the AI assistant provided in the interface and any suggestions for improvement (optional)
                </Label>
                <Textarea
                  placeholder="Share your experience with the AI assistant and suggest improvements..."
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