"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { LikertGroup } from '@/components/LikertScale'
import { useAppStore } from '@/lib/store'

const mentalEffortQuestions = [
  { id: 'me1', label: '完成刚刚这项任务需要我投入大量心理努力。' },
]

const taskChallengeQuestions = [
  { id: 'tc1', label: '我在完成这项任务时既不会感到无聊，也不会感到焦虑。' },
  { id: 'tc2', label: '我认为这项任务难度适中，既不过难也不过易。' },
  { id: 'tc3', label: '我能够从完成这项任务中感受到自己技能的提升。' },
  { id: 'tc4', label: '我认为这项任务的成果主要来自于自己的努力。' },
]

const taskEngagementQuestions = [
  { id: 'te1', label: '在完成这项任务时，我投入了大量注意力。' },
  { id: 'te2', label: '我在完成这项任务过程中保持了高度专注。' },
  { id: 'te3', label: '我投入了大量精力来完成这项任务。' },
  { id: 'te4', label: '我在完成这项任务时感到自己真正参与其中。' },
]

export default function SurveyPart1Page() {
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
    ...mentalEffortQuestions,
    ...taskChallengeQuestions,
    ...taskEngagementQuestions,
  ]

  const allAnswered = allQuestions.every((q) => values[q.id])

  const handleContinue = () => {
    if (!allAnswered) {
      alert('请回答所有问题后再继续。')
      return
    }
    setLikertResponses(values)
    router.push('/survey-part2')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">任务过程体验</CardTitle>
          <CardDescription>
            请根据您刚刚完成任务的真实感受回答以下问题。所有题目均为必答。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <LikertGroup
            title="心理努力（Mental Effort）"
            description="请评价完成刚刚这项任务所需要付出的总体心理努力。（1 = 心理努力极低；7 = 心理努力极高）"
            scaleLabelLeft="心理努力极低"
            scaleLabelRight="心理努力极高"
            questions={mentalEffortQuestions}
            values={values}
            onChange={handleChange}
          />
          <hr className="border-gray-200" />
          <LikertGroup
            title="任务挑战（Task Challenge）"
            description="请根据您刚刚完成这项任务时的真实感受进行评价。（1 = 非常不同意；7 = 非常同意）"
            questions={taskChallengeQuestions}
            values={values}
            onChange={handleChange}
          />
          <hr className="border-gray-200" />
          <LikertGroup
            title="自我投入度（Task Engagement）"
            description="请根据您刚刚完成这项任务时的真实感受进行评价。（1 = 非常不同意；7 = 非常同意）"
            questions={taskEngagementQuestions}
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
