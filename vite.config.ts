import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
//
// ── API routing ──────────────────────────────────────────────────────────────
// The recommended approach is to set VITE_API_BASE_URL in your .env.local file:
//
//   VITE_API_BASE_URL=http://localhost:8080/api/v1
//
// When VITE_API_BASE_URL is set, the proxy below is NOT needed — requests go
// directly to the backend with a Bearer token in the Authorization header.
//
// If you prefer to avoid CORS configuration entirely during local development,
// leave VITE_API_BASE_URL unset (or set it to "") and uncomment the proxy block.
// The proxy rewrites /api/v1/* to http://localhost:8080/api/v1/* on the server,
// so the browser sees all requests coming from the same origin.
//
// ── Mock API ──────────────────────────────────────────────────────────────────
// Run `npm run dev:mock` to use the mock API layer instead of the real backend.
// When VITE_USE_MOCK=true, the alias below rewrites every import of
// `src/api/index.ts` to `src/api/mockApi.ts` at build time so the real
// studentApi.ts (and any fetch() calls) are fully tree-shaken from the bundle.
//
// ─────────────────────────────────────────────────────────────────────────────

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const useMock = env.VITE_USE_MOCK === 'true';

  return {
    plugins: [react()],
    resolve: {
      alias: useMock
        ? [
            // When VITE_USE_MOCK=true, rewrite every import of src/api/index
            // to src/api/mockApi so studentApi and all fetch() calls are
            // tree-shaken from the bundle entirely.
            {
              find: /.*\/api\/index$/,
              replacement: path.resolve(__dirname, 'src/api/mockApi.ts'),
            },
          ]
        : [],
    },
    // server: {
    //   proxy: {
    //     '/api/v1': {
    //       target: 'http://localhost:8080',
    //       changeOrigin: true,
    //     },
    //   },
    // },
  };
})
