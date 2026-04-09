import AppLoader from './components/AppLoader.jsx'
import GlobalAlerts from './components/GlobalAlerts.jsx'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import LandingPage from './pages/landing/LandingPage.jsx'
import Login from './pages/Login.jsx'
import Core from './pages/Core.jsx'
import ProfessionalProfileCreate from './pages/ProfessionalProfileCreate.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import SignUp from './pages/SignUp.jsx'
import VerifyOtp from './pages/VerifyOtp.jsx'
import DashboardLayout from './pages/dashboard/DashboardLayout.jsx'
import DashboardHome from './pages/dashboard/sections/DashboardHome.jsx'
import SingleProfessional from './pages/SingleProfessional.jsx'
import Messages from './pages/dashboard/sections/Messages.jsx'
import Portfolio from './pages/dashboard/sections/Portfolio.jsx'
import ProfessionalProfile from './pages/dashboard/sections/ProfessionalProfile.jsx'
import Services from './pages/dashboard/sections/Services.jsx'
import Security from './pages/dashboard/sections/Security.jsx'
import { authBootstrap } from './store/authSlice.js'
import { bootstrapDiscovery } from './store/discoverySlice.js'

// Admin Citadel
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminOverview from './pages/admin/AdminOverview.jsx'
import AdminGuard from './components/AdminGuard.jsx'

function App() {
  const dispatch = useDispatch()
  const bootstrapStatus = useSelector((state) => state.auth.bootstrapStatus)

  useEffect(() => {
    // Admin Citadel Mutual Exclusion Handshake
    const adminSession = localStorage.getItem('servora_admin_session')
    if (adminSession) {
      // Purge student/professional traces if Admin is active
      const purge = async () => {
        try {
          // Silent sign out from Supabase if active
          const { data } = await supabase.auth.getSession()
          if (data?.session) {
            await supabase.auth.signOut()
            import('./store/authSlice.js').then(m => dispatch(m.clearAuth()))
          }
        } catch (e) {
          console.error("Citadel Handshake Error:", e)
        }
      }
      purge()
    }

    dispatch(authBootstrap({ source: 'auto' }))
    dispatch(bootstrapDiscovery())
  }, [dispatch])

  if (bootstrapStatus === 'loading' && !localStorage.getItem('servora_admin_session')) {
    return <AppLoader />
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/core" element={<Core />} />
        <Route path="/pro/:id" element={<SingleProfessional />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/professional-profile" element={<ProfessionalProfileCreate />} />
        
        {/* Admin Citadel */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminGuard>
              <AdminOverview />
            </AdminGuard>
          } 
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="professional-profile" element={<ProfessionalProfile />} />
          <Route path="messages" element={<Messages />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="services" element={<Services />} />
          <Route path="security" element={<Security />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <GlobalAlerts />
      <AppLoader />
    </>
  )
}

export default App
