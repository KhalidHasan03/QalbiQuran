<?php

namespace App\Console\Commands;

use App\Models\Ayah;
use App\Models\Reciter;
use App\Models\Surah;
use App\Support\ArabicText;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ImportQuran extends Command
{
    protected $signature = 'quran:import
        {--surah= : Import only a single surah by number (1-114)}
        {--skip-reciters : Skip importing the reciters list}
        {--fresh : Delete existing Qur\'an data before importing}';

    protected $description = 'Import the Holy Qur\'an (Arabic Uthmani + English Sahih + Bangla Muhiuddin) and reciters from api.alquran.cloud';

    private const BASE = 'https://api.alquran.cloud/v1';

    private const EDITIONS = 'quran-uthmani,en.sahih,bn.bengali';

    public function handle(): int
    {
        if ($this->option('fresh')) {
            $this->warn('Deleting existing ayahs and surahs...');
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
            Ayah::truncate();
            Surah::truncate();
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }

        $this->info('Fetching surah metadata...');
        $surahs = $this->fetchSurahList();

        if (empty($surahs)) {
            $this->error('Could not fetch the surah list from the API.');

            return self::FAILURE;
        }

        $targets = $this->option('surah')
            ? $surahs->where('number', (int) $this->option('surah'))
            : $surahs;

        if ($targets->isEmpty()) {
            $this->error('No matching surah found.');

            return self::FAILURE;
        }

        $bar = $this->output->createProgressBar($targets->count());
        $bar->start();
        $imported = 0;

        foreach ($targets as $meta) {
            try {
                $this->importSurah($meta);
                $imported++;
            } catch (\Throwable $e) {
                $this->newLine();
                $this->error("Failed surah {$meta['number']}: {$e->getMessage()}");
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        if (! $this->option('skip-reciters') && ! $this->option('surah')) {
            $this->importReciters();
        }

        $this->info("Imported {$imported} surah(s).");
        $this->info('Ayahs in database: '.Ayah::count());
        $this->info('Surahs in database: '.Surah::count());

        return self::SUCCESS;
    }

    private function fetchSurahList(): Collection
    {
        $response = Http::retry(3, 2000)->timeout(30)->get(self::BASE.'/surah');

        if (! $response->successful()) {
            return collect();
        }

        return collect($response->json('data', []));
    }

    private function importSurah(array $meta): void
    {
        $number = (int) $meta['number'];

        $response = Http::retry(3, 2000)
            ->timeout(60)
            ->get(self::BASE."/surah/{$number}/editions/".self::EDITIONS);

        if (! $response->successful()) {
            throw new \RuntimeException("API returned HTTP {$response->status()}");
        }

        $editions = collect($response->json('data', []));

        $arabic = $editions->firstWhere('edition.identifier', 'quran-uthmani');
        $english = $editions->firstWhere('edition.identifier', 'en.sahih');
        $bangla = $editions->firstWhere('edition.identifier', 'bn.bengali');

        if (! $arabic || ! $english || ! $bangla) {
            throw new \RuntimeException('One or more editions missing from response');
        }

        $arabicAyahs = collect($arabic['ayahs'])->keyBy('numberInSurah');
        $englishAyahs = collect($english['ayahs'])->keyBy('numberInSurah');
        $banglaAyahs = collect($bangla['ayahs'])->keyBy('numberInSurah');

        $surah = Surah::updateOrCreate(
            ['number' => $number],
            [
                'name_arabic' => $arabic['name'],
                'name_transliteration' => $arabic['englishName'],
                'name_english' => $arabic['englishNameTranslation'],
                'revelation_type' => $arabic['revelationType'],
                'ayah_count' => $arabic['numberOfAyahs'],
                'bismillah_pre' => ! in_array($number, [1, 9], true),
            ]
        );

        $now = now();
        $rows = [];

        foreach ($arabicAyahs as $inSurah => $ayah) {
            $en = $englishAyahs->get($inSurah);
            $bn = $banglaAyahs->get($inSurah);

            $rows[] = [
                'surah_id' => $surah->id,
                'number_in_surah' => $inSurah,
                'number_in_quran' => $ayah['number'],
                'text_arabic' => $this->clean($ayah['text']),
                'text_arabic_plain' => ArabicText::normalize($ayah['text']),
                'text_english' => $this->clean($en['text'] ?? ''),
                'text_bangla' => $this->clean($bn['text'] ?? ''),
                'juz' => $ayah['juz'] ?? null,
                'hizb_quarter' => $ayah['hizbQuarter'] ?? null,
                'page' => $ayah['page'] ?? null,
                'sajda' => (bool) ($ayah['sajda'] ?? false),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        foreach (array_chunk($rows, 200) as $chunk) {
            Ayah::upsert(
                $chunk,
                ['number_in_quran'],
                [
                    'surah_id', 'number_in_surah', 'text_arabic', 'text_arabic_plain', 'text_english',
                    'text_bangla', 'juz', 'hizb_quarter', 'page', 'sajda', 'updated_at',
                ]
            );
        }
    }

    private function clean(?string $text): string
    {
        if ($text === null) {
            return '';
        }

        $text = preg_replace('/^\x{FEFF}/u', '', $text);

        return trim($text);
    }

    private function importReciters(): void
    {
        $this->info('Importing reciters...');

        $response = Http::retry(3, 2000)
            ->timeout(30)
            ->get(self::BASE.'/edition', [
                'format' => 'audio',
                'language' => 'ar',
                'type' => 'versebyverse',
            ]);

        if (! $response->successful()) {
            $this->warn('Could not fetch reciters.');

            return;
        }

        $reciters = collect($response->json('data', []));

        foreach ($reciters as $index => $reciter) {
            Reciter::updateOrCreate(
                ['identifier' => $reciter['identifier']],
                [
                    'name' => $reciter['name'],
                    'english_name' => $reciter['englishName'],
                    'language' => $reciter['language'] ?? 'ar',
                    'style' => $reciter['type'] ?? null,
                    'is_default' => $reciter['identifier'] === 'ar.alafasy',
                    'sort' => $index,
                ]
            );
        }

        if (! Reciter::where('is_default', true)->exists()) {
            Reciter::query()->orderBy('sort')->first()?->update(['is_default' => true]);
        }

        $this->info('Imported '.Reciter::count().' reciters.');
    }
}
