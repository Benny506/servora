import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import FullscreenMediaViewer from '../../../components/FullscreenMediaViewer.jsx'

export default function PlacePreviewModal({ show, onHide, place }) {
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)

  const images = Array.isArray(place?.images) ? place.images : []
  const tags = Array.isArray(place?.meta?.tags) ? place.meta.tags : []
  const hours = place?.hours && typeof place.hours === 'object' ? place.hours : null
  const location = place?.location
  const rating = place?.meta?.rating
  const isVerified = place?.meta?.is_verified === true
  const isFeatured = place?.meta?.is_featured === true

  return (
    <Modal show={show} onHide={onHide} centered size="lg" contentClassName="sv-portfolio-modal">
      <div className="sv-portfolio-modal__head">
        <div className="sv-portfolio-modal__title">Place details</div>
        <button type="button" className="sv-portfolio-modal__close" onClick={onHide} aria-label="Close">
          ×
        </button>
      </div>
      <div className="sv-portfolio-modal__body">
        {place ? (
          <>
            <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <div className="sv-place-card__title">{place.name}</div>
              <div className="d-flex gap-2 flex-wrap">
                {isFeatured ? <div className="sv-pill sv-pill--on">Featured</div> : null}
                {isVerified ? <div className="sv-pill sv-pill--on">Verified</div> : null}
              </div>
            </div>

            <div className="sv-service-card__divider" />

            <div className="sv-service-card__meta">
              <div className="sv-service-card__meta-label">Category</div>
              <div className="sv-service-card__meta-value">
                {String(place.category ?? '').replaceAll('_', ' ')}
                {place.subcategory ? ` • ${String(place.subcategory).replaceAll('_', ' ')}` : ''}
              </div>
            </div>

            <div className="sv-service-card__meta">
              <div className="sv-service-card__meta-label">Rating</div>
              <div className="sv-service-card__meta-value">{typeof rating === 'number' ? rating.toFixed(1) : '—'}</div>
            </div>

            {location ? (
              <div className="sv-service-card__meta">
                <div className="sv-service-card__meta-label">Location</div>
                <div className="sv-service-card__meta-value">
                  {[location.address, location.city, location.country].filter(Boolean).join(', ')}
                </div>
              </div>
            ) : null}

            {place?.contact?.phone ? (
              <div className="sv-service-card__meta">
                <div className="sv-service-card__meta-label">Phone</div>
                <div className="sv-service-card__meta-value">{place.contact.phone}</div>
              </div>
            ) : null}

            {hours ? (
              <>
                <div className="sv-service-card__divider" />
                <div className="sv-card__title mt-3">Hours</div>
                <div className="mt-2 d-grid gap-2">
                  {Object.entries(hours).map(([k, v]) => (
                    <div key={k} className="sv-service-card__meta" style={{ marginTop: 0 }}>
                      <div className="sv-service-card__meta-label">{String(k).replaceAll('_', ' ')}</div>
                      <div className="sv-service-card__meta-value">{String(v)}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {place.description ? (
              <>
                <div className="sv-service-card__divider" />
                <div className="sv-card__title mt-3">About</div>
                <div className="sv-card__text mt-2">{place.description}</div>
              </>
            ) : null}

            {tags.length > 0 ? (
              <>
                <div className="sv-service-card__divider" />
                <div className="sv-card__title mt-3">Tags</div>
                <div className="d-flex gap-2 flex-wrap mt-2">
                  {tags.slice(0, 12).map((t) => (
                    <div key={t} className="sv-pill">
                      {t}
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {images.length > 0 ? (
              <>
                <div className="sv-service-card__divider" />
                <div className="sv-card__title mt-3">Photos</div>
                <div className="sv-portfolio-grid mt-2">
                  {images.map((src, idx) => (
                    <div key={`${src}-${idx}`} className="sv-portfolio-thumb">
                      <img
                        src={src}
                        alt=""
                        className="sv-portfolio-thumb__img"
                        onClick={() => {
                          setViewerIndex(idx)
                          setViewerOpen(true)
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </>
        ) : null}
      </div>

      <FullscreenMediaViewer
        show={viewerOpen}
        onHide={() => setViewerOpen(false)}
        items={images}
        startIndex={viewerIndex}
        title="Place photos"
      />
    </Modal>
  )
}
