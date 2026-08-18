import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type GroupType = 'G1-Human' | 'G2-AI' | 'G3-HumanAndAI' | null

interface AppState {
  // User & Session
  userId: string | null
  sessionId: string | null
  prolificId: string | null
  setUser: (userId: string, sessionId: string, prolificId: string) => void
  
  // Task
  taskId: string | null
  taskTypeId: string | null
  taskType: string | null
  taskContent: string | null
  allowCopy: boolean
  allowPaste: boolean
  allowChat: boolean
  setTask: (taskId: string, taskTypeId: string, taskType: string, taskContent: string, allowCopy: boolean, allowPaste: boolean, allowChat: boolean) => void
  
  // Group Type
  groupType: GroupType
  setGroupType: (groupType: GroupType) => void
  
  // Phase (for G3: 1=draft, 2=AI-improve)
  currentPhase: 1 | 2
  setCurrentPhase: (phase: 1 | 2) => void
  
  // Unlock Time (for G2)
  unlockedAt: Date | null
  setUnlockedAt: (time: Date | null) => void
  unlockFeatures: () => void
  
  // Task Submission
  taskSubmission: string
  setTaskSubmission: (content: string) => void
  
  // Chat
  chatMessages: ChatMessage[]
  addChatMessage: (message: ChatMessage) => void
  clearChat: () => void
  isChatOpen: boolean
  toggleChat: () => void
  
  // Timer
  startTime: Date | null
  setStartTime: (time: Date) => void
  
  // Task Duration (seconds)
  taskDuration: number | null
  setTaskDuration: (duration: number) => void
  
  // Task submitted flag
  taskSubmitted: boolean
  setTaskSubmitted: (submitted: boolean) => void
  
  // Survey data (accumulated across pages)
  surveyFormData: Record<string, string | number | null>
  setSurveyFormData: (data: Record<string, string | number | null>) => void
  likertResponses: Record<string, string>
  setLikertResponses: (responses: Record<string, string>) => void
  
  // Pre-survey completion flag
  preSurveyCompleted: boolean
  setPreSurveyCompleted: (completed: boolean) => void

  // Post-task survey completion flag
  postSurveyCompleted: boolean
  setPostSurveyCompleted: (completed: boolean) => void

  // Psychological scale completion flag
  psychologicalScaleCompleted: boolean
  setPsychologicalScaleCompleted: (completed: boolean) => void

  // Demographics survey completion flag
  demographicsSurveyCompleted: boolean
  setDemographicsSurveyCompleted: (completed: boolean) => void

  // Attention check tracking
  attentionCheck1Passed: boolean
  setAttentionCheck1Passed: (passed: boolean) => void
  attentionCheck2Passed: boolean
  setAttentionCheck2Passed: (passed: boolean) => void
  attentionCheck1FailCount: number
  incrementAttentionCheck1Fail: () => void
  attentionCheck2FailCount: number
  incrementAttentionCheck2Fail: () => void
  
  // Reset
  reset: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // User & Session
      userId: null,
      sessionId: null,
      prolificId: null,
      setUser: (userId, sessionId, prolificId) => set({ userId, sessionId, prolificId }),
      
      // Task
      taskId: null,
      taskTypeId: null,
      taskType: null,
      taskContent: null,
      allowCopy: true,
      allowPaste: true,
      allowChat: true,
      setTask: (taskId, taskTypeId, taskType, taskContent, allowCopy, allowPaste, allowChat) => 
        set({ taskId, taskTypeId, taskType, taskContent, allowCopy, allowPaste, allowChat }),
      
      // Group Type
      groupType: null,
      setGroupType: (groupType) => set({ groupType }),
      
      // Phase
      currentPhase: 1,
      setCurrentPhase: (currentPhase) => set({ currentPhase }),
      
      // Unlock Time
      unlockedAt: null,
      setUnlockedAt: (unlockedAt) => set({ unlockedAt }),
      unlockFeatures: () => set({ 
        allowCopy: true, 
        allowPaste: true, 
        allowChat: true,
        unlockedAt: new Date(),
      }),
      
      // Task Submission
      taskSubmission: '',
      setTaskSubmission: (content) => set({ taskSubmission: content }),
      
