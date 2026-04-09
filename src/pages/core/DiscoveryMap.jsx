import React, { useMemo, useState, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { calculateDistance } from '../../utils/geo.js'
import { MdCancel } from 'react-icons/md'

const API_KEY = "AIzaSyDj3OCpw2YjfCX7BOAEcJImQRBsJ4utzq4"

const containerStyle = {
  width: '100%',
  height: '75vh',
  borderRadius: '24px',
  overflow: 'hidden',
  boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.08)'
}

const defaultCenter = {
  lat: 4.9757,
  lng: 8.3417, // Calabar, Nigeria
}

// PREMIUM LABORATORY OBSIDIAN THEME
const mapStyles = [
  { "elementType": "geometry", "stylers": [{ "color": "#0b1510" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#749a85" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0b1510" }] },
  { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f3529" }] },
  { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "color": "#0b1510" }] },
  { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1f3529" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#0b1510" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#4a6b58" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#2c4a3a" }] },
  { "featureType": "transit", "stylers": [{ "visibility": "off" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0f3430" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#1f3529" }] }
]

export default function DiscoveryMap({ 
  userLocation, 
  locationStatus,
  synchronizeSpatialRadar,
  places, 
  professionals, 
  proImgUrls, 
  onSelectPlace, 
  onSelectPro 
}) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY,
  })

  const [selectedMapItem, setSelectedMapItem] = useState(null)
  const [limit, setLimit] = useState(10)

  const center = useMemo(() => {
    if (userLocation) return { lat: userLocation.lat, lng: userLocation.lng }
    return defaultCenter
  }, [userLocation])

  const nearestItems = useMemo(() => {
    const lat = center.lat
    const lng = center.lng

    const all = [
      ...(places || []).map((p) => ({ 
        ...p, 
        _type: 'place', 
        _dist: calculateDistance(lat, lng, p.location?.lat, p.location?.lng) 
      })),
      ...(professionals || []).map((p) => ({ 
        ...p, 
        _type: 'pro', 
        _dist: calculateDistance(lat, lng, p.lat, p.lng) 
      })),
    ].filter(item => {
      const targetLat = item._type === 'place' ? item.location?.lat : item.lat
      const targetLng = item._type === 'place' ? item.location?.lng : item.lng
      return typeof targetLat === 'number' && typeof targetLng === 'number'
    })

    return all.sort((a, b) => a._dist - b._dist).slice(0, limit)
  }, [center, places, professionals, limit])

  const handleMarkerClick = useCallback((item) => {
    setSelectedMapItem(item)
  }, [])

  if (!isLoaded) return <div className="sv-card text-center p-5">Initializing Spatial Laboratory...</div>

  return (
    <div className="discovery-map-container position-relative" style={{ pointerEvents: 'auto' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        options={{
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {/* User Presence Marker (Spectral Node) */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: window.google?.maps?.SymbolPath?.CIRCLE,
              fillColor: '#3fbf5a',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#fff',
              scale: 8,
            }}
          />
        )}

        {nearestItems.map((item) => {
          const isPlace = item._type === 'place'
          const imgUrl = isPlace 
            ? (item.images?.[0]) 
            : (proImgUrls?.[item.id] || proImgUrls?.[item.profile_img])
          
          return (
            <Marker
              key={item.id}
              position={{
                lat: isPlace ? item.location?.lat : item.lat,
                lng: isPlace ? item.location?.lng : item.lng,
              }}
              onClick={() => handleMarkerClick(item)}
              icon={imgUrl ? {
                url: imgUrl,
                scaledSize: new window.google.maps.Size(40, 40),
                origin: new window.google.maps.Point(0, 0),
                anchor: new window.google.maps.Point(20, 20),
              } : {
                path: window.google?.maps?.SymbolPath?.CIRCLE,
                fillColor: isPlace ? '#3fbf5a' : '#00d2ff',
                fillOpacity: 1,
                strokeWeight: 4,
                strokeColor: '#0b1510',
                scale: 10,
              }}
            />
          )
        })}

        {selectedMapItem && (
          <InfoWindow
            position={{
              lat: selectedMapItem._type === 'place' ? selectedMapItem.location?.lat : selectedMapItem.lat,
              lng: selectedMapItem._type === 'place' ? selectedMapItem.location?.lng : selectedMapItem.lng,
            }}
            onCloseClick={() => setSelectedMapItem(null)}
          >
            <div className="p-1 text-center" style={{ maxWidth: '220px' }}>
              <div className="mb-2 d-flex justify-content-center position-relative">
                <img 
                  src={
                    selectedMapItem._type === 'place' 
                    ? (selectedMapItem.images?.[0] || 'https://via.placeholder.com/120x80')
                    : (proImgUrls?.[selectedMapItem.id] || proImgUrls?.[selectedMapItem.profile_img] || 'https://via.placeholder.com/60')
                  } 
                  alt=""
                  style={{ 
                    width: selectedMapItem._type === 'place' ? '120px' : '60px', 
                    height: selectedMapItem._type === 'place' ? '80px' : '60px', 
                    borderRadius: selectedMapItem._type === 'place' ? '12px' : '50%', 
                    objectFit: 'cover', 
                    border: '2px solid #3fbf5a' 
                  }}
                />
                <div className="position-absolute top-0 end-0 p-1">
                  <MdCancel color="#000" size={20} style={{ cursor: 'pointer', background: '#fff', borderRadius: '50%' }} onClick={() => setSelectedMapItem(null)} />
                </div>
              </div>
              <h6 className="fw-bold mb-1 text-dark" style={{ letterSpacing: '-0.2px' }}>
                {selectedMapItem.name || selectedMapItem.title}
              </h6>
              <p className="small mb-3 text-muted uppercase" style={{ fontSize: '0.7rem', fontWeight: 800 }}>
                {selectedMapItem._type === 'place' ? selectedMapItem.category : selectedMapItem.industry}
              </p>
              <button
                className="btn btn-sm w-100 py-2"
                style={{ 
                  fontSize: '0.75rem', 
                  borderRadius: '10px',
                  backgroundColor: '#3fbf5a',
                  color: '#ffffff',
                  fontWeight: '800',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(63, 191, 90, 0.25)'
                }}
                onClick={() => {
                  if (selectedMapItem._type === 'place') onSelectPlace(selectedMapItem)
                  else onSelectPro(selectedMapItem)
                }}
              >
                View More
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Industrial Status Badge */}
      <div className="position-absolute top-0 end-0 m-4 d-flex align-items-center gap-2" style={{ zIndex: 10 }}>
        <div className={`sv-radar-status ${locationStatus === 'granted' ? 'online' : locationStatus === 'denied' ? 'denied' : 'standby'}`}>
          <span className="sv-radar-dot"></span>
          {locationStatus === 'granted' ? 'RADAR: ONLINE' : locationStatus === 'denied' ? 'LINK RESTRICTED' : locationStatus === 'requesting' ? 'HYDRATING...' : 'RADAR: STANDBY'}
        </div>
      </div>

      {/* Radar Offline Overlay CTA */}
      {locationStatus !== 'granted' && locationStatus !== 'requesting' && (
        <div className="sv-spatial-overlay">
          <div className="sv-spatial-card">
            <h5 className="fw-bold text-white mb-2">Proximity Radar Offline</h5>
            <p className="small opacity-75 mb-4">Synchronize your coordinates to discover the nearest industrial nodes and optimize your discovery path.</p>
            <button 
              className="sv-btn-radar"
              onClick={() => synchronizeSpatialRadar(true)}
            >
              SYNCHRONIZE SPATIAL RADAR
            </button>
          </div>
        </div>
      )}

      {/* Expand Discovery Button */}
      {locationStatus === 'granted' && (
        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4" style={{ zIndex: 99, pointerEvents: 'auto' }}>
          <button 
            className="btn shadow-lg"
            style={{ 
              borderRadius: '16px', 
              background: 'rgba(63, 191, 90, 0.95)', 
              border: '2px solid rgba(255,255,255,0.25)',
              color: '#fff',
              fontWeight: 850,
              padding: '12px 28px',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onClick={() => setLimit(prev => prev + 10)}
          >
            Expand Spatial Discovery
          </button>
        </div>
      )}

      <style>{`
        .gm-style-iw-c {
          background: rgba(255, 255, 255, 0.98) !important;
          backdrop-filter: blur(12px) !important;
          border-radius: 20px !important;
          padding: 14px !important;
          box-shadow: 0 14px 50px rgba(0,0,0,0.35) !important;
        }
        .gm-style-iw-d {
          overflow: hidden !important;
        }
        .gm-style-iw-t::after {
          background: rgba(255, 255, 255, 0.98) !important;
        }

        .sv-radar-status {
          background: rgba(11, 21, 16, 0.85);
          backdrop-filter: blur(10px);
          padding: 8px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          color: #749a85;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sv-radar-status.online { color: #3fbf5a; box-shadow: 0 0 20px rgba(63, 191, 90, 0.2); }
        .sv-radar-status.denied { color: #ff4d4d; }
        .sv-radar-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .online .sv-radar-dot { animation: sv-blink 1.5s infinite; }

        @keyframes sv-blink {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.5); }
          100% { opacity: 1; transform: scale(1); }
        }

        .sv-spatial-overlay {
          position: absolute;
          inset: 0;
          background: rgba(11, 21, 16, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          border-radius: 24px;
        }
        .sv-spatial-card {
          background: #0b1510;
          border: 1px solid rgba(63, 191, 90, 0.2);
          padding: 40px;
          border-radius: 24px;
          text-align: center;
          max-width: 400px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.6);
        }
        .sv-btn-radar {
          background: #3fbf5a;
          color: #0b1510;
          border: none;
          padding: 14px 30px;
          border-radius: 12px;
          font-weight: 900;
          font-size: 0.85rem;
          letter-spacing: 0.5px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sv-btn-radar:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(63, 191, 90, 0.4);
        }
      `}</style>
    </div>
  )
}
