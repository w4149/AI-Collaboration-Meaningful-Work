"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { getSkipRouteWithParams, FLOW_CONFIG } from '@/lib/flow-config'

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
          const params = searchParams.toString()
          router.replace(params ? `/task?${params}` : '/task')
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
          <CardTitle className="text-2xl font-bold text-center">Café Task Study</CardTitle>
          <CardDescription className="text-center">Please read the following instructions carefully</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2 text-gray-700">
              <p className="text-black-700 text-md leading-relaxed">
              You will then enter the task interface, where you can view <strong>task information in the left panel</strong>. <br />
              You need to complete the task within the <strong>specified time</strong> (It will be displayed at the top of the task interface) and write a response in the submission box below. <br />
              When you are finished, click <strong>Submit Task</strong> and complete a supplemental survey. <br />
              Your response will be graded by professional evaluators based on real-world work scenarios. We would like you to <strong>take your response seriously</strong> and treat it as if it is part of your real job.
              </p>  
            </div>
          </div>

          {/* Group-specific instructions */}
          <div className="space-y-4">

            {/* G1-Human */}
            {(!hasUrlAssignment || urlGroup === 'G1-Human') && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-blue-700 text-sm">
                    Please write and revise your response below, breaking it into paragraphs as appropriate for readability. <strong>Do not</strong> use any assistance (e.g., AI tools, search engines, etc.). Use <strong>YOUR OWN</strong> knowledge and skills to complete the task from start to finish.
                  </p>
                </div>
                <div className="bg-amber-50 p-3 rounded">
                  <p className="text-amber-700 text-sm">
                    [Note: copy and paste function is <strong>disabled</strong> for this text box. You will not be allowed to advance before <strong>10</strong> minutes, and the page will advance automatically at <strong>10</strong> minutes. Please dedicate your full effort to the writing task during this period.]
                  </p>
                </div>
              </div>
            )}

            {/* G2-AI */}
            {(!hasUrlAssignment || urlGroup === 'G2-AI') && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-blue-700 text-sm">
                    Please use the ChatGPT AI tool available <strong>in this interface</strong>, interacting freely with the AI until you arrive at an answer you are satisfied with. Then paste the final AI-generated content you decide to submit into the box below.
                  </p>
                </div>
                <div className="bg-amber-50 p-3 rounded">
                  <p className="text-amber-700 text-sm">
                    [Note: You will not be allowed to advance before <strong>5</strong> minutes, and the page will advance automatically at <strong>10</strong> minutes. Please dedicate your full effort to the writing task during this period.]
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-green-700 text-sm">
                    <strong>Using the AI Assistant</strong> <br />
                    During the task, you will be able to communicate with an AI assistant using the chat box provided in the right panel.<br />
                    Type a message in the chat box and click <strong>Send</strong> to send it to the AI assistant. You may send multiple messages and follow up on previous responses.<br />
                    You may use the AI assistant in any way you find helpful for completing the task.<br />
                    You are responsible for submitting your final response.
                  </p>
                </div>
              </div>
            )}

            {/* G3-HumanAndAI */}
            {(!hasUrlAssignment || urlGroup === 'G3-HumanAndAI') && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-blue-700 text-sm">
                    <strong>Phase 1 — Draft:</strong> Please write and revise your response below, breaking it into paragraphs as appropriate for readability. In this initial draft, <strong>do not</strong> use any assistance (e.g., AI tools, search engines, etc.). Use <strong>YOUR OWN</strong> knowledge and skills to complete the task from start to finish.
                  </p>
                </div>
                <div className="bg-amber-50 p-3 rounded">
                  <p className="text-amber-700 text-sm">
                    [Note: copy and paste function is <strong>disabled</strong> for this text box. You will not be allowed to advance before <strong>5</strong> minutes, and the page will advance automatically at <strong>10</strong> minutes. Please dedicate your full effort to the writing task during this period.]
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-green-700 text-sm">
                    <strong>Phase 2 — Revise with AI:</strong> Please use ChatGPT <strong>in this interface</strong>, interacting freely with the AI to review and revise the draft you just wrote, then enter the version improved by AI into the box below. You may make any further adjustments to the AI&apos;s edits that you see fit — this version will serve as your final submission.
                  </p>
                </div>
                <div className="bg-amber-50 p-3 rounded">
                  <p className="text-amber-700 text-sm">
                    [Note: Copy and paste is <strong>enabled</strong> for this text box. You will not be allowed to advance before <strong>5</strong> minutes, and the page will advance automatically at <strong>10</strong> minutes. Please dedicate your full effort to the writing task during this period.]
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-green-700 text-sm">
                    <strong>Using the AI Assistant</strong> <br />
                    During the Phase 2, you will be able to communicate with an AI assistant using the chat box provided in the right panel.<br />
                    Type a message in the chat box and click <strong>Send</strong> to send it to the AI assistant. You may send multiple messages and follow up on previous responses.<br />
                    You may use the AI assistant in any way you find helpful for completing the task.<br />
                    You are responsible for submitting your final response.
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
