export default function AudienceSplitSection({ onClientCta, onProCta }) {
  return (
    <section id="paths" className="sv-landing-section">
      <div className="container py-5">
        <div className="sv-section-head sv-reveal" data-sv-reveal>
          <div className="sv-section-head__kicker">Two paths, one platform</div>
          <h2 className="sv-section-head__title">Built for clients and professionals</h2>
          <p className="sv-section-head__text">
            Whether you’re hiring or getting hired, Servora keeps everything clear and organized.
          </p>
        </div>

        <div className="row g-3 g-md-4 mt-1">
          <div className="col-12 col-lg-6">
            <div className="sv-split sv-reveal sv-reveal--delay-1" data-sv-reveal>
              <div className="sv-split__tag">For clients</div>
              <div className="sv-split__title">Hire on the fly</div>
              <div className="sv-split__text">
                Find on-demand services, compare professionals, and message instantly — all in one
                place.
              </div>
              <button type="button" className="btn btn-outline-primary sv-split__btn" onClick={onClientCta}>
                Explore services
              </button>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="sv-split sv-reveal sv-reveal--delay-2" data-sv-reveal>
              <div className="sv-split__tag">For professionals</div>
              <div className="sv-split__title">Get hired with proof</div>
              <div className="sv-split__text">
                Create a profile, list services, and upload portfolios that show your quality —
                then get contacted directly.
              </div>
              <button type="button" className="btn btn-primary sv-split__btn" onClick={onProCta}>
                Explore professionals
              </button>
            </div>
          </div>
        </div>

        <div className="sv-landing-showcase sv-reveal sv-reveal--delay-3" data-sv-reveal>
          <div className="sv-showcase">
            <div className="sv-showcase__item">
              <div className="sv-showcase__title">Professional profile</div>
              <div className="sv-showcase__text">Title, bio, and location — presented cleanly.</div>
            </div>
            <div className="sv-showcase__item">
              <div className="sv-showcase__title">Services</div>
              <div className="sv-showcase__text">Clear offerings with descriptions and pricing.</div>
            </div>
            <div className="sv-showcase__item">
              <div className="sv-showcase__title">Portfolios</div>
              <div className="sv-showcase__text">Real work examples that build trust quickly.</div>
            </div>
            <div className="sv-showcase__item">
              <div className="sv-showcase__title">Messaging</div>
              <div className="sv-showcase__text">In-app chat to confirm details before hiring.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
