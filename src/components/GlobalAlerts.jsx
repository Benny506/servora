import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  FiAlertCircle,
  FiAlertOctagon,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiX,
} from 'react-icons/fi'
import { removeAlert } from '../store/uiSlice.js'

const EXIT_MS = 240

const pickIcon = (type) => {
  switch (type) {
    case 'success':
      return FiCheckCircle
    case 'warning':
      return FiAlertTriangle
    case 'error':
      return FiAlertOctagon
    case 'notification':
      return FiAlertCircle
    case 'info':
    default:
      return FiInfo
  }
}

export default function GlobalAlerts() {
  const dispatch = useDispatch()
  const alerts = useSelector((state) => state.ui.alerts)
  const [closingIds, setClosingIds] = useState(() => new Set())
  const timersRef = useRef(new Map())

  const alertsById = useMemo(() => {
    const map = new Map()
    for (const a of alerts) map.set(a.id, a)
    return map
  }, [alerts])

  const requestClose = (id) => {
    setClosingIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })

    window.setTimeout(() => {
      dispatch(removeAlert(id))
    }, EXIT_MS)
  }

  useEffect(() => {
    for (const alert of alerts) {
      if (timersRef.current.has(alert.id)) continue
      const timeoutMs = Math.max(0, Number(alert.timeoutMs ?? 0))
      const timerId = window.setTimeout(() => {
        requestClose(alert.id)
      }, timeoutMs)
      timersRef.current.set(alert.id, timerId)
    }

    for (const [id, timerId] of timersRef.current.entries()) {
      if (alertsById.has(id)) continue
      window.clearTimeout(timerId)
      timersRef.current.delete(id)
      setClosingIds((prev) => {
        if (!prev.has(id)) return prev
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }, [alerts, alertsById])

  useEffect(() => {
    return () => {
      for (const timerId of timersRef.current.values()) {
        window.clearTimeout(timerId)
      }
      timersRef.current.clear()
    }
  }, [])

  if (alerts.length === 0) return null

  return (
    <div className="sv-alerts" aria-live="polite" aria-relevant="additions">
      {alerts.map((alert) => {
        const Icon = pickIcon(alert.type)
        const isClosing = closingIds.has(alert.id)

        return (
          <div
            key={alert.id}
            className={`sv-alert sv-alert--${alert.type}${
              isClosing ? ' sv-alert--closing' : ''
            }`}
            role="status"
          >
            <div className="sv-alert__icon" aria-hidden="true">
              <Icon />
            </div>
            <div className="sv-alert__body">
              {alert.title ? (
                <div className="sv-alert__title">{alert.title}</div>
              ) : null}
              <div className="sv-alert__message">{alert.message}</div>
            </div>
            <button
              type="button"
              className="sv-alert__close"
              aria-label="Close alert"
              onClick={() => requestClose(alert.id)}
            >
              <FiX />
            </button>
          </div>
        )
      })}
    </div>
  )
}
