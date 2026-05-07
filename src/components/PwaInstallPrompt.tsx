import { useEffect, useMemo, useState } from 'react'
import type { BeforeInstallPromptEvent } from '../lib/pwa'
import { isRunningStandalone } from '../lib/pwa'
import '../styles/pwa-install.css'

function isIosDevice() {
  const userAgent = globalThis.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent)
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [installed, setInstalled] = useState(() => isRunningStandalone())
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    const onInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    globalThis.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    globalThis.addEventListener('appinstalled', onInstalled)

    return () => {
      globalThis.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      globalThis.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const showIosInstructions = useMemo(
    () => !installed && !deferredPrompt && isIosDevice(),
    [deferredPrompt, installed],
  )

  const showPrompt = !dismissed && !installed && (Boolean(deferredPrompt) || showIosInstructions)

  async function handleInstall() {
    if (!deferredPrompt) return

    setIsInstalling(true)
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setIsInstalling(false)
  }

  if (!showPrompt) return null

  return (
    <aside className="pwa-install" aria-label="Install app prompt">
      <button
        className="pwa-install__close"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss install prompt"
      >
        <span className="material-symbol">close</span>
      </button>

      <div className="pwa-install__badge">Install app</div>
      <h2>Install Wishaw Arena</h2>
      <p>
        Add the esports platform to your desktop or home screen for a full-screen, app-like experience.
      </p>

      {deferredPrompt ? (
        <button className="pwa-install__action" onClick={handleInstall} disabled={isInstalling}>
          <span className="material-symbol">download</span>
          <span>{isInstalling ? 'Preparing install…' : 'Install now'}</span>
        </button>
      ) : (
        <ol className="pwa-install__steps">
          <li>Open the Share menu in Safari.</li>
          <li>Choose <strong>Add to Home Screen</strong>.</li>
          <li>Tap <strong>Add</strong> to install Wishaw Arena.</li>
        </ol>
      )}
    </aside>
  )
}
