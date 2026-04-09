import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  conversations: [],
  activeConversationId: null,
  messages: [],
  loading: false,
  error: null,
}

const messagingSlice = createSlice({
  name: 'messaging',
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload
    },
    setActiveConversationId: (state, action) => {
      state.activeConversationId = action.payload
    },
    setMessages: (state, action) => {
      state.messages = action.payload
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload)
    },
    reconcileMessage: (state, action) => {
      const newMsg = action.payload
      // 1. Strict ID Check
      const existingIdx = state.messages.findIndex(m => m.id === newMsg.id)
      if (existingIdx !== -1) return

      // 2. Optimistic Link Check (for the sender)
      // Look for an optimistic bubble with the same content sent recently
      const optIdx = state.messages.findIndex(m => 
        m.isOptimistic && 
        m.sender_id === newMsg.sender_id && 
        m.content === newMsg.content
      )

      if (optIdx !== -1) {
        // Replace optimistic with real server message
        state.messages[optIdx] = newMsg
      } else {
        // Normal add
        state.messages.push(newMsg)
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    clearActiveChat: (state) => {
      state.activeConversationId = null
      state.messages = []
    }
  }
})

export const { 
  setConversations, 
  setActiveConversationId, 
  setMessages, 
  addMessage, 
  reconcileMessage,
  setLoading, 
  setError,
  clearActiveChat
} = messagingSlice.actions

export default messagingSlice.reducer
