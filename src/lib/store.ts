import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

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
  setTask: (taskId: string, taskType: string, taskContent: string, allowCopy: boolean, allowPaste: boolean) => void
  
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
      setTask: (taskId, taskType, taskContent, allowCopy, allowPaste) => 
        set({ taskId, taskType, taskContent, allowCopy, allowPaste }),
      
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
      
      // Reset
      reset: () => set({
        taskSubmission: '',
        chatMessages: [],
        isChatOpen: true,
      }),
    }),
    {
      name: 'ai-collaboration-storage',
      partialize: (state) => ({ 
        taskSubmission: state.taskSubmission,
        chatMessages: state.chatMessages,
      }),
    }
  )
)
