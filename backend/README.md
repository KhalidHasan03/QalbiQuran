# QalbiQuran — API

The Laravel 12 backend for QalbiQuran. It serves the public Qur'an API, the
authenticated personal-portal API, and a Filament 4 admin panel.

See the [root README](../README.md) for the full project overview and
end-to-end setup. This file covers backend specifics.

## Requirements

- PHP 8.2+ and Composer
- MySQL or MariaDB

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan quran:import
php artisan serve
```

## Configuration

Beyond the standard Laravel variables, the app reads:

| Variable         | Description |
| ---------------- | ----------- |
| `FRONTEND_URL`   | SPA base URL used to build password-reset and email-verification links. |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origins allowed with credentials (defaults to `FRONTEND_URL`). |
| `ADMIN_EMAIL`    | Email for the administrator created by `AdminUserSeeder`. |
| `ADMIN_PASSWORD` | Password for that administrator. |

Authentication uses [Laravel Sanctum](https://laravel.com/docs/sanctum) in SPA
(cookie) mode, so `SESSION_DOMAIN`, `SANCTUM_STATEFUL_DOMAINS` and CORS must
match the SPA origin.

## Structure

```
app/
├── Console/Commands/ImportQuran.php   # quran:import command
├── Filament/                          # admin panel resources, pages, widgets
├── Http/Controllers/Api/V1/           # public + portal API controllers
├── Http/Requests/                     # form request validation
└── Models/                            # Surah, Ayah, Reciter, User, ...
routes/api.php                         # all API routes (prefixed /api)
```

## Commands

```bash
php artisan quran:import             # import Qur'an text + reciters
php artisan quran:import --fresh     # replace existing Qur'an data
php artisan quran:import --surah=36  # import a single surah
```

## Admin panel

Mounted at `/admin`. Only users with `is_admin` can access it. Create one with:

```bash
php artisan db:seed --class=AdminUserSeeder
```

## Testing & code style

```bash
php artisan test          # feature test suite
vendor/bin/pint           # format with Laravel Pint
```

## License

Released under the [MIT License](../LICENSE).
