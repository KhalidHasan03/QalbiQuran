<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('current_streak')->default(0);
            $table->unsignedInteger('longest_streak')->default(0);
            $table->date('last_read_date')->nullable();
            $table->unsignedInteger('reading_days')->default(0);
            $table->unsignedInteger('total_ayahs_read')->default(0);
            $table->unsignedInteger('total_seconds')->default(0);
            $table->unsignedBigInteger('total_hasanat')->default(0);
            $table->unsignedInteger('current_khatmah')->default(1);
            $table->unsignedInteger('completed_khatmahs')->default(0);
            $table->unsignedSmallInteger('last_surah_number')->nullable();
            $table->unsignedSmallInteger('last_ayah_number')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_stats');
    }
};
