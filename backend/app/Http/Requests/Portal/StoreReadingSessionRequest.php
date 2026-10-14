<?php

namespace App\Http\Requests\Portal;

use Illuminate\Foundation\Http\FormRequest;

class StoreReadingSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'surah_number' => ['nullable', 'integer', 'between:1,114'],
            'from_ayah' => ['nullable', 'integer', 'min:1'],
            'to_ayah' => ['nullable', 'integer', 'min:1', 'gte:from_ayah'],
            'ayahs_count' => ['required', 'integer', 'min:1', 'max:6236'],
            'duration_seconds' => ['nullable', 'integer', 'min:0', 'max:86400'],
            'read_on' => ['nullable', 'date', 'before_or_equal:today'],
        ];
    }
}
