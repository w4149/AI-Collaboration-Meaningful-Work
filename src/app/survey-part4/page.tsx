"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { LikertGroup } from '@/components/LikertScale'
import { useAppStore } from '@/lib/store'

const selfEfficacyAIQuestions = [
  { id: 'se_ai1', label: '如果借助人工智能，我有信心完成工作中的这类写作任务。' },
  { id: 'se_ai2', label: '我确信，使用人工智能的情况下，我能顺利完成本职工作中的这类写作任务。' },
  { id: 'se_ai3', label: '我相信，依靠人工智能辅助，我可以完成和本职工作相关的这类写作任务。' },
]

const selfEfficacyNoAIQuestions = [
  { id: 'se_no1', label: '即便不使用人工智能，我也有信心完成工作中的这类写作任务。' },
  { id: 'se_no2', label: '我确信，不借助人工智能，我能顺利完成本职工作中的这类写作任务。' },
  { id: 'se_no3', label: '我相信，无需人工智能辅助，我可以完成和本职工作相关的这类写作任务。' },
]

const intrinsicMotivationQuestions = [
  { id: 'im1', label: '当我有效完成这项任务时，我感到满足。' },
  { id: 'im2', label: '我对自己在这项任务中的表现感到有能力、有信心。' },
  { id: 'im3', label: '当我有效完成这项任务时，我觉得自己很有能力。' },
  { id: 'im4', label: '在这项任务中的良好表现促进了我的个人成长。' },
]

export default function SurveyPart4Page() {
  const router = useRouter()
  const userId = useAppStore((state) => state.userId)
  const setLikertResponses = useAppStore((state) => state.setLikertResponses)
  const likertResponses = useAppStore((state) => state.likertResponses)
  const surveyFormData = useAppStore((state) => state.surveyFormData)
  const setTaskSubmitted = useAppStore((state) => state.setTaskSubmitted)
  const [values, setValues] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!userId) {
    router.push('/entry')
    return null
  }

  const handleChange = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }))
  }

  const allQuestions = [
    ...selfEfficacyAIQuestions,
    ...selfEfficacyNoAIQuestions,
    ...intrinsicMotivationQuestions,
  ]

  const allAnswered = allQuestions.every((q) => values[q.id])

  const handleContinue = async () => {
    if (!allAnswered) {
      alert('请回答所有问题后再继续。')
      return
    }
    setIsSubmitting(true)

    // Merge Part 4 values with all previous Likert responses
    const allLikert = { ...likertResponses, ...values }
    setLikertResponses(values)

    // Build scale_results: all answers in order across all 4 parts
    const allQuestionOrder = [
      // Part 1
      'me1',
      'tc1', 'tc2', 'tc3', 'tc4',
      'te1', 'te2', 'te3', 'te4',
      // Part 2
      'au1', 'au2', 'au3', 'au4',
      'su1', 'su2', 'su3', 'su4',
      'si1', 'si2', 'si3',
      // Part 3
      'po1', 'po2', 'po3', 'po4', 'po5',
      'wm1', 'wm2', 'wm3', 'wm4', 'wm5', 'wm6',
      'ptr1', 'ptr2', 'ptr3', 'ptr4',
      // Part 4
      'se_ai1', 'se_ai2', 'se_ai3',
      'se_no1', 'se_no2', 'se_no3',
      'im1', 'im2', 'im3', 'im4',
    ]
    const scaleResults = allQuestionOrder.map(id => allLikert[id] || '').join(',')

    try {
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...surveyFormData,
          scaleResults,
        }),
      })
      if (!response.ok) throw new Error('Failed to submit')

      setTaskSubmitted(true)
      localStorage.removeItem('ai-collaboration-storage')
      router.push('/thank-you')
    } catch (error) {
      console.error('Error submitting survey:', error)
      alert('提交失败，请重试。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">个人能力评价</CardTitle>
          <CardDescription>
            请根据您刚刚完成任务的真实感受回答以下问题。所有题目均为必答。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <LikertGroup
            title="自我效能（Self-efficacy）— A. 使用 AI 时"
            description="请根据您刚刚完成这项任务后的真实感受进行评价。（1 = 非常不同意；7 = 非常同意）"
            questions={selfEfficacyAIQuestions}
            values={values}
            onChange={handleChange}
          />
          <hr className="border-gray-200" />
          <LikertGroup
            title="自我效能（Self-efficacy）— B. 不使用 AI 时"
            description="请根据您刚刚完成这项任务后的真实感受进行评价。（1 = 非常不同意；7 = 非常同意）"
            questions={selfEfficacyNoAIQuestions}
            values={values}
            onChange={handleChange}
          />
          <hr className="border-gray-200" />
          <LikertGroup
            title="内在动机（Intrinsic Motivation）"
            description="请根据您刚刚完成这项任务时的真实感受进行评价。（1 = 非常不同意；7 = 非常同意）"
            questions={intrinsicMotivationQuestions}
            values={values}
            onChange={handleChange}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleContinue} disabled={isSubmitting} size="lg">
            {isSubmitting ? '保存中...' : 'Continue'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
