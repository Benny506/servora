import ProfessionalCard from '../../components/professional/ProfessionalCard.jsx'
import { useMessaging } from '../../hooks/useMessaging.js'

export default function ProfessionalsGrid({ pros = [], proImgUrls = {}, isLoggedIn, navigate }) {
  const { initiateConversation } = useMessaging()

  if (pros.length === 0) {
    return (
      <div className="sv-card mt-2">
        <div className="sv-card__title">No professionals match your filters</div>
        <div className="sv-card__text">Try adjusting location or search.</div>
      </div>
    )
  }

  return (
    <div className="row g-3 g-md-4 mt-1">
      {pros.slice(0, 12).map((p) => {
        const imgPath = p?.profile_img
        const imgUrl = imgPath ? proImgUrls[imgPath] : ''
        return (
          <div key={p.id} className="col-12 col-md-6 col-lg-4">
            <ProfessionalCard
              professional={p}
              imgUrl={imgUrl}
              onMessage={() => initiateConversation(p.user_id)}
              onView={() => navigate(`/pro/${p.id}`)}
            />
          </div>
        )
      })}
    </div>
  )
}
