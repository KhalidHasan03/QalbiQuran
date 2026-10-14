<?php

namespace Tests\Feature;

use App\Models\Ayah;
use App\Models\Reciter;
use App\Models\Surah;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuranApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_surahs_index_returns_all_surahs(): void
    {
        Surah::factory()->count(3)->create();

        $this->getJson('/api/v1/surahs')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [['number', 'name_arabic', 'name_english', 'ayah_count', 'revelation_type']],
            ]);
    }

    public function test_surah_show_returns_its_ayahs_in_order(): void
    {
        $surah = Surah::factory()->create(['number' => 1, 'ayah_count' => 2]);
        Ayah::factory()->create([
            'surah_id' => $surah->id,
            'number_in_surah' => 2,
            'number_in_quran' => 2,
        ]);
        Ayah::factory()->create([
            'surah_id' => $surah->id,
            'number_in_surah' => 1,
            'number_in_quran' => 1,
        ]);

        $this->getJson('/api/v1/surahs/1')
            ->assertOk()
            ->assertJsonPath('data.surah.number', 1)
            ->assertJsonCount(2, 'data.ayahs')
            ->assertJsonPath('data.ayahs.0.number_in_surah', 1)
            ->assertJsonPath('data.ayahs.1.number_in_surah', 2);
    }

    public function test_surah_show_returns_404_for_unknown_surah(): void
    {
        $this->getJson('/api/v1/surahs/999')->assertNotFound();
    }

    public function test_ayah_show_includes_audio_url(): void
    {
        $surah = Surah::factory()->create();
        Ayah::factory()->create(['surah_id' => $surah->id, 'number_in_quran' => 10]);

        $response = $this->getJson('/api/v1/ayahs/10')->assertOk();

        $this->assertStringContainsString(
            '/audio/128/ar.alafasy/10.mp3',
            $response->json('data.audio_url')
        );
    }

    public function test_search_finds_matching_english_ayahs(): void
    {
        $surah = Surah::factory()->create();
        Ayah::factory()->create([
            'surah_id' => $surah->id,
            'number_in_surah' => 1,
            'number_in_quran' => 100,
            'text_english' => 'The Most Merciful',
        ]);
        Ayah::factory()->create([
            'surah_id' => $surah->id,
            'number_in_surah' => 2,
            'number_in_quran' => 101,
            'text_english' => 'A different sentence',
        ]);

        $this->getJson('/api/v1/ayahs/search?q=Merciful')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.number_in_quran', 100);
    }

    public function test_search_matches_arabic_without_diacritics(): void
    {
        $surah = Surah::factory()->create();
        Ayah::factory()->create([
            'surah_id' => $surah->id,
            'number_in_surah' => 1,
            'number_in_quran' => 200,
            'text_arabic' => 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
        ]);
        Ayah::factory()->create([
            'surah_id' => $surah->id,
            'number_in_surah' => 2,
            'number_in_quran' => 201,
            'text_arabic' => 'مَالِكِ يَوْمِ ٱلدِّينِ',
        ]);

        $this->getJson('/api/v1/ayahs/search?q='.urlencode('الرحمن'))
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.number_in_quran', 200);
    }

    public function test_search_requires_a_minimum_query_length(): void
    {
        $this->getJson('/api/v1/ayahs/search?q=a')->assertStatus(422);
    }

    public function test_search_results_include_surah_metadata(): void
    {
        $surah = Surah::factory()->create([
            'number' => 2,
            'name_transliteration' => 'Al-Baqara',
            'name_english' => 'The Cow',
            'name_arabic' => 'البقرة',
        ]);
        Ayah::factory()->create([
            'surah_id' => $surah->id,
            'number_in_surah' => 255,
            'number_in_quran' => 262,
            'text_english' => 'Allah - there is no deity except Him',
        ]);

        $this->getJson('/api/v1/ayahs/search?q=deity')
            ->assertOk()
            ->assertJsonPath('data.0.surah.number', 2)
            ->assertJsonPath('data.0.surah.name_transliteration', 'Al-Baqara')
            ->assertJsonPath('data.0.surah.name_english', 'The Cow');
    }

    public function test_reciters_index_puts_default_first(): void
    {
        Reciter::factory()->create(['is_default' => false, 'sort' => 1]);
        Reciter::factory()->create(['identifier' => 'ar.alafasy', 'is_default' => true, 'sort' => 5]);

        $this->getJson('/api/v1/reciters')
            ->assertOk()
            ->assertJsonPath('data.0.identifier', 'ar.alafasy');
    }
}
