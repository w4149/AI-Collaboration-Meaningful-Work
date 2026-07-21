"use client"

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface LikertQuestionProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  scaleLabelLeft?: string
  scaleLabelRight?: string
}

export function LikertQuestion({
  id,
  label,
  value,
  onChange,
  scaleLabelLeft = '1',
  scaleLabelRight = '7',
}: LikertQuestionProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-700">{label}</p>
      <RadioGroup value={value} onValueChange={onChange} className="flex items-center gap-1">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <div key={n} className="flex flex-col items-center gap-1">
            <RadioGroupItem value={n.toString()} id={`${id}-${n}`} />
            <Label htmlFor={`${id}-${n}`} className="text-xs cursor-pointer">{n}</Label>
          </div>
        ))}
      </RadioGroup>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{scaleLabelLeft}</span>
        <span>{scaleLabelRight}</span>
      </div>
    </div>
  )
}

interface LikertGroupProps {
  title: string
  description?: string
  scaleLabelLeft?: string
  scaleLabelRight?: string
  questions: { id: string; label: string }[]
  values: Record<string, string>
  onChange: (id: string, value: string) => void
}

export function LikertGroup({
  title,
  description,
  scaleLabelLeft = '非常不同意',
  scaleLabelRight = '非常同意',
  questions,
  values,
  onChange,
}: LikertGroupProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        <p className="text-xs text-gray-500 mt-1">
          （{scaleLabelLeft} = 1；{scaleLabelRight} = 7）
        </p>
      </div>
      {questions.map((q) => (
        <LikertQuestion
          key={q.id}
          id={q.id}
          label={q.label}
          value={values[q.id] || ''}
          onChange={(v) => onChange(q.id, v)}
          scaleLabelLeft={scaleLabelLeft}
          scaleLabelRight={scaleLabelRight}
        />
      ))}
    </div>
  )
}
