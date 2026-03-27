import { useSelector } from 'react-redux'

export default function AppLoader() {
  const { isOpen, message } = useSelector((state) => state.ui.loader)

  if (!isOpen) return null

  return (
    <div className="sv-app-loader" role="status" aria-live="polite">
      <div className="sv-app-loader__panel">
        <div className="sv-app-loader__visual" aria-hidden="true">
          <div className="sv-app-loader__spinner" />
          <div className="sv-app-loader__blob sv-app-loader__blob--a" />
          <div className="sv-app-loader__blob sv-app-loader__blob--b" />
          <div className="sv-app-loader__blob sv-app-loader__blob--c" />
        </div>
        <div className="sv-app-loader__message">{message}</div>
      </div>
    </div>
  )
}
