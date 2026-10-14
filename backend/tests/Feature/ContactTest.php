<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_stores_a_contact_message(): void
    {
        $response = $this->postJson('/api/v1/contact', [
            'name' => 'Aisha Rahman',
            'email' => 'aisha@example.com',
            'subject' => 'Feedback',
            'message' => 'Jazakallahu khairan for this beautiful application.',
        ]);

        $response->assertCreated()->assertJsonStructure(['data' => ['id'], 'message']);

        $this->assertDatabaseHas('contact_messages', [
            'email' => 'aisha@example.com',
            'subject' => 'Feedback',
        ]);
    }

    public function test_subject_is_optional(): void
    {
        $this->postJson('/api/v1/contact', [
            'name' => 'Yusuf',
            'email' => 'yusuf@example.com',
            'message' => 'A short but valid message.',
        ])->assertCreated();
    }

    public function test_it_validates_required_fields(): void
    {
        $this->postJson('/api/v1/contact', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'message']);
    }

    public function test_it_rejects_a_too_short_message(): void
    {
        $this->postJson('/api/v1/contact', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'message' => 'short',
        ])->assertStatus(422)->assertJsonValidationErrors(['message']);
    }
}
