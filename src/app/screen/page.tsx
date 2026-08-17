"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { encodedQuery } from '@/lib/url-cipher'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getSkipRouteWithParams, FLOW_CONFIG } from '@/lib/flow-config'

const QUESTIONS = [
  {
    id: 'age',
    text: 'Are you between 18 and 64 years of age?',
  },
  {
    id: 'residence',
    text: 'Do you currently reside in the United States?',
  },
  {
    id: 'english_fluent',
    text: 'Are you fluent in reading and writing English?',
  },
  {
    id: 'ai_experience',
    text: 'Do you have experience using generative AI chatbots (for example, ChatGPT, Gemini, Claude, or similar tools)?',
  },
] as const

type AnswerMap = Record<string, 'yes' | 'no' | undefined>

export default function ScreenPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [showConfirm, setShowConfirm] = useState(false)

  // Skip screening when disabled, or redirect if already completed
  useEffect(() => {
    if (!FLOW_CONFIG.screen) {
      const skip = getSkipRouteWithParams('screen', searchParams)
      if (skip) router.replace(skip)
      return
    }

    const completed = sessionStorage.getItem('screeningCompleted')
    if (completed === 'true') {
      const passed = sessionStorage.getItem('screeningPassed') === 'true'
      const eq = encodedQuery(searchParams)
      const qs = eq ? eq : ''
      router.replace(passed ? `/consent${qs}` : `/reject${qs}`)
    }
  }, [router, searchParams])

  const allAnswered = QUESTIONS.every((q) => answers[q.id])
  const allYes = QUESTIONS.every((q) => answers[q.id] === 'yes')

  const handleNext = () => {
    if (!allAnswered) return
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    setShowConfirm(false)
    const eq = encodedQuery(searchParams)
    const qs = eq ? eq : ''

    // Lock the screening result so back button cannot bypass
    sessionStorage.setItem('screeningCompleted', 'true')
    sessionStorage.setItem('screeningPassed', allYes ? 'true' : 'false')

    if (allYes) {
      router.replace(`/consent${qs}`)
    } else {
      router.replace(`/reject${qs}`)
    }
  }

  const handleAnswer = (id: string, value: 'yes' | 'no') => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Before You Begin
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {QUESTIONS.map((q) => (
            <div key={q.id} className="space-y-2">
              <Label className="text-base font-medium leading-relaxed">
                {q.text}
              </Label>
              <RadioGroup
                value={answers[q.id] ?? ''}
                onValueChange={(v) => handleAnswer(q.id, v as 'yes' | 'no')}
              >
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id={`${q.id}-yes`} />
                    <Label htmlFor={`${q.id}-yes`} className="cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id={`${q.id}-no`} />
                    <Label htmlFor={`${q.id}-no`} className="cursor-pointer">
                      No
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          ))}
        </CardContent>

        <div className="px-6 pb-6">
          <Button
            onClick={handleNext}
            disabled={!allAnswered}
            size="lg"
            className="w-full"
          >
            Next
          </Button>
          {!allAnswered && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Please answer all questions to continue.
            </p>
          )}
        </div>
      </Card>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your answers</DialogTitle>
            <DialogDescription>
              After confirming, you will not be able to change your answers.
              Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Go Back
            </Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
