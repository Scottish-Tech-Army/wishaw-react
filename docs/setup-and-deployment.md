# Wishaw React Setup and Deployment Guide

## Overview

This application is a React and TypeScript frontend built with Vite.

Key runtime characteristics:

- Local development runs on port `5173`.
- API requests are made to relative paths under `/api`.
- Uploaded assets are requested under `/uploads`.
- The development server proxies `/api` and `/uploads` to a backend target.
- Production hosting must provide the frontend and backend routes on the same origin, or provide a reverse proxy that makes them appear that way.
- The app includes PWA support through `vite-plugin-pwa`.

## Prerequisites

Install the following before working with the project:

- Node.js v22.21.1 or later
- npm 10.9.4 or later
- A reachable backend API that serves the Wishaw endpoints under `/api`

Recommended checks:

```bash
node --version
npm --version
```

## Project scripts

The repository defines these npm scripts:

- `npm run dev`: starts Vite in development mode
- `npm run build`: runs TypeScript compilation and creates a production bundle
- `npm run preview`: serves the production bundle locally
- `npm run lint`: runs ESLint

## Local installation

From the repository root, install dependencies:

```bash
npm install
```

This installs the React, Vite, TypeScript, ESLint, Axios, and PWA-related packages declared in `package.json`.

## Environment configuration

### Local development

Create a file named `.env.local` in the project root.

Example:

```env
VITE_API_PROXY_TARGET=http://localhost:8080
```

How it works:

- When you run `npm run dev`, Vite proxies requests for `/api` and `/uploads` to `VITE_API_PROXY_TARGET`.
- If `VITE_API_PROXY_TARGET` is not set, the app falls back to `http://localhost:8080`.

Use the backend URL that matches your local, shared, or test API environment.

### Production

No frontend runtime environment variable is currently used for the API base URL. The frontend is hard-wired to call relative routes under `/api` and `/uploads`.

That means production hosting must satisfy one of these conditions:

1. Host the frontend and backend behind the same domain so `/api` and `/uploads` resolve correctly.
2. Put a reverse proxy in front of the frontend that forwards `/api` and `/uploads` to the backend service.

## Running locally

Start the local development server:

```bash
npm run dev
```

Default local URL:

```text
http://localhost:5173
```

Expected local behavior:

- Frontend assets are served by Vite.
- API requests to `/api/*` are proxied to `VITE_API_PROXY_TARGET`.
- Upload requests to `/uploads/*` are proxied to `VITE_API_PROXY_TARGET`.
- Hot module reload is enabled.

## Building for production

Create an optimized production build:

```bash
npm run build
```

The build output is written to the default Vite output directory:

```text
dist/
```

The build command performs two steps:

1. `tsc -b` validates and compiles the TypeScript project references.
2. `vite build --mode prod` creates the production frontend bundle.

## Previewing the production build locally

To test the built app locally before deployment:

```bash
npm run preview
```

Important limitation:

- `npm run preview` serves the built frontend only.
- It does not recreate the development proxy.
- If your production preview environment does not provide `/api` and `/uploads`, API calls will fail.

For a realistic preview, run the preview server behind the same reverse proxy arrangement you plan to use in production.

## Deployment model

This is a static frontend deployment.

Deploy the contents of `dist/` to a static web host, CDN, or web server. Examples include:

- Nginx
- Apache
- Azure App Service
- Azure Static Web Apps with API proxying
- Kubernetes ingress with a static asset container
- S3 plus CloudFront with path-based routing

The critical requirement is route handling:

- Frontend routes such as `/dashboard` or `/modules/123` must return `index.html`.
- Backend routes under `/api` must be forwarded to the backend service.
- Asset routes under `/uploads` must be forwarded to the backend or file-serving service.

## Reverse proxy requirements

Because this app uses React Router and relative API paths, your production server should handle three categories of traffic:

1. Static frontend assets
2. SPA route fallback to `index.html`
3. Reverse proxy for `/api` and `/uploads`

### Example Nginx configuration

This is a reference example only. Adjust paths, TLS, and upstream names for your environment.

```nginx
server {
    listen 80;
    server_name your-domain.example;

    root /var/www/wishaw-react/dist;
    index index.html;

    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://backend:8080/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Deployment procedure

Use this sequence for a standard deployment:

1. Pull the latest source code.
2. Run `npm install`.
3. Run `npm run build`.
4. Publish the generated `dist/` directory to the target web server or hosting platform.
5. Configure SPA fallback so frontend routes return `index.html`.
6. Configure proxy forwarding for `/api` and `/uploads`.
7. Verify login, API calls, and uploaded asset access in the deployed environment.

## Post-deployment validation

After deployment, verify at minimum:

- The site loads successfully from the public URL.
- Refreshing a deep link such as `/dashboard` does not return `404`.
- Login requests succeed.
- Protected API requests succeed after authentication.
- Images or files served from `/uploads` load correctly.
- Browser developer tools show successful responses for `/api` requests.

## Operational notes

### Authentication

The frontend stores the JWT token in browser local storage and sends it as a bearer token on API requests. If the backend returns `401`, the frontend clears stored auth state and redirects to `/login`.

### Offline and caching behavior

The app uses `vite-plugin-pwa` with Workbox runtime caching. That improves resilience, but it also means clients can retain cached assets and some cached API responses.

When deploying updates:

- Expect some users to receive the new version after the service worker updates.
- If troubleshooting stale client behavior, clear site data or unregister the service worker in the browser.

## Troubleshooting

### The app loads but API requests fail locally

Check that:

- `.env.local` exists
- `VITE_API_PROXY_TARGET` points to the correct backend
- the backend is running and reachable

### Direct navigation to a page returns 404 in production

Your web server is not configured for SPA fallback. Configure all unknown frontend routes to return `index.html`.

### Images or uploaded files do not load in production

Your deployment is likely serving the frontend correctly but not proxying `/uploads` to the backend or file server.

### Login works in one environment but fails in another

Check backend CORS, authentication configuration, and whether the proxy forwards headers correctly.

## Suggested release checklist

Before each release:

1. Run `npm install`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Smoke test the app with `npm run preview` or in a staging environment.
5. Deploy `dist/` and confirm `/api` and `/uploads` routing.
