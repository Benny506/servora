import { useNavigate } from 'react-router-dom'

export default function NoProfessionalProfileCard({
  title = 'Create your professional profile',
  text = 'Set up your profile so clients can discover you, view your services, and trust your portfolio.',
  ctaText = 'Create profile',
}) {
  const navigate = useNavigate()

  return (
    <div className="sv-card">
      <div className="sv-card__title">{title}</div>
      <div className="sv-card__text">{text}</div>
      <div className="mt-3 d-flex gap-2 flex-wrap">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/professional-profile')}
        >
          {ctaText}
        </button>
      </div>
    </div>
  )
}

