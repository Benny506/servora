import logoIcon from '../../../assets/servora-logo-icon.png'

export default function DashboardTopBar({ userEmail, onOpenMobileNav }) {
  return (
    <header className="sv-dashboard__top">
      <div className="sv-dashboard__top-inner">
        <button
          type="button"
          className="sv-dashboard__burger"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
        >
          <span />
          <span />
          <span />
        </button>

        <div className="sv-dashboard__top-title">
          <img
            src={logoIcon}
            width="28"
            height="28"
            className="sv-dashboard__top-icon"
            alt=""
          />
          <span>Dashboard</span>
        </div>

        <div className="sv-dashboard__top-meta">
          <div className="sv-dashboard__user-pill">{userEmail || 'Signed in'}</div>
        </div>
      </div>
    </header>
  )
}

