export default function PlacesSection({ onCta }) {
  return (
    <section id="places" className="sv-landing-section">
      <div className="container py-5">
        <div className="sv-section-head sv-reveal" data-sv-reveal>
          <div className="sv-section-head__kicker">Explore places</div>
          <h2 className="sv-section-head__title">Find trusted places around you</h2>
          <p className="sv-section-head__text">
            From public services to parks, restaurants, and workspaces — browse verified places with
            photos, hours, and contact details.
          </p>
        </div>

        <div className="row g-3 g-md-4 mt-1">
          <div className="col-12 col-md-4">
            <div className="sv-step sv-reveal sv-reveal--delay-1" data-sv-reveal>
              <div className="sv-step__num">01</div>
              <div className="sv-step__title">Discover</div>
              <div className="sv-step__text">Browse curated places by category, city, or rating.</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="sv-step sv-reveal sv-reveal--delay-2" data-sv-reveal>
              <div className="sv-step__num">02</div>
              <div className="sv-step__title">Review</div>
              <div className="sv-step__text">See photos, hours, tags, and verification badges.</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="sv-step sv-reveal sv-reveal--delay-3" data-sv-reveal>
              <div className="sv-step__num">03</div>
              <div className="sv-step__title">Go</div>
              <div className="sv-step__text">Get the exact address and contact details when available.</div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-center mt-4">
          <button type="button" className="btn btn-primary sv-landing-nav__btn" onClick={onCta}>
            Explore places
          </button>
        </div>
      </div>
    </section>
  )
}
