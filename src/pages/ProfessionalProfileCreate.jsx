import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AuthTips from '../sections/auth/AuthTips.jsx'
import logoIcon from '../assets/servora-logo-icon.png'
import ProfessionalProfileForm from '../components/professional/ProfessionalProfileForm.jsx'

export default function ProfessionalProfileCreate() {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const professionalProfile = useSelector((state) => state.auth.professionalProfile)

  return (
    <div className="sv-auth">
      <div className="container-fluid px-0">
        <div className="row g-0 min-vh-100">
          <div className="col-12 col-lg-6 order-0 order-lg-0 d-flex align-items-center justify-content-center p-4 p-md-5">
            <div className="sv-auth__panel">
              <div className="sv-auth__brand">
                <img
                  src={logoIcon}
                  width="36"
                  height="36"
                  className="sv-auth__brand-icon"
                  alt="Servora"
                />
                <div className="sv-auth__brand-text">Servora</div>
              </div>

              <div className="mt-4">
                <h1 className="sv-auth__title">Create professional profile</h1>
                <p className="sv-auth__subtitle">
                  Add the details clients need to understand your service and trust your work.
                </p>
              </div>

              <div className="mt-4">
                {professionalProfile && user ? (
                  <div className="p-3 rounded-4 border bg-body-tertiary">
                    <div className="fw-semibold">Profile already exists</div>
                    <div className="text-secondary mt-1">
                      You already have a professional profile. Edit it from your dashboard.
                    </div>
                    <div className="mt-3 d-flex gap-2 flex-wrap">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => navigate('/dashboard/professional-profile')}
                      >
                        Go to dashboard
                      </button>
                    </div>
                  </div>
                ) : (
                  <ProfessionalProfileForm />
                )}
              </div>

              <div className="mt-4 d-flex justify-content-between align-items-center">
                <button type="button" className="btn btn-link p-0 sv-auth__link" onClick={() => navigate('/')}>
                  Back to landing page
                </button>
                {user ? (
                  <button
                    type="button"
                    className="btn btn-link p-0 sv-auth__link"
                    onClick={() => navigate('/dashboard/professional-profile')}
                  >
                    Back to dashboard
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6 order-1 order-lg-1 sv-auth__tips-col">
            <AuthTips />
          </div>
        </div>
      </div>
    </div>
  )
}
