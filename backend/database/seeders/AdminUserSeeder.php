<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Create (or promote) the administrator account used for the Filament panel.
     */
    public function run(): void
    {
        $email = (string) env('ADMIN_EMAIL', 'admin@qalbiquran.test');

        $user = User::query()->firstOrNew(['email' => $email]);

        if (! $user->exists) {
            $user->name = 'Administrator';
            $user->username = 'admin';
            $user->password = (string) env('ADMIN_PASSWORD', 'password');
            $user->email_verified_at = now();
        }

        $user->is_admin = true;
        $user->save();
    }
}
