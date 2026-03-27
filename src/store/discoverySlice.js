import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { supabase } from '../lib/supabaseClient.js'

const CACHE_KEY = 'sv_discovery_cache_v1'

const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const services = Array.isArray(parsed.services) ? parsed.services : []
    const professionals = Array.isArray(parsed.professionals) ? parsed.professionals : []
    const cachedAt = typeof parsed.cachedAt === 'number' ? parsed.cachedAt : 0
    return { services, professionals, cachedAt }
  } catch {
    return null
  }
}

const writeCache = (payload) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    return
  }
}

export const refreshDiscovery = createAsyncThunk('discovery/refresh', async () => {
  if (!supabase) throw new Error('Supabase is not configured.')

  const activeClause = 'is_active.is.null,is_active.eq.true'

  const [servicesRes, prosRes] = await Promise.all([
    supabase
      .from('sv_services')
      .select('*')
      .or(activeClause)
      .order('created_at', { ascending: false }),
    supabase
      .from('sv_professional_profiles')
      .select('*')
      .or(activeClause)
      .order('created_at', { ascending: false }),
  ])

  if (servicesRes.error) throw servicesRes.error
  if (prosRes.error) throw prosRes.error

  const services = servicesRes.data ?? []
  const professionals = prosRes.data ?? []
  const cachedAt = Date.now()

  writeCache({ services, professionals, cachedAt })
  return { services, professionals, cachedAt }
})

export const bootstrapDiscovery = createAsyncThunk('discovery/bootstrap', async (_PAYLOAD, thunkApi) => {
  const cached = typeof window !== 'undefined' ? readCache() : null
  if (cached) {
    thunkApi.dispatch(setDiscovery(cached))
    thunkApi.dispatch(refreshDiscovery())
    return cached
  }

  const res = await thunkApi.dispatch(refreshDiscovery())
  if (refreshDiscovery.rejected.match(res)) throw res.error
  return res.payload
})

const initialState = {
  services: [],
  professionals: [],
  cachedAt: 0,
  status: 'idle',
  isRefreshing: false,
  error: null,
}

const discoverySlice = createSlice({
  name: 'discovery',
  initialState,
  reducers: {
    setDiscovery: (state, action) => {
      state.services = action.payload?.services ?? []
      state.professionals = action.payload?.professionals ?? []
      state.cachedAt = action.payload?.cachedAt ?? 0
    },
    clearDiscovery: (state) => {
      state.services = []
      state.professionals = []
      state.cachedAt = 0
      state.status = 'idle'
      state.isRefreshing = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapDiscovery.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(bootstrapDiscovery.fulfilled, (state) => {
        state.status = 'succeeded'
        state.error = null
      })
      .addCase(bootstrapDiscovery.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error?.message ?? 'Unable to load marketplace data.'
      })
      .addCase(refreshDiscovery.pending, (state) => {
        state.isRefreshing = true
      })
      .addCase(refreshDiscovery.fulfilled, (state, action) => {
        state.isRefreshing = false
        state.status = 'succeeded'
        state.services = action.payload?.services ?? []
        state.professionals = action.payload?.professionals ?? []
        state.cachedAt = action.payload?.cachedAt ?? 0
        state.error = null
      })
      .addCase(refreshDiscovery.rejected, (state, action) => {
        state.isRefreshing = false
        if (state.status === 'idle') state.status = 'failed'
        state.error = action.error?.message ?? 'Unable to refresh marketplace data.'
      })
  },
})

export const { setDiscovery, clearDiscovery } = discoverySlice.actions
export default discoverySlice.reducer
