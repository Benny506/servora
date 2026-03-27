import { Form, Formik } from 'formik'
import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as Yup from 'yup'
import { supabase } from '../../../lib/supabaseClient.js'
import { addAlert, hideLoader, showLoader } from '../../../store/uiSlice.js'

const EyeIcon = ({ isOpen }) => {
  if (isOpen) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M12 5c5.2 0 9.4 3.7 11 7-1.6 3.3-5.8 7-11 7S2.6 15.3 1 12c1.6-3.3 5.8-7 11-7zm0 2C7.9 7 4.4 9.8 3 12c1.4 2.2 4.9 5 9 5s7.6-2.8 9-5c-1.4-2.2-4.9-5-9-5zm0 2.2a2.8 2.8 0 110 5.6 2.8 2.8 0 010-5.6z"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M3.3 2l18.7 18.7-1.3 1.3-3-3c-1.7.7-3.6 1-5.7 1-5.2 0-9.4-3.7-11-7 1-2.1 3.2-4.6 6.2-6.1L2 3.3 3.3 2zm6.1 6.1C7 8.9 5.2 10.6 4 12c1.4 2.2 4.9 5 9 5 1.4 0 2.7-.3 3.8-.7l-1.7-1.7c-.6.5-1.3.7-2.1.7a2.8 2.8 0 01-2.8-2.8c0-.8.3-1.5.7-2.1l-1.5-1.5zM12 7c5.2 0 9.4 3.7 11 7-.6 1.2-1.6 2.6-2.9 3.8l-1.4-1.4c.9-.9 1.6-1.8 2-2.4-1.4-2.2-4.9-5-9-5-.7 0-1.4.1-2 .2L8.2 7.7C9.4 7.2 10.7 7 12 7zm0 2.2a2.8 2.8 0 012.8 2.8c0 .2 0 .5-.1.7l-3.4-3.4c.2-.1.5-.1.7-.1z"
      />
    </svg>
  )
}

export default function Security() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validationSchema = useMemo(
    () =>
      Yup.object({
        password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('password')], 'Passwords do not match')
          .required('Confirm password is required'),
      }),
    [],
  )

  return (
    <div>
      <div className="sv-page-head">
        <div className="sv-page-head__kicker">Account</div>
        <h1 className="sv-page-head__title">Security</h1>
        <p className="sv-page-head__text">Change your password.</p>
      </div>

      <div className="sv-card">
        <div className="sv-card__title">Change password</div>
        <div className="sv-card__text">
          {user?.email ? `You are signed in as ${user.email}.` : 'You must be signed in to change your password.'}
        </div>

        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validationSchema={validationSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            dispatch(showLoader('Updating password...'))
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

              if (!user) {
                dispatch(
                  addAlert({
                    type: 'warning',
                    title: 'Sign in required',
                    message: 'Please sign in again to change your password.',
                    timeoutMs: 5200,
                  }),
                )
                return
              }

              const { error } = await supabase.auth.updateUser({ password: values.password })
              if (error) {
                dispatch(
                  addAlert({
                    type: 'error',
                    title: 'Update failed',
                    message: error.message ?? 'Unable to update password.',
                    timeoutMs: 6500,
                  }),
                )
                return
              }

              dispatch(
                addAlert({
                  type: 'success',
                  title: 'Password updated',
                  message: 'Your password has been changed successfully.',
                  timeoutMs: 4200,
                }),
              )
              resetForm()
              setShowPassword(false)
              setShowConfirmPassword(false)
            } finally {
              dispatch(hideLoader())
              setSubmitting(false)
            }
          }}
        >
          {(formik) => (
            <Form noValidate className="mt-4">
              <div>
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
                    className="sv-input-group__btn d-grid place-items-center"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon isOpen={showPassword} />
                  </button>
                </div>
                {formik.touched.password && formik.errors.password ? (
                  <div className="invalid-feedback d-block">{formik.errors.password}</div>
                ) : null}
              </div>

              <div className="mt-3">
                <label htmlFor="confirmPassword" className="form-label sv-form-label">
                  Confirm password
                </label>
                <div className="sv-input-group">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-enter your new password"
                    className={`form-control sv-form-control${
                      formik.touched.confirmPassword && formik.errors.confirmPassword ? ' is-invalid' : ''
                    }`}
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <button
                    type="button"
                    className="sv-input-group__btn d-grid place-items-center"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    <EyeIcon isOpen={showConfirmPassword} />
                  </button>
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                  <div className="invalid-feedback d-block">{formik.errors.confirmPassword}</div>
                ) : null}
              </div>

              <div className="mt-4 d-flex gap-2 flex-wrap">
                <button type="submit" className="btn btn-primary" disabled={formik.isSubmitting}>
                  Update password
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
