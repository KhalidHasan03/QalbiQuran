<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    public const STATUSES = ['new', 'read', 'replied', 'archived'];

    protected $fillable = ['name', 'email', 'subject', 'message', 'ip_address', 'status', 'handled_at'];

    protected function casts(): array
    {
        return [
            'handled_at' => 'datetime',
        ];
    }
}
