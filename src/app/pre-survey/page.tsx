"use client"

import { useMemo, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import { getSkipRouteWithParams, FLOW_CONFIG } from '@/lib/flow-config'

type QuestionErrors = {
  birthYear?: string
  gender?: string
  ethnicBackground?: string
  ethnicBackgroundOther?: string
  education?: string
  employment?: string
  employmentOther?: string
}

const GENDER_OPTIONS = [
  { value: 'man', label: 'Man' },
  { value: 'woman', label: 'Woman' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
] as const

const ETHNIC_OPTIONS = [
  { value: 'american-indian-alaska-native', label: 'American Indian or Alaska Native' },
  { value: 'asian', label: 'Asian' },
  { value: 'black-african-american', label: 'Black or African American' },
  { value: 'hispanic-latino', label: 'Hispanic or Latino/a' },
  { value: 'middle-eastern-north-african', label: 'Middle Eastern or North African' },
  { value: 'native-hawaiian-pacific-islander', label: 'Native Hawaiian or Other Pacific Islander' },
  { value: 'white', label: 'White' },
  { value: 'other', label: 'Other:' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
] as const

const EDUCATION_OPTIONS = [
  { value: 'less-than-high-school', label: 'Less than high school' },
  { value: 'high-school-diploma', label: 'High school diploma or equivalent' },
  { value: 'some-college-associate', label: 'Some college / Associate degree' },
  { value: 'bachelor-degree', label: "Bachelor's degree" },
  { value: 'master-degree', label: "Master's degree" },
  { value: 'doctoral-professional', label: 'Doctoral or professional degree (e.g., PhD, JD, MD)' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
] as const

const EMPLOYMENT_OPTIONS = [
  { value: 'full-time', label: 'Employed full-time' },
  { value: 'part-time', label: 'Employed part-time' },
  { value: 'self-employed', label: 'Self-employed' },
  { value: 'unemployed-looking', label: 'Unemployed and looking for work' },
  { value: 'unemployed-not-looking', label: 'Unemployed and not looking for work' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
  { value: 'homemaker-caregiver', label: 'Homemaker / Caregiver' },
  { value: 'other', label: 'Other:' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
] as const

export default function PreSurveyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = useAppStore((state) => state.userId)
  const setUser = useAppStore((state) => state.setUser)
  const setStartTime = useAppStore((state) => state.setStartTime)
  const setPreSurveyCompleted = useAppStore((state) => state.setPreSurveyCompleted)

  // Skip pre-survey when disabled
  useEffect(() => {
    if (!FLOW_CONFIG.preSurvey) {
      sessionStorage.setItem('preSurveyCompleted', 'true')
      // Also mock a user so downstream works
      const mockProlificId = searchParams.get('PROLIFIC_PID') || 'skip_user'
      if (!userId) {
        setUser(`skip_${Date.now()}`, `session_${Date.now()}`, mockProlificId)
      }
      setPreSurveyCompleted(true)
      setStartTime(new Date())
      const skip = getSkipRouteWithParams('preSurvey', searchParams)
      if (skip) router.replace(skip)
    }
  }, [router, searchParams, userId, setUser, setPreSurveyCompleted, setStartTime])

  const [birthYear, setBirthYear] = useState<string>('')
  const [gender, setGender] = useState<string>('')
  const [ethnicBackgrounds, setEthnicBackgrounds] = useState<string[]>([])
  const [ethnicOtherText, setEthnicOtherText] = useState<string>('')
  const [education, setEducation] = useState<string>('')
  const [employment, setEmployment] = useState<string>('')
  const [employmentOtherText, setEmploymentOtherText] = useState<string>('')
  const [errors, setErrors] = useState<QuestionErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const birthYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years: number[] = []
    // 18-64 years old -> 64+ = oldest allowed born, 18 = youngest allowed born
    for (let y = currentYear - 18; y >= currentYear - 64; y--) {
      years.push(y)
    }
    return years
  }, [])

  const toggleEthnic = (value: string) => {
    setEthnicBackgrounds((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const validate = (): boolean => {
    const newErrors: QuestionErrors = {}

    if (!birthYear) {
      newErrors.birthYear = 'Please select your year of birth.'
    }

    if (!gender) {
      newErrors.gender = 'Please select your gender.'
    }

    if (ethnicBackgrounds.length === 0) {
      newErrors.ethnicBackground = 'Please select at least one option.'
    }
    if (ethnicBackgrounds.includes('other') && !ethnicOtherText.trim()) {
      newErrors.ethnicBackgroundOther = 'Please specify your ethnic background.'
    }

    if (!education) {
      newErrors.education = 'Please select your highest level of education.'
    }

    if (!employment) {
      newErrors.employment = 'Please select your current employment status.'
    }
    if (employment === 'other' && !employmentOtherText.trim()) {
      newErrors.employmentOther = 'Please specify your employment status.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setIsLoading(true)
    try {
      const prolificId = searchParams.get('PROLIFIC_PID') || `test_user_${Date.now()}`

      const response = await fetch('/api/pre-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || '',
          prolificId,
          birthYear: birthYear ? parseInt(birthYear, 10) : null,
          gender,
          ethnicBackgrounds,
          ethnicOtherText: ethnicBackgrounds.includes('other') ? ethnicOtherText.trim() : null,
          education,
          employment,
          employmentOtherText: employment === 'other' ? employmentOtherText.trim() : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save pre-survey responses.')
      }

      const data = await response.json()
      // Use the real DB userId returned from the API
      if (data.userId) {
        const sessionId = `session_${Date.now()}`
        setUser(data.userId, sessionId, prolificId)
      }
      setPreSurveyCompleted(true)
      setStartTime(new Date())

      // Check if entry is disabled
      if (!FLOW_CONFIG.entry) {
        const skip = getSkipRouteWithParams('entry', searchParams)
        if (skip) {
          router.push(skip)
          return
        }
      }

      const params = searchParams.toString()
      router.push(params ? `/entry?${params}` : '/entry')
    } catch (error) {
      console.error('Pre-survey submit error:', error)
      alert('Failed to save your responses. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const showEthnicOther = ethnicBackgrounds.includes('other')
  const showEmploymentOther = employment === 'other'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Background Information</CardTitle>
          <CardDescription className="text-center">
            Thank you for considering participating in our study. First of all, please give us a little bit of background about yourself.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Q1: Year of birth */}
          <div className="p-4 rounded-lg border-l-4 border-blue-500 bg-gray-50 space-y-3">
            <p className="font-semibold text-gray-800">1. What is your year of birth?</p>
            <select
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="w-full sm:w-64 h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Please select a year</option>
              {birthYearOptions.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
            {errors.birthYear && (
              <p className="text-sm text-red-600">{errors.birthYear}</p>
            )}
          </div>

          {/* Q2: Gender */}
          <div className="p-4 rounded-lg border-l-4 border-blue-500 bg-gray-50 space-y-3">
            <p className="font-semibold text-gray-800">2. What is your gender?</p>
            <div className="space-y-2 ml-2">
              {GENDER_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={`gender-${opt.value}`}
                    name="gender"
                    checked={gender === opt.value}
                    onChange={() => setGender(opt.value)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <Label htmlFor={`gender-${opt.value}`} className="text-base cursor-pointer">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.gender && <p className="text-sm text-red-600">{errors.gender}</p>}
          </div>

          {/* Q3: Ethnic background */}
          <div className="p-4 rounded-lg border-l-4 border-blue-500 bg-gray-50 space-y-3">
            <p className="font-semibold text-gray-800">
              3. Which of the following best describes your ethnic background?{' '}
              <span className="text-gray-500 font-normal">(Select all that apply)</span>
            </p>
            <div className="space-y-2 ml-2">
              {ETHNIC_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={`ethnic-${opt.value}`}
                    checked={ethnicBackgrounds.includes(opt.value)}
                    onCheckedChange={() => toggleEthnic(opt.value)}
                  />
                  <Label htmlFor={`ethnic-${opt.value}`} className="text-base cursor-pointer">
                    {opt.label}
                  </Label>
                </div>
              ))}
              {showEthnicOther && (
                <div className="ml-6 mt-2">
                  <Input
                    id="ethnic-other-text"
                    value={ethnicOtherText}
                    onChange={(e) => setEthnicOtherText(e.target.value)}
                    placeholder="Please specify"
                    className="max-w-md"
                  />
                </div>
              )}
            </div>
            {errors.ethnicBackground && (
              <p className="text-sm text-red-600">{errors.ethnicBackground}</p>
            )}
            {errors.ethnicBackgroundOther && (
              <p className="text-sm text-red-600">{errors.ethnicBackgroundOther}</p>
            )}
          </div>

          {/* Q4: Education */}
          <div className="p-4 rounded-lg border-l-4 border-blue-500 bg-gray-50 space-y-3">
            <p className="font-semibold text-gray-800">
              4. What is the highest level of education you have completed?
            </p>
            <div className="space-y-2 ml-2">
              {EDUCATION_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={`edu-${opt.value}`}
                    name="education"
                    checked={education === opt.value}
                    onChange={() => setEducation(opt.value)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <Label htmlFor={`edu-${opt.value}`} className="text-base cursor-pointer">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.education && <p className="text-sm text-red-600">{errors.education}</p>}
          </div>

          {/* Q5: Employment */}
          <div className="p-4 rounded-lg border-l-4 border-blue-500 bg-gray-50 space-y-3">
            <p className="font-semibold text-gray-800">
              5. Which of the following best describes your current employment status?
            </p>
            <div className="space-y-2 ml-2">
              {EMPLOYMENT_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={`emp-${opt.value}`}
                    name="employment"
                    checked={employment === opt.value}
                    onChange={() => setEmployment(opt.value)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <Label htmlFor={`emp-${opt.value}`} className="text-base cursor-pointer">
                    {opt.label}
                  </Label>
                </div>
              ))}
              {showEmploymentOther && (
                <div className="ml-6 mt-2">
                  <Input
                    id="employment-other-text"
                    value={employmentOtherText}
                    onChange={(e) => setEmploymentOtherText(e.target.value)}
                    placeholder="Please specify"
                    className="max-w-md"
                  />
                </div>
              )}
            </div>
            {errors.employment && (
              <p className="text-sm text-red-600">{errors.employment}</p>
            )}
            {errors.employmentOther && (
              <p className="text-sm text-red-600">{errors.employmentOther}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
