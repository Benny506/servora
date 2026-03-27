export default function HowItWorksSection() {
  return (
    <section id="how" className="sv-landing-section">
      <div className="container py-5">
        <div className="sv-section-head sv-reveal" data-sv-reveal>
          <div className="sv-section-head__kicker">How it works</div>
          <h2 className="sv-section-head__title">Simple, fast, and portfolio-first</h2>
          <p className="sv-section-head__text">
            Everything is designed around clarity — profiles, services, and real work.
          </p>
        </div>

        <div className="row g-3 g-md-4 mt-1">
          <div className="col-12 col-md-4">
            <div className="sv-step sv-reveal sv-reveal--delay-1" data-sv-reveal>
              <div className="sv-step__num">01</div>
              <div className="sv-step__title">Discover services</div>
              <div className="sv-step__text">
                Browse what you need and find the right person for the job.
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="sv-step sv-reveal sv-reveal--delay-2" data-sv-reveal>
              <div className="sv-step__num">02</div>
              <div className="sv-step__title">Check portfolios</div>
              <div className="sv-step__text">
                Review real examples, services, and details before you decide.
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="sv-step sv-reveal sv-reveal--delay-3" data-sv-reveal>
              <div className="sv-step__num">03</div>
              <div className="sv-step__title">Message and hire</div>
              <div className="sv-step__text">
                Chat in-app to confirm requirements, then proceed with confidence.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

