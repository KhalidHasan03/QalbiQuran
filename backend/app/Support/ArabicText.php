<?php

namespace App\Support;

class ArabicText
{
    /**
     * Normalise Arabic script for diacritic- and glyph-insensitive search.
     *
     * Strips tashkeel (harakat), tatweel and Quranic annotation marks, then
     * folds common letter variants (alef/yeh/ta-marbuta forms) to a canonical
     * shape so that queries typed without diacritics match the Uthmani text.
     */
    public static function normalize(?string $text): string
    {
        if ($text === null) {
            return '';
        }

        $text = preg_replace(
            '/[\x{0610}-\x{061A}\x{064B}-\x{065F}\x{0670}\x{06D6}-\x{06ED}\x{0640}\x{08D3}-\x{08FF}]/u',
            '',
            $text,
        );

        $text = strtr($text, [
            'آ' => 'ا', 'أ' => 'ا', 'إ' => 'ا', 'ٱ' => 'ا', 'ٲ' => 'ا', 'ٳ' => 'ا', 'ٵ' => 'ا',
            'ؤ' => 'و', 'ئ' => 'ي', 'ى' => 'ي', 'ی' => 'ي',
            'ة' => 'ه',
        ]);

        return trim($text);
    }

    public static function containsArabic(string $text): bool
    {
        return (bool) preg_match('/\p{Arabic}/u', $text);
    }
}
