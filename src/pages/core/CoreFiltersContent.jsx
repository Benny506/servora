import { professionalIndustries } from './professionals/prosData.js'
import { serviceCategories } from './services/servicesData.js'

export default function CoreFiltersContent({
  mode,
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
  onClear,
  showApply = false,
  onApply,
}) {
  return (
    <div className="d-grid gap-3">
      <div>
        <label className="form-label sv-form-label" htmlFor="sv-core-search-any">
          Search
        </label>
        <input
          id="sv-core-search-any"
          type="text"
          className="form-control sv-form-control"
          placeholder="Makeup, plumbing, tutoring, design…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {mode === 'professionals' ? (
        <>
          <div>
            <label className="form-label sv-form-label" htmlFor="sv-core-pro-industry">
              Industry
            </label>
            <select
              id="sv-core-pro-industry"
              className="form-select sv-form-control"
              value={proIndustry}
              onChange={(e) => setProIndustry(e.target.value)}
            >
              <option value="">All industries</option>
              {professionalIndustries.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label sv-form-label" htmlFor="sv-core-address-any">
              Address
            </label>
            <input
              id="sv-core-address-any"
              type="text"
              className="form-control sv-form-control"
              placeholder="e.g. Ikeja, Lagos"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="d-flex align-items-center gap-3 flex-wrap">
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
        </>
      ) : (
        <>
          <div>
            <label className="form-label sv-form-label" htmlFor="sv-core-service-category">
              Industry
            </label>
            <select
              id="sv-core-service-category"
              className="form-select sv-form-control"
              value={serviceCategory}
              onChange={(e) => setServiceCategory(e.target.value)}
            >
              <option value="">All industries</option>
              {serviceCategories.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="row g-2">
            <div className="col-6">
              <label className="form-label sv-form-label" htmlFor="sv-core-min-any">
                Min price (₦)
              </label>
              <input
                id="sv-core-min-any"
                type="number"
                inputMode="numeric"
                className="form-control sv-form-control"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div className="col-6">
              <label className="form-label sv-form-label" htmlFor="sv-core-max-any">
                Max price (₦)
              </label>
              <input
                id="sv-core-max-any"
                type="number"
                inputMode="numeric"
                className="form-control sv-form-control"
                placeholder="Any"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-3 flex-wrap">
            <label className="form-check d-flex align-items-center gap-2 m-0">
              <input
                className="form-check-input"
                type="checkbox"
                checked={withMedia}
                onChange={(e) => setWithMedia(e.target.checked)}
              />
              <span className="form-check-label">With media</span>
            </label>
          </div>
        </>
      )}

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
