import React from 'react'
import { useSelector } from 'react-redux'
import InstallToHomeScreenButton from '../../../components/pwa/InstallToHomeScreenButton.jsx'

export default function CoreHeader({
  logoIcon,
  isRefreshing,
  isLoggedIn,
  navigate,
  setMobileNavOpen,
  setFiltersOpen,
  viewMode,
  setViewMode
}) {
  const isAdminAuthenticated = useSelector((state) => state.admin.isAdminAuthenticated)

  const handleDashboardClick = () => {
    if (isAdminAuthenticated) {
      navigate('/admin/dashboard')
    } else {
      navigate('/dashboard')
    }
  }
  return (
    <div className="sv-core__top">
      <div className="container py-3">
        <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <div className="d-flex align-items-center gap-2">
            <img src={logoIcon} width="32" height="32" alt="Servora" />
            <div>
              <div className="sv-core__kicker">Marketplace</div>
              <div className="sv-core__title d-none d-lg-block">Find pros & services</div>
            </div>
          </div>

          <div className="d-none d-lg-flex align-items-center gap-3">
            <div className="btn-group sv-btn-group shadow-sm border border-white-10 rounded-3 overflow-hidden">
              <button
                className={`btn btn-sm px-3 ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('list')}
                style={{ fontSize: '0.75rem', fontWeight: 700 }}
              >
                List
              </button>
              <button
                className={`btn btn-sm px-3 ${viewMode === 'map' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('map')}
                style={{ fontSize: '0.75rem', fontWeight: 700 }}
              >
                Map View
              </button>
            </div>

            {isRefreshing ? <div className="sv-refresh-pill">Refreshing</div> : null}
            <button type="button" className="btn btn-outline-primary" onClick={() => navigate('/')}>
              Landing
            </button>
            <InstallToHomeScreenButton className="btn btn-outline-primary" label="Install" />
            {isLoggedIn || isAdminAuthenticated ? (
              <button type="button" className="btn btn-outline-primary" onClick={handleDashboardClick}>
                Dashboard
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => navigate('/login')}>
                Sign in
              </button>
            )}
          </div>

          <div className="d-flex d-lg-none">
            <button
              type="button"
              className="btn btn-outline-primary"
              aria-label="Open menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                <path fill="currentColor" d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-3 d-flex align-items-center gap-2 d-lg-none">
          <button type="button" className="btn btn-outline-primary flex-grow-1 py-2" onClick={() => setFiltersOpen(true)} style={{ fontWeight: 700 }}>
            <i className="bi bi-filter me-1"></i> Filters
          </button>
          <div className="btn-group sv-btn-group shadow-sm border border-white-10 rounded-3 overflow-hidden flex-grow-1">
            <button
              className={`btn btn-sm py-2 ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('list')}
              style={{ fontSize: '0.75rem', fontWeight: 800 }}
            >
              List
            </button>
            <button
              className={`btn btn-sm py-2 ${viewMode === 'map' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('map')}
              style={{ fontSize: '0.75rem', fontWeight: 800 }}
            >
              Map View
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
