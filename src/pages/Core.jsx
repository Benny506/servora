import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { bootstrapDiscovery } from '../store/discoverySlice.js'
import './dashboard/dashboard.css'
import { supabase } from '../lib/supabaseClient.js'
import Footer from '../components/Footer.jsx'
import ServicePreviewModal from '../components/services/ServicePreviewModal.jsx'
import PlacePreviewModal from './core/places/PlacePreviewModal.jsx'
import { places as seedPlaces } from './core/places/placesData.js'
import { seedPros } from './core/professionals/prosData.js'
import { seedServices } from './core/services/servicesData.js'
import logoIcon from '../assets/servora-logo-icon.png'

// Refactored Components
import CoreHeader from './core/components/CoreHeader.jsx'
import CoreMobileMenu from './core/components/CoreMobileMenu.jsx'
import CoreSidebar from './core/components/CoreSidebar.jsx'
import CoreDiscoveryTabs from './core/components/CoreDiscoveryTabs.jsx'
import CoreMainSection from './core/components/CoreMainSection.jsx'

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
  const professionals = useSelector((state) => state.discovery.professionals)
  const services = useSelector((state) => state.discovery.services)

  const urlTab = useMemo(() => {
    const p = new URLSearchParams(location.search)
    return normalizeTab(p.get('tab'))
  }, [location.search])

  // State initialization
  const [tab, setTab] = useState(() => urlTab ?? 'professionals')
  const [viewMode, setViewMode] = useState('list') // 'list' | 'map'
  const [query, setQuery] = useState('')
  const [address, setAddress] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [withMedia, setWithMedia] = useState(false)
  const [serviceCategory, setServiceCategory] = useState('')
  const [proIndustry, setProIndustry] = useState('')
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
  const [userLocation, setUserLocation] = useState(null)
  const [locationStatus, setLocationStatus] = useState('idle') // 'idle' | 'granted' | 'denied' | 'requesting'

  const synchronizeSpatialRadar = (force = false) => {
    if (!("geolocation" in navigator)) {
      setLocationStatus('denied')
      return;
    }

    setLocationStatus('requesting')
    
    const options = { 
      enableHighAccuracy: true, 
      timeout: force ? 10000 : 5000, 
      maximumAge: 0 
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('granted');
      },
      (err) => {
        console.log("Spatial Sync Error:", err.message);
        if (err.code === 1) {
          setLocationStatus('denied');
        } else {
          setLocationStatus('error');
        }
      },
      options
    );
  }

  useEffect(() => {
    dispatch(bootstrapDiscovery())
    // Attempt silent synchronization on mount
    synchronizeSpatialRadar(false)
  }, [dispatch])

  const allPros = useMemo(() => [...(professionals ?? []), ...seedPros], [professionals])
  const allServices = useMemo(() => [...(services ?? []), ...seedServices], [services])
  const allPlaces = seedPlaces // Currently seed-only for places

  const proById = useMemo(() => {
    const map = new Map()
    for (const p of allPros) map.set(p.id, p)
    return map
  }, [allPros])

  const changeTab = (nextTab) => {
    setTab(nextTab)
    setSelectedService(null)
    setSelectedPlace(null)

    // Reset relevant filters on tab switch
    if (nextTab === 'professionals') {
      setMinPrice(''); setMaxPrice(''); setWithMedia(false); setServiceCategory(''); setProIndustry('');
      setPlaceCategory(''); setPlaceCity(''); setPlacePriceRange(''); setPlaceMinRating(''); 
      setPlaceFeaturedOnly(false); setPlaceVerifiedOnly(false);
    }
    if (nextTab === 'services') {
      setAddress(''); setVerifiedOnly(false); setProIndustry('');
      setPlaceCategory(''); setPlaceCity(''); setPlacePriceRange(''); setPlaceMinRating('');
      setPlaceFeaturedOnly(false); setPlaceVerifiedOnly(false);
    }
    if (nextTab === 'places') {
      setAddress(''); setVerifiedOnly(false); setMinPrice(''); setMaxPrice(''); 
      setWithMedia(false); setServiceCategory(''); setProIndustry('');
    }
  }

  // Filtering Logic
  const servicesFiltered = useMemo(() => {
    if (tab !== 'services') return []
    const q = query.trim().toLowerCase()
    const cat = serviceCategory.trim().toLowerCase()
    const min = minPrice === '' ? null : Number(minPrice)
    const max = maxPrice === '' ? null : Number(maxPrice)

    return allServices.filter((s) => {
      if (cat && s.category !== cat) return false
      if (withMedia && (!Array.isArray(s.images) || s.images.length === 0)) return false
      if (q && !`${s.title ?? ''} ${s.description ?? ''}`.toLowerCase().includes(q)) return false
      if (min !== null && (s.starting_price ?? s.ending_price ?? 0) < min) return false
      if (max !== null && (s.ending_price ?? s.starting_price ?? 0) > max) return false
      return true
    })
  }, [allServices, maxPrice, minPrice, query, serviceCategory, tab, withMedia])

  const prosFiltered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const addr = address.trim().toLowerCase()
    const ind = proIndustry.trim().toLowerCase()
    
    return allPros.filter((p) => {
      if (ind && p.industry !== ind) return false
      if (verifiedOnly && !p.is_verified) return false
      if (q && !`${p.title ?? ''} ${p.bio ?? ''}`.toLowerCase().includes(q)) return false
      if (addr && !String(p.location_text ?? '').toLowerCase().includes(addr)) return false
      return true
    })
  }, [address, allPros, proIndustry, query, tab, verifiedOnly])

  const placesFiltered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const min = placeMinRating === '' ? null : Number(placeMinRating)
    return seedPlaces.filter((p) => {
      if (placeCategory && String(p?.category ?? '') !== placeCategory) return false
      if (placeCity && String(p?.location?.city ?? '') !== placeCity) return false
      if (placePriceRange && String(p?.meta?.price_range ?? '') !== placePriceRange) return false
      if (placeFeaturedOnly && p?.meta?.is_featured !== true) return false
      if (placeVerifiedOnly && p?.meta?.is_verified !== true) return false
      if (min !== null && (p?.meta?.rating ?? 0) < min) return false
      if (q) {
        const tags = Array.isArray(p?.meta?.tags) ? p.meta.tags.join(' ') : ''
        const hay = `${p?.name ?? ''} ${p?.description ?? ''} ${p?.category ?? ''} ${p?.subcategory ?? ''} ${tags}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [placeCategory, placeCity, placeFeaturedOnly, placeMinRating, placePriceRange, placeVerifiedOnly, query, tab])

  const selectedPro = selectedService ? proById.get(selectedService.professional_id) : null

  // Image Signing Logic
  useEffect(() => {
    let cancelled = false
    const paths = allPros.map((p) => p?.profile_img).filter(Boolean).slice(0, 200)
    const run = async () => {
      if (!supabase || paths.length === 0) { if (!cancelled) setProImgUrls({}); return; }
      const next = {}
      await Promise.all(paths.map(async (p) => {
        if (p.startsWith('http')) { next[p] = p; return; }
        try {
          const { data } = await supabase.storage.from('user_profiles').createSignedUrl(p, 60 * 10)
          next[p] = data?.signedUrl ?? '';
        } catch {
          const { data } = supabase.storage.from('user_profiles').getPublicUrl(p)
          next[p] = data?.publicUrl ?? '';
        }
      }))
      if (!cancelled) setProImgUrls(next)
    }
    run()
    return () => { cancelled = true }
  }, [allPros])

  useEffect(() => {
    let cancelled = false
    const paths = Array.from(new Set(servicesFiltered.flatMap((s) => (s?.images ?? [])))).filter(Boolean).slice(0, 200)
    const run = async () => {
      if (!supabase || paths.length === 0) { if (!cancelled) setSrvMediaUrls({}); return; }
      const next = {}
      await Promise.all(paths.map(async (p) => {
        if (p.startsWith('http')) { next[p] = p; return; }
        try {
          const { data } = await supabase.storage.from('sv_services').createSignedUrl(p, 60 * 10)
          next[p] = data?.signedUrl ?? '';
        } catch {
          const { data } = supabase.storage.from('sv_services').getPublicUrl(p)
          next[p] = data?.publicUrl ?? '';
        }
      }))
      if (!cancelled) setSrvMediaUrls(next)
    }
    run()
    return () => { cancelled = true }
  }, [servicesFiltered])

  return (
    <div className="sv-core">
      <CoreHeader 
        logoIcon={logoIcon} 
        isRefreshing={isRefreshing} 
        isLoggedIn={isLoggedIn} 
        navigate={navigate} 
        setMobileNavOpen={setMobileNavOpen}
        setFiltersOpen={setFiltersOpen}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <CoreMobileMenu 
        mobileNavOpen={mobileNavOpen} 
        setMobileNavOpen={setMobileNavOpen} 
        isLoggedIn={isLoggedIn} 
        navigate={navigate} 
        changeTab={changeTab}
      />

      <main className="container py-4">
        <div className="row g-3 g-lg-4">
          {viewMode === 'list' && (
            <CoreSidebar 
              tab={tab} query={query} setQuery={setQuery} address={address} setAddress={setAddress}
              verifiedOnly={verifiedOnly} setVerifiedOnly={setVerifiedOnly} 
              minPrice={minPrice} setMinPrice={setMinPrice} maxPrice={maxPrice} setMaxPrice={setMaxPrice}
              withMedia={withMedia} setWithMedia={setWithMedia}
              serviceCategory={serviceCategory} setServiceCategory={setServiceCategory}
              proIndustry={proIndustry} setProIndustry={setProIndustry}
              placeCategory={placeCategory} setPlaceCategory={setPlaceCategory}
              placeCity={placeCity} setPlaceCity={setPlaceCity}
              placePriceRange={placePriceRange} setPlacePriceRange={setPlacePriceRange}
              placeMinRating={placeMinRating} setMinRating={setPlaceMinRating}
              placeFeaturedOnly={placeFeaturedOnly} setFeaturedOnly={setPlaceFeaturedOnly}
              placeVerifiedOnly={placeVerifiedOnly} setPlaceVerifiedOnly={setPlaceVerifiedOnly}
              filtersOpen={filtersOpen} setFiltersOpen={setFiltersOpen}
            />
          )}

          <div className={viewMode === 'map' ? "col-12" : "col-12 col-lg-9"}>
            {status === 'loading' && (services?.length ?? 0) === 0 && (professionals?.length ?? 0) === 0 ? (
              <div className="sv-card">
                <div className="sv-card__title">Loading marketplace…</div>
                <div className="sv-card__text">Fetching services and professionals.</div>
              </div>
            ) : null}

            {viewMode === 'list' && (
              <CoreDiscoveryTabs 
                tab={tab} setTab={setTab} viewMode={viewMode} setViewMode={setViewMode} changeTab={changeTab}
              />
            )}

            <CoreMainSection 
              viewMode={viewMode} tab={tab} userLocation={userLocation}
              locationStatus={locationStatus} synchronizeSpatialRadar={synchronizeSpatialRadar}
              allPlaces={allPlaces} allPros={allPros}
              prosFiltered={prosFiltered} servicesFiltered={servicesFiltered} placesFiltered={placesFiltered}
              proById={proById} proImgUrls={proImgUrls} srvMediaUrls={srvMediaUrls}
              isLoggedIn={isLoggedIn} navigate={navigate}
              setSelectedPlace={setSelectedPlace} setSelectedService={setSelectedService}
              currentUserId={currentUserId} isRefreshing={isRefreshing}
            />
          </div>
        </div>
      </main>

      <ServicePreviewModal 
        show={Boolean(selectedService)} onHide={() => setSelectedService(null)} 
        professional={selectedPro} service={selectedService} 
      />

      <PlacePreviewModal 
        show={Boolean(selectedPlace)} onHide={() => setSelectedPlace(null)} 
        place={selectedPlace} 
      />

      <Footer />
    </div>
  )
}
