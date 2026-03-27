export default function PlaceCard({ place, onClick }) {
  const cover = Array.isArray(place?.images) ? place.images[0] : ''
  const rating = place?.meta?.rating
  const city = place?.location?.city
  const isVerified = place?.meta?.is_verified === true
  const isFeatured = place?.meta?.is_featured === true
  const priceRange = place?.meta?.price_range

  return (
    <button type="button" className="sv-place-card" onClick={onClick}>
      <div className="sv-place-card__media">
        {cover ? <img src={cover} alt="" className="sv-place-card__img" /> : <div className="sv-place-card__placeholder" />}
        <div className="sv-place-card__pills">
          {isFeatured ? <div className="sv-pill sv-pill--on">Featured</div> : null}
          {isVerified ? <div className="sv-pill sv-pill--on">Verified</div> : null}
        </div>
      </div>
      <div className="sv-place-card__body">
        <div className="sv-place-card__title">{place?.name}</div>
        <div className="sv-place-card__sub">
          {city ? <span>{city}</span> : null}
          {priceRange ? <span className="sv-core__dot">•</span> : null}
          {priceRange ? <span>{priceRange}</span> : null}
          {typeof rating === 'number' ? <span className="sv-core__dot">•</span> : null}
          {typeof rating === 'number' ? <span>{rating.toFixed(1)}</span> : null}
        </div>
        {place?.description ? <div className="sv-place-card__text">{place.description}</div> : null}
      </div>
    </button>
  )
}
