import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import ServiceCard from '../../../components/services/ServiceCard.jsx'
import ServiceInfoModal from '../../../components/services/ServiceInfoModal.jsx'
import { supabase } from '../../../lib/supabaseClient.js'
import NoProfessionalProfileCard from '../components/NoProfessionalProfileCard.jsx'

const BUCKET = 'sv_services'

export default function Services() {
  const professionalProfile = useSelector((state) => state.auth.professionalProfile)
  const services = useSelector((state) => state.auth.services)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [mediaUrls, setMediaUrls] = useState({})

  const items = useMemo(() => services ?? [], [services])

  useEffect(() => {
    let cancelled = false
    const paths = Array.from(
      new Set(
        items
          .flatMap((s) => (Array.isArray(s?.images) ? s.images.slice(0, 5) : []))
          .filter(Boolean),
      ),
    ).slice(0, 160)

    const run = async () => {
      if (!supabase || paths.length === 0) {
        if (!cancelled) setMediaUrls({})
        return
      }
      const next = {}
      await Promise.all(
        paths.map(async (path) => {
          try {
            const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 10)
            next[path] = data?.signedUrl ?? ''
          } catch {
            const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
            next[path] = data?.publicUrl ?? ''
          }
        }),
      )
      if (!cancelled) setMediaUrls(next)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [items])

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (s) => {
    setEditing(s)
    setModalOpen(true)
  }

  if (!professionalProfile) {
    return (
      <div>
        <div className="sv-page-head">
          <div className="sv-page-head__kicker">Work</div>
          <h1 className="sv-page-head__title">Services</h1>
          <p className="sv-page-head__text">Create a professional profile before adding services.</p>
        </div>
        <NoProfessionalProfileCard />
      </div>
    )
  }

  const hasServices = items.length > 0

  return (
    <div>
      <div className="sv-page-head">
        <div className="sv-page-head__kicker">Work</div>
        <h1 className="sv-page-head__title">Services</h1>
        <p className="sv-page-head__text">
          Create service listings to help clients quickly understand what you offer.
        </p>
      </div>

      {!hasServices ? (
        <div className="sv-card">
          <div className="sv-card__title">No services yet</div>
          <div className="sv-card__text">
            Add a service to describe what you offer. You can upload up to 10 media files per service (optional).
          </div>
          <div className="mt-3 d-flex gap-2 flex-wrap">
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              Add service
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <div className="text-secondary fw-semibold">Your services</div>
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              Add service
            </button>
          </div>

          <div className="row g-3 g-md-4 mt-1">
            {items.map((s) => {
              const images = Array.isArray(s?.images) ? s.images : []
              const cover = images[0]
              const coverUrl = cover ? mediaUrls[cover] : ''
              const thumbUrls = images
                .slice(1, 5)
                .map((p) => mediaUrls[p])
                .filter(Boolean)

              return (
                <div key={s.id} className="col-12 col-md-6 col-lg-4">
                  <ServiceCard
                    service={s}
                    coverUrl={coverUrl}
                    thumbUrls={thumbUrls}
                    onClick={() => openEdit(s)}
                  />
                </div>
              )
            })}
          </div>
        </>
      )}

      <ServiceInfoModal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        professionalProfile={professionalProfile}
        service={editing}
      />
    </div>
  )
}
