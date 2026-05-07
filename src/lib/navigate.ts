import type { MouseEvent } from 'react'

/**
 * Push a new path via the History API and dispatch a popstate event
 * so our App-level listener re-renders the correct page.
 */
export function navigate(path: string) {
  globalThis.history.pushState({}, '', path)
  globalThis.dispatchEvent(new PopStateEvent('popstate'))
}

/**
 * Click handler for `<a>` tags — prevents full reload and uses SPA navigation.
 * Use as: `<a href="/foo" onClick={spaClick}>…</a>`
 */
export function spaClick(e: MouseEvent<HTMLAnchorElement>) {
  // Allow cmd/ctrl+click to open in new tab
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  const href = e.currentTarget.getAttribute('href')
  if (href) navigate(href)
}
