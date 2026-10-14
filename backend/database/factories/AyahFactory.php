<?php

namespace Database\Factories;

use App\Models\Ayah;
use App\Models\Surah;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ayah>
 */
class AyahFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'surah_id' => Surah::factory(),
            'number_in_surah' => fake()->numberBetween(1, 7),
            'number_in_quran' => fake()->unique()->numberBetween(1, 6236),
            'text_arabic' => 'بِسْمِ ٱللَّهِ',
            'text_english' => fake()->sentence(),
            'text_bangla' => 'শুরু করছি আল্লাহর নামে',
            'juz' => 1,
            'hizb_quarter' => 1,
            'page' => 1,
            'sajda' => false,
        ];
    }
}
