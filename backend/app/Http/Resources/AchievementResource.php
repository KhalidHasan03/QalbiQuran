<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class AchievementResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $unlockedAt = $this->pivot?->unlocked_at;

        return [
            'code' => $this->code,
            'title' => $this->title,
            'description' => $this->description,
            'icon' => $this->icon,
            'type' => $this->type,
            'threshold' => $this->threshold,
            'unlocked' => ! is_null($unlockedAt),
            'unlocked_at' => $unlockedAt ? Carbon::parse($unlockedAt)->toIso8601String() : null,
        ];
    }
}
