import { Form, Formik } from 'formik'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import { SUPABASE_ANON_KEY, supabase } from '../../lib/supabaseClient.js'
import { setProfessionalProfile } from '../../store/authSlice.js'
import { addAlert, hideLoader, showLoader } from '../../store/uiSlice.js'

const BUCKET = 'user_profiles'

const buildLocationText = ({ city, state, country }) => {
  const c = String(city ?? '').trim()
  const s = String(state ?? '').trim()
  const co = String(country ?? '').trim()
  return `${c}, ${s}, ${co}`
}

export default function ProfessionalProfileForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)

  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const initialValues = useMemo(() => {
    return {
      title: '',
      bio: '',
      city: '',
      state: '',
      country: '',
      profile_img: '',
    }
  }, [])

  const validationSchema = useMemo(
    () =>
      Yup.object({
        title: Yup.string().required('Title is required'),
        bio: Yup.string().required('Bio is required'),
        country: Yup.string().required('Country is required'),
        state: Yup.string().required('State is required'),
        city: Yup.string().required('City is required'),
        profile_img: Yup.string().required('Profile image is required'),
      }),
    [],
  )

  const isSignedIn = Boolean(user)

  const onSubmit = async (values, { setSubmitting, setFieldValue }) => {
    if (!isSignedIn) {
      dispatch(
        addAlert({
          type: 'warning',
          title: 'Sign in required',
          message: 'Sign in to create or update your professional profile.',
          timeoutMs: 5200,
        }),
      )
      navigate('/login', { replace: true, state: { from: '/professional-profile' } })
      return
    }

    dispatch(showLoader('Creating profile...'))

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

      let profileImgPath = values.profile_img

      if (file) {
        const ext = file.name.includes('.') ? file.name.split('.').pop() : 'png'
        const path = `${user.id}/${Date.now()}-${Math.random()
          .toString(16)
          .slice(2)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { upsert: false })

        if (uploadError) {
          dispatch(
            addAlert({
              type: 'error',
              title: 'Upload failed',
              message: uploadError.message ?? 'Unable to upload image.',
              timeoutMs: 6500,
            }),
          )
          return
        }

        profileImgPath = path
        setFieldValue('profile_img', path, false)
      }

      if (!profileImgPath) {
        dispatch(
          addAlert({
            type: 'warning',
            title: 'Profile image required',
            message: 'Please select a profile image before continuing.',
            timeoutMs: 5200,
          }),
        )
        return
      }

      const payload = {
        user_id: user.id,
        title: values.title,
        bio: values.bio,
        location_text: buildLocationText({
          city: values.city,
          state: values.state,
          country: values.country,
        }),
        profile_img: profileImgPath,
      }

      const { data, error } = await supabase
        .from('sv_professional_profiles')
        .insert(payload)
        .select('*')
        .maybeSingle()

      if (error) {
        const msg = error.message ?? 'Unable to create profile.'
        if (msg.toLowerCase().includes('duplicate key') || error.code === '23505') {
          dispatch(
            addAlert({
              type: 'warning',
              title: 'Profile already exists',
              message: 'A professional profile already exists for this account.',
              timeoutMs: 6500,
            }),
          )
          return
        }

        dispatch(
          addAlert({
            type: 'error',
            title: 'Creation failed',
            message: msg,
            timeoutMs: 6500,
          }),
        )
        return
      }
      dispatch(setProfessionalProfile(data ?? null))
      dispatch(
        addAlert({
          type: 'success',
          title: 'Profile created',
          message: 'Your professional profile is ready.',
          timeoutMs: 4200,
        }),
      )
      navigate('/dashboard/professional-profile')
    } finally {
      dispatch(hideLoader())
      setSubmitting(false)
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {(formik) => (
        <Form noValidate>
          {!isSignedIn ? (
            <div className="p-3 rounded-4 border bg-body-tertiary">
              <div className="fw-semibold">Account required</div>
              <div className="text-secondary mt-1">
                You can preview this form, but you need an account to create a professional profile.
              </div>
              <div className="mt-3 d-flex gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate('/signup')}
                >
                  Create account
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </button>
              </div>
            </div>
          ) : null}

          <div className="row g-3 g-md-4 mt-1">
            <div className="col-12 col-lg-6">
              <label htmlFor="title" className="form-label sv-form-label">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder='e.g. "Plumber", "Designer"'
                className={`form-control sv-form-control${formik.touched.title && formik.errors.title ? ' is-invalid' : ''
                  }`}
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.title && formik.errors.title ? (
                <div className="invalid-feedback">{formik.errors.title}</div>
              ) : null}
            </div>

            <div className="col-12 col-lg-6">
              <label htmlFor="country" className="form-label sv-form-label">
                Country
              </label>
              <input
                id="country"
                name="country"
                type="text"
                placeholder="e.g. Nigeria"
                className={`form-control sv-form-control${formik.touched.country && formik.errors.country ? ' is-invalid' : ''
                  }`}
                value={formik.values.country}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.country && formik.errors.country ? (
                <div className="invalid-feedback">{formik.errors.country}</div>
              ) : null}
            </div>

            <div className="col-12 col-lg-6">
              <label htmlFor="state" className="form-label sv-form-label">
                State
              </label>
              <input
                id="state"
                name="state"
                type="text"
                placeholder="e.g. Lagos"
                className={`form-control sv-form-control${formik.touched.state && formik.errors.state ? ' is-invalid' : ''
                  }`}
                value={formik.values.state}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.state && formik.errors.state ? (
                <div className="invalid-feedback">{formik.errors.state}</div>
              ) : null}
            </div>

            <div className="col-12 col-lg-6">
              <label htmlFor="city" className="form-label sv-form-label">
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                placeholder="e.g. Ikeja"
                className={`form-control sv-form-control${formik.touched.city && formik.errors.city ? ' is-invalid' : ''
                  }`}
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.city && formik.errors.city ? (
                <div className="invalid-feedback">{formik.errors.city}</div>
              ) : null}
            </div>

            <div className="col-12">
              <label htmlFor="bio" className="form-label sv-form-label">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                placeholder="Tell clients what you do and what makes your service reliable."
                className={`form-control sv-form-control${formik.touched.bio && formik.errors.bio ? ' is-invalid' : ''
                  }`}
                value={formik.values.bio}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.bio && formik.errors.bio ? (
                <div className="invalid-feedback">{formik.errors.bio}</div>
              ) : null}
            </div>

            <div className="col-12">
              <label htmlFor="profile_img_file" className="form-label sv-form-label">
                Profile image
              </label>
              <input
                id="profile_img_file"
                type="file"
                accept="image/*"
                className="form-control sv-form-control"
                onChange={(e) => {
                  const picked = e.target.files?.[0] ?? null
                  setFile(picked)
                  formik.setFieldValue('profile_img', picked ? picked.name : '', true)
                }}
              />
              {formik.touched.profile_img && formik.errors.profile_img ? (
                <div className="invalid-feedback d-block">{formik.errors.profile_img}</div>
              ) : null}

              <div className="p-3 rounded-4 border bg-body-tertiary mt-3">
                <div className="fw-semibold text-black">Preview</div>
                <div className="mt-2">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Selected profile preview"
                      className="sv-profile-preview"
                    />
                  ) : formik.values.profile_img ? (
                    <div className="sv-profile-preview__path">{formik.values.profile_img}</div>
                  ) : (
                    <div className="sv-profile-preview__path">No image selected yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 d-flex gap-2 flex-wrap">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={formik.isSubmitting || !isSignedIn}
            >
              {isSignedIn ? 'Create profile' : 'Sign in to continue'}
            </button>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
