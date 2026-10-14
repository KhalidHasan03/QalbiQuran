# QalbiQuran

A Qur'an reading and habit-tracking platform. It pairs a public, multilingual
Qur'an reader with a personal "portal" that helps readers build a daily habit —
streaks, goals, bookmarks, notes, achievements, a leaderboard and friends —
backed by a Laravel API and a Filament admin panel.

## Stack

| Layer      | Technology |
| ---------- | ---------- |
| API        | Laravel 12, PHP 8.2+, Laravel Sanctum (SPA cookie auth), Filament 4 admin panel |
| Database   | MySQL / MariaDB |
| Frontend   | React 19, TypeScript, Vite 8, React Router 7, TanStack Query 5, Zustand, Tailwind CSS 4, Axios, Lucide icons |
| Data       | 114 surahs, 6236 ayahs, English + Bangla translations, reciters and audio from the Al Qur'an Cloud API |

## Repository layout

```
Quranly/
├── backend/     # Laravel API + Filament admin panel
└── frontend/    # React single-page app (reader + portal)
```

## Prerequisites

- PHP 8.2+ with the usual Laravel extensions, and [Composer](https://getcomposer.org/)
- Node.js 20+ and npm
- MySQL or MariaDB (XAMPP/MAMP is fine)

## Backend setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Create the database (default name `qalbiquran`) and set the `DB_*` values in
`.env`, then:

```bash
php artisan migrate --seed
php artisan quran:import       # download the Qur'an text + reciters
php artisan serve            # http://localhost:8000
```

`migrate --seed` seeds achievements and creates an admin user (see
[Admin panel](#admin-panel)); `quran:import` loads the Qur'an data from the
Al Qur'an Cloud API.

### Useful backend commands

```bash
php artisan test             # run the test suite (Pest/PHPUnit)
vendor/bin/pint              # format code (Laravel Pint)
php artisan quran:import     # re-import Qur'an data (see the command help)
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

During development Vite proxies `/api` and `/sanctum` to
`http://localhost:8000` (see `vite.config.ts`), so run `php artisan serve` in a
second terminal. To point the SPA at a different API, copy `.env.example` to
`.env` and set `VITE_API_URL` (including the `/api/v1` suffix).

### Useful frontend commands

```bash
npm run build                # type-check + production build
npm run lint                 # Oxlint
npm run preview              # preview the production build
```

## Environment variables

Backend (`.env`): standard Laravel values plus:

| Variable       | Purpose |
| -------------- | ------- |
| `FRONTEND_URL` | Base URL of the SPA. Used for password-reset and email-verification links. |
| `SANCTUM_STATEFUL_DOMAINS` | Domains that receive stateful Sanctum cookies (the SPA host). Must include the SPA origin or auth requests fail with `Session store not set on request.` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origins allowed to call the API with credentials (defaults to `FRONTEND_URL`). |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credentials created/updated by `AdminUserSeeder`. |

Frontend (`.env`): `VITE_API_URL` (optional) — full API base URL; defaults to
the dev proxy.

## API overview

All endpoints are prefixed with `/api`. The public API lives under `/api/v1`.

| Area | Examples |
| ---- | -------- |
| Health | `GET /api/health` |
| Qur'an | `GET /api/v1/surahs`, `GET /api/v1/surahs/{number}`, `GET /api/v1/ayahs/search`, `GET /api/v1/ayahs/{number}`, `GET /api/v1/reciters` |
| Contact | `POST /api/v1/contact` |
| Auth | `POST /api/v1/auth/register`, `/login`, `/logout`, `/forgot-password`, `/reset-password`; `GET /api/v1/auth/user`; email verification routes |
| Portal | `GET/PUT /api/v1/me/goal`, `PUT /api/v1/me/profile`, `PUT /api/v1/me/password`, bookmarks, notes, progress, achievements, friends, leaderboard |

Authentication uses Sanctum's SPA cookie flow: the SPA calls
`GET /sanctum/csrf-cookie` first, then sends requests with credentials.

> **Important:** This flow needs the SPA's origin to be listed in
> `SANCTUM_STATEFUL_DOMAINS`. Sanctum only attaches a session (and thus only
> `POST /login` and `/register` work) when the request's `Origin`/`Referer`
> matches a stateful domain. If the origin is missing, auth requests fail with
> `Session store not set on request.` The default dev value includes bare
> `localhost` / `127.0.0.1`, so any dev port (5173, 5174, `vite preview`'s 4173,
> …) is accepted. For production, list your exact SPA origin.

After a successful sign in or registration the app routes by role: **students**
land in the portal (`/portal`) and **administrators** are redirected to the
Filament panel URL returned by the API (`/admin`).

## Admin panel

A Filament panel is mounted at `/admin`. Only users with the `is_admin` flag
can sign in. Seed a local administrator with:

```bash
cd backend
php artisan db:seed --class=AdminUserSeeder
```

The seeder uses `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env` (defaults:
`admin@qalbiquran.test` / `password`). Change these before deploying.

Admin features include a contact-message inbox, user management (including the
administrator flag), achievement management, read-only views of surahs and
reciters, and a dashboard stats widget.

## Testing

```bash
cd backend && php artisan test                  # API feature tests
cd frontend && npm run test && npm run lint     # unit tests + lint
```

Continuous integration runs both suites (plus Pint and the production build) on
every push and pull request — see [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Deployment

1. Build the SPA: `cd frontend && npm install && npm run build` (outputs to
   `frontend/dist`). Serve `dist` from a static host or CDN.
2. Configure the backend `.env` for production: set `APP_ENV=production`,
   `APP_DEBUG=false`, real `DB_*` values, `APP_URL`, `FRONTEND_URL`,
   `SANCTUM_STATEFUL_DOMAINS` and `CORS_ALLOWED_ORIGINS` to your real domains.
3. Point the SPA at the API by setting `VITE_API_URL` (e.g.
   `https://api.example.com/api/v1`) **before** `npm run build`.
4. Install and optimise the backend:

   ```bash
   cd backend
   composer install --no-dev --optimize-autoloader
   php artisan migrate --force
   php artisan config:cache && php artisan route:cache && php artisan event:cache
   ```

   Re-run `php artisan optimize:clear` after any config/env change.
5. Serve the backend behind HTTPS and ensure the SPA origin is reachable so the
   Sanctum cookie flow works cross-origin.

## License

Released under the [MIT License](LICENSE).
