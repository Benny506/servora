import { placeCategories, placeCities, placePriceRanges } from './placesData.js'

export default function PlacesFiltersContent({
  query,
  setQuery,
  category,
  setCategory,
  city,
  setCity,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  featuredOnly,
  setFeaturedOnly,
  verifiedOnly,
  setVerifiedOnly,
  onClear,
  showApply = false,
  onApply,
}) {
  return (
    <div className="d-grid gap-3">
      <div>
        <label className="form-label sv-form-label" htmlFor="sv-places-search">
          Search
        </label>
        <input
          id="sv-places-search"
          type="text"
          className="form-control sv-form-control"
          placeholder="Parks, hospitals, museums…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div>
        <label className="form-label sv-form-label" htmlFor="sv-places-category">
          Category
        </label>
        <select
          id="sv-places-category"
          className="form-select sv-form-control"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {placeCategories.map((c) => (
            <option key={c} value={c}>
              {String(c).replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label sv-form-label" htmlFor="sv-places-city">
          City
        </label>
        <select
          id="sv-places-city"
          className="form-select sv-form-control"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="">All cities</option>
          {placeCities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="row g-2">
        <div className="col-6">
          <label className="form-label sv-form-label" htmlFor="sv-places-price">
            Price
          </label>
          <select
            id="sv-places-price"
            className="form-select sv-form-control"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
          >
            <option value="">Any</option>
            {placePriceRanges.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="col-6">
          <label className="form-label sv-form-label" htmlFor="sv-places-rating">
            Min rating
          </label>
          <select
            id="sv-places-rating"
            className="form-select sv-form-control"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
          >
            <option value="">Any</option>
            <option value="4.9">4.9+</option>
            <option value="4.7">4.7+</option>
            <option value="4.5">4.5+</option>
            <option value="4.0">4.0+</option>
          </select>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3 flex-wrap">
        <label className="form-check d-flex align-items-center gap-2 m-0">
          <input
            className="form-check-input"
            type="checkbox"
            checked={featuredOnly}
            onChange={(e) => setFeaturedOnly(e.target.checked)}
          />
          <span className="form-check-label">Featured only</span>
        </label>
        <label className="form-check d-flex align-items-center gap-2 m-0">
          <input
            className="form-check-input"
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
          />
          <span className="form-check-label">Verified only</span>
        </label>
      </div>

      <div className="d-flex gap-2 flex-wrap">
        <button type="button" className="btn btn-outline-primary" onClick={onClear}>
          Clear
        </button>
        {showApply ? (
          <button type="button" className="btn btn-primary" onClick={onApply}>
            Apply
          </button>
        ) : null}
      </div>
    </div>
  )
}
