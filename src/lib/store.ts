import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type GroupType = 'G1-Human' | 'G2-HumanAndAI' | 'G3-AI' | null

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