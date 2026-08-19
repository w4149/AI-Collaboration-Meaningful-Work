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

const YES_NO_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

export default function ManipulationCheckPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const taskId = useAppStore((s) => s.taskId)
  const userId = useAppStore((s) => s.userId)
  const prolificId = useAppStore((s) => s.prolificId)
  const groupType = useAppStore((s) => s.groupType)
  const setManipulationCheckCompleted = useAppStore((s) => s.setManipulationCheckCompleted)

  // G1 / G2 answers
  const [aiUsed, setAiUsed] = useState<string | undefined>(undefined)
  const [otherAssistance, setOtherAssistance] = useState<string | undefined>(undefined)

  // G3 answers
  const [stage1AiUsed, setStage1AiUsed] = useState<string | undefined>(undefined)
  const [stage1OtherAssistance, setStage1OtherAssistance] = useState<string | undefined>(undefined)
  const [stage2AiUsed, setStage2AiUsed] = useState<string | undefined>(undefined)
  const [stage2OtherAssistance, setStage2OtherAssistance] = useState<string | undefined>(undefined)

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
    if (!FLOW_CONFIG.manipulationCheck) {
      const skip = getSkipRouteWithParams('manipulationCheck', searchParams)
      if (skip) router.replace(skip)
      else router.replace('/thank-you')
    }
  }, [router, searchParams])

  const allRequiredAnswered = (): boolean => {
    if (!groupType) return false
    if (groupType === 'G1-Human' || groupType === 'G2-AI') {
      return aiUsed !== undefined && otherAssistance !== undefined
    }
    if (groupType === 'G3-HumanAndAI') {
      return stage1AiUsed !== undefined && stage1OtherAssistance !== undefined &&
             stage2AiUsed !== undefined && stage2OtherAssistance !== undefined
    }
    return false
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
      const body: Record<string, unknown> = {
        userId,
        prolificId,
        groupType,
        taskId,
      }

      if (groupType === 'G1-Human' || groupType === 'G2-AI') {
        body.aiUsed = aiUsed
        body.otherAssistance = otherAssistance
      } else if (groupType === 'G3-HumanAndAI') {
        body.stage1AiUsed = stage1AiUsed
        body.stage1OtherAssistance = stage1OtherAssistance
        body.stage2AiUsed = stage2AiUsed
        body.stage2OtherAssistance = stage2OtherAssistance
      }

      const response = await fetch('/api/manipulation-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        setManipulationCheckCompleted(true)
        router.replace(`/thank-you${qs}`)
      } else {
        setError('Failed to save your responses. Please try again.')
        setIsSubmitting(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setIsSubmitting(false)
    }
  }

  const renderRadioGroup = (
    name: string,
    value: string | undefined,
    options: { value: string; label: string }[],
    onChange: (v: string) => void
  ) => (
    <RadioGroup value={value || ''} onValueChange={onChange}>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <div key={opt.value} className="flex items-start gap-2">
            <RadioGroupItem value={opt.value} id={`${name}-${opt.value}`} className="mt-1" />
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
            Supplemental Questions
          </CardTitle>
          <p className="text-center text-gray-500 text-md mt-1">
            Please answer the following questions. Your compensation will <span className="text-red-500">not</span> be affected by your answers. Your honest answers are very important to our study.
          </p>
        </CardHeader>

        <CardContent className="space-y-8 pb-2">
          {(groupType === 'G1-Human' || groupType === 'G2-AI') && (
            <>
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  1. While completing the task, did you use any AI tool outside the study interface (e.g., ChatGPT, Gemini, Claude, or another similar tool)? <span className="text-red-500">*</span>
                </Label>
                {renderRadioGroup('ai-used', aiUsed, YES_NO_OPTIONS, setAiUsed)}
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">
                  2. While completing the task, did you use any other outside assistance, such as a search engine or help from another person? <span className="text-red-500">*</span>
                </Label>
                {renderRadioGroup('other-assistance', otherAssistance, YES_NO_OPTIONS, setOtherAssistance)}
              </div>
            </>
          )}

          {groupType === 'G3-HumanAndAI' && (
            <>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-sm font-medium text-gray-700 mb-3">In the first stage (writing the draft):</p>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        1. While writing the draft, did you use any AI tool outside the study interface (e.g., ChatGPT, Gemini, Claude, or another similar tool)? <span className="text-red-500">*</span>
                      </Label>
                      {renderRadioGroup('stage1-ai', stage1AiUsed, YES_NO_OPTIONS, setStage1AiUsed)}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        2. While writing the draft, did you use any other outside assistance, such as a search engine or help from another person? <span className="text-red-500">*</span>
                      </Label>
                      {renderRadioGroup('stage1-other', stage1OtherAssistance, YES_NO_OPTIONS, setStage1OtherAssistance)}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-sm font-medium text-gray-700 mb-3">In the second stage (revising):</p>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        1. While revising, did you use any AI tool outside the study interface (e.g., ChatGPT, Gemini, Claude, or another similar tool)? <span className="text-red-500">*</span>
                      </Label>
                      {renderRadioGroup('stage2-ai', stage2AiUsed, YES_NO_OPTIONS, setStage2AiUsed)}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        2. While revising, did you use any other outside assistance, such as a search engine or help from another person? <span className="text-red-500">*</span>
                      </Label>
                      {renderRadioGroup('stage2-other', stage2OtherAssistance, YES_NO_OPTIONS, setStage2OtherAssistance)}
                    </div>
                  </div>
                </div>
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
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your answers? This will complete the study.
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
