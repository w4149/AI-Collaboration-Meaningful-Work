"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAppStore } from '@/lib/store'

export default function SurveyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    education: '',
    taskFamiliarity: '',
    additionalComments: '',
  })

  const userId = useAppStore((state) => state.userId)

  // Redirect if no user
  if (!userId) {
    router.push('/entry')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.taskFamiliarity) {
      alert('Please rate your familiarity with the task.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender || null,
          education: formData.education || null,
          taskFamiliarity: parseInt(formData.taskFamiliarity),
          additionalComments: formData.additionalComments || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit survey')

      // Clear local storage and redirect
      localStorage.removeItem('ai-collaboration-storage')
      router.push('/thank-you')
    } catch (error) {
      console.error('Error submitting survey:', error)
      alert('Failed to submit survey. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Survey</CardTitle>
          <CardDescription>
            Please answer the following questions to help us with our research. All responses are anonymous.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age">Age (optional)</Label>
              <Input
                id="age"
                type="number"
                min="18"
                max="120"
                placeholder="Enter your age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label>Gender (optional)</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="prefer-not-to-say" id="prefer-not-to-say" />
                  <Label htmlFor="prefer-not-to-say">Prefer not to say</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Education */}
            <div className="space-y-2">
              <Label>Education Level (optional)</Label>
              <RadioGroup
                value={formData.education}
                onValueChange={(value) => setFormData({ ...formData, education: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high-school" id="high-school" />
                  <Label htmlFor="high-school">High School</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="some-college" id="some-college" />
                  <Label htmlFor="some-college">Some College</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bachelor" id="bachelor" />
                  <Label htmlFor="bachelor">Bachelor's Degree</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="master" id="master" />
                  <Label htmlFor="master">Master's Degree</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phd" id="phd" />
                  <Label htmlFor="phd">PhD or Doctorate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="prefer-not-to-say-edu" id="prefer-not-to-say-edu" />
                  <Label htmlFor="prefer-not-to-say-edu">Prefer not to say</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Task Familiarity */}
            <div className="space-y-2">
              <Label>How familiar were you with the task topic before participating? (Required)</Label>
              <RadioGroup
                value={formData.taskFamiliarity}
                onValueChange={(value) => setFormData({ ...formData, taskFamiliarity: value })}
                className="grid grid-cols-5 gap-2"
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="flex flex-col items-center space-y-1">
                    <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                    <Label htmlFor={`rating-${rating}`} className="text-xs">{rating}</Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Not familiar at all</span>
                <span>Very familiar</span>
              </div>
            </div>

            {/* Additional Comments */}
            <div className="space-y-2">
              <Label htmlFor="comments">Additional Comments (optional)</Label>
              <Textarea
                id="comments"
                placeholder="Is there anything else you'd like to share about your experience?"
                value={formData.additionalComments}
                onChange={(e) => setFormData({ ...formData, additionalComments: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting ? 'Submitting...' : 'Submit Survey'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
