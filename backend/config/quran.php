<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default reciter identifier (verse-by-verse audio)
    |--------------------------------------------------------------------------
    */
    'default_reciter' => env('QURAN_DEFAULT_RECITER', 'ar.alafasy'),

    /*
    |--------------------------------------------------------------------------
    | Audio CDN
    |--------------------------------------------------------------------------
    | Verse audio URL: {base}/{bitrate}/{reciter}/{ayah_number_in_quran}.mp3
    */
    'audio_base' => env('QURAN_AUDIO_BASE', 'https://cdn.islamic.network/quran/audio'),

    'audio_bitrate' => (int) env('QURAN_AUDIO_BITRATE', 128),

    /*
    |--------------------------------------------------------------------------
    | Translation editions available in the reader
    |--------------------------------------------------------------------------
    */
    'translations' => [
        'en' => ['label' => 'English', 'sahih' => 'Saheeh International'],
        'bn' => ['label' => 'বাংলা', 'sahih' => 'Muhiuddin Khan'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Gamification
    |--------------------------------------------------------------------------
    | Hasanat is awarded per ayah read. A khatmah is a full reading of the
    | Qur'an (6236 ayahs).
    */
    'hasanat_per_ayah' => (int) env('QURAN_HASANAT_PER_AYAH', 10),
    'total_ayahs' => 6236,
];
