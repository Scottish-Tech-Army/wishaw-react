import { registerSW } from 'virtual:pwa-register'

export function registerPwa() {
  registerSW({
    immediate: true,
    onRegisteredSW(swUrl, registration) {
      // Keep the SW fresh for app shell and offline-first usage.
      if (registration) {
        setInterval(() => {
          void registration.update()
        }, 60 * 60 * 1000)
      }
      console.info('Service worker registered at', swUrl)
    },
    onOfflineReady() {
      console.info('App ready to work offline')
    },
  })
}
