<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserStatResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $totalAyahs = (int) config('quran.total_ayahs', 6236);

        return [
            'current_streak' => $this->current_streak,
            'longest_streak' => $this->longest_streak,
            'last_read_date' => $this->last_read_date?->toDateString(),
            'reading_days' => $this->reading_days,
            'total_ayahs_read' => $this->total_ayahs_read,
            'total_seconds' => $this->total_seconds,
            'total_hasanat' => $this->total_hasanat,
            'current_khatmah' => $this->current_khatmah,
            'completed_khatmahs' => $this->completed_khatmahs,
            'khatmah_progress' => [
                'ayahs_read' => $this->total_ayahs_read % $totalAyahs,
                'total_ayahs' => $totalAyahs,
                'percent' => round((($this->total_ayahs_read % $totalAyahs) / $totalAyahs) * 100, 2),
            ],
            'last_surah_number' => $this->last_surah_number,
            'last_ayah_number' => $this->last_ayah_number,
        ];
    }
}
