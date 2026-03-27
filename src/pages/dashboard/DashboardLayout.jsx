import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { addAlert, hideLoader, showLoader } from '../../store/uiSlice.js'
import { clearAuth } from '../../store/authSlice.js'
import { supabase } from '../../lib/supabaseClient.js'
import ConfirmActionModal from '../../components/ConfirmActionModal.jsx'
import DashboardSidebar from './components/DashboardSidebar.jsx'
import DashboardTopBar from './components/DashboardTopBar.jsx'
import './dashboard.css'

export default function DashboardLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector((state) => state.auth.user)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  useEffect(() => {
    if (!user) navigate('/login', { replace: true })
  }, [navigate, user])

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  const navItems = useMemo(
    () => [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/dashboard/professional-profile', label: 'Professional Profile' },
      { to: '/dashboard/messages', label: 'Messages' },
      { to: '/dashboard/portfolio', label: 'Portfolio' },
      { to: '/dashboard/services', label: 'Services' },
      { to: '/dashboard/security', label: 'Security' },
      { to: '/', label: 'Landing Page' },
    ],
    [],
  )

  const logout = async () => {
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
    <div className="sv-dashboard">
      <DashboardSidebar items={navItems} onLogout={() => setLogoutConfirmOpen(true)} />

      <div className="sv-dashboard__right">
        <DashboardTopBar
          userEmail={user?.email ?? ''}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="sv-dashboard__content">
          <div className="sv-dashboard__content-inner">
            <Outlet />
          </div>
        </main>
      </div>

      <DashboardSidebar
        items={navItems}
        onLogout={() => setLogoutConfirmOpen(true)}
        isMobile
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <ConfirmActionModal
        show={logoutConfirmOpen}
        icon={
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M10 17l1.4-1.4L8.8 13H20v-2H8.8l2.6-2.6L10 7l-7 7 7 7zm11-14h-8v2h8v14h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
            />
          </svg>
        }
        title="Sign out?"
        subText="You will need to sign in again to access your dashboard."
        confirmText="Sign out"
        cancelText="Cancel"
        confirmVariant="danger"
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={() => {
          setLogoutConfirmOpen(false)
          logout()
        }}
      />
    </div>
  )
}
