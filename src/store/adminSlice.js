import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isAdminAuthenticated: !!localStorage.getItem('servora_admin_session'),
  adminData: localStorage.getItem('servora_admin_session') 
    ? JSON.parse(localStorage.getItem('servora_admin_session')) 
    : null,
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    loginAdmin: (state, action) => {
      state.isAdminAuthenticated = true
      state.adminData = action.payload
      localStorage.setItem('servora_admin_session', JSON.stringify(action.payload))
    },
    logoutAdmin: (state) => {
      state.isAdminAuthenticated = false
      state.adminData = null
      localStorage.removeItem('servora_admin_session')
    },
  },
})

export const { loginAdmin, logoutAdmin } = adminSlice.actions
export default adminSlice.reducer
