"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { LikertGroup } from '@/components/LikertScale'
import { useAppStore } from '@/lib/store'

const autonomyQuestions = [
  { id: 'au1', label: '我可以自行决定如何完成这项任务。' },
  { id: 'au2', label: '这项任务允许我独立做出决定。' },
  { id: 'au3', label: '我在完成这项任务时拥有相当程度的独立性和自由。' },
  { id: 'au4', label: '我在完成这项任务时可以运用自己的主动性和判断力。' },
]

const skillUtilisationQuestions = [
  { id: 'su1', label: '学习新的知识或技能。' },
  { id: 'su2', label: '以最能发挥自己能力的方式完成这项任务。' },
  { id: 'su3', label: '运用自己的才能和技能。' },
  { id: 'su4', label: '获得发展自身技能或能力的机会。' },
]

const socialImpactQuestions = [
  { id: 'si1', label: '我能够清楚意识到刚刚完成的这项任务会对他人产生积极影响。' },
  { id: 'si2', label: '我能够清楚意识到刚刚完成的这项任务能够以何种方式使他人受益。' },
  { id: 'si3', label: '我觉得自己能够通过刚刚完成的这项任务对他人产生积极影响。' },
]

export default function SurveyPart2Page() {
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
    ...autonomyQuestions,
    ...skillUtilisationQuestions,
    ...socialImpactQuestions,
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
          part: 2,
          responses: values,
        }),
      })
      if (!response.ok) throw new Error('Failed to save')
      router.push('/survey-part3')
    } catch (error) {
      console.error('Error saving part 2:', error)
      alert('保存失败，请重试。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">工作特征感知</CardTitle>
          <CardDescription>
            请根据您刚刚完成任务的真实感受回答以下问题。所有题目均为必答。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <LikertGroup
            title="④ 自主性（Autonomy）"
            description="请根据您刚刚完成这项任务时的真实感受进行评价。"
            questions={autonomyQuestions}
            values={values}
            onChange={handleChange}
          />
          <LikertGroup
            title="⑤ 技能利用（Skill Utilisation）"
            description="请根据您刚刚完成的这项任务进行评价。这项任务在多大程度上让您能够……？"
            scaleLabelLeft="完全不能"
            scaleLabelRight="非常能够"
            questions={skillUtilisationQuestions}
            values={values}
            onChange={handleChange}
          />
          <LikertGroup
            title="⑥ 社会影响（Social Impact）"
            description="请根据您刚刚完成这项任务后的真实感受进行评价。"
            questions={socialImpactQuestions}
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
