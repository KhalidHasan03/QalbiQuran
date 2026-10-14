<?php

namespace App\Http\Controllers\Api\V1\Portal;

use App\Http\Controllers\Controller;
use App\Http\Resources\AchievementResource;
use App\Models\Achievement;
use Illuminate\Http\Request;

class AchievementController extends Controller
{
    public function index(Request $request)
    {
        $unlocked = $request->user()->achievements()->get()->keyBy('id');

        $achievements = Achievement::query()
            ->orderBy('sort')
            ->get()
            ->each(function (Achievement $achievement) use ($unlocked) {
                $achievement->setRelation('pivot', $unlocked->get($achievement->id)?->pivot);
            });

        return AchievementResource::collection($achievements)->additional([
            'meta' => [
                'total' => $achievements->count(),
                'unlocked' => $unlocked->count(),
            ],
        ]);
    }
}
