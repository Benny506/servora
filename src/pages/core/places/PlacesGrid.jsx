import PlaceCard from './PlaceCard.jsx'

export default function PlacesGrid({ places = [], onSelect }) {
  if (places.length === 0) {
    return (
      <div className="sv-card mt-3">
        <div className="sv-card__title">No places found</div>
        <div className="sv-card__text">Try changing your filters or search keywords.</div>
      </div>
    )
  }

  return (
    <div className="row g-3 g-md-4 mt-1">
      {places.slice(0, 48).map((p) => (
        <div key={p.id} className="col-12 col-md-6 col-lg-4">
          <PlaceCard place={p} onClick={() => onSelect?.(p)} />
        </div>
      ))}
    </div>
  )
}
