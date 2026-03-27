import { Form, Formik } from 'formik'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import AuthTips from '../sections/auth/AuthTips.jsx'
import logoIcon from '../assets/servora-logo-icon.png'
import { SUPABASE_ANON_KEY, supabase } from '../lib/supabaseClient.js'
import { addAlert, hideLoader, showLoader } from '../store/uiSlice.js'

export default function ResetPassword() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const email = typeof location.state?.email === 'string' ? location.state.email : ''
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    dispatch(hideLoader())
  }, [dispatch])

  useEffect(() => {
    if (!email) navigate('/forgot-password', { replace: true })
  }, [email, navigate])

  const validationSchema = useMemo(
    () =>
      Yup.object({
        password: Yup.string()
          .min(8, 'Password must be at least 8 characters')
          .required('Password is required'),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('password')], 'Passwords do not match')
          .required('Confirm password is required'),
      }),
    [],
  )

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
                <h1 className="sv-auth__title">Reset password</h1>
                <p className="sv-auth__subtitle">
                  Choose a new password for <span className="sv-auth__email">{email}</span>
                </p>
              </div>

              <Formik
                initialValues={{ password: '', confirmPassword: '' }}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  dispatch(showLoader('Resetting password...'))
                  try {
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
                      'https://tiwuhxljzjknkvplrxrg.supabase.co/functions/v1/reset-password',
                      {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                          apikey: SUPABASE_ANON_KEY,
                        },
                        body: JSON.stringify({
                          email,
                          new_password: values.password,
                        }),
                      },
                    )

                    if (!res.ok) {
                      let message = 'Unable to reset password.'
                      try {
                        const json = await res.json()
                        message = json?.error ?? json?.message ?? message
                      } catch {
                        message = (await res.text()) || message
                      }

                      dispatch(
                        addAlert({
                          type: 'error',
                          title: 'Reset failed',
                          message: typeof message === 'string' ? message : 'Network error!',
                          timeoutMs: 6500,
                        }),
                      )
                      return
                    }

                    dispatch(
                      addAlert({
                        type: 'success',
                        title: 'Password updated',
                        message: 'You can now sign in with your new password.',
                        timeoutMs: 4200,
                      }),
                    )
                    navigate('/login', { state: { email }, replace: true })
                  } finally {
                    dispatch(hideLoader())
                    setSubmitting(false)
                  }
                }}
              >
                {(formik) => (
                  <Form noValidate>
                    <div className="mt-4">
                      <label htmlFor="password" className="form-label sv-form-label">
                        New password
                      </label>
                      <div className="sv-input-group">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder="Create a strong password"
                          className={`form-control sv-form-control${
                            formik.touched.password && formik.errors.password ? ' is-invalid' : ''
                          }`}
                          value={formik.values.password}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <button
                          type="button"
                          className="sv-input-group__btn"
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      {formik.touched.password && formik.errors.password ? (
                        <div className="invalid-feedback d-block">{formik.errors.password}</div>
                      ) : null}
                    </div>

                    <div className="mt-3">
                      <label
                        htmlFor="confirmPassword"
                        className="form-label sv-form-label"
                      >
                        Confirm new password
                      </label>
                      <div className="sv-input-group">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder="Re-enter your new password"
                          className={`form-control sv-form-control${
                            formik.touched.confirmPassword && formik.errors.confirmPassword
                              ? ' is-invalid'
                              : ''
                          }`}
                          value={formik.values.confirmPassword}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <button
                          type="button"
                          className="sv-input-group__btn"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                        >
                          {showConfirmPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                        <div className="invalid-feedback d-block">
                          {formik.errors.confirmPassword}
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 mt-4 sv-auth__submit"
                      disabled={formik.isSubmitting}
                    >
                      Reset password
                    </button>

                    <div className="mt-3">
                      <button
                        type="button"
                        className="btn btn-link p-0 sv-auth__link"
                        onClick={() => navigate('/login', { state: { email } })}
                      >
                        Back to login
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
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
