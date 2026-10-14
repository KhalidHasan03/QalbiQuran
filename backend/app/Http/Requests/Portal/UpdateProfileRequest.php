<?php

namespace App\Http\Requests\Portal;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
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
        $userId = $this->user()->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required', 'string', 'min:3', 'max:30', 'alpha_dash',
                Rule::unique('users', 'username')->ignore($userId),
            ],
            'email' => [
                'required', 'string', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'timezone' => ['sometimes', 'string', 'timezone'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $input = [];

        if ($this->has('username')) {
            $input['username'] = strtolower(trim((string) $this->input('username')));
        }

        if ($this->has('email')) {
            $input['email'] = strtolower(trim((string) $this->input('email')));
        }

        if ($input !== []) {
            $this->merge($input);
        }
    }
}
