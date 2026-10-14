<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AyahResource;
use App\Models\Ayah;
use App\Support\ArabicText;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AyahController extends Controller
{
    /**
     * Search ayahs across Arabic, English and Bangla translations.
     */
    public function search(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:100'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);

        $term = $validated['q'];
        $perPage = $validated['per_page'] ?? 20;

        $ayahs = Ayah::query()
            ->with('surah:id,number,name_transliteration,name_english,name_arabic')
            ->where(function ($query) use ($term) {
                $like = '%'.$term.'%';
                $query->where('text_arabic_plain', 'like', $like)
                    ->orWhere('text_english', 'like', $like)
                    ->orWhere('text_bangla', 'like', $like);

                if (ArabicText::containsArabic($term)) {
                    $query->orWhere('text_arabic_plain', 'like', '%'.ArabicText::normalize($term).'%');
                }
            })
            ->orderBy('number_in_quran')
            ->paginate($perPage);

        return AyahResource::collection($ayahs);
    }

    /**
     * Show a single ayah by its number in the whole Qur'an (1-6236).
     */
    public function show(int $number): AyahResource
    {
        $ayah = Ayah::query()
            ->with('surah:id,number,name_transliteration,name_english,name_arabic')
            ->where('number_in_quran', $number)
            ->firstOrFail();

        return new AyahResource($ayah);
    }
}
