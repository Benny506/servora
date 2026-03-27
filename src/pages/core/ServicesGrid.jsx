import ServiceCard from '../../components/services/ServiceCard.jsx'

export default function ServicesGrid({
  services = [],
  proById,
  srvMediaUrls = {},
  proImgUrls = {},
  onSelect,
  currentUserId,
}) {
  if (services.length === 0) {
    return (
      <div className="sv-card mt-3">
        <div className="sv-card__title">No results</div>
        <div className="sv-card__text">Try changing your filters or search keywords.</div>
      </div>
    )
  }

  return (
    <div className="row g-3 g-md-4 mt-1">
      {services.slice(0, 48).map((s) => {
        const pro = proById.get(s.professional_id)
        const images = Array.isArray(s?.images) ? s.images : []
        const cover = images[0]
        const coverUrl = cover ? srvMediaUrls[cover] : ''
        const thumbUrls = images.slice(1, 5).map((p) => srvMediaUrls[p]).filter(Boolean)
        const providerImgUrl = pro?.profile_img ? proImgUrls[pro.profile_img] : ''
        const providerIsSelf = Boolean(currentUserId && pro?.user_id === currentUserId)
        return (
          <div key={s.id} className="col-12 col-md-6 col-lg-6">
            <ServiceCard
              service={s}
              coverUrl={coverUrl}
              thumbUrls={thumbUrls}
              showProvider
              providerName={pro?.title}
              providerImgUrl={providerImgUrl}
              providerIsSelf={providerIsSelf}
              onClick={() => onSelect?.(s)}
            />
          </div>
        )
      })}
    </div>
  )
}
