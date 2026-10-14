<?php

namespace App\Http\Controllers\Api\V1\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\StoreReadingSessionRequest;
use App\Http\Resources\AchievementResource;
use App\Http\Resources\UserStatResource;
use App\Services\ReadingProgressService;
use Illuminate\Http\Request;

class ReadingSessionController extends Controller
{
    public function __construct(private readonly ReadingProgressService $progress) {}

    public function store(StoreReadingSessionRequest $request)
    {
        $user = $request->user();
        $result = $this->progress->logSession($user, $request->validated());
        $session = $result['session'];

        return response()->json([
            'data' => [
                'session' => [
                    'id' => $session->id,
                    'surah_number' => $session->surah_number,
                    'from_ayah' => $session->from_ayah,
                    'to_ayah' => $session->to_ayah,
                    'ayahs_count' => $session->ayahs_count,
                    'duration_seconds' => $session->duration_seconds,
                    'hasanat' => $session->hasanat,
                    'read_on' => $session->read_on->toDateString(),
                ],
                'stat' => new UserStatResource($result['stat']),
                'today' => $this->progress->todayProgress($user),
                'new_achievements' => AchievementResource::collection($result['new_achievements']),
            ],
            'message' => 'Reading session logged.',
        ], 201);
    }

    public function index(Request $request)
    {
        $sessions = $request->user()->readingSessions()->latest('read_on')->latest('id')->limit(30)->get();

        return response()->json([
            'data' => $sessions->map(fn ($s) => [
                'id' => $s->id,
                'surah_number' => $s->surah_number,
                'from_ayah' => $s->from_ayah,
                'to_ayah' => $s->to_ayah,
                'ayahs_count' => $s->ayahs_count,
                'duration_seconds' => $s->duration_seconds,
                'hasanat' => $s->hasanat,
                'read_on' => $s->read_on->toDateString(),
            ]),
        ]);
    }
}
