<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ayahs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('surah_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('number_in_surah');
            $table->unsignedSmallInteger('number_in_quran')->unique();
            $table->text('text_arabic');
            $table->text('text_english');
            $table->text('text_bangla');
            $table->unsignedTinyInteger('juz')->nullable();
            $table->unsignedSmallInteger('hizb_quarter')->nullable();
            $table->unsignedSmallInteger('page')->nullable();
            $table->boolean('sajda')->default(false);
            $table->timestamps();

            $table->unique(['surah_id', 'number_in_surah']);
            $table->index(['juz']);
            $table->index(['page']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ayahs');
    }
};
