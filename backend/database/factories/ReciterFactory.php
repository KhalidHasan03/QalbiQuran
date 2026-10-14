<?php

namespace Database\Factories;

use App\Models\Reciter;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reciter>
 */
class ReciterFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'identifier' => fake()->unique()->slug(2).'.'.fake()->word(),
            'name' => 'عبد الله',
            'english_name' => fake()->name(),
            'language' => 'ar',
            'style' => 'versebyverse',
            'is_default' => false,
            'sort' => fake()->numberBetween(0, 30),
        ];
    }
}
