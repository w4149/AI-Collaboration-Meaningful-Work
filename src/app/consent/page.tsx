"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import ConsentPage from '@/components/ConsentPage'
import { useMemo, useEffect } from 'react'
import { getSkipRouteWithParams, FLOW_CONFIG } from '@/lib/flow-config'

type ConsentConfig = {
  title: string
  description: string
  sections: { type?: 'info' | 'warning' | 'plain'; title?: string; content: string }[]
  checkboxText: string
  buttonText: string
}

const CONSENT_1: ConsentConfig = {
  title: 'Everyday Work Task Study',
  description: 'Please read the following study information carefully before proceeding.',
  sections: [
    {
      type: 'plain',
      content: `Hello, and thank you for your interest in participating in this study.

This study explores people's experiences when completing everyday work-related tasks.

To be eligible for this study, you must be between 18 and 64 years of age, currently reside in the United States, be fluent in reading and writing English, and have prior experience using a generative AI chatbot.

In this study, you will be asked to complete a short work-related task by imagining yourself as a coffee shop employee. You will also be asked to provide basic demographic information, including your age and gender, and answer questions about your experience completing the task.

This study is conducted by Assistant Professor Xiang Lu at the Hong Kong University of Science and Technology (Guangzhou). If you have any questions about the study, you may contact the Principal Investigator at xianglu@hkust-gz.edu.cn.

Your participation is voluntary. You may stop participating at any time by closing your browser window or tab. Choosing to stop will not result in any penalty. Compensation is provided for completed study submissions in accordance with the payment terms described for this study.

Your research data will be kept confidential, and no personally identifiable information will be reported in research publications.`,
    },
  ],
  checkboxText: 'I have read and understood the study information above. I confirm that I meet the eligibility requirements and voluntarily agree to participate in this study. I understand that the data I provide may be used for scientific research.',
  buttonText: 'Continue',
}

const CONSENT_2: ConsentConfig = {
  title: 'Everyday Work Task Study',
  description: 'Please read the following study information carefully before proceeding.',
  sections: [
    {
      type: 'plain',
      content: `Hello, and thank you for your interest in participating in this study.

This study explores people's experiences when completing everyday work-related tasks.

To be eligible for this study, you must be between 18 and 64 years of age, currently reside in the United States, be fluent in reading and writing English, and have prior experience using a generative AI chatbot.

In this study, you will be asked to complete a short work-related task by imagining yourself as a coffee shop employee. You will have access to an AI assistant while completing the task. Your interactions with the AI assistant will be recorded as part of the research data. You will also be asked to provide basic demographic information, including your age and gender, and answer questions about your experience completing the task.

This study is conducted by Assistant Professor Xiang Lu at the Hong Kong University of Science and Technology (Guangzhou). If you have any questions about the study, you may contact the Principal Investigator at xianglu@hkust-gz.edu.cn.

Your participation is voluntary. You may stop participating at any time by closing your browser window or tab. Choosing to stop will not result in any penalty. Compensation is provided for completed study submissions in accordance with the payment terms described for this study.

Your research data, including your interactions with the AI assistant, will be kept confidential, and no personally identifiable information will be reported in research publications.`,
    },
  ],
  checkboxText: 'I have read and understood the study information above. I confirm that I meet the eligibility requirements and voluntarily agree to participate in this study. I understand that the data I provide may be used for scientific research.',
  buttonText: 'Continue',
}

const CONSENT_3: ConsentConfig = {
  title: 'Everyday Work Task Study',
  // description: '[Consent 3 placeholder — G3 Human + AI Two Phases]',
  description: 'Please read the following study information carefully before proceeding.',
  sections: [
    {
      type: 'plain',
      content: `Hello, and thank you for your interest in participating in this study.

      This study explores people’s experiences when completing everyday work-related tasks.
      
      To be eligible for this study, you must be between 18 and 64 years of age, currently reside in the United States, be fluent in reading and writing English, and have prior experience using a generative AI chatbot.

      In this study, you will be asked to complete a short work-related task by imagining yourself as a coffee shop employee. During part of the task, you will have access to an AI assistant. Your interactions with the AI assistant will be recorded as part of the research data. You will also be asked to provide basic demographic information, including your age and gender, and answer questions about your experience completing the task.

      This study is conducted by Assistant Professor Xiang Lu at the Hong Kong University of Science and Technology (Guangzhou). If you have any questions about the study, you may contact the Principal Investigator at xianglu@hkust-gz.edu.cn.

      Your participation is voluntary. You may stop participating at any time by closing your browser window or tab. Choosing to stop will not result in any penalty. Compensation is provided for completed study submissions in accordance with the payment terms described for this study.

      Your research data, including your interactions with the AI assistant, will be kept confidential, and no personally identifiable information will be reported in research publications.`,
    },
  ],
  checkboxText: 'I have read and understood the study information above. I confirm that I meet the eligibility requirements and voluntarily agree to participate in this study. I understand that the data I provide may be used for scientific research.',
  buttonText: 'Continue',
}

