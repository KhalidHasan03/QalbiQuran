<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_endpoints_require_authentication(): void
    {
        $this->putJson('/api/v1/me/profile', [])->assertUnauthorized();
        $this->putJson('/api/v1/me/password', [])->assertUnauthorized();
    }

    public function test_user_can_update_their_profile(): void
    {
        Notification::fake();

        $user = User::factory()->create(['username' => 'oldname', 'email' => 'old@example.com']);

        $this->actingAs($user)
            ->putJson('/api/v1/me/profile', [
                'name' => 'New Name',
                'username' => 'NewName',
                'email' => 'new@example.com',
                'timezone' => 'Europe/London',
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'New Name')
            ->assertJsonPath('data.username', 'newname')
            ->assertJsonPath('data.email', 'new@example.com')
            ->assertJsonPath('data.timezone', 'Europe/London');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'New Name',
            'username' => 'newname',
            'email' => 'new@example.com',
        ]);
    }

    public function test_profile_username_and_email_must_be_unique(): void
    {
        User::factory()->create(['username' => 'taken', 'email' => 'taken@example.com']);
        $user = User::factory()->create(['username' => 'someone', 'email' => 'someone@example.com']);

        $this->actingAs($user)
            ->putJson('/api/v1/me/profile', [
                'name' => 'Someone',
                'username' => 'taken',
                'email' => 'taken@example.com',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['username', 'email']);
    }

    public function test_changing_email_resets_verification_and_sends_a_new_link(): void
    {
        Notification::fake();

        $user = User::factory()->create(['username' => 'reader', 'email' => 'old@example.com']);
        $this->assertNotNull($user->email_verified_at);

        $this->actingAs($user)
            ->putJson('/api/v1/me/profile', [
                'name' => $user->name,
                'username' => $user->username,
                'email' => 'changed@example.com',
            ])
            ->assertOk()
            ->assertJsonPath('data.email_verified', false);

        $this->assertNull($user->fresh()->email_verified_at);
        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_user_can_change_their_password(): void
    {
        $user = User::factory()->create(['username' => 'reader', 'password' => 'password123']);

        $this->actingAs($user)
            ->putJson('/api/v1/me/password', [
                'current_password' => 'password123',
                'password' => 'new-password-456',
                'password_confirmation' => 'new-password-456',
            ])
            ->assertOk();

        $this->assertTrue(Hash::check('new-password-456', $user->fresh()->password));
    }

    public function test_password_change_requires_the_current_password(): void
    {
        $user = User::factory()->create(['username' => 'reader', 'password' => 'password123']);

        $this->actingAs($user)
            ->putJson('/api/v1/me/password', [
                'current_password' => 'wrong-password',
                'password' => 'new-password-456',
                'password_confirmation' => 'new-password-456',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('current_password');
    }
}
