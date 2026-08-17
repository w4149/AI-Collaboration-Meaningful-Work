"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import { getSkipRouteWithParams, FLOW_CONFIG } from '@/lib/flow-config'

const GENDER_OPTIONS = [
  { value: 'man', label: 'Man' },
  { value: 'woman', label: 'Woman' },
  { value: 'nonbinary', label: 'Nonbinary / Something else' },
  { value: 'transgender', label: 'Transgender' },
]

const RACE_ETHNICITY_OPTIONS = [
  { value: 'american_indian', label: 'American Indian or Alaska Native' },
  { value: 'asian', label: 'Asian' },
  { value: 'black', label: 'Black or African American' },
  { value: 'hispanic', label: 'Hispanic or Latino' },
  { value: 'mena', label: 'Middle Eastern or North African' },
  { value: 'native_hawaiian', label: 'Native Hawaiian or Pacific Islander' },
  { value: 'white', label: 'White' },
  { value: 'other', label: 'Other' },
]

const EDUCATION_OPTIONS = [
  { value: 'less_than_high_school', label: 'Less than high school' },
  { value: 'high_school', label: 'High school diploma or equivalent (e.g., GED)' },
  { value: 'some_college', label: 'Some college but no degree / Associate degree' },
  { value: 'bachelors', label: "Bachelor's degree" },
  { value: 'masters', label: "Master's degree" },
  { value: 'doctoral', label: 'Doctoral or professional degree (e.g., PhD, JD, MD)' },
]

const EMPLOYMENT_OPTIONS = [
  { value: 'full_time', label: 'Employed full-time' },
  { value: 'part_time', label: 'Employed part-time' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'unemployed_looking', label: 'Unemployed and looking for work' },
  { value: 'unemployed_not_looking', label: 'Unemployed and not looking for work' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
  { value: 'homemaker', label: 'Homemaker / Caregiver' },
]

const INCOME_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}))

const US_BORN_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'dont_know', label: "Don't know" },
]

const POLITICAL_OPTIONS = [
  { value: 'republican', label: 'Republican' },
  { value: 'democrat', label: 'Democrat' },
  { value: 'independent', label: 'Independent' },
  { value: 'other', label: 'Other' },
  { value: 'no_preference', label: 'No Preference' },
  { value: 'dont_know', label: "Don't know" },
]

type DemographicsAnswers = {
  gender?: string
  raceEthnicity: string[]
  education?: string
  employment?: string
  income?: string
  usBorn?: string
  political?: string
}

