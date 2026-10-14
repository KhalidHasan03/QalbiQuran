<?php

namespace App\Services;

use App\Models\Achievement;
use App\Models\ReadingGoal;
use App\Models\ReadingSession;
use App\Models\User;
use App\Models\UserStat;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class ReadingProgressService
{
    /**
     * Record a reading session and update the user's stats, streak and achievements.
     *
     * @param  array<string, mixed>  $data
     * @return array{session: ReadingSession, stat: UserStat, new_achievements: Collection<int, Achievement>}
     */
    public function logSession(User $user, array $data): array
    {
        $timezone = $user->timezone ?: config('app.timezone');
        $today = now($timezone)->startOfDay();

        $readOn = isset($data['read_on'])
            ? Carbon::parse($data['read_on'])->startOfDay()
            : $today;

        $ayahs = max(0, (int) ($data['ayahs_count'] ?? 0));
        $seconds = max(0, (int) ($data['duration_seconds'] ?? 0));
        $hasanat = $ayahs * (int) config('quran.hasanat_per_ayah', 10);

        $session = ReadingSession::create([
            'user_id' => $user->id,
            'surah_number' => $data['surah_number'] ?? null,
            'from_ayah' => $data['from_ayah'] ?? null,
            'to_ayah' => $data['to_ayah'] ?? null,
            'ayahs_count' => $ayahs,
            'duration_seconds' => $seconds,
            'hasanat' => $hasanat,
            'read_on' => $readOn->toDateString(),
        ]);

        $stat = $this->getOrCreateStat($user);

        $this->applyStreak($stat, $readOn);

        $stat->total_ayahs_read += $ayahs;
        $stat->total_seconds += $seconds;
        $stat->total_hasanat += $hasanat;

        $totalAyahs = (int) config('quran.total_ayahs', 6236);
        $stat->completed_khatmahs = intdiv($stat->total_ayahs_read, $totalAyahs);
        $stat->current_khatmah = $stat->completed_khatmahs + 1;

        if (! empty($data['surah_number']) && ! empty($data['to_ayah'])) {
            $stat->last_surah_number = (int) $data['surah_number'];
            $stat->last_ayah_number = (int) $data['to_ayah'];
        }

        $stat->save();

        $newAchievements = $this->syncAchievements($user, $stat);

        return [
            'session' => $session,
            'stat' => $stat->fresh(),
            'new_achievements' => $newAchievements,
        ];
    }

    public function getOrCreateStat(User $user): UserStat
    {
        return UserStat::firstOrCreate(['user_id' => $user->id]);
    }

    public function getOrCreateGoal(User $user): ReadingGoal
    {
        return $user->readingGoal()->firstOrCreate([], [
            'type' => 'minutes',
            'target' => 10,
        ]);
    }

    /**
     * Progress for today (in the user's timezone) against their goal.
     *
     * @return array{ayahs: int, seconds: int, hasanat: int, goal_met: bool, goal_type: string, goal_target: int}
     */
    public function todayProgress(User $user): array
    {
        $timezone = $user->timezone ?: config('app.timezone');
        $today = now($timezone)->toDateString();

        $sessions = $user->readingSessions()->whereDate('read_on', $today)->get();

        $ayahs = (int) $sessions->sum('ayahs_count');
        $seconds = (int) $sessions->sum('duration_seconds');

        $goal = $user->readingGoal;
        $goalType = $goal->type ?? 'minutes';
        $goalTarget = $goal->target ?? 10;

        $value = $goalType === 'ayahs' ? $ayahs : intdiv($seconds, 60);

        return [
            'ayahs' => $ayahs,
            'seconds' => $seconds,
            'hasanat' => (int) $sessions->sum('hasanat'),
            'goal_met' => $value >= $goalTarget,
            'goal_type' => $goalType,
            'goal_target' => $goalTarget,
            'goal_value' => $value,
        ];
    }

    /**
     * Last 7 days of activity (oldest first) in the user's timezone.
     *
     * @return array<int, array{date: string, label: string, ayahs: int, seconds: int, goal_met: bool}>
     */
    public function weeklyActivity(User $user): array
    {
        $timezone = $user->timezone ?: config('app.timezone');
        $goal = $user->readingGoal;
        $goalType = $goal->type ?? 'minutes';
        $goalTarget = $goal->target ?? 10;

        $start = now($timezone)->startOfDay()->subDays(6);

        $sessions = $user->readingSessions()
            ->whereDate('read_on', '>=', $start->toDateString())
            ->get()
            ->groupBy(fn ($s) => $s->read_on->toDateString());

        $days = [];
        for ($i = 0; $i < 7; $i++) {
            $date = $start->copy()->addDays($i);
            $key = $date->toDateString();
            $daySessions = $sessions->get($key, collect());

            $ayahs = (int) $daySessions->sum('ayahs_count');
            $seconds = (int) $daySessions->sum('duration_seconds');
            $value = $goalType === 'ayahs' ? $ayahs : intdiv($seconds, 60);

            $days[] = [
                'date' => $key,
                'label' => $date->format('D'),
                'ayahs' => $ayahs,
                'seconds' => $seconds,
                'goal_met' => $value >= $goalTarget,
            ];
        }

        return $days;
    }

    /**
     * Unlock any achievements the user has newly qualified for.
     *
     * @return Collection<int, Achievement>
     */
    public function syncAchievements(User $user, UserStat $stat): Collection
    {
        $metrics = [
            'streak' => $stat->current_streak,
            'days' => $stat->reading_days,
            'ayahs' => $stat->total_ayahs_read,
            'hasanat' => $stat->total_hasanat,
            'khatmah' => $stat->completed_khatmahs,
        ];

        $unlockedIds = $user->achievements()->pluck('achievements.id')->all();
        $newly = collect();

        $candidates = Achievement::query()->whereNotIn('id', $unlockedIds)->get();

        foreach ($candidates as $achievement) {
            $value = $metrics[$achievement->type] ?? 0;

            if ($value >= $achievement->threshold) {
                $user->achievements()->attach($achievement->id, ['unlocked_at' => now()]);
                $newly->push($achievement);
            }
        }

        return $newly;
    }

    private function applyStreak(UserStat $stat, CarbonInterface $readOn): void
    {
        $date = $readOn->copy()->startOfDay();

        if ($stat->last_read_date && $stat->last_read_date->isSameDay($date)) {
            return;
        }

        if ($stat->last_read_date && $stat->last_read_date->copy()->addDay()->isSameDay($date)) {
            $stat->current_streak += 1;
        } else {
            $stat->current_streak = 1;
        }

        $stat->reading_days += 1;
        $stat->last_read_date = $date;
        $stat->longest_streak = max($stat->longest_streak, $stat->current_streak);
    }
}
