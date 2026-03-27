export default function DashboardHome() {
  return (
    <div>
      <div className="sv-page-head">
        <div className="sv-page-head__kicker">Overview</div>
        <h1 className="sv-page-head__title">Welcome to Servora</h1>
        <p className="sv-page-head__text">
          This is a placeholder dashboard. Next we’ll wire real data and actions.
        </p>
      </div>

      <div className="row g-3 g-md-4 mt-1">
        <div className="col-12 col-lg-6">
          <div className="sv-card">
            <div className="sv-card__title">Quick actions</div>
            <div className="sv-card__text">
              Create your professional profile, add services, upload portfolio items, and respond
              to messages.
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="sv-card">
            <div className="sv-card__title">Activity</div>
            <div className="sv-card__text">
              Messages, profile updates, and portfolio changes will appear here.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

