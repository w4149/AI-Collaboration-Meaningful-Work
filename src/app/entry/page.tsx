"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { getSkipRouteWithParams, FLOW_CONFIG } from '@/lib/flow-config'
import { getParam, encodedQuery } from '@/lib/url-cipher'

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

  // Get params from URL (decoded from cipher)
  const urlTask = getParam(searchParams, 'task')
  const urlGroup = getParam(searchParams, 'group')
  const prolificId = searchParams.get('PROLIFIC_PID') || 'test_user_' + Date.now()

  // If task and group are in URL, skip select-task and start directly
  const hasUrlAssignment = !!(urlTask && urlGroup)

  // Skip entry when disabled: auto-start task with URL params or defaults
  useEffect(() => {
    if (!FLOW_CONFIG.entry) {
      const taskId = urlTask || 'task1'
      const group = (urlGroup || 'G1-Human') as 'G1-Human' | 'G2-AI' | 'G3-HumanAndAI'

      // Setup minimal state to enter task page
      reset()
      setTaskSubmitted(false)
      setUser(`skip_${Date.now()}`, `session_${Date.now()}`, prolificId)
      setGroupType(group)
      setStartTime(new Date())

      // Try to load task via API if possible, otherwise use mock
      fetch('/api/auth/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prolificId, taskId, groupType: group }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data && data.taskId) {
            setUser(data.userId, data.sessionId || `session_${Date.now()}`, prolificId)
            setTask(
              data.taskId,
              data.taskTypeId || '',
              data.taskType || '',
              data.taskContent || '',
              data.allowCopy ?? false,
              data.allowPaste ?? false,
              data.allowChat ?? false
            )
          }
        })
        .catch(() => {})
        .finally(() => {
          const eq = encodedQuery(searchParams)
          router.replace(eq ? `/task${eq}` : '/task')
        })
    }
  }, [router, searchParams, urlTask, urlGroup, prolificId, reset, setTaskSubmitted, setUser, setGroupType, setStartTime, setTask])

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
          <CardTitle className="text-2xl font-bold text-center">Everyday Work Task Study</CardTitle>
          <CardDescription className="text-center">Please read the following instructions carefully</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* General instructions 
          <div className="space-y-4">
            <div className="space-y-2 text-gray-700">
              <p className="text-black-700 text-md leading-relaxed">
              You will enter the task interface, where you can view <strong>task information in the left panel</strong>. <br />
              You need to complete the task within the <strong>specified time</strong> (It will be displayed at the top of the task interface) and write a response in the submission box below. <br />
              When you are finished, click <strong>Submit Task</strong> and complete a supplemental survey. <br />
              Your response will be graded by professional evaluators based on real-world work scenarios. We would like you to <strong>take your response seriously</strong> and treat it as if it is part of your real job.
              </p>  
            </div>
          </div>
          */}

          {/* Group-specific instructions */}
          <div className="space-y-4">

            {/* G1-Human */}
            {(!hasUrlAssignment || urlGroup === 'G1-Human') && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-blue-700 text-sm">
                    You will enter the task interface, where you can view <strong>task information in the left panel</strong>.
                    <br /> <br />
                    You will have <strong>10 minutes</strong> to complete the task and enter your response in the submission box. Please complete the task independently, <strong>without using AI tools, search engines, or other outside assistance</strong>.
                    <br /> <br />
                    When you are finished, click <strong>Submit Task</strong> and complete a supplemental survey.
                    <br /> <br />
                    Your response will be graded by professional evaluators based on real-world work scenarios. 
                    Please <strong>take the task seriously</strong> and approach it as you would a real work assignment.
                  </p>
                </div>
              </div>
            )}

            {/* G2-AI */}
            {(!hasUrlAssignment || urlGroup === 'G2-AI') && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-blue-700 text-sm">
                    You will enter the task interface, where you can view <strong>task information in the left panel</strong>.
                    <br /> <br />
                    You will use the <strong>AI assistant available in the interface</strong> to complete the task. You will have <strong>up to 10 minutes</strong> to complete the task and paste the AI-generated response into the submission box.
                    <br /> <br />
                    When you are finished, click <strong>Submit Task</strong> and complete a supplemental survey.
                    <br /> <br />
                    Your response will be graded by professional evaluators based on real-world work scenarios. 
                    Please <strong>take the task seriously</strong> and approach it as you would a real work assignment.
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-green-700 text-sm">
                    <strong>Using the AI Assistant</strong> <br />
                    The AI assistant will appear in the <strong>right panel</strong>. Type your message in the chat box and click <strong>Send</strong>.<br />
                    You may send multiple messages and follow up on previous responses.
                  </p>
                </div>
              </div>
            )}

            {/* G3-HumanAndAI */}
            {(!hasUrlAssignment || urlGroup === 'G3-HumanAndAI') && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-blue-700 text-sm">
                    You will enter the task interface, where you can view <strong>task information in the left panel</strong>.
                    <br /> <br />
                    You will complete the task in <strong>two phases:</strong>
                    <br /> <br />
                    <strong>Phase 1 — Draft:</strong> <br />
                    You will have <strong>up to 10 minutes</strong> to write an initial draft independently, <strong>without using AI tools, search engines, or other outside assistance.</strong>
                    <br /> <br />
                    <strong>Phase 2 — Revise with AI:</strong> <br />
                    You will have <strong>up to 10 minutes</strong> to use the <strong>AI assistant available in the interface</strong> to help review and revise the draft you just wrote. Then enter the revised draft in the submission box.
                    <br /> <br />
                    When you are finished, click <strong>Submit Task</strong> and complete a supplemental survey.
                    <br /> <br />
                    Your response will be graded by professional evaluators based on real-world work scenarios.
                    Please <strong>take the task seriously</strong> and approach it as you would a real work assignment.
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-green-700 text-sm">
                    <strong>Using the AI Assistant</strong> <br />
                    The AI assistant will appear in the <strong>right panel</strong>. Type your message in the chat box and click <strong>Send</strong>.<br />
                    You may send multiple messages and follow up on previous responses.
                  </p>
                </div>
              </div>
            )}
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
