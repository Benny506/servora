import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  loader: {
    isOpen: true,
    message: 'Restoring session...',
  },
  alerts: [],
}

const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showLoader: (state, action) => {
      state.loader.isOpen = true
      if (typeof action.payload === 'string') {
        state.loader.message = action.payload
      }
    },
    setLoaderMessage: (state, action) => {
      state.loader.message = action.payload ?? ''
    },
    hideLoader: (state) => {
      state.loader.isOpen = false
    },
    addAlert: (state, action) => {
      const payload = action.payload ?? {}
      const alert = {
        id: createId(),
        type: payload.type ?? 'info',
        title: payload.title ?? '',
        message: payload.message ?? '',
        timeoutMs: payload.timeoutMs ?? 4000,
        createdAt: Date.now(),
      }
      state.alerts.unshift(alert)
    },
    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter((a) => a.id !== action.payload)
    },
    clearAlerts: (state) => {
      state.alerts = []
    },
  },
})

export const {
  showLoader,
  setLoaderMessage,
  hideLoader,
  addAlert,
  removeAlert,
  clearAlerts,
} = uiSlice.actions
export default uiSlice.reducer
