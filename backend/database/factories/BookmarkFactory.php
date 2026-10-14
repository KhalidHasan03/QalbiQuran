<?php

namespace Database\Factories;

use App\Models\Ayah;
use App\Models\Bookmark;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Bookmark>
 */
class BookmarkFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'ayah_id' => Ayah::factory(),
            'note' => null,
        ];
    }
}
