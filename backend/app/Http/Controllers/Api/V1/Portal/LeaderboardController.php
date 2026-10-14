<?php

namespace App\Http\Controllers\Api\V1\Portal;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserSummaryResource;
use App\Models\ReadingSession;
use App\Models\User;
use App\Models\UserStat;
use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $scope = in_array($request->query('scope'), ['global', 'friends'], true)
            ? $request->query('scope')
            : 'global';
        $period = $request->query('period') === 'all' ? 'all' : 'week';
        $tz = $user->timezone ?: config('app.timezone');

        if ($period === 'all') {
            $rows = UserStat::query()->pluck('total_ayahs_read', 'user_id');
        } else {
            $start = now($tz)->startOfDay()->subDays(6)->toDateString();
            $rows = ReadingSession::query()
                ->whereDate('read_on', '>=', $start)
                ->selectRaw('user_id, SUM(ayahs_count) as score')
                ->groupBy('user_id')
                ->pluck('score', 'user_id');
        }

        $sorted = $rows->sortDesc();

        if ($scope === 'friends') {
            $allowed = collect([$user->id])->merge($user->friends()->pluck('id'))->all();
            $sorted = $sorted->only($allowed)->sortDesc();
        }

        $top = $sorted->take(50);
        $users = User::with('stat')->whereIn('id', $top->keys())->get()->keyBy('id');

        $leaders = $top
            ->map(function (int|string $score, int|string $userId) use ($users, $user) {
                $model = $users->get((int) $userId);
                if (! $model) {
                    return null;
                }

                return [
                    'user' => new UserSummaryResource($model),
                    'score' => (int) $score,
                    'is_me' => (int) $userId === $user->id,
                ];
            })
            ->filter()
            ->values()
            ->map(function (array $item, int $index) {
                $item['rank'] = $index + 1;

                return $item;
            });

        $position = $sorted->keys()->search($user->id);

        return response()->json([
            'data' => [
                'scope' => $scope,
                'period' => $period,
                'leaders' => $leaders,
                'me' => [
                    'rank' => $position === false ? null : $position + 1,
                    'score' => (int) ($sorted->get($user->id) ?? 0),
                ],
            ],
        ]);
    }
}
