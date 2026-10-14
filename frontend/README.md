# QalbiQuran — Web app

The React single-page app for QalbiQuran: the public Qur'an reader plus the
authenticated personal portal (streaks, goals, bookmarks, notes, achievements,
leaderboard, friends).

See the [root README](../README.md) for the full project overview and
end-to-end setup. This file covers frontend specifics.

## Stack

React 19 · TypeScript · Vite 8 · React Router 7 · TanStack Query 5 · Zustand ·
Tailwind CSS 4 · Axios · Lucide icons

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

In development, Vite proxies `/api` and `/sanctum` to `http://localhost:8000`
(see `vite.config.ts`). Start the backend with `php artisan serve` in another
terminal.

## Environment

Copy `.env.example` to `.env` to override defaults:

| Variable       | Description |
| -------------- | ----------- |
| `VITE_API_URL` | Full API base URL including `/api/v1`. Leave unset to use the dev proxy. |

## Scripts

```bash
npm run dev        # dev server with HMR
npm run build      # type-check (tsc -b) + production build
npm run lint       # Oxlint
npm run test       # Vitest unit tests (run once)
npm run test:watch # Vitest in watch mode
npm run preview    # preview the production build
```

## Structure

```
src/
├── components/    # layout, UI primitives, quran + portal widgets
├── lib/           # axios client, api helpers, seo, lazy
├── pages/         # route pages (public, auth, quran, portal)
├── store/         # zustand stores (auth, preferences, toasts)
└── types/         # shared API types
```

## API client

`src/lib/api.ts` wraps Axios. It targets `/api/v1` by default, uses Sanctum's
cookie flow (calls `/sanctum/csrf-cookie` before authenticated requests) and
emits `qalbiquran:unauthorized` event on any `401` response so the app can
log the user out and redirect to the login page.

## PWA & offline

`public/manifest.webmanifest` makes the app installable and `public/sw.js` is a
small service worker (registered on load in production builds) that caches the
app shell and hashed assets. Navigation requests are network-first; API and
Sanctum requests are never cached. `public/og.svg` is the social share image —
replace it with a 1200×630 PNG for the widest crawler support.
