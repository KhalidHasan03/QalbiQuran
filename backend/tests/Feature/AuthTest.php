<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withHeader('Origin', 'http://localhost:5173')
            ->withHeader('Referer', 'http://localhost:5173/');
    }

    public function test_a_user_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'John Doe',
            'username' => 'JohnDoe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.email', 'john@example.com')
            ->assertJsonPath('data.username', 'johndoe');

        $this->assertDatabaseHas('users', ['email' => 'john@example.com', 'username' => 'johndoe']);
    }

    public function test_registration_normalizes_email_and_username_case(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Jane Doe',
            'username' => 'JaneDoe',
            'email' => 'Jane.Doe@Example.COM',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated()
            ->assertJsonPath('data.email', 'jane.doe@example.com')
            ->assertJsonPath('data.username', 'janedoe');

        $this->assertDatabaseHas('users', [
            'email' => 'jane.doe@example.com',
            'username' => 'janedoe',
        ]);
    }

    public function test_a_user_can_login_with_a_mixed_case_email(): void
    {
        User::factory()->create([
            'email' => 'jane@example.com',
            'password' => 'password123',
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'Jane@Example.com',
            'password' => 'password123',
        ])->assertOk()->assertJsonPath('data.email', 'jane@example.com');
    }

    public function test_registration_requires_unique_email_and_username(): void
    {
        User::factory()->create(['email' => 'taken@example.com', 'username' => 'taken']);

        $this->postJson('/api/v1/auth/register', [
            'name' => 'John Doe',
            'username' => 'taken',
            'email' => 'taken@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'username']);
    }

    public function test_a_user_can_login_and_logout(): void
    {
        $user = User::factory()->create([
            'email' => 'jane@example.com',
            'password' => 'password123',
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'jane@example.com',
            'password' => 'password123',
        ])->assertOk()->assertJsonPath('data.email', 'jane@example.com');

        $this->assertAuthenticatedAs($user);

        $this->postJson('/api/v1/auth/logout')->assertOk();

        // Guard instances are cached in-memory within a single test process;
        // forgetting them simulates a fresh request lifecycle (as in production).
        $this->app['auth']->forgetGuards();

        $this->getJson('/api/v1/auth/user')->assertUnauthorized();
    }

    public function test_login_exposes_portal_destination_for_the_user_role(): void
    {
        User::factory()->create([
            'email' => 'student@example.com',
            'password' => 'password123',
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'student@example.com',
            'password' => 'password123',
        ])->assertOk()
            ->assertJsonPath('data.is_admin', false)
            ->assertJsonPath('data.admin_url', null);

        $this->app['auth']->forgetGuards();

        User::factory()->admin()->create([
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'password123',
        ])->assertOk()
            ->assertJsonPath('data.is_admin', true)
            ->assertJsonPath('data.admin_url', url('/admin'));
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'jane@example.com']);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'jane@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(422)->assertJsonValidationErrors(['email']);
    }

    public function test_authenticated_user_can_be_fetched(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/v1/auth/user')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);
    }

    public function test_guests_cannot_fetch_user(): void
    {
        $this->getJson('/api/v1/auth/user')->assertUnauthorized();
    }

    public function test_forgot_password_sends_a_reset_link(): void
    {
        Notification::fake();

        $user = User::factory()->create(['email' => 'jane@example.com']);

        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'jane@example.com'])
            ->assertOk();

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_forgot_password_fails_for_unknown_email(): void
    {
        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'nobody@example.com'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_a_user_can_reset_their_password_with_a_valid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'jane@example.com',
            'password' => 'old-password-123',
        ]);

        $token = Password::broker()->createToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => 'jane@example.com',
            'password' => 'brand-new-456',
            'password_confirmation' => 'brand-new-456',
        ])->assertOk();

        $this->assertTrue(Hash::check('brand-new-456', $user->fresh()->password));
    }

    public function test_registration_sends_a_verification_notification(): void
    {
        Notification::fake();

        $this->postJson('/api/v1/auth/register', [
            'name' => 'John Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated();

        $user = User::where('email', 'john@example.com')->firstOrFail();

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_a_user_can_verify_the_email_from_a_signed_link_without_being_logged_in(): void
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), [
            'id' => $user->id,
            'hash' => sha1($user->email),
        ]);

        $this->get($url)->assertRedirect(
            rtrim(config('app.frontend_url'), '/').'/verify-email?verified=1'
        );

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_email_verification_returns_json_for_api_clients(): void
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), [
            'id' => $user->id,
            'hash' => sha1($user->email),
        ]);

        $this->getJson($url)
            ->assertOk()
            ->assertJsonPath('message', 'Email verified.');

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_email_verification_is_rejected_for_a_bad_hash(): void
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), [
            'id' => $user->id,
            'hash' => sha1('someone-else@example.com'),
        ]);

        $this->get($url)->assertRedirect(
            rtrim(config('app.frontend_url'), '/').'/verify-email?verified=0'
        );

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_email_verification_requires_a_valid_signature(): void
    {
        $user = User::factory()->unverified()->create();

        $this->get('/api/v1/auth/verify-email/'.$user->id.'/'.sha1($user->email))
            ->assertForbidden();

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_an_unverified_user_can_resend_the_verification_email(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/auth/email/verification-notification')
            ->assertOk()
            ->assertJsonPath('message', 'Verification link sent.');

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_unauthenticated_browser_requests_redirect_to_the_frontend_login(): void
    {
        $this->get('/api/v1/auth/user')
            ->assertRedirect(rtrim(config('app.frontend_url'), '/').'/login');
    }
}
