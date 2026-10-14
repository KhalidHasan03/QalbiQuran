<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookmarkResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $surah = $this->whenLoaded('ayah', fn () => $this->ayah->surah);

        return [
            'id' => $this->id,
            'note' => $this->note,
            'created_at' => $this->created_at?->toIso8601String(),
            'ayah' => [
                'id' => $this->ayah->id,
                'number_in_quran' => $this->ayah->number_in_quran,
                'number_in_surah' => $this->ayah->number_in_surah,
                'text_arabic' => $this->ayah->text_arabic,
                'text_english' => $this->ayah->text_english,
                'text_bangla' => $this->ayah->text_bangla,
                'audio_url' => audio_url($this->ayah->number_in_quran),
            ],
            'surah' => $surah ? [
                'number' => $surah->number,
                'name_transliteration' => $surah->name_transliteration,
                'name_english' => $surah->name_english,
                'name_arabic' => $surah->name_arabic,
            ] : null,
        ];
    }
}
