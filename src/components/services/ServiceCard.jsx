const formatNgn = (value) => {
  if (value === null || value === undefined || value === '') return null
  const asNumber = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(asNumber)) return null
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(asNumber)
}

export default function ServiceCard({
  service,
  coverUrl,
  thumbUrls = [],
  onClick,
  showProvider = false,
  providerName,
  providerImgUrl,
  providerIsSelf = false,
}) {
  const isActive = service?.is_active !== false
  const hasMedia = Array.isArray(service?.images) && service.images.length > 0

  const startingText = formatNgn(service?.starting_price)
  const endingText = formatNgn(service?.ending_price)

  const pricingText =
    startingText && endingText
      ? `${startingText} – ${endingText}`
      : startingText
        ? `From ${startingText}`
        : endingText
          ? `Up to ${endingText}`
          : 'Pricing not set'

  return (
    <button
      type="button"
      className={`sv-service-card${hasMedia ? ' sv-service-card--media' : ''}`}
      onClick={onClick}
    >
      {hasMedia ? (
        <div className="sv-service-card__media">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="sv-service-card__img" />
          ) : (
            <div className="sv-service-card__placeholder" />
          )}
          <div className={`sv-pill sv-pill--${isActive ? 'on' : 'off'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
      ) : (
        <div className="sv-service-card__head">
          <div className={`sv-pill sv-pill--${isActive ? 'on' : 'off'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
      )}

      <div className="sv-service-card__body">
        <div className="sv-service-card__title">{service.title}</div>
        {service.description ? (
          <div className="sv-service-card__text">{service.description}</div>
        ) : (
          <div className="sv-service-card__text sv-service-card__text--muted">
            No description provided.
          </div>
        )}

        <div className="sv-service-card__divider" />

        <div className="sv-service-card__meta">
          <div className="sv-service-card__meta-label">Pricing</div>
          <div className="sv-service-card__meta-value">{pricingText}</div>
        </div>

        {hasMedia && thumbUrls.length > 0 ? (
          <div>
            <div className="sv-service-card__divider" />

            <div className="my-3" />

            <div className="sv-service-card__thumbs gap-2" aria-hidden="true">
              {thumbUrls.slice(0, 4).map((url) => (
                <div key={url} className="sv-service-card__thumb">
                  <img src={url} alt="" className="rounded-3 sv-service-card__thumb-img" />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {showProvider && (providerName || providerIsSelf) ? (
          <>
            <div className="sv-service-card__divider" />
            <div className="sv-service-card__provider">
              {providerImgUrl ? (
                <img src={providerImgUrl} alt="" className="sv-service-card__provider-img" />
              ) : (
                <div className="sv-service-card__provider-placeholder" />
              )}
              <div className="sv-service-card__provider-name">{providerIsSelf ? 'This is you' : providerName}</div>
            </div>
          </>
        ) : null}
      </div>
    </button>
  )
}
