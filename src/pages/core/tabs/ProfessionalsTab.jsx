import ProfessionalsGrid from '../ProfessionalsGrid.jsx'

export default function ProfessionalsTab({ pros, proImgUrls, isLoggedIn, navigate }) {
  return (
    <div>
      <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
        <div className="text-secondary fw-semibold">Professionals</div>
        <div className="text-secondary small">{pros.length} found</div>
      </div>
      <ProfessionalsGrid pros={pros} proImgUrls={proImgUrls} isLoggedIn={isLoggedIn} navigate={navigate} />
    </div>
  )
}
