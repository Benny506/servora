import ServicesGrid from '../ServicesGrid.jsx'

export default function ServicesTab({
  services,
  proById,
  srvMediaUrls,
  proImgUrls,
  onSelect,
  currentUserId,
  isRefreshing,
}) {
  return (
    <div>
      <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
        <div className="text-secondary fw-semibold">
          Services <span className="text-body">({services.length})</span>
        </div>
        {isRefreshing ? <div className="text-secondary small">Updating…</div> : null}
      </div>
      <ServicesGrid
        services={services}
        proById={proById}
        srvMediaUrls={srvMediaUrls}
        proImgUrls={proImgUrls}
        onSelect={onSelect}
        currentUserId={currentUserId}
      />
    </div>
  )
}
