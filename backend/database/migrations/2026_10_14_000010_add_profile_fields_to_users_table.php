<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->unique()->after('name');
            $table->string('avatar_url')->nullable()->after('username');
            $table->string('timezone')->default('UTC')->after('password');
            $table->json('settings')->nullable()->after('timezone');
            $table->timestamp('last_active_at')->nullable()->after('settings');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username',
                'avatar_url',
                'timezone',
                'settings',
                'last_active_at',
            ]);
        });
    }
};
