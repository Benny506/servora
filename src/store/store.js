import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice.js'
import discoveryReducer from './discoverySlice.js'
import uiReducer from './uiSlice.js'
import adminReducer from './adminSlice.js'
import messagingReducer from './messagingSlice.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    discovery: discoveryReducer,
    ui: uiReducer,
    admin: adminReducer,
    messaging: messagingReducer,
  },
})
