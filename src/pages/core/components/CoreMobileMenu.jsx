import React from 'react'
import { Offcanvas } from 'react-bootstrap'
import InstallToHomeScreenButton from '../../../components/pwa/InstallToHomeScreenButton.jsx'

export default function CoreMobileMenu({
  mobileNavOpen,
  setMobileNavOpen,
  isLoggedIn,
  navigate,
  changeTab,
}) {
  return (
    <Offcanvas
      placement="start"
      show={mobileNavOpen}
      onHide={() => setMobileNavOpen(false)}
      className="sv-core-offcanvas"
    >
      <Offcanvas.Header closeButton closeVariant="white">
        <Offcanvas.Title className="sv-core-offcanvas__title">Menu</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="d-grid gap-2">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => {
              changeTab('professionals')
              setMobileNavOpen(false)
            }}
          >
            Professionals
          </button>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => {
              changeTab('services')
              setMobileNavOpen(false)
            }}
          >
            Services
          </button>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => {
              changeTab('places')
              setMobileNavOpen(false)
            }}
          >
            Places
          </button>
          {isLoggedIn ? (
            <button
              type="button"
              className="btn btn-primary mt-2"
              onClick={() => {
                setMobileNavOpen(false)
                navigate('/dashboard')
              }}
            >
              Dashboard
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary mt-2"
              onClick={() => {
                setMobileNavOpen(false)
                navigate('/login')
              }}
            >
              Sign in
            </button>
          )}

          <button
            type="button"
            className="btn btn-outline-primary mt-2"
            onClick={() => {
              setMobileNavOpen(false)
              navigate('/')
            }}
          >
            Landing page
          </button>

          <InstallToHomeScreenButton className="btn btn-outline-primary mt-2" label="Install" fullWidth />
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  )
}
