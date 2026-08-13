"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import ConsentPage from '@/components/ConsentPage'

export default function ConsentRoutePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleAgree = () => {
    const params = searchParams.toString()
    router.push(params ? `/entry?${params}` : '/entry')
  }

  return (
    <ConsentPage
      title="Café Task Study"
      description="Please read the following study information carefully before proceeding."
      sections={[
        {
          type: 'info',
          title: 'Study Overview',
          content: 'You are invited to participate in a research study titled "Café Task Study", which explores people\u2019s experiences when completing everyday work-related writing tasks.',
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
      ]}
      checkboxText="I have carefully read and understood the above study information, meet the eligibility requirements (aged 18\u201364 and currently residing in the United States), agree to complete the study task as required, promise to fill in demographic information truthfully, and allow the provided data to be used for scientific research."
      buttonText="Continue"
      onAgree={handleAgree}
    />
  )
}
