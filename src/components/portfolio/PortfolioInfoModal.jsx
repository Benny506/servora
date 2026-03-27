import { Modal } from 'react-bootstrap'
import { Form, Formik } from 'formik'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as Yup from 'yup'
import { SUPABASE_ANON_KEY, supabase } from '../../lib/supabaseClient.js'
import { addPortfolio, updatePortfolio } from '../../store/authSlice.js'
import { addAlert, hideLoader, showLoader } from '../../store/uiSlice.js'

const BUCKET = 'sv_portfolios'
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

export default function PortfolioInfoModal({ show, onHide, professionalProfile, portfolio }) {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const isEdit = Boolean(portfolio?.id)

  const [newFiles, setNewFiles] = useState([])
  const [newPreviews, setNewPreviews] = useState([])
  const [keptExisting, setKeptExisting] = useState(() => portfolio?.images ?? [])
  const [existingUrls, setExistingUrls] = useState({})
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!show) return
    setNewFiles([])
    setKeptExisting(portfolio?.images ?? [])
  }, [portfolio?.images, show])

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

  const initialValues = useMemo(() => {
    return {
      title: portfolio?.title ?? '',
      description: portfolio?.description ?? '',
      is_active: portfolio?.is_active !== false,
    }
  }, [portfolio?.description, portfolio?.is_active, portfolio?.title])

  const validationSchema = useMemo(
    () =>
      Yup.object({
        title: Yup.string().required('Title is required'),
        description: Yup.string().required('Description is required'),
      }),
    [],
  )

  const totalSelected = keptExisting.length + newFiles.length

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
          message: 'Create a professional profile before adding portfolios.',
          timeoutMs: 5200,
        }),
      )
      return
    }

    const finalCount = keptExisting.length + newFiles.length
    if (finalCount < 1) {
      dispatch(
        addAlert({
          type: 'warning',
          title: 'Add at least one image',
          message: 'Select at least one media file.',
          timeoutMs: 5200,
        }),
      )
      return
    }

    dispatch(showLoader(isEdit ? 'Updating portfolio...' : 'Creating portfolio...'))
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

      const portfolioId = isEdit ? portfolio.id : createId()
      const uploadedPaths = []

      for (const f of newFiles) {
        const ext = pickFileExt(f.name)
        const path = `${professionalProfile.id}/${portfolioId}/${Date.now()}-${Math.random()
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

      if (images.length < 1) {
        dispatch(
          addAlert({
            type: 'warning',
            title: 'Add at least one image',
            message: 'Select at least one media file.',
            timeoutMs: 5200,
          }),
        )
        return
      }

      if (isEdit) {
        const { data, error } = await supabase
          .from('sv_portfolios')
          .update({
            title: values.title,
            description: values.description,
            is_active: values.is_active,
            images,
          })
          .eq('id', portfolio.id)
          .select('*')
          .maybeSingle()

        if (error) {
          dispatch(
            addAlert({
              type: 'error',
              title: 'Update failed',
              message: error.message ?? 'Unable to update portfolio.',
              timeoutMs: 6500,
            }),
          )
          return
        }

        dispatch(updatePortfolio(data ?? portfolio))
        dispatch(
          addAlert({
            type: 'success',
            title: 'Portfolio updated',
            message: 'Changes saved successfully.',
            timeoutMs: 4200,
          }),
        )
      } else {
        const { data, error } = await supabase
          .from('sv_portfolios')
          .insert({
            id: portfolioId,
            professional_id: professionalProfile.id,
            title: values.title,
            description: values.description,
            is_active: values.is_active,
            images,
          })
          .select('*')
          .maybeSingle()

        if (error) {
          dispatch(
            addAlert({
              type: 'error',
              title: 'Creation failed',
              message: error.message ?? 'Unable to create portfolio.',
              timeoutMs: 6500,
            }),
          )
          return
        }

        dispatch(addPortfolio(data ?? { id: portfolioId, professional_id: professionalProfile.id, ...values, images }))
        dispatch(
          addAlert({
            type: 'success',
            title: 'Portfolio created',
            message: 'Your portfolio is now visible on your profile.',
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
        <div className="sv-portfolio-modal__title">{isEdit ? 'Edit portfolio' : 'Add portfolio'}</div>
        <button type="button" className="sv-portfolio-modal__close" onClick={onHide} aria-label="Close">
          ×
        </button>
      </div>

      <div className="sv-portfolio-modal__body">
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
                    <div className="sv-portfolio-modal__meta-title">Media</div>
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

                <div className="col-12">
                  <div className="sv-portfolio-grid">
                    {keptExisting.map((path) => (
                      <div key={path} className="sv-portfolio-thumb">
                        {existingUrls[path] ? (
                          <img src={existingUrls[path]} alt="" className="sv-portfolio-thumb__img" />
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
                        <img src={url} alt="" className="sv-portfolio-thumb__img" />
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
                  {isEdit ? 'Save changes' : 'Create portfolio'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  )
}
