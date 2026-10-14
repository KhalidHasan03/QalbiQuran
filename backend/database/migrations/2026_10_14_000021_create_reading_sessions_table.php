<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reading_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('surah_number')->nullable();
            $table->unsignedSmallInteger('from_ayah')->nullable();
            $table->unsignedSmallInteger('to_ayah')->nullable();
            $table->unsignedInteger('ayahs_count')->default(0);
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->unsignedInteger('hasanat')->default(0);
            $table->date('read_on');
            $table->timestamps();

            $table->index(['user_id', 'read_on']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reading_sessions');
    }
};
