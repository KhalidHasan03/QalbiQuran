<?php

use App\Support\QuranAudio;

if (! function_exists('audio_url')) {
    /**
     * Build the verse-by-verse audio CDN URL for a given ayah.
     *
     * @param  int  $ayahNumber  The ayah number in the whole Qur'an (1-6236)
     * @param  string|null  $reciter  The reciter identifier (defaults to config)
     */
    function audio_url(int $ayahNumber, ?string $reciter = null): string
    {
        return QuranAudio::verseUrl($ayahNumber, $reciter);
    }
}
