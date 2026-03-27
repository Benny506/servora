import { FiCheckCircle, FiInfo } from 'react-icons/fi'

export default function ProfessionalProfileVerified({ isVerified }) {
  return (
    <div className={`sv-verified sv-verified--${isVerified ? 'yes' : 'no'}`}>
      <div className="sv-verified__icon" aria-hidden="true">
        {isVerified ? <FiCheckCircle /> : <FiInfo />}
      </div>
      <div className="sv-verified__body">
        <div className="sv-verified__title">
          {isVerified ? 'Verified professional profile' : 'Not verified yet'}
        </div>
        <div className="sv-verified__text">
          {isVerified
            ? 'Clients can see that your profile is verified.'
            : 'Verification will be introduced later. Complete your profile and portfolio to build trust.'}
        </div>
      </div>
    </div>
  )
}

