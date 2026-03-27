import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { supabase } from '../lib/supabaseClient.js'
import { hideLoader, showLoader } from './uiSlice.js'

const initialState = {
  session: null,
  user: null,
  professionalProfile: null,
  portfolios: [],
  services: [],
  bootstrapStatus: 'loading',
}

export const authBootstrap = createAsyncThunk(
  'auth/bootstrap',
  async ({ source } = {}, thunkApi) => {
    const message = source === 'login' ? 'Preparing your account...' : 'Restoring session...'
    thunkApi.dispatch(showLoader(message))

    try {
      if (!supabase) {
        throw new Error('Supabase is not configured.')
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      const session = sessionData?.session ?? null
      if (!session) {
        return { session: null, user: null, professionalProfile: null, portfolios: [] }
      }

      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const user = userData?.user ?? null
      if (!user) {
        throw new Error('Unable to retrieve user.')
      }

      const { data: professionalProfile, error: professionalError } = await supabase
        .from('sv_professional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (professionalError) {
        throw professionalError
      }

      let portfolios = []
      if (professionalProfile?.id) {
        const { data: portfoliosData, error: portfoliosError } = await supabase
          .from('sv_portfolios')
          .select('*')
          .eq('professional_id', professionalProfile.id)
          .order('created_at', { ascending: false })

        if (portfoliosError) throw portfoliosError
        portfolios = portfoliosData ?? []
      }

      let services = []
      if (professionalProfile?.id) {
        const { data: servicesData, error: servicesError } = await supabase
          .from('sv_services')
          .select('*')
          .eq('professional_id', professionalProfile.id)
          .order('created_at', { ascending: false })

        if (servicesError) throw servicesError
        services = servicesData ?? []
      }

      return { session, user, professionalProfile: professionalProfile ?? null, portfolios, services }
    } catch (err) {
      try {
        if (supabase) await supabase.auth.signOut()
      } catch {
        // ignore
      }
      throw err
    } finally {
      thunkApi.dispatch(hideLoader())
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.session = action.payload?.session ?? null
      state.user = action.payload?.user ?? null
      state.professionalProfile = action.payload?.professionalProfile ?? null
      state.portfolios = action.payload?.portfolios ?? []
      state.services = action.payload?.services ?? []
    },
    setProfessionalProfile: (state, action) => {
      state.professionalProfile = action.payload ?? null
    },
    setPortfolios: (state, action) => {
      state.portfolios = action.payload ?? []
    },
    addPortfolio: (state, action) => {
      state.portfolios = [action.payload, ...state.portfolios]
    },
    updatePortfolio: (state, action) => {
      const next = action.payload
      state.portfolios = state.portfolios.map((p) => (p.id === next.id ? next : p))
    },
    setServices: (state, action) => {
      state.services = action.payload ?? []
    },
    addService: (state, action) => {
      state.services = [action.payload, ...state.services]
    },
    updateService: (state, action) => {
      const next = action.payload
      state.services = state.services.map((s) => (s.id === next.id ? next : s))
    },
    clearAuth: (state) => {
      state.session = null
      state.user = null
      state.professionalProfile = null
      state.portfolios = []
      state.services = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(authBootstrap.pending, (state) => {
        state.bootstrapStatus = 'loading'
      })
      .addCase(authBootstrap.fulfilled, (state, action) => {
        state.bootstrapStatus = 'succeeded'
        state.session = action.payload.session
        state.user = action.payload.user
        state.professionalProfile = action.payload.professionalProfile
        state.portfolios = action.payload.portfolios ?? []
        state.services = action.payload.services ?? []
      })
      .addCase(authBootstrap.rejected, (state) => {
        state.bootstrapStatus = 'failed'
        state.session = null
        state.user = null
        state.professionalProfile = null
        state.portfolios = []
        state.services = []
      })
  },
})

export const {
  setAuth,
  setProfessionalProfile,
  setPortfolios,
  addPortfolio,
  updatePortfolio,
  setServices,
  addService,
  updateService,
  clearAuth,
} = authSlice.actions
export default authSlice.reducer
