import logoFull from '../../../assets/servora-logo.png'

export default function HeroSection({ onPrimaryCta, onSecondaryCta }) {
  return (
    <section id="hero" className="sv-landing-section sv-landing-hero">
      <div className="container py-5">
        <div className="row align-items-center g-4">
          <div className="col-12 col-lg-6">
            <div className="sv-reveal sv-reveal--delay-1" data-sv-reveal>
              <div className="sv-landing-hero__eyebrow">On-demand services • Portfolio-backed</div>
              <h1 className="sv-landing-hero__title">
                Hire with confidence.
                <br />
                Get hired with proof.
              </h1>
              <p className="sv-landing-hero__subtitle">
                Servora helps clients find skilled professionals fast — and helps professionals
                showcase services and portfolios that build trust.
              </p>
              <div className="sv-landing-hero__cta">
                <button type="button" className="btn btn-primary sv-landing-cta__primary" onClick={onPrimaryCta}>
                  Enter App
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary sv-landing-cta__secondary"
                  onClick={onSecondaryCta}
                >
                  Create account
                </button>
              </div>
              <div className="sv-landing-hero__chips">
                <span className="sv-chip">Portfolios</span>
                <span className="sv-chip">Services</span>
                <span className="sv-chip">Messaging</span>
                <span className="sv-chip">Location-ready</span>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="sv-reveal sv-reveal--delay-2" data-sv-reveal>
              <div className="sv-landing-hero__card">
                <img src={logoFull} className="sv-landing-hero__logo" alt="Servora" />
                <div className="sv-landing-hero__card-text">
                  Build a professional profile, add your services, and upload portfolios — so people
                  know exactly who they’re hiring.
                </div>
              </div>
              <div className="sv-landing-hero__mini">
                <div className="sv-mini-card">
                  <div className="sv-mini-card__title">For clients</div>
                  <div className="sv-mini-card__text">Search, compare, chat, hire.</div>
                </div>
                <div className="sv-mini-card">
                  <div className="sv-mini-card__title">For professionals</div>
                  <div className="sv-mini-card__text">Show work, win trust, get booked.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

