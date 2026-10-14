<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserStat extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'current_streak',
        'longest_streak',
        'last_read_date',
        'reading_days',
        'total_ayahs_read',
        'total_seconds',
        'total_hasanat',
        'current_khatmah',
        'completed_khatmahs',
        'last_surah_number',
        'last_ayah_number',
    ];

    protected function casts(): array
    {
        return [
            'last_read_date' => 'date',
            'current_streak' => 'integer',
            'longest_streak' => 'integer',
            'reading_days' => 'integer',
            'total_ayahs_read' => 'integer',
            'total_seconds' => 'integer',
            'total_hasanat' => 'integer',
            'current_khatmah' => 'integer',
            'completed_khatmahs' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