const DEFAULT_CONSENT: ConsentConfig = {
  title: 'Everyday Work Task Study',
  description: 'Please read the following study information carefully before proceeding.',
  sections: [
    {
      type: 'info',
      title: 'Study Overview',
      content: 'You are invited to participate in a research study titled "Everyday Work Task Study", which explores people\u2019s experiences when completing everyday work-related writing tasks.',
    },
    {
      type: 'plain',
      title: 'Eligibility',
      content: 'To be eligible for this study, you must be between 18 and 64 years of age and currently reside in the United States.',
    },
    {
      type: 'plain',
      title: 'What You Will Do',
      content: 'In this study, you will be asked to complete a short work-related writing task by imagining yourself as a coffee shop employee. You may use AI tools while finishing the writing task. You will also need to answer basic demographic questions (including your age and gender) and share your subjective experience of completing the task.',
    },
    {
      type: 'plain',
      title: 'Researcher Contact',
      content: 'This study is conducted by Assistant Professor Xiang Lu, Hong Kong University of Science and Technology (Guangzhou). If you have any questions about the study, you may contact the PI at xianglu@hkust-gz.edu.cn.',
    },
    {
      type: 'plain',
      title: 'Voluntary Participation',
      content: 'Your participation is voluntary. You may stop participating at any time by closing the browser window or tab. There will be no negative consequences for withdrawing. (Please note that compensation can only be provided if you complete the task, because payment reflects the work completed.)',
    },
    {
      type: 'plain',
      title: 'Confidentiality',
      content: 'All data will remain confidential, and no personally identifiable information will be shared in any research publications.',
    },
  ],
  checkboxText: 'I have carefully read and understood the above study information, meet the eligibility requirements (aged 18-64 and currently residing in the United States), agree to complete the study task as required, promise to fill in demographic information truthfully, and allow the provided data to be used for scientific research.',
  buttonText: 'Continue',
}

const CONSENT_MAP: Record<string, ConsentConfig> = {
  'G1-Human': CONSENT_1,
  'G2-AI': CONSENT_2,
  'G3-HumanAndAI': CONSENT_3,
}

export default function ConsentRoutePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const group = searchParams.get('group')

  // Skip consent when disabled, or require screening completion
  useEffect(() => {
    if (!FLOW_CONFIG.consent) {
      const skip = getSkipRouteWithParams('consent', searchParams)
      if (skip) router.replace(skip)
      return
    }

    const completed = sessionStorage.getItem('screeningCompleted')
    const passed = sessionStorage.getItem('screeningPassed')
    if (completed !== 'true' || passed !== 'true') {
      const params = searchParams.toString()
      const qs = params ? `?${params}` : ''
      router.replace(`/screen${qs}`)
    }
  }, [router, searchParams])

  const config = useMemo(() => {
    if (group && CONSENT_MAP[group]) return CONSENT_MAP[group]
    return DEFAULT_CONSENT
  }, [group])

  const handleAgree = () => {
    // Mark consent as agreed for downstream guards
    sessionStorage.setItem('consentAgreed', 'true')

    // Check if preSurvey is disabled
    if (!FLOW_CONFIG.preSurvey) {
      const skip = getSkipRouteWithParams('preSurvey', searchParams)
      if (skip) {
        router.push(skip)
        return
      }
    }
    const params = searchParams.toString()
    router.push(params ? `/pre-survey?${params}` : '/pre-survey')
  }

  return (
    <ConsentPage
      title={config.title}
      description={config.description}
      sections={config.sections}
      checkboxText={config.checkboxText}
      buttonText={config.buttonText}
      onAgree={handleAgree}
    />
  )
}
