<?php

namespace App\Http\Requests\Portal;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContinueRequest extends FormRequest
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
            'surah_number' => ['required', 'integer', 'between:1,114'],
            'ayah_number' => ['required', 'integer', 'min:1'],
        ];
    }
}
