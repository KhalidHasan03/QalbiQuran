<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserSummaryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $stat = $this->whenLoaded('stat');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'avatar_url' => $this->avatar_url,
            'current_streak' => $stat?->current_streak ?? 0,
            'total_ayahs_read' => $stat?->total_ayahs_read ?? 0,
            'total_hasanat' => $stat?->total_hasanat ?? 0,
            'weekly_ayahs' => $this->weekly_ayahs ?? null,
        ];
    }
}
