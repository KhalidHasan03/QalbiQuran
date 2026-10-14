<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reciter extends Model
{
    use HasFactory;

    protected $fillable = [
        'identifier',
        'name',
        'english_name',
        'language',
        'style',
        'is_default',
        'sort',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'sort' => 'integer',
        ];
    }
}
