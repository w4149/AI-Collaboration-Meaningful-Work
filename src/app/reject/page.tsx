"use client"

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function RejectPage() {
  useEffect(() => {
    // Disable browser back button
    const preventBack = (e: PopStateEvent) => {
      e.preventDefault()
      window.history.pushState(null, '', window.location.href)
    }
    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', preventBack)
    return () => {
      window.removeEventListener('popstate', preventBack)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Thank you for your interest
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Based on your responses, you are not currently eligible for this
            study.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We appreciate your time and interest in participating in our
            research. Your contribution is valuable to the scientific
            community.
          </p>
          <p className="text-gray-500 text-sm pt-4">
            You may close this window now.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
