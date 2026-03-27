import { useState } from 'react'
import { Carousel, Modal } from 'react-bootstrap'

export default function FullscreenMediaViewer({ show, onHide, items = [], startIndex = 0, title = 'Media' }) {
  const [active, setActive] = useState(0)

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      fullscreen
      contentClassName="sv-portfolio-modal"
      onEnter={() => setActive(startIndex || 0)}
    >
      <div className="sv-portfolio-modal__head">
        <div className="sv-portfolio-modal__title">{title}</div>
        <button type="button" className="sv-portfolio-modal__close" onClick={onHide} aria-label="Close">
          ×
        </button>
      </div>
      <div className="sv-portfolio-modal__body">
        <Carousel activeIndex={active} onSelect={setActive} interval={null}>
          {items.map((src, idx) => (
            <Carousel.Item key={`${src}-${idx}`}>
              <div
                style={{
                  width: '100%',
                  minHeight: '60vh',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(11, 21, 16, 0.35)',
                  borderRadius: 12,
                }}
              >
                {src ? (
                  <img
                    src={src}
                    alt=""
                    style={{ maxWidth: '100%', maxHeight: '78vh', objectFit: 'contain', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '60vh' }} />
                )}
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>
    </Modal>
  )
}
