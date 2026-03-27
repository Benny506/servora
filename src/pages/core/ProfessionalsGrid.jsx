import ProfessionalCard from '../../components/professional/ProfessionalCard.jsx'

export default function ProfessionalsGrid({ pros = [], proImgUrls = {}, isLoggedIn, navigate }) {
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
              onMessage={() =>
                navigate(isLoggedIn ? '/dashboard/messages' : '/login', {
                  state: isLoggedIn ? undefined : { from: '/core' },
                })
              }
              onView={() => navigate(`/pro/${p.id}`)}
            />
          </div>
        )
      })}
    </div>
  )
}
