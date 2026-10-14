<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Password reset links should open the single-page app, not the API.
        ResetPassword::createUrlUsing(function (object $user, string $token): string {
            $email = method_exists($user, 'getEmailForPasswordReset')
                ? $user->getEmailForPasswordReset()
                : $user->email;

            return rtrim((string) config('app.frontend_url'), '/').'/reset-password?'.http_build_query([
                'token' => $token,
                'email' => $email,
            ]);
        });
    }
}
