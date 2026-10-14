<?php

namespace App\Http\Controllers\Api\V1\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\UpdateContinueRequest;
use App\Http\Resources\UserStatResource;
use App\Services\ReadingProgressService;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    public function __construct(private readonly ReadingProgressService $progress) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $stat = $this->progress->getOrCreateStat($user);
        $tz = $user->timezone ?: config('app.timezone');

        $monthStart = now($tz)->startOfDay()->subDays(29)->toDateString();
        $monthSessions = $user->readingSessions()->whereDate('read_on', '>=', $monthStart)->get();

        return response()->json([
            'data' => [
                'stat' => new UserStatResource($stat),
                'weekly' => $this->progress->weeklyActivity($user),
                'monthly' => [
                    'ayahs' => (int) $monthSessions->sum('ayahs_count'),
                    'seconds' => (int) $monthSessions->sum('duration_seconds'),
                    'days' => $monthSessions->pluck('read_on')->map(fn ($d) => $d->toDateString())->unique()->count(),
                ],
                'continue_reading' => [
                    'surah_number' => $stat->last_surah_number,
                    'ayah_number' => $stat->last_ayah_number,
                ],
            ],
        ]);
    }

    public function continue(UpdateContinueRequest $request)
    {
        $stat = $this->progress->getOrCreateStat($request->user());
        $stat->update([
            'last_surah_number' => $request->validated('surah_number'),
            'last_ayah_number' => $request->validated('ayah_number'),
        ]);

        return response()->json([
            'data' => [
                'surah_number' => $stat->last_surah_number,
                'ayah_number' => $stat->last_ayah_number,
            ],
            'message' => 'Reading position saved.',
        ]);
    }
}
