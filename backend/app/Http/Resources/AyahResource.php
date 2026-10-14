<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AyahResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'number_in_surah' => $this->number_in_surah,
            'number_in_quran' => $this->number_in_quran,
            'text_arabic' => $this->text_arabic,
            'text_english' => $this->text_english,
            'text_bangla' => $this->text_bangla,
            'juz' => $this->juz,
            'page' => $this->page,
            'sajda' => (bool) $this->sajda,
            'audio_url' => audio_url($this->number_in_quran),
            'surah' => $this->whenLoaded('surah', fn () => [
                'number' => $this->surah->number,
                'name_transliteration' => $this->surah->name_transliteration,
                'name_english' => $this->surah->name_english,
                'name_arabic' => $this->surah->name_arabic,
            ]),
        ];
    }
}
