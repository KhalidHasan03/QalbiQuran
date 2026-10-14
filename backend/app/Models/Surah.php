<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Surah extends Model
{
    use HasFactory;

    protected $fillable = [
        'number',
        'name_arabic',
        'name_transliteration',
        'name_english',
        'name_bangla',
        'revelation_type',
        'revelation_order',
        'ayah_count',
        'bismillah_pre',
    ];

    protected function casts(): array
    {
        return [
            'bismillah_pre' => 'boolean',
            'ayah_count' => 'integer',
            'number' => 'integer',
        ];
    }

    public function ayahs(): HasMany
    {
        return $this->hasMany(Ayah::class);
    }
}
