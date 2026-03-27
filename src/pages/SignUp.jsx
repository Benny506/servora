import { Form, Formik } from 'formik'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import AuthTips from '../sections/auth/AuthTips.jsx'
import logoIcon from '../assets/servora-logo-icon.png'
import { addAlert, hideLoader, showLoader } from '../store/uiSlice.js'
import { supabase } from '../lib/supabaseClient.js'

export default function SignUp() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    dispatch(hideLoader())
  }, [dispatch])

  const validationSchema = useMemo(
    () =>
      Yup.object({
        email: Yup.string().email('Enter a valid email').required('Email is required'),
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
                <h1 className="sv-auth__title">Create your account</h1>
                <p className="sv-auth__subtitle">
                  Join, set up your professional profile, and start connecting with
                  people who need your service.
                </p>
              </div>

              <Formik
                initialValues={{ email: '', password: '', confirmPassword: '' }}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  dispatch(showLoader('Checking email...'))

                  try {
                    if (!supabase) {
                      dispatch(
                        addAlert({
                          type: 'error',
                          title: 'Missing configuration',
                          message:
                            'Supabase environment variables are not set for this app.',
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
                          title: 'Signup failed',
                          message: error.message ?? 'Unable to check email.',
                          timeoutMs: 6500,
                        }),
                      )
                      return
                    }

                    const exists = data === true || data?.exists === true

                    if (exists) {
                      dispatch(
                        addAlert({
                          type: 'warning',
                          title: 'Email already registered',
                          message: 'Try signing in with this email instead.',
                          timeoutMs: 5200,
                        }),
                      )
                      return
                    }

                    dispatch(hideLoader())
                    navigate('/verify-otp', {
                      state: { email: values.email, password: values.password },
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
                          formik.touched.email && formik.errors.email
                            ? ' is-invalid'
                            : ''
                        }`}
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.email && formik.errors.email ? (
                        <div className="invalid-feedback">{formik.errors.email}</div>
                      ) : null}
                    </div>

                    <div className="mt-3">
                      <label htmlFor="password" className="form-label sv-form-label">
                        Password
                      </label>
                      <div className="sv-input-group">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder="Create a strong password"
                          className={`form-control sv-form-control${
                            formik.touched.password && formik.errors.password
                              ? ' is-invalid'
                              : ''
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
                        <div className="invalid-feedback d-block">
                          {formik.errors.password}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-3">
                      <label
                        htmlFor="confirmPassword"
                        className="form-label sv-form-label"
                      >
                        Confirm password
                      </label>
                      <div className="sv-input-group">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder="Re-enter your password"
                          className={`form-control sv-form-control${
                            formik.touched.confirmPassword &&
                            formik.errors.confirmPassword
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
                      {formik.touched.confirmPassword &&
                      formik.errors.confirmPassword ? (
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
                      Create account
                    </button>

                    <div className="mt-3 d-flex justify-content-between align-items-center">
                      <button
                        type="button"
                        className="btn btn-link p-0 sv-auth__link"
                        onClick={() => navigate('/login')}
                      >
                        Already have an account? Sign in
                      </button>
                    </div>

                    <div className="sv-auth__fineprint mt-3">
                      By continuing, you agree to Servora’s terms and privacy policy.
                    </div>

                    <div className="mt-3">
                      <button
                        type="button"
                        className="btn btn-link p-0 sv-auth__link"
                        onClick={() => navigate('/')}
                      >
                        Back to landing page
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
