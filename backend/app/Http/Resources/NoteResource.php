<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NoteResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $surah = $this->whenLoaded('ayah', fn () => $this->ayah->surah);

        return [
            'id' => $this->id,
            'body' => $this->body,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'ayah' => [
                'id' => $this->ayah->id,
                'number_in_quran' => $this->ayah->number_in_quran,
                'number_in_surah' => $this->ayah->number_in_surah,
                'text_arabic' => $this->ayah->text_arabic,
                'text_english' => $this->ayah->text_english,
                'text_bangla' => $this->ayah->text_bangla,
            ],
            'surah' => $surah ? [
                'number' => $surah->number,
                'name_transliteration' => $surah->name_transliteration,
                'name_english' => $surah->name_english,
            ] : null,
        ];
    }
}
