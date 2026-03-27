import { Form, Formik } from 'formik'
import { useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import AuthTips from '../sections/auth/AuthTips.jsx'
import logoIcon from '../assets/servora-logo-icon.png'
import { supabase } from '../lib/supabaseClient.js'
import { addAlert, hideLoader, showLoader } from '../store/uiSlice.js'

export default function ForgotPassword() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    dispatch(hideLoader())
  }, [dispatch])

  const initialEmail = typeof location.state?.email === 'string' ? location.state.email : ''

  const validationSchema = useMemo(
    () =>
      Yup.object({
        email: Yup.string().email('Enter a valid email').required('Email is required'),
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
                <h1 className="sv-auth__title">Forgot password</h1>
                <p className="sv-auth__subtitle">
                  Enter your email to continue to password reset.
                </p>
              </div>

              <Formik
                initialValues={{ email: initialEmail }}
                enableReinitialize
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  dispatch(showLoader('Checking email...'))
                  try {
                    if (!supabase) {
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

                    const { data, error } = await supabase.rpc('user_exists', {
                      email_input: values.email,
                    })

                    if (error) {
                      dispatch(
                        addAlert({
                          type: 'error',
                          title: 'Request failed',
                          message: error.message ?? 'Unable to check email.',
                          timeoutMs: 6500,
                        }),
                      )
                      return
                    }

                    const exists = data === true || data?.exists === true
                    if (!exists) {
                      dispatch(
                        addAlert({
                          type: 'warning',
                          title: 'Account not found',
                          message: 'No user exists with that email.',
                          timeoutMs: 5200,
                        }),
                      )
                      return
                    }

                    navigate('/verify-otp', {
                      state: { email: values.email, mode: 'forgot-password' },
                    })
                  } finally {
                    dispatch(hideLoader())
                    setSubmitting(false)
                  }
                }}
              >
                {(formik) => (
                  <Form noValidate>
                    <div className="mt-4">
                      <label htmlFor="email" className="form-label sv-form-label">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className={`form-control sv-form-control${
                          formik.touched.email && formik.errors.email ? ' is-invalid' : ''
                        }`}
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.email && formik.errors.email ? (
                        <div className="invalid-feedback">{formik.errors.email}</div>
                      ) : null}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 mt-4 sv-auth__submit"
                      disabled={formik.isSubmitting}
                    >
                      Continue
                    </button>

                    <div className="mt-3 d-flex justify-content-between align-items-center">
                      <button
                        type="button"
                        className="btn btn-link p-0 sv-auth__link"
                        onClick={() => navigate('/login')}
                      >
                        Back to login
                      </button>
                      <button
                        type="button"
                        className="btn btn-link p-0 sv-auth__link"
                        onClick={() => navigate('/signup')}
                      >
                        Create an account
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