export default function DemographicsSurveyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = useAppStore((s) => s.userId)
  const prolificId = useAppStore((s) => s.prolificId)
  const setDemographicsSurveyCompleted = useAppStore((s) => s.setDemographicsSurveyCompleted)

  const [answers, setAnswers] = useState<DemographicsAnswers>({
    raceEthnicity: [],
  })
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  useEffect(() => {
    if (!FLOW_CONFIG.demographicsSurvey) {
      const skip = getSkipRouteWithParams('demographicsSurvey', searchParams)
      if (skip) router.replace(skip)
      else router.replace('/thank-you')
    }
  }, [router, searchParams])

  const allRequiredAnswered = (): boolean => {
    if (!answers.gender) return false
    if (answers.raceEthnicity.length === 0) return false
    if (!answers.education) return false
    if (!answers.employment) return false
    if (!answers.income) return false
    if (!answers.usBorn) return false
    if (!answers.political) return false
    return true
  }

  const handleSubmit = async () => {
    if (!allRequiredAnswered()) {
      setError('Please answer all required questions before submitting.')
      return
    }

    setIsSubmitting(true)
    setError('')

    const params = searchParams.toString()
    const qs = params ? `?${params}` : ''

    try {
      const response = await fetch('/api/demographics-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          prolificId,
          ...answers,
          income: answers.income ? Number(answers.income) : null,
        }),
      })

      if (response.ok) {
        setDemographicsSurveyCompleted(true)
        router.replace(`/thank-you${qs}`)
      } else {
        setError('Failed to save your responses. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const setGender = (v: string) => setAnswers((p) => ({ ...p, gender: v }))
  const setEducation = (v: string) => setAnswers((p) => ({ ...p, education: v }))
  const setEmployment = (v: string) => setAnswers((p) => ({ ...p, employment: v }))
  const setIncome = (v: string) => setAnswers((p) => ({ ...p, income: v }))
  const setUsBorn = (v: string) => setAnswers((p) => ({ ...p, usBorn: v }))
  const setPolitical = (v: string) => setAnswers((p) => ({ ...p, political: v }))

  const toggleRaceEthnicity = (value: string, checked: boolean) => {
    setAnswers((p) => ({
      ...p,
      raceEthnicity: checked
        ? [...p.raceEthnicity, value]
        : p.raceEthnicity.filter((v) => v !== value),
    }))
  }

  const renderRadioGroup = (
    name: string,
    value: string | undefined,
    options: { value: string; label: string }[],
    onChange: (v: string) => void,
    columns: string = '2'
  ) => (
    <RadioGroup value={value || ''} onValueChange={onChange}>
      <div className={`grid gap-2 ${columns === '2' ? 'grid-cols-1 sm:grid-cols-2' : columns === '3' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'}`}>
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
            Demographics Survey
          </CardTitle>
          <p className="text-center text-gray-500 text-sm mt-1">
            Please answer the following questions about yourself.
          </p>
        </CardHeader>

        <CardContent className="space-y-8 pb-2">
          {/* Q1: Gender */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              1. What is your gender? <span className="text-red-500">*</span>
            </Label>
            {renderRadioGroup('gender', answers.gender, GENDER_OPTIONS, setGender, '2')}
          </div>

          {/* Q2: Race and/or ethnicity */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              2. What is your race and/or ethnicity? (Select all that apply.) <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {RACE_ETHNICITY_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex items-start gap-2">
                  <Checkbox
                    id={`race-${opt.value}`}
                    checked={answers.raceEthnicity.includes(opt.value)}
                    onCheckedChange={(checked) =>
                      toggleRaceEthnicity(opt.value, checked === true)
                    }
                    className="mt-0.5"
                  />
                  <Label htmlFor={`race-${opt.value}`} className="cursor-pointer text-sm leading-tight">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Q3: Education */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              3. What is the highest level of education you have completed? <span className="text-red-500">*</span>
            </Label>
            {renderRadioGroup('education', answers.education, EDUCATION_OPTIONS, setEducation, '2')}
          </div>

          {/* Q4: Employment */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              4. Which of the following best describes your current employment status? <span className="text-red-500">*</span>
            </Label>
            {renderRadioGroup('employment', answers.employment, EMPLOYMENT_OPTIONS, setEmployment, '2')}
          </div>

          {/* Q5: Income */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              5. This is an income scale from 1 to 10, where 1 indicates the lowest income group and 10 the highest income group in the United States. In which group would you place your household? <span className="text-red-500">*</span>
            </Label>
            <RadioGroup value={answers.income || ''} onValueChange={setIncome}>
              <div className="flex gap-1 flex-wrap">
                {INCOME_OPTIONS.map((opt) => (
                  <div key={opt.value} className="flex items-center gap-1">
                    <RadioGroupItem
                      value={opt.value}
                      id={`income-${opt.value}`}
                      className="sr-only peer"
                    />
                    <Label
                      htmlFor={`income-${opt.value}`}
                      className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-md border border-gray-300 text-sm peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                    >
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
            <p className="text-xs text-gray-400 text-center">
              1 — Lowest income group &nbsp;·&nbsp; 10 — Highest income group
            </p>
          </div>

          {/* Q6: US Born */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              6. Were you born in the United States? <span className="text-red-500">*</span>
            </Label>
            {renderRadioGroup('usBorn', answers.usBorn, US_BORN_OPTIONS, setUsBorn, '3')}
          </div>

          {/* Q7: Political */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              7. Generally speaking, do you usually think of yourself as a Republican, a Democrat, an Independent, or what? <span className="text-red-500">*</span>
            </Label>
            {renderRadioGroup('political', answers.political, POLITICAL_OPTIONS, setPolitical, '2')}
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
        </CardContent>

        <div className="px-6 pb-6">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit & Finish'}
          </Button>
        </div>
      </Card>

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