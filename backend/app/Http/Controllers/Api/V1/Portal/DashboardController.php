<?php

namespace App\Http\Controllers\Api\V1\Portal;

use App\Http\Controllers\Controller;
use App\Http\Resources\AchievementResource;
use App\Http\Resources\SurahResource;
use App\Http\Resources\UserResource;
use App\Http\Resources\UserStatResource;
use App\Models\Surah;
use App\Models\UserStat;
use App\Services\ReadingProgressService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private readonly ReadingProgressService $progress) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $stat = $this->progress->getOrCreateStat($user);
        $goal = $this->progress->getOrCreateGoal($user);

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'stat' => new UserStatResource($stat),
                'today' => $this->progress->todayProgress($user),
                'weekly' => $this->progress->weeklyActivity($user),
                'goal' => [
                    'type' => $goal->type,
                    'target' => $goal->target,
                ],
                'continue_reading' => $this->continueReading($stat),
                'recent_achievements' => AchievementResource::collection(
                    $user->achievements()->orderByPivot('unlocked_at', 'desc')->limit(5)->get()
                ),
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function continueReading(UserStat $stat): array
    {
        $surahNumber = $stat->last_surah_number ?? 1;
        $ayahNumber = $stat->last_ayah_number ?? 1;
        $surah = Surah::query()->where('number', $surahNumber)->first();

        return [
            'surah_number' => $surahNumber,
            'ayah_number' => $ayahNumber,
            'surah' => $surah ? new SurahResource($surah) : null,
        ];
    }
}
