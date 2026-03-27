import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { addAlert } from '../store/uiSlice.js'

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch()
  const location = useLocation()
  const user = useSelector((state) => state.auth.user)
  const bootstrapStatus = useSelector((state) => state.auth.bootstrapStatus)
  const hasAlertedRef = useRef(false)

  useEffect(() => {
    if (bootstrapStatus === 'loading') return
    if (user) return
    if (hasAlertedRef.current) return
    hasAlertedRef.current = true
    dispatch(
      addAlert({
        type: 'warning',
        title: 'Sign in required',
        message: 'Please sign in to continue.',
        timeoutMs: 4200,
      }),
    )
  }, [bootstrapStatus, dispatch, user])

  if (bootstrapStatus === 'loading') return null
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

