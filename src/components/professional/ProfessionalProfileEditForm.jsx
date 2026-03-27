import { Form, Formik } from 'formik'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import { SUPABASE_ANON_KEY, supabase } from '../../lib/supabaseClient.js'
import { setProfessionalProfile } from '../../store/authSlice.js'
import { addAlert, hideLoader, showLoader } from '../../store/uiSlice.js'

const BUCKET = 'user_profiles'

const splitLocationText = (text) => {
  const raw = String(text ?? '').trim()
  if (!raw) return { city: '', state: '', country: '' }

  const parts = raw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)

  if (parts.length >= 3) {
    const country = parts[parts.length - 1]
    const state = parts[parts.length - 2]
    const city = parts.slice(0, -2).join(', ')
    return { city, state, country }
  }

  if (parts.length === 2) {
    return { city: parts[0], state: parts[1], country: '' }
  }

  return { city: parts[0] ?? '', state: '', country: '' }
}

const buildLocationText = ({ city, state, country }) => {
  const c = String(city ?? '').trim()
  const s = String(state ?? '').trim()
  const co = String(country ?? '').trim()
  return `${c}, ${s}, ${co}`
}

export default function ProfessionalProfileEditForm({ profile }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [existingPreviewUrl, setExistingPreviewUrl] = useState('')

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    let cancelled = false
    const path = profile?.profile_img ?? ''
    if (!supabase || !path) {
      setExistingPreviewUrl('')
      return
    }

    const tryBuildUrl = async () => {
      try {
        const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 10)
        if (!cancelled) setExistingPreviewUrl(data?.signedUrl ?? '')
      } catch {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
        if (!cancelled) setExistingPreviewUrl(data?.publicUrl ?? '')
      }
    }

    tryBuildUrl()
    return () => {
      cancelled = true
    }
  }, [profile?.profile_img])

  const initialValues = useMemo(() => {
    const loc = splitLocationText(profile?.location_text)
    return {
      title: profile?.title ?? '',
      bio: profile?.bio ?? '',
      city: loc.city,
      state: loc.state,
      country: loc.country,
      profile_img: profile?.profile_img ?? '',
    }
  }, [profile])

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
          message: 'Please sign in to edit your professional profile.',
          timeoutMs: 5200,
        }),
      )
      navigate('/login', { replace: true, state: { from: '/dashboard/professional-profile' } })
      return
    }

    dispatch(showLoader('Updating profile...'))

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
        const path = `${user.id}/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`

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

      const payload = {
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
        .update(payload)
        .eq('user_id', user.id)
        .select('*')
        .maybeSingle()

      if (error) {
        dispatch(
          addAlert({
            type: 'error',
            title: 'Update failed',
            message: error.message ?? 'Unable to update profile.',
            timeoutMs: 6500,
          }),
        )
        return
      }

      dispatch(setProfessionalProfile(data ?? null))
      dispatch(
        addAlert({
          type: 'success',
          title: 'Profile updated',
          message: 'Your professional profile has been updated.',
          timeoutMs: 4200,
        }),
      )
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
          <div className="row g-3 g-md-4">
            <div className="col-12 col-lg-6">
              <label htmlFor="title" className="form-label sv-form-label">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className={`form-control sv-form-control${
                  formik.touched.title && formik.errors.title ? ' is-invalid' : ''
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
                className={`form-control sv-form-control${
                  formik.touched.country && formik.errors.country ? ' is-invalid' : ''
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
                className={`form-control sv-form-control${
                  formik.touched.state && formik.errors.state ? ' is-invalid' : ''
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
                className={`form-control sv-form-control${
                  formik.touched.city && formik.errors.city ? ' is-invalid' : ''
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
                className={`form-control sv-form-control${
                  formik.touched.bio && formik.errors.bio ? ' is-invalid' : ''
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
                  if (picked) formik.setFieldValue('profile_img', picked.name, true)
                }}
              />
              {formik.touched.profile_img && formik.errors.profile_img ? (
                <div className="invalid-feedback d-block">{formik.errors.profile_img}</div>
              ) : null}

              <div className="p-3 rounded-4 border bg-body-tertiary mt-3">
                <div className="fw-semibold">Preview</div>
                <div className="mt-2">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Selected profile preview" className="sv-profile-preview" />
                  ) : existingPreviewUrl ? (
                    <img
                      src={existingPreviewUrl}
                      alt="Current profile preview"
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
            <button type="submit" className="btn btn-primary" disabled={formik.isSubmitting}>
              Save changes
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
