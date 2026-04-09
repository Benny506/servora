import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { seedPros } from './core/professionals/prosData.js'
import { seedServices } from './core/services/servicesData.js'
import PortfolioCard from '../components/portfolio/PortfolioCard.jsx'
import ServiceCard from '../components/services/ServiceCard.jsx'
import Footer from '../components/Footer.jsx'
import logoIcon from '../assets/servora-logo-icon.png'
import { useMessaging } from '../hooks/useMessaging.js'

const BUCKET_PROFILES = 'user_profiles'
const BUCKET_PORTFOLIOS = 'sv_portfolios'
const BUCKET_SERVICES = 'sv_services'

const formatLocation = (p) => [p?.city, p?.state, p?.country].filter(Boolean).join(', ')

export default function SingleProfessional() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { initiateConversation } = useMessaging()
  const discoveryPros = useSelector((s) => s.discovery.professionals)
  const discoveryServices = useSelector((s) => s.discovery.services)
  const isLoggedIn = useSelector((s) => Boolean(s.auth.user))
  const currentUserId = useSelector((s) => s.auth.user?.id ?? '')

  const allPros = useMemo(() => [...discoveryPros, ...seedPros], [discoveryPros])
  const allServices = useMemo(() => [...discoveryServices, ...seedServices], [discoveryServices])

  const [professional, setProfessional] = useState(() => allPros.find((p) => p.id === id) || null)
  const [services, setServices] = useState(() => allServices.filter((s) => s.professional_id === id))
  const [portfolios, setPortfolios] = useState([])
  const [loading, setLoading] = useState(!professional)

  const [profileImgUrl, setProfileImgUrl] = useState('')
  const [portfolioCoverUrls, setPortfolioCoverUrls] = useState({})
  const [serviceMediaUrls, setServiceMediaUrls] = useState({})

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!supabase) return
      try {
        if (!professional) {
          // Check if it's a seed pro first
          const sp = seedPros.find(p => p.id === id)
          if (sp) {
            setProfessional(sp)
            setServices(seedServices.filter(s => s.professional_id === id))
          } else {
            setLoading(true)
            const { data, error } = await supabase.from('sv_professional_profiles').select('*').eq('id', id).maybeSingle()
            if (error) throw error
            if (cancelled) return
            setProfessional(data ?? null)
          }
        }
        if (services.length === 0 && !professional?.is_seed) {
          const { data, error } = await supabase
            .from('sv_services')
            .select('*')
            .eq('professional_id', id)
            .order('created_at', { ascending: false })
          if (error) throw error
          if (cancelled) return
          setServices(data ?? [])
        }

        if (!professional?.is_seed) {
          const { data: pfData, error: pfErr } = await supabase
            .from('sv_portfolios')
            .select('*')
            .eq('professional_id', id)
            .order('created_at', { ascending: false })
          if (pfErr) throw pfErr
          if (cancelled) return
          setPortfolios(pfData ?? [])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [id, professional, services.length])

  useEffect(() => {
    let cancelled = false
    const path = professional?.profile_img
    const load = async () => {
      if (!path) {
        setProfileImgUrl('')
        return
      }
      if (path.startsWith('http')) {
        setProfileImgUrl(path)
        return
      }
      if (!supabase) return
      try {
        const { data } = await supabase.storage.from(BUCKET_PROFILES).createSignedUrl(path, 60 * 10)
        if (!cancelled) setProfileImgUrl(data?.signedUrl ?? '')
      } catch {
        const { data } = supabase.storage.from(BUCKET_PROFILES).getPublicUrl(path)
        if (!cancelled) setProfileImgUrl(data?.publicUrl ?? '')
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [professional?.profile_img])

  useEffect(() => {
    let cancelled = false
    const covers = portfolios.map((p) => p?.images?.[0]).filter(Boolean).slice(0, 200)
    if (covers.length === 0) {
      setPortfolioCoverUrls({})
      return
    }
    const run = async () => {
      const next = {}
      await Promise.all(
        covers.map(async (p) => {
          if (p.startsWith('http')) {
            next[p] = p
            return
          }
          try {
            const { data } = await supabase.storage.from(BUCKET_PORTFOLIOS).createSignedUrl(p, 60 * 10)
            next[p] = data?.signedUrl ?? ''
          } catch {
            const { data } = supabase.storage.from(BUCKET_PORTFOLIOS).getPublicUrl(p)
            next[p] = data?.publicUrl ?? ''
          }
        }),
      )
      if (!cancelled) setPortfolioCoverUrls(next)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [portfolios])

  useEffect(() => {
    let cancelled = false
    const paths = Array.from(
      new Set(
        (services ?? [])
          .flatMap((s) => (Array.isArray(s?.images) ? s.images.slice(0, 5) : []))
          .filter(Boolean),
      ),
    ).slice(0, 200)
    if (paths.length === 0) {
      setServiceMediaUrls({})
      return
    }
    const run = async () => {
      const next = {}
      const hasSupabase = Boolean(supabase)
      await Promise.all(
        paths.map(async (p) => {
          if (p.startsWith('http')) {
            next[p] = p
            return
          }
          if (!hasSupabase) return
          try {
            const { data } = await supabase.storage.from(BUCKET_SERVICES).createSignedUrl(p, 60 * 10)
            next[p] = data?.signedUrl ?? ''
          } catch {
            const { data } = supabase.storage.from(BUCKET_SERVICES).getPublicUrl(p)
            next[p] = data?.publicUrl ?? ''
          }
        }),
      )
      if (!cancelled) setServiceMediaUrls(next)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [services])

  const pro = professional
  const location = useMemo(() => (pro ? formatLocation(pro) : ''), [pro])
  const isVerified = pro?.is_verified === true
  const isSelf = Boolean(currentUserId && pro?.user_id === currentUserId)
  const isSeed = pro?.is_seed === true
  const isAdminAuthenticated = useSelector((state) => state.admin.isAdminAuthenticated)

  const handleDashboardClick = () => {
    if (isAdminAuthenticated) {
      navigate('/admin/dashboard')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="sv-core">
      <div className="sv-core__top">
        <div className="container py-2">
          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
            <button
              type="button"
              className="sv-landing-nav__brand btn p-0"
              onClick={() => navigate('/core')}
              aria-label="Servora"
            >
              <img src={logoIcon} width="34" height="34" alt="Servora" className="sv-landing-nav__logo" />
              <span className="sv-landing-nav__name ms-2">Servora</span>
            </button>
            {isLoggedIn || isAdminAuthenticated ? (
              <button type="button" className="btn btn-primary" onClick={handleDashboardClick}>
                Dashboard
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => navigate('/signup')}>
                Sign up
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container py-3">
        <button type="button" className="btn btn-outline-primary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <main className="container pb-4">
        <div className="sv-card">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div>
              {profileImgUrl ? (
                <img src={profileImgUrl} alt="" className="sv-profile-preview" />
              ) : (
                <div className="sv-profile-preview" />
              )}
            </div>
            <div>
              <div className="sv-core__title">{pro?.title || 'Professional'}</div>
              <div className="mt-1">
                {isVerified ? <span className="sv-core-card__badge">Verified</span> : null}
                {location ? <span className="ms-2 text-secondary fw-semibold">{location}</span> : null}
                {pro?.phone_number ? <> <br /><span className="ms-2 text-secondary fw-semibold">{pro?.phone_number}</span></> : null}
              </div>
              <div className="d-flex gap-2 flex-wrap mt-3">
                {isSelf ? <div className="sv-pill sv-pill--on">This is you</div> : (
                  <>
                    <button type="button" className="btn btn-primary px-4" onClick={() => initiateConversation(pro?.user_id)}>
                      Message
                    </button>
                    {pro?.phone_number && (
                      <a
                        href={`tel:${pro.phone_number}`}
                        className="btn btn-emerald-glass px-4 d-flex align-items-center gap-2"
                        style={{ border: '1px solid #3fbf5a', color: '#3fbf5a', fontWeight: 'bold' }}
                      >
                        <i className="bi bi-telephone-fill"></i>
                        Call Now
                      </a>
                    )}
                  </>
                )}
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => {
                    const url = typeof window !== 'undefined' ? window.location.href : ''
                    navigator?.clipboard?.writeText?.(url)
                  }}
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="sv-card">
            <div className="sv-card__title">Loading profile…</div>
            <div className="sv-card__text">Fetching details, services and portfolios.</div>
          </div>
        ) : null}

        {pro?.bio ? (
          <div className="sv-card">
            <div className="sv-card__title">About</div>
            <div className="sv-card__text">{pro.bio}</div>
          </div>
        ) : null}

        <div className="sv-card">
          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
            <div className="sv-card__title">Services</div>
            <div className="text-secondary fw-semibold">{services.length}</div>
          </div>
          {services.length === 0 ? (
            <div className="sv-card__text">No services yet.</div>
          ) : (
            <div className="row g-3 g-md-4 mt-1">
              {services.map((s) => {
                const images = Array.isArray(s?.images) ? s.images : []
                const cover = images[0]
                const coverUrl = cover ? serviceMediaUrls[cover] : ''
                const thumbUrls = images.slice(1, 5).map((p) => serviceMediaUrls[p]).filter(Boolean)
                return (
                  <div key={s.id} className="col-12 col-md-6">
                    <ServiceCard service={s} coverUrl={coverUrl} thumbUrls={thumbUrls} onClick={() => { }} />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="sv-card">
          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
            <div className="sv-card__title">Portfolios</div>
            <div className="text-secondary fw-semibold">{portfolios.length}</div>
          </div>
          {portfolios.length === 0 ? (
            <div className="sv-card__text">No portfolios yet.</div>
          ) : (
            <div className="row g-3 g-md-4 mt-1">
              {portfolios.map((p) => {
                const cover = p?.images?.[0]
                const coverUrl = cover ? portfolioCoverUrls[cover] : ''
                const count = Array.isArray(p?.images) ? p.images.length : 0
                return (
                  <div key={p.id} className="col-12 col-md-6 col-lg-4">
                    <PortfolioCard
                      portfolio={p}
                      coverUrl={coverUrl}
                      mediaCount={count}
                      showOwnerIndicator={isSelf}
                      onClick={() => { }}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
