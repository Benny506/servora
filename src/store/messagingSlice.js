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
  setLoading, 
  setError,
  clearActiveChat
} = messagingSlice.actions

export default messagingSlice.reducer
