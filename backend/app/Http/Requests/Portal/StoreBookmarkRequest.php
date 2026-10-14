<?php

namespace App\Http\Requests\Portal;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookmarkRequest extends FormRequest
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
            'ayah_id' => ['required', 'integer', 'exists:ayahs,id'],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }
}
