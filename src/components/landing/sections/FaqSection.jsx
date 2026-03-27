import Accordion from 'react-bootstrap/Accordion'

export default function FaqSection() {
  return (
    <section id="faq" className="sv-landing-section">
      <div className="container py-5">
        <div className="sv-section-head sv-reveal" data-sv-reveal>
          <div className="sv-section-head__kicker">FAQ</div>
          <h2 className="sv-section-head__title">Answers up front</h2>
          <p className="sv-section-head__text">
            Servora is built around clarity and trust — here’s what to expect.
          </p>
        </div>

        <div className="sv-reveal sv-reveal--delay-1" data-sv-reveal>
          <Accordion className="sv-faq" defaultActiveKey="0" flush>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Is Servora for clients or professionals?</Accordion.Header>
              <Accordion.Body>
                Both. Clients can discover services and message professionals. Professionals can
                create profiles, list services, and upload portfolios to get hired.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>How do portfolios help?</Accordion.Header>
              <Accordion.Body>
                Portfolios show real work. They make it easier for clients to trust quality before
                hiring — and help professionals stand out.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>Can I message before hiring?</Accordion.Header>
              <Accordion.Body>
                Yes. In-app chat is part of the platform experience so details can be discussed
                before moving forward.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3">
              <Accordion.Header>Is location supported?</Accordion.Header>
              <Accordion.Body>
                The platform is built to be location-aware and map-ready. Location features will be
                integrated as the ecosystem grows.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="4">
              <Accordion.Header>Do professionals need verification?</Accordion.Header>
              <Accordion.Body>
                Verification will be introduced later. For now, the platform leans on profiles,
                portfolios, and clear service listings to build trust.
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
      </div>
    </section>
  )
}

