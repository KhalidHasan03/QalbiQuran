<?php

namespace Tests\Feature;

use App\Models\Achievement;
use App\Models\Ayah;
use App\Models\Bookmark;
use App\Models\Friendship;
use App\Models\User;
use Database\Seeders\AchievementSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortalTest extends TestCase
{
    use RefreshDatabase;

    public function test_portal_endpoints_require_authentication(): void
    {
        $this->getJson('/api/v1/me/dashboard')->assertUnauthorized();
        $this->postJson('/api/v1/me/sessions', [])->assertUnauthorized();
        $this->getJson('/api/v1/me/bookmarks')->assertUnauthorized();
        $this->getJson('/api/v1/me/leaderboard')->assertUnauthorized();
    }

    public function test_logging_a_session_updates_stats_streak_and_hasanat(): void
    {
        $this->seed(AchievementSeeder::class);
        $user = User::factory()->create(['username' => 'reader']);

        $response = $this->actingAs($user)->postJson('/api/v1/me/sessions', [
            'surah_number' => 1,
            'from_ayah' => 1,
            'to_ayah' => 7,
            'ayahs_count' => 7,
            'duration_seconds' => 600,
        ])->assertCreated();

        $response
            ->assertJsonPath('data.stat.total_ayahs_read', 7)
            ->assertJsonPath('data.stat.current_streak', 1)
            ->assertJsonPath('data.stat.reading_days', 1)
            ->assertJsonPath('data.stat.total_hasanat', 70)
            ->assertJsonPath('data.today.ayahs', 7)
            ->assertJsonPath('data.today.goal_met', true)
            ->assertJsonPath('data.new_achievements.0.code', 'first_step');

        $this->assertDatabaseHas('reading_sessions', ['user_id' => $user->id, 'ayahs_count' => 7]);
        $this->assertDatabaseHas('user_achievements', ['user_id' => $user->id]);
    }

    public function test_streak_increments_on_consecutive_days_and_duplicates_do_not_double_count(): void
    {
        $user = User::factory()->create();
        $today = now()->toDateString();
        $yesterday = now()->subDay()->toDateString();

        $this->actingAs($user)->postJson('/api/v1/me/sessions', [
            'ayahs_count' => 5, 'duration_seconds' => 60, 'read_on' => $yesterday,
        ])->assertCreated()->assertJsonPath('data.stat.current_streak', 1);

        $this->actingAs($user)->postJson('/api/v1/me/sessions', [
            'ayahs_count' => 5, 'duration_seconds' => 60, 'read_on' => $today,
        ])->assertCreated()->assertJsonPath('data.stat.current_streak', 2);

        $this->actingAs($user)->postJson('/api/v1/me/sessions', [
            'ayahs_count' => 5, 'duration_seconds' => 60, 'read_on' => $today,
        ])->assertCreated()
            ->assertJsonPath('data.stat.current_streak', 2)
            ->assertJsonPath('data.stat.total_ayahs_read', 15);
    }

    public function test_completing_ayahs_unlocks_khatmah_achievement(): void
    {
        $this->seed(AchievementSeeder::class);
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/v1/me/sessions', [
            'ayahs_count' => 6236,
            'duration_seconds' => 3600,
        ])->assertCreated()
            ->assertJsonPath('data.stat.completed_khatmahs', 1)
            ->assertJsonPath('data.stat.current_khatmah', 2);

        $this->assertDatabaseHas('user_achievements', [
            'user_id' => $user->id,
            'achievement_id' => Achievement::where('code', 'khatmah_1')->value('id'),
        ]);
    }

    public function test_reading_goal_can_be_shown_and_updated(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/v1/me/goal')
            ->assertOk()
            ->assertJsonPath('data.type', 'minutes')
            ->assertJsonPath('data.target', 10);

        $this->actingAs($user)->putJson('/api/v1/me/goal', [
            'type' => 'ayahs', 'target' => 50,
        ])->assertOk()
            ->assertJsonPath('data.type', 'ayahs')
            ->assertJsonPath('data.target', 50);

        $this->actingAs($user)->putJson('/api/v1/me/goal', ['type' => 'nope', 'target' => -1])
            ->assertStatus(422);
    }

    public function test_dashboard_returns_progress_payload(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/v1/me/dashboard')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email'],
                    'stat' => ['current_streak', 'total_ayahs_read', 'khatmah_progress'],
                    'today' => ['ayahs', 'goal_met'],
                    'weekly',
                    'goal' => ['type', 'target'],
                    'continue_reading' => ['surah_number', 'ayah_number'],
                ],
            ]);
    }

    public function test_bookmarks_are_scoped_to_the_user_and_deduplicated(): void
    {
        $user = User::factory()->create();
        $ayah = Ayah::factory()->create();

        $created = $this->actingAs($user)->postJson('/api/v1/me/bookmarks', [
            'ayah_id' => $ayah->id,
            'note' => 'Beautiful ayah',
        ])->assertCreated();

        $bookmarkId = $created->json('data.id');

        $this->actingAs($user)->getJson('/api/v1/me/bookmarks')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.ayah.number_in_quran', $ayah->number_in_quran);

        $this->actingAs($user)->postJson('/api/v1/me/bookmarks', ['ayah_id' => $ayah->id])
            ->assertCreated();
        $this->actingAs($user)->getJson('/api/v1/me/bookmarks')->assertJsonCount(1, 'data');

        $other = User::factory()->create();
        $foreign = Bookmark::factory()->create(['user_id' => $other->id]);

        $this->actingAs($user)->deleteJson("/api/v1/me/bookmarks/{$foreign->id}")->assertNotFound();
        $this->actingAs($user)->deleteJson("/api/v1/me/bookmarks/{$bookmarkId}")->assertOk();
        $this->assertDatabaseMissing('bookmarks', ['id' => $bookmarkId]);
    }

    public function test_notes_can_be_created_updated_and_deleted(): void
    {
        $user = User::factory()->create();
        $ayah = Ayah::factory()->create();

        $created = $this->actingAs($user)->postJson('/api/v1/me/notes', [
            'ayah_id' => $ayah->id,
            'body' => 'Reflection one',
        ])->assertCreated();

        $noteId = $created->json('data.id');

        $this->actingAs($user)->putJson("/api/v1/me/notes/{$noteId}", ['body' => 'Updated'])
            ->assertOk()
            ->assertJsonPath('data.body', 'Updated');

        $this->actingAs($user)->getJson('/api/v1/me/notes')->assertJsonCount(1, 'data');

        $this->actingAs($user)->deleteJson("/api/v1/me/notes/{$noteId}")->assertOk();
        $this->assertDatabaseMissing('notes', ['id' => $noteId]);
    }

    public function test_achievements_index_reports_unlocked_progress(): void
    {
        $this->seed(AchievementSeeder::class);
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/v1/me/achievements')
            ->assertOk()
            ->assertJsonPath('meta.total', 10)
            ->assertJsonPath('meta.unlocked', 0);

        $this->actingAs($user)->postJson('/api/v1/me/sessions', ['ayahs_count' => 1, 'duration_seconds' => 10]);

        $this->actingAs($user)->getJson('/api/v1/me/achievements')
            ->assertOk()
            ->assertJsonPath('meta.unlocked', 1);
    }

    public function test_friend_request_flow(): void
    {
        $alice = User::factory()->create(['username' => 'alice']);
        $bob = User::factory()->create(['username' => 'bob']);

        $sent = $this->actingAs($alice)->postJson('/api/v1/me/friends', ['username' => 'bob'])
            ->assertCreated();

        $friendshipId = $sent->json('data.id');

        $this->actingAs($bob)->getJson('/api/v1/me/friends')
            ->assertOk()
            ->assertJsonCount(1, 'data.incoming_requests');

        $this->actingAs($bob)->putJson("/api/v1/me/friends/{$friendshipId}/accept")->assertOk();

        $this->assertDatabaseHas('friendships', ['id' => $friendshipId, 'status' => 'accepted']);
        $this->actingAs($alice)->getJson('/api/v1/me/friends')
            ->assertJsonCount(1, 'data.friends')
            ->assertJsonPath('data.friends.0.username', 'bob');
    }

    public function test_users_cannot_add_themselves_as_friends(): void
    {
        $user = User::factory()->create(['username' => 'solo']);

        $this->actingAs($user)->postJson('/api/v1/me/friends', ['username' => 'solo'])
            ->assertStatus(422);
    }

    public function test_leaderboard_ranks_users_by_weekly_ayahs(): void
    {
        $a = User::factory()->create(['username' => 'amina']);
        $b = User::factory()->create(['username' => 'bilal']);

        $this->actingAs($a)->postJson('/api/v1/me/sessions', [
            'ayahs_count' => 10, 'duration_seconds' => 60,
        ])->assertCreated();

        $this->actingAs($b)->postJson('/api/v1/me/sessions', [
            'ayahs_count' => 50, 'duration_seconds' => 60,
        ])->assertCreated();

        $this->actingAs($a)->getJson('/api/v1/me/leaderboard?period=week')
            ->assertOk()
            ->assertJsonPath('data.leaders.0.user.username', 'bilal')
            ->assertJsonPath('data.leaders.0.score', 50)
            ->assertJsonPath('data.leaders.1.user.username', 'amina')
            ->assertJsonPath('data.me.rank', 2)
            ->assertJsonPath('data.me.score', 10);
    }

    public function test_friendship_must_be_accepted_by_the_addressee(): void
    {
        $a = User::factory()->create(['username' => 'a_user']);
        $b = User::factory()->create(['username' => 'b_user']);

        $friendship = Friendship::create([
            'user_id' => $a->id,
            'friend_id' => $b->id,
            'status' => 'pending',
        ]);

        $this->actingAs($a)->putJson("/api/v1/me/friends/{$friendship->id}/accept")
            ->assertForbidden();
    }
}
