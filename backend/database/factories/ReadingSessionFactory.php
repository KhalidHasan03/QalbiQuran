<?php

namespace Database\Factories;

use App\Models\ReadingSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ReadingSession>
 */
class ReadingSessionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'surah_number' => 1,
            'from_ayah' => 1,
            'to_ayah' => 7,
            'ayahs_count' => 7,
            'duration_seconds' => 300,
            'hasanat' => 70,
            'read_on' => now()->toDateString(),
        ];
    }
}
