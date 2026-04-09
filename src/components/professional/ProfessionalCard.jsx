import { useSelector } from 'react-redux'

export default function ProfessionalCard({ professional, imgUrl, onMessage, onView }) {
  const currentUserId = useSelector((s) => s.auth.user?.id ?? '')
  const isVerified = professional?.is_verified === true
  const location = [professional?.city, professional?.state, professional?.country].filter(Boolean).join(', ')
  const isSelf = Boolean(currentUserId && professional?.user_id === currentUserId)

  return (
    <div className="sv-pro-card">
      <div className="sv-pro-card__media">
        {imgUrl ? <img src={imgUrl} alt="" className="sv-pro-card__img" /> : <div className="sv-pro-card__placeholder" />}
      </div>
      <div className="sv-pro-card__body">
        <div className="sv-pro-card__title">
          {professional?.title || 'Professional'}
          {isVerified ? <span className="sv-core-card__badge ms-2">Verified</span> : null}
          {isSelf ? <span className="sv-core-card__badge ms-2">This is you</span> : null}
        </div>
        {professional?.bio ? (
          <div className="sv-pro-card__text">{professional.bio}</div>
        ) : (
          <div className="sv-pro-card__text sv-pro-card__text--muted">No bio provided.</div>
        )}

        {location ? (
          <div className="sv-pro-card__meta">
            <div className="sv-pro-card__meta-label">Location</div>
            <div className="sv-pro-card__meta-value">{location}</div>
          </div>
        ) : null}

        <div className="d-flex gap-2 flex-wrap mt-3">
          {!isSelf && !professional?.is_seed ? (
            <button type="button" className="btn btn-primary" onClick={onMessage}>
              Message
            </button>
          ) : null}
          <button type="button" className="btn btn-outline-primary" onClick={onView}>
            View
          </button>
        </div>
      </div>
    </div>
  )
}
