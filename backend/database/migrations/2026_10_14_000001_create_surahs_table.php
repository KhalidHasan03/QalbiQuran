<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('surahs', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('number')->unique();
            $table->string('name_arabic');
            $table->string('name_transliteration');
            $table->string('name_english');
            $table->string('name_bangla')->nullable();
            $table->string('revelation_type')->default('Meccan');
            $table->unsignedSmallInteger('revelation_order')->nullable();
            $table->unsignedSmallInteger('ayah_count')->default(0);
            $table->boolean('bismillah_pre')->default(true);
            $table->timestamps();

            $table->index('revelation_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('surahs');
    }
};
