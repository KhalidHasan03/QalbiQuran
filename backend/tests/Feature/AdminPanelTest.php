<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPanelTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $this->get('/admin')->assertRedirect('/admin/login');
    }

    public function test_non_admins_cannot_access_the_panel(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)->get('/admin')->assertForbidden();
    }

    public function test_admins_can_access_the_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/admin')->assertOk();
    }

    public function test_admins_can_access_each_resource(): void
    {
        $admin = User::factory()->admin()->create();

        foreach (['users', 'contact-messages', 'achievements', 'reciters', 'surahs'] as $resource) {
            $this->actingAs($admin)
                ->get("/admin/{$resource}")
                ->assertOk();
        }
    }
}
