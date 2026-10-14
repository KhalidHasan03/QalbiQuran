<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReadingSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'surah_number',
        'from_ayah',
        'to_ayah',
        'ayahs_count',
        'duration_seconds',
        'hasanat',
        'read_on',
    ];

    protected function casts(): array
    {
        return [
            'read_on' => 'date',
            'ayahs_count' => 'integer',
            'duration_seconds' => 'integer',
            'hasanat' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
