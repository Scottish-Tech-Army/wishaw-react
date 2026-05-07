import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Bypass proxy for browser page navigations (Accept: text/html)
// so that Vite serves index.html and the SPA router handles the path.
const bypassHtml = (req: { headers: { accept?: string }; url?: string }) => {
  if (req.headers.accept?.includes('text/html')) {
    return req.url   // serve from Vite instead of proxying
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:3001',
      '/me': 'http://localhost:3001',
      '/admin': { target: 'http://localhost:3001', bypass: bypassHtml },
      '/badges': { target: 'http://localhost:3001', bypass: bypassHtml },
      '/leaderboards': 'http://localhost:3001',
      '/manage': 'http://localhost:3001',
      '/hello': 'http://localhost:3001',
    },
  },
})
