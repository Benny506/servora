import React from 'react'

export default function CoreDiscoveryTabs({ tab, setTab, viewMode, setViewMode, changeTab }) {
  return (
    <div className="d-flex align-items-center justify-content-between mb-3">
      <div className="sv-core-tabs mb-0">
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
    </div>
  )
}
