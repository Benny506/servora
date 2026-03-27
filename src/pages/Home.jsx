import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { clearAuth } from '../store/authSlice.js'
import { addAlert, hideLoader, showLoader } from '../store/uiSlice.js'

export default function Home() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)

  useEffect(() => {
    if (!user) navigate('/login', { replace: true })
  }, [navigate, user])

  const signOut = async () => {
    dispatch(showLoader('Signing out...'))
    try {
      if (supabase) await supabase.auth.signOut()
      dispatch(clearAuth())
      dispatch(
        addAlert({
          type: 'success',
          title: 'Signed out',
          message: 'See you next time.',
          timeoutMs: 3000,
        }),
      )
      navigate('/login', { replace: true })
    } finally {
      dispatch(hideLoader())
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="p-4 rounded-4 border bg-body-tertiary">
            <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
              <div>
                <h1 className="h4 mb-2">Home</h1>
                <div className="text-secondary">
                  Signed in as <span className="fw-semibold">{user?.email}</span>
                </div>
              </div>
              <button type="button" className="btn btn-outline-primary" onClick={signOut}>
                Sign out
              </button>
            </div>

            <div className="mt-4">
              <div className="fw-semibold mb-1">Dummy dashboard</div>
              <div className="text-secondary">
                This is a placeholder home screen. Next we’ll add navigation, profiles,
                services, portfolios, and chat.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
