<?php

namespace Database\Factories;

use App\Models\Surah;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Surah>
 */
class SurahFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'number' => fake()->unique()->numberBetween(1, 114),
            'name_arabic' => 'سُورَةُ ٱلْفَاتِحَةِ',
            'name_transliteration' => fake()->word(),
            'name_english' => fake()->words(2, true),
            'name_bangla' => null,
            'revelation_type' => fake()->randomElement(['Meccan', 'Medinan']),
            'ayah_count' => 7,
            'bismillah_pre' => true,
        ];
    }
}
