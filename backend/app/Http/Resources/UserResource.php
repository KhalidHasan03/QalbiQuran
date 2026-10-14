<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'email_verified' => ! is_null($this->email_verified_at),
            'avatar_url' => $this->avatar_url,
            'timezone' => $this->timezone,
            'settings' => $this->settings,
            'is_admin' => (bool) $this->is_admin,
            'admin_url' => $this->is_admin ? url('/admin') : null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
