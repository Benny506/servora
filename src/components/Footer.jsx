export default function Footer() {
  return (
    <footer className="sv-footer">
      <div className="container py-4">
        <div className="sv-footer__inner">
          <div className="sv-footer__brand">Servora</div>
          <div className="sv-footer__text">
            A portfolio-backed marketplace for on-demand services.
          </div>
          <div className="sv-footer__meta">
            <span>Terms</span>
            <span className="sv-footer__dot" aria-hidden="true">
              •
            </span>
            <span>Privacy</span>
            <span className="sv-footer__dot" aria-hidden="true">
              •
            </span>
            <span>Contact</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

