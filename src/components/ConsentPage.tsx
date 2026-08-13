"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface ConsentSection {
  type?: 'info' | 'warning' | 'plain'
  title?: string
  content: string
}

interface ConsentPageProps {
  title: string
  description?: string
  sections: ConsentSection[]
  checkboxText: string
  buttonText?: string
  onAgree: () => void
  isLoading?: boolean
}

export default function ConsentPage({
  title,
  description,
  sections,
  checkboxText,
  buttonText = 'Continue',
  onAgree,
  isLoading = false,
}: ConsentPageProps) {
  const [agreed, setAgreed] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
          {description && (
            <CardDescription className="text-center">{description}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {sections.map((section, idx) => {
            const bgClass =
              section.type === 'info' ? 'bg-blue-50 border-blue-200' :
              section.type === 'warning' ? 'bg-amber-50 border-amber-200' :
              'bg-gray-50 border-gray-200'
            const titleClass =
              section.type === 'info' ? 'text-blue-800' :
              section.type === 'warning' ? 'text-amber-800' :
              'text-gray-800'
            const contentClass =
              section.type === 'info' ? 'text-blue-700' :
              section.type === 'warning' ? 'text-amber-700' :
              'text-gray-700'

            return (
              <div key={idx} className={`p-4 rounded-lg border ${bgClass}`}>
                {section.title && (
                  <h3 className={`font-semibold mb-2 ${titleClass}`}>{section.title}</h3>
                )}
                <p className={`text-sm leading-relaxed whitespace-pre-line ${contentClass}`}>
                  {section.content}
                </p>
              </div>
            )
          })}

          <div className="flex items-start space-x-3 pt-4">
            <Checkbox
              id="consent-agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="consent-agree" className="text-sm leading-relaxed">
                {checkboxText}
              </Label>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button
            onClick={onAgree}
            disabled={!agreed || isLoading}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Loading...' : buttonText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
