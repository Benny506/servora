import { useDispatch, useSelector } from 'react-redux'
import { FiAlertTriangle } from 'react-icons/fi'
import ConfirmActionModal from '../../../components/ConfirmActionModal.jsx'
import ProfessionalProfileEditForm from '../../../components/professional/ProfessionalProfileEditForm.jsx'
import ProfessionalProfileVerified from '../../../components/professional/ProfessionalProfileVerified.jsx'
import NoProfessionalProfileCard from '../components/NoProfessionalProfileCard.jsx'
import { SUPABASE_ANON_KEY, supabase } from '../../../lib/supabaseClient.js'
import { setProfessionalProfile } from '../../../store/authSlice.js'
import { addAlert, hideLoader, showLoader } from '../../../store/uiSlice.js'
import { useMemo, useState } from 'react'

export default function ProfessionalProfile() {
  const dispatch = useDispatch()
  const professionalProfile = useSelector((state) => state.auth.professionalProfile)
  const user = useSelector((state) => state.auth.user)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingActive, setPendingActive] = useState(null)

  const isActive = professionalProfile?.is_active !== false
  const isVerified = professionalProfile?.is_verified !== false

  const confirmCopy = useMemo(() => {
    const nextValue = pendingActive ?? isActive
    if (nextValue) {
      return {
        title: 'Activate your professional profile?',
        subText: 'Clients will be able to discover and contact you again.',
        confirmText: 'Activate',
        cancelText: 'Cancel',
        confirmVariant: 'primary',
      }
    }
    return {
      title: 'Deactivate your professional profile?',
      subText: 'Clients won’t discover you while your profile is inactive.',
      confirmText: 'Deactivate',
      cancelText: 'Keep active',
      confirmVariant: 'danger',
    }
  }, [isActive, pendingActive])

  const requestToggleActive = (nextValue) => {
    setPendingActive(nextValue)
    setConfirmOpen(true)
  }

  const applyToggleActive = async () => {
    const nextValue = Boolean(pendingActive)
    setConfirmOpen(false)

    dispatch(showLoader(nextValue ? 'Activating profile...' : 'Deactivating profile...'))
    try {
      if (!supabase || !SUPABASE_ANON_KEY || !user) {
        dispatch(
          addAlert({
            type: 'error',
            title: 'Action failed',
            message: 'Please sign in again to continue.',
            timeoutMs: 6500,
          }),
        )
        return
      }

      const { data, error } = await supabase
        .from('sv_professional_profiles')
        .update({ is_active: nextValue })
        .eq('user_id', user.id)
        .select('*')
        .maybeSingle()

      if (error) {
        dispatch(
          addAlert({
            type: 'error',
            title: 'Update failed',
            message: error.message ?? 'Unable to update status.',
            timeoutMs: 6500,
          }),
        )
        return
      }

      dispatch(setProfessionalProfile(data ?? null))
      dispatch(
        addAlert({
          type: 'success',
          title: nextValue ? 'Profile activated' : 'Profile deactivated',
          message: nextValue ? 'Clients can discover you again.' : 'You’re hidden from discovery.',
          timeoutMs: 4200,
        }),
      )
    } finally {
      dispatch(hideLoader())
    }
  }

  return (
    <div>
      <div className="sv-page-head">
        <div className="sv-page-head__kicker">Professional</div>
        <h1 className="sv-page-head__title">Professional Profile</h1>
        <p className="sv-page-head__text">
          Add your title, bio, and location to help clients understand what you do.
        </p>
      </div>

      {!professionalProfile ? (
        <NoProfessionalProfileCard />
      ) : (
        <>
          <div className="sv-card">
            <div className="sv-card__title">Status</div>
            <div className="sv-card__text">
              Control whether clients can discover you. Verification is shown here too.
            </div>

            <div className="mt-3">
              <ProfessionalProfileVerified isVerified={isVerified} />
            </div>

            <div className="sv-active mt-3">
              <div className="sv-active__left">
                <div className="sv-active__title">Active</div>
                <div className="sv-active__text">
                  {isActive ? 'Visible to clients' : 'Hidden from discovery'}
                </div>
              </div>
              <button
                type="button"
                className={`sv-active__toggle${isActive ? ' sv-active__toggle--on' : ''}`}
                onClick={() => requestToggleActive(!isActive)}
                aria-pressed={isActive}
              >
                <span className="sv-active__knob" />
              </button>
            </div>
          </div>

          <div className="sv-card">
            <div className="sv-card__title">Edit profile</div>
            <div className="sv-card__text">
              Update your details to keep your profile accurate and trustworthy.
            </div>
            <div className="mt-3">
              <ProfessionalProfileEditForm profile={professionalProfile} />
            </div>
          </div>

          <ConfirmActionModal
            show={confirmOpen}
            icon={<FiAlertTriangle />}
            title={confirmCopy.title}
            subText={confirmCopy.subText}
            confirmText={confirmCopy.confirmText}
            cancelText={confirmCopy.cancelText}
            confirmVariant={confirmCopy.confirmVariant}
            onConfirm={applyToggleActive}
            onCancel={() => (setConfirmOpen(false), setPendingActive(null))}
          />
        </>
      )}
    </div>
  )
}
