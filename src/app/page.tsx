"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getSkipRouteWithParams, FLOW_CONFIG, getFirstEnabledStep, STEP_ROUTES } from '@/lib/flow-config'

export default function WelcomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Auto-skip when welcome is disabled
  useEffect(() => {
    if (!FLOW_CONFIG.welcome) {
      const skip = getSkipRouteWithParams('welcome', searchParams)
      if (skip) {
        router.replace(skip)
      } else {
        // welcome disabled, but it's the only step somehow
        const first = STEP_ROUTES[getFirstEnabledStep()]
        const qs = searchParams.toString()
        router.replace(qs ? `${first}?${qs}` : first)
      }
    }
  }, [router, searchParams])

  const handleNext = () => {
    // When welcome is enabled, still compute next step correctly
    const skip = getSkipRouteWithParams('welcome', searchParams)
    if (skip) {
      router.push(skip)
    } else {
      const params = searchParams.toString()
      router.push(params ? `/screen?${params}` : '/screen')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Everyday Work Task Study</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Thank you for considering participating in our study.
          </p>
        </div>

        <Button
          onClick={handleNext}
          size="lg"
          className="w-full sm:w-auto px-8"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
