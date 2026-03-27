import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import NoProfessionalProfileCard from '../components/NoProfessionalProfileCard.jsx'
import PortfolioCard from '../../../components/portfolio/PortfolioCard.jsx'
import PortfolioInfoModal from '../../../components/portfolio/PortfolioInfoModal.jsx'
import { supabase } from '../../../lib/supabaseClient.js'

const BUCKET = 'sv_portfolios'

export default function Portfolio() {
  const professionalProfile = useSelector((state) => state.auth.professionalProfile)
  const portfolios = useSelector((state) => state.auth.portfolios)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [coverUrls, setCoverUrls] = useState({})

  const items = useMemo(() => portfolios ?? [], [portfolios])

  useEffect(() => {
    let cancelled = false
    const paths = items
      .map((p) => p?.images?.[0])
      .filter(Boolean)
      .slice(0, 30)

    const run = async () => {
      if (!supabase || paths.length === 0) {
        if (!cancelled) setCoverUrls({})
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
      if (!cancelled) setCoverUrls(next)
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

  const openEdit = (p) => {
    setEditing(p)
    setModalOpen(true)
  }

  if (!professionalProfile) {
    return (
      <div>
        <div className="sv-page-head">
          <div className="sv-page-head__kicker">Work</div>
          <h1 className="sv-page-head__title">Portfolio</h1>
          <p className="sv-page-head__text">
            Create a professional profile before adding portfolios.
          </p>
        </div>
        <NoProfessionalProfileCard />
      </div>
    )
  }

  const hasPortfolios = items.length > 0

  return (
    <div>
      <div className="sv-page-head">
        <div className="sv-page-head__kicker">Work</div>
        <h1 className="sv-page-head__title">Portfolio</h1>
        <p className="sv-page-head__text">
          Upload and organize work samples to build trust.
        </p>
      </div>

      {!hasPortfolios ? (
        <div className="sv-card">
          <div className="sv-card__title">No portfolios yet</div>
          <div className="sv-card__text">
            Add a portfolio to showcase your work. You can upload up to 10 media files per portfolio.
          </div>
          <div className="mt-3 d-flex gap-2 flex-wrap">
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              Add portfolio
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <div className="text-secondary fw-semibold">Your portfolios</div>
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              Add portfolio
            </button>
          </div>

          <div className="row g-3 g-md-4 mt-1">
            {items.map((p) => {
              const cover = p?.images?.[0]
              const coverUrl = cover ? coverUrls[cover] : ''
              const count = Array.isArray(p?.images) ? p.images.length : 0

              return (
                <div key={p.id} className="col-12 col-md-6 col-lg-4">
                  <PortfolioCard
                    portfolio={p}
                    coverUrl={coverUrl}
                    mediaCount={count}
                    onClick={() => openEdit(p)}
                  />
                </div>
              )
            })}
          </div>
        </>
      )}

      <PortfolioInfoModal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        professionalProfile={professionalProfile}
        portfolio={editing}
      />
    </div>
  )
}
