import { useEffect, useMemo, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { supabase } from '../../lib/supabaseClient.js'
import FullscreenMediaViewer from '../FullscreenMediaViewer.jsx'

const BUCKET = 'sv_services'
const PROFILES_BUCKET = 'user_profiles'

const formatNgn = (value) => {
  if (value === null || value === undefined || value === '') return null
  const asNumber = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(asNumber)) return null
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(asNumber)
}

export default function ServicePreviewModal({ show, onHide, service, professional }) {
  const navigate = useNavigate()
  const isLoggedIn = useSelector((s) => Boolean(s.auth.user))
  const currentUserId = useSelector((s) => s.auth.user?.id ?? '')
  const [imgUrls, setImgUrls] = useState([])
  const [providerImgUrl, setProviderImgUrl] = useState('')
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const isSelf = Boolean(currentUserId && professional?.user_id === currentUserId)

  const isActive = service?.is_active !== false
  const priceA = formatNgn(service?.starting_price)
  const priceB = formatNgn(service?.ending_price)
  const pricing =
    priceA && priceB ? `${priceA} – ${priceB}` : priceA ? `From ${priceA}` : priceB ? `Up to ${priceB}` : 'Pricing not set'

  useEffect(() => {
    let cancelled = false
    const paths = Array.isArray(service?.images) ? service.images : []
    const run = async () => {
      if (!supabase || paths.length === 0) {
        if (!cancelled) setImgUrls([])
        return
      }
      const next = []
      await Promise.all(
        paths.map(async (p) => {
          try {
            const { data } = await supabase.storage.from(BUCKET).createSignedUrl(p, 60 * 10)
            next.push(data?.signedUrl ?? '')
          } catch {
            const { data } = supabase.storage.from(BUCKET).getPublicUrl(p)
            next.push(data?.publicUrl ?? '')
          }
        }),
      )
      if (!cancelled) setImgUrls(next.filter(Boolean))
    }
    run()
    return () => {
      cancelled = true
    }
  }, [service?.images])

  useEffect(() => {
    let cancelled = false
    const path = professional?.profile_img
    const load = async () => {
      if (!path || !supabase) {
        setProviderImgUrl('')
        return
      }
      try {
        const { data } = await supabase.storage.from(PROFILES_BUCKET).createSignedUrl(path, 60 * 10)
        if (!cancelled) setProviderImgUrl(data?.signedUrl ?? '')
      } catch {
        const { data } = supabase.storage.from(PROFILES_BUCKET).getPublicUrl(path)
        if (!cancelled) setProviderImgUrl(data?.publicUrl ?? '')
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [professional?.profile_img])

  const thumbs = useMemo(() => imgUrls.slice(0, 10), [imgUrls])

  return (
    <Modal show={show} onHide={onHide} centered size="lg" contentClassName="sv-portfolio-modal">
      <div className="sv-portfolio-modal__head">
        <div className="sv-portfolio-modal__title">Service details</div>
        <button type="button" className="sv-portfolio-modal__close" onClick={onHide} aria-label="Close">
          ×
        </button>
      </div>

      <div className="sv-portfolio-modal__body">
        {service ? (
          <>
            <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <div className="sv-service-card__title">{service.title}</div>
              <div className={`sv-pill sv-pill--${isActive ? 'on' : 'off'}`}>{isActive ? 'Active' : 'Inactive'}</div>
            </div>

            <div className="sv-service-card__provider mt-2">
              {providerImgUrl ? (
                <img src={providerImgUrl} alt="" className="sv-service-card__provider-img" />
              ) : (
                <div className="sv-service-card__provider-placeholder" />
              )}
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <div className="sv-service-card__provider-name">{professional?.title || 'Professional'}</div>
                {isSelf ? <div className="sv-pill sv-pill--on">This is you</div> : null}
              </div>
            </div>

            <div className="sv-service-card__divider" />

            <div className="sv-service-card__meta">
              <div className="sv-service-card__meta-label">Pricing</div>
              <div className="sv-service-card__meta-value">{pricing}</div>
            </div>

            <div className="sv-service-card__divider" />

            <div className="mt-2">
              {service.description ? (
                <div className="sv-service-card__text">{service.description}</div>
              ) : (
                <div className="sv-service-card__text sv-service-card__text--muted">No description provided.</div>
              )}
            </div>

            {thumbs.length > 0 ? (
              <div className="mt-3">
                <div className="sv-portfolio-grid">
                  {thumbs.map((src, idx) => (
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
              </div>
            ) : null}

            <div className="d-flex gap-2 flex-wrap my-4">
              {isSelf ? (
                <div className="sv-pill sv-pill--on">This is you</div>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    if (isLoggedIn) {
                      navigate('/dashboard/messages')
                    } else {
                      navigate('/login', { state: { from: '/core' } })
                    }
                  }}
                >
                  Message
                </button>
              )}
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => navigate(`/pro/${professional?.id}`)}
              >
                View provider
              </button>
            </div>
          </>
        ) : null}
      </div>

      <FullscreenMediaViewer
        show={viewerOpen}
        onHide={() => setViewerOpen(false)}
        items={thumbs}
        startIndex={viewerIndex}
        title="Service media"
      />
    </Modal>
  )
}
