<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AyahResource;
use App\Http\Resources\SurahResource;
use App\Models\Surah;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SurahController extends Controller
{
    /**
     * List all 114 surahs (metadata only).
     */
    public function index(): AnonymousResourceCollection
    {
        $surahs = Surah::query()->orderBy('number')->get();

        return SurahResource::collection($surahs);
    }

    /**
     * Show a single surah together with its ayahs.
     */
    public function show(Request $request, int $number): JsonResponse
    {
        $surah = Surah::query()
            ->with(['ayahs' => fn ($q) => $q->orderBy('number_in_surah')])
            ->where('number', $number)
            ->firstOrFail();

        return response()->json([
            'data' => [
                'surah' => new SurahResource($surah),
                'ayahs' => AyahResource::collection($surah->ayahs),
            ],
        ]);
    }
}
