<?php

namespace App\Models;

use App\Support\ArabicText;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ayah extends Model
{
    use HasFactory;

    protected $fillable = [
        'surah_id',
        'number_in_surah',
        'number_in_quran',
        'text_arabic',
        'text_arabic_plain',
        'text_english',
        'text_bangla',
        'juz',
        'hizb_quarter',
        'page',
        'sajda',
    ];

    protected function casts(): array
    {
        return [
            'sajda' => 'boolean',
            'number_in_surah' => 'integer',
            'number_in_quran' => 'integer',
            'juz' => 'integer',
            'page' => 'integer',
        ];
    }

    public function surah(): BelongsTo
    {
        return $this->belongsTo(Surah::class);
    }

    protected static function booted(): void
    {
        static::saving(function (Ayah $ayah): void {
            if ($ayah->isDirty('text_arabic')) {
                $ayah->text_arabic_plain = ArabicText::normalize($ayah->text_arabic);
            }
        });
    }
}
