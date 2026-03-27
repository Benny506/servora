export default function PortfolioCard({ portfolio, coverUrl, mediaCount, onClick, showOwnerIndicator = false }) {
  const isActive = portfolio?.is_active !== false

  return (
    <button type="button" className="sv-portfolio-card" onClick={onClick}>
      <div className="sv-portfolio-card__media">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="sv-portfolio-card__img" />
        ) : (
          <div className="sv-portfolio-card__placeholder" />
        )}

        <div className={`sv-pill sv-pill--${isActive ? 'on' : 'off'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </div>
        <div className="sv-portfolio-card__badge">{mediaCount} media</div>
      </div>
      <div className="sv-portfolio-card__body">
        <div className="d-flex align-items-center justify-content-between gap-2">
          <div className="sv-portfolio-card__title">{portfolio.title}</div>
          {showOwnerIndicator ? <div className="sv-pill sv-pill--on">This is you</div> : null}
        </div>
        <div className="sv-portfolio-card__text">{portfolio.description}</div>
      </div>
    </button>
  )
}
