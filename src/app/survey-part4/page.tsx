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
    try {
      const response = await fetch('/api/survey-likert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          part: 4,
          responses: values,
        }),
      })
      if (!response.ok) throw new Error('Failed to save')
      router.push('/thank-you')
    } catch (error) {
      console.error('Error saving part 4:', error)
      alert('保存失败，请重试。')
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
        <CardContent className="space-y-8">
          <LikertGroup
            title="⑩ 自我效能（Self-efficacy）— A. 使用 AI 时"
            description="请根据您刚刚完成这项任务后的真实感受进行评价。"
            questions={selfEfficacyAIQuestions}
            values={values}
            onChange={handleChange}
          />
          <LikertGroup
            title="⑩ 自我效能（Self-efficacy）— B. 不使用 AI 时"
            questions={selfEfficacyNoAIQuestions}
            values={values}
            onChange={handleChange}
          />
          <LikertGroup
            title="⑪ 内在动机（Intrinsic Motivation）"
            description="请根据您刚刚完成这项任务时的真实感受进行评价。"
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
