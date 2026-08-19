"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCallback } from 'react'

const PROLIFIC_COMPLETION_CODE = 'C6S9QW4R'
const PROLIFIC_COMPLETION_URL = `https://app.prolific.com/submissions/complete?cc=${PROLIFIC_COMPLETION_CODE}`

export default function ThankYouPage() {
  const handleRedirect = useCallback(() => {
    window.location.href = PROLIFIC_COMPLETION_URL
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-green-600">Thank You!</CardTitle>
          <CardDescription className="text-lg mt-2">
            Your participation in our study is greatly appreciated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600">
            You have successfully completed the study.
          </p>

          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-5 space-y-3">
            <p className="text-amber-800 font-semibold">
              ⚠️ Please save your completion code
            </p>
            <p className="text-sm text-amber-700">
              Copy or screenshot the code below. You will need it to receive your payment on Prolific.
            </p>
            <div className="bg-white border border-amber-300 rounded-md px-6 py-3 inline-block">
              <code className="text-2xl font-mono font-bold tracking-widest text-amber-900 select-all">
                {PROLIFIC_COMPLETION_CODE}
              </code>
            </div>
          </div>

          <Button
            onClick={handleRedirect}
            size="lg"
            className="w-full"
          >
            Go to Prolific to Submit
          </Button>

          <p className="text-xs text-gray-400">
            Clicking the button will redirect you to Prolific to complete your submission and receive payment.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
