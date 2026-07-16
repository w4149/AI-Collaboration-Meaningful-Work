"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'

export default function EntryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const setUser = useAppStore((state) => state.setUser)
  const setTask = useAppStore((state) => state.setTask)
  const setStartTime = useAppStore((state) => state.setStartTime)

  // Get PROLIFIC_PID from URL params
  const prolificId = searchParams.get('PROLIFIC_PID') || 'test_user_' + Date.now()

  const handleStart = async () => {
    if (!agreed) return
    
    setIsLoading(true)
    
    try {
      // Create user, session, and assign task via API
      const response = await fetch('/api/auth/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prolificId }),
      })
      
      if (!response.ok) throw new Error('Failed to start session')
      
      const data = await response.json()
      
      // Update store
      setUser(data.userId, data.sessionId, prolificId)
      setTask(
        data.taskId, 
        data.taskType, 
        data.taskContent, 
        data.allowCopy, 
        data.allowPaste
      )
      setStartTime(new Date())
      
      // Navigate to task page
      router.push('/task')
    } catch (error) {
      console.error('Error starting session:', error)
      alert('Failed to start. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">AI Collaboration Study</CardTitle>
          <CardDescription className="text-center">Please read the following instructions carefully</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Study Information</h3>
            <p className="text-blue-700 text-sm leading-relaxed">
              Welcome! In this study, you will be asked to work on a writing task with the assistance of an AI chatbot. 
              The task will take approximately 15-20 minutes to complete. Your participation is voluntary and you may 
              withdraw at any time. All data collected will be anonymized and used for research purposes only.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Task Instructions</h3>
            <div className="space-y-2 text-gray-700">
              <p>1. You will be presented with a text in the left panel.</p>
              <p>2. Your task is to read the text and write a response in the submission box below.</p>
              <p>3. You may use the AI chatbot on the right to ask questions or get assistance.</p>
              <p>4. When you are finished, click &quot;Submit Task&quot; and complete a short survey.</p>
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">Example</h3>
            <p className="text-amber-700 text-sm">
              For example, if the text is about climate change, you might be asked to summarize it, 
              write an opinion piece, or answer specific questions about the content.
            </p>
          </div>
          
          <div className="flex items-start space-x-3 pt-4">
            <Checkbox 
              id="agree" 
              checked={agreed} 
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="agree" className="text-base">
                I have read and understood the instructions, and I agree to participate in this study.
              </Label>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button 
            onClick={handleStart} 
            disabled={!agreed || isLoading}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Starting...' : 'Start Task'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
