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

function App() {
  const dispatch = useDispatch()
  const bootstrapStatus = useSelector((state) => state.auth.bootstrapStatus)

  useEffect(() => {
    dispatch(authBootstrap({ source: 'auto' }))
    dispatch(bootstrapDiscovery())
  }, [dispatch])

  if (bootstrapStatus === 'loading') {
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
