"use client"

import { useState } from 'react'
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
  const setGroupType = useAppStore((state) => state.setGroupType)
  const setTaskSubmitted = useAppStore((state) => state.setTaskSubmitted)
  const reset = useAppStore((state) => state.reset)

  // Get params from URL
  const urlTask = searchParams.get('task')
  const urlGroup = searchParams.get('group')
  const prolificId = searchParams.get('PROLIFIC_PID') || 'test_user_' + Date.now()

  // If task and group are in URL, skip select-task and start directly
  const hasUrlAssignment = !!(urlTask && urlGroup)

  const handleStart = async () => {
    if (!agreed) return

    setIsLoading(true)

    try {
      if (hasUrlAssignment) {
        // Direct start: call /api/auth/start with URL params
        reset()
        setTaskSubmitted(false)

        const response = await fetch('/api/auth/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prolificId,
            taskId: urlTask,
            groupType: urlGroup,
          }),
        })

        if (!response.ok) throw new Error('Failed to start session')

        const data = await response.json()

        setUser(data.userId, data.sessionId, prolificId)
        setTask(
          data.taskId,
          data.taskTypeId,
          data.taskType,
          data.taskContent,
          data.allowCopy,
          data.allowPaste,
          data.allowChat
        )
        setGroupType(urlGroup as 'G1-Human' | 'G2-AI' | 'G3-HumanAndAI')
        setStartTime(new Date())

        router.push('/task')
      } else {
        // No URL assignment: go to select-task page
        setUser(`test_user_${Date.now()}`, `session_${Date.now()}`, prolificId)
        setStartTime(new Date())
        router.push('/select-task')
      }
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
          <CardTitle className="text-2xl font-bold text-center">Café Task Study</CardTitle>
          <CardDescription className="text-center">Please read the following instructions carefully</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-700 text-sm leading-relaxed">
              You will then enter the task interface, where you can view task information in the left panel.
              You need to complete the task within the specified time and write a response in the submission box below.
              When you are finished, click &quot;Submit Task&quot; and complete a supplemental survey.
            </p>
          </div>

          {/* Group-specific instructions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {hasUrlAssignment ? 'Your Instructions' : 'Instructions by Group'}
            </h3>

            {/* G1-Human */}
            {(!hasUrlAssignment || urlGroup === 'G1-Human') && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-purple-50 px-4 py-2 border-b">
                  <span className="font-semibold text-purple-800">G1 — Human Only</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-blue-700 text-sm">
                      Your response will be graded by professional evaluators based on real-world work scenarios. Please write and revise your response below, breaking it into paragraphs as appropriate for readability. Do not use any assistance (e.g., AI tools, search engines, etc.). Use YOUR OWN knowledge and skills to complete the task from start to finish.
                    </p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded">
                    <p className="text-amber-700 text-sm">
                      [Note: copy and paste function is disabled for this text box. You will not be allowed to advance before 10 minutes, and the page will advance automatically at 10 minutes. Please dedicate your full effort to the writing task during this period.]
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* G2-AI */}
            {(!hasUrlAssignment || urlGroup === 'G2-AI') && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-amber-50 px-4 py-2 border-b">
                  <span className="font-semibold text-amber-800">G2 — AI Assisted</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-blue-700 text-sm">
                      Your response will be graded by professional evaluators based on real-world work scenarios. Please use the ChatGPT AI tool available in this interface, interacting freely with the AI until you arrive at an answer you&apos;re satisfied with. Then paste the final AI-generated content you decide to submit into the box below.
                    </p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded">
                    <p className="text-amber-700 text-sm">
                      [Note: You will not be allowed to advance before 5 minutes, and the page will advance automatically at 10 minutes. Please dedicate your full effort to the writing task during this period.]
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* G3-HumanAndAI */}
            {(!hasUrlAssignment || urlGroup === 'G3-HumanAndAI') && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 border-b">
                  <span className="font-semibold text-blue-800">G3 — Human + AI (Two Phases)</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-blue-700 text-sm">
                      <strong>Phase 1 — Draft:</strong> Your response will be graded by professional evaluators based on real-world work scenarios. Please write and revise your response below, breaking it into paragraphs as appropriate for readability. In this initial draft, do not use any assistance (e.g., AI tools, search engines, etc.). Use YOUR OWN knowledge and skills to complete the task from start to finish.
                    </p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded">
                    <p className="text-amber-700 text-sm">
                      [Note: copy and paste function is disabled for this text box. You will not be allowed to advance before 5 minutes, and the page will advance automatically at 10 minutes. Please dedicate your full effort to the writing task during this period.]
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-green-700 text-sm">
                      <strong>Phase 2 — Revise with AI:</strong> Please use ChatGPT on this page, interacting freely with the AI to review and revise the draft you just wrote, then enter the version improved by AI into the box below. You may make any further adjustments to the AI&apos;s edits that you see fit — this version will serve as your final submission.
                    </p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded">
                    <p className="text-amber-700 text-sm">
                      [Note: Copy and paste is enabled for this text box. You will not be allowed to advance before 5 minutes, and the page will advance automatically at 10 minutes. Please dedicate your full effort to the writing task during this period.]
                    </p>
                  </div>
                </div>
              </div>
            )}
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
