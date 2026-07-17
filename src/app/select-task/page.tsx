"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Users, Bot, Users2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'

type TaskGroup = 'G1-Human' | 'G2-HumanAndAI' | 'G3-AI'

interface TaskOption {
  id: string
  name: string
  groups: TaskGroup[]
}

const tasks: TaskOption[] = [
  {
    id: 'task1',
    name: 'Task 1 - 新品推广方案',
    groups: ['G1-Human', 'G2-HumanAndAI', 'G3-AI'],
  },
  {
    id: 'task2',
    name: 'Task 2 - 竞争分析报告',
    groups: ['G1-Human', 'G2-HumanAndAI', 'G3-AI'],
  },
  {
    id: 'task3',
    name: 'Task 3 - 顾客留言整理',
    groups: ['G1-Human', 'G2-HumanAndAI', 'G3-AI'],
  },
  {
    id: 'task4',
    name: 'Task 4 - 投诉信回复',
    groups: ['G1-Human', 'G2-HumanAndAI', 'G3-AI'],
  },
]

const groupInfo: Record<TaskGroup, { label: string; description: string; icon: typeof Users; color: string }> = {
  'G1-Human': {
    label: 'G1 - Human',
    description: '全程禁用复制粘贴和AI交互',
    icon: Users,
    color: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  },
  'G2-HumanAndAI': {
    label: 'G2 - Human + AI',
    description: '前5分钟禁用，之后开放',
    icon: Users2,
    color: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  },
  'G3-AI': {
    label: 'G3 - AI',
    description: '完全开放复制粘贴和AI交互',
    icon: Bot,
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  },
}

export default function SelectTaskPage() {
  const router = useRouter()
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<TaskGroup | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const setUser = useAppStore((state) => state.setUser)
  const setTask = useAppStore((state) => state.setTask)
  const setStartTime = useAppStore((state) => state.setStartTime)
  const setGroupType = useAppStore((state) => state.setGroupType)

  const handleStartTask = async () => {
    if (!selectedTask || !selectedGroup) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prolificId: `test_user_${Date.now()}`,
          taskId: selectedTask,
          groupType: selectedGroup,
        }),
      })
      
      if (!response.ok) throw new Error('Failed to start session')
      
      const data = await response.json()
      
      setUser(data.userId, data.sessionId, `test_user_${Date.now()}`)
      setTask(
        data.taskId,
        data.taskTypeId,
        data.taskType, 
        data.taskContent, 
        data.allowCopy, 
        data.allowPaste,
        data.allowChat
      )
      setGroupType(selectedGroup)
      setStartTime(new Date())
      
      router.push('/task')
    } catch (error) {
      console.error('Error starting session:', error)
      alert('Failed to start. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Your Task</h1>
          <p className="text-gray-600">Choose a task and group to begin</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <Card 
              key={task.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedTask === task.id 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedTask(task.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {task.name}
                  {selectedTask === task.id && (
                    <Badge variant="outline" className="ml-auto">Selected</Badge>
                  )}
                </CardTitle>
                <CardDescription>Click to select this task</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">Select a group:</p>
                <div className="grid grid-cols-1 gap-2">
                  {task.groups.map((group) => {
                    const info = groupInfo[group]
                    const Icon = info.icon
                    return (
                      <Button
                        key={group}
                        variant={selectedGroup === group && selectedTask === task.id ? 'default' : 'outline'}
                        className={`w-full justify-start ${info.color}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTask(task.id)
                          setSelectedGroup(group)
                        }}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        <div className="text-left">
                          <div className="font-semibold">{info.label}</div>
                          <div className="text-xs opacity-70">{info.description}</div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleStartTask}
            disabled={!selectedTask || !selectedGroup || isLoading}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              'Starting...'
            ) : (
              <>
                Start Task
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Group Definitions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(groupInfo).map(([key, info]) => {
              const Icon = info.icon
              return (
                <div key={key} className="bg-white rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold">{info.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{info.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}