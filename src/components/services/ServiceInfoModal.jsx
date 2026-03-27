import { Modal } from 'react-bootstrap'
import { Form, Formik } from 'formik'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as Yup from 'yup'
import { SUPABASE_ANON_KEY, supabase } from '../../lib/supabaseClient.js'
import { addService, updateService } from '../../store/authSlice.js'
import { addAlert, hideLoader, showLoader } from '../../store/uiSlice.js'
import FullscreenMediaViewer from '../FullscreenMediaViewer.jsx'

const BUCKET = 'sv_services'
const MAX_FILES = 10
const MAX_BYTES = 2 * 1024 * 1024

const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const pickFileExt = (name) => {
  if (!name) return 'bin'
  const parts = name.split('.')
  if (parts.length < 2) return 'bin'
  return parts.pop() || 'bin'
}

export default function ServiceInfoModal({ show, onHide, professionalProfile, service }) {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const isEdit = Boolean(service?.id)
  const isSelf = Boolean(user?.id && professionalProfile?.user_id && professionalProfile.user_id === user.id)

  const [newFiles, setNewFiles] = useState([])
  const [newPreviews, setNewPreviews] = useState([])
  const [keptExisting, setKeptExisting] = useState(() => service?.images ?? [])
  const [existingUrls, setExistingUrls] = useState({})
  const fileInputRef = useRef(null)
  const [providerImgUrl, setProviderImgUrl] = useState('')
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)

  useEffect(() => {
    if (!show) return
    setNewFiles([])
    setKeptExisting(service?.images ?? [])
  }, [service?.images, show])

  useEffect(() => {
    const urls = newFiles.map((f) => URL.createObjectURL(f))
    setNewPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [newFiles])

  useEffect(() => {
    let cancelled = false
    const paths = keptExisting
    if (!supabase || paths.length === 0) {
      setExistingUrls({})
      return
    }

    const run = async () => {
      const next = {}
      await Promise.all(
        paths.map(async (p) => {
          try {
            const { data } = await supabase.storage.from(BUCKET).createSignedUrl(p, 60 * 10)
            next[p] = data?.signedUrl ?? ''
          } catch {
            const { data } = supabase.storage.from(BUCKET).getPublicUrl(p)
            next[p] = data?.publicUrl ?? ''
          }
        }),
      )
      if (!cancelled) setExistingUrls(next)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [keptExisting])

  useEffect(() => {
    let cancelled = false
    const path = professionalProfile?.profile_img
    const load = async () => {
      if (!path || !supabase) {
        setProviderImgUrl('')
        return
      }
      try {
        const { data } = await supabase.storage.from('user_profiles').createSignedUrl(path, 60 * 10)
        if (!cancelled) setProviderImgUrl(data?.signedUrl ?? '')
      } catch {
        const { data } = supabase.storage.from('user_profiles').getPublicUrl(path)
        if (!cancelled) setProviderImgUrl(data?.publicUrl ?? '')
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [professionalProfile?.profile_img])

  const initialValues = useMemo(() => {
    return {
      title: service?.title ?? '',
      description: service?.description ?? '',
      starting_price: service?.starting_price ?? '',
      ending_price: service?.ending_price ?? '',
      is_active: service?.is_active !== false,
    }
  }, [service?.description, service?.ending_price, service?.is_active, service?.starting_price, service?.title])

  const validationSchema = useMemo(
    () =>
      Yup.object({
        title: Yup.string().required('Title is required'),
        description: Yup.string().required('Description is required'),
        starting_price: Yup.number()
          .transform((value, originalValue) => (originalValue === '' ? null : value))
          .typeError('Starting price must be a number')
          .min(0, 'Starting price must be positive')
          .nullable()
          .test(
            'starting-lte-ending',
            'Starting price must be less than or equal to ending price',
            function (value) {
              const ending = this.parent?.ending_price
              if (value === null || value === undefined) return true
              if (ending === null || ending === undefined) return true
              return value <= ending
            },
          ),
        ending_price: Yup.number()
          .transform((value, originalValue) => (originalValue === '' ? null : value))
          .typeError('Ending price must be a number')
          .min(0, 'Ending price must be positive')
          .nullable(),
      }),
    [],
  )

  const totalSelected = keptExisting.length + newFiles.length
  const viewerItems = useMemo(() => {
    const existing = keptExisting.map((p) => existingUrls[p] || '')
    return [...existing, ...newPreviews]
  }, [existingUrls, keptExisting, newPreviews])

  const pickFiles = (files) => {
    const incoming = Array.from(files ?? [])
    const valid = []

    for (const f of incoming) {
      if (f.size > MAX_BYTES) {
        dispatch(
          addAlert({
            type: 'warning',
            title: 'File too large',
            message: `${f.name} exceeds 2MB.`,
            timeoutMs: 5200,
          }),
        )
        continue
      }
      valid.push(f)
    }

    const room = Math.max(0, MAX_FILES - keptExisting.length - newFiles.length)
    const next = room > 0 ? valid.slice(0, room) : []
    if (next.length === 0) return
    setNewFiles((prev) => [...prev, ...next])
  }

  const removeExisting = (path) => {
    setKeptExisting((prev) => prev.filter((p) => p !== path))
  }

  const removeNewAt = (idx) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const onSubmit = async (values, { setSubmitting }) => {
    if (!user || !professionalProfile?.id) {
      dispatch(
        addAlert({
          type: 'warning',
          title: 'Professional profile required',
          message: 'Create a professional profile before adding services.',
          timeoutMs: 5200,
        }),
      )
      setSubmitting(false)
      return
    }

    dispatch(showLoader(isEdit ? 'Updating service...' : 'Creating service...'))
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

      const serviceId = isEdit ? service.id : createId()
      const uploadedPaths = []

      for (const f of newFiles) {
        const ext = pickFileExt(f.name)
        const path = `${professionalProfile.id}/${serviceId}/${Date.now()}-${Math.random()
          .toString(16)
          .slice(2)}.${ext}`

        const { error } = await supabase.storage.from(BUCKET).upload(path, f, { upsert: false })
        if (error) {
          dispatch(
            addAlert({
              type: 'error',
              title: 'Upload failed',
              message: error.message ?? 'Unable to upload media.',
              timeoutMs: 6500,
            }),
          )
          return
        }
        uploadedPaths.push(path)
      }

      const images = [...keptExisting, ...uploadedPaths].slice(0, MAX_FILES)

      const payload = {
        professional_id: professionalProfile.id,
        title: values.title,
        description: values.description,
        starting_price: values.starting_price === '' ? null : Number(values.starting_price),
        ending_price: values.ending_price === '' ? null : Number(values.ending_price),
        is_active: values.is_active,
        images,
      }

      if (isEdit) {
        const { data, error } = await supabase
          .from('sv_services')
          .update(payload)
          .eq('id', service.id)
          .select('*')
          .maybeSingle()

        if (error) {
          dispatch(
            addAlert({
              type: 'error',
              title: 'Update failed',
              message: error.message ?? 'Unable to update service.',
              timeoutMs: 6500,
            }),
          )
          return
        }

        dispatch(updateService(data ?? service))
        dispatch(
          addAlert({
            type: 'success',
            title: 'Service updated',
            message: 'Changes saved successfully.',
            timeoutMs: 4200,
          }),
        )
      } else {
        const { data, error } = await supabase
          .from('sv_services')
          .insert({ id: serviceId, ...payload })
          .select('*')
          .maybeSingle()

        if (error) {
          dispatch(
            addAlert({
              type: 'error',
              title: 'Creation failed',
              message: error.message ?? 'Unable to create service.',
              timeoutMs: 6500,
            }),
          )
          return
        }

        dispatch(addService(data ?? { id: serviceId, ...payload }))
        dispatch(
          addAlert({
            type: 'success',
            title: 'Service created',
            message: 'Your service is now visible on your profile.',
            timeoutMs: 4200,
          }),
        )
      }

      onHide?.()
    } finally {
      dispatch(hideLoader())
      setSubmitting(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered size="lg" contentClassName="sv-portfolio-modal">
      <div className="sv-portfolio-modal__head">
        <div className="sv-portfolio-modal__title">{isEdit ? 'Edit service' : 'Add service'}</div>
        <button type="button" className="sv-portfolio-modal__close" onClick={onHide} aria-label="Close">
          ×
        </button>
      </div>

      <div className="sv-portfolio-modal__body">
        <div className="sv-service-card__provider mb-3">
          {providerImgUrl ? (
            <img src={providerImgUrl} alt="" className="sv-service-card__provider-img" />
          ) : (
            <div className="sv-service-card__provider-placeholder" />
          )}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="sv-service-card__provider-name">{professionalProfile?.title || 'Professional'}</div>
            {isSelf ? <div className="sv-pill sv-pill--on">This is you</div> : null}
          </div>
        </div>
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {(formik) => (
            <Form noValidate>
              <div className="row g-3 g-md-4">
                <div className="col-12 col-md-6">
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

                <div className="col-12 col-md-6">
                  <div className="sv-portfolio-modal__meta">
                    <div className="sv-portfolio-modal__meta-title">Media (optional)</div>
                    <div className="sv-portfolio-modal__meta-text">
                      {totalSelected}/{MAX_FILES} selected • Max 2MB each
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="form-control sv-form-control"
                    onChange={(e) => {
                      pickFiles(e.target.files)
                      e.target.value = ''
                    }}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="starting_price" className="form-label sv-form-label">
                    Starting price (₦)
                  </label>
                  <div className="sv-money">
                    <span className="sv-money__prefix">₦</span>
                    <input
                      id="starting_price"
                      name="starting_price"
                      type="number"
                      step="any"
                      inputMode="decimal"
                      className={`form-control sv-form-control sv-money__input${
                        formik.touched.starting_price && formik.errors.starting_price ? ' is-invalid' : ''
                      }`}
                      value={formik.values.starting_price}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                  {formik.touched.starting_price && formik.errors.starting_price ? (
                    <div className="invalid-feedback">{formik.errors.starting_price}</div>
                  ) : null}
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="ending_price" className="form-label sv-form-label">
                    Ending price (₦)
                  </label>
                  <div className="sv-money">
                    <span className="sv-money__prefix">₦</span>
                    <input
                      id="ending_price"
                      name="ending_price"
                      type="number"
                      step="any"
                      inputMode="decimal"
                      className={`form-control sv-form-control sv-money__input${
                        formik.touched.ending_price && formik.errors.ending_price ? ' is-invalid' : ''
                      }`}
                      value={formik.values.ending_price}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                  {formik.touched.ending_price && formik.errors.ending_price ? (
                    <div className="invalid-feedback">{formik.errors.ending_price}</div>
                  ) : null}
                </div>

                <div className="col-12">
                  <div className="sv-active">
                    <div className="sv-active__left">
                      <div className="sv-active__title">Active</div>
                      <div className="sv-active__text">
                        {formik.values.is_active ? 'Visible' : 'Hidden'}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`sv-active__toggle${
                        formik.values.is_active ? ' sv-active__toggle--on' : ''
                      }`}
                      onClick={() => formik.setFieldValue('is_active', !formik.values.is_active)}
                      aria-pressed={formik.values.is_active}
                    >
                      <span className="sv-active__knob" />
                    </button>
                  </div>
                </div>

                <div className="col-12">
                  <label htmlFor="description" className="form-label sv-form-label">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    className={`form-control sv-form-control${
                      formik.touched.description && formik.errors.description ? ' is-invalid' : ''
                    }`}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.description && formik.errors.description ? (
                    <div className="invalid-feedback">{formik.errors.description}</div>
                  ) : null}
                </div>

                {totalSelected > 0 ? (
                  <div className="col-12">
                    <div className="sv-portfolio-grid">
                      {keptExisting.map((path, idx) => (
                        <div key={path} className="sv-portfolio-thumb">
                          {existingUrls[path] ? (
                            <img
                              src={existingUrls[path]}
                              alt=""
                              className="sv-portfolio-thumb__img"
                              onClick={() => {
                                setViewerIndex(idx)
                                setViewerOpen(true)
                              }}
                            />
                          ) : (
                            <div className="sv-portfolio-thumb__placeholder" />
                          )}
                          <button
                            type="button"
                            className="sv-portfolio-thumb__remove"
                            onClick={() => removeExisting(path)}
                            aria-label="Remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      {newPreviews.map((url, i) => (
                        <div key={url} className="sv-portfolio-thumb">
                          <img
                            src={url}
                            alt=""
                            className="sv-portfolio-thumb__img"
                            onClick={() => {
                              setViewerIndex(keptExisting.length + i)
                              setViewerOpen(true)
                            }}
                          />
                          <button
                            type="button"
                            className="sv-portfolio-thumb__remove"
                            onClick={() => removeNewAt(i)}
                            aria-label="Remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="sv-portfolio-modal__footer">
                <button
                  type="button"
                  className="btn btn-outline-primary sv-portfolio-modal__btn"
                  onClick={onHide}
                  disabled={formik.isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary sv-portfolio-modal__btn"
                  disabled={formik.isSubmitting}
                >
                  {isEdit ? 'Save changes' : 'Create service'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
      <FullscreenMediaViewer
        show={viewerOpen}
        onHide={() => setViewerOpen(false)}
        items={viewerItems}
        startIndex={viewerIndex}
        title="Service media"
      />
    </Modal>
  )
}
