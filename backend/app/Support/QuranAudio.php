<?php

namespace App\Support;

class QuranAudio
{
    public static function verseUrl(int $ayahNumber, ?string $reciter = null): string
    {
        $reciter ??= config('quran.default_reciter');
        $base = rtrim((string) config('quran.audio_base'), '/');
        $bitrate = (int) config('quran.audio_bitrate', 128);

        return "{$base}/{$bitrate}/{$reciter}/{$ayahNumber}.mp3";
    }

    public static function surahUrl(int $surahNumber, string $reciter = 'ar.alafasy'): string
    {
        $base = rtrim((string) config('quran.audio_base'), '/');

        return "{$base}/surah/{$reciter}/{$surahNumber}.mp3";
    }
}
