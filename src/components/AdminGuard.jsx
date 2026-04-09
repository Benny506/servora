import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

export default function AdminGuard({ children }) {
  const isAdminAuthenticated = useSelector((state) => state.admin.isAdminAuthenticated)
  const user = useSelector((state) => state.auth.user)
  const location = useLocation()

  if (user) {
    // Redirect standard user to their dashboard if they try to access admin
    return <Navigate to="/dashboard" replace />
  }

  if (!isAdminAuthenticated) {
    // Redirect to admin login, but save the current location they were trying to access
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}
