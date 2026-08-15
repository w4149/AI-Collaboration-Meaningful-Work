"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function WelcomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleNext = () => {
    const params = searchParams.toString()
    router.push(params ? `/consent?${params}` : '/consent')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Café Task Study</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Thank you for participating in our study.
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
