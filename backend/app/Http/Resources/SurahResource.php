<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SurahResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'number' => $this->number,
            'name_arabic' => $this->name_arabic,
            'name_transliteration' => $this->name_transliteration,
            'name_english' => $this->name_english,
            'name_bangla' => $this->name_bangla,
            'revelation_type' => $this->revelation_type,
            'ayah_count' => $this->ayah_count,
            'bismillah_pre' => (bool) $this->bismillah_pre,
        ];
    }
}
