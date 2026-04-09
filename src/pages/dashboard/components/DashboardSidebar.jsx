import { Offcanvas } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import logoIcon from '../../../assets/servora-logo-icon.png'
import InstallToHomeScreenButton from '../../../components/pwa/InstallToHomeScreenButton.jsx'

export default function DashboardSidebar({
  items,
  onLogout,
  isMobile = false,
  isOpen = false,
  onClose,
}) {
  if (isMobile) {
    return (
      <Offcanvas
        placement="start"
        show={isOpen}
        onHide={onClose}
        className="sv-dashboard__offcanvas"
      >
        <Offcanvas.Header closeButton closeVariant="white" className="sv-dashboard__offcanvas-head">
          <Offcanvas.Title className="sv-dashboard__brand">
            <img
              src={logoIcon}
              width="34"
              height="34"
              className="sv-dashboard__brand-icon"
              alt="Servora"
            />
            <span className="sv-dashboard__brand-text">Servora</span>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="sv-dashboard__offcanvas-body">
          <div className="sv-dashboard__nav">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `sv-dashboard__nav-link${isActive ? ' sv-dashboard__nav-link--active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="sv-dashboard__nav-footer">
            <InstallToHomeScreenButton className="btn btn-outline-primary w-100" label="Install" />
            <button type="button" className="sv-dashboard__logout" onClick={onLogout}>
              Logout
            </button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    )
  }

  return (
    <aside className="sv-dashboard__left">
      <div className="sv-dashboard__left-inner">
        <div className="sv-dashboard__brand">
          <img
            src={logoIcon}
            width="34"
            height="34"
            className="sv-dashboard__brand-icon"
            alt="Servora"
          />
          <span className="sv-dashboard__brand-text">Servora</span>
        </div>

        <div className="sv-dashboard__nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `sv-dashboard__nav-link${isActive ? ' sv-dashboard__nav-link--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="sv-dashboard__nav-footer">
          <InstallToHomeScreenButton className="btn btn-outline-primary w-100" label="Install" />
          <button type="button" className="sv-dashboard__logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
