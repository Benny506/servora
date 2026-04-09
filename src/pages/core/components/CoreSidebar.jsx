import React from 'react'
import { Offcanvas } from 'react-bootstrap'
import CoreFiltersContent from '../CoreFiltersContent.jsx'
import PlacesFiltersContent from '../places/PlacesFiltersContent.jsx'

export default function CoreSidebar({
  tab,
  query,
  setQuery,
  address,
  setAddress,
  verifiedOnly,
  setVerifiedOnly,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  withMedia,
  setWithMedia,
  serviceCategory,
  setServiceCategory,
  proIndustry,
  setProIndustry,
  placeCategory,
  setPlaceCategory,
  placeCity,
  setPlaceCity,
  placePriceRange,
  setPlacePriceRange,
  placeMinRating,
  setMinRating,
  placeFeaturedOnly,
  setPlaceFeaturedOnly,
  placeVerifiedOnly,
  setPlaceVerifiedOnly,
  filtersOpen,
  setFiltersOpen,
}) {
  const commonProps = {
    tab,
    query,
    setQuery,
    address,
    setAddress,
    verifiedOnly,
    setVerifiedOnly,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    withMedia,
    setWithMedia,
    serviceCategory,
    setServiceCategory,
    proIndustry,
    setProIndustry,
    placeCategory,
    setPlaceCategory,
    placeCity,
    setPlaceCity,
    placePriceRange,
    setPlacePriceRange,
    placeMinRating,
    setMinRating,
    placeFeaturedOnly,
    setPlaceFeaturedOnly,
    placeVerifiedOnly,
    setPlaceVerifiedOnly,
  }

  const renderFilters = (isOffcanvas = false) => {
    if (tab === 'places') {
      return (
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
          setMinRating={setMinRating}
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
          showApply={isOffcanvas}
          onApply={() => isOffcanvas && setFiltersOpen(false)}
        />
      )
    }

    return (
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
        serviceCategory={serviceCategory}
        setServiceCategory={setServiceCategory}
        proIndustry={proIndustry}
        setProIndustry={setProIndustry}
        onClear={() => {
          setQuery('')
          setAddress('')
          setMinPrice('')
          setMaxPrice('')
          setVerifiedOnly(false)
          setServiceCategory('')
          setProIndustry('')
          setWithMedia(false)
        }}
        showApply={isOffcanvas}
        onApply={() => isOffcanvas && setFiltersOpen(false)}
      />
    )
  }

  return (
    <>
      <div className="col-lg-3 d-none d-lg-block">
        <div className="sv-core-aside">
          <div className="sv-core-aside__inner">{renderFilters(false)}</div>
        </div>
      </div>

      <Offcanvas
        placement="end"
        show={filtersOpen}
        onHide={() => setFiltersOpen(false)}
        className="sv-core-offcanvas"
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="sv-core-offcanvas__title">Search & Filters</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>{renderFilters(true)}</Offcanvas.Body>
      </Offcanvas>
    </>
  )
}
