import { useMemo, useState } from 'react'
import { Button, Container, Nav, Navbar, Offcanvas } from 'react-bootstrap'
import logoIcon from '../../assets/servora-logo-icon.png'

export default function LandingNav({
  onSection,
  onPrimaryCta,
  onSecondaryCta,
  isLoggedIn = false,
}) {
  const [show, setShow] = useState(false)

  const items = useMemo(
    () => [
      { id: 'how', label: 'How it works' },
      { id: 'paths', label: 'For pros & clients' },
      { id: 'places', label: 'Places' },
      { id: 'faq', label: 'FAQ' },
    ],
    [],
  )

  const go = (id) => {
    setShow(false)
    onSection?.(id)
  }

  return (
    <Navbar expand="lg" className="sv-landing-nav" sticky="top">
      <Container className="py-2">
        <Navbar.Brand className="sv-landing-nav__brand" onClick={() => go('hero')}>
          <img
            src={logoIcon}
            width="34"
            height="34"
            className="sv-landing-nav__logo"
            alt="Servora"
          />
          <span className="sv-landing-nav__name">Servora</span>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="sv-landing-offcanvas"
          className="sv-landing-nav__toggle"
          onClick={() => setShow(true)}
        />

        <Navbar.Collapse className="d-none d-lg-flex">
          <Nav className="ms-auto align-items-lg-center gap-lg-3">
            {items.map((item) => (
              <Nav.Link key={item.id} className="sv-landing-nav__link" onClick={() => go(item.id)}>
                {item.label}
              </Nav.Link>
            ))}
            {isLoggedIn ? (
              <Button className="btn btn-primary sv-landing-nav__btn" onClick={onPrimaryCta}>
                Explore
              </Button>
            ) : (
              <>
                <Button className="btn btn-outline-primary sv-landing-nav__btn" onClick={onSecondaryCta}>
                  Sign in
                </Button>
                <Button className="btn btn-primary sv-landing-nav__btn" onClick={onPrimaryCta}>
                  Enter App
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>

        <Offcanvas
          id="sv-landing-offcanvas"
          placement="end"
          show={show}
          onHide={() => setShow(false)}
          className="sv-landing-offcanvas"
        >
          <Offcanvas.Header closeButton closeVariant="white">
            <Offcanvas.Title className="sv-landing-offcanvas__title">Servora</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <div className="d-grid gap-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="sv-landing-offcanvas__link"
                  onClick={() => go(item.id)}
                >
                  {item.label}
                </button>
              ))}
              <div className="sv-landing-offcanvas__divider" />
              {isLoggedIn ? (
                <Button className="btn btn-primary" onClick={() => (setShow(false), onPrimaryCta?.())}>
                  Explore
                </Button>
              ) : (
                <>
                  <Button className="btn btn-outline-primary" onClick={() => (setShow(false), onSecondaryCta?.())}>
                    Sign in
                  </Button>
                  <Button className="btn btn-primary" onClick={() => (setShow(false), onPrimaryCta?.())}>
                    Enter App
                  </Button>
                </>
              )}
            </div>
          </Offcanvas.Body>
        </Offcanvas>
      </Container>
    </Navbar>
  )
}
