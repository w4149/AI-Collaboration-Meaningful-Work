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
  taskType: string | null
  taskContent: string | null
  allowCopy: boolean
  allowPaste: boolean
  allowChat: boolean
  setTask: (taskId: string, taskType: string, taskContent: string, allowCopy: boolean, allowPaste: boolean, allowChat: boolean) => void
  
  // Group Type
  groupType: GroupType
  setGroupType: (groupType: GroupType) => void
  
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
      taskType: null,
      taskContent: null,
      allowCopy: true,
      allowPaste: true,
      allowChat: true,
      setTask: (taskId, taskType, taskContent, allowCopy, allowPaste, allowChat) => 
        set({ taskId, taskType, taskContent, allowCopy, allowPaste, allowChat }),
      
      // Group Type
      groupType: null,
      setGroupType: (groupType) => set({ groupType }),
      
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
      
      // Reset
      reset: () => set({
        taskSubmission: '',
        chatMessages: [],
        isChatOpen: true,
        groupType: null,
        unlockedAt: null,
        taskDuration: null,
      }),
    }),
    {
      name: 'ai-collaboration-storage',
      partialize: (state) => ({ 
        taskSubmission: state.taskSubmission,
        chatMessages: state.chatMessages,
        groupType: state.groupType,
        startTime: state.startTime ? state.startTime.getTime() : null,
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