import { Form, Formik } from 'formik'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import AuthTips from '../sections/auth/AuthTips.jsx'
import logoIcon from '../assets/servora-logo-icon.png'
import { supabase } from '../lib/supabaseClient.js'
import { authBootstrap } from '../store/authSlice.js'
import { addAlert, hideLoader, showLoader } from '../store/uiSlice.js'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    dispatch(hideLoader())
  }, [dispatch])

  const initialEmail = typeof location.state?.email === 'string' ? location.state.email : ''
  const from = typeof location.state?.from === 'string' ? location.state.from : '/core'

  const validationSchema = useMemo(
    () =>
      Yup.object({
        email: Yup.string().email('Enter a valid email').required('Email is required'),
        password: Yup.string().required('Password is required'),
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
                <h1 className="sv-auth__title">Welcome back</h1>
                <p className="sv-auth__subtitle">Sign in to continue.</p>
              </div>

              <Formik
                initialValues={{ email: initialEmail, password: '' }}
                enableReinitialize
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  dispatch(showLoader('Signing in...'))

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

                    const { error } = await supabase.auth.signInWithPassword({
                      email: values.email,
                      password: values.password,
                    })

                    if (error) {
                      dispatch(
                        addAlert({
                          type: 'error',
                          title: 'Login failed',
                          message: error.message ?? 'Unable to sign in.',
                          timeoutMs: 6500,
                        }),
                      )
                      return
                    }

                    const resultAction = await dispatch(authBootstrap({ source: 'login' }))
                    if (authBootstrap.fulfilled.match(resultAction)) {
                      dispatch(
                        addAlert({
                          type: 'success',
                          title: 'Signed in',
                          message: 'Welcome back.',
                          timeoutMs: 3000,
                        }),
                      )
                      navigate(from, { replace: true })
                      return
                    }

                    dispatch(
                      addAlert({
                        type: 'error',
                        title: 'Login blocked',
                        message: 'Unable to start a session. Please try again.',
                        timeoutMs: 6500,
                      }),
                    )
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

                    <div className="mt-3">
                      <label htmlFor="password" className="form-label sv-form-label">
                        Password
                      </label>
                      <div className="sv-input-group">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          placeholder="Enter your password"
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

                    <button
                      type="submit"
                      className="btn btn-primary w-100 mt-4 sv-auth__submit"
                      disabled={formik.isSubmitting}
                    >
                      Sign in
                    </button>

                    <div className="mt-3 d-flex justify-content-between align-items-center">
                      <button
                        type="button"
                        className="btn btn-link p-0 sv-auth__link"
                        onClick={() => navigate('/forgot-password', { state: { email: formik.values.email } })}
                      >
                        Forgot password?
                      </button>
                      <button
                        type="button"
                        className="btn btn-link p-0 sv-auth__link"
                        onClick={() => navigate('/signup')}
                      >
                        Create an account
                      </button>
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
