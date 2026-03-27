import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import AuthTips from '../sections/auth/AuthTips.jsx'
import logoIcon from '../assets/servora-logo-icon.png'
import { SUPABASE_ANON_KEY, supabase } from '../lib/supabaseClient.js'
import { addAlert, hideLoader, showLoader } from '../store/uiSlice.js'

const OTP_LENGTH = 6
const DEFAULT_SECONDS = 60

const toDigits = (value) => String(value ?? '').replace(/\D/g, '')

export default function VerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const mode = location.state?.mode ?? 'signup'
  const email = location.state?.email ?? ''
  const password = location.state?.password ?? ''

  const [digits, setDigits] = useState(() => Array.from({ length: OTP_LENGTH }, () => ''))
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_SECONDS)
  const inputsRef = useRef([])

  useEffect(() => {
    if (!email || (mode === 'signup' && !password)) {
      navigate(mode === 'forgot-password' ? '/forgot-password' : '/signup', { replace: true })
    }
  }, [email, mode, navigate, password])

  useEffect(() => {
    dispatch(showLoader('Sending OTP...'))

    const id = window.setTimeout(() => {
      dispatch(hideLoader())
      dispatch(
        addAlert({
          type: 'info',
          title: 'Simulated OTP',
          message: 'Type any 6 digits to continue.',
          timeoutMs: 4200,
        }),
      )
    }, 3000)

    return () => window.clearTimeout(id)
  }, [dispatch])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [secondsLeft])

  const isComplete = digits.every((d) => d.length === 1)

  const focusIndex = (i) => {
    const el = inputsRef.current[i]
    if (el) el.focus()
  }

  const setDigitAt = (i, val) => {
    setDigits((prev) => {
      const next = [...prev]
      next[i] = val
      return next
    })
  }

  const handleChange = (i, e) => {
    const value = toDigits(e.target.value).slice(-1)
    setDigitAt(i, value)
    if (value && i < OTP_LENGTH - 1) focusIndex(i + 1)
  }

  const handleKeyDown = (i, e) => {
    if (e.key !== 'Backspace') return
    if (digits[i]) {
      setDigitAt(i, '')
      return
    }
    if (i > 0) {
      setDigitAt(i - 1, '')
      focusIndex(i - 1)
    }
  }

  const handlePaste = (e) => {
    const pasted = toDigits(e.clipboardData.getData('text')).slice(0, OTP_LENGTH)
    if (!pasted) return
    e.preventDefault()
    setDigits((prev) => {
      const next = [...prev]
      for (let i = 0; i < OTP_LENGTH; i += 1) {
        next[i] = pasted[i] ?? ''
      }
      return next
    })
    focusIndex(Math.min(pasted.length, OTP_LENGTH - 1))
  }

  const restartTimer = () => {
    setSecondsLeft(DEFAULT_SECONDS)
  }

  const verifyAndContinue = async () => {
    if (!isComplete) return

    dispatch(showLoader('Verifying code...'))

    try {
      await new Promise((r) => window.setTimeout(r, 900))

      if (mode === 'forgot-password') {
        dispatch(
          addAlert({
            type: 'success',
            title: 'OTP verified',
            message: 'Continue to reset your password.',
            timeoutMs: 3000,
          }),
        )
        navigate('/reset-password', { state: { email }, replace: true })
        return
      }

      if (!supabase || !SUPABASE_ANON_KEY) {
        dispatch(
          addAlert({
            type: 'error',
            title: 'Missing configuration',
            message: 'Supabase is not configured for this app.',
            timeoutMs: 6500,
          }),
        )
        return
      }

      const res = await fetch(
        'https://tiwuhxljzjknkvplrxrg.supabase.co/functions/v1/create-only-user',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ email, password }),
        },
      )

      if (!res.ok) {
        let message = 'Unable to create account.'
        try {
          const json = await res.json()
          message = json?.error ?? json?.message ?? message
        } catch {
          message = (await res.text()) || message
        }

        dispatch(
          addAlert({
            type: 'error',
            title: 'Signup failed',
            message: typeof message === 'string' ? message : 'Network error!',
            timeoutMs: 6500,
          }),
        )
        return
      }

      dispatch(
        addAlert({
          type: 'success',
          title: 'Account created',
          message: `Welcome, ${email}`,
          timeoutMs: 4200,
        }),
      )
      navigate('/login', { state: { email }, replace: true })
    } finally {
      dispatch(hideLoader())
    }
  }

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
                <h1 className="sv-auth__title">
                  {mode === 'forgot-password' ? 'Verify to reset password' : 'Verify your email'}
                </h1>
                <p className="sv-auth__subtitle">
                  Enter the 6-digit code sent to <span className="sv-auth__email">{email}</span>
                </p>
              </div>

              <div className="mt-4">
                <div className="sv-otp" onPaste={handlePaste}>
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        inputsRef.current[i] = el
                      }}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      className="sv-otp__input"
                      value={d}
                      onChange={(e) => handleChange(i, e)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      aria-label={`OTP digit ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="btn btn-primary w-100 mt-4 sv-auth__submit"
                  disabled={!isComplete}
                  onClick={verifyAndContinue}
                >
                  Verify code
                </button>

                <div className="sv-otp__meta mt-3">
                  <div className="sv-otp__timer">
                    {secondsLeft > 0 ? (
                      <span>Resend available in {secondsLeft}s</span>
                    ) : (
                      <span>Didn’t get a code?</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-primary sv-otp__resend"
                    onClick={restartTimer}
                  >
                    Restart timer
                  </button>
                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    className="btn btn-link p-0 sv-auth__link"
                    onClick={() =>
                      navigate(mode === 'forgot-password' ? '/forgot-password' : '/signup')
                    }
                  >
                    Change email
                  </button>
                </div>
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