      // Chat
      chatMessages: [],
      addChatMessage: (message) => set((state) => ({ 
        chatMessages: [...state.chatMessages, message] 
      })),
      clearChat: () => set({ chatMessages: [] }),
      isChatOpen: true,
      toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
      
      // Timer
      startTime: null,
      setStartTime: (time) => set({ startTime: time }),
      
      // Task Duration
      taskDuration: null,
      setTaskDuration: (taskDuration) => set({ taskDuration }),
      
      // Task submitted flag
      taskSubmitted: false,
      setTaskSubmitted: (taskSubmitted) => set({ taskSubmitted }),
      
      // Survey data
      surveyFormData: {},
      setSurveyFormData: (surveyFormData) => set({ surveyFormData }),
      likertResponses: {},
      setLikertResponses: (likertResponses) => set((state) => ({
        likertResponses: { ...state.likertResponses, ...likertResponses },
      })),
      
      // Pre-survey completion flag
      preSurveyCompleted: false,
      setPreSurveyCompleted: (preSurveyCompleted) => set({ preSurveyCompleted }),
      
      // Post-task survey completion flag
      postSurveyCompleted: false,
      setPostSurveyCompleted: (postSurveyCompleted) => set({ postSurveyCompleted }),

      // Psychological scale completion flag
      psychologicalScaleCompleted: false,
      setPsychologicalScaleCompleted: (psychologicalScaleCompleted) => set({ psychologicalScaleCompleted }),

      // Demographics survey completion flag
      demographicsSurveyCompleted: false,
      setDemographicsSurveyCompleted: (demographicsSurveyCompleted) => set({ demographicsSurveyCompleted }),

      // Attention check tracking
      attentionCheck1Passed: false,
      setAttentionCheck1Passed: (passed) => set({ attentionCheck1Passed: passed }),
      attentionCheck2Passed: false,
      setAttentionCheck2Passed: (passed) => set({ attentionCheck2Passed: passed }),
      attentionCheck1FailCount: 0,
      incrementAttentionCheck1Fail: () => set((state) => ({ attentionCheck1FailCount: state.attentionCheck1FailCount + 1 })),
      attentionCheck2FailCount: 0,
      incrementAttentionCheck2Fail: () => set((state) => ({ attentionCheck2FailCount: state.attentionCheck2FailCount + 1 })),
      
      // Reset
      reset: () => set({
        taskSubmission: '',
        chatMessages: [],
        isChatOpen: true,
        groupType: null,
        currentPhase: 1,
        unlockedAt: null,
        taskDuration: null,
        taskSubmitted: false,
        surveyFormData: {},
        likertResponses: {},
        preSurveyCompleted: false,
        postSurveyCompleted: false,
        psychologicalScaleCompleted: false,
        demographicsSurveyCompleted: false,
        attentionCheck1Passed: false,
        attentionCheck2Passed: false,
        attentionCheck1FailCount: 0,
        attentionCheck2FailCount: 0,
      }),
    }),
    {
      name: 'ai-collaboration-storage',
      partialize: (state) => ({ 
        taskSubmission: state.taskSubmission,
        chatMessages: state.chatMessages,
        groupType: state.groupType,
        currentPhase: state.currentPhase,
        startTime: state.startTime ? state.startTime.getTime() : null,
        taskSubmitted: state.taskSubmitted,
        surveyFormData: state.surveyFormData,
        likertResponses: state.likertResponses,
        preSurveyCompleted: state.preSurveyCompleted,
        postSurveyCompleted: state.postSurveyCompleted,
        psychologicalScaleCompleted: state.psychologicalScaleCompleted,
        demographicsSurveyCompleted: state.demographicsSurveyCompleted,
        attentionCheck1Passed: state.attentionCheck1Passed,
        attentionCheck2Passed: state.attentionCheck2Passed,
        attentionCheck1FailCount: state.attentionCheck1FailCount,
        attentionCheck2FailCount: state.attentionCheck2FailCount,
      }),
      merge: (persistedState: unknown, currentState) => {
        const state = persistedState as Partial<AppState>
        return {
          ...currentState,
          ...state,
          startTime: typeof state.startTime === 'number' ? new Date(state.startTime) : null,
        }
      },
    }
  )
)