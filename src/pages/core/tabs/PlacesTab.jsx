import PlacesGrid from '../places/PlacesGrid.jsx'

export default function PlacesTab({ places, onSelect }) {
  return (
    <div>
      <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
        <div className="text-secondary fw-semibold">Places</div>
        <div className="text-secondary small">{places.length} found</div>
      </div>
      <PlacesGrid places={places} onSelect={onSelect} />
    </div>
  )
}
