import { useEffect, useMemo, useState } from 'react'
import { Modal } from 'react-bootstrap'

const canUseInstallPrompt = () => typeof window !== 'undefined' && Boolean(window.__svDeferredInstallPrompt)

const isIos = () => {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || navigator.vendor || window.opera
  return /iPad|iPhone|iPod/.test(ua)
}

const isStandalone = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator?.standalone === true
}

export default function InstallToHomeScreenButton({
  className = 'btn btn-outline-primary',
  label = 'Install',
  fullWidth = false,
}) {
  const [available, setAvailable] = useState(false)
  const [ios, setIos] = useState(false)
  const [standalone, setStandalone] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.__svPwaInstallListenerCount = (window.__svPwaInstallListenerCount || 0) + 1

    if (!window.__svPwaInstallListenerAdded) {
      window.__svPwaInstallListenerAdded = true

      const onBeforeInstallPrompt = (e) => {
        e.preventDefault()
        window.__svDeferredInstallPrompt = e
        window.dispatchEvent(new Event('sv:pwa-install-available'))
      }

      const onInstalled = () => {
        window.__svDeferredInstallPrompt = undefined
        window.dispatchEvent(new Event('sv:pwa-installed'))
      }

      window.__svPwaInstallHandlers = { onBeforeInstallPrompt, onInstalled }
      window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.addEventListener('appinstalled', onInstalled)
    }

    return () => {
      window.__svPwaInstallListenerCount = Math.max(0, (window.__svPwaInstallListenerCount || 1) - 1)
      if (window.__svPwaInstallListenerCount === 0 && window.__svPwaInstallHandlers) {
        const { onBeforeInstallPrompt, onInstalled } = window.__svPwaInstallHandlers
        window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
        window.removeEventListener('appinstalled', onInstalled)
        window.__svPwaInstallHandlers = undefined
        window.__svPwaInstallListenerAdded = false
      }
    }
  }, [])

  useEffect(() => {
    const update = () => {
      setAvailable(Boolean(canUseInstallPrompt()))
      setIos(isIos())
      setStandalone(isStandalone())
    }

    update()
    window.addEventListener('sv:pwa-install-available', update)
    window.addEventListener('sv:pwa-installed', update)
    window.addEventListener('resize', update)

    return () => {
      window.removeEventListener('sv:pwa-install-available', update)
      window.removeEventListener('sv:pwa-installed', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const shouldShow = useMemo(() => {
    if (standalone) return false
    if (available) return true
    if (ios) return true
    return true
  }, [available, ios, standalone])

  const handleClick = async () => {
    if (standalone) return
    const promptEvent = typeof window !== 'undefined' ? window.__svDeferredInstallPrompt : undefined
    if (promptEvent) {
      await promptEvent.prompt()
      const choice = await promptEvent.userChoice
      if (choice?.outcome !== 'accepted') {
        setHelpOpen(true)
      }
      window.__svDeferredInstallPrompt = undefined
      setAvailable(false)
      return
    }
    setHelpOpen(true)
  }

  if (!shouldShow) return null

  const btnClassName = `${className}${fullWidth ? ' w-100' : ''}`

  return (
    <>
      <button type="button" className={btnClassName} onClick={handleClick}>
        {label}
      </button>

      <Modal show={helpOpen} onHide={() => setHelpOpen(false)} centered contentClassName="sv-portfolio-modal">
        <div className="sv-portfolio-modal__head">
          <div className="sv-portfolio-modal__title">Install Servora</div>
          <button type="button" className="sv-portfolio-modal__close" onClick={() => setHelpOpen(false)} aria-label="Close">
            ×
          </button>
        </div>
        <div className="sv-portfolio-modal__body">
          {ios ? (
            <div className="sv-card__text">
              On iPhone/iPad, install is done from Safari:
              <div className="mt-3">1) Open this site in Safari</div>
              <div>2) Tap Share</div>
              <div>3) Tap Add to Home Screen</div>
            </div>
          ) : (
            <div className="sv-card__text">
              If you don’t see a prompt, install from your browser menu:
              <div className="mt-3">Chrome: ⋮ menu → Install app / Add to Home screen</div>
            </div>
          )}
          <div className="mt-4 d-flex justify-content-end">
            <button type="button" className="btn btn-primary" onClick={() => setHelpOpen(false)}>
              Got it
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
