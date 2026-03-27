export default function FinalCtaSection({ onPrimaryCta, onSecondaryCta }) {
  return (
    <section id="cta" className="sv-landing-section sv-landing-final">
      <div className="container py-5">
        <div className="sv-final sv-reveal" data-sv-reveal>
          <div className="sv-final__title">Ready to explore Servora?</div>
          <div className="sv-final__text">
            Enter the app to discover services or start building a professional profile.
          </div>
          <div className="sv-final__cta">
            <button type="button" className="btn btn-primary sv-final__btn" onClick={onPrimaryCta}>
              Enter App
            </button>
            <button
              type="button"
              className="btn btn-outline-primary sv-final__btn"
              onClick={onSecondaryCta}
            >
              Create account
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

