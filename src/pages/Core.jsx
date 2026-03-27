import { useEffect, useMemo, useState } from 'react'
import { Offcanvas } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { bootstrapDiscovery } from '../store/discoverySlice.js'
import './dashboard/dashboard.css'
import { supabase } from '../lib/supabaseClient.js'
import Footer from '../components/Footer.jsx'
import ServicePreviewModal from '../components/services/ServicePreviewModal.jsx'
import CoreFiltersContent from './core/CoreFiltersContent.jsx'
import PlacesFiltersContent from './core/places/PlacesFiltersContent.jsx'
import PlacePreviewModal from './core/places/PlacePreviewModal.jsx'
import { places as seedPlaces } from './core/places/placesData.js'
import PlacesTab from './core/tabs/PlacesTab.jsx'
import ProfessionalsTab from './core/tabs/ProfessionalsTab.jsx'
import ServicesTab from './core/tabs/ServicesTab.jsx'
import logoIcon from '../assets/servora-logo-icon.png'

const normalizeTab = (t) => {
  if (t === 'services' || t === 'places' || t === 'professionals') return t
  return null
}

export default function Core() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isLoggedIn = useSelector((state) => Boolean(state.auth.user))
  const currentUserId = useSelector((state) => state.auth.user?.id ?? '')
  const status = useSelector((state) => state.discovery.status)
  const isRefreshing = useSelector((state) => state.discovery.isRefreshing)
  const services = useSelector((state) => state.discovery.services)
  const professionals = useSelector((state) => state.discovery.professionals)

  const urlTab = useMemo(() => {
    const p = new URLSearchParams(location.search)
    return normalizeTab(p.get('tab'))
  }, [location.search])

  const [tab, setTab] = useState(() => urlTab ?? 'professionals')
  const [query, setQuery] = useState('')
  const [address, setAddress] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [withMedia, setWithMedia] = useState(false)
  const [placeCategory, setPlaceCategory] = useState('')
  const [placeCity, setPlaceCity] = useState('')
  const [placePriceRange, setPlacePriceRange] = useState('')
  const [placeMinRating, setPlaceMinRating] = useState('')
  const [placeFeaturedOnly, setPlaceFeaturedOnly] = useState(false)
  const [placeVerifiedOnly, setPlaceVerifiedOnly] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [proImgUrls, setProImgUrls] = useState({})
  const [srvMediaUrls, setSrvMediaUrls] = useState({})

  useEffect(() => {
    if (status === 'idle') dispatch(bootstrapDiscovery())
  }, [dispatch, status])

  const proById = useMemo(() => {
    const map = new Map()
    for (const p of professionals ?? []) map.set(p.id, p)
    return map
  }, [professionals])

  const changeTab = (nextTab) => {
    setTab(nextTab)
    setSelectedService(null)
    setSelectedPlace(null)

    if (nextTab === 'professionals') {
      setMinPrice('')
      setMaxPrice('')
      setWithMedia(false)

      setPlaceCategory('')
      setPlaceCity('')
      setPlacePriceRange('')
      setPlaceMinRating('')
      setPlaceFeaturedOnly(false)
      setPlaceVerifiedOnly(false)
    }

    if (nextTab === 'services') {
      setAddress('')
      setVerifiedOnly(false)

      setPlaceCategory('')
      setPlaceCity('')
      setPlacePriceRange('')
      setPlaceMinRating('')
      setPlaceFeaturedOnly(false)
      setPlaceVerifiedOnly(false)
    }

    if (nextTab === 'places') {
      setAddress('')
      setVerifiedOnly(false)
      setMinPrice('')
      setMaxPrice('')
      setWithMedia(false)
    }
  }

  const servicesFiltered = useMemo(() => {
    if (tab !== 'services') return []
    const q = query.trim().toLowerCase()
    const min = minPrice === '' ? null : Number(minPrice)
    const max = maxPrice === '' ? null : Number(maxPrice)

    return (services ?? []).filter((s) => {
      if (withMedia) {
        const hasMedia = Array.isArray(s.images) && s.images.length > 0
        if (!hasMedia) return false
      }

      if (q) {
        const hay = `${s.title ?? ''} ${s.description ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }

      if (min !== null && !Number.isNaN(min)) {
        const start = s.starting_price
        const end = s.ending_price
        const comparable = start ?? end
        if (comparable === null || comparable === undefined) return false
        if (Number(comparable) < min) return false
      }

      if (max !== null && !Number.isNaN(max)) {
        const start = s.starting_price
        const end = s.ending_price
        const comparable = end ?? start
        if (comparable === null || comparable === undefined) return false
        if (Number(comparable) > max) return false
      }

      return true
    })
  }, [maxPrice, minPrice, query, services, tab, withMedia])

  const prosFiltered = useMemo(() => {
    if (tab !== 'professionals') return []
    const q = query.trim().toLowerCase()
    const addr = address.trim().toLowerCase()
    return (professionals ?? []).filter((p) => {
      if (verifiedOnly && !p.is_verified) return false
      if (q) {
        const hay = `${p.title ?? ''} ${p.bio ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (addr) {
        const loc = String(p.location_text ?? '').toLowerCase()
        if (!loc.includes(addr)) return false
      }
      return true
    })
  }, [address, professionals, query, tab, verifiedOnly])

  const placesFiltered = useMemo(() => {
    if (tab !== 'places') return []
    const q = query.trim().toLowerCase()
    const min = placeMinRating === '' ? null : Number(placeMinRating)
    return seedPlaces.filter((p) => {
      if (placeCategory && String(p?.category ?? '') !== placeCategory) return false
      if (placeCity && String(p?.location?.city ?? '') !== placeCity) return false
      if (placePriceRange && String(p?.meta?.price_range ?? '') !== placePriceRange) return false
      if (placeFeaturedOnly && p?.meta?.is_featured !== true) return false
      if (placeVerifiedOnly && p?.meta?.is_verified !== true) return false
      if (min !== null && !Number.isNaN(min)) {
        const r = p?.meta?.rating
        if (typeof r !== 'number') return false
        if (r < min) return false
      }
      if (q) {
        const tags = Array.isArray(p?.meta?.tags) ? p.meta.tags.join(' ') : ''
        const hay = `${p?.name ?? ''} ${p?.description ?? ''} ${p?.category ?? ''} ${p?.subcategory ?? ''} ${tags}`
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [
    placeCategory,
    placeCity,
    placeFeaturedOnly,
    placeMinRating,
    placePriceRange,
    placeVerifiedOnly,
    query,
    tab,
  ])

  const selectedPro = selectedService ? proById.get(selectedService.professional_id) : null
  useEffect(() => {
    let cancelled = false
    const paths = (professionals ?? [])
      .map((p) => p?.profile_img)
      .filter(Boolean)
      .slice(0, 200)
    const run = async () => {
      if (!supabase || paths.length === 0) {
        if (!cancelled) setProImgUrls({})
        return
      }
      const next = {}
      await Promise.all(
        paths.map(async (p) => {
          try {
            const { data } = await supabase.storage.from('user_profiles').createSignedUrl(p, 60 * 10)
            next[p] = data?.signedUrl ?? ''
          } catch {
            const { data } = supabase.storage.from('user_profiles').getPublicUrl(p)
            next[p] = data?.publicUrl ?? ''
          }
        }),
      )
      if (!cancelled) setProImgUrls(next)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [professionals])

  useEffect(() => {
    let cancelled = false
    const paths = Array.from(
      new Set(
        (servicesFiltered ?? [])
          .flatMap((s) => (Array.isArray(s?.images) ? s.images.slice(0, 5) : []))
          .filter(Boolean),
      ),
    ).slice(0, 200)
    const run = async () => {
      if (!supabase || paths.length === 0) {
        if (!cancelled) setSrvMediaUrls({})
        return
      }
      const next = {}
      await Promise.all(
        paths.map(async (p) => {
          try {
            const { data } = await supabase.storage.from('sv_services').createSignedUrl(p, 60 * 10)
            next[p] = data?.signedUrl ?? ''
          } catch {
            const { data } = supabase.storage.from('sv_services').getPublicUrl(p)
            next[p] = data?.publicUrl ?? ''
          }
        }),
      )
      if (!cancelled) setSrvMediaUrls(next)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [servicesFiltered])
  return (
    <div className="sv-core">
      <div className="sv-core__top">
        <div className="container py-3">
          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
            <div className="d-flex align-items-center gap-2">
              <img src={logoIcon} width="32" height="32" alt="Servora" />
              <div>
                <div className="sv-core__kicker">Marketplace</div>
                <div className="sv-core__title d-none d-lg-block">Find pros & services</div>
              </div>
            </div>

            <div className="d-none d-lg-flex align-items-center gap-2">
              {isRefreshing ? <div className="sv-refresh-pill">Refreshing</div> : null}
              <button type="button" className="btn btn-outline-primary" onClick={() => navigate('/')}>
                Landing
              </button>
              {isLoggedIn ? (
                <button type="button" className="btn btn-outline-primary" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={() => navigate('/login')}>
                  Sign in
                </button>
              )}
            </div>

            <div className="d-flex d-lg-none">
              <button
                type="button"
                className="btn btn-outline-primary"
                aria-label="Open menu"
                onClick={() => setMobileNavOpen(true)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                  <path fill="currentColor" d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-2 d-flex gap-2 d-lg-none">
            <button type="button" className="btn btn-outline-primary" onClick={() => setFiltersOpen(true)}>
              Filters
            </button>
          </div>
        </div>
      </div>

      <Offcanvas
        placement="start"
        show={mobileNavOpen}
        onHide={() => setMobileNavOpen(false)}
        className="sv-core-offcanvas"
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="sv-core-offcanvas__title">Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="d-grid gap-2">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => {
                changeTab('professionals')
                setMobileNavOpen(false)
              }}
            >
              Professionals
            </button>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => {
                changeTab('services')
                setMobileNavOpen(false)
              }}
            >
              Services
            </button>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => {
                changeTab('places')
                setMobileNavOpen(false)
              }}
            >
              Places
            </button>
            {isLoggedIn ? (
              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={() => {
                  setMobileNavOpen(false)
                  navigate('/dashboard')
                }}
              >
                Dashboard
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={() => {
                  setMobileNavOpen(false)
                  navigate('/login')
                }}
              >
                Sign in
              </button>
            )}

            <button
              type="button"
              className="btn btn-outline-primary mt-2"
              onClick={() => {
                setMobileNavOpen(false)
                navigate('/')
              }}
            >
              Landing page
            </button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      <main className="container py-4">
        <div className="row g-3 g-lg-4">
          <div className="col-lg-3 d-none d-lg-block">
            <div className="sv-core-aside">
              <div className="sv-core-aside__inner">
                {tab === 'places' ? (
                  <PlacesFiltersContent
                    query={query}
                    setQuery={setQuery}
                    category={placeCategory}
                    setCategory={setPlaceCategory}
                    city={placeCity}
                    setCity={setPlaceCity}
                    priceRange={placePriceRange}
                    setPriceRange={setPlacePriceRange}
                    minRating={placeMinRating}
                    setMinRating={setPlaceMinRating}
                    featuredOnly={placeFeaturedOnly}
                    setFeaturedOnly={setPlaceFeaturedOnly}
                    verifiedOnly={placeVerifiedOnly}
                    setVerifiedOnly={setPlaceVerifiedOnly}
                    onClear={() => {
                      setQuery('')
                      setPlaceCategory('')
                      setPlaceCity('')
                      setPlacePriceRange('')
                      setPlaceMinRating('')
                      setPlaceFeaturedOnly(false)
                      setPlaceVerifiedOnly(false)
                    }}
                  />
                ) : (
                  <CoreFiltersContent
                    mode={tab}
                    query={query}
                    setQuery={setQuery}
                    address={address}
                    setAddress={setAddress}
                    verifiedOnly={verifiedOnly}
                    setVerifiedOnly={setVerifiedOnly}
                    minPrice={minPrice}
                    setMinPrice={setMinPrice}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    withMedia={withMedia}
                    setWithMedia={setWithMedia}
                    onClear={() => {
                      setQuery('')
                      setAddress('')
                      setMinPrice('')
                      setMaxPrice('')
                      setVerifiedOnly(false)
                      setWithMedia(false)
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-9">
            {status === 'loading' && (services?.length ?? 0) === 0 && (professionals?.length ?? 0) === 0 ? (
              <div className="sv-card">
                <div className="sv-card__title">Loading marketplace…</div>
                <div className="sv-card__text">Fetching services and professionals.</div>
              </div>
            ) : null}

            <div className="sv-core-tabs mb-2">
              <button
                type="button"
                className={`sv-core-tab${tab === 'professionals' ? ' sv-core-tab--active' : ''}`}
                onClick={() => changeTab('professionals')}
              >
                Professionals
              </button>
              <button
                type="button"
                className={`sv-core-tab${tab === 'services' ? ' sv-core-tab--active' : ''}`}
                onClick={() => changeTab('services')}
              >
                Services
              </button>
              <button
                type="button"
                className={`sv-core-tab${tab === 'places' ? ' sv-core-tab--active' : ''}`}
                onClick={() => changeTab('places')}
              >
                Places
              </button>
            </div>

            {tab === 'professionals' ? (
              <ProfessionalsTab pros={prosFiltered} proImgUrls={proImgUrls} isLoggedIn={isLoggedIn} navigate={navigate} />
            ) : null}

            {tab === 'services' ? (
              <ServicesTab
                services={servicesFiltered}
                proById={proById}
                srvMediaUrls={srvMediaUrls}
                proImgUrls={proImgUrls}
                onSelect={(s) => setSelectedService(s)}
                currentUserId={currentUserId}
                isRefreshing={isRefreshing}
              />
            ) : null}

            {tab === 'places' ? (
              <PlacesTab places={placesFiltered} onSelect={(p) => setSelectedPlace(p)} />
            ) : null}
          </div>
        </div>
      </main>

      <Offcanvas
        placement="end"
        show={filtersOpen}
        onHide={() => setFiltersOpen(false)}
        className="sv-core-offcanvas"
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="sv-core-offcanvas__title">Search & Filters</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {tab === 'places' ? (
            <PlacesFiltersContent
              query={query}
              setQuery={setQuery}
              category={placeCategory}
              setCategory={setPlaceCategory}
              city={placeCity}
              setCity={setPlaceCity}
              priceRange={placePriceRange}
              setPriceRange={setPlacePriceRange}
              minRating={placeMinRating}
              setMinRating={setPlaceMinRating}
              featuredOnly={placeFeaturedOnly}
              setFeaturedOnly={setPlaceFeaturedOnly}
              verifiedOnly={placeVerifiedOnly}
              setVerifiedOnly={setPlaceVerifiedOnly}
              onClear={() => {
                setQuery('')
                setPlaceCategory('')
                setPlaceCity('')
                setPlacePriceRange('')
                setPlaceMinRating('')
                setPlaceFeaturedOnly(false)
                setPlaceVerifiedOnly(false)
              }}
              showApply
              onApply={() => setFiltersOpen(false)}
            />
          ) : (
            <CoreFiltersContent
              mode={tab}
              query={query}
              setQuery={setQuery}
              address={address}
              setAddress={setAddress}
              verifiedOnly={verifiedOnly}
              setVerifiedOnly={setVerifiedOnly}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              withMedia={withMedia}
              setWithMedia={setWithMedia}
              onClear={() => {
                setQuery('')
                setAddress('')
                setMinPrice('')
                setMaxPrice('')
                setVerifiedOnly(false)
                setWithMedia(false)
              }}
              showApply
              onApply={() => setFiltersOpen(false)}
            />
          )}
        </Offcanvas.Body>
      </Offcanvas>

      <ServicePreviewModal
        show={Boolean(selectedService)}
        onHide={() => setSelectedService(null)}
        professional={selectedPro}
        service={selectedService}
      />

      <PlacePreviewModal
        show={Boolean(selectedPlace)}
        onHide={() => setSelectedPlace(null)}
        place={selectedPlace}
      />
      
      <Footer />
    </div>
  )
}
