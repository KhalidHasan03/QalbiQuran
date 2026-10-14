<?php

namespace App\Http\Requests\Portal;

use Illuminate\Foundation\Http\FormRequest;

class StoreNoteRequest extends FormRequest
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
            'body' => ['required', 'string', 'max:5000'],
        ];
    }
}
