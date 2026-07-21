"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { LikertGroup } from '@/components/LikertScale'
import { useAppStore } from '@/lib/store'

const psychologicalOwnershipQuestions = [
  { id: 'po1', label: '刚刚完成的这项任务成果是我的成果。' },
  { id: 'po2', label: '我觉得刚刚完成的这项任务成果属于我。' },
  { id: 'po3', label: '我对刚刚完成的这项任务具有很强的拥有感。' },
  { id: 'po4', label: '我觉得刚刚完成的这项任务就是我的任务。' },
  { id: 'po5', label: '我很难把刚刚完成的这项任务看作是属于我的。（反向计分）' },
]

const workMeaningfulnessQuestions = [
  { id: 'wm1', label: '我刚刚完成的这项任务对我来说很重要。' },
  { id: 'wm2', label: '这项任务对我具有个人意义。' },
  { id: 'wm3', label: '我认为刚刚完成的这项任务是值得做的。' },
  { id: 'wm4', label: '这项任务对我而言具有重要意义。' },
  { id: 'wm5', label: '我认为这项任务是有意义的。' },
  { id: 'wm6', label: '我觉得刚刚完成的这项任务具有价值。' },
]

const perceivedTaskRealismQuestions = [
  { id: 'ptr1', label: '我觉得这项任务具有较强的现实感。' },
  { id: 'ptr2', label: '我认为这项任务能够真实反映现实工作中可能出现的任务。' },
  { id: 'ptr3', label: '我觉得这项任务情境设计得比较真实。' },
  { id: 'ptr4', label: '在完成任务过程中，我能够把自己代入到真实工作情境中。' },
]

export default function SurveyPart3Page() {
  const router = useRouter()
  const userId = useAppStore((state) => state.userId)
  const setLikertResponses = useAppStore((state) => state.setLikertResponses)
  const [values, setValues] = useState<Record<string, string>>({})

  if (!userId) {
    router.push('/entry')
    return null
  }

  const handleChange = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }))
  }

  const allQuestions = [
    ...psychologicalOwnershipQuestions,
    ...workMeaningfulnessQuestions,
    ...perceivedTaskRealismQuestions,
  ]

  const allAnswered = allQuestions.every((q) => values[q.id])

  const handleContinue = () => {
    if (!allAnswered) {
      alert('请回答所有问题后再继续。')
      return
    }
    setLikertResponses(values)
    router.push('/survey-part4')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">心理结果变量</CardTitle>
          <CardDescription>
            请根据您刚刚完成任务的真实感受回答以下问题。所有题目均为必答。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <LikertGroup
            title="心理所有权（Psychological Ownership）"
            description="请根据您刚刚完成这项任务后的真实感受进行评价。（1 = 非常不同意；7 = 非常同意）"
            questions={psychologicalOwnershipQuestions}
            values={values}
            onChange={handleChange}
          />
          <hr className="border-gray-200" />
          <LikertGroup
            title="工作意义感（Work Meaningfulness）"
            description="请根据您刚刚完成这项任务后的真实感受进行评价。（1 = 非常不同意；7 = 非常同意）"
            questions={workMeaningfulnessQuestions}
            values={values}
            onChange={handleChange}
          />
          <hr className="border-gray-200" />
          <LikertGroup
            title="感知真实性（Perceived Task Realism）"
            description="请根据您刚刚完成的任务体验进行评价。（1 = 非常不同意；7 = 非常同意）"
            questions={perceivedTaskRealismQuestions}
            values={values}
            onChange={handleChange}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleContinue} size="lg">
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
