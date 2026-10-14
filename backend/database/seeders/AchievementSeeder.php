<?php

namespace Database\Seeders;

use App\Models\Achievement;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
{
    public function run(): void
    {
        $achievements = [
            ['code' => 'first_step', 'title' => 'First Step', 'description' => 'Read your first ayah.', 'icon' => 'footprints', 'type' => 'ayahs', 'threshold' => 1, 'sort' => 1],
            ['code' => 'streak_3', 'title' => 'Getting Consistent', 'description' => 'Maintain a 3-day streak.', 'icon' => 'flame', 'type' => 'streak', 'threshold' => 3, 'sort' => 2],
            ['code' => 'streak_7', 'title' => 'One Week Strong', 'description' => 'Maintain a 7-day streak.', 'icon' => 'flame', 'type' => 'streak', 'threshold' => 7, 'sort' => 3],
            ['code' => 'streak_30', 'title' => 'Beast Mode', 'description' => 'Maintain a 30-day streak.', 'icon' => 'flame', 'type' => 'streak', 'threshold' => 30, 'sort' => 4],
            ['code' => 'streak_100', 'title' => 'Unwavering', 'description' => 'Maintain a 100-day streak.', 'icon' => 'flame', 'type' => 'streak', 'threshold' => 100, 'sort' => 5],
            ['code' => 'days_10', 'title' => 'Ten Days In', 'description' => 'Read on 10 different days.', 'icon' => 'calendar', 'type' => 'days', 'threshold' => 10, 'sort' => 6],
            ['code' => 'ayahs_100', 'title' => 'Hundred Ayahs', 'description' => 'Read 100 ayahs in total.', 'icon' => 'book', 'type' => 'ayahs', 'threshold' => 100, 'sort' => 7],
            ['code' => 'ayahs_1000', 'title' => 'Thousand Ayahs', 'description' => 'Read 1,000 ayahs in total.', 'icon' => 'book', 'type' => 'ayahs', 'threshold' => 1000, 'sort' => 8],
            ['code' => 'hasanat_1000', 'title' => 'Rewarded', 'description' => 'Earn 1,000 hasanat.', 'icon' => 'sparkles', 'type' => 'hasanat', 'threshold' => 1000, 'sort' => 9],
            ['code' => 'khatmah_1', 'title' => 'Completed a Khatmah', 'description' => 'Complete a full reading of the Qur\'an.', 'icon' => 'trophy', 'type' => 'khatmah', 'threshold' => 1, 'sort' => 10],
        ];

        foreach ($achievements as $achievement) {
            Achievement::updateOrCreate(['code' => $achievement['code']], $achievement);
        }
    }
}
