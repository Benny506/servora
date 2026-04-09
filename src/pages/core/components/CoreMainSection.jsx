import React from 'react'
import DiscoveryMap from '../DiscoveryMap.jsx'
import ProfessionalsTab from '../tabs/ProfessionalsTab.jsx'
import ServicesTab from '../tabs/ServicesTab.jsx'
import PlacesTab from '../tabs/PlacesTab.jsx'

export default function CoreMainSection({
  viewMode,
  tab,
  userLocation,
  locationStatus,
  synchronizeSpatialRadar,
  allPlaces,
  allPros,
  prosFiltered,
  servicesFiltered,
  placesFiltered,
  proById,
  proImgUrls,
  srvMediaUrls,
  isLoggedIn,
  navigate,
  setSelectedPlace,
  setSelectedService,
  currentUserId,
  isRefreshing,
}) {
  if (viewMode === 'map') {
    return (
      <DiscoveryMap
        userLocation={userLocation}
        locationStatus={locationStatus}
        synchronizeSpatialRadar={synchronizeSpatialRadar}
        places={allPlaces}
        professionals={allPros}
        proImgUrls={proImgUrls}
        onSelectPlace={(p) => setSelectedPlace(p)}
        onSelectPro={(p) => navigate(`/pro/${p.id}`)}
      />
    )
  }

  return (
    <>
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
    </>
  )
}
