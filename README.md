# Wishaw React Frontend

This repository contains the Wishaw React frontend, built with React, TypeScript, and Vite.

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` for local development:

```env
VITE_API_PROXY_TARGET=http://localhost:8080
```

3. Start the development server:

```bash
npm run dev
```

The app runs on `http://localhost:5173` by default.

## Scripts

- `npm run dev` starts the local Vite development server using `--mode dev`.
- `npm run build` runs TypeScript compilation and creates a production build.
- `npm run preview` serves the production build locally for smoke testing.
- `npm run lint` runs ESLint.

## API and uploads routing

The frontend calls the backend using relative paths:

- `/api`
- `/uploads`

During local development, Vite proxies those routes to `VITE_API_PROXY_TARGET`. If the variable is not set, the proxy falls back to `http://localhost:8080`.

In production, the Vite proxy does not exist. Your hosting setup must serve the frontend and route `/api` and `/uploads` to the backend through the same domain or a reverse proxy.

## Technical documentation

The full installation, run, build, and deployment guide is in [docs/setup-and-deployment.md](docs/setup-and-deployment.md).
