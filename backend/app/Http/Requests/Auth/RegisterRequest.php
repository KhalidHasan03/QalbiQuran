<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'min:3', 'max:30', 'alpha_dash', 'unique:users,username'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
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
